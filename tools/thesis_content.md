[[TITLE]]ĐỒ ÁN TỐT NGHIỆP KỸ SƯ
[[CENTER]]Hệ thống web hỗ trợ dự đoán và đề xuất vị trí đặt trạm sạc xe điện bằng Graph Neural Network
[[CENTER]]Đề cương sơ bộ phục vụ trao đổi với giảng viên hướng dẫn

[[CENTER]]Sinh viên thực hiện: ..............................................................
[[CENTER]]Giảng viên hướng dẫn: ...........................................................
[[CENTER]]Năm học: 2026

[[PAGEBREAK]]

## 1. Tên đề tài

Hệ thống web hỗ trợ dự đoán và đề xuất vị trí đặt trạm sạc xe điện bằng Graph Neural Network.

## 2. Lý do chọn đề tài

Trong bối cảnh xe điện đang phát triển nhanh, nhu cầu xây dựng hạ tầng trạm sạc phù hợp về vị trí, mật độ và công suất ngày càng trở nên cấp thiết. Tuy nhiên, việc lựa chọn vị trí đặt trạm hiện nay thường dựa nhiều vào kinh nghiệm, khảo sát thủ công hoặc các tiêu chí rời rạc, nên khó đảm bảo tính tối ưu và khả năng mở rộng theo quy hoạch đô thị.

Đề tài này hướng tới việc kết hợp web app, cơ sở dữ liệu không gian và mô hình Graph Neural Network (GNN) để phân tích mối quan hệ giữa các khu vực, từ đó đề xuất những vị trí có tiềm năng cao cho việc đặt trạm sạc mới. Đây là một bài toán vừa có tính ứng dụng thực tế, vừa có yếu tố nghiên cứu, phù hợp với yêu cầu của một đồ án tốt nghiệp kỹ sư.

## 3. Mục tiêu tổng quát

Xây dựng một hệ thống web hỗ trợ quản lý dữ liệu trạm sạc và đề xuất khu vực phù hợp để đặt trạm sạc mới dựa trên dữ liệu không gian, dữ liệu hạ tầng xung quanh và mô hình học máy/học sâu theo hướng Graph Neural Network.

## 4. Mục tiêu cụ thể

- Quản lý dữ liệu trạm sạc hiện có, cổng sạc, giá sạc và trạng thái vận hành trên web.
- Thu thập và chuẩn hóa dữ liệu không gian như dân cư, giao thông, điểm quan tâm (POI), khu thương mại, bãi đỗ xe và các trạm sạc hiện tại.
- Biểu diễn các khu vực dưới dạng đồ thị để mô hình GNN có thể học quan hệ giữa các nút khu vực.
- Huấn luyện mô hình dự đoán để đánh giá mức độ phù hợp của từng khu vực đối với việc đặt trạm sạc mới.
- Hiển thị kết quả đề xuất trực quan trên bản đồ và danh sách ưu tiên để hỗ trợ ra quyết định.

## 5. Tính cấp thiết và ý nghĩa thực tiễn

Đề tài có ý nghĩa thực tiễn cao vì giải quyết trực tiếp bài toán quy hoạch hạ tầng trạm sạc xe điện. Kết quả của hệ thống có thể hỗ trợ nhà đầu tư, đơn vị vận hành hoặc cơ quan quản lý trong việc lựa chọn vị trí triển khai trạm mới một cách khoa học hơn, thay vì chỉ dựa trên cảm tính.

Ngoài ra, hệ thống còn có ý nghĩa nghiên cứu vì khai thác được dữ liệu đa nguồn và mô hình GNN cho bài toán không gian. Đây là hướng tiếp cận hiện đại, phù hợp với các bài toán recommendation không gian và quy hoạch đô thị thông minh.

## 6. Phạm vi nghiên cứu

Đề tài tập trung vào bài toán hỗ trợ ra quyết định vị trí đặt trạm sạc mới, không đi sâu vào điều khiển thiết bị sạc thời gian thực. Phạm vi có thể triển khai ở cấp thành phố hoặc cấp quận/huyện, tùy theo nguồn dữ liệu thu thập được.

Các nhóm dữ liệu chính gồm: dữ liệu trạm sạc hiện có, dữ liệu dân cư, dữ liệu giao thông, dữ liệu điểm quan tâm (POI), đặc điểm khu vực và các yếu tố xung quanh ảnh hưởng đến nhu cầu sạc.

## 7. Đối tượng sử dụng hệ thống

- Admin: quản lý dữ liệu trạm sạc, dữ liệu khu vực và chạy mô hình đề xuất.
- Người dùng/khách tham khảo: xem bản đồ, tra cứu trạm sạc hiện có và xem khu vực tiềm năng.
- Người ra quyết định: sử dụng kết quả hệ thống để tham khảo khi lập kế hoạch đầu tư hoặc mở rộng mạng lưới trạm sạc.

## 8. Ý tưởng tổng quan của hệ thống

Hệ thống được xây dựng theo hướng web app kết hợp AI. Phần web đảm nhiệm việc thu thập, lưu trữ, quản lý và hiển thị dữ liệu; phần AI/GNN đảm nhiệm việc học từ dữ liệu không gian để dự đoán khu vực phù hợp.

Về logic nghiệp vụ, hệ thống không chỉ cho phép tìm trạm sạc hiện có mà còn đưa ra gợi ý cho những khu vực nên đặt trạm mới. Điều này tạo ra giá trị khác biệt so với một website quản lý trạm sạc thông thường.

Sơ đồ chức năng khái quát:

Hệ thống
├─ Người dùng: tìm kiếm trạm, xem chi tiết, xem bản đồ đề xuất
└─ Admin: đăng nhập, quản lý dữ liệu, chạy mô hình, xem đề xuất, xuất báo cáo

## 9. Chức năng chính của dự án

Hệ thống được chia thành hai nhóm chức năng chính: nhóm chức năng dành cho quản trị viên và nhóm chức năng dành cho người dùng cuối.

### 9.1. Chức năng dành cho Admin

- Đăng nhập và xác thực quản trị:
  Admin sử dụng tài khoản quản trị để đăng nhập vào hệ thống. Sau khi đăng nhập thành công, hệ thống cấp token xác thực để truy cập các chức năng quản trị và bảo vệ các API nội bộ.
- Quản lý trạm sạc:
  Admin có thể thêm mới, chỉnh sửa, xóa và xem chi tiết các trạm sạc. Mỗi trạm gồm các thông tin như tên trạm, địa chỉ, tọa độ, trạng thái hoạt động và các thông tin liên quan khác.
- Quản lý cổng sạc:
  Admin quản lý từng cổng sạc thuộc một trạm, bao gồm mã cổng, loại đầu cắm, công suất sạc, trạng thái sử dụng và bảng giá áp dụng.
- Quản lý trạm đổi pin:
  Admin có thể thêm, sửa, xóa và cập nhật các điểm đổi pin, đặc biệt là các trạm hoặc tủ đổi pin của VinFast. Các thông tin quản lý gồm tên điểm, địa chỉ, đơn vị cung cấp, dòng xe hỗ trợ, số lượng pin còn khả dụng và trạng thái vận hành.
- Quản lý dữ liệu nền phục vụ mô hình:
  Admin nhập hoặc đồng bộ dữ liệu khu vực, dữ liệu giao thông, dữ liệu dân cư, dữ liệu điểm quan tâm (POI), trung tâm thương mại, bãi đỗ xe và các yếu tố môi trường ảnh hưởng đến nhu cầu sạc hoặc đổi pin.
- Chuẩn hóa và kiểm tra dữ liệu:
  Trước khi đưa vào mô hình, admin có thể kiểm tra dữ liệu bị trùng, thiếu hoặc sai tọa độ. Đây là bước quan trọng để bảo đảm chất lượng dự đoán.
- Chạy mô hình dự đoán GNN:
  Admin kích hoạt quá trình chạy mô hình để đánh giá mức độ phù hợp của từng khu vực đối với việc mở mới trạm sạc hoặc trạm đổi pin.
- Xem kết quả đề xuất vị trí:
  Sau khi mô hình xử lý xong, admin xem được bản đồ nhiệt, danh sách khu vực tiềm năng, điểm số đề xuất và thứ tự ưu tiên của từng khu vực.
- Quản lý báo cáo và thống kê:
  Admin xem báo cáo tổng hợp về số lượng trạm hiện có, phân bố khu vực, số cổng sạc, số điểm đổi pin, khu vực thiếu hạ tầng và kết quả dự đoán của hệ thống.
- Hỗ trợ ra quyết định:
  Admin có thể so sánh giữa các khu vực đề xuất, đánh giá lợi thế từng vị trí và sử dụng kết quả để tham khảo trong quá trình lập kế hoạch đầu tư hoặc quy hoạch.

### 9.2. Chức năng dành cho Người dùng

- Tìm kiếm trạm sạc:
  Người dùng có thể tìm kiếm trạm sạc theo tên, địa chỉ, khu vực, loại cổng sạc, công suất hoặc trạng thái hoạt động.
- Tìm trạm gần vị trí hiện tại:
  Người dùng truyền vị trí hiện tại hoặc cho phép hệ thống lấy tọa độ để tìm các trạm sạc gần nhất hoặc các điểm đổi pin gần nhất.
- Xem chi tiết trạm sạc:
  Người dùng xem thông tin chi tiết của từng trạm, bao gồm tên trạm, địa chỉ, vị trí bản đồ, loại cổng sạc, công suất, trạng thái khả dụng và các thông tin cần thiết khác.
- Tìm kiếm trạm đổi pin:
  Người dùng có thể tra cứu các điểm đổi pin theo khu vực, nhà cung cấp, dòng xe hỗ trợ hoặc khoảng cách từ vị trí hiện tại.
- Xem thông tin trạm đổi pin:
  Hệ thống hiển thị số lượng pin còn khả dụng, loại xe được hỗ trợ, trạng thái hoạt động và khoảng cách từ người dùng đến trạm.
- Xem bản đồ hệ thống:
  Người dùng có thể xem trực quan các trạm sạc và trạm đổi pin trên bản đồ để dễ lựa chọn vị trí phù hợp.
- Xem khu vực được hệ thống đề xuất:
  Trong phạm vi đồ án, người dùng hoặc người tham khảo có thể xem các khu vực tiềm năng mà hệ thống AI đề xuất để hiểu xu hướng phát triển hạ tầng trong tương lai.
- Tra cứu thông tin phục vụ tham khảo:
  Người dùng có thể xem thông tin tổng quan như mật độ trạm theo khu vực, khu vực còn thiếu trạm hoặc khu vực có tiềm năng phát triển.

### 9.3. Giá trị của việc phân tách chức năng

Việc phân tách rõ hai nhóm chức năng giúp hệ thống vừa mang tính quản trị, vừa mang tính ứng dụng thực tế. Nhóm admin thể hiện chiều sâu kỹ thuật và nghiệp vụ của đồ án, còn nhóm người dùng thể hiện khả năng triển khai thành sản phẩm web phục vụ tra cứu và hỗ trợ quyết định.

## 10. Dữ liệu đầu vào dự kiến

Dữ liệu đầu vào có thể được thu thập từ các nguồn mở hoặc API bản đồ. Các nhóm dữ liệu chính gồm: tọa độ trạm sạc hiện có, loại cổng sạc, công suất, giá sạc, dân cư theo khu vực, mạng lưới giao thông, điểm quan tâm xung quanh, khu dân cư, trung tâm thương mại, bãi đỗ xe và các tín hiệu phản ánh nhu cầu sử dụng.

Khi dữ liệu đủ lớn, có thể xây dựng đồ thị nhiều lớp hoặc đồ thị đa quan hệ để mô hình học được sự tương tác giữa các khu vực lân cận, đường giao thông và nơi tập trung nhu cầu thực tế.

## 11. Phương pháp thực hiện

Đề tài được triển khai theo hướng kết hợp phát triển phần mềm và nghiên cứu thực nghiệm. Quy trình dự kiến gồm: thu thập dữ liệu, làm sạch và chuẩn hóa dữ liệu, biểu diễn dữ liệu dưới dạng đồ thị, huấn luyện mô hình GNN, đánh giá kết quả và tích hợp vào giao diện web.

Mô hình có thể được so sánh với một số phương pháp truyền thống như heuristic, hồi quy, mô hình cây quyết định hoặc các biến thể machine learning khác để làm rõ ưu điểm của hướng tiếp cận GNN.

## 12. Công nghệ đề xuất

- Frontend/Backend: Node.js, Express, TypeScript.
- Cơ sở dữ liệu: MongoDB.
- Xác thực: JWT.
- Bản đồ và dữ liệu vị trí: API bản đồ hoặc dịch vụ geocoding/reverse geocoding.
- AI/ML: Python hoặc môi trường phù hợp để huấn luyện GNN, sau đó tích hợp kết quả về web.

## 13. Kết quả dự kiến

Sau khi hoàn thành, đề tài dự kiến tạo ra một hệ thống web có thể phục vụ đồng thời cho hai mục đích: quản lý dữ liệu trạm sạc và hỗ trợ ra quyết định quy hoạch trạm mới. Hệ thống cho phép xem bản đồ, tra cứu dữ liệu, nhận đề xuất khu vực tiềm năng và trực quan hóa kết quả theo mức độ ưu tiên.

Ngoài sản phẩm phần mềm, đề tài còn tạo ra một hướng tiếp cận nghiên cứu có thể mở rộng cho các bài toán quy hoạch hạ tầng đô thị thông minh khác.

## 14. Kế hoạch triển khai

- Giai đoạn 1: khảo sát đề tài, thu thập tài liệu, xác định bài toán và xây dựng phạm vi.
- Giai đoạn 2: thiết kế cơ sở dữ liệu, xây dựng backend và các API quản lý.
- Giai đoạn 3: xây dựng module bản đồ, tìm kiếm và hiển thị dữ liệu.
- Giai đoạn 4: tiền xử lý dữ liệu, xây dựng đồ thị và huấn luyện mô hình GNN.
- Giai đoạn 5: tích hợp kết quả dự đoán vào hệ thống web và hoàn thiện báo cáo thực nghiệm.

## 15. Kết luận

Đề tài có tính ứng dụng rõ ràng, phù hợp với định hướng đồ án tốt nghiệp kỹ sư vì vừa có thành phần hệ thống phần mềm, vừa có thành phần nghiên cứu trí tuệ nhân tạo. Hệ thống không chỉ dừng ở mức quản lý trạm sạc mà còn cung cấp chức năng đề xuất vị trí đặt trạm mới dựa trên dữ liệu và mô hình học máy, qua đó thể hiện được tính thực tiễn, tính nghiên cứu và khả năng mở rộng của đề tài.
