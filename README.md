# Tram Sac API (TypeScript)

Backend cho khoa luan he thong quan ly tram sac xe dien (Node.js + Express + MongoDB + TypeScript).

## Cai dat

```bash
npm install
cp .env.example .env
# sua MONGO_URI trong .env cho phu hop (local hoac MongoDB Atlas)
npm run dev
```

cd "D:\My_project\PJ_Trạm_sạc\tram-sac-api-ts"
cmd /c npm run dev

cd "D:\My_project\PJ_Trạm_sạc\tram-sac-api-ts\mobile-app"
cmd /c npx expo start -c

Server chay tai `http://localhost:5000`, kiem tra bang `GET /api/health`.

API auth admin co san tai `POST /api/admin/auth/register`, `POST /api/admin/auth/login`, `GET /api/admin/auth/me`.
Tai khoan superadmin dung `SUPERADMIN_EMAIL` va `SUPERADMIN_PASSWORD` trong `.env`, dang nhap chung qua `POST /api/admin/auth/login`.
API superadmin cho quan ly staff co san tai `POST /api/superadmin/auth/login`, `GET /api/superadmin/auth/me`, `GET/POST /api/superadmin/staff` va `PATCH /api/superadmin/staff/:id/role`.
API tim kiem tram sac co san tai `GET /api/stations`.
API tim kiem tram doi pin co san tai `GET /api/swap-stations`, `GET /api/swap-stations/nearby`.
API CRUD admin co san tai `GET/POST/PATCH/DELETE /api/admin/stations`, `GET/POST/PATCH/DELETE /api/admin/charging-points`, `GET/POST/PATCH/DELETE /api/admin/swap-stations` va `GET/POST/PATCH/DELETE /api/admin/pricings`.
API booking admin co san tai `GET/POST/PATCH/DELETE /api/admin/bookings`.
API import du lieu co san tai `POST /api/admin/stations/import`, `POST /api/admin/swap-stations/import`, `POST /api/admin/pricings/import`, `POST /api/admin/charging-points/import`.
Trang `GET /`, `GET /login`, `GET /register`, `GET /dashboard`, `GET /admin-tools`, `GET /admin-import-tools` va `GET /admin-editor` co san cho giao dien Pug.

Trang chu `/` hien thi ban do tim tram sac, tram doi pin va dung `LOCATIONIQ_API_KEY` trong `.env` de tai nen ban do LocationIQ.

Cac lenh khac:
- `npm run build` - bien dich TypeScript sang JavaScript (thu muc `dist/`)
- `npm start` - chay ban da bien dich (dung khi deploy)

## API tim kiem tram sac

Endpoint:

```http
GET /api/stations
```

Query parameters ho tro:
- `keyword`: tim theo ten tram hoac dia chi
- `status`: `active | inactive | maintenance`
- `connectorType`: `AC_Type2 | CCS2 | CHAdeMO | GB_T`
- `minPowerKw`, `maxPowerKw`: loc theo cong suat cong sac
- `availableOnly=true`: chi lay tram con cong kha dung
- `page`, `limit`: phan trang

Vi du:

```http
GET /api/stations?keyword=quan+1&connectorType=CCS2&availableOnly=true&page=1&limit=12
```

Phan hoi tra ve gom:
- thong tin tram (`name`, `address`, `location`, `status`)
- `totalChargingPoints`
- `availableChargingPoints`
- `matchingChargingPoints`: danh sach cong sac dung voi bo loc
- `pagination`

## API tim kiem tram doi pin

Endpoint:

```http
GET /api/swap-stations
GET /api/swap-stations/nearby
```

Query parameters ho tro:
- `keyword`: tim theo ten tram hoac dia chi
- `provider`: nha cung cap, vi du `VinFast`
- `supportedVehicleModel`: loc theo dong xe ho tro
- `status`: `active | inactive | maintenance`
- `availableOnly=true`: chi lay tram con pin kha dung
- `lat`, `lng`: toa do nguoi dung de tinh khoang cach
- `radiusKm`: ban kinh tim kiem, huu ich cho endpoint `nearby`
- `page`, `limit`: phan trang

Vi du:

```http
GET /api/swap-stations/nearby?provider=VinFast&lat=10.7769&lng=106.7009&radiusKm=5&availableOnly=true
```

Phan hoi tra ve gom:
- thong tin tram doi pin (`name`, `address`, `provider`, `supportedVehicleModels`)
- `totalBatterySlots`
- `availableBatterySlots`
- `distanceKm` neu co truyen `lat/lng`
- `pagination`

## API auth admin

Can cau hinh them trong `.env`:

```env
ADMIN_REGISTER_SECRET=ma_bi_mat_de_tao_tai_khoan_admin
SUPERADMIN_EMAIL=superadmin@example.com
SUPERADMIN_PASSWORD=doi_mat_khau_superadmin_khi_deploy
```

Dang ky admin:

```http
POST /api/admin/auth/register
Content-Type: application/json
```

```json
{
  "fullName": "Admin Tong",
  "phone": "0901234567",
  "email": "admin@example.com",
  "password": "123456",
  "adminRegisterSecret": "ma_bi_mat_de_tao_tai_khoan_admin"
}
```

Dang nhap admin:

```http
POST /api/admin/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

Lay thong tin admin dang dang nhap:

```http
GET /api/admin/auth/me
Authorization: Bearer <JWT_TOKEN>
```

Luot auth nay dang phu hop cho giai doan khoi tao admin panel. Ve sau, khi deploy that,
ban nen tat route `register` cong khai va chuyen sang seed admin hoac chi cho super-admin tao them admin.

## API superadmin

Superadmin la tai khoan he thong duoc cau hinh truc tiep trong `.env`, khong tao qua giao dien va khong luu password trong MongoDB.

Dang nhap superadmin:

```http
POST /api/superadmin/auth/login
Content-Type: application/json
```

```json
{
  "email": "gia tri SUPERADMIN_EMAIL trong .env",
  "password": "gia tri SUPERADMIN_PASSWORD trong .env"
}
```

Quan ly staff:

```http
GET   /api/superadmin/staff
POST  /api/superadmin/staff
PATCH /api/superadmin/staff/:id/role
Authorization: Bearer <JWT_TOKEN>
```

Tai khoan superadmin dang nhap tai `GET /login` va sau do su dung chung `GET /dashboard`.

## API CRUD admin

Tat ca route duoi day deu can header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Quan ly tram sac:

```http
GET    /api/admin/stations
GET    /api/admin/stations/:id
POST   /api/admin/stations
PATCH  /api/admin/stations/:id
DELETE /api/admin/stations/:id
```

Body tao/cap nhat tram:

```json
{
  "name": "Tram Sac Quan 1",
  "address": "123 Le Loi, Quan 1, TP.HCM",
  "location": {
    "lat": 10.7769,
    "lng": 106.7009
  },
  "status": "active"
}
```

Quan ly cong sac:

```http
GET    /api/admin/charging-points
GET    /api/admin/charging-points/:id
POST   /api/admin/charging-points
PATCH  /api/admin/charging-points/:id
DELETE /api/admin/charging-points/:id
```

Body tao/cap nhat cong sac:

```json
{
  "stationId": "66b000000000000000000001",
  "pricingId": "66b000000000000000000002",
  "code": "Q1-CP-01",
  "connectorType": "CCS2",
  "powerKw": 120,
  "status": "available"
}
```

Route danh sach cong sac ho tro loc theo `stationId`, `status`, `connectorType`, `page`, `limit`.
Route danh sach tram ho tro loc theo `keyword`, `status`, `page`, `limit`.

Quan ly bang gia:

```http
GET    /api/admin/pricings
GET    /api/admin/pricings/:id
POST   /api/admin/pricings
PATCH  /api/admin/pricings/:id
DELETE /api/admin/pricings/:id
```

Body tao/cap nhat bang gia:

```json
{
  "name": "Gia nhanh",
  "pricePerKwh": 4200,
  "pricePerMinute": 150
}
```

Quan ly booking:

```http
GET    /api/admin/bookings
GET    /api/admin/bookings/:id
POST   /api/admin/bookings
PATCH  /api/admin/bookings/:id
DELETE /api/admin/bookings/:id
```

Body tao booking:

```json
{
  "chargingPointId": "66b000000000000000000003",
  "startTime": "2026-08-05T09:00:00.000Z",
  "endTime": "2026-08-05T10:30:00.000Z",
  "status": "pending",
  "customer": {
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "email": "customer@example.com"
  }
}
```

Hoac neu customer da co san:

```json
{
  "userId": "66b000000000000000000099",
  "chargingPointId": "66b000000000000000000003",
  "startTime": "2026-08-05T09:00:00.000Z",
  "endTime": "2026-08-05T10:30:00.000Z",
  "status": "confirmed"
}
```

Booking se:
- tu dong kiem tra trung lich tren cung mot cong sac
- tu dong tao hoac tai su dung tai khoan `customer` theo email/so dien thoai
- tu choi booking neu cong sac dang `maintenance`

Import tram sac:

```http
POST /api/admin/stations/import
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Body JSON:

```json
{
  "format": "json",
  "mode": "upsert",
  "items": [
    {
      "name": "Tram Sac Quan 1",
      "address": "123 Le Loi, Quan 1, TP.HCM",
      "location": { "lat": 10.7769, "lng": 106.7009 },
      "status": "active"
    }
  ]
}
```

Hoac body CSV:

```json
{
  "format": "csv",
  "mode": "upsert",
  "content": "name,address,lat,lng,status\nTram Sac Quan 1,\"123 Le Loi, Quan 1, TP.HCM\",10.7769,106.7009,active"
}
```

Import bang gia:

```http
POST /api/admin/pricings/import
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Body JSON:

```json
{
  "format": "json",
  "mode": "upsert",
  "items": [
    {
      "name": "Gia nhanh",
      "pricePerKwh": 4200,
      "pricePerMinute": 150
    }
  ]
}
```

Hoac body CSV:

```json
{
  "format": "csv",
  "mode": "upsert",
  "content": "name,pricePerKwh,pricePerMinute\nGia nhanh,4200,150"
}
```

Import cong sac:

```http
POST /api/admin/charging-points/import
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Body JSON:

```json
{
  "format": "json",
  "mode": "upsert",
  "items": [
    {
      "code": "Q1-CP-01",
      "stationName": "Tram Sac Quan 1",
      "stationAddress": "123 Le Loi, Quan 1, TP.HCM",
      "pricingName": "Gia nhanh",
      "connectorType": "CCS2",
      "powerKw": 120,
      "status": "available"
    }
  ]
}
```

Hoac body CSV:

```json
{
  "format": "csv",
  "mode": "upsert",
  "content": "code,stationName,stationAddress,pricingName,connectorType,powerKw,status\nQ1-CP-01,Tram Sac Quan 1,\"123 Le Loi, Quan 1, TP.HCM\",Gia nhanh,CCS2,120,available"
}
```

Quan ly tram doi pin:

```http
GET    /api/admin/swap-stations
GET    /api/admin/swap-stations/:id
POST   /api/admin/swap-stations
PATCH  /api/admin/swap-stations/:id
DELETE /api/admin/swap-stations/:id
```

Body tao/cap nhat tram doi pin:

```json
{
  "name": "Tu doi pin VinFast Quan 1",
  "address": "45 Nguyen Hue, Quan 1, TP.HCM",
  "provider": "VinFast",
  "supportedVehicleModels": ["Evo200", "Feliz S"],
  "location": {
    "lat": 10.7731,
    "lng": 106.7044
  },
  "totalBatterySlots": 20,
  "availableBatterySlots": 12,
  "status": "active"
}
```

Route danh sach tram doi pin ho tro loc theo `keyword`, `provider`, `status`, `page`, `limit`.

## Frontend admin tools

Mo trang:

```http
GET /admin-tools
```

Trang nay cho phep:
- su dung phien admin da dang nhap tu `/dashboard`
- xem danh sach theo tung module
- tim kiem nhanh
- tao moi va sua du lieu tai trang `GET /admin-editor`
- xoa ban ghi sau khi xac nhan
- quan ly `pricings`, `stations`, `swap-stations`, `charging-points` va `bookings`

Mo cong cu import rieng:

```http
GET /admin-import-tools
```

Trang nay cho phep:
- su dung phien admin da dang nhap tu `/dashboard`
- chon loai du lieu can import
- chon file CSV/JSON va xem truoc noi dung
- gui du lieu len API import
- xem ket qua tao moi, cap nhat, bo qua va danh sach loi

Thu muc file mau de test nhanh:
- `samples/stations-import.csv`
- `samples/stations-import.json`
- `samples/swap-stations-import.csv`
- `samples/swap-stations-import.json`
- `samples/pricings-import.csv`
- `samples/pricings-import.json`
- `samples/charging-points-import.csv`
- `samples/charging-points-import.json`

Import tram doi pin:

```http
POST /api/admin/swap-stations/import
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

Body JSON:

```json
{
  "format": "json",
  "mode": "upsert",
  "items": [
    {
      "name": "Tu doi pin VinFast Quan 1",
      "address": "45 Nguyen Hue, Quan 1, TP.HCM",
      "provider": "VinFast",
      "supportedVehicleModels": ["Evo200", "Feliz S"],
      "location": { "lat": 10.7731, "lng": 106.7044 },
      "totalBatterySlots": 20,
      "availableBatterySlots": 12,
      "status": "active"
    }
  ]
}
```

Hoac body CSV:

```json
{
  "format": "csv",
  "mode": "upsert",
  "content": "name,address,provider,supportedVehicleModels,totalBatterySlots,availableBatterySlots,lat,lng,status\nTu doi pin VinFast Quan 1,\"45 Nguyen Hue, Quan 1, TP.HCM\",VinFast,\"Evo200|Feliz S\",20,12,10.7731,106.7044,active"
}
```

## Cau truc thu muc

```
views/
  layouts/
    main.pug
  pages/
    home.pug
    login.pug
    register.pug
    dashboard.pug
    admin-tools.pug
    admin-import-tools.pug
    admin-editor.pug
public/
  css/
    site.css
    admin-import.css
  js/
    login.js
    register.js
    dashboard.js
    admin-import.js
    admin-import-tools.js
src/
  config/       # ket noi DB, bien moi truong
  models/       # Mongoose schema + interface (User, Station, ChargingPoint, Booking, ChargingSession, Transaction, Pricing)
  controllers/  # xu ly logic cho tung route
  routes/       # dinh nghia API endpoint
  services/     # logic nghiep vu tach rieng khoi controller
  middlewares/  # auth, validate, error handler
  utils/        # ham dung chung
  types/        # cac type/interface dung chung (vd: AuthRequest)
  server.ts     # diem khoi dong app
```

## Diem khac biet so voi ban JavaScript
- Moi model co them 1 `interface` (vd `IUser`, `IStation`) de co type-safety khi
  query du lieu (`User.findById(id)` se tra ve `IUser | null` thay vi `any`)
- File `src/types/express.d.ts` dinh nghia san `AuthRequest` (mo rong tu
  `express.Request`) de dung cho middleware xac thuc JWT - gan `req.user`
  sau khi verify token ma van co type-check
- `tsconfig.json` bat `strict: true` - bat buoc khai bao kieu du lieu ro rang,
  giup phat hien loi som luc code thay vi luc chay

## Buoc tiep theo (theo dung thu tu nen lam)

1. **Station & ChargingPoint CRUD** - API cho admin quan ly tram/cong sac
2. **Booking** - API dat lich, kiem tra trung lich cho cung 1 cong sac
3. **Charging Session** - bat dau/ket thuc phien sac, tinh kwh tieu thu
4. **Transaction** - nap tien vao vi, tru tien khi sac xong
   (luu y dung `mongoose session/transaction` de dam bao khong bi lech so du)
5. **Bao cao** - dung aggregation pipeline (`$lookup`, `$group`) de thong ke doanh thu

## Luu y ve tinh toan ven du lieu vi dien tu
Khi tru tien vi (Transaction) va cap nhat ChargingSession, hai thao tac nay
phai nam trong cung 1 mongoose transaction de tranh truong hop loi giua chung
lam lech so du. Vi du:

```ts
import mongoose from 'mongoose';

const session = await mongoose.startSession();
session.startTransaction();
try {
  // cap nhat ChargingSession va tru User.walletBalance trong cung session
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```
#   C h a r g e h u b 
 
 