import mongoose from 'mongoose';

const listCollections = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to: ${MONGO_URI}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

listCollections();
