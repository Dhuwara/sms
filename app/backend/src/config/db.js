import mongoose from 'mongoose';

const dropStaleIndexes = async () => {
  try {
    const classesCol = mongoose.connection.collection('classes');
    const indexes = await classesCol.indexes();
    const stale = indexes.find((i) => i.name === 'className_1_section_1');
    if (stale) {
      await classesCol.dropIndex('className_1_section_1');
      console.log('Dropped stale index: className_1_section_1');
    }
  } catch {
    // index may not exist — safe to ignore
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    // await dropStaleIndexes();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
