import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Station from '../src/models/Station';
import ChargingPoint from '../src/models/ChargingPoint';
import Pricing from '../src/models/Pricing';

dotenv.config();

type StationSeed = {
  district: string;
  address: string;
  lat: number;
  lng: number;
  points: number;
};

// Coordinates and names are synthetic research data for the Hanoi prototype.
const stations: StationSeed[] = [
  { district: 'Hoan Kiem', address: 'Pho Ly Thai To, Hoan Kiem, Ha Noi', lat: 21.0278, lng: 105.8524, points: 3 },
  { district: 'Ba Dinh', address: 'Pho Nguyen Chi Thanh, Ba Dinh, Ha Noi', lat: 21.0307, lng: 105.8142, points: 3 },
  { district: 'Dong Da', address: 'Pho Thai Ha, Dong Da, Ha Noi', lat: 21.0111, lng: 105.8206, points: 3 },
  { district: 'Cau Giay', address: 'Duong Tran Thai Tong, Cau Giay, Ha Noi', lat: 21.0368, lng: 105.7932, points: 3 },
  { district: 'Thanh Xuan', address: 'Duong Nguyen Trai, Thanh Xuan, Ha Noi', lat: 20.9957, lng: 105.8107, points: 3 },
  { district: 'Hai Ba Trung', address: 'Pho Bach Mai, Hai Ba Trung, Ha Noi', lat: 20.9986, lng: 105.8472, points: 3 },
  { district: 'Long Bien', address: 'Duong Nguyen Van Cu, Long Bien, Ha Noi', lat: 21.0437, lng: 105.8796, points: 3 },
  { district: 'Tay Ho', address: 'Duong Lac Long Quan, Tay Ho, Ha Noi', lat: 21.0678, lng: 105.8112, points: 3 },
  { district: 'Nam Tu Liem', address: 'Duong Pham Hung, Nam Tu Liem, Ha Noi', lat: 21.0179, lng: 105.7788, points: 3 },
  { district: 'Bac Tu Liem', address: 'Duong Pham Van Dong, Bac Tu Liem, Ha Noi', lat: 21.0662, lng: 105.7828, points: 3 },
  { district: 'Ha Dong', address: 'Duong To Hieu, Ha Dong, Ha Noi', lat: 20.9711, lng: 105.7787, points: 3 },
  { district: 'Hoang Mai', address: 'Duong Giai Phong, Hoang Mai, Ha Noi', lat: 20.9828, lng: 105.8412, points: 3 },
  { district: 'Gia Lam', address: 'Duong Nguyen Duc Thuan, Gia Lam, Ha Noi', lat: 21.0119, lng: 105.9414, points: 2 },
  { district: 'Soc Son', address: 'Khu vuc Noi Bai, Soc Son, Ha Noi', lat: 21.2187, lng: 105.8042, points: 2 },
  { district: 'Dong Anh', address: 'Duong Co Loa, Dong Anh, Ha Noi', lat: 21.1376, lng: 105.8442, points: 2 },
  { district: 'Thanh Tri', address: 'Duong Ngoc Hoi, Thanh Tri, Ha Noi', lat: 20.9442, lng: 105.8419, points: 2 },
  { district: 'Hoai Duc', address: 'Duong Dai Lo Thang Long, Hoai Duc, Ha Noi', lat: 21.0143, lng: 105.7166, points: 2 },
  { district: 'Dan Phuong', address: 'Thi tran Phung, Dan Phuong, Ha Noi', lat: 21.0913, lng: 105.6633, points: 2 },
  { district: 'Phu Xuyen', address: 'Thi tran Phu Xuyen, Ha Noi', lat: 20.7355, lng: 105.9116, points: 2 },
  { district: 'Son Tay', address: 'Duong Quang Trung, Son Tay, Ha Noi', lat: 21.1377, lng: 105.5048, points: 2 },
];

async function main(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI chưa được cấu hình trong .env');

  await mongoose.connect(mongoUri);
  const pricing = await Pricing.findOneAndUpdate(
    { name: 'HN Demo - Gia tieu chuan' },
    {
      $setOnInsert: {
        name: 'HN Demo - Gia tieu chuan',
        pricePerKwh: 3500,
        pricePerMinute: 100,
        hourlyPrice: 0,
        parkingFee: 0,
        vat: 10,
        description: 'Bảng giá giả lập dùng cho nghiên cứu hệ thống Hà Nội',
      },
    },
    { upsert: true, new: true }
  );

  let createdStations = 0;
  let createdPoints = 0;
  for (const [stationIndex, seed] of stations.entries()) {
    const name = `HN Demo - ${seed.district}`;
    let station = await Station.findOne({ name });
    if (!station) {
      station = await Station.create({
        name,
        address: seed.address,
        city: 'Ha Noi',
        district: seed.district,
        description: 'Trạm giả lập phục vụ phát triển và đánh giá mô hình quy hoạch trạm sạc.',
        location: { lat: seed.lat, lng: seed.lng },
        status: 'active',
        chargingType: 'AC va DC',
        currentType: 'AC/DC',
        isActivated: true,
        activatedAt: new Date(),
        open24_7: true,
        amenities: ['Wifi', 'Camera', 'Mai che'],
        supportPhone: '1900 0000',
      });
      createdStations += 1;
    }

    for (let index = 1; index <= seed.points; index += 1) {
      const code = `HN-${String(stationIndex + 1).padStart(2, '0')}-P${index}`;
      const exists = await ChargingPoint.exists({ code });
      if (exists) continue;
      await ChargingPoint.create({
        station: station._id,
        pricing: pricing._id,
        code,
        connectorType: index === 1 ? 'CCS2' : index === 2 ? 'AC_Type2' : 'CHAdeMO',
        outputCurrentType: index === 1 ? 'DC' : 'AC',
        inputSupply: '3 pha 380V',
        maxOutputCurrentA: index === 1 ? 200 : 32,
        description: `Cổng sạc ${index} - dữ liệu giả lập`,
        powerKw: index === 1 ? 60 : 22,
        maxOutputVoltage: index === 1 ? '500V' : '400V',
        multiPortEnabled: false,
        positionLabel: `Vi tri ${index}`,
        status: 'available',
      });
      createdPoints += 1;
    }
  }

  const totalStations = await Station.countDocuments({ city: 'Ha Noi' });
  const totalPoints = await ChargingPoint.countDocuments({});
  console.log(`Đã thêm ${createdStations} trạm và ${createdPoints} điểm sạc.`);
  console.log(`Tổng hiện tại: ${totalStations} trạm Hà Nội, ${totalPoints} điểm sạc.`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed dữ liệu thất bại:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
