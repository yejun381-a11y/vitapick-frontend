import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getNoticeDetail,
    createNotice,
    updateNotice,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';
import './NoticeForm.css';

function NoticeForm() {

    /* 공지사항 번호 */
    const { ntcId } = useParams();

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 수정 여부 */
    const isEdit = ntcId !== undefined;

    /* 권한 확인 */
    const [checkedAdmin, setCheckedAdmin] = useState(false);

    /* 폼 데이터 */
    const [formData, setFormData] = useState({
        ttl: '',
        ntcTxt: '',
        useYn: 'Y'
    });

    /* 공지사항 상세 조회 */
    useEffect(() => {

        checkCscenterAdmin()
            .then((data) => {

                if (data !== true) {
                    alert('관리자만 접근 가능합니다.');
                    navigate('/cscenter/notices');
                    return;
                }

                setCheckedAdmin(true);

                /* 수정 모드 */
                if (isEdit) {

                    getNoticeDetail(ntcId)
                        .then((data) => {

                            setFormData({
                                ttl: data.ttl || '',
                                ntcTxt: data.ntcTxt || '',
                                useYn: data.useYn || 'Y'
                            });

                        })
                        .catch((err) => {
                            console.log(err);
                            alert('공지사항 조회 실패');
                            navigate('/cscenter/notices');
                        });
                }

            })
            .catch((err) => {

                console.log(err);

                alert('관리자만 접근 가능합니다.');
                navigate('/cscenter/notices');

            });

    }, [isEdit, ntcId, navigate]);

    /* 입력값 변경 */
    const changeHandler = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    /* 공지사항 등록 / 수정 */
    const submitHandler = async (e) => {

        e.preventDefault();

        /* 제목 체크 */
        if (!formData.ttl.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }

        /* 내용 체크 */
        if (!formData.ntcTxt.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {

            if (isEdit) {

                /* 수정 */
                await updateNotice(ntcId, formData);

                alert('공지사항 수정 완료!');

            } else {

                /* 등록 */
                await createNotice(formData);

                alert('공지사항 등록 완료!');
            }

            navigate('/cscenter/notices');

        } catch (err) {

            console.log(err);

            alert(isEdit ? '수정 실패' : '등록 실패');
        }
    };

    /* 취소 */
    const cancelHandler = () => {
        navigate('/cscenter/notices');
    };

    /* 권한 확인 전 */
    if (!checkedAdmin) {
        return null;
    }

    return (

        <div className="notice-form-wrap">

            {/* 제목 */}
            <h2 className="notice-form-title">
                {isEdit ? '공지사항 수정' : '공지사항 등록'}
            </h2>

            {/* 공지사항 폼 */}
            <form
                className="notice-form"
                onSubmit={submitHandler}
            >

                {/* 제목 입력 */}
                <div className="notice-form-group">

                    <label>제목</label>

                    <input
                        type="text"
                        name="ttl"
                        value={formData.ttl}
                        onChange={changeHandler}
                        placeholder="공지사항 제목 입력"
                    />

                </div>

                {/* 내용 입력 */}
                <div className="notice-form-group">

                    <label>내용</label>

                    <textarea
                        name="ntcTxt"
                        value={formData.ntcTxt}
                        onChange={changeHandler}
                        placeholder="공지사항 내용 입력"
                    />

                </div>

                {/* 사용 여부 */}
                <div className="notice-form-group">

                    <label>사용 여부</label>

                    <select
                        name="useYn"
                        value={formData.useYn}
                        onChange={changeHandler}
                    >
                        <option value="Y">사용</option>
                        <option value="N">미사용</option>
                    </select>

                </div>

                {/* 버튼 영역 */}
                <div className="notice-form-btn-wrap">

                    <button
                        type="button"
                        className="notice-form-cancel-btn"
                        onClick={cancelHandler}
                    >
                        취소
                    </button>

                    <button
                        type="submit"
                        className="notice-form-submit-btn"
                    >
                        {isEdit ? '수정하기' : '등록하기'}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default NoticeForm;