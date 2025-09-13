const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function authMiddleware(req, res, next) {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload contains: userId, role, tenantId, tenantSlug, email
    // Optionally re-validate existence of user & tenant
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token (user not found)' });

    const tenant = await Tenant.findById(payload.tenantId);
    if (!tenant) return res.status(401).json({ error: 'Invalid token (tenant not found)' });

    req.user = {
      id: payload.userId,
      role: payload.role,
      tenant: payload.tenantId,
      tenantSlug: payload.tenantSlug,
      email: payload.email
    };
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden: insufficient role' });
    next();
  };
}

module.exports = { authMiddleware, requireRole };
