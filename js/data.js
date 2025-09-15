// js/data.js
// Định nghĩa mức (level), mẫu dữ liệu & hàm tạo ID

export const LEVELS = [
  { key: 'university', name: 'Đại học', child: 'school' },
  { key: 'school',     name: 'Trường',  child: 'cohort' },
  { key: 'cohort',     name: 'Khoá',    child: 'major' },
  { key: 'major',      name: 'Chuyên ngành', child: 'course' },
  { key: 'course',     name: 'Môn học', child: null }
];

/** Tạo ID ngắn */
export const uid = () => Math.random().toString(36).slice(2, 10);

/** Dữ liệu mẫu: Đại học → Trường → Khoá → Chuyên ngành → Môn */
export const sampleData = {
  orgs: [
    { id: 'u-phenikaa', type: 'university', name: 'ĐẠI HỌC PHENIKAA', parentId: null },

    { id: 's-cntt', type: 'school', name: 'Trường Công nghệ thông tin', parentId: 'u-phenikaa' },
    { id: 's-kinhte', type: 'school', name: 'Trường Kinh tế', parentId: 'u-phenikaa' },

    { id: 'k17', type: 'cohort', name: 'K17', parentId: 's-cntt' },
    { id: 'k18', type: 'cohort', name: 'K18', parentId: 's-cntt' },

    { id: 'maj-ktpm', type: 'major', name: 'Kỹ thuật phần mềm', parentId: 'k17' },
    { id: 'maj-httt', type: 'major', name: 'Hệ thống thông tin', parentId: 'k17' },

    { id: 'c-cloud', type: 'course', name: 'Điện toán đám mây', parentId: 'maj-ktpm' },
    { id: 'c-hci', type: 'course', name: 'Giao diện người–máy', parentId: 'maj-ktpm' },
    { id: 'c-algo', type: 'course', name: 'Thuật toán ứng dụng', parentId: 'maj-ktpm' },
    { id: 'c-db', type: 'course', name: 'Cơ sở dữ liệu', parentId: 'maj-httt' }
  ],
  employees: [
    { id: uid(), name: 'Nguyễn Văn A', title: 'Giảng viên', email: 'a@phenikaa-uni.edu.vn', phone: '090000001', status: 'active', orgId: 'maj-ktpm' },
    { id: uid(), name: 'Trần Thị B', title: 'Thư ký khoa', email: 'b@phenikaa-uni.edu.vn', phone: '090000002', status: 'active', orgId: 's-cntt' },
    { id: uid(), name: 'Phạm Văn C', title: 'Giảng viên', email: 'c@phenikaa-uni.edu.vn', phone: '090000003', status: 'inactive', orgId: 'c-hci' }
  ]
};
