import { apiCall } from '../apiService';

// 관리자 공지사항 목록 조회 API
export function getAdminCsNotices(params) {
    return apiCall.get('/api/admin/cscenter/notices', { params });
}

// 관리자 공지사항 상세 조회 API
export function getAdminCsNoticeDetail(ntcId) {
    return apiCall.get(`/api/admin/cscenter/notices/${ntcId}`);
}

// 관리자 공지사항 등록 API
export function createAdminCsNotice(data) {
    return apiCall.post('/api/admin/cscenter/notices', data);
}

// 관리자 공지사항 수정 API
export function updateAdminCsNotice(ntcId, data) {
    return apiCall.patch(`/api/admin/cscenter/notices/${ntcId}`, data);
}

// 관리자 공지사항 삭제 API
export function deleteAdminCsNotice(ntcId) {
    return apiCall.delete(`/api/admin/cscenter/notices/${ntcId}`);
}

// 관리자 FAQ 목록 조회 API
export function getAdminCsFaqs(params) {
    return apiCall.get('/api/admin/cscenter/faqs', { params });
}

// 관리자 FAQ 등록 API
export function createAdminCsFaq(data) {
    return apiCall.post('/api/admin/cscenter/faqs', data);
}

// 관리자 FAQ 수정 API
export function updateAdminCsFaq(faqId, data) {
    return apiCall.patch(`/api/admin/cscenter/faqs/${faqId}`, data);
}

// 관리자 FAQ 상세 조회 API
export function getAdminCsFaqDetail(faqId) {
    return apiCall.get(`/api/admin/cscenter/faqs/${faqId}`);
}

// 관리자 FAQ 삭제 API
export function deleteAdminCsFaq(faqId) {
    return apiCall.delete(`/api/admin/cscenter/faqs/${faqId}`);
}

// 관리자 1:1 문의 목록 조회 API
export function getAdminCsInquiries(params) {
    return apiCall.get('/api/admin/cscenter/inquiries', { params });
}

// 관리자 1:1 문의 상세 조회 API
export function getAdminCsInquiryDetail(inqId) {
    return apiCall.get(`/api/admin/cscenter/inquiries/${inqId}`);
}

// 관리자 1:1 문의 답변 저장 API
export function saveAdminCsInquiryAnswer(inqId, data) {
    return apiCall.patch(`/api/admin/cscenter/inquiries/${inqId}/answer`, data);
}
