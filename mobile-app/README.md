# Tram Sac Mobile App

Mobile app React Native + TypeScript + Expo cho dự án `tram-sac-api-ts`.

## Trạng thái hiện tại

Mobile app đã được nối trực tiếp với backend hiện có trong repo này, gồm:

- `POST /api/app/auth/login`
- `POST /api/app/auth/register`
- `GET /api/app/auth/me`
- `GET /api/app/profile`
- `PATCH /api/app/profile`
- `GET /api/stations`
- `GET /api/app/favorites`
- `POST /api/app/favorites`
- `DELETE /api/app/favorites/:stationId`
- `GET /api/app/bookings`
- `POST /api/app/bookings`
- `PATCH /api/app/bookings/:id/cancel`
- `GET /api/app/activity-logs`

## Màn hình đã có

- Đăng nhập
- Đăng ký
- Trang chủ
- Danh sách trạm sạc
- Chi tiết trạm sạc
- Đặt lịch sạc từ chi tiết trạm
- Lịch sử booking
- Trạm yêu thích
- Lịch sử hoạt động
- Hồ sơ cá nhân

## Cấu hình API

Mặc định app dùng:

- Android emulator: `http://10.0.2.2:5000`
- iOS simulator: `http://localhost:5000`

Nếu chạy trên máy thật, cấu hình:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://<ip-may-ban>:5000"
```

## Chạy app

```powershell
cd mobile-app
cmd /c npm install
cmd /c npm run start
```

## Ghi chú kỹ thuật

- Token đăng nhập được lưu bằng `expo-secure-store`
- API state dùng `@tanstack/react-query`
- Session local dùng `zustand`
- Chi tiết trạm hiện dùng dữ liệu đi từ danh sách vì backend chưa có `GET /api/stations/:id`
- Upload ảnh và realtime chưa được nối trong mobile app hiện tại
