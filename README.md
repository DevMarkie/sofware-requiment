# Quản lý cơ cấu Phenikaa Uni

Ứng dụng quản trị chạy hoàn toàn bằng **HTML/CSS/JavaScript thuần**. Mọi dữ liệu được lưu trong `localStorage`, không cần backend, build tool hay bước cài đặt phụ trợ.

---

## Tính năng chính

- Quản lý cây cơ cấu tổ chức (đại học → trường → khoá → chuyên ngành → môn học).
- Hồ sơ nhân sự: thêm/sửa/xoá, lọc trạng thái, tìm kiếm, sắp xếp.
- Danh mục học phần theo từng môn; thay đổi tại đây đồng bộ ngay với CTĐT và bảng học phí.
- Quản lý chương trình đào tạo (CTĐT): gán học phần, thống kê số học phần, tín chỉ, chi phí dự kiến.
- Tính toán học phí: bảng chi tiết theo CTĐT và máy tính nhanh theo tổng tín chỉ.
- Quản lý người dùng nội bộ (mô phỏng phân quyền).
- Nhập/xuất JSON, chuyển theme sáng/tối, thông báo toast khi thao tác.

---

## Cách chạy

1. Mở `index.html` bằng trình duyệt (double-click hoặc dùng Live Server).
2. Thao tác trực tiếp, dữ liệu auto-save vào `localStorage` dưới khóa `org_emp_data_v1`.
3. Muốn về dữ liệu mẫu: bấm **Khôi phục dữ liệu mẫu** hoặc xoá key trong DevTools > Application > Local Storage.

> Dự án không cần `npm install`, không yêu cầu Node.js.

---

## Điều hướng chính

| Tab            | Nội dung                                           | Lưu ý                                                 |
| -------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Cơ cấu tổ chức | Cây phân cấp, CRUD node, breadcrumb, tìm kiếm.     | Chọn một môn học (type `course`) để mở tab Học phần.  |
| Nhân sự        | Danh sách nhân viên, lọc trạng thái, form CRUD.    | Dropdown bộ phận hiển thị đường dẫn đầy đủ.           |
| Học phần       | Danh mục học phần của môn đã chọn, form thêm/sửa.  | Thay đổi mã/tín chỉ sẽ cập nhật CTĐT và học phí ngay. |
| CTĐT           | Chương trình đào tạo theo chuyên ngành.            | Nhập mã học phần đúng như trong tab Học phần.         |
| Học phí        | Tính phí theo CTĐT và máy tính nhanh theo tín chỉ. | Có thể cấu hình đơn giá LT/TH từng CTĐT.              |
| Người dùng     | Danh sách tài khoản mô phỏng phân quyền.           | Chưa kích hoạt đăng nhập thực tế.                     |

---

## Cấu trúc thư mục

```
index.html          # Layout và các panel giao diện
styles.css          # Theme, component, animation
js/
  data.js           # Seed data + helper uid()
  main.js           # Entry: load state, điều phối render
  org.js            # Logic cây tổ chức
  employees.js      # Quản lý nhân sự
  modules.js        # Quản lý học phần, đồng bộ CTĐT/học phí
  programs.js       # Quản lý chương trình đào tạo
  tuition.js        # Tính toán học phí, máy tính nhanh
  users.js          # Quản lý người dùng nội bộ
  storage.js        # Làm việc với localStorage, import/export
  ui.js             # Toast, sort button helper
  utils.js          # Debounce, escape HTML
```

Tài liệu tham khảo nằm trong thư mục `docs/`.

---

## Dữ liệu mẫu

- Các cấp tổ chức: `university`, `school`, `cohort`, `major`, `course`.
- Học phần mẫu có sẵn thông tin tín chỉ LT/TH; dùng mã hiển thị ở tab Học phần (ví dụ `CLOUD-LT`).
- CTĐT mẫu liên kết sẵn để minh họa cách tổng hợp tín chỉ và học phí.
- Bảng người dùng phục vụ mô phỏng; ứng dụng chưa bật cơ chế đăng nhập.

---

## Khi mở rộng tính năng

1. Tạo nhánh `feat/<ten-chuc-nang>`.
2. Cập nhật seed trong `data.js` nếu cần dữ liệu mặc định mới.
3. Đảm bảo thay đổi ở học phần được phản ánh trong `modules.js`, `programs.js`, `tuition.js`.
4. Reset dữ liệu và chạy toàn bộ flow để kiểm thử.
5. Commit, push; dự án không có pipeline build/test.

---

## Gợi ý cải tiến

- Bổ sung đăng nhập và phân quyền thực tế.
- Cho phép cấu hình nhiều biểu phí hoặc biểu phí theo năm.
- Xuất/nhập CSV, in báo cáo PDF.
- Bổ sung unit test cho logic lọc nhân sự, tính học phí.
- Tối ưu giao diện khi số lượng node/học phần lớn (virtualized list/autocomplete).

---

> Dự án phục vụ mục đích học tập/nội bộ. Thêm license (MIT, BSD, ...) nếu cần phát hành rộng rãi.
