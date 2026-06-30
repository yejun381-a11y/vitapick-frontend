import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getOrderComplete,
    getOrderItems,
    getOrderPay
} from '../../service/order/orderApi';

import './OrderComplete.css';

function OrderComplete() {

    const navigate = useNavigate();
    const { ordNo } = useParams();

    /* 주문 정보 */
    const [order, setOrder] = useState(null);

    /* 주문 상품 */
    const [orderItems, setOrderItems] = useState([]);

    /* 결제 정보 */
    const [pay, setPay] = useState(null);

    /* 주문 정보 조회 */
    useEffect(() => {
        if (!ordNo) {
            return;
        }

        getOrderComplete(ordNo)
            .then(res => {
                setOrder(res);

                return Promise.all([
                    getOrderItems(res.ordId),
                    getOrderPay(res.ordId)
                ]);
            })
            .then(([itemsRes, payRes]) => {
                setOrderItems(itemsRes || []);
                setPay(payRes || null);
            })
            .catch(err => {
                console.log(err);
                alert('주문 정보를 불러오지 못했습니다.');
            });
    }, [ordNo]);

    /* 결제수단 표시 */
    const getPayMethodName = (payMthdCd) => {
        if (payMthdCd === 'CARD') {
            return '카드결제';
        }

        if (payMthdCd === 'BANK') {
            return '무통장입금';
        }

        return '-';
    };

    return (
        <div className="orderCompletePage">

            <div className="orderCompleteBox">

                <h2 className="completeTitle">
                    주문이 완료되었습니다.
                </h2>

                <p className="completeText">
                    주문번호 : {ordNo}
                </p>

                {orderItems.length > 0 && (
                    <div className="completeItemList">

                        <h3 className="completeItemTitle">
                            주문 상품
                        </h3>

                        {orderItems.map(item => (
                            <div
                                key={item.ordItId}
                                className="completeItem"
                            >
                                <img
                                    src={item.thumbImgUrl}
                                    alt={item.prdNm}
                                    className="completeItemImg"
                                />

                                <div className="completeItemInfo">
                                    <strong>{item.prdNm}</strong>
                                    <span>수량 {item.itQty}개</span>
                                </div>

                                <div className="completeItemPrice">
                                    {Number(item.itAmt || 0).toLocaleString()}원
                                </div>
                            </div>
                        ))}

                        {order && (
                            <div className="completeInfoBox">

                                <div className="completeInfoRow">
                                    <span>배송 요청사항</span>
                                    <strong>
                                        {order.reqMsg || '없음'}
                                    </strong>
                                </div>

                                <div className="completeInfoRow">
                                    <span>결제수단</span>
                                    <strong>
                                        {getPayMethodName(pay?.payMthdCd)}
                                    </strong>
                                </div>

                            </div>
                        )}

                        {order && (
                            <div className="completeTotal">
                                <span>총 결제금액</span>
                                <strong>
                                    {Number(order.totalAmt || 0).toLocaleString()}원
                                </strong>
                            </div>
                        )}

                    </div>
                )}

                <div className="completeBtnBox">

                    <button
                        type="button"
                        className="homeBtn"
                        onClick={() => navigate('/')}
                    >
                        홈으로
                    </button>

                    <button
                        type="button"
                        className="completeOrderBtn"
                        onClick={() => navigate(`/mypage/myorder/${ordNo}`)}
                    >
                        주문내역 보기
                    </button>

                </div>

            </div>

        </div>
    );
}

export default OrderComplete;