import { apiCall } from '../apiService';

/* 배송지 목록 조회 */
export function getAddrList() {
    return apiCall.get('/api/address');
}

/* 기본 배송지 조회 */
export function getBaseAddr() {
    return apiCall.get('/api/address/base');
}

/* 배송지 등록 */
export function createAddr(data) {
    return apiCall.post('/api/address', data);
}

/* 배송지 수정 */
export function updateAddr(addrId, data) {
    return apiCall.patch(`/api/address/${addrId}`, data);
}

/* 배송지 삭제 */
export function deleteAddr(addrId) {
    return apiCall.delete(`/api/address/${addrId}`);
}

/* 기본 배송지 변경 */
export function updateBaseAddr(addrId) {
    return apiCall.patch(`/api/address/${addrId}/base`);
}