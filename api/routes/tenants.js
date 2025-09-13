const express = require('express');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET tenant info (optional)
router.get('/:slug', authMiddleware, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    // ensure the requesting user's tenant matches
    if (tenant._id.toString() !== req.user.tenant) return res.status(403).json({ error: 'Forbidden' });
    res.json({ tenant });
  } catch (err) { next(err); }
});

// POST /tenants/:slug/upgrade  (Admin only)
router.post('/:slug/upgrade', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    if (tenant._id.toString() !== req.user.tenant) return res.status(403).json({ error: 'Forbidden: cannot upgrade other tenant' });
    tenant.plan = 'pro';
    await tenant.save();
    res.json({ success: true, tenant });
  } catch (err) { next(err); }
});

// POST /tenants/:slug/invite { email, role }
// Admin invites a user (creates user with 'password' as provided)
router.post('/:slug/invite', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'email and role required' });
    if (!['admin','member'].includes(role)) return res.status(400).json({ error: 'invalid role' });

    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    if (tenant._id.toString() !== req.user.tenant) return res.status(403).json({ error: 'Forbidden: cannot invite to other tenant' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const password = 'password'; // as per test requirement; in real systems, send an invite email
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      passwordHash: hash,
      role,
      tenant: tenant._id
    });
    await user.save();
    res.status(201).json({ success: true, user: { email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

module.exports = router;
