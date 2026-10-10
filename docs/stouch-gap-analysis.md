# Đối chiếu HDSD S.TOUCH với backend hiện tại

Tài liệu `HDSD - STOUCH.docx` mô tả các nghiệp vụ mà dự án chính cần ưu tiên:

- Trạm có trạng thái sẵn sàng, đầy, bảo trì, chưa hoạt động và đóng cửa.
- Cổng sạc có trạng thái riêng; người dùng tìm theo loại cổng, công suất, giá và bán kính.
- Booking đi qua các trạng thái đặt, đang sạc, hoàn thành, hủy và quá hạn.
- Bắt đầu sạc bằng QR tại trạm/cổng; kết thúc sạc ghi kWh và trừ số dư.
- Có lịch sử tiêu thụ điện, số tiền, doanh thu theo trạm/cổng/người dùng.
- Có RFID, nạp tiền QR/chuyển khoản, thông báo giao dịch và cảnh báo bảo trì.
- Quản trị cần nhập/xuất dữ liệu và phân quyền theo cây tài khoản.

## Đối chiếu

Backend hiện tại đã có trạm, cổng, booking, charging session, bảng giá, người dùng, phân quyền và dữ liệu occupancy. Các phần vừa bổ sung là transaction tạo trạm/cổng, telemetry, heartbeat, lỗi thiết bị, lịch sử trạng thái, idempotency, invoice và refund.

Các khoảng trống còn lại cần làm sau:

1. Thêm trạng thái `expired` cho booking và job tự động chuyển booking quá hạn.
2. Thêm QR token cho station/charging point và API check-in bắt đầu sạc.
3. Thêm RFID card, liên kết thẻ với user và khóa/mở thẻ.
4. Thêm wallet top-up qua QR/webhook ngân hàng; không xác nhận nạp tiền chỉ từ ảnh QR.
5. Thêm notification và notification preferences.
6. Thêm báo cáo số dư, điện năng, doanh thu theo kỳ/trạm/cổng/người dùng.
7. Tách quyền operator/owner/state-auditor, vì tài liệu S.TOUCH có quản trị theo cây tài khoản.

Các trạng thái và nghiệp vụ trên nên dùng event/audit log để truy vết thay vì cập nhật trực tiếp không lưu lịch sử.
