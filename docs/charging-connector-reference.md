# Tham chiếu loại cổng sạc tại Việt Nam

Các bản ghi trong `seed:connector-types` dùng cho prototype thị trường Hà Nội. `powerMinKw` và `powerMaxKw` là dải công suất tham khảo của thiết bị/cổng, không phải công suất xe luôn nhận được.

| Nhóm | Cổng tiêu biểu | Dòng điện | Phương tiện | Công suất tham khảo |
| --- | --- | --- | --- | ---: |
| Xe máy điện | Ổ cắm dân dụng, bộ sạc AC di động | AC | Xe máy | 0.5-3.3 kW |
| AC chậm | Type 2 / Mennekes, J-1772, Type 3 | AC | Ô tô | 3.7-22 kW |
| AC gia dụng | Wall Outlet, BS1363, Euro, 3112 | AC | Xe máy và ô tô | 1.8-7.4 kW |
| AC công suất cao | NEMA 14-50, Three Phase | AC | Ô tô | 7.4-22 kW |
| DC nhanh | CCS Combo 2 | DC | Ô tô | 30-180 kW |
| DC nhanh | CHAdeMO | DC | Ô tô | 25-100 kW |
| DC nhanh | GB/T (Fast), Tesla (Fast) | DC | Ô tô | 30-250 kW |

## Quy ước dữ liệu

- `currentType`: `AC`, `DC` hoặc `AC/DC`.
- `vehicleTypes`: `MOTORBIKE` và/hoặc `CAR`.
- `powerMinKw`, `powerMaxKw`: dải công suất danh định, đơn vị kW.
- Cổng Type 2, CCS2 và GB/T là các nhóm cần ưu tiên khi mở rộng dữ liệu trạm sạc tại Hà Nội.
- CHAdeMO, J-1772 và Tesla được giữ để hỗ trợ xe nhập khẩu và dữ liệu lịch sử.

Khi có dữ liệu thực tế từ nhà vận hành, cần thay dải tham khảo bằng công suất định mức của từng đầu sạc (`ChargingPoint.powerKw`).
