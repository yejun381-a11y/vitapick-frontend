import { apiCall } from '../apiService';

// 관리자 대시보드 요약 조회 API
export function getAdminDashboardSummary() {
    return apiCall.get('/api/admin/dashboard/summary');
}

export function checkAdminAuth() {
    return apiCall.get('/api/admin/check');
}

export function downloadAdminDashboardExcel() {
    return apiCall.get('/api/admin/dashboard/excel', {
        responseType: 'blob'
    });
}
