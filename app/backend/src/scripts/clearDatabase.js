import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

const collections = await mongoose.connection.db.listCollections().toArray();
const names = collections.map(c => c.name);

if (names.length === 0) {
  console.log('No collections found — database is already empty.');
  await mongoose.disconnect();
  process.exit(0);
}

console.log(`Dropping ${names.length} collections...`);
for (const name of names) {
  await mongoose.connection.db.dropCollection(name);
  console.log(`  ✓ ${name}`);
}

console.log('\nDatabase cleared successfully.');
await mongoose.disconnect();
process.exit(0);
