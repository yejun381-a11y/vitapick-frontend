import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { UsersApi } from '../../../service/usersApi';

import './MyProfile.css';

function MyProfile() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        loginId: '',
        userNm: '',
        tel: '',
        email: '',
        genderCd: '',
        birthYmd: '',
        pwd: '',
        pwdConfirm: '',
        crtAt: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 페이지가 처음 열릴 때 현재 로그인 회원의 정보를 조회한다.
    useEffect(() => {
        const loadProfile = async () => {
            if (!sessionStorage.getItem('accessToken')) {
                alert('로그인이 필요한 서비스입니다.');
                navigate('/v1/auth/login');
                return;
            }

            try {
                setLoading(true);
                setErrorMsg('');

                const user = await UsersApi.getProfile();

                setForm((prev) => ({
                    ...prev,
                    loginId: user.loginId ?? '',
                    userNm: user.userNm ?? '',
                    tel: user.tel ?? '',
                    email: user.email ?? '',
                    genderCd: user.genderCd ?? '',
                    birthYmd: user.birthYmd ?? '',
                    crtAt: user.crtAt ?? '',
                }));
            } catch (error) {
                console.error('회원정보 조회 실패:', error);
                setErrorMsg(
                    error.response?.data || '회원정보를 불러오지 못했습니다.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!form.userNm.trim() || !form.tel.trim() || !form.email.trim()) {
            setErrorMsg('이름, 연락처, 이메일은 필수 입력 항목입니다.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) {
            setErrorMsg('이메일 형식을 확인해주세요.');
            return;
        }

        if (form.pwd && form.pwd !== form.pwdConfirm) {
            setErrorMsg('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        const updateData = {
            userNm: form.userNm.trim(),
            tel: form.tel.trim(),
            email: form.email.trim(),
            genderCd: form.genderCd || null,
            birthYmd: form.birthYmd || null,
        };

        // 새 비밀번호를 입력했을 때만 수정 요청에 포함한다.
        if (form.pwd) {
            updateData.pwd = form.pwd;
        }

        try {
            setSaving(true);

            const result = await UsersApi.updateProfile(updateData);

            // 헤더 등에서 이름을 sessionStorage로 읽는 경우를 위해 함께 갱신한다.
            sessionStorage.setItem('userNm', form.userNm.trim());

            setForm((prev) => ({
                ...prev,
                pwd: '',
                pwdConfirm: '',
            }));

            alert(result || '회원정보가 수정되었습니다.');
        } catch (error) {
            console.error('회원정보 수정 실패:', error);
            setErrorMsg(
                error.response?.data || '회원정보 수정 중 오류가 발생했습니다.'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>회원정보를 불러오는 중입니다...</p>;
    }

    return (
        <section className="myProfile">
            <div className="myProfileHeader">
                <h2>회원정보 수정</h2>
                <p>회원정보를 확인하고 변경할 수 있습니다.</p>
            </div>

            <form className="myProfileForm" onSubmit={handleSubmit}>
                <div className="myProfileField">
                    <label htmlFor="loginId">아이디</label>
                    <input
                        id="loginId"
                        name="loginId"
                        type="text"
                        value={form.loginId}
                        readOnly
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="userNm">이름</label>
                    <input
                        id="userNm"
                        name="userNm"
                        type="text"
                        value={form.userNm}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="tel">연락처</label>
                    <input
                        id="tel"
                        name="tel"
                        type="tel"
                        value={form.tel}
                        onChange={handleChange}
                        placeholder="010-1234-5678"
                        required
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="birthYmd">생년월일</label>
                    <input
                        id="birthYmd"
                        name="birthYmd"
                        type="date"
                        value={form.birthYmd}
                        onChange={handleChange}
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="genderCd">성별</label>
                    <select
                        id="genderCd"
                        name="genderCd"
                        value={form.genderCd}
                        onChange={handleChange}
                    >
                        <option value="">선택하지 않음</option>
                        <option value="M">남성</option>
                        <option value="F">여성</option>
                    </select>
                </div>

                <div className="myProfileField">
                    <label htmlFor="pwd">새 비밀번호</label>
                    <input
                        id="pwd"
                        name="pwd"
                        type="password"
                        value={form.pwd}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="변경할 경우에만 입력하세요"
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="pwdConfirm">새 비밀번호 확인</label>
                    <input
                        id="pwdConfirm"
                        name="pwdConfirm"
                        type="password"
                        value={form.pwdConfirm}
                        onChange={handleChange}
                        autoComplete="new-password"
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                </div>

                <div className="myProfileField">
                    <label htmlFor="crtAt">가입일</label>
                    <input
                        id="crtAt"
                        name="crtAt"
                        type="text"
                        value={form.crtAt ? form.crtAt.slice(0, 10) : ''}
                        readOnly
                    />
                </div>

                {errorMsg && (
                    <p className="myProfileError" role="alert">
                        {errorMsg}
                    </p>
                )}

                <div className="myProfileButtons">
                    <button type="submit" disabled={saving}>
                        {saving ? '수정 중...' : '회원정보 수정'}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default MyProfile;
