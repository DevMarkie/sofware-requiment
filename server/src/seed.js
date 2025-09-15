import { db } from './db.js';
import fs from 'node:fs';
import path from 'node:path';

const seedPath = path.join(process.cwd(), 'server', 'data', 'seed.json');
const { orgs, employees } = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const insertOrg = db.prepare('INSERT OR REPLACE INTO orgs (id,type,name,parentId) VALUES (?,?,?,?)');
const insertEmp = db.prepare('INSERT OR REPLACE INTO employees (id,name,title,email,phone,status,orgId) VALUES (?,?,?,?,?,?,?)');

const tx = db.transaction(() => {
  for (const o of orgs) insertOrg.run(o.id, o.type, o.name, o.parentId ?? null);
  for (const e of employees) insertEmp.run(e.id, e.name, e.title ?? null, e.email ?? null, e.phone ?? null, e.status ?? 'active', e.orgId ?? null);
});

await tx();
console.log('Seeded database');
