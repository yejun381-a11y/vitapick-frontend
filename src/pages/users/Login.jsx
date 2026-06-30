import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLoginSubmit }) => {
    const [loginId, setLoginId] = useState("");
    const [pwd, setPwd] = useState("");

    return (
        <div className='body_container'>
            <hr />
            <h2 style={{ color: '#7FAF8B' }}>로그인</h2>
            <div>
                <form
                    autoComplete='off'
                    onSubmit={(e) => {
                        e.preventDefault();
                        onLoginSubmit(loginId, pwd)}}>
                    <input type="text" name="loginId" placeholder="아이디"
                        autoComplete='off'
                        size={20} value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        required
                        pattern="^[a-z0-9_]{4,10}$"
                    /><br />
                    <input type="password" name="Pwd"
                        autoComplete='new-password' placeholder="비밀번호"
                        size={20} value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        required
                        minLength="4"
                    /><br /><br />
                    <input type="submit" className="loginBtn" value="로그인" style={{ width: 175 }} /><br /><br />
                </form>
                
                <div className="find-links">
                    <Link to="/v1/auth/findid">아이디 찾기</Link>
                    <span className="divider">|</span>
                    <Link to="/v1/auth/sendotpcode">비밀번호 찾기</Link>
                </div>

                <span>
                    <span>아직 회원이 아니신가요?</span>&nbsp;
                    <Link to="/v1/auth/join">
                    <strong style={{ color: '#7547a3' }}>회원가입</strong>
                    </Link>
                </span>
            </div>
        </div>
    ); //return
}; //Login

export default Login;