// Define route permissions based on role requirements
// ADMIN: Quản lý user, phân quyền, cấu hình hệ thống, xem log. KHÔNG tham gia nghiệp vụ dự án
// DIRECTOR: Xem Dashboard tổng hợp, xem báo cáo. KHÔNG chỉnh sửa dữ liệu, KHÔNG giao task
// PMO: Tạo/quản lý Dự án, tạo Main Task, gán Leader, theo dõi tiến độ, cảnh báo trễ hạn, tổng hợp báo cáo
// LEADER: Nhận Main Task, tạo Subtask, phân công Nhân viên, duyệt/trả lại Subtask, đánh giá tiến độ
// STAFF: Nhận/từ chối Subtask, cập nhật tiến độ, upload tài liệu, gửi trình duyệt

export const routePermissions = {
    '/dashboard': ['director', 'pmo', 'admin'],
    '/projects': ['pmo'], // ONLY PMO
    '/workspace/:id': ['pmo', 'leader'],
    '/my-overview': ['leader', 'staff'],
    '/tasks-board': ['leader', 'staff'],
    '/reports': ['director', 'pmo'],
    '/users': ['admin'],
    '/departments': ['admin'],
    '/settings': ['admin'],
    '/logs': ['admin'],
};

// Helper function to get default route based on role
export function getDefaultRouteForRole(role) {
    switch (role) {
        case 'director':
        case 'pmo':
        case 'admin':
            return '/dashboard';
        case 'leader':
        case 'staff':
            return '/my-overview';
        default:
            return '/dashboard';
    }
}
