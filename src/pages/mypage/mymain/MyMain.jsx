import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiCall } from '../../../service/apiService';


import './MyMain.css';

import {
    Package,
    Heart,
    MessageCircle
} from 'lucide-react';

function MyMain() {

    const navigate = useNavigate();

    const userNm = sessionStorage.getItem('userNm');


    const [summary, setSummary] = useState({
        orderCount: 0,
        wishCount: 0,
        inqCount: 0
    });



    useEffect(() => {

        const getSummary = async () => {

            try {

                const [orderList, wishList, inqList] = await Promise.all([
                    apiCall.get('/api/order'),
                    apiCall.get('/api/v1/wish'),
                    apiCall.get('/api/cscenter/mypage/inquiries')
                ]);

                setSummary({
                    orderCount: orderList?.length || 0,
                    wishCount: wishList?.length || 0,
                    inqCount: inqList?.length || 0
                });

            } catch (error) {
                console.log('마이페이지 요약 조회 실패', error);
            }

        };

        getSummary();

    }, []);

    return (
        <div className="myMain">

            <div className="myMainCard">

                <div className="myMainText">

                    <h2>{userNm}님 안녕하세요 👋</h2>

                    <p>
                        비타픽 마이페이지입니다.
                    </p>

                    <div className="mySummaryWrap">

                        <div
                            className="mySummaryCard"
                            onClick={() => navigate('/mypage/myorder')}
                        >

                            <Package
                                size={24}
                                className="summaryIcon"
                            />

                            <div>
                                <strong>{summary.orderCount}</strong>
                                <p>주문 내역</p>
                            </div>

                        </div>

                        <div
                            className="mySummaryCard"
                            onClick={() => navigate('/mypage/mywishlist')}
                        >

                            <Heart
                                size={24}
                                className="summaryIcon"
                            />

                            <div>
                                <strong>{summary.wishCount}</strong>
                                <p>찜한 상품</p>
                            </div>

                        </div>
                        <div
                            className="mySummaryCard"
                            onClick={() => navigate('/mypage/myinquiry')}
                        >

                            <MessageCircle
                                size={24}
                                className="summaryIcon"
                            />

                            <div>
                                <strong>{summary.inqCount}</strong>
                                <p>문의 내역</p>
                            </div>

                        </div>

                    </div>

                </div>

                <div className="myMainCharacter">

                    <img
                        src="/images/VitaPick.png"
                        alt="캐릭터"
                    />

                </div>

            </div>

            <div className="mySurveyBanner">

                <img
                    src="/images/VitaPick_MyMain.png"
                    alt="AI 설문 배너"
                />
                <button
                    type="button"
                    className="mySurveyBtn"
                    onClick={() => navigate('/v1/sur/save')}
                >
                    내 비타민 추천받기 →
                </button>

            </div>

        </div>
    );
}

export default MyMain;