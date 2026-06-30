import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getFaqDetail,
    deleteFaq,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';

import './FaqDetail.css';

function FaqDetail() {

    /* FAQ 번호 */
    const { faqId } = useParams();

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* FAQ 상세 */
    const [detail, setDetail] = useState(null);

    /* 관리자 여부 */
    const [isAdmin, setIsAdmin] = useState(false);

    /* 관리자 여부 확인 */
    useEffect(() => {
        checkCscenterAdmin()
            .then((data) => {
                setIsAdmin(data === true);
            })
            .catch((err) => {
                console.log(err);
                setIsAdmin(false);
            });
    }, []);

    /* FAQ 상세 조회 */
    useEffect(() => {

        getFaqDetail(faqId)
            .then((data) => {
                console.log('FAQ 상세 데이터:', data);
                setDetail(data);
            })
            .catch((err) => {
                console.log(err);
                alert('FAQ 상세 정보를 불러오지 못했습니다.');
                navigate('/cscenter/faqs');
            });

    }, [faqId, navigate]);

    /* 목록 이동 */
    const moveList = () => {
        navigate('/cscenter/faqs');
    };

    /* 수정 이동 */
    const moveEdit = () => {
        navigate(`/cscenter/faqs/${faqId}/edit`);
    };

    /* FAQ 삭제 */
    const removeFaq = () => {

        if (!isAdmin) {
            alert('관리자만 삭제할 수 있습니다.');
            return;
        }

        if (!window.confirm('FAQ를 삭제하시겠습니까?')) {
            return;
        }

        deleteFaq(faqId)
            .then(() => {
                alert('FAQ가 삭제되었습니다.');
                navigate('/cscenter/faqs');
            })
            .catch((err) => {
                console.log(err);
                alert('FAQ 삭제에 실패했습니다.');
            });

    };

    /* 로딩 */
    if (detail === null) {
        return <div>로딩중...</div>;
    }

    return (

        <div className="cs-faq-detail-container">

            {/* 제목 */}
            <h1 className="cs-faq-detail-title">
                {detail.ttl}
            </h1>

            {/* 상세 정보 */}
            <div className="cs-faq-detail-info">

                <span>카테고리 : {detail.faqCtgCd}</span>

                <span>조회수 : {detail.viewCnt}</span>

                <span>작성일 : {detail.crtAt?.substring(0, 10)}</span>

                {/* 관리자 전용 */}
                {isAdmin && (
                    <span>사용여부 : {detail.useYn}</span>
                )}

            </div>

            {/* 내용 */}
            <div className="cs-faq-detail-content">
                {detail.faqTxt}
            </div>

            {/* 버튼 영역 */}
            <div className="cs-faq-detail-btn-wrap">

                {/* 관리자 버튼 */}
                {isAdmin && (

                    <>

                        <button
                            type="button"
                            className="cs-faq-edit-btn"
                            onClick={moveEdit}
                        >
                            수정
                        </button>

                        <button
                            type="button"
                            className="cs-faq-delete-btn"
                            onClick={removeFaq}
                        >
                            삭제
                        </button>

                    </>

                )}

                {/* 목록 버튼 */}
                <button
                    type="button"
                    className="cs-faq-detail-btn"
                    onClick={moveList}
                >
                    목록
                </button>

            </div>

        </div>

    );
}

export default FaqDetail;