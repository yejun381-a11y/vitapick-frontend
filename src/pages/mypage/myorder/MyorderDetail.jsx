import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getOrderDetail,
    getOrderItems,
    getOrderPay
} from '../../../service/order/orderApi';

import './MyorderDetail.css';

function MyorderDetail() {

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 주문번호 파라미터 */
    const { ordNo } = useParams();

    /* 주문 정보 */
    const [order, setOrder] = useState(null);

    /* 주문 상품 목록 */
    const [orderItems, setOrderItems] = useState([]);

    /* 결제 정보 */
    const [payment, setPayment] = useState(null);

    /* 로딩 상태 */
    const [loading, setLoading] = useState(true);

    /* 주문 상태 한글 변환 */
    const ORDER_STATUS_TEXT = {
        PAID: '결제완료',
    };

    /* 결제 수단 한글 변환 */
    const PAYMENT_METHOD_TEXT = {
        CARD: '카드',
        BANK: '무통장입금'
    };

    /* 주문 상세 조회 */
    useEffect(() => {

        const loadOrderDetail = async () => {

            try {

                /* 주문 기본 정보 조회 */
                const orderData = await getOrderDetail(ordNo);
                setOrder(orderData);

                /* 주문 상품 조회 */
                const itemsData = await getOrderItems(orderData.ordId);
                setOrderItems(itemsData || []);

                /* 결제 정보 조회 */
                const payData = await getOrderPay(orderData.ordId);
                setPayment(payData);

            } catch (error) {

                console.error('주문 상세 조회 실패:', error);
                console.error('응답 내용:', error.response?.data);

                alert(
                    error.response?.data ||
                    '주문 상세 정보를 불러오지 못했습니다.'
                );

            } finally {

                /* 로딩 종료 */
                setLoading(false);
            }
        };

        loadOrderDetail();

    }, [ordNo]);

    /* 로딩 화면 */
    if (loading) {
        return <p>주문 상세 정보를 불러오는 중입니다...</p>;
    }

    /* 주문 정보 없음 */
    if (!order) {
        return <p>주문 정보를 찾을 수 없습니다.</p>;
    }

    return (

        <section className="myOrderDetail">

            {/* 주문 상세 헤더 */}
            <div className="myOrderDetailHeader">

                <h2>주문 상세</h2>

                <p>
                    주문번호 {order.ordNo}
                </p>

            </div>

            {/* 주문 정보 영역 */}
            <div className="myOrderInfoBox">

                {/* 주문일 */}
                <div>

                    <strong>주문일</strong>

                    <span>
                        {order.crtAt?.slice(0, 10)}
                    </span>

                </div>

                {/* 주문상태 */}
                <div>

                    <strong>주문상태</strong>

                    <span>
                        {ORDER_STATUS_TEXT[order.ordStCd] || order.ordStCd}
                    </span>

                </div>

                {/* 결제금액 */}
                <div>

                    <strong>결제금액</strong>

                    <span>
                        {order.totalAmt?.toLocaleString()}원
                    </span>

                </div>

                {/* 결제수단 */}
                <div>

                    <strong>결제수단</strong>

                    <span>
                        {PAYMENT_METHOD_TEXT[payment?.payMthdCd] ||
                            payment?.payMthdCd ||
                            '-'}
                    </span>

                </div>

            </div>

            {/* 주문 상품 영역 */}
            <div className="myOrderItemBox">

                <h3>주문 상품</h3>

                {/* 주문 상품 없음 */}
                {orderItems.length === 0 ? (

                    <p className="myOrderItemEmpty">
                        주문 상품 정보가 없습니다.
                    </p>

                ) : (

                    /* 주문 상품 목록 */
                    orderItems.map((item) => (

                        <div
                            className="myOrderItem"
                            key={item.ordItId}
                        >

                            {/* 상품 이미지 */}
                            <img
                                src={item.thumbImgUrl}
                                alt={item.prdNm}
                                className="myOrderItemImg"
                            />

                            {/* 상품 정보 */}
                            <div className="myOrderItemInfo">

                                {/* 상품명 */}
                                <strong>
                                    {item.prdNm}
                                </strong>

                                {/* 수량 및 단가 */}
                                <p>
                                    수량 {item.itQty}개 ·{' '}
                                    {Number(item.price || 0).toLocaleString()}원
                                </p>

                            </div>

                            {/* 상품 금액 */}
                            <span className="myOrderItemPrice">

                                {Number(item.itAmt || 0).toLocaleString()}원

                            </span>

                        </div>

                    ))
                )}

            </div>

            {/* 하단 버튼 영역 */}
            <div className="myOrderDetailButtons">

                {/* 목록 이동 버튼 */}
                <button
                    type="button"
                    onClick={() => navigate('/mypage/myorder')}
                >
                    목록으로
                </button>

            </div>

        </section>
    );
}

export default MyorderDetail;