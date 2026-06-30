import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getInqDetail,
    getMyInqDetail,
    deleteInq,
    answerInq,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';

import './InquiryDetail.css';

function InquiryDetail() {

    /* 문의 번호 */
    const { inqId } = useParams();

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 문의 상세 */
    const [inquiry, setInquiry] = useState(null);

    /* 답변 내용 */
    const [answerText, setAnswerText] = useState('');

    /* 관리자 여부 */
    const [isAdmin, setIsAdmin] = useState(false);

    /* 로그인 정보 */
    const userNum = sessionStorage.getItem('userNum');

    /* 문의 상세 조회 */
    useEffect(() => {

        fetchInquiryDetail();

    }, []);

    /* 문의 상세 조회 함수 */
    const fetchInquiryDetail = async () => {

        try {

            const adminCheck = await checkCscenterAdmin();

            setIsAdmin(adminCheck === true);

            const response = adminCheck === true
                ? await getInqDetail(inqId)
                : await getMyInqDetail(inqId);

            setInquiry(response);

            /* 답변 존재 시 */
            if (response?.ansTxt) {
                setAnswerText(response.ansTxt);
            }

        } catch (error) {

            console.log(error);

            alert('문의 상세 조회에 실패했습니다.');

            navigate('/cscenter/inquiries');
        }
    };

    /* 문의 삭제 */
    const handleDelete = async () => {

        const confirmDelete = window.confirm('문의를 삭제하시겠습니까?');

        if (!confirmDelete) return;

        try {

            await deleteInq(inqId);

            alert('문의가 삭제되었습니다.');

            navigate('/cscenter/inquiries');

        } catch (error) {

            console.log(error);

            alert('문의 삭제에 실패했습니다.');
        }
    };

    /* 답변 등록 */
    const handleAnswerSubmit = async () => {

        if (!answerText.trim()) {

            alert('답변 내용을 입력해주세요.');

            return;
        }

        try {

            await answerInq(inqId, answerText);

            alert('답변이 등록되었습니다.');

            fetchInquiryDetail();

        } catch (error) {

            console.log(error);

            alert('답변 등록에 실패했습니다.');
        }
    };

    /* 로딩 */
    if (!inquiry) {

        return <div>로딩중...</div>;
    }

    return (

        <div className="inq-detail-wrap">

            {/* 상단 제목 */}
            <div className="inq-detail-top">

                <h2 className="inq-detail-title">
                    1:1 문의 상세
                </h2>

            </div>

            {/* 문의 상세 테이블 */}
            <table className="inq-detail-table">

                <tbody>

                    <tr>

                        <th>문의 유형</th>

                        <td>{inquiry.inqTpCd}</td>

                    </tr>

                    <tr>

                        <th>제목</th>

                        <td>{inquiry.ttl}</td>

                    </tr>

                    <tr>

                        <th>작성자</th>

                        <td>{inquiry.userNm || '회원'}</td>

                    </tr>

                    <tr>

                        <th>작성일</th>

                        <td>
                            {inquiry.crtAt?.substring(0, 10)}
                        </td>

                    </tr>

                </tbody>

            </table>

            {/* 문의 내역 */}
            <div className="inq-content-box">
                <div className="inq-content-header">
                    문의 내용
                </div>

                <div className="inq-content-body">
                    {inquiry.inqTxt}
                </div>
            </div>

            {/* 관리자 답변 조회 */}
            {inquiry.ansTxt && (

                <div className="inq-answer-box">

                    <div className="inq-answer-header">
                        관리자 답변
                    </div>

                    <div className="inq-answer-body">
                        {inquiry.ansTxt}
                    </div>

                </div>

            )}

            {/* 관리자 답변 등록 */}
            {isAdmin && inquiry?.inqStCd !== 'ANSWERED' && (

                <div className="inq-comment-form">

                    <h3 className="inq-comment-title">
                        답변 작성
                    </h3>

                    <textarea
                        className="inq-comment-textarea"
                        placeholder="답변 내용을 입력해주세요."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                    />

                    <div className="inq-comment-btn-wrap">

                        <button
                            type="button"
                            className="inq-comment-submit-btn"
                            onClick={handleAnswerSubmit}
                        >
                            답변 등록
                        </button>

                    </div>

                </div>

            )}

            {/* 하단 버튼 */}
            <div className="inq-detail-bottom">

                {/* 일반 회원 본인 글 */}
                {!isAdmin &&
                    Number(userNum) === Number(inquiry.userNum) && (

                        <>

                            <button
                                type="button"
                                className="inq-edit-btn"
                                onClick={() =>
                                    navigate(`/cscenter/inquiries/${inqId}/edit`)
                                }
                            >
                                수정
                            </button>

                            <button
                                type="button"
                                className="inq-delete-btn"
                                onClick={handleDelete}
                            >
                                삭제
                            </button>

                        </>

                    )}

                {/* 목록 버튼 */}
                <button
                    type="button"
                    className="inq-list-btn"
                    onClick={() => navigate('/cscenter/inquiries')}
                >
                    목록
                </button>

            </div>

        </div>
    );
}

export default InquiryDetail;