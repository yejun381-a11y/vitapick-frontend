import { useEffect, useState } from 'react';

import {
    createAddr,
    updateAddr
} from '../../../service/useraddr/userAddrApi';

import './UserAddrForm.css';

function UserAddrForm({
    mode = 'create',
    addrData = null,
    onSuccess,
    onCancel,
    onClose
}) {

    /* 배송지 입력값 */
    const [formData, setFormData] = useState({
        addrNm: '',
        rcvNm: '',
        rcvTel: '',
        zipCd: '',
        addr1: '',
        addr2: '',
        baseYn: 'N'
    });

    /* 입력창 터치 여부 */
    const [touched, setTouched] = useState({});

    /* 전화번호 정규식 */
    const telRegex = /^[0-9]{10,11}$/;

    /* 수정 데이터 세팅 */
    useEffect(() => {

        if (addrData) {
            setFormData({
                addrNm: addrData.addrNm || '',
                rcvNm: addrData.rcvNm || '',
                rcvTel: addrData.rcvTel || '',
                zipCd: addrData.zipCd || '',
                addr1: addrData.addr1 || '',
                addr2: addrData.addr2 || '',
                baseYn: addrData.baseYn || 'N'
            });

            return;
        }

        setFormData({
            addrNm: '',
            rcvNm: '',
            rcvTel: '',
            zipCd: '',
            addr1: '',
            addr2: '',
            baseYn: 'N'
        });

    }, [addrData]);

    /* 배송지명 오류 여부 */
    const isAddrNmError =
        touched.addrNm && !formData.addrNm.trim();

    /* 받는 사람 오류 여부 */
    const isRcvNmError =
        touched.rcvNm && !formData.rcvNm.trim();

    /* 연락처 빈값 오류 여부 */
    const isRcvTelEmptyError =
        touched.rcvTel && !formData.rcvTel.trim();

    /* 연락처 형식 오류 여부 */
    const isRcvTelFormatError =
        touched.rcvTel &&
        formData.rcvTel.trim() &&
        !telRegex.test(formData.rcvTel);

    /* 우편번호 오류 여부 */
    const isZipCdError =
        touched.zipCd && !formData.zipCd.trim();

    /* 주소 오류 여부 */
    const isAddr1Error =
        touched.addr1 && !formData.addr1.trim();

    /* 상세주소 오류 여부 */
    const isAddr2Error =
        touched.addr2 && !formData.addr2.trim();

    /* 유효성 검사 */
    const validateForm = () => {

        return (
            formData.addrNm.trim() &&
            formData.rcvNm.trim() &&
            telRegex.test(formData.rcvTel) &&
            formData.zipCd.trim() &&
            formData.addr1.trim() &&
            formData.addr2.trim()
        );
    };

    /* 일반 입력값 변경 */
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /* 연락처 입력값 변경 */
    const handleTelChange = (e) => {

        const onlyNumber = e.target.value
            .replace(/[^0-9]/g, '')
            .slice(0, 11);

        setFormData(prev => ({
            ...prev,
            rcvTel: onlyNumber
        }));
    };

    /* 입력창 벗어날 때 */
    const handleBlur = (e) => {

        const { name } = e.target;

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    /* 주소 검색 */
    const handleAddressSearch = () => {

        if (!window.daum) {
            alert('주소 검색 서비스를 불러오지 못했습니다.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: function (data) {

                setFormData(prev => ({
                    ...prev,
                    zipCd: data.zonecode,
                    addr1: data.address
                }));

                setTouched(prev => ({
                    ...prev,
                    zipCd: true,
                    addr1: true
                }));
            }
        }).open();
    };

    /* 기본 배송지 변경 */
    const handleBaseYnChange = (e) => {

        setFormData(prev => ({
            ...prev,
            baseYn: e.target.checked ? 'Y' : 'N'
        }));
    };

    /* 저장 */
    const handleSubmit = () => {

        setTouched({
            addrNm: true,
            rcvNm: true,
            rcvTel: true,
            zipCd: true,
            addr1: true,
            addr2: true
        });

        if (!validateForm()) {
            return;
        }

        if (mode === 'edit' && !addrData?.addrId) {
            alert('수정할 배송지 정보가 없습니다.');
            return;
        }

        const request =
            mode === 'create'
                ? createAddr(formData)
                : updateAddr(addrData.addrId, formData);

        request
            .then(() => {

                alert(
                    mode === 'create'
                        ? '배송지가 등록되었습니다.'
                        : '배송지가 수정되었습니다.'
                );

                onSuccess?.();

            })
            .catch(err => {

                console.log(err);

                const errorMessage = err.response?.data;

                if (err.response?.status === 401) {
                    alert('로그인 후 이용해주세요.');
                    return;
                }

                alert(
                    errorMessage ||
                    (
                        mode === 'create'
                            ? '배송지 등록에 실패했습니다.'
                            : '배송지 수정에 실패했습니다.'
                    )
                );
            });
    };

    return (
        <div className="userAddrFormWrap">

            <div className="userAddrForm">

                <h2 className="userAddrFormTitle">
                    {
                        mode === 'create'
                            ? '배송지 추가'
                            : '배송지 수정'
                    }
                </h2>

                {/* 배송지명 */}
                <div className="userAddrFormGroup">
                    <label>배송지명</label>

                    <input
                        type="text"
                        name="addrNm"
                        value={formData.addrNm}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="예) 집, 회사"
                    />

                    {
                        isAddrNmError && (
                            <p className="inputErrorText">
                                배송지명을 입력해주세요.
                            </p>
                        )
                    }
                </div>

                {/* 받는 사람 */}
                <div className="userAddrFormGroup">
                    <label>받는 사람</label>

                    <input
                        type="text"
                        name="rcvNm"
                        value={formData.rcvNm}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="받는 사람 이름"
                    />

                    {
                        isRcvNmError && (
                            <p className="inputErrorText">
                                받는 사람을 입력해주세요.
                            </p>
                        )
                    }
                </div>

                {/* 연락처 */}
                <div className="userAddrFormGroup">
                    <label>연락처</label>

                    <input
                        type="tel"
                        name="rcvTel"
                        value={formData.rcvTel}
                        onChange={handleTelChange}
                        onBlur={handleBlur}
                        placeholder="01012345678"
                    />

                    {
                        isRcvTelEmptyError && (
                            <p className="inputErrorText">
                                연락처를 입력해주세요.
                            </p>
                        )
                    }

                    {
                        isRcvTelFormatError && (
                            <p className="inputErrorText">
                                숫자만 10~11자리로 입력해주세요.
                            </p>
                        )
                    }
                </div>

                {/* 우편번호 */}
                <div className="userAddrFormGroup">
                    <label>우편번호</label>

                    <div className="userAddrZipRow">
                        <input
                            type="text"
                            name="zipCd"
                            value={formData.zipCd}
                            readOnly
                            onBlur={handleBlur}
                            placeholder="주소 검색을 눌러주세요"
                        />

                        <button
                            type="button"
                            className="userAddrSearchBtn"
                            onClick={handleAddressSearch}
                        >
                            주소 검색
                        </button>
                    </div>

                    {
                        isZipCdError && (
                            <p className="inputErrorText">
                                주소 검색을 진행해주세요.
                            </p>
                        )
                    }
                </div>

                {/* 주소 */}
                <div className="userAddrFormGroup">
                    <label>주소</label>

                    <input
                        type="text"
                        name="addr1"
                        value={formData.addr1}
                        readOnly
                        onBlur={handleBlur}
                        placeholder="주소 검색으로 자동 입력됩니다"
                    />

                    {
                        isAddr1Error && (
                            <p className="inputErrorText">
                                주소 검색을 진행해주세요.
                            </p>
                        )
                    }
                </div>

                {/* 상세주소 */}
                <div className="userAddrFormGroup">
                    <label>상세주소</label>

                    <input
                        type="text"
                        name="addr2"
                        value={formData.addr2}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="상세주소를 입력해주세요"
                    />

                    {
                        isAddr2Error && (
                            <p className="inputErrorText">
                                상세주소를 입력해주세요.
                            </p>
                        )
                    }
                </div>

                {/* 기본 배송지 */}
                <div className="userAddrCheckBox">

                    <input
                        type="checkbox"
                        checked={formData.baseYn === 'Y'}
                        onChange={handleBaseYnChange}
                    />

                    <span>
                        기본 배송지로 설정
                    </span>

                </div>

                {/* 버튼 */}
                <div className="userAddrBtnBox">

                    <button
                        type="button"
                        className="userAddrCancelBtn"
                        onClick={onClose || onCancel}
                    >
                        취소
                    </button>

                    <button
                        type="button"
                        className="userAddrSaveBtn"
                        onClick={handleSubmit}
                    >
                        저장
                    </button>

                </div>

            </div>

        </div>
    );
}

export default UserAddrForm;