import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../service/apiService';
import './MyWishList.css';

export default function MyWishList() {

    const navigate = useNavigate();

    // 찜한 상품 목록
    const [wishList, setWishList] = useState([]);

    // 선택한 상품 prdId 목록
    const [selectedPrdIds, setSelectedPrdIds] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 에러 메시지
    const [error, setError] = useState(null);

    // 찜 목록 다시 불러오기
    const fetchWishList = () => {

        setLoading(true);

        apiCall.get('/api/v1/wish')
            .then(async (data) => {

                const wishWithProduct = [];

                // wish에는 prdId만 있으므로 상품 정보를 추가로 가져옴
                for (const wish of data) {
                    const prd = await apiCall.get(`/api/v1/product/detail/${wish.prdId}`);

                    wishWithProduct.push({
                        ...wish,
                        prdNm: prd.prdNm,
                        brand: prd.brand,
                        price: prd.price,
                        thumbImgUrl: prd.thumbImgUrl
                    });
                }

                setWishList(wishWithProduct);
            })
            .catch((err) => {
                console.error('찜 목록 조회 실패:', err);
                setError('찜한 상품을 불러오지 못했습니다.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 처음 화면 들어왔을 때 찜 목록 조회
    useEffect(() => {
        fetchWishList();
    }, []);

    // 상품 하나 선택 / 선택 해제
    const handleSelectOne = (e, prdId) => {

        e.stopPropagation();

        if (selectedPrdIds.includes(prdId)) {
            setSelectedPrdIds(selectedPrdIds.filter(id => id !== prdId));
        } else {
            setSelectedPrdIds([...selectedPrdIds, prdId]);
        }
    };

    // 전체 선택 / 전체 해제
    const handleSelectAll = () => {

        if (selectedPrdIds.length === wishList.length) {
            setSelectedPrdIds([]);
        } else {
            setSelectedPrdIds(wishList.map(wish => wish.prdId));
        }
    };

    // 상품 1개 장바구니 담기
    const handleAddCart = (e, prdId) => {

        e.stopPropagation();

        apiCall.post('/api/cart', {
            userNum: sessionStorage.getItem('userNum'),
            prdId: prdId,
            itQty: 1,
            selectedYn: 'Y'
        })
            .then(() => {
                const go = window.confirm('장바구니에 담았습니다.\n장바구니로 이동하시겠습니까?');

                if (go) {
                    navigate('/cart');
                }
            })
            .catch((err) => {
                console.error('장바구니 담기 실패:', err);
                alert('장바구니 담기에 실패했습니다.');
            });
    };

    // 선택한 상품 전체 장바구니 담기
    const handleAddSelectedCart = () => {

        if (selectedPrdIds.length === 0) {
            alert('상품을 선택해주세요.');
            return;
        }

        Promise.all(
            selectedPrdIds.map(prdId =>
                apiCall.post('/api/cart', {
                    userNum: sessionStorage.getItem('userNum'),
                    prdId: prdId,
                    itQty: 1,
                    selectedYn: 'Y'
                })
            )
        )
            .then(() => {
                const go = window.confirm('선택한 상품을 장바구니에 담았습니다.\n장바구니로 이동하시겠습니까?');

                if (go) {
                    navigate('/cart');
                }
            })
            .catch((err) => {
                console.error('선택 상품 장바구니 담기 실패:', err);
                alert('장바구니 담기에 실패했습니다.');
            });
    };

    // 찜 1개 취소
    const handleDeleteWish = (e, prdId) => {

        e.stopPropagation();

        if (!window.confirm('찜한 상품에서 삭제하시겠습니까?')) return;

        apiCall.delete(`/api/v1/wish/${prdId}`)
            .then(() => {
                setSelectedPrdIds(selectedPrdIds.filter(id => id !== prdId));
                fetchWishList();
            })
            .catch((err) => {
                console.error('찜 취소 실패:', err);
                alert('찜 취소에 실패했습니다.');
            });
    };

    // 선택한 상품 찜 삭제
    const handleDeleteSelectedWish = () => {

        if (selectedPrdIds.length === 0) {
            alert('상품을 선택해주세요.');
            return;
        }

        if (!window.confirm('선택한 상품을 찜 목록에서 삭제하시겠습니까?')) return;

        Promise.all(
            selectedPrdIds.map(prdId =>
                apiCall.delete(`/api/v1/wish/${prdId}`)
            )
        )
            .then(() => {
                setSelectedPrdIds([]);
                fetchWishList();
            })
            .catch((err) => {
                console.error('선택 상품 찜 삭제 실패:', err);
                alert('찜 삭제에 실패했습니다.');
            });
    };

    if (loading) {
        return <div className='wish-loading'>로딩 중...</div>;
    }

    if (error) {
        return <div className='wish-error'>{error}</div>;
    }

    return (
        <div className='wish-wrap'>

            {/* 헤더 */}
            <div className='wish-header'>
                <h2 className='wish-title'>찜한 상품</h2>
                <p className='wish-desc'>찜한 상품 목록을 확인할 수 있습니다.</p>
                <p className='wish-count'>총 {wishList.length}개</p>
            </div>

            {/* 상단 선택 버튼 영역 */}
            {wishList.length > 0 && (
                <div className='wish-top-actions'>

                    <button
                        className='wish-select-all-btn'
                        onClick={handleSelectAll}
                    >
                        {selectedPrdIds.length === wishList.length ? '전체 해제' : '전체 선택'}
                    </button>

                    <button
                        className='wish-add-selected-btn'
                        onClick={handleAddSelectedCart}
                    >
                        선택 장바구니 담기
                    </button>

                    <button
                        className='wish-delete-selected-btn'
                        onClick={handleDeleteSelectedWish}
                    >
                        선택 찜 삭제
                    </button>

                </div>
            )}

            {/* 찜한 상품이 없을 때 */}
            {wishList.length === 0 && (
                <div className='wish-empty'>
                    <p>찜한 상품이 없습니다.</p>
                </div>
            )}

            {/* 찜한 상품 목록 */}
            <div className='wish-list'>
                {wishList.map((wish) => (
                    <div
                        key={wish.wishId}
                        className='wish-item'
                        onClick={() => navigate(`/products/detail/${wish.prdId}`)}
                    >
                        {/* 선택 체크박스 */}
                        <input
                            type='checkbox'
                            className='wish-check'
                            checked={selectedPrdIds.includes(wish.prdId)}
                            onChange={(e) => handleSelectOne(e, wish.prdId)}
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* 상품 이미지 */}
                        <div className='wish-img-box'>
                            <img
                                src={wish.thumbImgUrl || '/images/no-image.png'}
                                alt={wish.prdNm}
                                onError={(e) => {
                                    e.target.src = '/images/no-image.png';
                                }}
                            />
                        </div>

                        {/* 상품 정보 */}
                        <div className='wish-info'>
                            <p className='wish-brand'>{wish.brand}</p>
                            <h3 className='wish-prdNm'>{wish.prdNm}</h3>
                            <strong className='wish-price'>
                                {wish.price?.toLocaleString()}원
                            </strong>
                        </div>

                        {/* 버튼 영역 */}
                        <div className='wish-btns'>

                            {/* 장바구니 담기 */}
                            <button
                                className='wish-cart-btn'
                                onClick={(e) => handleAddCart(e, wish.prdId)}
                            >
                                장바구니
                            </button>

                            {/* 상품 보기 */}
                            <button
                                className='wish-detail-btn'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/products/detail/${wish.prdId}`);
                                }}
                            >
                                상품 보기
                            </button>

                            {/* 찜 취소 */}
                            <button
                                className='wish-delete-btn'
                                onClick={(e) => handleDeleteWish(e, wish.prdId)}
                            >
                                찜 취소
                            </button>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}