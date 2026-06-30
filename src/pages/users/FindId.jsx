import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UsersApi } from '../../service/usersApi';
import './Login.css';

function FindId() {
    const navigate = useNavigate();
    const [foundId, setFoundId] = useState("");
    const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'onBlur' });  // 포커스 벗어날 때 유효성 검사

    const onFindIdSubmit = async (data) => {
        // handleSubmit이 유효성 검사를 통과한 data를 넘겨줌
        setFoundId("");
        setServerError("");

        try {
            setIsLoading(true);
            const response = await UsersApi.findId(data.userNm, data.email);
            setFoundId(response.loginId);  // ← .data 주의 (axios 응답 구조)
        } catch (err) {
            if (err.response?.status === 404) {
                setServerError("일치하는 회원 정보가 없습니다.");
            } else {
                setServerError("아이디 찾기 중 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='body_container'>
            <hr />
            <h2 style={{ color: '#7FAF8B' }}>아이디 찾기</h2>

            <form autoComplete='off' onSubmit={handleSubmit(onFindIdSubmit)}>

                {/* 이름 입력 */}
                <input
                    type="text"
                    placeholder="이름"
                    autoComplete='off'
                    size={20}
                    {...register("userNm", {
                        required: "이름을 입력해주세요.",
                        pattern: {
                            value: /^[가-힣a-zA-Z\s]{2,20}$/,
                            message: "이름은 한글/영문 2~20자로 입력해주세요."
                        }
                    })}
                />
                {errors.userNm && (
                    <p style={{ color: "red", fontSize: "13px" }}>
                        {errors.userNm.message}
                    </p>
                )}
                <br />

                {/* 이메일 입력 */}
                <input
                    type="text"
                    placeholder="이메일"
                    autoComplete='off'
                    size={20}
                    {...register("email", {
                        required: "이메일을 입력해주세요.",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "이메일 형식이 올바르지 않습니다."
                        }
                    })}
                />
                {errors.email && (
                    <p style={{ color: "red", fontSize: "13px" }}>
                        {errors.email.message}
                    </p>
                )}
                <br /><br />

                <input
                    type="submit"
                    className="loginBtn"
                    value={isLoading ? "찾는 중..." : "아이디 찾기"}
                    style={{ width: 175 }}
                    disabled={isLoading}
                />
            </form>

            {/* 서버 에러 메시지 */}
            {serverError && (
                <p style={{ color: "red", fontSize: "14px" }}>{serverError}</p>
            )}

            {/* 아이디 찾기 성공 결과 */}
            {foundId && (
                <div style={{ marginTop: "15px" }}>
                    <p>
                        가입된 아이디는&nbsp;
                        <strong style={{ color: "#7547a3" }}>{foundId}</strong>
                        &nbsp;입니다.
                    </p>
                    <button
                        type="button"
                        className="loginBtn"
                        style={{ width: 175 }}
                        onClick={() => navigate("/v1/auth/login")}
                    >
                        로그인하러 가기
                    </button>
                </div>
            )}

            <div className="find-links">
                <Link to="/v1/auth/login">로그인</Link>
                <span className="divider">|</span>
                <Link to="/v1/auth/sendotpcode">비밀번호찾기</Link>
                <span className="divider">|</span>
                <Link to="/v1/auth/join">회원가입</Link>
            </div>
        </div>
    );
}

export default FindId;