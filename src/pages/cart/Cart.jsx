import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getCartList,
    updateCartQty,
    updateCartSelectedYn,
    updateAllCartSelectedYn,
    deleteSelectedCart
} from '../../service/cart/cartApi';

import './Cart.css';

function Cart() {

    const navigate = useNavigate();

    /* 장바구니 목록 */
    const [cartList, setCartList] = useState([]);

    /* 장바구니 조회 */
    useEffect(() => {
        fetchCartList();
    }, []);

    /* 장바구니 목록 조회 */
    const fetchCartList = async () => {
        try {
            const res = await getCartList();
            console.log('장바구니 응답', res);
            setCartList(Array.isArray(res) ? res : []);
        } catch (err) {
            console.log(err);
            alert('장바구니 목록 조회에 실패했습니다.');
        }
    };

    /* 수량 증가 */
    const plusQty = async (cartId, currentQty) => {
        try {
            await updateCartQty(cartId, {
                itQty: currentQty + 1
            });

            fetchCartList();

        } catch (err) {
            alert(err.response?.data || '수량 변경 실패');
        }
    };

    /* 수량 감소 */
    const minusQty = async (cartId, currentQty) => {
        if (currentQty <= 1) {
            return;
        }

        try {
            await updateCartQty(cartId, {
                itQty: currentQty - 1
            });

            fetchCartList();

        } catch (err) {
            alert(err.response?.data || '수량 변경 실패');
        }
    };


    /* 삭제 */
    const handleDeleteSelected = async () => {

        if (selectedCartList.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }

        const confirmDelete = window.confirm('선택한 상품을 삭제하시겠습니까?');

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteSelectedCart();
            alert('선택한 상품이 삭제되었습니다.');
            fetchCartList();
        } catch (err) {
            alert(err.response?.data || '삭제 실패');
        }
    };

    /* 개별 선택 */
    const toggleSelectedYn = async (item) => {
        try {
            await updateCartSelectedYn(item.cartId, {
                selectedYn: item.selectedYn === 'Y' ? 'N' : 'Y'
            });

            fetchCartList();

        } catch (err) {
            alert(err.response?.data || '상품 선택 상태 변경에 실패했습니다.');
        }
    };

    /* 선택 상품 */
    const selectedCartList = useMemo(() => {
        return cartList.filter(item => item.selectedYn === 'Y');
    }, [cartList]);

    /* 전체 선택 여부 */
    const isAllSelected = useMemo(() => {
        return cartList.length > 0 && cartList.every(item => item.selectedYn === 'Y');
    }, [cartList]);

    /* 전체 선택 */
    const toggleAllSelectedYn = async () => {
        if (cartList.length === 0) {
            return;
        }

        const nextSelectedYn = isAllSelected ? 'N' : 'Y';

        try {
            await updateAllCartSelectedYn({
                selectedYn: nextSelectedYn
            });

            fetchCartList();

        } catch (err) {
            alert(err.response?.data || '전체 선택 상태 변경에 실패했습니다.');
        }
    };

    /* 커스텀 묶음 전체 선택 여부 */
    const isCustomGroupSelected = (items) => {
        return items.length > 0 && items.every(item => item.selectedYn === 'Y');
    };

    /* 커스텀 묶음 전체 선택 */
    const toggleCustomGroupSelectedYn = async (items) => {
        const isSelected = isCustomGroupSelected(items);
        const nextSelectedYn = isSelected ? 'N' : 'Y';

        try {
            await Promise.all(
                items.map(item =>
                    updateCartSelectedYn(item.cartId, {
                        selectedYn: nextSelectedYn
                    })
                )
            );

            fetchCartList();

        } catch (err) {
            alert(err.response?.data || '묶음 선택 상태 변경에 실패했습니다.');
        }
    };

    /* 총 상품 금액 */
    const totalPrice = useMemo(() => {
        return selectedCartList.reduce(
            (sum, item) => sum + (item.price * item.itQty),
            0
        );
    }, [selectedCartList]);

    /* 최종 결제 금액 */
    const finalPrice = totalPrice;

    /* 커스텀 비타민 그룹 */
    const customCartGroups = useMemo(() => {
        const groupObj = {};

        (cartList || [])
            .filter(item => item.cusId !== null)
            .forEach(item => {
                if (!groupObj[item.cusId]) {
                    groupObj[item.cusId] = [];
                }

                groupObj[item.cusId].push(item);
            });

        return Object.entries(groupObj)
            .map(([cusId, items]) => ({
                cusId: Number(cusId),
                items,
                cusReason: items[0]?.cusReason,
                surTitle: items[0]?.surTitle
            }))
            .sort((a, b) => b.cusId - a.cusId);
    }, [cartList]);


    /* 일반 상품 목록 */
    const normalCartList = useMemo(() => {
        return (cartList || []).filter(item => item.cusId === null);
    }, [cartList]);



    /* 주문하기 */
    const handleOrder = () => {

        if (selectedCartList.length === 0) {
            alert('주문할 상품을 선택해주세요.');
            return;
        }

        navigate('/order', {
            state: {
                cartOrderList: selectedCartList
            }
        });
    };

    return (
        <div className="cartPage">

            {/* 상단 */}
            <div className="cartTop">
                <h2 className="cartTitle">
                    장바구니
                </h2>

                <button
                    type="button"
                    className="deleteAllBtn"
                    onClick={handleDeleteSelected}
                >
                    삭제
                </button>
            </div>

            {/* 선택 영역 */}
            <div className="cartSelectBox">
                <label className="allCheckLabel">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleAllSelectedYn}
                    />
                    전체 선택
                </label>

                <p className="selectedCount">
                    선택 상품 {selectedCartList.length}개
                </p>
            </div>

            {/* 장바구니 본문 */}
            <div className="cartLayout">

                {/* 상품 영역 */}
                <div className="cartListArea">

                    {/* 커스텀 비타민 */}
                    <section className="cartSection">
                        <h3 className="sectionTitle">
                            커스텀 비타민
                        </h3>

                        {
                            customCartGroups.length === 0 ? (
                                <p className="emptyText">
                                    커스텀 비타민 상품이 없습니다.
                                </p>
                            ) : (
                                customCartGroups.map((group, index) => (
                                    <div
                                        className="customGroup"
                                        key={group.cusId}
                                    >
                                        {/* 커스텀 묶음 제목 */}
                                        <div className="customGroupTitleBox">

                                            {/* 묶음 정보 */}
                                            <div className="customGroupInfo">
                                                <h4 className="customGroupTitle">
                                                    커스텀 비타민  {index + 1}
                                                </h4>

                                                <p className="customGroupSub">
                                                    설문 Title : {group.surTitle}
                                                </p>
                                            </div>

                                            {/* 묶음 선택 */}
                                            <label className="customGroupCheckLabel">
                                                <input
                                                    type="checkbox"
                                                    checked={isCustomGroupSelected(group.items)}
                                                    onChange={() => toggleCustomGroupSelectedYn(group.items)}
                                                />
                                                묶음 전체 선택
                                            </label>
                                        </div>

                                        {/* 추천 사유 */}
                                        {
                                            group.cusReason && (
                                                <p className="customReason">
                                                    추천 사유 : {group.cusReason}
                                                </p>
                                            )
                                        }

                                        {/* 커스텀 상품 목록 */}
                                        {
                                            group.items.map(item => (
                                                <div className="cartItem" key={item.cartId}>

                                                    {/* 체크박스 */}
                                                    <div className="cartCheckBox">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.selectedYn === 'Y'}
                                                            onChange={() => toggleSelectedYn(item)}
                                                        />
                                                    </div>

                                                    {/* 상품 이미지 */}
                                                    <div className="cartImgBox">
                                                        <img
                                                            src={item.thumbImgUrl}
                                                            alt={item.prdNm}
                                                            className="cartImg"
                                                        />
                                                    </div>

                                                    {/* 상품 정보 */}
                                                    <div className="cartInfo">
                                                        <p className="cartBrand">
                                                            {item.brand}
                                                        </p>

                                                        <p className="cartPrdNm">
                                                            {item.prdNm}
                                                        </p>

                                                        <p className="cartPrice">
                                                            {item.price?.toLocaleString()}원
                                                        </p>
                                                    </div>

                                                    {/* 수량 버튼 */}
                                                    <div className="cartBtnBox">
                                                        <button
                                                            type="button"
                                                            onClick={() => minusQty(item.cartId, item.itQty)}
                                                        >
                                                            -
                                                        </button>

                                                        <p className="qtyText">
                                                            {item.itQty}
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() => plusQty(item.cartId, item.itQty)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                </div>
                                            ))
                                        }
                                    </div>
                                ))
                            )
                        }
                    </section>

                    {/* 일반 상품 */}
                    <section className="cartSection">
                        <h3 className="sectionTitle">
                            일반 상품
                        </h3>

                        <div className="normalGroup">

                            {
                                normalCartList.length === 0 ? (
                                    <p className="emptyText">
                                        일반 상품이 없습니다.
                                    </p>
                                ) : (
                                    normalCartList.map(item => (
                                        <div className="cartItem" key={item.cartId}>

                                            {/* 체크박스 */}
                                            <div className="cartCheckBox">
                                                <input
                                                    type="checkbox"
                                                    checked={item.selectedYn === 'Y'}
                                                    onChange={() => toggleSelectedYn(item)}
                                                />
                                            </div>

                                            {/* 상품 이미지 */}
                                            <div className="cartImgBox">
                                                <img
                                                    src={item.thumbImgUrl}
                                                    alt={item.prdNm}
                                                    className="cartImg"
                                                />
                                            </div>

                                            {/* 상품 정보 */}
                                            <div className="cartInfo">
                                                <p className="cartBrand">
                                                    {item.brand}
                                                </p>

                                                <p className="cartPrdNm">
                                                    {item.prdNm}
                                                </p>

                                                <p className="cartPrice">
                                                    {item.price?.toLocaleString()}원
                                                </p>
                                            </div>

                                            {/* 수량 버튼 */}
                                            <div className="cartBtnBox">
                                                <button
                                                    type="button"
                                                    onClick={() => minusQty(item.cartId, item.itQty)}
                                                >
                                                    -
                                                </button>

                                                <p className="qtyText">
                                                    {item.itQty}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => plusQty(item.cartId, item.itQty)}
                                                >
                                                    +
                                                </button>
                                            </div>

                                        </div>
                                    ))
                                )
                            }

                        </div>
                    </section>

                </div>

                {/* 결제 영역 */}
                <aside className="cartPayArea">

                    {/* 결제 금액 */}
                    <div className="cartSummaryBox">
                        <div className="summaryRow final">
                            <span>최종 결제금액</span>
                            <strong>{finalPrice.toLocaleString()}원</strong>
                        </div>
                    </div>

                    {/* 하단 버튼 */}
                    <div className="cartBottom">
                        <button
                            type="button"
                            className="orderBtn"
                            onClick={handleOrder}
                        >
                            주문하기
                        </button>
                    </div>

                </aside>

            </div>

        </div>
    );
}

export default Cart;