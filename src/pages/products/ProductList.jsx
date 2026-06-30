import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiCall } from '../../service/apiService';
import './ProductList.css';

const ProductList = () => {

    // URL에서 카테고리 코드 또는 검색어 가져오기
    const { catCd, keyword } = useParams();

    // 상품 목록
    const [prdList, setPrdList] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);

    // 페이지당 상품 수
    const pageSize = 10;

    // 현재 페이지에 보여줄 상품 계산
    const totalPage = Math.ceil(prdList.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentList = prdList.slice(startIndex, startIndex + pageSize);

    // 카테고리 또는 검색어 바뀔 때마다 상품 목록 가져오기
    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);

            try {
                let url = '';

                // 검색어 있으면 검색 API
                if (keyword) {
                    url = `/api/v1/product/search?keyword=${keyword}`;
                }
                // 카테고리 코드 있으면 카테고리 API
                else if (catCd) {
                    url = `/api/v1/product/list/category/${catCd}`;
                }
                // 둘 다 없으면 전체 상품 API
                else {
                    url = `/api/v1/product/list`;
                }

                const data = await apiCall.get(url);
                setPrdList(data);
                setCurrentPage(1);

            } catch (err) {
                console.error('상품 목록 오류:', err);
                setPrdList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [catCd, keyword]);

    if (loading) return <div className='prd_loading'>로딩 중...</div>;

    return (
        <div className='prd_container'>

            {prdList.length === 0 ? (
                <div className='prd_empty'>
                    <h3>
                        {keyword
                            ? `"${keyword}" 검색 결과가 없습니다.`
                            : '상품이 없습니다.'}
                    </h3>
                    <p>다른 검색어로 다시 검색해 주세요.</p>
                </div>
            ) : (
                <>
                    <div className='prd_list'>
                        {currentList.map((prd) => (
                            <div
                                key={prd.prdId}
                                className='prd_card'
                                onClick={() => window.location.href = `/products/detail/${prd.prdId}`}
                            >
                                <img src={prd.thumbImgUrl || '/images/no-image.png'} alt={prd.prdNm} />
                                <div className='prd_info'>
                                    <p className='prd_brand'>{prd.brand}</p>
                                    <h3 className='prd_nm'>{prd.prdNm}</h3>
                                    <strong className='prd_price'>
                                        {prd.price.toLocaleString()}원
                                    </strong>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPage > 1 && (
                        <div className='product-pagination'>
                            <button
                                type='button'
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                이전
                            </button>

                            <span>
                                {currentPage} / {totalPage}
                            </span>

                            <button
                                type='button'
                                disabled={currentPage === totalPage}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                다음
                            </button>
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default ProductList;