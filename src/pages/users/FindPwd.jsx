import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UsersApi } from '../../service/usersApi';
import './Login.css';

function FindPwd() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loginId, setLoginId] = useState("");
    const [serverError, setServerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: 'onBlur' });  // 포커스 벗어날 때 유효성 검사

    const {
        register: resetRegister,
        handleSubmit: resetHandleSubmit,
        watch: resetWatch,
        formState: {errors: resetErrors},
    } = useForm({ mode: 'onBlur'});

    const pwd = resetWatch("pwd");

    //1단계: 회원정보확인, 인증번호 발급
    const onSendOtpCodeSubmit = async (data) => {
        setServerError("");
        try{
            setIsLoading(true);
            const sendOtpCode = await UsersApi.sendOtpCode(
                data.loginId,
                data.userNm,
                data.email
            );
            alert(`인증번호는 [${sendOtpCode}] 입니다.`);
            setLoginId(data.loginId);
            setStep(2);
        }catch(err){
            console.log("인증번호 발송 에러:", err);
            console.log("status:", err.response?.status);
            console.log("data:", err.response?.data);
            setServerError(err.message);
        }finally{
            setIsLoading(false);
        }
    };

    //2단계: 인증번호확인, 비밀번호 변경
    const onResetPwdSubmit = async (data) => {
        setServerError("");
        try{
            setIsLoading(true);
            const response = await UsersApi.resetPwd(
                loginId,
                data.inputOtpCode,
                data.pwd
            );
            console.log(`비밀번호 재설정 응답= ${response}`);
            alert("비밀번호가 변경되었습니다. 다시 로그인 해주세요")
            navigate("/v1/auth/login");
        }catch(err){
            console.log("비밀번호 찾기 에러:", err);
            console.log("status:", err.response?.status);
            console.log("data:", err.response?.data);
            setServerError(err.message);
        }finally{
            setIsLoading(false);
        }
    };

    return (
        <div className='body_container'>
            <hr />
            <h2 style={{ color: '#7FAF8B' }}>비밀번호 찾기</h2>

            {step === 1 && (
            <form autoComplete='off' onSubmit={handleSubmit(onSendOtpCodeSubmit)}>
                
                {/* 이름 입력 */}
                <input
                    type="text"
                    placeholder="아이디"
                    autoComplete='off'
                    size={20}
                    {...register("loginId", {
                        required: "ID를 입력해주세요.",
                        pattern: {
                            value: /^[a-zA-Z0-9]{4,20}$/,
                            message: "ID는 영문/숫자 4~20자로 입력해주세요."
                        }
                    })}
                />
                {errors.loginId && (
                    <p style={{ color: "red", fontSize: "13px" }}>
                        {errors.loginId.message}
                    </p>
                )}
                <br />

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
                    value={isLoading ? "찾는 중..." : "인증번호 찾기"}
                    style={{ width: 175 }}
                    disabled={isLoading}
                />
            </form>
            )}
            {/* step1 */}

            {step === 2 && (
            <form autoComplete='off' onSubmit={resetHandleSubmit(onResetPwdSubmit)}>
                
                <p style={{ fontSize: "14px" }}>
                        인증번호를 입력하고 새 비밀번호를 설정해주세요.
                </p>

                {/* 인증번호 입력 */}
                <input
                    type="text"
                    placeholder="인증번호 6자리"
                    autoComplete='off'
                    size={20}
                    {...resetRegister("inputOtpCode", {
                        required: "인증번호를 입력해주세요.",
                        pattern: {
                            value: /^[0-9]{6}$/,
                            message: "인증번호는 숫자 6자리로 입력해주세요."
                        }
                    })}
                />
                {resetErrors.inputOtpCode && (
                    <p style={{ color: "red", fontSize: "13px" }}>
                        {resetErrors.inputOtpCode.message}
                    </p>
                )}
                <br />

                {/* 비밀번호 입력 */}
                <input
                    type="password"
                    placeholder="새 비밀번호"
                    autoComplete='off'
                    size={20}
                    {...resetRegister("pwd", {
                        required: "새 비밀번호를 입력해주세요.",
                        pattern: {
                            value: /^(?=.*[a-zA-Z])(?=.*\d).{8,20}$/,
                            message: "영문+숫자 조합 8~20자로 입력해주세요"
                        }
                    })}
                />
                {resetErrors.pwd && (
                    <p style={{ color: "red", fontSize: "13px" }}>
                        {resetErrors.pwd.message}
                    </p>
                )}
                <br />
                {/* 비밀번호 확인 */}
                <input
                        type="password"
                        placeholder="새 비밀번호 확인"
                        autoComplete="off"
                        size={20}
                        {...resetRegister("pwdCheck", {
                            required: "비밀번호 확인을 입력해주세요.",
                            validate: value =>
                                value === pwd || "비밀번호가 일치하지 않습니다."
                        })}
                    />
                    {resetErrors.pwdCheck && (
                        <p style={{ color: "red", fontSize: "13px" }}>
                            {resetErrors.pwdCheck.message}
                        </p>
                    )}
                {/* 이메일 입력 */}

                <br /><br />

                <input
                    type="submit"
                    className="loginBtn"
                    value={isLoading ? "변경 중..." : "비밀번호 변경"}
                    style={{ width: 175 }}
                    disabled={isLoading}
                />

                <button
                    type="button"
                    className="loginBtn"
                    style={{ width: 175 }}
                    onClick={() => {
                        setStep(1);
                        setServerError("");
                    }}
                >
                    다시 인증번호 받기
                </button>
            </form>
            )}

            {/* 서버 에러 메시지 */}
            {serverError && (
                <p style={{ color: "red", fontSize: "14px" }}>{serverError}</p>
            )}

            <div className="find-links">
                <Link to="/v1/auth/login">로그인</Link>
                <span className="divider">|</span>
                <Link to="/v1/auth/findid">아이디 찾기</Link>
                <span className="divider">|</span>
                <Link to="/v1/auth/join">회원가입</Link>
            </div>
        </div>
    );
}

export default FindPwd;