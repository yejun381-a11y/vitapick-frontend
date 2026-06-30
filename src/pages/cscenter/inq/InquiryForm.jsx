import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getInqDetail,
    createInq,
    updateInq,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';

import './InquiryForm.css';

function InquiryForm() {

    /* 문의 번호 */
    const { inqId } = useParams();

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 수정 여부 */
    const isEdit = inqId !== undefined;

    /* 로그인 정보 */
    const userNum = sessionStorage.getItem('userNum');

    /* 관리자 여부 */
    const [isAdmin, setIsAdmin] = useState(false);

    /* 권한 확인 */
    const [checkedAuth, setCheckedAuth] = useState(false);

    /* 폼 데이터 */
    const [formData, setFormData] = useState({
        inqTpCd: 'PRODUCT',
        ttl: '',
        inqTxt: ''
    });

    /* 문의 상세 조회 */
    useEffect(() => {

        /* 로그인 체크 */
        if (!userNum) {

            alert('로그인 후 이용 가능합니다.');

            navigate('/v1/auth/login');

            return;
        }

        checkCscenterAdmin()
            .then((data) => {

                const adminCheck = data === true;

                setIsAdmin(adminCheck);

                /* 관리자 체크 */
                if (adminCheck) {

                    alert('관리자는 1:1 문의를 등록하거나 수정할 수 없습니다.');

                    navigate('/cscenter/inquiries');

                    return;
                }

                setCheckedAuth(true);

                /* 수정 모드 */
                if (isEdit) {

                    fetchInqDetail();
                }

            })
            .catch((err) => {

                console.log(err);

                setIsAdmin(false);

                setCheckedAuth(true);

                /* 수정 모드 */
                if (isEdit) {

                    fetchInqDetail();
                }

            });

    }, []);

    /* 문의 상세 조회 함수 */
    const fetchInqDetail = async () => {

        try {

            const result = await getInqDetail(inqId);

            console.log('문의 수정 데이터 = ', result);

            /* 본인 글 체크 */
            if (Number(userNum) !== Number(result.userNum)) {

                alert('본인이 작성한 문의글만 수정할 수 있습니다.');

                navigate('/cscenter/inquiries');

                return;
            }

            setFormData({
                inqTpCd: result.inqTpCd || 'PRODUCT',
                ttl: result.ttl || '',
                inqTxt: result.inqTxt || ''
            });

        } catch (err) {

            console.log(err);

            alert('문의 정보 조회에 실패했습니다.');

            navigate('/cscenter/inquiries');
        }
    };

    /* 입력값 변경 */
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    /* 문의 등록 / 수정 */
    const handleSubmit = async (e) => {

        e.preventDefault();

        /* 로그인 체크 */
        if (!userNum) {

            alert('로그인 후 이용 가능합니다.');

            navigate('/v1/auth/login');

            return;
        }

        /* 관리자 체크 */
        if (isAdmin) {

            alert('관리자는 1:1 문의를 등록하거나 수정할 수 없습니다.');

            navigate('/cscenter/inquiries');

            return;
        }

        /* 제목 체크 */
        if (!formData.ttl.trim()) {

            alert('제목을 입력해주세요.');

            return;
        }

        /* 문의 내용 체크 */
        if (!formData.inqTxt.trim()) {

            alert('문의 내용을 입력해주세요.');

            return;
        }

        try {

            /* 요청 데이터 */
            const requestData = {
                ...formData,
                userNum: userNum
            };

            /* 수정 */
            if (isEdit) {

                await updateInq(
                    inqId,
                    requestData
                );

                alert('문의글이 수정되었습니다.');

            } else {

                /* 등록 */
                await createInq(requestData);

                alert('문의글이 등록되었습니다.');
            }

            navigate('/cscenter/inquiries');

        } catch (err) {

            console.log(err);

            alert(
                isEdit
                    ? '문의 수정에 실패했습니다.'
                    : '문의 등록에 실패했습니다.'
            );
        }
    };

    /* 취소 */
    const handleCancel = () => {

        navigate('/cscenter/inquiries');
    };

    /* 권한 확인 전 */
    if (!checkedAuth) {
        return null;
    }

    return (

        <div className="inq-form-wrap">

            {/* 상단 제목 */}
            <div className="inq-form-top">

                <h2 className="inq-form-title">

                    {isEdit
                        ? '1:1 문의 수정'
                        : '1:1 문의 등록'}

                </h2>

            </div>

            {/* 문의 폼 */}
            <form
                className="inq-form"
                onSubmit={handleSubmit}
            >

                {/* 문의 유형 */}
                <div className="inq-form-row">

                    <label className="inq-form-label">
                        문의유형
                    </label>

                    <select
                        className="inq-form-select"
                        name="inqTpCd"
                        value={formData.inqTpCd}
                        onChange={handleChange}
                    >

                        <option value="ORDER">주문</option>
                        <option value="DELIVERY">배송</option>
                        <option value="PRODUCT">상품</option>
                        <option value="MEMBER">회원</option>
                        <option value="ETC">기타</option>

                    </select>

                </div>

                {/* 제목 */}
                <div className="inq-form-row">

                    <label className="inq-form-label">
                        제목
                    </label>

                    <input
                        className="inq-form-input"
                        type="text"
                        name="ttl"
                        value={formData.ttl}
                        onChange={handleChange}
                        placeholder="제목을 입력해주세요."
                    />

                </div>

                {/* 문의 내용 */}
                <div className="inq-form-text-row">

                    <label className="inq-form-label">
                        문의내용
                    </label>

                    <textarea
                        className="inq-form-textarea"
                        name="inqTxt"
                        value={formData.inqTxt}
                        onChange={handleChange}
                        placeholder="문의 내용을 입력해주세요."
                    />

                </div>

                {/* 버튼 영역 */}
                <div className="inq-form-btn-wrap">

                    <button
                        type="button"
                        className="inq-cancel-btn"
                        onClick={handleCancel}
                    >
                        취소
                    </button>

                    <button
                        type="submit"
                        className="inq-submit-btn"
                    >

                        {isEdit
                            ? '수정'
                            : '등록'}

                    </button>

                </div>

            </form>

        </div>
    );
}

export default InquiryForm;