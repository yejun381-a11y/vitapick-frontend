import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../service/apiService';
import '../products/ProductList.css';

const ProductBest = () => {

    const navigate = useNavigate();

    // 베스트 상품 목록
    const [prdList, setPrdList] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 베스트 상품 목록 가져오기
    useEffect(() => {
        const fetchBestList = async () => {
            setLoading(true);

            try {
                const data = await apiCall.get('/api/v1/product/best');
                setPrdList(data);
            } catch (err) {
                console.error('베스트 상품 목록 오류:', err);
                setPrdList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBestList();
    }, []);

    if (loading) return <div className='prd_loading'>로딩 중...</div>;

    return (
        <div className='prd_container'>

            <h2 className='prd_page_title'>베스트 상품</h2>

            {prdList.length === 0 ? (
                <div className='prd_empty'>
                    <h3>베스트 상품이 없습니다.</h3>
                    <p>주문 데이터가 쌓이면 이곳에 표시됩니다.</p>
                </div>
            ) : (
                <div className='prd_list'>
                    {prdList.map((prd) => (
                        <div
                            key={prd.prdId}
                            className='prd_card'
                            onClick={() => navigate(`/products/detail/${prd.prdId}`)}
                        >
                            <img
                                src={prd.thumbImgUrl || '/images/no-image.png'}
                                alt={prd.prdNm}
                                onError={(e) => {
                                    e.target.src = '/images/no-image.png';
                                }}
                            />

                            <div className='prd_info'>
                                <p className='prd_brand'>{prd.brand}</p>
                                <h3 className='prd_nm'>{prd.prdNm}</h3>
                                <strong className='prd_price'>
                                    {prd.price?.toLocaleString()}원
                                </strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default ProductBest;