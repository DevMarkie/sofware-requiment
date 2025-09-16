import crypto from 'node:crypto';
import { db } from './db.js';

// --- Password hashing (PBKDF2) ---
const PBKDF_ITER = 120000; // balanced security/perf
const KEYLEN = 32;
const DIGEST = 'sha256';

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')){
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF_ITER, KEYLEN, DIGEST).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, salt, expectedHash){
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

// --- Session management ---
export function createSession(userId, ttlMs = 1000*60*60*8){ // 8h
  const sid = crypto.randomUUID();
  const now = Date.now();
  const expires = now + ttlMs;
  db.prepare('INSERT INTO sessions (sid,userId,created_at,expires) VALUES (?,?,?,?)')
    .run(sid, userId, now, expires);
  return { sid, expires };
}

export function getSession(sid){
  if (!sid) return null;
  const row = db.prepare('SELECT * FROM sessions WHERE sid = ?').get(sid);
  if (!row) return null;
  if (row.expires < Date.now()){
    try { db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid); } catch {}
    return null;
  }
  return row;
}

export function destroySession(sid){
  if (!sid) return;
  db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
}

export function findUserByUsername(username){
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function findUserById(id){
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser({ id, username, password }){
  const { hash, salt } = hashPassword(password);
  const now = Date.now();
  db.prepare('INSERT INTO users (id,username,pass_hash,pass_salt,created_at) VALUES (?,?,?,?,?)')
    .run(id, username, hash, salt, now);
  return findUserByUsername(username);
}

// Express helpers
export function parseSidCookie(req){
  const cookie = req.headers['cookie'];
  if (!cookie) return null;
  const parts = cookie.split(';').map(s=>s.trim());
  for (const p of parts){
    if (p.startsWith('sid=')) return decodeURIComponent(p.substring(4));
  }
  return null;
}

export function setSessionCookie(res, sid, expires){
  const cookie = `sid=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor((expires-Date.now())/1000)}`;
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res){
  res.setHeader('Set-Cookie', 'sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

export function ensureAuth(req, res, next){
  const sid = parseSidCookie(req);
  const sess = getSession(sid);
  if (!sess) return res.status(401).json({ error: 'unauthorized' });
  req.user = findUserById(sess.userId);
  req.session = sess;
  next();
}
