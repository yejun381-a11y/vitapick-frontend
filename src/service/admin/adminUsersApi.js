import { apiCall } from '../apiService';

// 관리자 회원 목록 조회 API
export function getAdminUsers(params) {
    return apiCall.get('/api/admin/users', { params });
}

// 관리자 회원 엑셀 다운로드 API
export function getAdminUserDetail(userNum) {
    return apiCall.get(`/api/admin/users/${userNum}`);
}
