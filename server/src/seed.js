import { db } from './db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, '..', 'data', 'seed.json');
const { orgs, employees, modules } = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

const insertOrg = db.prepare('INSERT OR REPLACE INTO orgs (id,type,name,parentId) VALUES (?,?,?,?)');
const insertEmp = db.prepare('INSERT OR REPLACE INTO employees (id,name,title,email,phone,status,orgId) VALUES (?,?,?,?,?,?,?)');
const insertModule = db.prepare('INSERT OR REPLACE INTO modules (id,code,name,credits,courseId) VALUES (?,?,?,?,?)');

const tx = db.transaction(() => {
  for (const o of orgs) insertOrg.run(o.id, o.type, o.name, o.parentId ?? null);
  for (const e of employees) insertEmp.run(e.id, e.name, e.title ?? null, e.email ?? null, e.phone ?? null, e.status ?? 'active', e.orgId ?? null);
  if (Array.isArray(modules)){
    for (const m of modules){
      insertModule.run(m.id, m.code ?? null, m.name, m.credits ?? 0, m.courseId);
    }
  }
});

await tx();
console.log('Seeded database');
