import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getAddrList,
    deleteAddr,
    updateBaseAddr
} from '../../../service/useraddr/userAddrApi';

import {
    getToken
} from '../../../service/apiService';

import UserAddrForm from './UserAddrForm';

import './UserAddrList.css';

function UserAddrList() {

    /* 페이지 이동 */
    const navigate = useNavigate();

    /* 배송지 목록 */
    const [addrList, setAddrList] = useState([]);

    /* 폼 열림 여부 */
    const [isFormOpen, setIsFormOpen] = useState(false);

    /* 폼 모드 */
    const [formMode, setFormMode] = useState('create');

    /* 선택된 배송지 */
    const [selectedAddr, setSelectedAddr] = useState(null);

    /* 스크롤 최상단 이동 */
    const moveScrollTop = () => {

        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });

    };

    /* 로그인 확인 */
    const checkLogin = () => {

        const accessToken = getToken();

        if (!accessToken) {
            alert('로그인 후 이용해주세요.');
            navigate('/v1/auth/login');
            return false;
        }

        return true;
    };

    /* 로그인 페이지 이동 */
    const moveLogin = () => {
        alert('로그인 후 이용해주세요.');
        navigate('/v1/auth/login');
    };

    /* 배송지 목록 조회 */
    const fetchAddrList = () => {

        if (!checkLogin()) {
            return;
        }

        getAddrList()
            .then(res => {
                console.log('배송지 목록 응답 => ', res);
                setAddrList(res || []);
            })
            .catch(err => {
                console.log(err);

                if (err.response?.status === 401) {
                    moveLogin();
                    return;
                }

                alert('배송지 목록 조회에 실패했습니다.');
            });
    };

    /* 배송지 추가 폼 열기 */
    const handleCreateOpen = () => {

        if (!checkLogin()) {
            return;
        }

        if (addrList.length >= 10) {
            alert('배송지는 최대 10개까지 등록 가능합니다.');
            return;
        }

        setFormMode('create');
        setSelectedAddr(null);
        setIsFormOpen(true);
        moveScrollTop();
    };

    /* 배송지 수정 폼 열기 */
    const handleEditOpen = (addr) => {

        if (!checkLogin()) {
            return;
        }

        setFormMode('edit');
        setSelectedAddr(addr);
        setIsFormOpen(true);
        moveScrollTop();
    };

    /* 배송지 폼 닫기 */
    const handleFormClose = () => {

        setIsFormOpen(false);
        setSelectedAddr(null);
        moveScrollTop();
    };

    /* 배송지 저장 성공 */
    const handleFormSuccess = () => {

        setIsFormOpen(false);
        setSelectedAddr(null);
        fetchAddrList();
        moveScrollTop();
    };

    /* 배송지 삭제 */
    const handleDelete = (addrId) => {

        if (!checkLogin()) {
            return;
        }

        if (!window.confirm('배송지를 삭제하시겠습니까?')) {
            return;
        }

        deleteAddr(addrId)
            .then(() => {
                alert('배송지가 삭제되었습니다.');
                fetchAddrList();
                moveScrollTop();
            })
            .catch(err => {
                console.log(err);

                if (err.response?.status === 401) {
                    moveLogin();
                    return;
                }

                alert('배송지 삭제에 실패했습니다.');
            });
    };

    /* 기본 배송지 설정 */
    const handleBaseAddr = (addrId) => {

        if (!checkLogin()) {
            return;
        }

        updateBaseAddr(addrId)
            .then(() => {
                alert('기본 배송지로 설정되었습니다.');
                fetchAddrList();
                moveScrollTop();
            })
            .catch(err => {
                console.log(err);

                if (err.response?.status === 401) {
                    moveLogin();
                    return;
                }

                alert('기본 배송지 설정에 실패했습니다.');
            });
    };

    /* 최초 배송지 목록 조회 */
    useEffect(() => {
        fetchAddrList();
    }, []);

    return (
        <div className="addrPage">

            {/* 상단 영역 */}
            <div className="addrHeader">

                {/* 제목 영역 */}
                <div>
                    <h2 className="addrTitle">
                        배송지 관리
                    </h2>

                    <p className="addrDesc">
                        배송지 정보를 등록하고 관리할 수 있습니다.
                    </p>
                </div>

                {/* 배송지 추가 버튼 */}
                <button
                    type="button"
                    className="addrAddBtn"
                    onClick={handleCreateOpen}
                >
                    배송지 추가
                </button>

            </div>

            {/* 등록/수정 폼 */}
            {
                isFormOpen && (
                    <UserAddrForm
                        mode={formMode}
                        addrData={selectedAddr}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormClose}
                    />
                )
            }

            {/* 배송지 목록 영역 */}
            {
                !isFormOpen && (
                    <div className="addrList">

                        {
                            !addrList || addrList.length === 0 ? (

                                /* 빈 배송지 안내 */
                                <div className="addrEmpty">
                                    등록된 배송지가 없습니다.
                                </div>

                            ) : (

                                /* 배송지 카드 목록 */
                                addrList.map(addr => (

                                    <div
                                        className="addrCard"
                                        key={addr.addrId}
                                    >

                                        {/* 카드 상단 */}
                                        <div className="addrCardTop">

                                            {/* 배송지명/기본배송지 */}
                                            <div>
                                                <span className="addrName">
                                                    {addr.addrNm}
                                                </span>

                                                {
                                                    addr.baseYn === 'Y' && (
                                                        <span className="baseBadge">
                                                            기본 배송지
                                                        </span>
                                                    )
                                                }
                                            </div>

                                        </div>

                                        {/* 배송지 정보 */}
                                        <div className="addrInfo">

                                            {/* 받는 사람 */}
                                            <p>
                                                {addr.rcvNm}
                                            </p>

                                            {/* 연락처 */}
                                            <p>
                                                {addr.rcvTel}
                                            </p>

                                            {/* 주소 */}
                                            <p>
                                                ({addr.zipCd})
                                                {' '}
                                                {addr.addr1}
                                                {' '}
                                                {addr.addr2}
                                            </p>

                                        </div>

                                        {/* 버튼 영역 */}
                                        <div className="addrBtnBox">

                                            {/* 기본 배송지 설정 버튼 */}
                                            {
                                                addr.baseYn !== 'Y' && (
                                                    <button
                                                        type="button"
                                                        className="addrSubBtn"
                                                        onClick={() =>
                                                            handleBaseAddr(addr.addrId)
                                                        }
                                                    >
                                                        기본 배송지 설정
                                                    </button>
                                                )
                                            }

                                            {/* 수정 버튼 */}
                                            <button
                                                type="button"
                                                className="addrSubBtn"
                                                onClick={() =>
                                                    handleEditOpen(addr)
                                                }
                                            >
                                                수정
                                            </button>

                                            {/* 삭제 버튼 */}
                                            <button
                                                type="button"
                                                className="addrDeleteBtn"
                                                onClick={() =>
                                                    handleDelete(addr.addrId)
                                                }
                                            >
                                                삭제
                                            </button>

                                        </div>

                                    </div>

                                ))

                            )
                        }

                    </div>
                )
            }

        </div>
    );
}

export default UserAddrList;