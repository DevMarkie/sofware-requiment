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
    { id: 's-dientu', type: 'school', name: 'Trường Điện - Điện tử', parentId: 'u-phenikaa' },
  { id: 's-cokhi', type: 'school', name: 'Trường Cơ khí', parentId: 'u-phenikaa' },
    { id: 's-yt', type: 'school', name: 'Trường Y', parentId: 'u-phenikaa' },
    { id: 's-ngoai', type: 'school', name: 'Trường Ngoại ngữ', parentId: 'u-phenikaa' },

    { id: 'k17', type: 'cohort', name: 'K17', parentId: 's-cntt' },
    { id: 'k18', type: 'cohort', name: 'K18', parentId: 's-cntt' },
    { id: 'k17-kt', type: 'cohort', name: 'K17', parentId: 's-kinhte' },
    { id: 'k18-kt', type: 'cohort', name: 'K18', parentId: 's-kinhte' },
    { id: 'k17-dt', type: 'cohort', name: 'K17', parentId: 's-dientu' },
  { id: 'k17-ck', type: 'cohort', name: 'K17', parentId: 's-cokhi' },

    { id: 'maj-ktpm', type: 'major', name: 'Kỹ thuật phần mềm', parentId: 'k17' },
    { id: 'maj-httt', type: 'major', name: 'Hệ thống thông tin', parentId: 'k17' },
    { id: 'maj-ktdl', type: 'major', name: 'Khoa học dữ liệu', parentId: 'k18' },
    { id: 'maj-marketing', type: 'major', name: 'Marketing', parentId: 'k17-kt' },
    { id: 'maj-tcnh', type: 'major', name: 'Tài chính Ngân hàng', parentId: 'k17-kt' },
    { id: 'maj-dtdc', type: 'major', name: 'Điện tử - Điều khiển', parentId: 'k17-dt' },
    { id: 'maj-cokhi', type: 'major', name: 'Cơ khí chế tạo', parentId: 'k17-ck' },

    { id: 'c-cloud', type: 'course', name: 'Điện toán đám mây', parentId: 'maj-ktpm' },
    { id: 'c-hci', type: 'course', name: 'Giao diện người–máy', parentId: 'maj-ktpm' },
    { id: 'c-algo', type: 'course', name: 'Thuật toán ứng dụng', parentId: 'maj-ktpm' },
    { id: 'c-db', type: 'course', name: 'Cơ sở dữ liệu', parentId: 'maj-httt' },
    { id: 'c-ml', type: 'course', name: 'Máy học cơ bản', parentId: 'maj-ktdl' },
    { id: 'c-ds', type: 'course', name: 'Khai phá dữ liệu', parentId: 'maj-ktdl' },
    { id: 'c-mkt-cb', type: 'course', name: 'Marketing căn bản', parentId: 'maj-marketing' },
    { id: 'c-tc-co-ban', type: 'course', name: 'Tài chính căn bản', parentId: 'maj-tcnh' },
    { id: 'c-dtdc-1', type: 'course', name: 'Mạch tương tự', parentId: 'maj-dtdc' },
    { id: 'c-cokhi-1', type: 'course', name: 'Nguyên lý máy', parentId: 'maj-cokhi' }
  ],
  employees: [
   
    // --- Dữ liệu cán bộ mở rộng (School of Computing) ---
    { id: 'emp-ptlam', name: 'PHAM TIEN LAM', title: 'Associate Professor; CS Program Chair', email: 'lam.phamtien@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-dttan', name: 'DANG THI THUY AN', title: 'Lecturer', email: 'an.dangthithuy@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-ttrinh', name: 'TRINH THANH', title: 'Lecturer', email: 'thanh.trinh@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-mxtrang', name: 'MAI XUAN TRANG', title: 'Lecturer; Trợ lý Hiệu trưởng', email: 'trang.maixuan@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nvthieu', name: 'NGUYEN VAN THIEU', title: 'Lecturer', email: '', status: 'active', orgId: 's-cntt' },
    { id: 'emp-ntdinh', name: 'NGUYEN THI DINH', title: 'Lecturer', email: 'dinh.nguyenthi@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-dtngoan', name: 'DANG THI NGOAN', title: 'Senior Lecturer', email: 'ngoan.thidang@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-natuan', name: 'NGUYEN ANH TUAN', title: 'Lecturer', email: 'tuan.nguyenanh2@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-lvquan', name: 'LA VAN QUAN', title: 'Lecturer', email: 'quan.lavan@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-phgiang', name: 'PHAM HOANG GIANG', title: 'Lecturer', email: 'giang.phamhoang@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nmanh', name: 'NGUYEN MINH ANH', title: 'Lecturer', email: '', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nhson', name: 'NGO HONG SON', title: 'Associate Professor; Phó Hiệu trưởng', email: 'son.ngohong@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-pnghung', name: 'PHAM NGOC HUNG', title: 'Senior Lecturer; Trợ lý Hiệu trưởng', email: 'hung.phamngoc@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-ttbinh', name: 'TRINH THANH BINH', title: 'Senior Lecturer; Department Chair', email: 'binh.trinhthanh@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-ncluong', name: 'NGUYEN CONG LUONG', title: 'Senior Lecturer; Research Lab Leader', email: 'luong.nguyencong@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nttlien', name: 'NGUYEN THI THUY LIEN', title: 'Senior Lecturer; IT Program Chair', email: 'lien.nguyenthithuy@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-tdhoan', name: 'TRAN DANG HOAN', title: 'Senior Lecturer', email: 'hoan.trandang@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-mtnga', name: 'MAI THUY NGA', title: 'Senior Lecturer', email: 'nga.maithuy@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nlethu', name: 'NGUYEN LE THU', title: 'Senior Lecturer', email: 'thu.nguyenle1@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-ntbinh', name: 'NGUYEN THANH BINH', title: 'Lecturer', email: 'binh.nguyenthanh@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-dtson', name: 'DOAN TRUNG SON', title: 'Senior Lecturer', email: 'son.doantrung@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nttrung', name: 'NGUYEN THANH TRUNG', title: 'Lecturer', email: 'trung.nguyenthanh@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-nvhung', name: 'NGUYEN VAN HUNG', title: 'Senior Lecturer', email: 'hung.nguyenvan1@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-lvvinh', name: 'LE VAN VINH', title: 'Associate Professor', email: 'vinh.levan@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' },
    { id: 'emp-lhanh', name: 'LE HOANG ANH', title: 'Senior Lecturer; Director of IT Center', email: 'anh.lehoang@phenikaa-uni.edu.vn', status: 'active', orgId: 's-cntt' }
  ],
  users: [
    { id: 'user-admin', username: 'admin', fullName: 'Quản trị hệ thống', email: 'admin@phenikaa-uni.edu.vn', role: 'admin', status: 'active' },
    { id: 'user-academic', username: 'hocvu', fullName: 'Phòng Đào tạo', email: 'hocvu@phenikaa-uni.edu.vn', role: 'academic', status: 'active' },
    { id: 'user-lecturer', username: 'giangvien01', fullName: 'Giảng viên CNTT', email: 'lecturer01@phenikaa-uni.edu.vn', role: 'lecturer', status: 'active' },
    { id: 'user-guest', username: 'khach', fullName: 'Tài khoản khách', email: 'guest@phenikaa-uni.edu.vn', role: 'viewer', status: 'inactive' }
  ],
  programs: [
    {
      id: 'prog-ktpm-2025',
      name: 'CTĐT Kỹ thuật phần mềm 2025',
      majorId: 'maj-ktpm',
      academicYear: '2025-2026',
      moduleIds: ['m-cloud-lt', 'm-cloud-th', 'm-hci-lt', 'm-db-lt'],
      moduleCodes: ['CLOUD-LT', 'CLOUD-TH', 'HCI-LT', 'DB-LT']
    },
    {
      id: 'prog-ktdl-2025',
      name: 'CTĐT Khoa học dữ liệu 2025',
      majorId: 'maj-ktdl',
      academicYear: '2025-2026',
      moduleIds: ['m-db-lt', 'm-ml-lt', 'm-ml-th', 'm-ds-lt'],
      moduleCodes: ['DB-LT', 'ML-LT', 'ML-TH', 'DS-LT']
    },
    {
      id: 'prog-marketing-2025',
      name: 'CTĐT Marketing 2025',
      majorId: 'maj-marketing',
      academicYear: '2025-2026',
      moduleIds: ['m-mkt-cb-lt'],
      moduleCodes: ['MKT-LT']
    }
  ],
  modules: [
    {
      id: 'm-cloud-lt',
      code: 'CLOUD-LT',
      name: 'Lý thuyết Điện toán đám mây',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['DB-LT'],
      corequisites: ['CLOUD-TH'],
      previousCourses: ['MẠNG MÁY TÍNH'],
      departmentId: 's-cntt',
      courseId: 'c-cloud'
    },
    {
      id: 'm-cloud-th',
      code: 'CLOUD-TH',
      name: 'Thực hành Điện toán đám mây',
      credits: 1,
      theoryCredits: 0,
      practiceCredits: 1,
      prerequisites: ['CLOUD-LT'],
      corequisites: [],
      previousCourses: ['MẠNG MÁY TÍNH'],
      departmentId: 's-cntt',
      courseId: 'c-cloud'
    },
    {
      id: 'm-hci-lt',
      code: 'HCI-LT',
      name: 'Lý thuyết HCI',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['THIET-KE-GIAO-DIEN'],
      corequisites: ['HCI-TH'],
      previousCourses: ['TÂM-LÝ-HỌC'],
      departmentId: 's-cntt',
      courseId: 'c-hci'
    },
    {
      id: 'm-db-lt',
      code: 'DB-LT',
      name: 'Lý thuyết CSDL',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['NHAP-MON-LAP-TRINH'],
      corequisites: ['DB-TH'],
      previousCourses: [],
      departmentId: 's-cntt',
      courseId: 'c-db'
    },
    {
      id: 'm-ml-lt',
      code: 'ML-LT',
      name: 'Lý thuyết Máy học',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['DB-LT', 'XSTK'],
      corequisites: ['ML-TH'],
      previousCourses: ['DS-LT'],
      departmentId: 's-cntt',
      courseId: 'c-ml'
    },
    {
      id: 'm-ml-th',
      code: 'ML-TH',
      name: 'Thực hành Máy học',
      credits: 2,
      theoryCredits: 0,
      practiceCredits: 2,
      prerequisites: ['ML-LT'],
      corequisites: [],
      previousCourses: ['PYTHON-CB'],
      departmentId: 's-cntt',
      courseId: 'c-ml'
    },
    {
      id: 'm-ds-lt',
      code: 'DS-LT',
      name: 'Lý thuyết Khai phá DL',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['DB-LT'],
      corequisites: ['DS-TH'],
      previousCourses: ['TOAN-RIENG'],
      departmentId: 's-cntt',
      courseId: 'c-ds'
    },
    {
      id: 'm-mkt-cb-lt',
      code: 'MKT-LT',
      name: 'Lý thuyết Marketing CB',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['KINH-TE-VM'],
      corequisites: [],
      previousCourses: [],
      departmentId: 's-kinhte',
      courseId: 'c-mkt-cb'
    },
    {
      id: 'm-tc-co-ban-lt',
      code: 'FIN-LT',
      name: 'Lý thuyết Tài chính CB',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['NGUYEN-LY-KE-TOAN'],
      corequisites: [],
      previousCourses: ['KINH-TE-VM'],
      departmentId: 's-kinhte',
      courseId: 'c-tc-co-ban'
    },
    {
      id: 'm-dtdc-mt',
      code: 'DTDC-LT',
      name: 'Mạch tương tự LT',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['DIEN-TU-CB'],
      corequisites: ['DTDC-TH'],
      previousCourses: [],
      departmentId: 's-dientu',
      courseId: 'c-dtdc-1'
    },
    {
      id: 'm-cokhi-nlm',
      code: 'CK-NLM',
      name: 'Nguyên lý máy LT',
      credits: 3,
      theoryCredits: 3,
      practiceCredits: 0,
      prerequisites: ['CO-HOC-LY-THUYET'],
      corequisites: [],
      previousCourses: ['HINH-HOC-VE'],
      departmentId: 's-cokhi',
      courseId: 'c-cokhi-1'
    }
  ],
  tuition: {
    theoryRate: 350000,
    practiceRate: 280000
  }
};
