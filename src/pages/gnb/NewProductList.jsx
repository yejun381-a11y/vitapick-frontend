import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../service/apiService';
import '../products/ProductList.css';

const ProductLatest = () => {

    const navigate = useNavigate();

    // 신상품 목록
    const [prdList, setPrdList] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 신상품 목록 가져오기
    useEffect(() => {
        const fetchLatestList = async () => {
            setLoading(true);

            try {
                const data = await apiCall.get('/api/v1/product/latest');
                setPrdList(data);
            } catch (err) {
                console.error('신상품 목록 오류:', err);
                setPrdList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestList();
    }, []);

    if (loading) return <div className='prd_loading'>로딩 중...</div>;

    return (
        <div className='prd_container'>

            <h2 className='prd_page_title'>이번 주 신상</h2>

            {prdList.length === 0 ? (
                <div className='prd_empty'>
                    <h3>신상품이 없습니다.</h3>
                    <p>상품이 등록되면 이곳에 표시됩니다.</p>
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

export default ProductLatest;