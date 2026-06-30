import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall, getSessionData } from "../../../service/apiService";
import "./MyChatbotDetail.css";

// 개별 상품 장바구니 버튼 컴포넌트
function ChatCartBtn({ item, userNum }) {
    const [status, setStatus] = useState("idle");

    function handleAddCart(e) { // 버튼 클릭 시 이벤트 버블링 방지
        e.stopPropagation(); // 상품 상세로 이동하는 onClick과 충돌 방지

        if (status === "loading" || status === "done") return; // 중복 클릭 방지

        setStatus("loading"); // 로딩 상태로 변경

        apiCall.post("/api/cart", { // 장바구니 API 호출
            userNum: userNum, // 사용자 번호
            prdId: item.prdId, // 상품 ID
            itQty: 1 // 수량 1로 고정
        })
            .then(() => { // 성공 시 상태 업데이트
                setStatus("done"); // 담김 상태로 변경
            })
            .catch((err) => { // 실패 시 에러 로그와 상태 업데이트
                console.error("장바구니 담기 실패", err); // 에러 로그 출력
                setStatus("error"); // 에러 상태로 변경

                setTimeout(() => { // 3초 후 상태 초기화
                    setStatus("idle"); // 초기 상태로 변경
                }, 3000); // 에러 메시지 보여주고 초기화
            });
    }

    const label = // 버튼 라벨 결정
        status === "loading" ? "담는 중..." : // 로딩 중
        status === "done" ? "✓ 담김" : // 담김 완료
        status === "error" ? "다시 시도" : // 에러 발생
        "장바구니"; // 기본 라벨

    return (
        <button
            className={`chat-cart-btn chat-cart-btn--${status}`} // 버튼 클래스에 상태별 스타일 적용
            onClick={handleAddCart} // 클릭 이벤트 핸들러
            disabled={status === "loading" || status === "done"} // 로딩 중이거나 담김 완료 상태에서는 버튼 비활성화
        >
            {status === "idle" && <span>🛒 </span>} 
            {label}
        </button>
    );
}

function MyChatbotDetail() { // 챗봇 상담 상세 페이지 컴포넌트
    const { chatId } = useParams(); // URL에서 chatId 파라미터 추출
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수

    const [msgList, setMsgList] = useState([]); // 메시지 목록 상태
    const [prdMap, setPrdMap] = useState({}); // 메시지별 상품 맵 상태
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [allCartStatus, setAllCartStatus] = useState("idle"); // 전체 장바구니 상태

    const userNum = getSessionData("userNum");

    const userName = // 사용자 이름을 세션에서 가져오거나 기본값으로 "사용자" 설정
        sessionStorage.getItem("userNm") || // 세션에서 사용자 이름 가져오기
        sessionStorage.getItem("userName") || // 세션에서 다른 키로 사용자 이름 가져오기
        "사용자";

    useEffect(() => { // 컴포넌트 마운트 시 챗봇 상담 상세 데이터 호출
        if (!userNum) { // 로그인 여부 확인
            alert("로그인이 필요합니다."); // 로그인 필요 알림
            navigate("/v1/auth/login"); // 로그인 페이지로 이동
            return;
        }

        callChatDetail(); // 챗봇 상담 상세 데이터 호출 함수 실행
    }, [chatId]); // chatId가 변경될 때마다 데이터 다시 호출

    async function callChatDetail() { // 챗봇 상담 상세 데이터 호출 함수
        try {
            const data = await apiCall.get(`/api/v1/chatbot/messages/${chatId}`); // API 호출하여 메시지 데이터 가져오기
            setMsgList(data); // 메시지 목록 상태 업데이트

            for (const msg of data) { // 각 메시지에 대해 AI가 보낸 메시지인 경우 상품 정보 호출
                if (msg.senderCd === "AI") { // AI가 보낸 메시지인 경우
                    callProductsFromMsg(msg.msgId, msg.msgTxt); // 메시지 ID와 텍스트를 사용하여 상품 정보 호출
                }
            }

            setError(null); // 에러 상태 초기화
        } catch (err) {
            console.error("챗봇 상세 조회 오류", err);
            setError("AI 챗봇 상담 내역을 불러오지 못했습니다.");
        } finally {
            setLoading(false); // 로딩 상태 해제
        }
    }

    async function callProductsFromMsg(msgId, msgTxt) { // 메시지에서 상품 ID 추출하여 상품 정보 호출 함수
        try {
            const prdIds = getPrdIds(msgTxt); // 메시지 텍스트에서 상품 ID 추출
            const prdList = []; // 상품 정보 리스트 초기화

            for (const prdId of prdIds) { // 각 상품 ID에 대해 상품 정보 API 호출
                const prd = await apiCall.get(`/api/v1/product/detail/${prdId}`); // 상품 상세 정보 API 호출
                prdList.push(prd); // 상품 정보 리스트에 추가
            }

            setPrdMap((prev) => ({ // 이전 상품 맵 상태를 유지하면서 새로운 메시지 ID에 대한 상품 리스트 추가
                ...prev, // 이전 상태 유지
                [msgId]: prdList // 현재 메시지 ID에 대한 상품 리스트 추가
            })); 
        } catch (err) { // 상품 정보 조회 실패 시 에러 로그 출력
            console.error("상품 정보 조회 오류", err); // 상품 정보 조회 실패는 치명적이지 않으므로 에러 상태 업데이트는 하지 않음
        }
    }

    function parseAiJson(msgTxt) { // AI 메시지 텍스트에서 JSON 형식의 데이터 파싱 함수
        try {
            return JSON.parse(msgTxt); // 메시지 텍스트를 JSON으로 파싱하여 반환
        } catch (err) { // 파싱 실패 시 에러 로그 출력 및 null 반환
            return null; // 메시지 텍스트가 JSON 형식이 아닌 경우 null 반환
        }
    }

    function getPrdIds(msgTxt) { // 메시지 텍스트에서 상품 ID 추출 함수
        const json = parseAiJson(msgTxt); // 메시지 텍스트가 JSON 형식인 경우 products 배열에서 상품 ID 추출

        if (json && json.products) { // JSON 형식이고 products 배열이 있는 경우
            return json.products.map((item) => item.prd_id); // products 배열에서 prd_id만 추출하여 반환
        }

        const ids = []; // 메시지 텍스트에서 "상품ID: 숫자" 패턴을 정규식으로 찾아 상품 ID 추출
        const matches = msgTxt.matchAll(/상품ID:\s*(\d+)/g); // "상품ID: 숫자" 패턴을 모두 찾아서 반복 처리

        for (const match of matches) { // 각 패턴 매칭 결과에서 상품 ID 추출하여 리스트에 추가
            ids.push(match[1]); // 정규식에서 첫 번째 그룹(숫자 부분)을 추출하여 리스트에 추가
        }

        return ids; // 추출된 상품 ID 리스트 반환
    }

    function showAiText(msgTxt) { // AI 메시지 텍스트를 화면에 표시하는 함수
        const json = parseAiJson(msgTxt); // 메시지 텍스트가 JSON 형식인 경우 reason, comboReason, caution을 화면에 표시하기 위해 JSON 파싱

        if (json) { // 메시지 텍스트가 JSON 형식인 경우 reason, comboReason, caution을 화면에 표시
            return (
                <>
                    <p>{json.reason}</p> 

                    <p>
                        <strong>조합이유: </strong>
                        {json.comboReason}
                    </p>

                    <p>
                        <strong>주의사항: </strong>
                        {json.caution}
                    </p>
                </>
            );
        }

        let text = msgTxt;

        text = text.replace(/추천상품:[\s\S]*?(?=조합이유:)/, "");
        text = text.replace(/조합이유:/g, "\n조합이유:");
        text = text.replace(/주의사항:/g, "\n주의사항:");

        return <p>{text.trim()}</p>;
    }

    function goProductDetail(prdId) {
        navigate(`/products/detail/${prdId}`);
    }

    function getAllProducts() {
        let allProducts = [];

        Object.values(prdMap).forEach((prdList) => {
            allProducts = allProducts.concat(prdList);
        });

        return allProducts;
    }

    async function handleAddAllCart() {
        if (allCartStatus === "loading" || allCartStatus === "done") return;

        const allProducts = getAllProducts();

        if (allProducts.length === 0) {
            alert("담을 추천 상품이 없습니다.");
            return;
        }

        setAllCartStatus("loading");

        try {
            for (const item of allProducts) {
                await apiCall.post("/api/cart", {
                    userNum: userNum,
                    prdId: item.prdId,
                    itQty: 1
                });
            }

            setAllCartStatus("done");
        } catch (err) {
            console.error("전체 장바구니 담기 실패", err);
            setAllCartStatus("error");

            setTimeout(() => {
                setAllCartStatus("idle");
            }, 3000);
        }
    }

    if (loading) {
        return (
            <div className="chat-loading-wrap">
                <div className="chat-loading-spinner" />
                <p className="chat-loading-text">AI 상담 내역을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="chat-error-wrap">
                <p className="chat-error-text">{error}</p>
                <button
                    className="chat-btn chat-btn--back"
                    onClick={() => navigate(-1)}
                >
                    ← 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="chat-detail-wrap">
            <div className="chat-detail-header">
                <div>
                    <div className="chat-detail-badge">🤖 AI 챗봇 상담</div>
                    <h1 className="chat-detail-title">AI 챗봇 상담 상세</h1>
                </div>

                <button
                    className={`chat-all-cart-btn chat-all-cart-btn--${allCartStatus}`}
                    onClick={handleAddAllCart}
                    disabled={allCartStatus === "loading" || allCartStatus === "done"}
                >
                    {allCartStatus === "loading" && "담는 중..."}
                    {allCartStatus === "done" && "✓ 전체 담김"}
                    {allCartStatus === "error" && "다시 시도"}
                    {allCartStatus === "idle" && "🛒 추천상품 전체 담기"}
                </button>
            </div>

            <div className="chat-msg-list">
                {msgList.map((msg) => (
                    <div
                        key={msg.msgId}
                        className={msg.senderCd === "USER" ? "chat-msg chat-msg--user" : "chat-msg chat-msg--ai"}
                    >
                        <div className="chat-msg__sender">
                            {msg.senderCd === "USER" ? `${userName}님` : "VitaPick AI"}
                        </div>

                        {msg.senderCd === "USER" ? (
                            <p className="chat-msg__text">{msg.msgTxt}</p>
                        ) : (
                            <div className="chat-ai-row">
                                <div className="chat-msg__text">
                                    {showAiText(msg.msgTxt)}
                                </div>

                                {prdMap[msg.msgId] && prdMap[msg.msgId].length > 0 && (
                                    <div className="chat-prd-section">
                                        <h3 className="chat-prd-section__title">
                                            추천 상품
                                        </h3>

                                        <div className="chat-prd-list">
                                            {prdMap[msg.msgId].map((item) => (
                                                <div
                                                    key={item.prdId}
                                                    className="chat-prd-item"
                                                >
                                                    <div
                                                        className="chat-prd-item__img-wrap"
                                                        onClick={() => goProductDetail(item.prdId)}
                                                    >
                                                        <img
                                                            src={item.thumbImgUrl || "/images/no-image.png"}
                                                            alt={item.prdNm}
                                                            className="chat-prd-item__img"
                                                            onError={(e) => {
                                                                e.target.src = "/images/no-image.png";
                                                            }}
                                                        />
                                                    </div>

                                                    <div
                                                        className="chat-prd-item__info"
                                                        onClick={() => goProductDetail(item.prdId)}
                                                    >
                                                        <p className="chat-prd-item__brand">
                                                            {item.brand}
                                                        </p>

                                                        <p className="chat-prd-item__name">
                                                            {item.prdNm}
                                                        </p>

                                                        <p className="chat-prd-item__price">
                                                            {item.price?.toLocaleString("ko-KR")}원
                                                        </p>
                                                    </div>

                                                    <ChatCartBtn
                                                        item={item}
                                                        userNum={userNum}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="chat-actions">
                <button
                    className="chat-btn chat-btn--list"
                    onClick={() => navigate("/mypage/mychatbot")}
                >
                    📋 상담 목록
                </button>

                <button
                    className="chat-btn chat-btn--cart"
                    onClick={() => navigate("/cart")}
                >
                    🛒 장바구니 보기
                </button>
            </div>
        </div>
    );
}

export default MyChatbotDetail;