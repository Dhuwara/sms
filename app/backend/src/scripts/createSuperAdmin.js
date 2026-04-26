/**
 * Run once to create the first super admin account:
 *   node src/scripts/createSuperAdmin.js
 *
 * Set SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD env vars to override defaults.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import SuperAdmin from '../models/SuperAdmin.js';

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

const email = process.env.SUPERADMIN_EMAIL || 'superadmin@sms.local';
const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123';
const name = process.env.SUPERADMIN_NAME || 'Super Admin';

const existing = await SuperAdmin.findOne({ email });
if (existing) {
  console.log(`Super admin already exists: ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);
await SuperAdmin.create({ name, email, passwordHash });

console.log('✅ Super admin created successfully');
console.log(`   Email   : ${email}`);
console.log(`   Password: ${password}`);
console.log('   Change the password after first login!');

await mongoose.disconnect();
