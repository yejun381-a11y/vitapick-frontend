import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiCall } from '../../../service/apiService';

import './MyorderList.css';

function MyorderList() {

    const navigate = useNavigate();

    /* 로그인 회원번호 */
    const userNum = sessionStorage.getItem('userNum');

    /* 주문 목록 */
    const [orderList, setOrderList] = useState([]);

    /* 로딩 상태 */
    const [loading, setLoading] = useState(true);

    /* 주문 상태 한글 변환 */
    const ORDER_STATUS_TEXT = {
        PAID: '결제완료',
    };

    /* 주문 내역 조회 */
    useEffect(() => {

        const getOrderList = async () => {

            /* 로그인 체크 */
            if (!userNum) {

                alert('로그인이 필요한 서비스입니다.');
                navigate('/v1/auth/login');
                return;
            }

            try {

                /* 주문 목록 조회 */
                const data = await apiCall.get(`/api/order?userNum=${userNum}`);

                /* 주문 목록 저장 */
                setOrderList(data || []);

            } catch (error) {

                console.error('주문 내역 조회 실패:', error);
                alert('주문 내역을 불러오지 못했습니다.');

            } finally {

                /* 로딩 종료 */
                setLoading(false);
            }
        };

        getOrderList();

    }, [userNum, navigate]);

    /* 로딩 화면 */
    if (loading) {

        return (
            <p>주문 내역을 불러오는 중입니다...</p>
        );
    }

    return (

        <section className="myOrderList">

            {/* 주문 내역 상단 */}
            <div className="myOrderHeader">

                <h2>주문 내역</h2>

                <p>
                    주문하신 상품의 내역을 확인할 수 있습니다.
                </p>

            </div>

            {/* 주문 내역 없을 경우 */}
            {orderList.length === 0 ? (

                <div className="myOrderEmpty">

                    <p>주문 내역이 없습니다.</p>

                </div>

            ) : (

                /* 주문 내역 목록 */
                <div className="myOrderTableWrap">

                    <table className="myOrderTable">

                        {/* 테이블 헤더 */}
                        <thead>

                            <tr>
                                <th>주문번호</th>
                                <th>주문일</th>
                                <th>주문상태</th>
                                <th>결제금액</th>
                                <th>상세보기</th>
                            </tr>

                        </thead>

                        {/* 테이블 본문 */}
                        <tbody>

                            {orderList.map((order) => (

                                <tr key={order.ordId}>

                                    {/* 주문번호 */}
                                    <td>
                                        {order.ordNo}
                                    </td>

                                    {/* 주문일 */}
                                    <td>
                                        {order.crtAt?.slice(0, 10)}
                                    </td>

                                    {/* 주문상태 */}
                                    <td>

                                        <span className="myOrderStatus">

                                            {ORDER_STATUS_TEXT[order.ordStCd] || order.ordStCd}

                                        </span>

                                    </td>

                                    {/* 결제금액 */}
                                    <td>

                                        {order.totalAmt?.toLocaleString()}원

                                    </td>

                                    {/* 주문 상세보기 */}
                                    <td>

                                        <button
                                            type="button"
                                            className="myOrderDetailBtn"
                                            onClick={() =>
                                                navigate(`/mypage/myorder/${order.ordNo}`)
                                            }
                                        >
                                            상세보기
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </section>

    );
}

export default MyorderList;