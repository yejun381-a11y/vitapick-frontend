import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getNoticeDetail,
    deleteNotice,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';
import './NoticeDetail.css';

function NoticeDetail() {

    /* 공지사항 번호 */
    const { ntcId } = useParams();

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 공지사항 상세 */
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

    /* 공지사항 상세 조회 */
    useEffect(() => {

        getNoticeDetail(ntcId)
            .then((data) => {
                console.log(data);
                setDetail(data);
            })
            .catch((err) => {
                console.log(err);
                alert('공지사항 상세 정보를 불러오지 못했습니다.');
                navigate('/cscenter/notices');
            });

    }, [ntcId, navigate]);

    /* 목록 이동 */
    const moveList = () => {
        navigate('/cscenter/notices');
    };

    /* 수정 이동 */
    const moveEdit = () => {
        navigate(`/cscenter/notices/${ntcId}/edit`);
    };

    /* 공지사항 삭제 */
    const removeNotice = () => {

        if (!isAdmin) {
            alert('관리자만 삭제할 수 있습니다.');
            return;
        }

        if (!window.confirm('공지사항을 삭제하시겠습니까?')) {
            return;
        }

        deleteNotice(ntcId)
            .then(() => {
                alert('공지사항이 삭제되었습니다.');
                navigate('/cscenter/notices');
            })
            .catch((err) => {
                console.log(err);
                alert('공지사항 삭제에 실패했습니다.');
            });

    };

    /* 로딩 */
    if (detail == null) {
        return <div>로딩중...</div>;
    }

    return (

        <div className="cs-notice-detail-container">

            {/* 제목 */}
            <h1 className="cs-notice-detail-title">
                {detail.ttl}
            </h1>

            {/* 상세 정보 */}
            <div className="cs-notice-detail-info">

                <span>조회수 : {detail.viewCnt}</span>

                <span>작성일 : {detail.crtAt?.substring(0, 10)}</span>

                {/* 관리자 전용 */}
                {isAdmin && (
                    <span>사용여부 : {detail.useYn}</span>
                )}

            </div>

            {/* 내용 */}
            <div className="cs-notice-detail-content">
                {detail.ntcTxt}
            </div>

            {/* 버튼 영역 */}
            <div className="cs-notice-detail-btn-wrap">

                {/* 관리자 버튼 */}
                {isAdmin && (

                    <>

                        <button
                            type="button"
                            className="cs-notice-edit-btn"
                            onClick={moveEdit}
                        >
                            수정
                        </button>

                        <button
                            type="button"
                            className="cs-notice-delete-btn"
                            onClick={removeNotice}
                        >
                            삭제
                        </button>

                    </>

                )}

                {/* 목록 버튼 */}
                <button
                    type="button"
                    className="cs-notice-detail-btn"
                    onClick={moveList}
                >
                    목록
                </button>

            </div>

        </div>
    );
}

export default NoticeDetail;