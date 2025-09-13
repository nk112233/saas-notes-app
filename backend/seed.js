require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Tenant = require('./models/Tenant');
const User = require('./models/User');
const Note = require('./models/Note');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_saas';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  // cleanup
  await Note.deleteMany({});
  await User.deleteMany({});
  await Tenant.deleteMany({});

  // create tenants
  const acme = new Tenant({ name: 'Acme', slug: 'acme', plan: 'free' });
  const globex = new Tenant({ name: 'Globex', slug: 'globex', plan: 'free' });
  await acme.save();
  await globex.save();
  console.log('Tenants created');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password', salt);

  const users = [
    { email: 'admin@acme.test', role: 'admin', tenant: acme._id },
    { email: 'user@acme.test', role: 'member', tenant: acme._id },
    { email: 'admin@globex.test', role: 'admin', tenant: globex._id },
    { email: 'user@globex.test', role: 'member', tenant: globex._id },
  ].map(u => ({ ...u, passwordHash: hash }));

  await User.insertMany(users);
  console.log('Users created (password: password)');

//   // optionally create 1 note for each tenant
//   const note1 = new Note({ title: 'Welcome (Acme)', content: 'First note for Acme', tenant: acme._id, createdBy: null });
//   const note2 = new Note({ title: 'Welcome (Globex)', content: 'First note for Globex', tenant: globex._id, createdBy: null });
//   await note1.save();
//   await note2.save();
//   console.log('Sample notes created');

  console.log('Seeding complete');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
