# DATABASE VERIFICATION

Sau mỗi luồng Test API/UI, Tester bắt buộc dùng SQL Query để thẩm định lại tính nhất quán của dữ liệu. Tránh "False Positive" (UI báo xanh nhưng DB lưu sai).

## 1. Submission Flow

**Query:**
```sql
SELECT id, team_id, repository_url, report_url, version, created_at, updated_at 
FROM submission 
WHERE team_id = [ID];
```

**Checklist:**
- [ ] `repository_url` tuyệt đối không được mang giá trị `NULL` hoặc Rỗng (White space).
- [ ] `report_url` không bao giờ chứa chuỗi `javascript:...`.
- [ ] `version` phải tăng thêm 1 sau mỗi lần Leader bấm Submit lại (Update).
- [ ] Không sinh ra bản ghi Duplicate cho cùng 1 Team trong 1 Round (Phải UPDATE, không phải INSERT).

## 2. Mentorship Request Flow

**Query:**
```sql
SELECT id, team_id, mentor_id, status, title, version, created_at 
FROM mentorship_request 
WHERE id = [ID];
```

**Checklist:**
- [ ] Độ dài `title` không vượt quá 255 ký tự.
- [ ] Trạng thái `OPEN`: Cột `mentor_id` bắt buộc phải là `NULL`.
- [ ] Trạng thái `IN_PROGRESS`: Cột `mentor_id` chứa ID của Mentor đúng.
- [ ] Track Verification: Mentor ID nằm trong cột `mentor_id` BẮT BUỘC phải tồn tại trong bảng `track_mentor` ghép nối đúng với `track_id` của Team đó.
- [ ] `version` phải > 0 và tăng đều sau mỗi trạng thái (Optimistic Lock hoạt động).

## 3. Notification Integrity

**Query:**
```sql
SELECT id, user_id, message, is_read 
FROM notification 
WHERE reference_id = [Mentorship_ID];
```

**Checklist:**
- [ ] Đảm bảo Leader nhận được Notification sau khi Mentor bấm Accept / Resolve.
- [ ] Dòng Notification phải gắn đúng `reference_id` trỏ về Mentorship Request để Frontend bấm vào link chuyển trang đúng.
