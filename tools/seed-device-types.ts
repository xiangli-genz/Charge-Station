import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/configs/db';
import DeviceType from '../src/models/DeviceType';

dotenv.config();

const deviceTypes = [
  {
    name: 'Trạm sạc xe máy điện',
    code: 'EV-MOTORBIKE',
    manufacturer: 'VinFast / Yadea / NIU',
    category: 'CHARGING_STATION',
    vehicleTypes: ['MOTORBIKE'],
    connectorTypes: ['VF-MOTO-AC', 'MOTO-AC', 'Wall'],
    currentTypes: ['AC'],
    protocols: ['OCPP 1.6J'],
    powerMinKw: 0.5,
    powerMaxKw: 3.3,
    description: 'Thiết bị quản lý và cấp điện cho xe máy điện.',
  },
  {
    name: 'Trạm sạc ô tô AC',
    code: 'EV-AC-CHARGE',
    manufacturer: 'ABB / Schneider / Delta',
    category: 'CHARGING_STATION',
    vehicleTypes: ['CAR'],
    connectorTypes: ['Type 2', 'J-1772', 'GB/T'],
    currentTypes: ['AC'],
    protocols: ['OCPP 1.6J', 'OCPP 2.0.1'],
    powerMinKw: 3.7,
    powerMaxKw: 22,
    description: 'Trạm sạc AC chậm và bán nhanh cho ô tô điện.',
  },
  {
    name: 'Trạm sạc ô tô DC nhanh',
    code: 'EV-DC-FAST',
    manufacturer: 'ABB / Delta / Siemens',
    category: 'CHARGING_STATION',
    vehicleTypes: ['CAR'],
    connectorTypes: ['CCS2', 'CHAdeMO', 'GB/T (Fast)'],
    currentTypes: ['DC'],
    protocols: ['OCPP 1.6J', 'OCPP 2.0.1'],
    powerMinKw: 30,
    powerMaxKw: 180,
    description: 'Trạm sạc DC nhanh dùng cho các tuyến giao thông và điểm dừng lớn.',
  },
  {
    name: 'Bộ điều khiển trạm sạc',
    code: 'EV-CHARGE-CONTROLLER',
    manufacturer: 'S.TOUCH',
    category: 'CONTROLLER',
    vehicleTypes: ['MOTORBIKE', 'CAR'],
    connectorTypes: [],
    currentTypes: [],
    protocols: ['OCPP 1.6J', 'MQTT', 'HTTPS'],
    powerMinKw: 0,
    powerMaxKw: 0,
    description: 'Thiết bị gateway/điều khiển kết nối các cổng sạc với backend.',
  },
];

const run = async (): Promise<void> => {
  await connectDB();
  const operations = deviceTypes.map((item) => ({
    updateOne: {
      filter: { code: item.code },
      update: { $set: item, $setOnInsert: { createdById: null } },
      upsert: true,
    },
  }));
  const result = await DeviceType.bulkWrite(operations);
  console.log(`Da seed ${deviceTypes.length} loai thiet bi (them ${result.upsertedCount}, cap nhat ${result.modifiedCount}).`);
};

run()
  .catch((error) => {
    console.error('Seed loai thiet bi that bai:', (error as Error).message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
