import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../service/apiService';
import './MyReviewList.css';

export default function MyReviewList() {

    const navigate = useNavigate();

    // 내가 쓴 리뷰 목록
    const [rvwList, setRvwList] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 에러 메시지
    const [error, setError] = useState(null);

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);

    // 페이지당 리뷰 수
    const pageSize = 5;

    const totalPage = Math.ceil(rvwList.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentList = rvwList.slice(startIndex, startIndex + pageSize);

    // 내가 쓴 리뷰 목록 조회
    async function fetchMyReviews() {
        try {
            setLoading(true);

            const data = await apiCall.get('/api/v1/rvw/user');

            const reviewWithProduct = [];

            for (const rvw of data) {
                const prd = await apiCall.get(`/api/v1/product/detail/${rvw.prdId}`);

                reviewWithProduct.push({
                    ...rvw,
                    prdNm: prd.prdNm,
                    brand: prd.brand,
                    price: prd.price,
                    thumbImgUrl: prd.thumbImgUrl
                });
            }

            setRvwList(reviewWithProduct);
            setCurrentPage(1);

        } catch (err) {
            console.error('리뷰 목록 오류:', err);
            setError('리뷰 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMyReviews();
    }, []);

    // 상품 상세 이동
    function goProductDetail(e, prdId) {
        e.stopPropagation();
        navigate(`/products/detail/${prdId}`);
    }

    // 리뷰 상세 이동
    function goReviewDetail(rvwId) {
        navigate(`/mypage/myreview/${rvwId}`);
    }

    if (loading) {
        return <div className='rvw-loading'>로딩 중...</div>;
    }

    if (error) {
        return <div className='rvw-error'>{error}</div>;
    }

    return (
        <div className='rvw-wrap'>

            <div className='rvw-header'>
                <h2 className='rvw-title'>내가 쓴 리뷰</h2>
                <p className='rvw-desc'>
                    작성한 상품 리뷰를 확인하고 관리할 수 있습니다.
                </p>
                <p className='rvw-count'>총 {rvwList.length}개</p>
            </div>

            {rvwList.length === 0 && (
                <div className='rvw-empty'>
                    <p>작성한 리뷰가 없습니다.</p>
                </div>
            )}

            <div className='rvw-list'>
                {currentList.map((rvw) => (
                    <div
                        key={rvw.rvwId}
                        className='rvw-item'
                        onClick={() => goReviewDetail(rvw.rvwId)}
                    >

                        <div className='rvw-item__product'>
                            <div
                                className='rvw-item__img-box'
                                onClick={(e) => goProductDetail(e, rvw.prdId)}
                            >
                                <img
                                    className='rvw-item__img'
                                    src={rvw.thumbImgUrl || '/images/no-image.png'}
                                    alt={rvw.prdNm}
                                    onError={(e) => {
                                        e.target.src = '/images/no-image.png';
                                    }}
                                />
                            </div>

                            <div
                                className='rvw-item__prd-info'
                                onClick={(e) => goProductDetail(e, rvw.prdId)}
                            >
                                <p className='rvw-item__brand'>{rvw.brand}</p>
                                <h3 className='rvw-item__prdNm'>{rvw.prdNm}</h3>
                                <p className='rvw-item__price'>
                                    {rvw.price?.toLocaleString('ko-KR')}원
                                </p>
                            </div>
                        </div>

                        <div className='rvw-item__top'>
                            <span className='rvw-item__star'>
                                {'★'.repeat(rvw.rating)}
                                {'☆'.repeat(5 - rvw.rating)}
                            </span>

                            <span className='rvw-item__date'>
                                {rvw.crtAt?.slice(0, 10)}
                            </span>
                        </div>

                        <p className='rvw-item__cmt'>{rvw.cmt}</p>

                        <div className='rvw-item__reply'>
                            {rvw.replyTxt ? (
                                <>
                                    <strong>판매자 답변:</strong>
                                    <p>{rvw.replyTxt}</p>
                                </>
                            ) : (
                                <p className='rvw-item__reply-wait'>
                                    판매자 답변 대기중
                                </p>
                            )}
                        </div>

                        <div className='rvw-item__btns'>

                            <button
                                className='rvw-item__prd-btn'
                                onClick={(e) => goProductDetail(e, rvw.prdId)}
                            >
                                상품 보기
                            </button>

                            <button
                                className='rvw-item__detail-btn'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goReviewDetail(rvw.rvwId);
                                }}
                            >
                                상세보기
                            </button>

                        </div>

                    </div>
                ))}
            </div>

            {totalPage > 1 && (
                <div className='mypage-pagination'>
                    <button
                        type='button'
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        이전
                    </button>

                    <span>
                        {currentPage} / {totalPage}
                    </span>

                    <button
                        type='button'
                        disabled={currentPage === totalPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        다음
                    </button>
                </div>
            )}

        </div>
    );
}