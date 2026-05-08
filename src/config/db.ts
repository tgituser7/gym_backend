import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');
  } catch (err) {
    process.exit(1);
  }
};

export default connectDB;
