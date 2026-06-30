import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footerInner">
                <div className="footerLogo">
                    <img src="/images/VitaPick_Logo.png"
                        alt="VitaPick 로고" />
                </div>
                <div className="footerInfo">
                    <p>㈜비타민족</p>
                    <p>대표 : 최예준</p>
                    <p>사업자 등록번호 : 123-12-12345</p>
                    <p>주소 : 경기도 성남시 분당구 돌마로 46</p>
                </div>
                <div className="footerCs">
                    <p>고객센터</p>
                    <p>02-1111-1111</p>
                    <p>평일 : 10:00 - 19:00</p>
                    <p>주말, 공휴일 제외</p>
                </div>
                <div className="footerLinks">
                    <a href="#">이용약관</a>
                    <a href="#">개인정보처리방침</a>
                    <a href="#">개인정보이용제공내역</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;