import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiCall } from "../../service/apiService";
import { useNavigate } from "react-router-dom";
import "./Join.css";

// 유효성 검사 정규식
const idRegex = /^[a-zA-Z0-9]{4,20}$/;
const pwdRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telRegex = /^[0-9]{10,11}$/;

// 메시지 색상
const msgStyle = {
  red: { color: "red" },
  green: { color: "green" },
};

export default function JoinForm() {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  // 아이디 상태
  const [idCheckMsg, setIdCheckMsg] = useState("");
  const [idCheckOk, setIdCheckOk] = useState(false);
  const [idValid, setIdValid] = useState(false);
  const [idValidMsg, setIdValidMsg] = useState("");

  // 이메일 상태
  const [emailCheckMsg, setEmailCheckMsg] = useState("");
  const [emailCheckOk, setEmailCheckOk] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [emailValidMsg, setEmailValidMsg] = useState("");

  // 아이디 blur
  const handleIdBlur = (e) => {
    const value = e.target.value;
    if (!value) {
      setIdValidMsg("아이디를 입력해주세요");
      setIdValid(false);
    } else if (!idRegex.test(value)) {
      setIdValidMsg("영문/숫자 4~20자로 입력해주세요");
      setIdValid(false);
    } else {
      setIdValidMsg("중복확인을 해주세요");
      setIdValid(true);
    }
    setIdCheckMsg("");
    setIdCheckOk(false);
  };

  // 아이디 중복확인
  const handleCheckId = async () => {
    const value = watch("loginId");
    if (!value || !idRegex.test(value)) {
      setIdValidMsg("영문/숫자 4~20자로 입력해주세요");
      setIdValid(false);
      setIdCheckMsg("");
      return;
    }
    try {
      const data = await apiCall.get(`/api/v1/checkid/${value}`,);
      console.log(data);
      if (data.idUse === "T") {
        setIdCheckMsg(data.message);
        setIdCheckOk(true);
      } else {
        setIdCheckMsg(data.message);
        setIdCheckOk(false);
      }
    } catch (err) {
      setIdCheckMsg("중복확인 중 오류가 발생했습니다");
      setIdCheckOk(false);
    }
  };

   // 이메일 blur
  const handleEmailBlur = (e) => {
    const value = e.target.value;
    if (!value) {
      setEmailValidMsg("Email을 입력해주세요");
      setEmailValid(false);
    } else if (!emailRegex.test(value)) {
      setEmailValidMsg("Email 형식으로 입력해주세요");
      setEmailValid(false);
    } else {
      setEmailValidMsg("중복확인을 해주세요");
      setEmailValid(true);
    }
    setEmailCheckMsg("");
    setEmailCheckOk(false);
  };

  // 이메일 중복확인
  const handleCheckEmail = async () => {
    const value = watch("email");
    if (!value || !emailRegex.test(value)) {
      setEmailValidMsg("Email 형식으로 입력해주세요");
      setEmailValid(false);
      setEmailCheckMsg("");
      return;
    }
    try {
      const data = await apiCall.get(`/api/v1/checkemail/${value}`,);
      console.log(data);
      if (data.emailUse === "T") {
        setEmailCheckMsg(data.message);
        setEmailCheckOk(true);
      } else {
        setEmailCheckMsg(data.message);
        setEmailCheckOk(false);
      }
    } catch (err) {
      setEmailCheckMsg("중복확인 중 오류가 발생했습니다");
      setEmailCheckOk(false);
    }
  };

  // 회원가입 submit
  const onSubmit = async (data) => {
    if (!idCheckOk) {
      alert("아이디 중복확인을 해주세요");
      return;
    }
    if (!emailCheckOk){
      alert("Email 중복확인을 해주세요");
      return;
    }

    const requestData = {
      loginId: data.loginId,
      pwd: data.pwd,
      userNm: data.userNm,
      tel: data.tel,
      email: data.email,
      genderCd: data.genderCd,
      birthYmd: data.birthYmd,
    };

    try {
      const result = await apiCall.post(
        "/api/v1/auth/join",
        requestData
      );
      alert(result);
      navigate("/");
    } catch (err) {
      alert("회원가입에 실패했습니다");
    }
  };

  // 유효성 실패 시 포커스 이동
  const onError = (errors) => {
    const fieldOrder = [
      "loginId",
      "pwd",
      "pwdConfirm",
      "userNm",
      "tel",
      "email",
      "genderCd",
      "birthYmd",
    ];
    for (const field of fieldOrder) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  };

  return (
    <div className="join-wrap">
      <div className="join-card">
        <h2 className="join-title">
          회원가입
        </h2>
        <form className="join-form" onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          {/* 아이디 */}
          <div className="join-group">
            <label>아이디</label>
            <div className="join-inline">
              <input
                className="join-input"
                type="text"
                autoComplete="off"
                placeholder="예) abc123"
                {...register("loginId", {
                  required: "아이디를 입력해주세요",
                  pattern: {
                    value: idRegex,
                    message: "영문/숫자 4~20자로 입력해주세요",
                  },
                  onChange: () => {
                    setIdCheckOk(false);
                    setIdCheckMsg("");
                  },
                })}
                onBlur={handleIdBlur}
              />
              <button
                className="join-check-btn"
                type="button"
                onClick={handleCheckId}
              >
                중복확인
              </button>
            </div>
            {!idCheckMsg && idValidMsg && (
              <p style={idValid ? msgStyle.green : msgStyle.red}>
                {idValidMsg}
              </p>
            )}
            {idCheckMsg && (
              <p style={idCheckOk ? msgStyle.green : msgStyle.red}>
                {idCheckMsg}
              </p>
            )}

            {errors.loginId && !idCheckMsg && !idValidMsg && (
              <p style={msgStyle.red}>
                {errors.loginId.message}
              </p>
            )}

          </div>

          {/* 비밀번호 */}
          <div className="join-group">
            <label>비밀번호</label>
            <input
              className="join-input"
              type="password"
              autoComplete="new-password"
              placeholder="영문 + 숫자 8~20자"
              {...register("pwd", {
                required: "비밀번호를 입력해주세요",
                pattern: {
                  value: pwdRegex,
                  message: "영문+숫자 조합 8~20자로 입력해주세요",
                },
              })}
            />
            {errors.pwd && (
              <p style={msgStyle.red}>
                {errors.pwd.message}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="join-group">
            <label>비밀번호 확인</label>
            <input
              className="join-input"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 다시 입력해주세요"
              {...register("pwdConfirm", {
                required: "비밀번호 확인을 입력해주세요",
                validate: (v) =>
                  v === watch("pwd") ||
                  "비밀번호가 일치하지 않습니다",
              })}
            />
            {errors.pwdConfirm && (
              <p style={msgStyle.red}>
                {errors.pwdConfirm.message}
              </p>
            )}
          </div>

          {/* 이름 */}
          <div className="join-group">
            <label>이름</label>
            <input
              className="join-input"
              type="text"
              autoComplete="name"
              placeholder="홍길동"
              {...register("userNm", {
                required: "이름을 입력해주세요",
              })}
            />
            {errors.userNm && (
              <p style={msgStyle.red}>
                {errors.userNm.message}
              </p>
            )}
          </div>

          {/* 전화번호 */}
          <div className="join-group">
            <label>전화번호</label>
            <input
              className="join-input"
              type="tel"
              autoComplete="tel"
              placeholder="01012345678"
              {...register("tel", {
                required: "전화번호를 입력해주세요",
                validate: (v) =>
                  telRegex.test(v) ||
                  "숫자만 10~11자리로 입력해주세요",
              })}
            />
            {errors.tel && (
              <p style={msgStyle.red}>
                {errors.tel.message}
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div className="join-group">
            <label>이메일</label>
            <div className="join-inline">
              <input
                className="join-input"
                type="email"
                autoComplete="email"
                placeholder="예) example@email.com"
                {...register("email", {
                  required: "Email을 입력해주세요",
                  pattern: {
                    value: emailRegex,
                    message: "Email 형식으로 입력해주세요!",
                  },
                  onChange: () => {
                    setEmailCheckOk(false);
                    setEmailCheckMsg("");
                  },
                })}
                onBlur={handleEmailBlur}
              />
              <button
                className="join-check-btn"
                type="button"
                onClick={handleCheckEmail}
              >
                중복확인
              </button>
            </div>
            {!emailCheckMsg && emailValidMsg && (
              <p style={emailValid ? msgStyle.green : msgStyle.red}>
                {emailValidMsg}
              </p>
            )}
            {emailCheckMsg && (
              <p style={emailCheckOk ? msgStyle.green : msgStyle.red}>
                {emailCheckMsg}
              </p>
            )}

            {errors.email && !emailCheckMsg && !emailValidMsg && (
              <p style={msgStyle.red}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 성별 */}
          <div className="join-group">

            <label>성별</label>

            <select
              className="join-input"
              {...register("genderCd", {
                required: "성별을 선택해주세요",
              })}
            >
              <option value="">선택해주세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>

            {errors.genderCd && (
              <p style={msgStyle.red}>
                {errors.genderCd.message}
              </p>
            )}

          </div>

          {/* 생년월일 */}
          <div className="join-group">

            <label>생년월일</label>

            <input
              className="join-input"
              type="date"
              {...register("birthYmd", {
                required: "생년월일을 입력해주세요",
              })}
            />

            {errors.birthYmd && (
              <p style={msgStyle.red}>
                {errors.birthYmd.message}
              </p>
            )}

          </div>

          <button
            className="join-submit-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "회원가입"}
          </button>

        </form>

      </div>

    </div>
  );
}