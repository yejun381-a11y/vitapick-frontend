import './Pagination.css';

function Pagination({
    currentPage,
    totalPage,
    onPageChange
}) {

    /* 페이지 개수 */
    const pageGroupSize = 5;

    /* 현재 페이지 그룹 */
    const currentGroup = Math.ceil(currentPage / pageGroupSize);

    /* 시작 페이지 */
    const startPage = (currentGroup - 1) * pageGroupSize + 1;

    /* 마지막 페이지 */
    const endPage = Math.min(
        startPage + pageGroupSize - 1,
        totalPage
    );

    /* 페이지 번호 배열 */
    const pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="pagination">

            {/* 이전 버튼 */}
            {currentPage > 1 && (
                <button
                    className="pageBtn"
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    이전
                </button>
            )}

            {/* 페이지 번호 */}
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    className={
                        currentPage === page
                            ? 'pageBtn active'
                            : 'pageBtn'
                    }
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            {/* 다음 버튼 */}
            {currentPage < totalPage && (
                <button
                    className="pageBtn"
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    다음
                </button>
            )}

        </div>
    );
}

export default Pagination;