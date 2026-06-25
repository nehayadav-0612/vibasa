// server/scripts/createSupervisor.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const MONGO = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smart_waste';

async function run(email, password) {
  await mongoose.connect(MONGO, {});

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Email already exists');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({ email, passwordHash, role: 'supervisor' });
  await user.save();
  console.log('Supervisor created:', user._id);
  await mongoose.disconnect();
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.log('Usage: node createSupervisor.js email password');
  process.exit(1);
}
run(email, password).catch(err => { console.error(err); process.exit(1); });

//node server/scripts/createSupervisor.js admin@example.com secret123