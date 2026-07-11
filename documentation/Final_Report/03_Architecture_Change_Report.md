# Architecture Change Report

## Thay đổi 1: Refactor MentorshipRequestService
* **Code cũ:** Là một class cụ thể (Concrete Class) tự implement mọi logic.
* **Code mới:** Trở thành một `Interface` chứa khai báo hàm. Logic cũ chuyển vào `MentorshipRequestServiceImpl`.
* **Business Problem:** Khó viết Unit Test (khó tạo Mock Object), vi phạm nguyên tắc Dependency Inversion trong Clean Architecture.
* **Root Cause:** Coder ban đầu code nhanh (Quick & Dirty) để chạy được chức năng.
* **Solution:** Extract Interface.
* **Lý do chọn Solution:** Đây là chuẩn mực (Best Practice) của Spring Boot. Giúp Decoupling tầng Controller và tầng Service.

---

## Thay đổi 2: Thay đổi luồng Gửi Notification
* **Code cũ:** Sử dụng vòng lặp `for`, gọi `notificationRepository.save(new Notification())` liên tục.
* **Code mới:** Đẩy toàn bộ User vào hàm `createNotifications()` rồi gọi `notificationRepository.saveAll()`.
* **Business Problem:** Lỗi cổ chai Database (N+1 Query Problem).
* **Root Cause:** Dùng API của JPA một cách ngây thơ.
* **Solution:** Sử dụng cơ chế Batch Insert của Spring Data JPA.
* **Lý do chọn Solution:** Tăng tốc độ insert x10 lần, giảm connection pool footprint.
* **Alternative Solution:** Bắn Event ra RabbitMQ/Kafka để xử lý bất đồng bộ.
* **Trade-off:** Solution hiện tại vẫn chạy đồng bộ (Synchronous) và giữ Request của user hơi lâu 1 chút (do chờ insert), nhưng không yêu cầu cài đặt thêm Server Queue phức tạp, phù hợp với quy mô hiện tại.

---

## Thay đổi 3: Sửa lỗi hiển thị Team bị giới hạn (MentorshipRequestService)
* **Code cũ:** Dùng `.stream().findFirst()` để lấy Team đầu tiên mà thí sinh tham gia.
* **Code mới:** Lấy mảng toàn bộ Team, loop và dùng `flatMap` để query toàn bộ Request.
* **Business Problem:** Sinh viên kỳ cựu tham gia nhiều Hackathon bị ẩn mất các Request của mùa trước.
* **Root Cause:** Sai lầm trong suy luận logic: "1 sinh viên chỉ thuộc 1 Team".
* **Solution:** Chuyển từ quan hệ 1-1 sang xử lý 1-N.
* **Ảnh hưởng đến hệ thống:** Tăng số lượng query Select lên tỷ lệ thuận với số lượng Team mà sinh viên đã từng tham gia. Rất may mắn con số này thực tế rất nhỏ (<10), nên hệ thống không bị chậm đi đáng kể.
