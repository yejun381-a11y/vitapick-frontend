import { Routes, Route } from 'react-router-dom';

import ScrollTop from './ScrollTop';
import Home from '../../pages/home/Home';
import HealthInfo from '../../pages/gnb/HealthInfo';
import Event from '../../pages/gnb/Event'

import Login from '../../pages/users/Login';
import Join from '../../pages/users/Join';
import FindId from '../../pages/users/FindId';
import FindPwd from '../../pages/users/FindPwd';
import Sur from '../../pages/custom/Sur';

import MyPage from './Mypage';
import MyMain from '../../pages/mypage/mymain/MyMain';
import MyProfile from '../../pages/mypage/myprofile/MyProfile';
import MyorderList from '../../pages/mypage/myorder/MyorderList';
import MyorderDetail from '../../pages/mypage/myorder/MyorderDetail';
import MyCustomList from '../../pages/mypage/mycustom/MyCustomList';
import MyChatbotList from '../../pages/mypage/mychatbot/MyChatbotList';
import MyChatbotDetail from '../../pages/mypage/mychatbot/MyChatbotDetail';
import UserAddrList from '../../pages/mypage/myaddress/UserAddrList';
import MyReviewList from '../../pages/mypage/myreview/MyReviewList';
import MyReviewDetail from '../../pages/mypage/myreview/MyReviewDetail';
import MyWishList from '../../pages/mypage/mywishlist/MyWishList';
import MyInquiry from '../../pages/mypage/myinquiry/MyInquiry'
import MyWithdraw from '../../pages/mypage/mywithdraw/MyWithdraw'

import CsMain from '../../pages/cscenter/csmain/CsMain';
import NoticeList from '../../pages/cscenter/ntc/NoticeList';
import NoticeDetail from '../../pages/cscenter/ntc/NoticeDetail';
import NoticeForm from '../../pages/cscenter/ntc/NoticeForm';

import FaqList from '../../pages/cscenter/faq/FaqList';
import FaqDetail from '../../pages/cscenter/faq/FaqDetail';
import FaqForm from '../../pages/cscenter/faq/FaqForm';

import InquiryList from '../../pages/cscenter/inq/InquiryList';
import InquiryDetail from '../../pages/cscenter/inq/InquiryDetail';
import InquiryForm from '../../pages/cscenter/inq/InquiryForm';

import Chatbot from '../../pages/chatbot/Chatbot';

import CusResult from '../../pages/custom/CusResult';

import ProductList from '../../pages/products/ProductList';
import ProductDetail from '../../pages/products/ProductDetail';
import NewProductList from '../../pages/gnb/NewProductList';
import BestProductList from '../../pages/gnb/BestProductList';

import Cart from '../../pages/cart/Cart';

import Order from '../../pages/order/Order';
import OrderComplete from '../../pages/order/OrderComplete';

import AdminPage from '../../pages/admin/AdminPage';

function Main({ onLoginSubmit, isLoggedIn }) {

    return (
        <main>
            <ScrollTop />
            <Routes>
                <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />

                {/* 로그인 */}
                <Route
                    path="/v1/auth/login"
                    element={<Login onLoginSubmit={onLoginSubmit} />}
                />

                {/* 아이디찾기, 비번찾기 */}
                <Route path="/v1/auth/findid" element={<FindId />} />
                <Route path="/v1/auth/sendotpcode" element={<FindPwd />} />

                {/* 회원가입 */}
                <Route
                    path="/v1/auth/join"
                    element={<Join />}
                />

                {/* 건강정보 */}
                <Route
                    path="/healthInfo"
                    element={<HealthInfo />}
                />

                {/* 이벤트 */}
                <Route
                    path="/event"
                    element={<Event />}
                />

                {/* 마이페이지-내정보 */}
                <Route path="/mypage" element={<MyPage />}>
                    <Route index element={<MyMain />} />

                    {/* 내 정보보기, 수정 */}
                    <Route path="myprofile" element={<MyProfile />} />

                    {/* 나의 주문 내역 */}
                    <Route path="myorder" element={<MyorderList />} />

                    {/* 나의 주문 내역 상세 */}
                    <Route path="myorder/:ordNo" element={<MyorderDetail />} />

                    {/* 나의 배송지 관리 */}
                    <Route path="myaddress" element={<UserAddrList />} />

                    {/* 챗봇 상담 내역 */}
                    <Route path="mychatbot" element={<MyChatbotList />} />

                    {/* 챗봇 상담 상세 */}
                    <Route path="mychatbot/:chatId" element={<MyChatbotDetail />} />

                    {/* 내가 쓴 리뷰 목록 */}
                    <Route path="myreview" element={<MyReviewList />} />

                    {/* 내가 쓴 리뷰 상세 */}
                    <Route path="myreview/:rvwId" element={<MyReviewDetail />} />

                    {/* 내가 찜한 상품 목록 */}
                    <Route path="mywishlist" element={<MyWishList />} />

                    {/* 나의 맞춤 추천 결과 */}
                    <Route path="mycustom" element={<MyCustomList />} />

                    {/* 나의 1대1 문의 목록 */}
                    <Route path="myinquiry" element={<MyInquiry />} />

                    {/* 회원 탈퇴 */}
                    <Route path="mywithdraw" element={<MyWithdraw />} />
                </Route>

                {/* 고객센터 메인 */}
                <Route path="/cscenter" element={<CsMain />} />

                {/* 공지사항 */}
                <Route path="/cscenter/notices" element={<NoticeList />} />
                <Route path="/cscenter/notices/:ntcId" element={<NoticeDetail />} />
                <Route path="/cscenter/notices/new" element={<NoticeForm />} />
                <Route path="/cscenter/notices/:ntcId/edit" element={<NoticeForm />} />

                {/* FAQ */}
                <Route path="/cscenter/faqs" element={<FaqList />} />
                <Route path="/cscenter/faqs/:faqId" element={<FaqDetail />} />
                <Route path="/cscenter/faqs/new" element={<FaqForm />} />
                <Route path="/cscenter/faqs/:faqId/edit" element={<FaqForm />} />

                {/* 1:1 문의 */}
                <Route path="/cscenter/inquiries" element={<InquiryList />} />
                <Route path="/cscenter/inquiries/:inqId" element={<InquiryDetail />} />
                <Route path="/cscenter/inquiries/new" element={<InquiryForm />} />
                <Route path="/cscenter/inquiries/:inqId/edit" element={<InquiryForm />} />

                {/* 상품 상세 */}
                <Route path="/products/detail/:prdId" element={<ProductDetail />} />

                {/* 상품 검색 결과 */}
                <Route path="/products/search/:keyword" element={<ProductList />} />

                {/* 전체 상품 목록 */}
                <Route path="/products" element={<ProductList />} />

                {/* 상품 목록 */}
                <Route path="/products/:catCd" element={<ProductList />} />

                {/* 이번 주 신상 */}
                <Route path="/recommend" element={<NewProductList />} />

                {/* 베스트 상품 */}
                <Route path="/best" element={<BestProductList />} />

                {/* 챗봇 */}
                <Route path="/chatbot" element={<Chatbot />} />

                {/* 설문 작성 */}
                <Route path="/v1/sur/save" element={<Sur />} />

                {/* AI 추천 결과 */}
                <Route path="/v1/cus/result/:cusId" element={<CusResult />} />

                {/* 장바구니 */}
                <Route path="/cart" element={<Cart />} />

                {/* 주문서 */}
                <Route path="/order" element={<Order />} />

                {/* 주문 완료 */}
                <Route path="/order/complete/:ordNo" element={<OrderComplete />} />

                {/* 관리자 */}
                <Route path="/admin/*" element={<AdminPage />} />

            </Routes>
        </main>
    );
}

export default Main;
