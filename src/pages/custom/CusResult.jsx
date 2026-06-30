import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiCall, getSessionData } from "../../service/apiService";
import "./cusResult.css";
import {
    Pill, ShoppingCart, Info, Lightbulb, Sparkles, TriangleAlert, ClipboardList, Newspaper
} from 'lucide-react';

// ── 아이템별 장바구니 버튼 상태: idle | loading | done | error
function CartBtn({ item, cusId, userNum}) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  function handleAddCart(e) {
    e.stopPropagation(); // 상품 상세 이동 막기
    if (status === "loading" || status === "done") return;

    setStatus("loading");

    const cartDTO = {
      userNum,
      prdId: item.prdId,
      cusId,       // 커스텀 출처 → 장바구니 섹션 분리에 사용
      itQty: 1,
    };

    apiCall.post("/api/cart", cartDTO)
      .then(() => {
        setStatus("done");
      })
      .catch((err) => {
        console.error("장바구니 담기 실패", err);
        setStatus("error");
        // 3초 후 재시도 가능하게 초기화
        setTimeout(() => setStatus("idle"), 3000);
      });
  }

  const label =
    status === "loading" ? "담는 중..." :
    status === "done"    ? "✓ 담김" :
    status === "error"   ? "다시 시도" :
    "장바구니";

  return (
    <button
      className={`cus-cart-btn cus-cart-btn--${status}`}
      onClick={handleAddCart}
      disabled={status === "loading" || status === "done"}
    >
      {status === "idle" && <span className="cus-cart-btn__icon"><ShoppingCart /></span>}
      {label}
    </button>
  );
}

export default function CusResult() {
  const { cusId } = useParams();
  const navigate = useNavigate();

  const [cusData, setCusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 전체 담기 상태
  const [allCartStatus, setAllCartStatus] = useState("idle"); // idle | loading | done | error

  const userNum = getSessionData("userNum");

  useEffect(() => {
    if (!userNum) {
      alert("로그인이 필요합니다.!!");
      navigate("/v1/auth/login");
      return;
    }

    apiCall.get(`/api/v1/cus/detail/${cusId}`)
      .then((data) => setCusData(data))
      .catch((err) => {
        console.error("추천 결과 조회 실패", err);
        setError("추천 결과를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [cusId, navigate]);

  // ── 전체 장바구니 담기 ──────────────────────────────────────────
  async function handleAddAllCart() {
    if (allCartStatus === "loading" || allCartStatus === "done") return;
    if (!cusData?.items?.length) return;

    setAllCartStatus("loading");

    try {
      // 순차적으로 담기 (동시 요청 시 totalCheckQty 충돌 방지)
      for (const item of cusData.items) {
        await apiCall.post("/api/cart", {
          userNum: userNum,
          prdId: item.prdId,
          cusId: Number(cusId),
          itQty: 1,
        });
      }
      setAllCartStatus("done");
    } catch (err) {
      console.error("전체 장바구니 담기 실패", err);
      setAllCartStatus("error");
      setTimeout(() => setAllCartStatus("idle"), 3000);
    }
  }

  // ── 로딩 / 에러 화면 ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="cus-loading-wrap">
        <div className="cus-loading-spinner" />
        <p className="cus-loading-text">AI 추천 결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cus-error-wrap">
        <p className="cus-error-text">{error}</p>
        <button className="cus-btn cus-btn--back" onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>
    );
  }

  const sortedItems = [...(cusData?.items || [])].sort(
    (a, b) => a.sortNum - b.sortNum
  );

  return (
    <div className="cus-wrap">
      {/* ── 헤더 ── */}
      <div className="cus-header">
        <div className="cus-header__badge">AI 맞춤 추천</div>
        <h1 className="cus-header__title">나만의 영양제 처방전</h1>
        <div className="cus-header__subtitle">{cusData.surTitle}</div>
        <p className="cus-header__date">
          {cusData?.crtAt
            ? new Date(cusData.crtAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>
      </div>

      <div className="cus-body">

        {/* ── 건강 요약 ── */}
        <div className="cus-card cus-card--summary">
          <div className="cus-card__head">
            <div className="cus-card__icon"><Info /></div>
            <h2 className="cus-card__title">내 건강 요약</h2>
          </div>
            <p className="cus-card__content">{cusData?.cusSum}</p>
        </div>

        {/* ── 추천 이유 ── */}
        <div className="cus-card cus-card--reason">
          <div className="cus-card__head">
            <div className="cus-card__icon"><Lightbulb /></div>
            <h2 className="cus-card__title">추천 이유</h2>
          </div>
            <p className="cus-card__content">{cusData?.cusReason}</p>
        </div>

        {/* ── 추천 상품 목록 ── */}
        <div className="cus-section">
          <div className="cus-section__head">
            <h2 className="cus-section__title"><Sparkles /> 추천 영양제</h2>

            {/* 전체 장바구니 담기 */}
            <button
              className={`cus-all-cart-btn cus-all-cart-btn--${allCartStatus}`}
              onClick={handleAddAllCart}
              disabled={allCartStatus === "loading" || allCartStatus === "done"}
            >
              {allCartStatus === "loading" && "담는 중..."}
              {allCartStatus === "done"    && "✓ 전체 담김"}
              {allCartStatus === "error"   && "다시 시도"}
              {allCartStatus === "idle"    && <><ShoppingCart size={16} />전체 담기</>}
            </button>
          </div>

          <div className="cus-items">
            {sortedItems.map((item) => (
              <div key={item.cusItId} className="cus-item">

                {/* 순위 뱃지 */}
                <div className="cus-item__rank">
                  <span className="cus-item__rank-num">{item.sortNum}</span>
                </div>

                {/* 이미지 — 클릭 시 상품 상세 이동 */}
                <div
                  className="cus-item__img-wrap"
                  onClick={() => navigate(`/products/detail/${item.prdId}`)}
                  title="상품 상세 보기"
                >
                  <img
                    src={item.prdImg || "/images/no-image.png"}
                    alt={item.prdName}
                    className="cus-item__img"
                    onError={(e) => { e.target.src = "/images/no-image.png"; }}
                  />
                </div>

                {/* 상품 정보 — 클릭 시 상품 상세 이동 */}
                <div
                  className="cus-item__info"
                  onClick={() => navigate(`/products/detail/${item.prdId}`)}
                >
                  <p className="cus-item__name">{item.prdName}</p>
                  <p className="cus-item__price">
                    {item.prdPrice?.toLocaleString("ko-KR")}원
                  </p>
                </div>

                {/* 장바구니 버튼 — 클릭 이벤트 분리 */}
                <CartBtn
                  item={item}
                  cusId={Number(cusId)}
                  userNum={userNum}
                />

              </div>
            ))}
          </div>
        </div>

        {/* ── 복용 가이드 + 주의사항 ── */}
        <div className="cus-guide-row">
          <div className="cus-card cus-card--dosage">
            <div className="cus-card__head">
              <div className="cus-card__icon"><Pill /></div>
              <h2 className="cus-card__title">복용 가이드</h2>
            </div>
            <p className="cus-card__content">{cusData?.cusDos}</p>
          </div>
          <div className="cus-card cus-card--caution">
            <div className="cus-card__head">
              <div className="cus-card__icon"><TriangleAlert /></div>
              <h2 className="cus-card__title">주의사항</h2>
            </div>
            <p className="cus-card__content">{cusData?.cusCaution}</p>
          </div>
        </div>

        {/* ── 하단 버튼 ── */}
        <div className="cus-actions">
          <button
            className="cus-btn cus-btn--list"
            onClick={() => navigate("/mypage/mycustom")}
          >
            <ClipboardList /> 내 추천 목록
          </button>
          <button
            className="cus-btn cus-btn--cart"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart /> 장바구니 보기
          </button>
          <button
            className="cus-btn cus-btn--survey"
            onClick={() => navigate("/v1/sur/save")}
          >
            <Newspaper /> 다시 설문하기
          </button>
        </div>

      </div>
    </div>
  );
}