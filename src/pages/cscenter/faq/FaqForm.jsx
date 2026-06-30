import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    getFaqDetail,
    createFaq,
    updateFaq,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';

import './FaqForm.css';

function FaqForm() {

    /* FAQ 번호 */
    const { faqId } = useParams();

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 수정 여부 */
    const isEdit = faqId !== undefined;

    /* 권한 확인 */
    const [checkedAdmin, setCheckedAdmin] = useState(false);

    /* 폼 데이터 */
    const [formData, setFormData] = useState({
        faqCtgCd: 'ORDER',
        ttl: '',
        faqTxt: '',
        useYn: 'Y'
    });

    /* FAQ 상세 조회 */
    useEffect(() => {

        checkCscenterAdmin()
            .then((data) => {

                if (data !== true) {
                    alert('관리자만 접근할 수 있습니다.');
                    navigate('/cscenter/faqs');
                    return;
                }

                setCheckedAdmin(true);

                /* 수정 모드 */
                if (isEdit) {

                    getFaqDetail(faqId)
                        .then((data) => {

                            setFormData({
                                faqCtgCd: data.faqCtgCd || 'ORDER',
                                ttl: data.ttl || '',
                                faqTxt: data.faqTxt || '',
                                useYn: data.useYn || 'Y'
                            });

                        })
                        .catch((err) => {

                            console.log(err);

                            alert('FAQ 정보를 불러오지 못했습니다.');

                            navigate('/cscenter/faqs');

                        });

                }

            })
            .catch((err) => {

                console.log(err);

                alert('관리자만 접근할 수 있습니다.');
                navigate('/cscenter/faqs');

            });

    }, [faqId, isEdit, navigate]);

    /* 입력값 변경 */
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };

    /* 등록 / 수정 */
    const handleSubmit = (e) => {

        e.preventDefault();

        /* 제목 체크 */
        if (!formData.ttl.trim()) {

            alert('제목을 입력해주세요.');

            return;
        }

        /* 내용 체크 */
        if (!formData.faqTxt.trim()) {

            alert('내용을 입력해주세요.');

            return;
        }

        /* 등록 / 수정 API */
        const api = isEdit
            ? updateFaq(faqId, formData)
            : createFaq(formData);

        api
            .then(() => {

                alert(
                    isEdit
                        ? 'FAQ가 수정되었습니다.'
                        : 'FAQ가 등록되었습니다.'
                );

                navigate('/cscenter/faqs');

            })
            .catch((err) => {

                console.log(err);

                alert(
                    isEdit
                        ? 'FAQ 수정에 실패했습니다.'
                        : 'FAQ 등록에 실패했습니다.'
                );

            });

    };

    /* 목록 이동 */
    const moveList = () => {

        navigate('/cscenter/faqs');

    };

    /* 권한 확인 전 */
    if (!checkedAdmin) {
        return null;
    }

    return (

        <div className="cs-faq-form-container">

            {/* 제목 */}
            <h1 className="cs-faq-form-title">

                {isEdit ? 'FAQ 수정' : 'FAQ 등록'}

            </h1>

            {/* 폼 */}
            <form
                onSubmit={handleSubmit}
                className="cs-faq-form"
            >

                {/* 카테고리 */}
                <div className="cs-faq-form-group">

                    <label>
                        카테고리
                    </label>

                    <select
                        name="faqCtgCd"
                        value={formData.faqCtgCd}
                        onChange={handleChange}
                        className="cs-faq-form-select"
                    >

                        <option value="ORDER">ORDER</option>
                        <option value="DELIVERY">DELIVERY</option>
                        <option value="PRODUCT">PRODUCT</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="PAYMENT">PAYMENT</option>
                        <option value="CUSTOM">CUSTOM</option>
                        <option value="INGREDIENT">INGREDIENT</option>
                        <option value="ETC">ETC</option>

                    </select>

                </div>

                {/* 제목 입력 */}
                <div className="cs-faq-form-group">

                    <label>
                        제목
                    </label>

                    <input
                        type="text"
                        name="ttl"
                        value={formData.ttl}
                        onChange={handleChange}
                        className="cs-faq-form-input"
                        placeholder="FAQ 제목을 입력하세요."
                    />

                </div>

                {/* 내용 입력 */}
                <div className="cs-faq-form-group">

                    <label>
                        내용
                    </label>

                    <textarea
                        name="faqTxt"
                        value={formData.faqTxt}
                        onChange={handleChange}
                        className="cs-faq-form-textarea"
                        placeholder="FAQ 내용을 입력하세요."
                    />

                </div>

                {/* 사용 여부 */}
                <div className="cs-faq-form-group">

                    <label>
                        사용여부
                    </label>

                    <select
                        name="useYn"
                        value={formData.useYn}
                        onChange={handleChange}
                        className="cs-faq-form-select"
                    >

                        <option value="Y">Y</option>
                        <option value="N">N</option>

                    </select>

                </div>

                {/* 버튼 영역 */}
                <div className="cs-faq-form-btn-wrap">

                    {/* 등록 / 수정 버튼 */}
                    <button
                        type="submit"
                        className="cs-faq-submit-btn"
                    >

                        {isEdit ? '수정' : '등록'}

                    </button>

                    {/* 취소 버튼 */}
                    <button
                        type="button"
                        className="cs-faq-cancel-btn"
                        onClick={moveList}
                    >
                        취소
                    </button>

                </div>

            </form>

        </div>

    );
}

export default FaqForm;