// Admin Authentication Middleware (bcrypt + users.json)
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, 'users.json');

// Ensure users file exists
function ensureUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUser = {
      users: []
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUser, null, 2), 'utf8');
  }
}

ensureUsersFile();

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw).users || [];
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf8');
}

// Session storage (in-memory). For production, swap to Redis or DB.
const adminSessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create or update admin user (used by init script)
function createUser(username, plainPassword) {
  ensureUsersFile();
  const users = readUsers();
  const hashed = bcrypt.hashSync(plainPassword, 10);
  const existing = users.find(u => u.username === username);
  if (existing) {
    existing.password = hashed;
  } else {
    users.push({ username, password: hashed });
  }
  writeUsers(users);
}

// Login handler
function loginAdmin(username, password) {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) return null;

  if (!bcrypt.compareSync(password, user.password)) return null;

  const token = generateToken();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  adminSessions.set(token, { username, expiresAt, createdAt: Date.now() });
  return token;
}

function verifyToken(token) {
  const session = adminSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return null;
  }
  return session;
}

function logoutAdmin(token) {
  adminSessions.delete(token);
}

function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.body?.token || req.query?.token;
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login first.' });
  }
  req.adminToken = token;
  next();
}

module.exports = {
  loginAdmin,
  verifyToken,
  logoutAdmin,
  requireAuth,
  createUser
};
