# 02. Architecture Review

## 1. Single Responsibility Principle (SRP)
- *Hooks / State:* Việc bổ sung các biến như `isCancelling` hay `acceptingId` hoàn toàn tuân thủ nguyên tắc quản lý Local State của Component. Các Component này tự quản lý hành vi Loading và Disabling của riêng nó.
- *Services:* Tầng Service (`MentorshipRequestService.ts`, `SubmissionService.ts`) hoàn toàn tách biệt khỏi UI. File Service chỉ chịu trách nhiệm gọi `axios` và trả về Data / Promise. -> **ĐẠT.**

## 2. Component Reuse
- Component `Modal` được tái sử dụng triệt để ở cả `MyMentorshipRequestsPage` (View Details Modal) và `MentorRequestsPage` (Decline Reason Modal).
- Việc tái sử dụng này giữ tính nhất quán về UI/UX (cùng animation, cùng overlay).

## 3. Type Safety & DTO Mapping
- Cấu trúc `MentorshipRequest` interface khớp 100% với DTO trả về từ Java Spring Boot. 
- Việc convert chuỗi `""` thành `undefined` của Frontend giúp Jackson Mapper bên Backend tiếp nhận dữ liệu an toàn mà không cần phải viết Exception hay Custome Validator ở Backend.

## 4. Separation of Concerns
- Logic Call API và Logic Validate form được tách bạch rõ.
- **Đánh giá Over-engineering:** Không có tình trạng over-engineering. Giải pháp thêm `isCancelling` là cách cơ bản, nhẹ và hiệu quả nhất trong React thay vì sử dụng Redux hay React Query phức tạp không cần thiết cho những form nhỏ.
