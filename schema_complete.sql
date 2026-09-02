-- 1. Users Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  uid TEXT UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  room_id TEXT,
  login_code TEXT,
  updated_at TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table
DROP TABLE IF EXISTS rooms;
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT,
  pin TEXT,
  created_by TEXT,
  monthly_budget REAL,
  max_members INTEGER DEFAULT 6,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Members Table
DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  uid TEXT,
  nickname TEXT,
  photo_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'member',
  individual_budget REAL DEFAULT 2000,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  room_id TEXT,
  payer_id TEXT,
  amount REAL,
  title TEXT,
  category TEXT,
  date TEXT,
  time TEXT,
  paid_by TEXT,
  paid_by_uid TEXT,
  is_shared INTEGER DEFAULT 0,
  is_edited INTEGER DEFAULT 0,
  split_type TEXT,
  split TEXT,
  splits TEXT,
  created_by TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Receipts Table
DROP TABLE IF EXISTS receipts;
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  room_id TEXT,
  file_url TEXT,
  bg_class TEXT,
  rotation INTEGER DEFAULT 0,
  image_url TEXT,
  title TEXT,
  amount REAL,
  category TEXT,
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Activity Logs Table
DROP TABLE IF EXISTS activity_logs;
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. System Settings Table
DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
