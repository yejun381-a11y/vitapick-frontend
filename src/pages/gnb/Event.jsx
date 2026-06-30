import './Event.css';

function Event() {
    return (
        <div className="eventPage">

            <section className="eventBanner">

                <div className="eventBannerText">

                    <span>비타픽 사은품 증정 이벤트</span>

                    <h3>
                        구매하신 모든 고객님께<br />
                        <strong>비타픽 알약 소분통을 드려요!</strong>
                    </h3>

                    <p>
                        매일 챙겨 먹는 영양제, 더 간편하게!<br />
                        비타픽이 건강한 습관을 응원합니다.
                    </p>

                </div>

                <div className="eventBannerImg">
                    <img
                        src="/images/VitaPick_Event1.png"
                        alt="비타픽 알약 소분통"
                    />
                </div>

                <div className="eventGiftBadge">
                    전 고객<br />
                    증정
                </div>

                <div className="eventDots">
                    <span className="active"></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </section>

        </div>
    );
}

export default Event;