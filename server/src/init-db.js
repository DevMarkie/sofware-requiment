import { db } from './db.js';

// Schema
// orgs: id TEXT PRIMARY KEY, type TEXT, name TEXT, parentId TEXT NULL
// employees: id TEXT PRIMARY KEY, name TEXT, title TEXT, email TEXT, phone TEXT, status TEXT, orgId TEXT NULL

const ddl = `
CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  parentId TEXT
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  orgId TEXT
);
`;

db.exec(ddl);
console.log('Database initialized');
