import './App.css';
import React, { useEffect, useState } from 'react';
import {
    useNavigate,
    useLocation
} from 'react-router-dom';

import {
    getToken
} from './service/apiService';

import { UsersApi } from './service/usersApi';

import Header from './components/layout/Header';
import Main from './components/layout/Main';
import Footer from './components/layout/Footer';

import Chatbot from './pages/chatbot/Chatbot';

function App() {

    const navigate = useNavigate();
    const location = useLocation();


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const hideChatbotPaths = [
        '/cart',
        '/order',
        '/mypage/myaddress'
    ];

    const isHideChatbot = hideChatbotPaths.some(path =>
        location.pathname.startsWith(path)
    );

    const isAdminPath = location.pathname.startsWith('/admin');
    const showChatbot = !isAdminPath && !isHideChatbot;

    useEffect(() => {
        const accessToken = sessionStorage.getItem("accessToken");

        if (accessToken !== null) {
            setIsLoggedIn(true);
            setUserInfo({
                token: accessToken,
                userNum: sessionStorage.getItem("userNum"),
                loginId: sessionStorage.getItem("loginId"),
                userNm: sessionStorage.getItem("userNm"),
                roleCd: sessionStorage.getItem("roleCd")
            });
        }
    }, []);

    const onLoginSubmit = async (loginId, pwd) => {

        await UsersApi.login(loginId, pwd)
            .then((response) => {
                sessionStorage.setItem("accessToken", response.accessToken);
                sessionStorage.setItem("userNum", response.userNum);
                sessionStorage.setItem("loginId", response.loginId);
                sessionStorage.setItem("userNm", response.userNm);
                sessionStorage.setItem("roleCd", response.roleCd);

                setIsLoggedIn(true);

                setUserInfo({
                    token: response.accessToken,
                    userNum: response.userNum,
                    loginId: response.loginId,
                    userNm: response.userNm,
                    roleCd: response.roleCd
                });

                navigate("/");

            })
            .catch((err) => {
                setIsLoggedIn(false);
                setUserInfo(null);
                if (err.status === 502) {
                    alert("ID 또는 패스워드 오류입니다. 다시 시도해주세요.");
                } else {
                    alert(`** onLoginSubmit 시스템 오류, err=${err}`);
                }
                navigate("/v1/auth/login");
            });
    };

    const onLogout = async () => {
        try {
            await UsersApi.logout();
        } catch (e) {
            // 401이든 뭐든 로그아웃은 진행
        } finally {
            sessionStorage.clear();
            localStorage.clear();
            setIsLoggedIn(false);
            alert("로그아웃 되었습니다.");
            navigate("/");
        }
    };

    return (

        <div className="App">

            {!isAdminPath && (
                <Header
                    userInfo={userInfo}
                    isLoggedIn={isLoggedIn}
                    onLogout={onLogout}
                />
            )}

            <Main
                token={getToken()}
                onLoginSubmit={onLoginSubmit}
                isLoggedIn={isLoggedIn}
            />

            {!isAdminPath && <Footer />}

            {showChatbot && (
                <div
                    className="chatbotFloatingBtn"
                    onClick={() => {

                        if (isLoggedIn) {
                            setIsChatOpen(prev => !prev);
                        } else {
                            navigate('/v1/auth/login');
                        }

                    }}
                >
                    <img
                        src="/images/VitaPick_ChatBot_Logo.png"
                        alt="챗봇"
                    />

                    <p className="chatbotFloatingText">
                        ChatBot
                    </p>
                </div>
            )}

            {showChatbot && isChatOpen && (
                <Chatbot
                    onClose={() => setIsChatOpen(false)}
                    userInfo={userInfo}
                />
            )}

        </div>

    );

}

export default App;
