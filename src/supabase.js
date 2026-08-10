import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.action = 'select'; // default action
    this.filters = [];
    this.orderFields = [];
    this.limitVal = null;
    this.payload = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
  }

  select(columns = '*') {
    if (this.action === 'select') {
      this.action = 'select';
    }
    return this;
  }

  insert(data) {
    this.action = 'insert';
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
        throw new Error(errText || `HTTP ${response.status}`);
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
      console.error(`MockQueryBuilder error for ${this.action} on ${this.table}:`, err);
      const result = { data: null, error: { message: err.message, code: err.code || 'MOCK_ERROR' } };
      return typeof onfulfilled === 'function' ? onfulfilled(result) : result;
    }
  }
}

export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    if (prop === 'from') {
      return (table) => new MockQueryBuilder(table);
    }
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }
});
