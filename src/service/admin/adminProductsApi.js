import { apiCall } from '../apiService';

// 관리자 상품 목록 조회 API
export function getAdminProducts(params) {
    return apiCall.get('/api/admin/products', { params });
}

export function getAdminProductDetail(prdId) {
    return apiCall.get(`/api/admin/products/${prdId}`);
}

export function updateAdminProduct(prdId, payload) {
    return apiCall.patch(`/api/admin/products/${prdId}`, payload);
}
