import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall, getToken } from '../../service/apiService';
import ProductReview from './ProductReview';
import ProductWish from './ProductWish';
import './ProductDetail.css';

const ProductDetail = () => {

    // URL에서 상품 ID 가져오기
    const { prdId } = useParams();

    // 페이지 이동 함수
    const navigate = useNavigate();

    // 상품 상세 정보
    const [prd, setPrd] = useState(null);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 현재 탭 상태: desc = 상품설명, rvw = 상품평
    const [activeTab, setActiveTab] = useState('desc');

    // 구매 수량
    const [quantity, setQuantity] = useState(1);

    // 상품설명 더보기 여부
    const [descExpanded, setDescExpanded] = useState(false);

    // 수량 감소
    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // 수량 증가
    const handleIncreaseQuantity = () => {
        if (quantity < 10) {
            setQuantity(quantity + 1);
        } else {
            alert('최대 10개까지 주문할 수 있습니다.');
        }
    };

    // 로그인 체크
    const checkLogin = () => {
        const token = getToken();

        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/v1/auth/login');
            return false;
        }

        return true;
    };

    const handleBuyNow = () => {
        if (!checkLogin()) return;

        navigate('/order', {
            state: {
                prdList: [
                    {
                        prdId: Number(prdId),
                        prdNm: prd.prdNm,
                        brand: prd.brand,
                        price: prd.price,
                        thumbImgUrl: prd.thumbImgUrl,
                        itQty: quantity
                    }
                ]
            }
        });
    };

    // 상품 상세 정보 가져오기
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await apiCall.get(`/api/v1/product/detail/${prdId}`);
                setPrd(data);
            } catch (err) {
                console.error('상품 상세 오류:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [prdId]);

    // 로딩 중 화면
    if (loading) return <div className='detail_loading'>로딩 중...</div>;

    // 상품이 없을 때 화면
    if (!prd) return <div className='detail_loading'>상품을 찾을 수 없습니다.</div>;

    return (
        <div className='detail_container'>

            {/* 상단 상품 정보 */}
            <div className='detail_top'>

                {/* 상품 이미지 */}
                <div className='detail_img_box'>
                    <img src={prd.thumbImgUrl} alt={prd.prdNm} />
                </div>

                {/* 상품 기본 정보 */}
                <div className='detail_info'>
                    <p className='detail_brand'>{prd.brand}</p>
                    <h2 className='detail_nm'>{prd.prdNm}</h2>

                    {/* 상품 1개 가격 */}
                    <strong className='detail_price'>
                        {prd.price.toLocaleString()}원
                    </strong>

                    {/* 수량 선택 영역 */}
                    <div className='detail_quantity_box'>
                        <button
                            className='quantity_btn'
                            onClick={handleDecreaseQuantity}
                        >
                            -
                        </button>

                        <span className='quantity_num'>
                            {quantity}
                        </span>

                        <button
                            className='quantity_btn'
                            onClick={handleIncreaseQuantity}
                            disabled={quantity >= 10}
                        >
                            +
                        </button>
                    </div>

                    {/* 수량에 따른 총 가격 */}
                    <div className='detail_total_price_box'>
                        <span>총 상품금액</span>
                        <strong>
                            {(prd.price * quantity).toLocaleString()}원
                        </strong>
                    </div>

                    {/* 버튼 영역 */}
                    <div className='detail_btns'>

                        {/* 장바구니 버튼 */}
                        <button
                            className='detail_cart_btn'
                                onClick={async () => {
                                    if (!checkLogin()) return;

                                    try {
                                        await apiCall.post('/api/cart', {
                                        userNum: sessionStorage.getItem('userNum'),
                                        prdId: Number(prdId),
                                        itQty: quantity,
                                        selectedYn: 'Y'
                                    });

                                    const go = window.confirm('장바구니에 담았습니다!\n장바구니로 이동하시겠습니까?');

                                    if (go) {
                                        navigate('/cart');
                                    }
                                } catch (err) {
                                    console.error('장바구니 담기 실패:', err);

                                    const message = err.response?.data?.message || err.response?.data;

                                    if (message) {
                                        alert(message);
                                    } else {
                                        alert('최대 구매 수량은 10개입니다.\n장바구니 수량과 추가 수량을 확인해 주세요.');
                                    }
                                }
                            }}
                        >
                            장바구니 담기
                        </button>

                        {/* 바로 구매 버튼 */}
                        <button
                            className='detail_buy_btn'
                            onClick={handleBuyNow}
                        >
                            바로 구매하기
                        </button>

                        {/* 찜하기 버튼 */}
                        <ProductWish prdId={prdId} />

                    </div>
                </div>
            </div>

            {/* 탭 버튼 */}
            <div className='detail_tabs'>
                <button
                    className={activeTab === 'desc' ? 'tab_active' : ''}
                    onClick={() => setActiveTab('desc')}
                >
                    상품설명
                </button>

                <button
                    className={activeTab === 'rvw' ? 'tab_active' : ''}
                    onClick={() => setActiveTab('rvw')}
                >
                    상품평
                </button>
            </div>

            {/* 탭 내용 */}
            <div className='detail_tab_content'>

                {/* 상품설명 탭 */}
                {activeTab === 'desc' && (
                    <div className={`detail_desc ${descExpanded ? 'expanded' : ''}`}>

                        {/* 상품 상세 이미지 */}
                        <img src={prd.detailImgUrl} alt='상품설명' />

                        {/* 상품설명 더보기 / 접기 */}
                        {!descExpanded ? (
                            <div className='detail_desc_more'>
                                <button onClick={() => setDescExpanded(true)}>
                                    상품설명 더보기 ∨
                                </button>
                            </div>
                        ) : (
                            <div className='detail_desc_close'>
                                <button onClick={() => setDescExpanded(false)}>
                                    상품설명 접기 ∧
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 상품평 탭 */}
                {activeTab === 'rvw' && (
                    <ProductReview prdId={prdId} />
                )}

            </div>
        </div>
    );
};

export default ProductDetail;