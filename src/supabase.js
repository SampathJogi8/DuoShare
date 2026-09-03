import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

const realSupabase = createClient(supabaseUrl, supabaseAnonKey);
export { realSupabase };

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
    if (['transactions', 'receipts', 'members', 'rooms', 'users'].includes(this.table)) {
      const rows = Array.isArray(data) ? data : [data];
      rows.forEach(row => {
        if (!row.id) {
          row.id = crypto.randomUUID();
        }
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
      // Hard Maintenance Guard: block writes for non-whitelisted users when maintenance is active
      if (['insert', 'update', 'delete', 'upsert'].includes(this.action) && this.table !== 'system_settings') {
        const isMaint = typeof window !== 'undefined' && localStorage.getItem('tallyin_system_maintenance_active') === 'true';
        if (isMaint) {
          const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('tallyin_current_user_email') || '').trim().toLowerCase() : '';
          const allowedRaw = typeof window !== 'undefined' ? localStorage.getItem('tallyin_maintenance_allowed_accounts') : null;
          let allowed = ['tallyin.alerts@gmail.com'];
          try { if (allowedRaw) allowed = JSON.parse(allowedRaw); } catch(e) {}
          const coAdminsRaw = typeof window !== 'undefined' ? localStorage.getItem('tallyin_co_admins') : null;
          let coAdmins = [];
          try { if (coAdminsRaw) coAdmins = JSON.parse(coAdminsRaw); } catch(e) {}
          const isCoAdmin = coAdmins.some(c => {
            const email = (typeof c === 'string' ? c : c?.email)?.trim().toLowerCase();
            if (email !== userEmail) return false;
            if (c?.expiresAt) {
              const expTime = new Date(c.expiresAt).getTime();
              if (Number.isFinite(expTime) && expTime <= Date.now()) return false;
            }
            return true;
          });
          const isAllowed = userEmail && (allowed.some(a => String(a).trim().toLowerCase() === userEmail) || isCoAdmin || userEmail === 'tallyin.alerts@gmail.com');

          if (!isAllowed) {
            console.warn(`[Maintenance Guard] Denied ${this.action} on ${this.table} for user: ${userEmail || 'anonymous'}`);
            throw new Error('System is currently undergoing scheduled maintenance. Data changes are temporarily restricted.');
          }
        }
      }

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
      console.error(`MockQueryBuilder error for ${this.action} on ${this.table}:`, err);
      const result = { data: null, error: { message: err.message, code: err.code || 'MOCK_ERROR' } };
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
