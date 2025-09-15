# Biên bản họp phân công công việc (Solo)

Ngày: 12/09/2025  
Thời gian: 09:00–09:30  
Địa điểm: Máy cá nhân  
Chủ trì: Tôi (solo)  
Thư ký: Tôi (solo)  
Thành viên tham dự: Chỉ 1 người (Tôi)  
Vắng mặt: Không

## 1. Mục tiêu cuộc họp

- Chốt phạm vi và kế hoạch triển khai chức năng: Quản lý nhân viên (Danh sách + Thêm mới) cho web tĩnh và server Node.
- Kết nối Frontend (`js/*`, `index.html`) với Backend (`server/*`).

## 2. Nội dung chính đã thảo luận

- Yêu cầu nghiệp vụ: Xem danh sách nhân viên; thêm nhân viên mới (tên, email, phòng ban); dữ liệu lưu trong server JSON/DB đơn giản.
- API dự kiến:
  - GET `/api/employees` → trả về mảng nhân viên.
  - POST `/api/employees` → tạo nhân viên mới; body JSON: `{ name, email, department }`.
- Dữ liệu: Dựa trên `server/data/seed.json`, bổ sung trường nếu thiếu.
- Rủi ro/Vướng mắc: Đồng bộ schema client/server; lỗi CORS nếu mở `index.html` trực tiếp; validate dữ liệu cơ bản.
  Biện pháp: Dùng cùng tên trường trên cả client/server; chạy server bằng `npm run start`; bổ sung validate tối thiểu ở client; thử gọi API bằng `curl` trước khi nối UI.

## 3. Phân công công việc (Action Items)

| STT | Công việc               | Mô tả/Phạm vi                                                                    | Người phụ trách | Phối hợp | Ưu tiên    | Hạn hoàn thành | Tiêu chí hoàn thành         |
| --- | ----------------------- | -------------------------------------------------------------------------------- | --------------- | -------- | ---------- | -------------- | --------------------------- |
| 1   | Tạo GET /api/employees  | Thêm route đọc danh sách từ DB/JSON (`server/src/server.js`, `server/src/db.js`) | Tôi             | —        | Cao        | 13/09/2025     | Trả về 200 + mảng JSON      |
| 2   | Tạo POST /api/employees | Thêm route tạo mới; validate cơ bản; lưu DB/JSON                                 | Tôi             | —        | Cao        | 13/09/2025     | Trả về 201 + đối tượng mới  |
| 3   | Hàm fetch phía client   | `js/data.js`: `fetchEmployees()`, `createEmployee(payload)`                      | Tôi             | —        | Cao        | 14/09/2025     | Gọi API ok, xử lý lỗi       |
| 4   | Render danh sách        | `js/ui.js`: `renderEmployeeList(list)`; cập nhật `index.html` vùng hiển thị      | Tôi             | —        | Trung bình | 14/09/2025     | Hiển thị danh sách đúng     |
| 5   | Form thêm nhân viên     | UI form + `main.js` gắn sự kiện submit; Validate đơn giản                        | Tôi             | —        | Trung bình | 14/09/2025     | Thêm thành công, reset form |
| 6   | Dữ liệu & seed          | Cập nhật `server/data/seed.json` nếu cần; kiểm tra `seed.js`                     | Tôi             | —        | Thấp       | 15/09/2025     | Dữ liệu mẫu hợp lệ          |
| 7   | Kiểm thử & tài liệu     | Smoke test, cập nhật README và ảnh chụp                                          | Tôi             | —        | Trung bình | 15/09/2025     | Checklist pass              |

Ghi chú: Theo dõi qua README và commit messages; có thể tạo issue `#employees-crud` để liên kết PR.

## 4. Kế hoạch và mốc thời gian

- 12/09 (hôm nay): Chốt yêu cầu, chuẩn bị khung UI, soạn tài liệu.
- 13/09: Hoàn thiện API GET/POST và test bằng `curl`.
- 14/09: Hoàn thiện UI + kết nối API; kiểm thử luồng chính.
- 15/09: Hoàn thiện dữ liệu mẫu, dọn dẹp, chụp ảnh màn hình.

## 5. Tài nguyên và phụ thuộc

- Repo/Branch: `main` (làm trực tiếp, commit nhỏ, rõ ràng)
- Môi trường: dev local (Windows PowerShell)
- Phụ thuộc: NodeJS, npm; dữ liệu JSON trong `server/data/seed.json`

## 6. Cách theo dõi tiến độ

- Cập nhật tiến độ vào cuối ngày trong file này (mục Action Items)
- Mỗi khi hoàn thành một đầu việc, cập nhật README phần “Cách chạy nhanh” nếu có thay đổi

## 7. Kết luận và việc tiếp theo

- Tiếp theo: Bắt đầu thực hiện mục (1) và (2): xây GET/POST `/api/employees` và test.
- Hẹn kiểm tra lại lúc 18:00 ngày 13/09 để chốt backend.

Thư ký ký tên: Tôi  
Chủ trì ký tên: Tôi

---
