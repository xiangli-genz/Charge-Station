import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/configs/db';
import ChargingConnectorType from '../src/models/ChargingConnectorType';
import Station from '../src/models/Station';

dotenv.config();

const run = async (): Promise<void> => {
  await connectDB();
  const connectorTypes = await ChargingConnectorType.find().sort({ shortName: 1 }).select('shortName name').lean();
  const values = connectorTypes.map((item) => item.shortName || item.name).filter(Boolean);
  const result = await Station.updateMany({}, { $set: { connectorTypes: values } });
  console.log(`Da cap nhat ${result.modifiedCount} tram voi ${values.length} loai cong sac.`);
};

run()
  .catch((error) => {
    console.error('Backfill loai cong sac cho tram that bai:', (error as Error).message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
