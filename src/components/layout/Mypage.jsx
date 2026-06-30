import { NavLink, Outlet } from 'react-router-dom';

import './Mypage.css';

function Mypage() {

    return (
        <div className="mypageWrap">

            {/* 사이드바 */}
            <div className="mypageSidebar">

                <h2 className="mypageTitle">
                    <NavLink to="/mypage">
                        마이페이지
                    </NavLink>
                </h2>

                <ul className="mypageMenu">

                    <li>
                        <NavLink to="/mypage/myprofile">
                            회원정보 수정
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/myorder">
                            주문 내역
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/mywishlist">
                            찜한 상품
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/mycustom">
                            내 비타민 추천
                        </NavLink>
                    </li>


                    <li>
                        <NavLink to="/mypage/mychatbot">
                            AI 챗봇
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/myaddress">
                            배송지 관리
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/myreview">
                            리뷰 관리
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/myinquiry">
                            1:1 문의 관리
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/mypage/mywithdraw">
                        회원 탈퇴
                        </NavLink>
                    </li>

                </ul>

            </div>

            {/* 컨텐츠 영역 */}
            <div className="mypageContent">
                <Outlet />
            </div>

        </div>
    );
}

export default Mypage;