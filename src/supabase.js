import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mphuwixprztbzrxndqsl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Please check your .env configuration.");
}

export const realSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Database Engine State ('supabase' | 'd1')
export const getActiveDatabaseEngine = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tallyin_active_db_engine');
    if (saved === 'd1' || saved === 'supabase') return saved;
  }
  return 'd1'; // Default active engine is Cloudflare D1 (where all schemas, quotas, and transactions are live and intact)
};

export const setActiveDatabaseEngine = (engine) => {
  if (engine !== 'supabase' && engine !== 'd1') return;
  if (typeof window !== 'undefined') {
    localStorage.setItem('tallyin_active_db_engine', engine);
    window.dispatchEvent(new CustomEvent('tallyin-db-engine-changed', { detail: { engine } }));
  }
};

// D1 QueryBuilder Adapter for Cloudflare Worker
class D1QueryBuilder {
  constructor(table) {
    this.table = table;
    this.action = 'select';
    this.filters = [];
    this.orderFields = [];
    this.limitVal = null;
    this.payload = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
  }

  select(columns = '*') {
    if (this.action === 'select') this.action = 'select';
    return this;
  }

  insert(data) {
    this.action = 'insert';
    if (['transactions', 'receipts', 'members', 'rooms', 'users'].includes(this.table)) {
      const rows = Array.isArray(data) ? data : [data];
      rows.forEach(row => {
        if (!row.id) row.id = crypto.randomUUID();
      });
    }
    this.payload = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  upsert(data, options = {}) {
    this.action = 'upsert';
    this.payload = data;
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  gte(column, value) {
    this.filters.push({ column, operator: 'gte', value });
    return this;
  }

  lte(column, value) {
    this.filters.push({ column, operator: 'lte', value });
    return this;
  }

  in(column, values) {
    this.filters.push({ column, operator: 'in', value: values });
    return this;
  }

  limit(value) {
    this.limitVal = value;
    return this;
  }

  order(column, options = {}) {
    this.orderFields.push({ column, ascending: options.ascending !== false });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async then(onfulfilled, onrejected) {
    try {
      const response = await fetch('https://duoshare-backend.sampathjogipusala123.workers.dev/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: this.table,
          action: this.action,
          filters: this.filters,
          order: this.orderFields,
          limit: this.limitVal,
          data: this.payload
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = errText || `HTTP ${response.status}`;
        try {
          const parsedErr = JSON.parse(errText);
          if (parsedErr.error) errMsg = parsedErr.error;
        } catch(e) {}
        throw new Error(errMsg);
      }

      const res = await response.json();
      let data = res.data;

      if (this.isSingle || this.isMaybeSingle) {
        data = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (this.isSingle && data === null) {
          throw new Error('No rows found for single() query');
        }
      }

      const result = { data, error: null };
      return typeof onfulfilled === 'function' ? onfulfilled(result) : result;
    } catch (err) {
      console.error(`D1QueryBuilder error for ${this.action} on ${this.table}:`, err);
      const result = { data: null, error: { message: err.message, code: err.code || 'D1_ERROR' } };
      return typeof onfulfilled === 'function' ? onfulfilled(result) : result;
    }
  }

  catch(onrejected) {
    return this.then(null, onrejected);
  }

  finally(onfinally) {
    return this.then(
      val => Promise.resolve(typeof onfinally === 'function' ? onfinally() : null).then(() => val),
      err => Promise.resolve(typeof onfinally === 'function' ? onfinally() : null).then(() => { throw err; })
    );
  }
}

// Proxy that routes dynamically to Supabase or Cloudflare D1
export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      return (table) => {
        const engine = getActiveDatabaseEngine();
        if (engine === 'd1') {
          return new D1QueryBuilder(table);
        }
        // Direct Native Supabase client
        return realSupabase.from(table);
      };
    }
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }
});

export default supabase;
