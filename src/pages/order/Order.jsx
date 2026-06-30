import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    getOrderAddressList,
    createOrder
} from '../../service/order/orderApi';

import './Order.css';
import UserAddrForm from '../mypage/myaddress/UserAddrForm';

function Order() {

    const navigate = useNavigate();
    const location = useLocation();

    /* 바로구매 상품 */
    const directOrderList = location.state?.prdList || [];

    /* 장바구니 선택 상품 */
    const cartOrderList = location.state?.cartOrderList || [];

    /* 주문 타입 */
    const isDirectOrder = directOrderList.length > 0;
    const isCartStateOrder = cartOrderList.length > 0;

    /* 주문상품 */
    const [orderItemList, setOrderItemList] = useState([]);

    /* 배송지 */
    const [addrList, setAddrList] = useState([]);
    const [selectedAddrId, setSelectedAddrId] = useState('');
    const [selectedAddr, setSelectedAddr] = useState(null);

    /* 모달에서 선택 중인 배송지 */
    const [modalSelectedAddrId, setModalSelectedAddrId] = useState('');
    const [modalSelectedAddr, setModalSelectedAddr] = useState(null);

    /* 배송 요청사항 */
    const [reqMsg, setReqMsg] = useState('');
    const [customReqMsg, setCustomReqMsg] = useState('');

    /* 배송지 모달 */
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [addrModalMode, setAddrModalMode] = useState('list');

    /* 결제수단 */
    const [payMthdCd, setPayMthdCd] = useState('CARD');

    /* 금액 */
    const totalAmt = orderItemList.reduce((sum, item) => {
        const price = item.price || 0;
        const qty = item.itQty || item.it_qty || 1;

        return sum + price * qty;
    }, 0);

    /* 초기 데이터 */
    useEffect(() => {

        if (isDirectOrder) {
            setOrderItemList(directOrderList);
            fetchAddressList();
            return;
        }

        if (isCartStateOrder) {
            setOrderItemList(cartOrderList);
            fetchAddressList();
            return;
        }

        alert('선택된 상품이 없습니다.');
        navigate('/cart');
    }, []);

    /* 배송지 목록 조회 */
    const fetchAddressList = () => {
        getOrderAddressList()
            .then(res => {
                const list = res || [];

                setAddrList(list);

                const baseAddr = list.find(addr => addr.baseYn === 'Y');

                if (baseAddr) {
                    setSelectedAddrId(String(baseAddr.addrId));
                    setSelectedAddr(baseAddr);
                    setModalSelectedAddrId(String(baseAddr.addrId));
                    setModalSelectedAddr(baseAddr);
                } else if (list.length > 0) {
                    setSelectedAddrId(String(list[0].addrId));
                    setSelectedAddr(list[0]);
                    setModalSelectedAddrId(String(list[0].addrId));
                    setModalSelectedAddr(list[0]);
                } else {
                    setSelectedAddrId('');
                    setSelectedAddr(null);
                    setModalSelectedAddrId('');
                    setModalSelectedAddr(null);
                }
            })
            .catch(err => {
                console.log(err);
                alert('배송지 목록 조회에 실패했습니다.');
            });
    };

    /* 배송지 모달 열기 */
    const handleOpenAddrModal = () => {
        setAddrModalMode(addrList.length === 0 ? 'add' : 'list');
        setModalSelectedAddrId(selectedAddrId);
        setModalSelectedAddr(selectedAddr);
        setIsAddrModalOpen(true);
    };

    /* 배송지 모달 닫기 */
    const handleCloseAddrModal = () => {
        setIsAddrModalOpen(false);
        setAddrModalMode('list');
        setModalSelectedAddrId(selectedAddrId);
        setModalSelectedAddr(selectedAddr);
    };

    /* 모달 배송지 선택 */
    const handleModalSelectAddr = (addr) => {
        setModalSelectedAddrId(String(addr.addrId));
        setModalSelectedAddr(addr);
    };

    /* 배송지 선택 완료 */
    const handleConfirmAddr = () => {
        if (!modalSelectedAddrId || !modalSelectedAddr) {
            alert('배송지를 선택해주세요.');
            return;
        }

        setSelectedAddrId(modalSelectedAddrId);
        setSelectedAddr(modalSelectedAddr);
        handleCloseAddrModal();
    };

    /* 배송지 저장 성공 */
    const handleAddrSuccess = () => {
        setAddrModalMode('list');
        fetchAddressList();
    };

    /* 주문하기 */
    const handleOrder = () => {

        if (!selectedAddrId) {
            alert('배송지를 선택해주세요.');
            return;
        }

        if (orderItemList.length === 0) {
            alert('주문할 상품이 없습니다.');
            return;
        }

        const finalReqMsg =
            reqMsg === 'direct'
                ? customReqMsg.trim()
                : reqMsg;

        if (reqMsg === 'direct' && finalReqMsg === '') {
            alert('요청사항을 입력해주세요.');
            return;
        }

        const prdList = orderItemList.map(item => {
            const qty = item.itQty || item.it_qty || 1;
            const price = item.price || 0;

            return {
                prdId: item.prdId,
                cusId: item.cusId || null,
                prdNm: item.prdNm,
                itQty: qty,
                price,
                itAmt: price * qty
            };
        });

        const orderData = {
            addrId: Number(selectedAddrId),
            totalAmt,
            reqMsg: finalReqMsg,
            payDto: {
                payMthdCd
            }
        };

        if (isDirectOrder) {
            orderData.prdList = prdList;
        }

        createOrder(orderData)
            .then(res => {
                alert('주문이 완료되었습니다.');
                navigate(`/order/complete/${res.ordNo}`);
            })
            .catch(err => {
                console.log(err);
                alert(err.response?.data || '주문 생성에 실패했습니다.');
            });
    };

    return (
        <div className="orderPage">

            <h2 className="orderTitle">주문서</h2>

            <div className="orderContent">

                <div className="orderLeft">

                    <section className="orderSection">
                        <div className="orderSectionTop">
                            <h3>배송지</h3>

                            <button
                                type="button"
                                className="addAddrBtn"
                                onClick={handleOpenAddrModal}
                            >
                                {addrList.length === 0 ? '배송지 추가' : '배송지 변경'}
                            </button>
                        </div>

                        {selectedAddr ? (
                            <div className="selectedAddrBox">
                                <div className="addrNameRow">
                                    <strong>{selectedAddr.addrNm}</strong>

                                    {selectedAddr.baseYn === 'Y' && (
                                        <span>기본 배송지</span>
                                    )}
                                </div>

                                <p>{selectedAddr.rcvNm} / {selectedAddr.rcvTel}</p>
                                <p>[{selectedAddr.zipCd}] {selectedAddr.addr1} {selectedAddr.addr2}</p>
                            </div>
                        ) : (
                            <div className="emptyAddrBox">
                                <p>등록된 배송지가 없습니다.</p>
                            </div>
                        )}
                    </section>

                    <section className="orderSection">
                        <h3>주문 요청사항</h3>

                        <select
                            value={reqMsg}
                            onChange={(e) => setReqMsg(e.target.value)}
                            className="orderRequestSelect"
                        >
                            <option value="">요청사항을 선택해주세요</option>
                            <option value="배송 전 연락주세요">배송 전 연락주세요</option>
                            <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
                            <option value="부재 시 경비실에 맡겨주세요">부재 시 경비실에 맡겨주세요</option>
                            <option value="택배함에 보관해주세요">택배함에 보관해주세요</option>
                            <option value="direct">직접 입력</option>
                        </select>

                        {reqMsg === 'direct' && (
                            <textarea
                                className="orderRequestTextarea"
                                placeholder="요청사항을 입력해주세요."
                                value={customReqMsg}
                                onChange={(e) => setCustomReqMsg(e.target.value)}
                            />
                        )}
                    </section>

                    <section className="orderSection">
                        <h3>주문 상품</h3>

                        <div className="orderItemList">
                            {orderItemList.map((item, index) => {
                                const qty = item.itQty || item.it_qty || 1;
                                const price = item.price || 0;
                                const itemAmt = price * qty;

                                return (
                                    <div
                                        className="orderItem"
                                        key={item.cartId || item.prdId || index}
                                    >
                                        <img
                                            src={item.thumbImgUrl}
                                            alt={item.prdNm}
                                            className="orderItemImg"
                                        />

                                        <div className="orderItemInfo">
                                            <strong>{item.prdNm}</strong>
                                            <p>{item.brand}</p>
                                            <span>수량 {qty}개</span>
                                        </div>

                                        <div className="orderItemPrice">
                                            {itemAmt.toLocaleString()}원
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="orderSection">
                        <h3>결제수단</h3>

                        <div className="payMethodBox">
                            <label className={payMthdCd === 'CARD' ? 'active' : ''}>
                                <input
                                    type="radio"
                                    name="pay"
                                    checked={payMthdCd === 'CARD'}
                                    onChange={() => setPayMthdCd('CARD')}
                                />
                                카드결제
                            </label>

                            <label className={payMthdCd === 'BANK' ? 'active' : ''}>
                                <input
                                    type="radio"
                                    name="pay"
                                    checked={payMthdCd === 'BANK'}
                                    onChange={() => setPayMthdCd('BANK')}
                                />
                                무통장입금
                            </label>
                        </div>
                    </section>
                </div>

                <aside className="orderSummary">
                    <h3>결제금액</h3>

                    <div className="summaryTotal">
                        <span>총 결제금액</span>
                        <strong>{totalAmt.toLocaleString()}원</strong>
                    </div>

                    <button
                        type="button"
                        className="orderBtn"
                        onClick={handleOrder}
                        disabled={addrList.length === 0}
                    >
                        주문하기
                    </button>
                </aside>
            </div>

            {isAddrModalOpen && (
                <div className="addrModalBg">
                    <div className="addrModalBox addrSelectModalBox">

                        <button
                            type="button"
                            className="addrModalCloseBtn"
                            onClick={handleCloseAddrModal}
                        >
                            ×
                        </button>

                        {addrModalMode === 'add' ? (
                            <UserAddrForm
                                onSuccess={handleAddrSuccess}
                                onClose={() => {
                                    if (addrList.length === 0) {
                                        handleCloseAddrModal();
                                        return;
                                    }

                                    setAddrModalMode('list');
                                }}
                            />
                        ) : (
                            <>
                                <h3 className="addrModalTitle addrSelectTitle">
                                    배송지 선택
                                </h3>

                                <button
                                    type="button"
                                    className="addrAddLineBtn"
                                    onClick={() => setAddrModalMode('add')}
                                >
                                    + 배송지 추가
                                </button>

                                <div className="addrList addrSelectList">
                                    {addrList.map(addr => (
                                        <button
                                            type="button"
                                            key={addr.addrId}
                                            className={`addrSelectCard ${modalSelectedAddrId === String(addr.addrId) ? 'active' : ''}`}
                                            onClick={() => handleModalSelectAddr(addr)}
                                        >
                                            <div className="addrSelectRadio">
                                                {modalSelectedAddrId === String(addr.addrId) && (
                                                    <span />
                                                )}
                                            </div>

                                            <div className="addrSelectInfo">
                                                <div className="addrNameRow">
                                                    <strong>{addr.addrNm}</strong>

                                                    {addr.baseYn === 'Y' && (
                                                        <span>기본 배송지</span>
                                                    )}
                                                </div>

                                                <p>{addr.rcvNm} / {addr.rcvTel}</p>
                                                <p>[{addr.zipCd}] {addr.addr1} {addr.addr2}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="addrConfirmBtn"
                                    onClick={handleConfirmAddr}
                                >
                                    선택 완료
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Order;