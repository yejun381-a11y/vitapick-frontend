import './Header.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
    UserRound,
    ShoppingCart,
    Headphones,
    Menu,
    Search,
    LogOut,
    Sparkles,
    Trophy,
    Bot,
    Gift,
    Leaf,
    ShoppingBag,
    CircleHelp,
    User,
    UsersRound
} from 'lucide-react';

import { Link } from 'react-router-dom';

function Header({ userInfo, isLoggedIn, onLogout }) {

    /* 검색어 상태 */
    const [searchKeyword, setSearchKeyword] = useState('');

    /* 페이지 이동 및 현재 위치 정보 */
    const navigate = useNavigate();

    /* 현재 URL 경로 정보 */
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.startsWith('/products/search/')) {
            const keyword = location.pathname.replace('/products/search/', '');
            setSearchKeyword(decodeURIComponent(keyword));
        } else {
            setSearchKeyword('');
        }
    }, [location.pathname]);


    /* 검색 */
    const handleSearch = () => {

        if (!searchKeyword.trim()) return;

        if (searchKeyword.trim().length < 2) {
            alert('두 글자 이상 입력해주세요.');
            return;
        }

        navigate(`/products/search/${encodeURIComponent(searchKeyword.trim())}`);
    };

    return (

        <header className="header">

            {/* 상단 헤더 */}
            <div className="headerTop">

                {/* 로고 */}
                <div className="headerLogo">

                    <Link to="/">

                        <img
                            src="/images/VitaPick_Logo.png"
                            alt="VitaPick 로고"
                        />

                    </Link>

                </div>

                {/* 검색창 */}
                <div className="headerSearch">

                    {/* 검색 입력 */}
                    <input
                        type="text"
                        placeholder="비타민, 유산균, 오메가3 검색"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    {/* 검색 버튼 */}
                    <button onClick={handleSearch}>

                        <Search size={22} />

                    </button>

                </div>

                {/* 우측 메뉴 */}
                <div className="headerMenu">

                    <ul>

                        {
                            isLoggedIn ? (

                                <>

                                    {/* 마이페이지 */}
                                    <li className="menuItem">

                                        <Link to="/mypage">

                                            <div className="menuIcon">

                                                <UserRound
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>
                                                {userInfo?.userNm || '회원'}님
                                            </p>

                                        </Link>

                                    </li>

                                    {/* 로그아웃 */}
                                    <li className="menuItem">

                                        <Link
                                            to="/"
                                            onClick={onLogout}
                                        >

                                            <div className="menuIcon">

                                                <LogOut
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>로그아웃</p>

                                        </Link>

                                    </li>

                                    {/* 장바구니 */}
                                    <li className="menuItem">

                                        <Link to="/cart">

                                            <div className="menuIcon">

                                                <ShoppingBag
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>장바구니</p>

                                        </Link>

                                    </li>

                                    {/* 고객센터 */}
                                    <li className="menuItem">

                                        <Link to="/cscenter">

                                            <div className="menuIcon">

                                                <CircleHelp
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>고객센터</p>

                                        </Link>

                                    </li>

                                </>

                            ) : (

                                <>

                                    {/* 로그인 */}
                                    <li className="menuItem">

                                        <Link to="/v1/auth/login">

                                            <div className="menuIcon">

                                                <User
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>로그인</p>

                                        </Link>

                                    </li>

                                    {/* 회원가입 */}
                                    <li className="menuItem">

                                        <Link to="/v1/auth/join">

                                            <div className="menuIcon">

                                                <UsersRound
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>회원가입</p>

                                        </Link>

                                    </li>

                                    {/* 장바구니 */}
                                    <li className="menuItem">

                                        <Link to="/v1/auth/login">

                                            <div className="menuIcon">

                                                <ShoppingBag
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>장바구니</p>

                                        </Link>

                                    </li>

                                    {/* 고객센터 */}
                                    <li className="menuItem">

                                        <Link to="/cscenter">

                                            <div className="menuIcon">

                                                <CircleHelp
                                                    size={28}
                                                    strokeWidth={1.8}
                                                />

                                            </div>

                                            <p>고객센터</p>

                                        </Link>

                                    </li>

                                </>

                            )
                        }

                    </ul>

                </div>

            </div>

            {/* GNB */}
            <nav className="gnb">

                <ul className="gnbMenu">

                    {/* 카테고리 */}
                    <li className="categoryMenu">

                        <div
                            className="categoryTitle"
                            onClick={() => navigate('/products')}
                        >
                        

                            <Menu
                                size={20}
                                strokeWidth={2}
                            />

                            <span className="categoryText">
                                카테고리
                            </span>

                            <span className="categoryTextHover">
                                전체보기
                            </span>

                        </div>

                        {/* 카테고리 드롭다운 */}
                        <div className="categoryDropdown">

                            <Link to="/products/6">종합영양</Link>

                            <Link to="/products/1">유산균</Link>

                            <Link to="/products/2">비타민</Link>

                            <Link to="/products/3">오메가3</Link>

                            <Link to="/products/4">미네랄</Link>

                            <Link to="/products/5">뷰티/다이어트</Link>

                        </div>

                    </li>

                    {/* 이번주 신상 */}
                    <li>

                        <Link to="/recommend">

                            <Leaf size={17} />

                            이번 주 신상

                        </Link>

                    </li>

                    {/* 베스트 */}
                    <li>

                        <Link to="/best">

                            <Trophy size={17} />

                            베스트

                        </Link>

                    </li>

                    {/* 건강정보 */}
                    <li>

                        <Link to="/healthinfo">

                            <Bot size={17} />

                            건강정보

                        </Link>

                    </li>

                    {/* 이벤트 */}
                    <li>

                        <Link to="/event">

                            <Gift size={17} />

                            이벤트

                        </Link>

                    </li>

                </ul>

            </nav>

        </header>

    );

}

export default Header;