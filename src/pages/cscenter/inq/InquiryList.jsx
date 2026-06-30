import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getAllInq,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';

import Pagination from '../../../components/layout/Pagination';

import './InquiryList.css';

function InquiryList() {

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 문의 목록 */
    const [inqList, setInqList] = useState([]);

    /* 현재 페이지 */
    const [currentPage, setCurrentPage] = useState(1);

    /* 관리자 여부 */
    const [isAdmin, setIsAdmin] = useState(false);

    /* 페이지당 개수 */
    const itemPerPage = 10;

    /* 로그인 사용자 */
    const loginUser = {
        userNum: sessionStorage.getItem('userNum')
    };

    /* 전체 페이지 */
    const totalPage = Math.ceil(inqList.length / itemPerPage);

    /* 시작 인덱스 */
    const startIndex = (currentPage - 1) * itemPerPage;

    /* 현재 페이지 문의 목록 */
    const currentInqList = inqList.slice(
        startIndex,
        startIndex + itemPerPage
    );

    /* 관리자 여부 확인 */
    useEffect(() => {

        checkCscenterAdmin()
            .then((data) => {

                setIsAdmin(data === true);

            })
            .catch((err) => {

                console.log(err);

                setIsAdmin(false);

            });

    }, []);

    /* 문의 목록 조회 */
    useEffect(() => {

        fetchInqList();

    }, []);

    /* 문의 목록 조회 함수 */
    const fetchInqList = async () => {

        try {

            const result = await getAllInq();

            console.log('문의 목록 = ', result);

            setInqList(
                Array.isArray(result)
                    ? result
                    : []
            );

            setCurrentPage(1);

        } catch (err) {

            console.log(err);

            alert('1:1 문의 목록 조회에 실패했습니다.');
        }
    };

    /* 상세 이동 */
    const handleMoveDetail = (item) => {

        if (!loginUser.userNum) {

            alert('로그인 후 이용 가능합니다.');

            navigate('/v1/auth/login');

            return;
        }

        if (isAdmin) {

            navigate(`/cscenter/inquiries/${item.inqId}`);

            return;
        }

        if (Number(loginUser.userNum) === Number(item.userNum)) {

            navigate(`/cscenter/inquiries/${item.inqId}`);

            return;
        }

        alert('본인이 작성한 문의글만 확인할 수 있습니다.');
    };

    /* 문의 등록 이동 */
    const handleMoveWrite = () => {

        if (!loginUser.userNum) {

            alert('로그인 후 이용 가능합니다.');

            navigate('/v1/auth/login');

            return;
        }

        if (isAdmin) {

            alert('관리자는 1:1 문의를 등록할 수 없습니다.');

            return;
        }

        navigate('/cscenter/inquiries/new');
    };

    return (

        <div className="inq-wrap">

            {/* 상단 영역 */}
            <div className="inq-top">

                <h2 className="inq-title">
                    1:1 문의
                </h2>

                {/* 문의 등록 버튼 */}
                <button
                    className="inq-write-btn"
                    onClick={handleMoveWrite}
                >
                    문의 등록
                </button>

            </div>

            {/* 문의 테이블 */}
            <table className="inq-table">

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

                                <td className="inq-ttl">
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

                            <td colSpan="5" className="inq-empty">
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

export default InquiryList;