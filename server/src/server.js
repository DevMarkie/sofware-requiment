import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db } from './db.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static hosting of the frontend (serve repo root so index.html is available)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', '..');
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
// Delete org (with cascade for modules if course) - unified implementation
app.delete('/api/orgs/:id', (req,res)=>{
  try {
    const id = req.params.id;
    const target = db.prepare('SELECT * FROM orgs WHERE id = ?').get(id);
    const directChildren = db.prepare('SELECT id,type FROM orgs WHERE parentId = ?').all(id);
    db.prepare('DELETE FROM orgs WHERE id = ? OR parentId = ?').run(id, id);
    db.prepare('UPDATE employees SET orgId = NULL WHERE orgId = ?').run(id);
    const courseIds = [target, ...directChildren].filter(x=>x && x.type==='course').map(x=>x.id);
    if (courseIds.length){
      const placeholder = courseIds.map(()=>'?').join(',');
      db.prepare(`DELETE FROM modules WHERE courseId IN (${placeholder})`).run(...courseIds);
    }
    res.json({ ok:true, deletedCourses: courseIds });
  } catch (err){
    console.error('DELETE /api/orgs/:id error', err);
    res.status(500).json({ ok:false, error: 'internal_error' });
  }
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

// Modules (Học phần) APIs
app.get('/api/modules', (req,res)=>{
  const { courseId } = req.query;
  let rows;
  if (courseId){
    rows = db.prepare('SELECT * FROM modules WHERE courseId = ?').all(courseId);
  } else {
    rows = db.prepare('SELECT * FROM modules').all();
  }
  res.json(rows);
});
app.post('/api/modules', (req,res)=>{
  try {
    let { id, code, name, credits, courseId } = req.body;
    if (!name || !courseId){
      return res.status(400).json({ ok:false, error: 'name & courseId required' });
    }
    // Validate courseId exists and type=course
    const course = db.prepare('SELECT id FROM orgs WHERE id = ? AND type = ?').get(courseId, 'course');
    if (!course){
      return res.status(400).json({ ok:false, error: 'courseId invalid (not found or not type=course)' });
    }
    if (!id){
      // generate simple random id
      id = 'm-' + Math.random().toString(36).slice(2,10);
    }
    db.prepare('INSERT INTO modules (id,code,name,credits,courseId) VALUES (?,?,?,?,?)')
      .run(id, code ?? null, name, Number.isFinite(+credits) ? +credits : 0, courseId);
    res.status(201).json({ ok:true, id });
  } catch (err){
    console.error('POST /api/modules error', err);
    res.status(500).json({ ok:false, error: 'internal_error' });
  }
});
app.put('/api/modules/:id', (req,res)=>{
  try {
    const { code, name, credits } = req.body;
    db.prepare('UPDATE modules SET code=COALESCE(?,code), name=COALESCE(?,name), credits=COALESCE(?,credits) WHERE id=?')
      .run(code ?? null, name ?? null, (credits===undefined? null : (Number.isFinite(+credits)? +credits : 0)), req.params.id);
    res.json({ ok:true });
  } catch (err){
    console.error('PUT /api/modules/:id error', err);
    res.status(500).json({ ok:false, error: 'internal_error' });
  }
});
app.delete('/api/modules/:id', (req,res)=>{
  try {
    db.prepare('DELETE FROM modules WHERE id = ?').run(req.params.id);
    res.json({ ok:true });
  } catch (err){
    console.error('DELETE /api/modules/:id error', err);
    res.status(500).json({ ok:false, error: 'internal_error' });
  }
});

// (Removed duplicate monkey-patch delete route; unified above)

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`Server running at http://localhost:${PORT}`);
});
