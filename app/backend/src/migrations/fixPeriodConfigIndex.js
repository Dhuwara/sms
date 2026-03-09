import mongoose from 'mongoose';
import PeriodConfig from '../models/PeriodConfig.js';

/**
 * Migration to fix PeriodConfig index from old 'standard' to new 'classId'
 * Run this once to clean up the database
 */
const fixPeriodConfigIndex = async () => {
  try {
    console.log('Starting PeriodConfig index migration...');

    // Connect to MongoDB
    const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sms';
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.collection('periodconfigs');

    // Try to get indexes - collection might not exist
    let indexes = {};
    try {
      indexes = await collection.getIndexes();
      console.log('Existing indexes:', Object.keys(indexes));

      for (const [indexName] of Object.entries(indexes)) {
        if (indexName !== '_id_') {
          console.log(`Dropping index: ${indexName}`);
          try {
            await collection.dropIndex(indexName);
          } catch (dropErr) {
            console.log(`Note: Could not drop index ${indexName}:`, dropErr.message);
          }
        }
      }
      console.log('✓ Old indexes dropped');
    } catch (err) {
      console.log('Note: Collection does not exist yet or is empty, that\'s fine.');
    }

    // Clean up: Remove any documents with null classId (from old schema)
    const nullClassIdCount = await PeriodConfig.countDocuments({ classId: null });
    if (nullClassIdCount > 0) {
      console.log(`Removing ${nullClassIdCount} documents with null classId...`);
      await PeriodConfig.deleteMany({ classId: null });
      console.log(`✓ Removed ${nullClassIdCount} orphaned documents`);
    }

    // Remove duplicate records (keep first occurrence of each classId + academicYear)
    const configs = await PeriodConfig.find({});
    const seen = new Map();
    const duplicates = [];

    for (const config of configs) {
      const key = `${config.classId}_${config.academicYear}`;
      if (seen.has(key)) {
        duplicates.push(config._id);
      } else {
        seen.set(key, config._id);
      }
    }

    if (duplicates.length > 0) {
      console.log(`Removing ${duplicates.length} duplicate records...`);
      await PeriodConfig.deleteMany({ _id: { $in: duplicates } });
      console.log(`✓ Removed ${duplicates.length} duplicates`);
    }

    // Create the correct index
    console.log('Creating new index on classId + academicYear...');
    await collection.createIndex(
      { classId: 1, academicYear: 1 },
      { unique: true }
    );
    console.log('✓ New index created successfully');

    console.log('\n✅ Migration complete! PeriodConfig is ready to use.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

fixPeriodConfigIndex();
