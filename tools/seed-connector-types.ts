import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/configs/db';
import ChargingConnectorType from '../src/models/ChargingConnectorType';

dotenv.config();

type ConnectorSeed = {
  name: string;
  shortName: string;
  chargingType: string;
  currentType: 'AC' | 'DC' | 'AC/DC';
  vehicleTypes: ('MOTORBIKE' | 'CAR')[];
  powerMinKw: number;
  powerMaxKw: number;
  description: string;
};

const connectorTypes: ConnectorSeed[] = [
  ['VinFast Motorcycle AC', 'VF-MOTO-AC', 'Xe máy điện', 'AC', ['MOTORBIKE'], 0.7, 3.3],
  ['Motorcycle Portable AC', 'MOTO-AC', 'Xe máy điện', 'AC', ['MOTORBIKE'], 0.5, 1.8],
  ['Caravan Mains Socket', 'Caravan', 'Ô tô điện', 'AC', ['CAR'], 2.3, 3.6],
  ['Type 3A', 'Type 3A', 'Ô tô điện', 'AC', ['CAR'], 3.7, 22],
  ['NEMA TT-30', 'NEMA TT-30', 'Ô tô điện', 'AC', ['CAR'], 3.6, 3.6],
  ['Wall Outlet (3112)', 'Wall (AU/NZ)', 'Xe máy điện', 'AC', ['MOTORBIKE', 'CAR'], 1.8, 7.4],
  ['Wall Outlet (Euro)', 'Wall (Euro)', 'Xe máy điện', 'AC', ['MOTORBIKE', 'CAR'], 2.3, 3.7],
  ['Wall Outlet (BS1363)', 'Wall (BS1363)', 'Xe máy điện', 'AC', ['MOTORBIKE', 'CAR'], 1.8, 3.6],
  ['Wall Outlet', 'Wall', 'Xe máy điện', 'AC', ['MOTORBIKE', 'CAR'], 1.8, 3.6],
  ['NEMA 14-50', 'NEMA 14-50', 'Ô tô điện', 'AC', ['CAR'], 7.4, 11],
  ['GB/T (Fast)', 'GB/T (Fast)', 'Ô tô điện', 'DC', ['CAR'], 30, 250],
  ['GB/T', 'GB/T', 'Ô tô điện', 'AC/DC', ['CAR'], 7, 22],
  ['Tesla (Fast)', 'Tesla (Fast)', 'Ô tô điện', 'DC', ['CAR'], 50, 250],
  ['Three Phase', 'Three Phase', 'Ô tô điện', 'AC', ['CAR'], 11, 22],
  ['EV Plug (Type 3)', 'Type 3', 'Ô tô điện', 'AC', ['CAR'], 3.7, 22],
  ['Mennekes (Type 2)', 'Type 2', 'Ô tô điện', 'AC', ['CAR'], 3.7, 22],
  ['Tesla (Roadster)', 'Tesla (Roadster)', 'Ô tô điện', 'AC', ['CAR'], 3.7, 16.5],
  ['CCS Combo 2', 'CCS2', 'Ô tô điện', 'DC', ['CAR'], 30, 180],
  ['CHAdeMO', 'CHAdeMO', 'Ô tô điện', 'DC', ['CAR'], 25, 100],
  ['SAE J1772', 'J-1772', 'Ô tô điện', 'AC', ['CAR'], 3.7, 19.2],
].map(([name, shortName, chargingType, currentType, vehicleTypes, powerMinKw, powerMaxKw]) => ({
  name,
  shortName,
  chargingType,
  currentType: currentType as ConnectorSeed['currentType'],
  vehicleTypes: vehicleTypes as ConnectorSeed['vehicleTypes'],
  powerMinKw: powerMinKw as number,
  powerMaxKw: powerMaxKw as number,
  description: `Loại cổng sạc ${name} dùng cho hệ thống quản lý trạm sạc.`,
}));

const seed = async (): Promise<void> => {
  await connectDB();

  const operations = connectorTypes.map((connector) => ({
    updateOne: {
      filter: { shortName: connector.shortName },
      update: {
        $set: connector,
        $setOnInsert: { createdById: null },
      },
      upsert: true,
    },
  }));

  const result = await ChargingConnectorType.bulkWrite(operations);
  console.log(
    `Da seed ${connectorTypes.length} loai cong sac (them ${result.upsertedCount}, cap nhat ${result.modifiedCount}).`
  );
};

seed()
  .catch((error) => {
    console.error('Seed loai cong sac that bai:', (error as Error).message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
