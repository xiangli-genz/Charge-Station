# Thiết kế hệ thống quản lý trạm sạc

## 1. Kiến trúc đề xuất

```text
Web client / Admin web / Mobile app
              |
        REST API + Auth
              |
  Station, Charging Point, Booking, Session
              |
 MongoDB + Redis (cache/job) + Object Storage
              |
 Telemetry/OCPP gateway -> dữ liệu đo và trạng thái thiết bị
              |
 Analytics/GNN service -> nhu cầu, chiếm dụng, quy hoạch vị trí
```

Backend TypeScript hiện tại nên giữ vai trò API nghiệp vụ. Mô hình GNN và các tác vụ dự báo nên chạy thành worker/service riêng, sau đó ghi kết quả về các bảng `forecast_runs` và `location_recommendations`.

## 2. Các module nghiệp vụ

| Module | Trách nhiệm |
| --- | --- |
| Identity & RBAC | Đăng nhập, token, nhóm quyền admin/operator/customer, audit log |
| Station registry | Trạm, vị trí, thiết bị, loại cổng, giờ hoạt động, tiện ích |
| Charging point | Mã cổng, loại cổng, công suất, trạng thái, bảng giá |
| Operations | Booking, charging session, trạng thái realtime, lỗi thiết bị |
| Billing | Giá điện, phí theo thời gian, hóa đơn, giao dịch, hoàn tiền |
| Notifications | Nhắc lịch, cổng sạc sẵn sàng, lỗi, thông báo hệ thống |
| Data platform | Telemetry, occupancy, ETL, dữ liệu tổng hợp theo giờ/ngày |
| ML/GNN | Dự báo nhu cầu/chiếm dụng và đề xuất vị trí trạm |

## 3. Bổ sung cho “Loại thiết bị”

Danh mục không chỉ có tên và mã. Các trường đã bổ sung:

- `category`: `CHARGING_STATION`, `CONTROLLER`, `METER`, `GATEWAY`...
- `vehicleTypes`: `MOTORBIKE`, `CAR`.
- `connectorTypes`: các mã cổng mà thiết bị hỗ trợ.
- `currentTypes`: `AC`, `DC`, `AC/DC`.
- `protocols`: `OCPP 1.6J`, `OCPP 2.0.1`, `MQTT`, `HTTPS`...
- `powerMinKw`, `powerMaxKw`.
- `active` để ngừng dùng một loại thiết bị mà không xóa lịch sử.

Các bản mẫu được seed bằng `npm run seed:device-types`.

## 4. Những phần backend cần hoàn thiện

### Ưu tiên 1: vận hành đúng dữ liệu

- Thêm transaction khi tạo trạm kèm nhiều cổng và khi hủy booking.
- Ràng buộc không cho xóa loại cổng/thiết bị đang được tham chiếu; chuyển sang `active=false`.
- Chuẩn hóa phân trang, lọc, sắp xếp cho tất cả API danh sách.
- Thêm `GET /health` và `GET /ready` kiểm tra MongoDB.
- Chuẩn hóa lỗi API về một format có `code`, `message`, `details`, `requestId`.
- Bổ sung kiểm thử service cho station, charging point, booking và session.

### Ưu tiên 2: dữ liệu vận hành

- Thêm `charging_point_status_history` hoặc collection tương đương để lưu lịch sử trạng thái.
- Thêm telemetry: công suất tức thời, điện năng, điện áp, dòng điện, nhiệt độ, thời điểm đo.
- Thêm heartbeat và mã lỗi thiết bị.
- Tách trạng thái hiện tại khỏi lịch sử để dashboard đọc nhanh.
- Thêm job dọn dữ liệu telemetry và tổng hợp theo 15 phút/giờ/ngày.

### Ưu tiên 3: thanh toán và người dùng

- Tách `payment_intent`, `transaction`, `invoice` và trạng thái webhook.
- Idempotency key cho booking, bắt đầu phiên sạc và thanh toán.
- Chính sách hủy/hoàn tiền rõ ràng.
- Thông báo qua email/SMS/push theo sự kiện.

### Ưu tiên 4: ML/GNN

- ETL dữ liệu trạm, nhu cầu, giao thông, dân số, POI và thời tiết theo khu vực Hà Nội.
- Lưu phiên bản dataset, feature snapshot và model version.
- API dự báo occupancy theo trạm/khung giờ.
- API đề xuất vị trí mới kèm điểm số, bán kính phục vụ và lý do.
- Lưu kết quả dự báo để tái lập, không tính lại trực tiếp trong request web.

## 5. Nguyên tắc dữ liệu

- Không xóa cứng dữ liệu đã phát sinh booking/session/giao dịch.
- Mọi thời gian lưu UTC; frontend đổi sang múi giờ Việt Nam.
- Dùng mã ổn định cho loại cổng, loại thiết bị và trạng thái.
- Dữ liệu mô phỏng phải có cờ `isSynthetic` và nguồn dữ liệu.
- Công suất loại cổng là dải tham khảo; công suất đầu cổng thực tế nằm ở `ChargingPoint.powerKw`.

## 6. Thứ tự triển khai đề xuất

1. Hoàn thiện station/charging point và trạng thái realtime.
2. Hoàn thiện booking/session với transaction và idempotency.
3. Bổ sung telemetry, ETL và dashboard vận hành.
4. Bổ sung thanh toán/thông báo.
5. Tích hợp service dự báo occupancy.
6. Tích hợp GNN đề xuất vị trí và trang giải thích kết quả.
