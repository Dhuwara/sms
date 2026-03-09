import mongoose from 'mongoose';

/**
 * Direct fix for old 'standard_1_academicYear_1' index
 * This index should not exist in the new schema
 */
const fixOldStandardIndex = async () => {
  try {
    console.log('Checking for old standard_1_academicYear_1 index...');

    // Connect to MongoDB using the same URI as the app
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(MONGO_URI);
    console.log(`✓ Connected to MongoDB: ${MONGO_URI}`);

    const collection = mongoose.connection.collection('periodconfigs');

    // Get all indexes
    const indexes = await collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));

    // Check if the old problematic index exists
    if (indexes['standard_1_academicYear_1']) {
      console.log('Found old index: standard_1_academicYear_1');
      console.log('Dropping it...');
      await collection.dropIndex('standard_1_academicYear_1');
      console.log('✓ Dropped standard_1_academicYear_1');
    } else {
      console.log('✓ Old standard_1_academicYear_1 index does not exist');
    }

    // Verify correct index exists
    const updatedIndexes = await collection.getIndexes();
    if (updatedIndexes['classId_1_academicYear_1']) {
      console.log('✓ Correct index exists: classId_1_academicYear_1');
    } else {
      console.log('Creating correct index...');
      await collection.createIndex(
        { classId: 1, academicYear: 1 },
        { unique: true }
      );
      console.log('✓ Created classId_1_academicYear_1');
    }

    console.log('\nFinal indexes:', Object.keys(await collection.getIndexes()));
    console.log('\n✅ Index cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

fixOldStandardIndex();
