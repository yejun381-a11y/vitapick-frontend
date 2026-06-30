import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    getFaqList,
    checkCscenterAdmin
} from '../../../service/cscenter/csCenterApi';

import Pagination from '../../../components/layout/Pagination';

import './FaqList.css';

function FaqList() {

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* FAQ 목록 */
    const [faqList, setFaqList] = useState([]);

    /* 현재 페이지 */
    const [currentPage, setCurrentPage] = useState(1);

    /* 페이지당 개수 */
    const itemPerPage = 10;

    /* 로그인 정보 */
    const userNum = sessionStorage.getItem('userNum');

    /* 로그인 여부 */
    const isLogin = !!userNum;

    /* 관리자 여부 */
    const [isAdmin, setIsAdmin] = useState(false);

    /* 전체 페이지 */
    const totalPage = Math.ceil(faqList.length / itemPerPage);

    /* 시작 인덱스 */
    const startIndex = (currentPage - 1) * itemPerPage;

    /* 현재 페이지 FAQ 목록 */
    const currentFaqList = faqList.slice(
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

    /* FAQ 목록 조회 */
    useEffect(() => {

        getFaqList()
            .then((data) => {

                console.log('FAQ 목록 데이터:', data);

                setFaqList(
                    Array.isArray(data)
                        ? data
                        : []
                );

                setCurrentPage(1);

            })
            .catch((err) => {

                console.log(err);

                alert('FAQ 목록 조회에 실패했습니다.');

            });

    }, []);

    return (

        <div className="cs-faq-wrap">

            {/* 상단 영역 */}
            <div className="cs-faq-header">

                <h2 className="cs-faq-title">
                    FAQ
                </h2>

                {/* 관리자 등록 버튼 */}
                {isLogin && isAdmin && (

                    <button
                        type="button"
                        className="cs-faq-write-btn"
                        onClick={() => navigate('/cscenter/faqs/new')}
                    >
                        등록하기
                    </button>

                )}

            </div>

            {/* FAQ 테이블 */}
            <table className="cs-faq-table">

                <thead>

                    <tr>

                        <th width="10%">
                            번호
                        </th>

                        <th width="15%">
                            카테고리
                        </th>

                        <th width="45%">
                            제목
                        </th>

                        {/* 관리자 전용 */}
                        {isAdmin && (

                            <th width="10%">
                                사용여부
                            </th>

                        )}

                        <th width="10%">
                            조회수
                        </th>

                        <th width="10%">
                            작성일
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {faqList.length > 0 ? (

                        currentFaqList.map((faq) => (

                            <tr key={faq.faqId}>

                                <td>
                                    {faq.faqId}
                                </td>

                                <td>
                                    {faq.faqCtgCd}
                                </td>

                                <td className="cs-faq-title-cell">

                                    <Link to={`/cscenter/faqs/${faq.faqId}`}>
                                        {faq.ttl}
                                    </Link>

                                </td>

                                {/* 관리자 전용 */}
                                {isAdmin && (

                                    <td>
                                        {faq.useYn}
                                    </td>

                                )}

                                <td>
                                    {faq.viewCnt}
                                </td>

                                <td>
                                    {faq.crtAt?.substring(0, 10)}
                                </td>

                            </tr>

                        ))

                    ) : (

                        <tr>

                            <td
                                colSpan={isAdmin ? 6 : 5}
                                className="cs-faq-empty"
                            >
                                등록된 FAQ가 없습니다.
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

export default FaqList;