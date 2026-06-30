import { apiCall } from '../apiService';

// 관리자 주문 목록 조회 API
export function getAdminOrders(params) {
    return apiCall.get('/api/admin/orders', { params });
}
