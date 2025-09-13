const express = require('express');
const Note = require('../models/Note');
const Tenant = require('../models/Tenant');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// all notes routes require auth
router.use(authMiddleware);

// POST /notes - create note
router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    // check tenant plan + limit
    const tenant = await Tenant.findById(req.user.tenant);
    if (!tenant) return res.status(400).json({ error: 'Tenant not found' });

    if (tenant.plan === 'free') {
      const count = await Note.countDocuments({ tenant: tenant._id });
      if (count >= 3) {
        return res.status(403).json({ error: 'Note limit reached. Upgrade to Pro.' });
      }
    }

    const note = new Note({
      title,
      content: content || '',
      tenant: tenant._id,
      createdBy: req.user.id
    });

    await note.save();
    res.status(201).json({ note });
  } catch (err) { next(err); }
});

// GET /notes - list all notes for tenant
router.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find({ tenant: req.user.tenant }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (err) { next(err); }
});

// GET /notes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, tenant: req.user.tenant });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note });
  } catch (err) { next(err); }
});

// PUT /notes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const note = await Note.findOne({ _id: id, tenant: req.user.tenant });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    // Members can edit their tenant's notes; Admin too. No further restriction defined.
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();
    res.json({ note });
  } catch (err) { next(err); }
});

// DELETE /notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, tenant: req.user.tenant });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
