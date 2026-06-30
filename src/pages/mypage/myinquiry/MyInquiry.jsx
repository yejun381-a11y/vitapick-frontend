import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMyInq } from '../../../service/cscenter/csCenterApi';

import Pagination from '../../../components/layout/Pagination';

import './MyInquiry.css';

function MyInquiry() {

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 문의 목록 */
    const [inqList, setInqList] = useState([]);

    /* 현재 페이지 */
    const [currentPage, setCurrentPage] = useState(1);

    /* 페이지당 개수 */
    const itemPerPage = 10;

    /* 전체 페이지 */
    const totalPage = Math.ceil(inqList.length / itemPerPage);

    /* 시작 인덱스 */
    const startIndex = (currentPage - 1) * itemPerPage;

    /* 현재 페이지 문의 목록 */
    const currentInqList = inqList.slice(
        startIndex,
        startIndex + itemPerPage
    );

    /* 문의 목록 조회 */
    useEffect(() => {

        fetchInqList();

    }, []);

    /* 문의 목록 조회 함수 */
    const fetchInqList = async () => {

        try {

            const result = await getMyInq();

            console.log('내 문의 목록 = ', result);

            setInqList(
                Array.isArray(result)
                    ? result
                    : []
            );

            setCurrentPage(1);

        } catch (err) {

            console.log(err);

            alert('내 1:1 문의 목록 조회에 실패했습니다.');
        }
    };

    /* 상세 이동 */
    const handleMoveDetail = (item) => {
        navigate(`/cscenter/inquiries/${item.inqId}`);
    };

    /* 문의 등록 이동 */
    const handleMoveWrite = () => {
        navigate('/cscenter/inquiries/new');
    };

    return (

        <div className="my-inq-wrap">

            {/* 상단 영역 */}
            <div className="my-inq-top">

                <h2 className="my-inq-title">
                    1:1 문의
                </h2>
                <p className="my-inq-desc">
                    작성한 문의 내역과 답변 상태를 확인할 수 있습니다.
                </p>

                {/* 문의 등록 버튼 */}
                <button
                    className="my-inq-write-btn"
                    onClick={handleMoveWrite}
                >
                    문의 등록
                </button>

            </div>

            {/* 문의 테이블 */}
            <table className="my-inq-table">

                <thead>

                    <tr>
                        <th>번호</th>
                        <th>문의유형</th>
                        <th>제목</th>
                        <th>상태</th>
                        <th>작성일</th>
                    </tr>

                </thead>

                <tbody>

                    {inqList.length > 0 ? (

                        currentInqList.map((item) => (

                            <tr
                                key={item.inqId}
                                onClick={() => handleMoveDetail(item)}
                            >

                                <td>
                                    {item.inqId}
                                </td>

                                <td>
                                    {item.inqTpCd}
                                </td>

                                <td className="my-inq-ttl">
                                    {item.ttl}
                                </td>

                                <td>
                                    {item.inqStCd === 'WAITING'
                                        ? '답변대기'
                                        : '답변완료'}
                                </td>

                                <td>
                                    {item.crtAt?.substring(0, 10)}
                                </td>

                            </tr>

                        ))

                    ) : (

                        <tr>
                            <td colSpan="5" className="my-inq-empty">
                                등록된 문의가 없습니다.
                            </td>
                        </tr>

                    )}

                </tbody>

            </table>

            {/* 페이지네이션 */}
            {totalPage > 1 && (

                <Pagination
                    currentPage={currentPage}
                    totalPage={totalPage}
                    onPageChange={setCurrentPage}
                />

            )}

        </div>

    );
}

export default MyInquiry;