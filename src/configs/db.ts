import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI as string;
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB da ket noi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Loi ket noi MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
