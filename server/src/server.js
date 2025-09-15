import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db } from './db.js';
import path from 'node:path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static hosting of the frontend (optional)
const publicDir = path.join(process.cwd());
app.use('/', express.static(publicDir));

// Orgs APIs
app.get('/api/orgs', (req,res)=>{
  const rows = db.prepare('SELECT * FROM orgs').all();
  res.json(rows);
});
app.post('/api/orgs', (req,res)=>{
  const { id, type, name, parentId } = req.body;
  db.prepare('INSERT INTO orgs (id,type,name,parentId) VALUES (?,?,?,?)').run(id, type, name, parentId ?? null);
  res.status(201).json({ ok:true });
});
app.put('/api/orgs/:id', (req,res)=>{
  const { name, type, parentId } = req.body;
  db.prepare('UPDATE orgs SET name = COALESCE(?,name), type = COALESCE(?,type), parentId = ? WHERE id = ?')
    .run(name ?? null, type ?? null, parentId ?? null, req.params.id);
  res.json({ ok:true });
});
app.delete('/api/orgs/:id', (req,res)=>{
  const id = req.params.id;
  db.prepare('DELETE FROM orgs WHERE id = ? OR parentId = ?').run(id, id);
  db.prepare('UPDATE employees SET orgId = NULL WHERE orgId = ?').run(id);
  res.json({ ok:true });
});

// Employees APIs
app.get('/api/employees', (req,res)=>{
  const rows = db.prepare('SELECT * FROM employees').all();
  res.json(rows);
});
app.post('/api/employees', (req,res)=>{
  const { id, name, title, email, phone, status, orgId } = req.body;
  db.prepare('INSERT INTO employees (id,name,title,email,phone,status,orgId) VALUES (?,?,?,?,?,?,?)')
    .run(id, name, title ?? null, email ?? null, phone ?? null, status ?? 'active', orgId ?? null);
  res.status(201).json({ ok:true });
});
app.put('/api/employees/:id', (req,res)=>{
  const { name, title, email, phone, status, orgId } = req.body;
  db.prepare('UPDATE employees SET name=COALESCE(?,name), title=COALESCE(?,title), email=COALESCE(?,email), phone=COALESCE(?,phone), status=COALESCE(?,status), orgId=? WHERE id=?')
    .run(name ?? null, title ?? null, email ?? null, phone ?? null, status ?? null, orgId ?? null, req.params.id);
  res.json({ ok:true });
});
app.delete('/api/employees/:id', (req,res)=>{
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.json({ ok:true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`Server running at http://localhost:${PORT}`);
});
