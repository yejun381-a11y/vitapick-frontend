import './ProductReview.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getToken } from '../../service/apiService';
import Pagination from '../../components/layout/Pagination';

// 상품 리뷰 영역 컴포넌트
const ProductReview = ({ prdId }) => {

    // 페이지 이동 함수
    const navigate = useNavigate();

    // 리뷰 목록
    const [rvwList, setRvwList] = useState([]);

    // 새 리뷰 내용
    const [rvwTxt, setRvwTxt] = useState('');

    // 새 리뷰 별점
    const [rating, setRating] = useState(5);

    // 리뷰 작성 폼 열림 여부
    const [showRvwForm, setShowRvwForm] = useState(false);

    // 리뷰 작성 가능한 주문상품 ID
    const [writeOrdItId, setWriteOrdItId] = useState(null);

    // 수정 중인 리뷰 ID
    const [editRvwId, setEditRvwId] = useState(null);

    // 수정할 리뷰 내용
    const [editRvwTxt, setEditRvwTxt] = useState('');

    // 수정할 별점
    const [editRating, setEditRating] = useState(5);

    // 답글 작성/수정 중인 리뷰 ID
    const [replyRvwId, setReplyRvwId] = useState(null);

    // 답글 입력값
    const [replyTxt, setReplyTxt] = useState('');

    // 답글 수정 모드 여부
    const [editReplyMode, setEditReplyMode] = useState(false);

    // 현재 리뷰 페이지
    const [rvwPage, setRvwPage] = useState(1);

    // 한 페이지에 보여줄 리뷰 개수
    const rvwPageSize = 5;

    // 로그인 회원 번호
    const loginUserNum = sessionStorage.getItem('userNum');

    // 관리자 여부
    const isAdmin =
        sessionStorage.getItem('roleCd') === 'ROLE_ADMIN' ||
        sessionStorage.getItem('roleCd') === 'ADMIN';

    // 리뷰 목록 다시 가져오기
    const fetchRvwList = async () => {
        try {
            const data = await apiCall.get(`/api/v1/rvw/prd/${prdId}`);
            setRvwList(data);
        } catch (err) {
            console.error('리뷰 조회 오류:', err);
        }
    };

    // 상품 ID가 바뀔 때 리뷰 목록 가져오기
    useEffect(() => {
        fetchRvwList();
        setRvwPage(1);
        setShowRvwForm(false);
        setWriteOrdItId(null);
        setRvwTxt('');
        setRating(5);
    }, [prdId]);

    // 리뷰 작성 버튼 클릭
    const handleOpenRvwForm = async () => {
        const token = getToken();

        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/v1/auth/login');
            return;
        }

        try {
            const result = await apiCall.get(`/api/v1/rvw/can-write/${prdId}`);

            if (!result.canWrite) {
                alert('구매한 상품만 리뷰를 작성할 수 있습니다.');
                return;
            }

            setWriteOrdItId(result.ordItId);
            setShowRvwForm(prev => !prev);

        } catch (err) {
            console.error('리뷰 작성 가능 여부 확인 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);

            const message = err.response?.data?.message || err.response?.data;

            if (message) {
                alert(message);
            } else {
                alert('리뷰 작성 가능 여부를 확인하지 못했습니다.');
            }
        }
    };

    // 리뷰 작성 완료
    const handleSubmitRvw = async () => {
        try {
            if (!rvwTxt.trim()) {
                alert('리뷰 내용을 입력해주세요.');
                return;
            }

            if (!writeOrdItId) {
                alert('구매한 상품만 리뷰를 작성할 수 있습니다.');
                return;
            }

            await apiCall.post('/api/v1/rvw', {
                ordItId: writeOrdItId,
                prdId: Number(prdId),
                rating: rating,
                cmt: rvwTxt
            });

            alert('리뷰가 작성되었습니다.');

            setRvwTxt('');
            setRating(5);
            setShowRvwForm(false);
            setWriteOrdItId(null);
            setRvwPage(1);

            await fetchRvwList();

        } catch (err) {
            console.error('리뷰 작성 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);

            const message = err.response?.data?.message || err.response?.data;

            if (message) {
                alert(message);
            } else {
                alert('리뷰 작성에 실패했습니다.');
            }
        }
    };

    // 리뷰 삭제
    const handleDeleteRvw = async (rvwId) => {
        if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;

        try {
            await apiCall.delete(`/api/v1/rvw/${rvwId}`);

            setRvwPage(1);
            await fetchRvwList();

        } catch (err) {
            console.error('리뷰 삭제 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);
            alert('리뷰 삭제에 실패했습니다.');
        }
    };

    // 리뷰 수정 버튼 클릭
    const handleEditRvw = (rvw) => {
        setEditRvwId(rvw.rvwId);
        setEditRvwTxt(rvw.cmt);
        setEditRating(rvw.rating);
    };

    // 리뷰 수정 취소
    const handleCancelEdit = () => {
        setEditRvwId(null);
        setEditRvwTxt('');
        setEditRating(5);
    };

    // 리뷰 수정 완료
    const handleUpdateRvw = async (rvwId) => {
        try {
            await apiCall.patch(`/api/v1/rvw/${rvwId}`, {
                rating: editRating,
                cmt: editRvwTxt
            });

            setEditRvwId(null);
            setEditRvwTxt('');
            setEditRating(5);

            await fetchRvwList();

        } catch (err) {
            console.error('리뷰 수정 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);
            alert('리뷰 수정에 실패했습니다.');
        }
    };

    // 관리자 답글 작성 버튼 클릭
    const handleOpenCreateReply = (rvwId) => {
        setReplyRvwId(rvwId);
        setReplyTxt('');
        setEditReplyMode(false);
    };

    // 관리자 답글 수정 버튼 클릭
    const handleOpenUpdateReply = (rvw) => {
        setReplyRvwId(rvw.rvwId);
        setReplyTxt(rvw.replyTxt);
        setEditReplyMode(true);
    };

    // 관리자 답글 입력 취소
    const handleCancelReply = () => {
        setReplyRvwId(null);
        setReplyTxt('');
        setEditReplyMode(false);
    };

    // 관리자 답글 등록
    const handleCreateReply = async (rvwId) => {
        if (!replyTxt.trim()) {
            alert('답글 내용을 입력해주세요.');
            return;
        }

        try {
            await apiCall.post(`/api/v1/rvw/${rvwId}/reply`, {
                replyTxt: replyTxt
            });

            setReplyRvwId(null);
            setReplyTxt('');
            setEditReplyMode(false);

            await fetchRvwList();

        } catch (err) {
            console.error('답글 등록 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);
            alert('답글 등록에 실패했습니다.');
        }
    };

    // 관리자 답글 수정
    const handleUpdateReply = async (rvwId) => {
        if (!replyTxt.trim()) {
            alert('답글 내용을 입력해주세요.');
            return;
        }

        try {
            await apiCall.patch(`/api/v1/rvw/${rvwId}/reply`, {
                replyTxt: replyTxt
            });

            setReplyRvwId(null);
            setReplyTxt('');
            setEditReplyMode(false);

            await fetchRvwList();

        } catch (err) {
            console.error('답글 수정 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);
            alert('답글 수정에 실패했습니다.');
        }
    };

    // 관리자 답글 삭제
    const handleDeleteReply = async (rvwId) => {
        if (!window.confirm('답글을 삭제하시겠습니까?')) return;

        try {
            await apiCall.delete(`/api/v1/rvw/${rvwId}/reply`);

            setReplyRvwId(null);
            setReplyTxt('');
            setEditReplyMode(false);

            await fetchRvwList();

        } catch (err) {
            console.error('답글 삭제 실패:', err);
            console.error('상태코드:', err.response?.status);
            console.error('응답데이터:', err.response?.data);
            alert('답글 삭제에 실패했습니다.');
        }
    };

    // 전체 리뷰 페이지 수
    const totalRvwPage = Math.ceil(rvwList.length / rvwPageSize);

    // 현재 페이지 시작 인덱스
    const startIndex = (rvwPage - 1) * rvwPageSize;

    // 현재 페이지 끝 인덱스
    const endIndex = startIndex + rvwPageSize;

    // 현재 페이지에서 보여줄 리뷰 목록
    const currentRvwList = rvwList.slice(startIndex, endIndex);

    return (
        <div className='detail_rvw'>

            {/* 평균 평점 */}
            <div className='rvw_summary'>
                <strong>
                    ⭐ {rvwList.length > 0
                        ? (rvwList.reduce((sum, r) => sum + r.rating, 0) / rvwList.length).toFixed(1)
                        : 0} / 5.0
                </strong>
                <p>총 {rvwList.length}개의 리뷰</p>
            </div>

            {/* 리뷰 작성 버튼 */}
            <button
                className='rvw_write_btn'
                onClick={handleOpenRvwForm}
            >
                리뷰 작성하기
            </button>

            {/* 리뷰 작성 폼 */}
            {showRvwForm && (
                <div className='rvw_form'>

                    {/* 새 리뷰 별점 선택 */}
                    <div className='rvw_rating_select'>
                        <p>별점 선택:</p>

                        {[1, 2, 3, 4, 5].map(star => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{
                                    cursor: 'pointer',
                                    color: star <= rating ? '#FFD700' : '#ddd',
                                    fontSize: '24px'
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    {/* 새 리뷰 내용 */}
                    <textarea
                        className='rvw_textarea'
                        value={rvwTxt}
                        onChange={(e) => setRvwTxt(e.target.value)}
                        placeholder='리뷰를 작성해주세요'
                        rows={4}
                    />

                    {/* 리뷰 작성 완료 */}
                    <button
                        className='rvw_submit_btn'
                        onClick={handleSubmitRvw}
                    >
                        작성 완료
                    </button>
                </div>
            )}

            {/* 리뷰 없을 때 */}
            {rvwList.length === 0 && (
                <p className='rvw_empty'>아직 작성된 리뷰가 없습니다.</p>
            )}

            {/* 현재 페이지 리뷰 목록 */}
            {currentRvwList.map((rvw) => (
                <div key={rvw.rvwId} className='rvw_item'>

                    {/* 수정 중인 리뷰라면 수정 폼 표시 */}
                    {editRvwId === rvw.rvwId ? (
                        <div className='rvw_edit_form'>

                            {/* 수정 별점 선택 */}
                            <div className='rvw_rating_select'>
                                <p>별점 수정:</p>

                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        onClick={() => setEditRating(star)}
                                        style={{
                                            cursor: 'pointer',
                                            color: star <= editRating ? '#FFD700' : '#ddd',
                                            fontSize: '24px'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>

                            {/* 수정 리뷰 내용 */}
                            <textarea
                                className='rvw_textarea'
                                value={editRvwTxt}
                                onChange={(e) => setEditRvwTxt(e.target.value)}
                                rows={3}
                            />

                            {/* 수정 완료 버튼 */}
                            <button
                                className='rvw_submit_btn'
                                onClick={() => handleUpdateRvw(rvw.rvwId)}
                            >
                                수정 완료
                            </button>

                            {/* 수정 취소 버튼 */}
                            <button
                                className='rvw_cancel_btn'
                                onClick={handleCancelEdit}
                            >
                                취소
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* 기존 별점 표시 */}
                            <span className='rvw_star'>
                                {'★'.repeat(rvw.rating)}
                                {'☆'.repeat(5 - rvw.rating)}
                            </span>

                            {/* 작성일 */}
                            <span className='rvw_date'>
                                {rvw.crtAt?.slice(0, 10)}
                            </span>

                            {/* 작성자 */}
                            <p className='rvw_writer'>
                                {(rvw.loginId || '회원')} 님의 리뷰
                            </p>

                            {/* 리뷰 내용 */}
                            <p className='rvw_cmt'>{rvw.cmt}</p>

                            {/* 본인이 작성한 리뷰만 수정 / 삭제 가능 */}
                            {String(rvw.userNum) === String(loginUserNum) && (
                                <>
                                    <button
                                        className='rvw_edit_btn'
                                        onClick={() => handleEditRvw(rvw)}
                                    >
                                        수정
                                    </button>

                                    <button
                                        className='rvw_delete_btn'
                                        onClick={() => handleDeleteRvw(rvw.rvwId)}
                                    >
                                        삭제
                                    </button>
                                </>
                            )}

                            {/* 관리자 답글 표시 */}
                            {rvw.replyTxt && (
                                <div className='rvw_reply_box'>
                                    <strong>관리자 답글</strong>
                                    <span className='rvw_reply_date'>
                                        {rvw.replyAt?.slice(0, 10)}
                                    </span>
                                    <p>{rvw.replyTxt}</p>
                                </div>
                            )}

                            {/* 관리자는 모든 리뷰에 답글 등록 / 수정 / 삭제 가능 */}
                            {isAdmin && (
                                <div className='rvw_reply_admin_area'>

                                    {/* 답글 입력 폼 */}
                                    {replyRvwId === rvw.rvwId ? (
                                        <div className='rvw_reply_form'>
                                            <textarea
                                                className='rvw_textarea'
                                                value={replyTxt}
                                                onChange={(e) => setReplyTxt(e.target.value)}
                                                placeholder='관리자 답글을 입력해주세요'
                                                rows={3}
                                            />

                                            {editReplyMode ? (
                                                <button
                                                    className='rvw_submit_btn'
                                                    onClick={() => handleUpdateReply(rvw.rvwId)}
                                                >
                                                    답글 수정 완료
                                                </button>
                                            ) : (
                                                <button
                                                    className='rvw_submit_btn'
                                                    onClick={() => handleCreateReply(rvw.rvwId)}
                                                >
                                                    답글 등록 완료
                                                </button>
                                            )}

                                            <button
                                                className='rvw_cancel_btn'
                                                onClick={handleCancelReply}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {!rvw.replyTxt && (
                                                <button
                                                    className='rvw_reply_btn'
                                                    onClick={() => handleOpenCreateReply(rvw.rvwId)}
                                                >
                                                    답글 등록
                                                </button>
                                            )}

                                            {rvw.replyTxt && (
                                                <>
                                                    <button
                                                        className='rvw_reply_edit_btn'
                                                        onClick={() => handleOpenUpdateReply(rvw)}
                                                    >
                                                        답글 수정
                                                    </button>

                                                    <button
                                                        className='rvw_reply_delete_btn'
                                                        onClick={() => handleDeleteReply(rvw.rvwId)}
                                                    >
                                                        답글 삭제
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                </div>
            ))}

            {/* 리뷰 페이지네이션 */}
            {totalRvwPage > 1 && (
                <Pagination
                    currentPage={rvwPage}
                    totalPage={totalRvwPage}
                    onPageChange={setRvwPage}
                />
            )}

        </div>
    );
};

export default ProductReview;