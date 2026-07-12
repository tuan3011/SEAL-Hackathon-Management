# 5. Missing Validation Report

Dựa vào mã nguồn của Backend DTO (đặc biệt là Submission), đây là danh sách các Validation còn thiếu sót và có thể bị hacker bypass trực tiếp thông qua Postman / Curl.

## 5.1. Thiếu `@NotNull` ở `repositoryUrl`
- **Business Requirement:** `repositoryUrl` là trường bắt buộc (Không được phép bỏ trống).
- **File:** `CreateSubmissionRequest.java`
- **Logic hiện tại:** Có Annotation `@Pattern` chặn định dạng sai, nhưng KHÔNG có `@NotNull` hay `@NotBlank`.
- **Rủi ro:** Khi Payload JSON hoàn toàn vắng mặt key `repositoryUrl` (null), Java Spring Validator sẽ tự động "bỏ qua" `@Pattern` (vì null được coi là hợp lệ trừ khi có `@NotNull`). Dữ liệu Null sẽ trôi tuột xuống Database, phá vỡ logic yêu cầu nộp link GitHub bắt buộc.
- **Recommendation:** Thêm `@NotBlank(message = "Repository URL is required")` vào DTO.

## 5.2. Thiếu Validation ở `reportUrl`
- **Business Requirement:** Nếu user có truyền `reportUrl`, nó phải là một URL hợp lệ.
- **File:** `CreateSubmissionRequest.java`
- **Logic hiện tại:** Field này chỉ được khai báo `private String reportUrl;`, không có bất kỳ Annotation nào. Frontend đang validate tốt, nhưng Backend thì không.
- **Rủi ro:** Kẻ xấu chặn request và đổi payload thành `reportUrl: "javascript:alert(1)"`. Backend sẽ lưu nguyên chuỗi độc hại này vào Database.
- **Recommendation:** Thêm Annotation `@Pattern` tương tự như `demoUrl` để đảm bảo an toàn từ phía Server.

## 5.3. Thiếu Validate độ dài chuỗi (Mentorship Request)
- **Business Requirement:** Title và Description của Mentorship Request không được vượt quá giới hạn CSDL.
- **File:** `CreateMentorshipRequest.java`
- **Logic hiện tại:** Có `@NotBlank` cho title nhưng không giới hạn `@Size`.
- **Rủi ro:** Kẻ gian truyền vào Payload chứa Title dài 10MB (String payload attack), có thể làm sập hệ thống (OOM) hoặc quá tải DB (Data truncation error).
- **Recommendation:** Thêm `@Size(max = 255)` cho `title` và `@Size(max = 2000)` cho `description`.
