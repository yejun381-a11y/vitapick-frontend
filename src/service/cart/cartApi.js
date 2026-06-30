import { apiCall } from '../apiService';

/* 장바구니 */

/* 장바구니 목록 조회 */
/* 로그인한 본인 장바구니만 */
export function getCartList() {
    return apiCall.get('/api/cart');
}

/* 장바구니 담기 */
/* 로그인한 본인 장바구니에 담기 */
export function addCart(data) {
    return apiCall.post('/api/cart', data);
}

/* 장바구니 수량 변경 */
export function updateCartQty(cartId, data) {
    return apiCall.patch(
        `/api/cart/${cartId}/qty`,
        data
    );
}

/* 장바구니 선택 상태 변경 */
/* 체크박스 선택/해제 */
export function updateCartSelectedYn(cartId, data) {
    return apiCall.patch(
        `/api/cart/${cartId}/selected`,
        data
    );
}

/* 전체 선택 / 전체 해제 */
export function updateAllCartSelectedYn(data) {
    return apiCall.patch(
        '/api/cart/selected/all',
        data
    );
}

/* 선택 상품 삭제 */
export function deleteSelectedCart() {
    return apiCall.delete('/api/cart/selected');
}
