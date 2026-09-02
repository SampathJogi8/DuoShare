async function handleBase64Image(imageUrl, id, index, env) {
  if (typeof imageUrl === 'string' && (imageUrl.startsWith('data:image/') || imageUrl.startsWith('data:application/pdf;base64,'))) {
    const matches = imageUrl.match(/^data:([a-zA-Z0-9-\/]+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileId = index !== null ? `${id}_${index}` : id;
      await env.MY_BUCKET.put(fileId, binaryData, {
        httpMetadata: { contentType: mimeType }
      });
      return `/api/images/${fileId}`;
    }
  }
  return imageUrl;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Enable CORS for React frontend
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      // 0. GET /
      if ((url.pathname === "/" || url.pathname === "/api") && request.method === "GET") {
        return Response.json({ status: "alive", message: "DuoShare Cloudflare Worker API is running successfully." }, { headers: corsHeaders });
      }

      // Explicit Migration Endpoint (Run on demand / deploy)
      if (url.pathname === "/api/migrate") {
        try {
          const tablesToHeal = ["transactions", "receipts", "members", "rooms", "users"];
          for (const tbl of tablesToHeal) {
            try {
              const nullRows = await env.DB.prepare(`SELECT rowid FROM ${tbl} WHERE id IS NULL LIMIT 50`).all();
              if (nullRows && nullRows.results && nullRows.results.length > 0) {
                for (const r of nullRows.results) {
                  const prefix = tbl.slice(0, 3);
                  const newId = `${prefix}-${crypto.randomUUID()}`;
                  await env.DB.prepare(`UPDATE ${tbl} SET id = ? WHERE rowid = ?`).bind(newId, r.rowid).run();
                }
              }
            } catch (e) {}
          }
          try { await env.DB.prepare("ALTER TABLE rooms ADD COLUMN max_members INTEGER DEFAULT 6").run(); } catch (e) {}
          try { await env.DB.prepare("ALTER TABLE rooms ADD COLUMN room_mode TEXT DEFAULT 'split'").run(); } catch (e) {}
          try { await env.DB.prepare("ALTER TABLE rooms ADD COLUMN co_host_uid TEXT").run(); } catch (e) {}
          try { await env.DB.prepare("ALTER TABLE members ADD COLUMN individual_budget REAL DEFAULT 2000").run(); } catch (e) {}
          return Response.json({ status: "ok", message: "Schema migration complete." }, { headers: corsHeaders });
        } catch (err) {
          return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
        }
      }

      // 1. Generic POST /api/query
      if (url.pathname === "/api/query" && request.method === "POST") {
        const body = await request.json();
        const { table, action, filters, order, limit, data } = body;

        const ALLOWED_TABLES = ["users", "rooms", "members", "transactions", "receipts", "activity_logs", "system_settings"];
        if (!ALLOWED_TABLES.includes(table)) {
          return Response.json({ error: `Invalid table: ${table}` }, { status: 400, headers: corsHeaders });
        }

        const isValidCol = (col) => /^[a-zA-Z0-9_]+$/.test(col);

        // --- SELECT ---
        if (action === "select") {
          let sql = `SELECT * FROM ${table}`;
          let params = [];

          if (filters && filters.length > 0) {
            const clauses = [];
            for (const f of filters) {
              if (!isValidCol(f.column)) continue;
              if (f.operator === "eq") {
                clauses.push(`${f.column} = ?`);
                params.push(f.value);
              } else if (f.operator === "neq") {
                clauses.push(`${f.column} != ?`);
                params.push(f.value);
              } else if (f.operator === "gte") {
                clauses.push(`${f.column} >= ?`);
                params.push(f.value);
              } else if (f.operator === "lte") {
                clauses.push(`${f.column} <= ?`);
                params.push(f.value);
              } else if (f.operator === "in") {
                if (Array.isArray(f.value) && f.value.length > 0) {
                  clauses.push(`${f.column} IN (${f.value.map(() => "?").join(", ")})`);
                  f.value.forEach(val => params.push(val));
                } else if (Array.isArray(f.value) && f.value.length === 0) {
                  clauses.push("1 = 0"); // Empty IN returns nothing
                } else {
                  clauses.push(`${f.column} = ?`);
                  params.push(f.value);
                }
              }
            }
            if (clauses.length > 0) {
              sql += ` WHERE ${clauses.join(" AND ")}`;
            }
          }

          if (order && order.length > 0) {
            const orderClauses = [];
            for (const o of order) {
              if (!isValidCol(o.column)) continue;
              orderClauses.push(`${o.column} ${o.ascending ? "ASC" : "DESC"}`);
            }
            if (orderClauses.length > 0) {
              sql += ` ORDER BY ${orderClauses.join(", ")}`;
            }
          }

          if (limit) {
            sql += ` LIMIT ${Number(limit)}`;
          }

          const { results } = await env.DB.prepare(sql).bind(...params).all();

          // Resolve rooms join on members table
          if (table === "members") {
            for (const row of results) {
              if (row.room_id) {
                const room = await env.DB.prepare("SELECT name, monthly_budget FROM rooms WHERE id = ?").bind(row.room_id).first();
                row.rooms = room ? { name: room.name, monthly_budget: room.monthly_budget } : null;
              } else {
                row.rooms = null;
              }
            }
          }

          // Parse JSON fields
          if (table === "transactions") {
            for (const row of results) {
              if (row.splits && typeof row.splits === "string") {
                try {
                  row.splits = JSON.parse(row.splits);
                } catch (e) {
                  // Fallback
                }
              }
            }
          }

          // Prepend origin to relative R2 image URLs
          if (table === "receipts") {
            const origin = url.origin;
            for (const row of results) {
              if (row.image_url) {
                if (row.image_url.startsWith("[")) {
                  try {
                    const parsed = JSON.parse(row.image_url);
                    const mapped = parsed.map(u => u && u.startsWith("/api/images/") ? origin + u : u);
                    row.image_url = JSON.stringify(mapped);
                  } catch (e) {}
                } else if (row.image_url.startsWith("/api/images/")) {
                  row.image_url = origin + row.image_url;
                }
              }
            }
          }

          return Response.json({ data: results }, { headers: corsHeaders });
        }

        // --- INSERT ---
        if (action === "insert") {
          const rows = Array.isArray(data) ? data : [data];
          const insertResults = [];

          for (const row of rows) {
            if (!row.id && ["transactions", "receipts", "members", "rooms", "users"].includes(table)) {
              row.id = crypto.randomUUID();
            }

            if (table === "receipts" && row.image_url) {
              const id = row.id;
              if (row.image_url.startsWith("[")) {
                try {
                  const parsed = JSON.parse(row.image_url);
                  const cleanUrls = [];
                  for (let i = 0; i < parsed.length; i++) {
                    cleanUrls.push(await handleBase64Image(parsed[i], id, i, env));
                  }
                  row.image_url = JSON.stringify(cleanUrls);
                } catch (e) {}
              } else {
                row.image_url = await handleBase64Image(row.image_url, id, null, env);
              }
            }

            const keys = Object.keys(row).filter(isValidCol);
            const placeholders = keys.map(() => "?").join(", ");
            const values = Object.values(row).map(val => typeof val === "object" ? JSON.stringify(val) : val);

            const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
            await env.DB.prepare(sql).bind(...values).run();
            insertResults.push(row);
          }

          return Response.json({ data: insertResults }, { headers: corsHeaders });
        }

        // --- UPDATE ---
        if (action === "update") {
          if (table === "receipts" && data.image_url) {
            const idFilter = filters && filters.find(f => f.column === "id");
            const id = idFilter ? idFilter.value : null;
            if (id) {
              if (data.image_url.startsWith("[")) {
                try {
                  const parsed = JSON.parse(data.image_url);
                  const cleanUrls = [];
                  for (let i = 0; i < parsed.length; i++) {
                    cleanUrls.push(await handleBase64Image(parsed[i], id, i, env));
                  }
                  data.image_url = JSON.stringify(cleanUrls);
                } catch (e) {}
              } else {
                data.image_url = await handleBase64Image(data.image_url, id, null, env);
              }
            }
          }

          const keys = Object.keys(data).filter(isValidCol);
          const setClause = keys.map(k => `${k} = ?`).join(", ");
          const values = keys.map(k => typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k]);

          let sql = `UPDATE ${table} SET ${setClause}`;
          let params = [...values];

          if (filters && filters.length > 0) {
            const clauses = [];
            for (const f of filters) {
              if (!isValidCol(f.column)) continue;
              clauses.push(`${f.column} = ?`);
              params.push(f.value);
            }
            if (clauses.length > 0) {
              sql += ` WHERE ${clauses.join(" AND ")}`;
            }
          }

          await env.DB.prepare(sql).bind(...params).run();
          return Response.json({ data }, { headers: corsHeaders });
        }

        // --- DELETE ---
        if (action === "delete") {
          let sql = `DELETE FROM ${table}`;
          let params = [];

          if (filters && filters.length > 0) {
            const clauses = [];
            for (const f of filters) {
              if (!isValidCol(f.column)) continue;
              clauses.push(`${f.column} = ?`);
              params.push(f.value);
            }
            if (clauses.length > 0) {
              sql += ` WHERE ${clauses.join(" AND ")}`;
            }
          }

          await env.DB.prepare(sql).bind(...params).run();
          return Response.json({ data: [] }, { headers: corsHeaders });
        }

        // --- UPSERT ---
        if (action === "upsert") {
          const rows = Array.isArray(data) ? data : [data];
          const upsertResults = [];

          for (const row of rows) {
            if (table === "receipts" && row.image_url) {
              const id = row.id || crypto.randomUUID();
              row.id = id;
              if (row.image_url.startsWith("[")) {
                try {
                  const parsed = JSON.parse(row.image_url);
                  const cleanUrls = [];
                  for (let i = 0; i < parsed.length; i++) {
                    cleanUrls.push(await handleBase64Image(parsed[i], id, i, env));
                  }
                  row.image_url = JSON.stringify(cleanUrls);
                } catch (e) {}
              } else {
                row.image_url = await handleBase64Image(row.image_url, id, null, env);
              }
            }

            let existing = null;
            if (table === "members") {
              existing = await env.DB.prepare("SELECT * FROM members WHERE room_id = ? AND uid = ?").bind(row.room_id, row.uid).first();
            } else if (row.id) {
              existing = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(row.id).first();
            } else if (row.uid) {
              existing = await env.DB.prepare(`SELECT * FROM ${table} WHERE uid = ?`).bind(row.uid).first();
            } else if (table === "system_settings" && row.key) {
              existing = await env.DB.prepare("SELECT * FROM system_settings WHERE key = ?").bind(row.key).first();
            }

            if (existing) {
              // Update
              const keys = Object.keys(row).filter(k => k !== "id" && k !== "uid" && k !== "room_id" && k !== "key").filter(isValidCol);
              if (keys.length > 0) {
                const setClause = keys.map(k => `${k} = ?`).join(", ");
                const values = keys.map(k => typeof row[k] === "object" ? JSON.stringify(row[k]) : row[k]);
                let sql = `UPDATE ${table} SET ${setClause}`;
                let updateParams = [...values];

                if (table === "members") {
                  sql += ` WHERE room_id = ? AND uid = ?`;
                  updateParams.push(row.room_id, row.uid);
                } else if (row.id) {
                  sql += ` WHERE id = ?`;
                  updateParams.push(row.id);
                } else if (row.uid) {
                  sql += ` WHERE uid = ?`;
                  updateParams.push(row.uid);
                } else if (table === "system_settings" && row.key) {
                  sql += ` WHERE key = ?`;
                  updateParams.push(row.key);
                }

                await env.DB.prepare(sql).bind(...updateParams).run();
              }
              upsertResults.push({ ...existing, ...row });
            } else {
              // Insert
              if (table === "members" && !row.id) {
                row.id = crypto.randomUUID();
              } else if (table === "users" && !row.id) {
                row.id = row.uid;
              }
              const keys = Object.keys(row).filter(isValidCol);
              const placeholders = keys.map(() => "?").join(", ");
              const values = Object.values(row).map(val => typeof val === "object" ? JSON.stringify(val) : val);

              const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
              await env.DB.prepare(sql).bind(...values).run();
              upsertResults.push(row);
            }
          }

          return Response.json({ data: upsertResults }, { headers: corsHeaders });
        }

        return Response.json({ error: `Unsupported action: ${action}` }, { status: 400, headers: corsHeaders });
      }

      // Auth Migration Endpoint
      if (url.pathname === "/api/auth/migrate" && request.method === "POST") {
        const { email, uid } = await request.json();
        if (!email || !uid) {
          return Response.json({ error: "Missing email or uid" }, { status: 400, headers: corsHeaders });
        }

        console.log(`Running auth migration for email: ${email}, uid: ${uid}`);

        // 1. Clean up duplicate member rows in the database (keeping only one member per room and email)
        await env.DB.prepare(`
          DELETE FROM members 
          WHERE id NOT IN (
            SELECT MIN(id) 
            FROM members 
            GROUP BY room_id, email
          )
        `).run();

        // 2. Find all unique old UIDs for this email
        const oldUidsResult = await env.DB.prepare("SELECT DISTINCT uid FROM members WHERE email = ? AND uid != ?").bind(email, uid).all();
        const oldUids = oldUidsResult.results.map(r => r.uid);

        console.log(`Found old UIDs to migrate: ${JSON.stringify(oldUids)}`);

        // 3. Migrate each old UID to the new Firebase UID
        for (const oldUid of oldUids) {
          await env.DB.prepare("UPDATE members SET uid = ? WHERE email = ? AND uid = ?").bind(uid, email, oldUid).run();
          await env.DB.prepare("UPDATE users SET id = ?, uid = ?, email = ? WHERE uid = ?").bind(uid, uid, email, oldUid).run();
          await env.DB.prepare("UPDATE transactions SET paid_by_uid = ? WHERE paid_by_uid = ?").bind(uid, oldUid).run();
          await env.DB.prepare("UPDATE transactions SET created_by = ? WHERE created_by = ?").bind(uid, oldUid).run();
          await env.DB.prepare("UPDATE activity_logs SET user_id = ? WHERE user_id = ?").bind(uid, oldUid).run();

          // 4. Migrate splits JSON array inside transactions table
          const likePattern = `%${oldUid}%`;
          const txsWithOldUid = await env.DB.prepare("SELECT id, splits FROM transactions WHERE splits LIKE ?").bind(likePattern).all();
          if (txsWithOldUid && txsWithOldUid.results) {
            for (const t of txsWithOldUid.results) {
              try {
                let splitsArr = typeof t.splits === 'string' ? JSON.parse(t.splits) : t.splits;
                if (splitsArr && Array.isArray(splitsArr)) {
                  let updated = false;
                  splitsArr.forEach(s => {
                    if (s.uid === oldUid) {
                      s.uid = uid;
                      updated = true;
                    }
                  });
                  if (updated) {
                    await env.DB.prepare("UPDATE transactions SET splits = ? WHERE id = ?").bind(JSON.stringify(splitsArr), t.id).run();
                  }
                }
              } catch (e) {
                console.error("Failed to update split JSON in auth migration:", e);
              }
            }
          }
        }

        return Response.json({ success: true, migratedUidsCount: oldUids.length }, { headers: corsHeaders });
      }

      // Legacy fallback endpoints
      if (url.pathname === "/api/users" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM users").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (url.pathname === "/api/rooms" && request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM rooms").all();
        return Response.json(results, { headers: corsHeaders });
      }
      if (url.pathname === "/api/transactions" && request.method === "GET") {
        const roomId = url.searchParams.get("room_id");
        let stmt = roomId 
          ? env.DB.prepare("SELECT * FROM transactions WHERE room_id = ?").bind(roomId)
          : env.DB.prepare("SELECT * FROM transactions");
        const { results } = await stmt.all();
        for (const row of results) {
          if (row.splits && typeof row.splits === "string") {
            try {
              row.splits = JSON.parse(row.splits);
            } catch (e) {}
          }
        }
        return Response.json(results, { headers: corsHeaders });
      }

      // 3. GET /api/images/:id
      if (url.pathname.startsWith("/api/images/") && request.method === "GET") {
        const id = url.pathname.slice("/api/images/".length);
        if (!id) {
          return new Response("Missing image ID", { status: 400, headers: corsHeaders });
        }
        
        // Fetch from R2 bucket
        const object = await env.MY_BUCKET.get(id);
        if (!object) {
          return new Response("Image not found", { status: 404, headers: corsHeaders });
        }
        
        const headers = new Headers(corsHeaders);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        
        // Automatically determine content-type if not set
        const contentType = headers.get("content-type");
        if (!contentType || contentType === "application/octet-stream") {
          if (id.endsWith(".png")) headers.set("content-type", "image/png");
          else if (id.endsWith(".pdf")) headers.set("content-type", "application/pdf");
          else if (id.endsWith(".heic")) headers.set("content-type", "image/heic");
          else headers.set("content-type", "image/jpeg");
        }
        
        return new Response(object.body, { headers });
      }

      return Response.json({ error: "Route not found" }, { status: 404, headers: corsHeaders });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
