import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiCall } from '../../service/apiService';
import './Home.css';

function Home({ isLoggedIn }) {

    const navigate = useNavigate();

    // 인기상품 TOP5 목록
    const [prdList, setPrdList] = useState([]);

    // 메인 배너 이미지 목록
    const bannerList = [
        '/images/VitaPick_MainBanner1.png',
        '/images/VitaPick_MainBanner2.png',
        '/images/VitaPick_MainBanner3.png'
    ];

    // 슬라이드용 배너 목록
    const slideBannerList = [
        ...bannerList,
        bannerList[0]
    ];

    // 현재 배너 위치
    const [bannerIndex, setBannerIndex] = useState(0);

    // 슬라이드 애니메이션 사용 여부
    const [isSliding, setIsSliding] = useState(true);

    // 메인 배너 자동 슬라이드
    useEffect(() => {

        const timer = setInterval(() => {

            setBannerIndex(prev => prev + 1);

        }, 5000);

        return () => clearInterval(timer);

    }, []);

    // 마지막 복사 배너에서 진짜 첫 번째 배너로 순간 이동
    useEffect(() => {

        if (bannerIndex !== bannerList.length) {
            return;
        }

        const resetTimer = setTimeout(() => {

            setIsSliding(false);
            setBannerIndex(0);

            setTimeout(() => {
                setIsSliding(true);
            }, 50);

        }, 1200);

        return () => clearTimeout(resetTimer);

    }, [bannerIndex, bannerList.length]);

    // 페이지 열릴 때 상품별 판매량 TOP5 가져오기
    useEffect(() => {

        const fetchTopProducts = async () => {

            try {

                const data = await apiCall.get('/api/order/top-products');

                console.log('인기상품 TOP5:', data);

                setPrdList(Array.isArray(data) ? data : data.data || []);

            } catch (error) {

                console.log(error);
            }
        };

        fetchTopProducts();

    }, []);

    return (
        <main className="home">

            {/* 메인 배너 영역 */}
            <section className="mainBanner">

                {/* 메인 배너 슬라이드 영역 */}
                <div
                    className="bannerTrack"
                    style={{
                        transform: `translateX(-${bannerIndex * 100}%)`,
                        transition: isSliding ? 'transform 1.2s ease-in-out' : 'none'
                    }}
                >
                    {slideBannerList.map((banner, idx) => (
                        <img
                            key={idx}
                            src={banner}
                            alt={`메인 배너 ${idx + 1}`}
                        />
                    ))}
                </div>

            </section>

            {/* AI 맞춤 영양 설문 영역 */}
            <section className="heroSection">

                {/* AI 맞춤 영양 설문 텍스트 */}
                <div className="heroText">

                    <p className="heroBadge">
                        AI 맞춤 영양제 추천
                    </p>

                    <h1>
                        나에게 딱 맞는<br />
                        영양제를 찾아보세요
                    </h1>

                    <p className="heroDesc">
                        간단한 설문으로 내 건강 상태에 맞는 영양제를 추천받아보세요.
                    </p>

                    {/* 설문 시작 버튼 */}
                    <button
                        className="heroButton"
                        onClick={() => {
                            if (!isLoggedIn) {
                                navigate('/v1/auth/login');
                            } else {
                                navigate('/v1/sur/save');
                            }
                        }}
                    >
                        설문 시작하기
                    </button>

                </div>

                {/* 챗봇 이미지 영역 */}
                <div className="heroImage">
                    <img
                        src="/images/VitaPick_ChatBot.png"
                        alt="VitaPick 챗봇 캐릭터"
                    />
                </div>

            </section>

            {/* 추천상품 영역 */}
            <section className="productSection">

                {/* 추천상품 제목 영역 */}
                <div className="sectionTitleBox">
                    <p className="sectionBadge">VitaPick 인기상품</p>
                    <h2>가장 주목받는 VitaPick!</h2>
                </div>

                {/* 추천상품 목록 */}
                <div className="productList">

                    {prdList.map((prd, index) => (

                        /* 추천상품 카드 */
                        <div
                            key={prd[0]}
                            className="productCard"
                            onClick={() => navigate(`/products/detail/${prd[0]}`)}
                        >
                            {/* 상품 썸네일 이미지 */}
                            <img
                                src={prd[2]}
                                alt={prd[1]}
                                className="productImage"
                            />

                            {/* 순위 */}
                            <p className="productCategory">
                                BEST {index + 1}
                            </p>

                            {/* 상품명 */}
                            <h3>{prd[1]}</h3>

                            {/* 판매량 */}
                            <p className="productDesc">
                                {prd[3]}명이 선택한 인기 상품
                            </p>

                        </div>

                    ))}

                </div>

            </section>

        </main>
    );
}

export default Home;