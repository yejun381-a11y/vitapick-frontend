import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../../../service/apiService';
import './MyReviewDetail.css';

export default function MyReviewDetail() {

    // URL에서 리뷰 ID 가져오기
    const { rvwId } = useParams();

    // 페이지 이동 함수
    const navigate = useNavigate();

    // 리뷰 상세 정보
    const [rvw, setRvw] = useState(null);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 에러 메시지
    const [error, setError] = useState(null);

    // 수정 모드 여부
    const [editMode, setEditMode] = useState(false);

    // 수정할 리뷰 내용
    const [editCmt, setEditCmt] = useState('');

    // 수정할 별점
    const [editRating, setEditRating] = useState(5);

    // 리뷰 상세 조회
    async function fetchReviewDetail() {
        try {
            setLoading(true);

            const data = await apiCall.get(`/api/v1/rvw/${rvwId}`);

            // 리뷰의 prdId로 상품 정보 추가 조회
            const prd = await apiCall.get(`/api/v1/product/detail/${data.prdId}`);

            // 리뷰 정보 + 상품 정보를 합쳐서 저장
            setRvw({
                ...data,
                prdNm: prd.prdNm,
                brand: prd.brand,
                price: prd.price,
                thumbImgUrl: prd.thumbImgUrl
            });

            setEditCmt(data.cmt);
            setEditRating(data.rating);

        } catch (err) {
            console.error('리뷰 상세 오류:', err);
            setError('리뷰를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReviewDetail();
    }, [rvwId]);

    // 수정 모드 시작
    function handleEditStart() {
        setEditMode(true);
        setEditCmt(rvw.cmt);
        setEditRating(rvw.rating);
    }

    // 수정 취소
    function handleEditCancel() {
        setEditMode(false);
        setEditCmt(rvw.cmt);
        setEditRating(rvw.rating);
    }

    // 수정 저장
    async function handleEditSubmit() {
        try {
            await apiCall.patch(`/api/v1/rvw/${rvwId}`, {
                rating: editRating,
                cmt: editCmt
            });

            alert('리뷰가 수정되었습니다.');

            setEditMode(false);
            await fetchReviewDetail();

        } catch (err) {
            console.error('리뷰 수정 실패:', err);
            alert('리뷰 수정에 실패했습니다.');
        }
    }

    // 리뷰 삭제
    async function handleDeleteRvw() {
        if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;

        try {
            await apiCall.delete(`/api/v1/rvw/${rvwId}`);

            alert('리뷰가 삭제되었습니다.');
            navigate('/mypage/myreview');

        } catch (err) {
            console.error('리뷰 삭제 실패:', err);
            alert('리뷰 삭제에 실패했습니다.');
        }
    }

    if (loading) return <div className='rvw-detail-loading'>로딩 중...</div>;
    if (error) return <div className='rvw-detail-error'>{error}</div>;
    if (!rvw) return <div className='rvw-detail-error'>리뷰가 없습니다.</div>;

    return (
        <div className='rvw-detail-wrap'>

            {/* 헤더 */}
            <div className='rvw-detail-header'>
                <button
                    className='rvw-detail-back'
                    onClick={() => navigate(-1)}
                >
                    ← 뒤로가기
                </button>

                <h2 className='rvw-detail-title'>리뷰 상세</h2>
            </div>

            {/* 리뷰 내용 */}
            <div className='rvw-detail-card'>

                {/* 상품 정보 */}
                <div className='rvw-detail-product'>
                    <img
                        className='rvw-detail-img'
                        src={rvw.thumbImgUrl || '/images/no-image.png'}
                        alt={rvw.prdNm}
                        onError={(e) => {
                            e.target.src = '/images/no-image.png';
                        }}
                    />

                    <div className='rvw-detail-prd-info'>
                        <p className='rvw-detail-brand'>{rvw.brand}</p>
                        <h3 className='rvw-detail-prdNm'>{rvw.prdNm}</h3>
                        <strong className='rvw-detail-price'>
                            {rvw.price?.toLocaleString()}원
                        </strong>
                    </div>
                </div>

                {/* 수정 모드 */}
                {editMode ? (
                    <div className='rvw-detail-edit-box'>

                        {/* 별점 수정 */}
                        <div className='rvw-detail-edit-star'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setEditRating(star)}
                                    className={star <= editRating ? 'rvw-detail-star-on' : 'rvw-detail-star-off'}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        {/* 리뷰 내용 수정 */}
                        <textarea
                            className='rvw-detail-edit-textarea'
                            value={editCmt}
                            onChange={(e) => setEditCmt(e.target.value)}
                            rows={5}
                        />

                        <div className='rvw-detail-edit-btns'>
                            <button
                                className='rvw-detail-save-btn'
                                onClick={handleEditSubmit}
                            >
                                수정 완료
                            </button>

                            <button
                                className='rvw-detail-cancel-btn'
                                onClick={handleEditCancel}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 별점 */}
                        <div className='rvw-detail-star'>
                            {'★'.repeat(rvw.rating)}
                            {'☆'.repeat(5 - rvw.rating)}
                        </div>

                        {/* 날짜 */}
                        <p className='rvw-detail-date'>
                            {rvw.crtAt?.slice(0, 10)}
                        </p>

                        {/* 리뷰 내용 */}
                        <p className='rvw-detail-cmt'>
                            {rvw.cmt}
                        </p>

                        {/* 관리자 답글이 있으면 표시 */}
                        {rvw.replyTxt && (
                            <div className='rvw-detail-reply'>
                                <strong>관리자 답변</strong>
                                <p>{rvw.replyTxt}</p>
                            </div>
                        )}

                        {/* 버튼 영역 */}
                        <div className='rvw-detail-btns'>
                            <button
                                className='rvw-detail-prd-btn'
                                onClick={() => navigate(`/products/detail/${rvw.prdId}`)}
                            >
                                상품 보기
                            </button>

                            <button
                                className='rvw-detail-edit-btn'
                                onClick={handleEditStart}
                            >
                                수정
                            </button>

                            <button
                                className='rvw-detail-delete-btn'
                                onClick={handleDeleteRvw}
                            >
                                삭제
                            </button>
                        </div>
                    </>
                )}

            </div>

        </div>
    );
}