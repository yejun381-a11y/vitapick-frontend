import { apiCall } from '../apiService';

// 관리자 리뷰 목록 조회 API
export function getAdminReviews(params) {
    return apiCall.get('/api/admin/reviews', { params });
}

// 관리자 리뷰 상세 조회 API
export function getAdminReviewDetail(rvwId) {
    return apiCall.get(`/api/admin/reviews/${rvwId}`);
}

// 관리자 리뷰 답글 저장 API
export function saveAdminReviewReply(rvwId, payload) {
    return apiCall.patch(`/api/admin/reviews/${rvwId}/reply`, payload);
}

// 관리자 리뷰 답글 삭제 API
export function deleteAdminReviewReply(rvwId) {
    return apiCall.delete(`/api/admin/reviews/${rvwId}/reply`);
}
