
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mphuwixprztbzrxndqsl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow";
const sb = createClient(supabaseUrl, supabaseKey);

const WORKER_URL = "https://duoshare-backend.sampathjogipusala123.workers.dev/api/query";
const EXPORT_URL = "https://duoshare-backend.sampathjogipusala123.workers.dev/api/export-all-data";

async function queryD1(table, action, payload = {}) {
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, action, ...payload })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error("D1 query failed: " + txt);
  }
  return await res.json();
}

function sanitizeForSupabase(row, tbl) {
  const cleaned = { ...row };
  for (const [k, v] of Object.entries(cleaned)) {
    if (v === "null" || v === "undefined") {
      cleaned[k] = null;
    }
  }
  if (tbl === "rooms") {
    if (cleaned.monthly_budget !== null && cleaned.monthly_budget !== undefined) {
      cleaned.monthly_budget = Number(cleaned.monthly_budget);
    }
    if (cleaned.max_members !== null && cleaned.max_members !== undefined) {
      cleaned.max_members = Number(cleaned.max_members);
    }
  }
  if (tbl === "receipts") {
    if (cleaned.rotation !== null && cleaned.rotation !== undefined) {
      cleaned.rotation = Number(cleaned.rotation) || 0;
    }
    if (cleaned.amount !== null && cleaned.amount !== undefined) {
      cleaned.amount = Number(cleaned.amount) || 0;
    }
  }
  if (tbl === "transactions") {
    if (cleaned.amount !== null && cleaned.amount !== undefined) {
      cleaned.amount = Number(cleaned.amount) || 0;
    }
    if (cleaned.is_shared !== null && cleaned.is_shared !== undefined) {
      cleaned.is_shared = cleaned.is_shared === 1 || cleaned.is_shared === true || cleaned.is_shared === "1" || cleaned.is_shared === "true";
    }
    if (cleaned.is_edited !== null && cleaned.is_edited !== undefined) {
      cleaned.is_edited = cleaned.is_edited === 1 || cleaned.is_edited === true || cleaned.is_edited === "1" || cleaned.is_edited === "true";
    }
  }
  if (tbl === "members") {
    if (cleaned.individual_budget !== null && cleaned.individual_budget !== undefined) {
      cleaned.individual_budget = Number(cleaned.individual_budget) || 2000;
    }
  }
  if (tbl === "activity_logs") {
    if (cleaned.id !== null && cleaned.id !== undefined) {
      cleaned.id = Number(cleaned.id);
    }
  }
  return cleaned;
}

function sanitizeForD1(row, tbl) {
  const cleaned = { ...row };
  for (const [k, v] of Object.entries(cleaned)) {
    if (v === undefined) {
      cleaned[k] = null;
    }
  }
  if (tbl === "transactions") {
    if (cleaned.is_shared !== null && cleaned.is_shared !== undefined) {
      cleaned.is_shared = cleaned.is_shared ? 1 : 0;
    }
    if (cleaned.is_edited !== null && cleaned.is_edited !== undefined) {
      cleaned.is_edited = cleaned.is_edited ? 1 : 0;
    }
    if (cleaned.splits && typeof cleaned.splits === "object") {
      cleaned.splits = JSON.stringify(cleaned.splits);
    }
  }
  return cleaned;
}

async function syncDatabases() {
  console.log("🚀 Starting bidirectional synchronization between Supabase and Cloudflare D1...");

  const expRes = await fetch(EXPORT_URL);
  const expJson = await expRes.json();
  const d1Data = expJson.data || {};

  const tables = ["users", "rooms", "members", "transactions", "receipts", "activity_logs", "system_settings"];
  const CONFLICT_KEY = {
    users: "id",
    rooms: "id",
    members: "id",
    transactions: "id",
    receipts: "id",
    activity_logs: "id",
    system_settings: "key"
  };

  for (const tbl of tables) {
    console.log("\n================ Processing [" + tbl + "] ================");
    const key = CONFLICT_KEY[tbl] || "id";

    const { data: sbRows, error: sbErr } = await sb.from(tbl).select("*");
    if (sbErr) {
      console.error("Error fetching " + tbl + " from Supabase:", sbErr);
      continue;
    }

    const d1Rows = d1Data[tbl] || [];
    console.log("Initial count: Supabase = " + sbRows.length + ", D1 = " + d1Rows.length);

    const sbMap = new Map();
    sbRows.forEach(r => sbMap.set(String(r[key]), r));

    const d1Map = new Map();
    d1Rows.forEach(r => d1Map.set(String(r[key]), r));

    // A. Sync D1 -> Supabase
    const missingInSb = [];
    for (const [id, row] of d1Map.entries()) {
      if (!sbMap.has(id)) {
        missingInSb.push(sanitizeForSupabase(row, tbl));
      }
    }

    if (missingInSb.length > 0) {
      console.log("-> Upserting " + missingInSb.length + " rows from D1 into Supabase...");
      const chunkSize = 50;
      for (let i = 0; i < missingInSb.length; i += chunkSize) {
        const chunk = missingInSb.slice(i, i + chunkSize);
        const { error } = await sb.from(tbl).upsert(chunk, { onConflict: key });
        if (error) {
          console.error("   Error upserting chunk to Supabase in " + tbl + ":", error);
        }
      }
    } else {
      console.log("-> Supabase has all rows from D1.");
    }

    // B. Sync Supabase -> D1
    const missingInD1 = [];
    for (const [id, row] of sbMap.entries()) {
      if (!d1Map.has(id)) {
        missingInD1.push(sanitizeForD1(row, tbl));
      }
    }

    if (missingInD1.length > 0) {
      console.log("-> Upserting " + missingInD1.length + " rows from Supabase into D1...");
      const chunkSize = 25;
      for (let i = 0; i < missingInD1.length; i += chunkSize) {
        const chunk = missingInD1.slice(i, i + chunkSize);
        try {
          await queryD1(tbl, "upsert", { data: chunk });
        } catch (err) {
          console.error("   Error upserting chunk to D1 in " + tbl + ":", err.message);
        }
      }
    } else {
      console.log("-> D1 has all rows from Supabase.");
    }
  }

  // Final verification
  console.log("\n================ FINAL VERIFICATION ================");
  const finalExpRes = await fetch(EXPORT_URL);
  const finalExpJson = await finalExpRes.json();
  const finalD1Data = finalExpJson.data || {};

  for (const tbl of tables) {
    const { count: sbCount } = await sb.from(tbl).select("*", { count: "exact", head: true });
    const d1Count = (finalD1Data[tbl] || []).length;
    const match = sbCount === d1Count ? "✅ MATCH" : "❌ MISMATCH";
    console.log(tbl.padEnd(16) + " | Supabase: " + String(sbCount).padStart(4) + " | D1: " + String(d1Count).padStart(4) + " | " + match);
  }
}

syncDatabases().catch(console.error);
