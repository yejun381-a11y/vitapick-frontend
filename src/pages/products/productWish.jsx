import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getToken } from '../../service/apiService';

// 상품 찜하기 컴포넌트
const ProductWish = ({ prdId }) => {

    const navigate = useNavigate();

    // 현재 상품이 찜 되어 있는지 여부
    const [wished, setWished] = useState(false);

    // 로그인 체크
    const checkLogin = () => {
        const token = getToken();

        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/v1/auth/login');
            return false;
        }

        return true;
    };

    // 상품 상세 페이지에 들어왔을 때 찜 여부 확인
    useEffect(() => {
        const fetchWishStatus = async () => {
            try {
                const token = getToken();

                // 비로그인 상태면 찜 여부 조회 안 함
                if (!token) {
                    setWished(false);
                    return;
                }

                // 백엔드에서 토큰으로 userNum 확인
                // 프론트에서는 prdId만 보내면 됨
                const data = await apiCall.get(`/api/v1/wish/check/${prdId}`);

                // true면 찜완료, false면 찜 안 함
                setWished(data);

            } catch (err) {
                console.error('찜 여부 조회 오류:', err);
            }
        };

        fetchWishStatus();
    }, [prdId]);

    // 찜하기 / 찜취소
    const handleToggleWish = async () => {
        if (!checkLogin()) return;

        try {
            // true 반환 = 찜 추가됨
            // false 반환 = 찜 취소됨
            const result = await apiCall.post(`/api/v1/wish/toggle/${prdId}`);

            // 버튼 상태 변경
            setWished(result);

        } catch (err) {
            console.error('찜 처리 오류:', err);
            alert('찜 처리에 실패했습니다.');
        }
    };

    return (
        <button
            className={`detail_wish_btn ${wished ? 'wished' : ''}`}
            onClick={handleToggleWish}
        >
            {wished ? '♥ 찜완료' : '♡ 찜하기'}
        </button>
    );
};

export default ProductWish;