# 1. Validation Matrix

Dưới đây là ma trận kiểm tra dữ liệu đầu vào (Validation) dựa trên cấu trúc DTO hiện tại.

## Module: Submission
| Field | Annotation ở Backend | Frontend Validation | Lỗ hổng có thể Bypass qua API |
| :--- | :--- | :--- | :--- |
| `teamId` | `@NotNull` | Checked | Không |
| `roundId` | `@NotNull` | Checked | Không |
| `repositoryUrl` | `@Pattern` (Regex http/https) | Regex `isValidUrl()` | **Có.** Do thiếu `@NotNull` hoặc `@NotBlank`, nếu gửi payload json không có key này, `@Pattern` sẽ bị bypass, dẫn đến dữ liệu null chui vào Database. |
| `demoUrl` | `@Pattern` (Regex http/https) | Regex `isValidUrl()` | Không (Là optional, cho phép null). |
| `reportUrl` | **Không có** | Regex `isValidUrl()` | **Có.** Backend đang hoàn toàn không Validate field này. Kẻ gian có thể dùng Postman gửi `reportUrl = "javascript:alert(1)"` để gây lỗi bảo mật. |

## Module: Mentorship Request
| Field | Annotation ở Backend | Frontend Validation | Lỗ hổng có thể Bypass qua API |
| :--- | :--- | :--- | :--- |
| `teamId` | `@NotNull` | Checked | Không |
| `title` | `@NotBlank` | Checked | Không |
| `description` | Tự do | Trống sẽ đổi thành `undefined` | Không |
| `reason` (Decline) | `@NotBlank` | Checked | Không |
| `answer` (Resolve) | `@NotBlank` | Checked | Không |
