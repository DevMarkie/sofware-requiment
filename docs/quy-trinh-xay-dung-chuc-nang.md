# Quy trình xây dựng chức năng (Frontend + Node Server)

Tài liệu này hướng dẫn cách thực hiện một chức năng mới cho dự án hiện tại gồm phần web tĩnh (`index.html`, `styles.css`, `js/*`) và server NodeJS (`server/*`).

## 1) Xác định yêu cầu

- Mô tả ngắn gọn chức năng: mục tiêu, đối tượng sử dụng, luồng chính.
- Acceptance Criteria (điều kiện nghiệm thu):
  - [ ] UI hiển thị ...
  - [ ] Dữ liệu lưu/đọc được ...
  - [ ] Xử lý lỗi/edge cases: ...
- Phạm vi: Frontend, Backend, dữ liệu, bảo mật.

## 2) Thiết kế nhanh

- UI: khu vực sẽ thay đổi trong `index.html` và logic trong các file `js/*.js` liên quan.
- API: nếu cần, xác định endpoint trong `server/src/server.js` và luồng DB trong `server/src/db.js`.
- Dữ liệu: mẫu JSON trong `server/data/seed.json` và cấu trúc lưu trữ.

## 3) Dàn bài công việc

- Frontend:
  - Cập nhật UI (`index.html`, `styles.css`).
  - Viết logic trong `js/ui.js`, `js/main.js` và các module liên quan (`data.js`, `storage.js`, `employees.js`, `org.js`).
- Backend:
  - Thêm route trong `server/src/server.js` (GET/POST/PUT/DELETE).
  - Nếu dùng DB file/JSON, cập nhật `server/src/db.js`, `server/src/seed.js` khi cần.
- Kiểm thử:
  - Viết quick test hoặc script nhỏ.
  - Dữ liệu giả lập trong `server/data/seed.json`.

## 4) Thực hiện chi tiết (Checklist)

### 4.1 Frontend

- [ ] Cập nhật `index.html` (thêm thẻ, vùng chứa UI mới có `id`/`class` cụ thể).
- [ ] Thêm style trong `styles.css` (ưu tiên class BEM hoặc tiền tố đặc thù chức năng).
- [ ] Viết/điều chỉnh hàm trong `js/ui.js` để render UI; đảm bảo tách bạch render với dữ liệu.
- [ ] Cập nhật `js/main.js` để gắn event listeners và khởi tạo màn hình.
- [ ] Nếu có dữ liệu cục bộ, cập nhật `js/storage.js` (localStorage) với key có tiền tố rõ ràng.
- [ ] Nếu có domain logic, tách sang `js/employees.js` hoặc `js/org.js` cho dễ test.

### 4.2 Backend (NodeJS trong `server/`)

- [ ] Kiểm tra `server/package.json` để biết cách chạy server (scripts, deps).
- [ ] Thêm route mới trong `server/src/server.js` (ví dụ: `app.get('/api/items', ...)`).
- [ ] Sử dụng `server/src/db.js` để đọc/ghi dữ liệu; tránh truy cập file trực tiếp.
- [ ] Nếu cần seed dữ liệu, thêm vào `server/data/seed.json` và/hoặc cập nhật `server/src/seed.js`.
- [ ] Khởi động server và test endpoint bằng `curl`/Postman/Fetch từ frontend.

### 4.3 Kết nối Frontend–Backend

- [ ] Trong `js/data.js`, tạo hàm gọi API bằng `fetch` (GET/POST...).
- [ ] Xử lý trạng thái loading/error và hiển thị trong UI (`ui.js`).
- [ ] Đồng bộ schema JSON giữa client và server (tên trường, kiểu dữ liệu).

### 4.4 Kiểm thử và chất lượng

- [ ] Smoke test thủ công các luồng chính.
- [ ] Kiểm tra edge cases: dữ liệu rỗng, lỗi mạng, dữ liệu lớn.
- [ ] Lint/định dạng code (giữ style hiện có).

## 5) Triển khai và bàn giao

- Hướng dẫn chạy local (Windows PowerShell):

  ```powershell
  # 1) Khởi động server (nếu có scripts trong server/package.json)
  cd server
  npm install
  npm run start

  # 2) Mở file index.html trong trình duyệt hoặc dùng Live Server
  cd ..
  # Nếu dùng VS Code: cài extension Live Server và "Open with Live Server"
  ```

- Cập nhật tài liệu: dán link PR, ảnh chụp màn hình, video ngắn.
- Bàn giao: xác nhận các tiêu chí nghiệm thu đã đạt.

## 6) Mẫu PR Checklist

- [ ] Đã cập nhật UI/Styles
- [ ] Đã thêm/điều chỉnh API và cập nhật docs
- [ ] Đã kiểm thử các luồng chính và edge cases
- [ ] Đính kèm ảnh/video minh họa
- [ ] Không thay đổi hành vi ngoài phạm vi chức năng

---

## Phụ lục: Case study cụ thể — Employees List + Create

Mục tiêu: Hiển thị danh sách nhân viên và thêm nhân viên mới, lưu dữ liệu ở backend đơn giản.

1. Backend

- Mở `server/src/server.js`:
  - Thêm route `GET /api/employees` đọc từ `db.getEmployees()` và trả về JSON.
  - Thêm route `POST /api/employees` nhận `{ name, email, department }`, validate cơ bản, gọi `db.addEmployee()` và trả về 201.
- Mở `server/src/db.js`:
  - Thêm hai hàm `getEmployees()` và `addEmployee(emp)` làm việc với file JSON hoặc in-memory lưu trong biến tĩnh. Nếu đã có util đọc `server/data/seed.json`, tái sử dụng.
- Dữ liệu: cập nhật `server/data/seed.json` thêm mảng `employees` nếu chưa có.

2. Frontend

- `js/data.js`:
  - Thêm `async function fetchEmployees()` gọi `GET /api/employees` (base URL là `http://localhost:<port>` nếu cần).
  - Thêm `async function createEmployee(payload)` gọi `POST /api/employees` với header `Content-Type: application/json`.
- `index.html`:
  - Thêm vùng chứa danh sách: `<div id="employee-list"></div>`.
  - Thêm form: name/email/department và nút Submit.
- `js/ui.js`:
  - Thêm `renderEmployeeList(list)` để render danh sách vào `#employee-list`.
- `js/main.js`:
  - On load: gọi `fetchEmployees()` rồi `renderEmployeeList()`.
  - Gắn handler submit form: gọi `createEmployee()`, sau đó gọi lại `fetchEmployees()` và render.
- `styles.css`: thêm style cơ bản cho form và bảng/danh sách.

3. Kiểm thử nhanh (PowerShell)

```powershell
cd server; npm install; npm run start
# Cửa sổ mới:
curl http://localhost:3000/api/employees
curl -X POST http://localhost:3000/api/employees -H 'Content-Type: application/json' -d '{"name":"A","email":"a@example.com","department":"IT"}'
```

4. Edge cases

- Tên/email rỗng: backend trả 400, frontend hiển thị thông báo.
- Trùng email (nếu cần): backend kiểm tra, trả 409.
- Server chưa chạy: fetch lỗi -> hiển thị banner lỗi và hướng dẫn chạy server.
