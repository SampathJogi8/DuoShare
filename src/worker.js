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

          return Response.json({ data: results }, { headers: corsHeaders });
        }

        // --- INSERT ---
        if (action === "insert") {
          const rows = Array.isArray(data) ? data : [data];
          const insertResults = [];

          for (const row of rows) {
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

      return Response.json({ error: "Route not found" }, { status: 404, headers: corsHeaders });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
