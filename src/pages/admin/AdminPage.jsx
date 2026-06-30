import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Pagination from '../../components/layout/Pagination';
import { createAdminCsFaq, createAdminCsNotice, deleteAdminCsFaq, deleteAdminCsNotice, getAdminCsFaqDetail, getAdminCsFaqs, getAdminCsInquiries, getAdminCsInquiryDetail, getAdminCsNoticeDetail, getAdminCsNotices, saveAdminCsInquiryAnswer, updateAdminCsFaq, updateAdminCsNotice } from '../../service/admin/adminCsCenterApi';
import { checkAdminAuth, downloadAdminDashboardExcel, getAdminDashboardSummary } from '../../service/admin/adminDashboardApi';
import { getAdminOrders } from '../../service/admin/adminOrdersApi';
import { getAdminProductDetail, getAdminProducts, updateAdminProduct } from '../../service/admin/adminProductsApi';
import { deleteAdminReviewReply, getAdminReviewDetail, getAdminReviews, saveAdminReviewReply } from '../../service/admin/adminReviewsApi';
import {
    getAdminUsers,
    getAdminUserDetail
} from '../../service/admin/adminUsersApi';
import './Admin.css';

const today = new Date();
const todayText = formatDate(today);
const monthText = formatMonth(today);
const adminUsersPageSize = 10;
const adminProductsPageSize = 10;
const adminOrdersPageSize = 10;
const adminReviewsPageSize = 10;
const adminCsNoticesPageSize = 10;
const adminCsFaqsPageSize = 10;
const adminCsInquiriesPageSize = 10;
const statusCdOptions = [
    { value: '', label: '전체' },
    { value: 'ACTIVE', label: '활성' },
    { value: 'WITHDRAWN', label: '탈퇴' }
];
const productStatusOptions = [
    { value: '', label: '전체' },
    { value: 'Y', label: 'Y' },
    { value: 'N', label: 'N' }
];
const productCategoryOptions = [
    { value: '', label: '전체' },
    { value: '1', label: '유산균' },
    { value: '2', label: '비타민' },
    { value: '3', label: '오메가3' },
    { value: '4', label: '미네랄' },
    { value: '5', label: '뷰티/다이어트' },
    { value: '6', label: '종합영양' }
];
const orderStatusOptions = [
    { value: 'PAID', label: '결제완료' }
];
const orderPaymentMethodOptions = [
    { value: '', label: '전체' },
    { value: 'CARD', label: '카드결제' },
    { value: 'BANK', label: '무통장 입금' }
];
const reviewRatingOptions = [
    { value: '', label: '전체' },
    { value: '1', label: '1점' },
    { value: '2', label: '2점' },
    { value: '3', label: '3점' },
    { value: '4', label: '4점' },
    { value: '5', label: '5점' }
];
const reviewUseYnOptions = [
    { value: 'Y', label: 'Y' },
    { value: 'N', label: 'N' }
];
const inquiryStatusOptions = [
    { value: '', label: '전체' },
    { value: 'WAITING', label: '답변대기' },
    { value: 'ANSWERED', label: '답변완료' }
];
const adminCsUseYnOptions = [
    { value: '', label: '전체' },
    { value: 'Y', label: 'Y' },
    { value: 'N', label: 'N' }
];
const adminCsSortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된 순' }
];
const adminCsFaqCategoryOptions = [
    { value: 'ORDER', label: '주문' },
    { value: 'DELIVERY', label: '배송' },
    { value: 'PRODUCT', label: '상품' },
    { value: 'MEMBER', label: '회원' },
    { value: 'ETC', label: '기타' }
];
const adminCsFaqCategoryFilterOptions = [
    { value: '', label: '전체' },
    ...adminCsFaqCategoryOptions
];
const inquiryTypeOptions = [
    { value: '', label: '전체' },
    { value: 'MEMBER', label: '회원' },
    { value: 'PRODUCT', label: '상품' },
    { value: 'ORDER', label: '주문' },
    { value: 'DELIVERY', label: '배송' },
    { value: 'ETC', label: '기타' }
];
const roleCdOptions = [
    { value: '', label: '전체' },
    { value: 'ADMIN', label: '관리자' },
    { value: 'USER', label: '회원' }
];

const adminTabPaths = {
    dashboard: '/admin',
    users: '/admin/users',
    prd: '/admin/products',
    ord: '/admin/orders',
    rvw: '/admin/reviews',
    cscenter: '/admin/cscenter'
};

function getAdminTabFromPath(pathname) {
    const matchedTab = Object.entries(adminTabPaths)
        .find(([, path]) => pathname === path)?.[0];

    return matchedTab || 'dashboard';
}

const pageInfo = {
    users: {
        title: '회원 관리',
        description: '가입 회원 정보를 조회하고 관리할 수 있습니다.',
        emptyText: '회원 데이터 연동 예정입니다.'
    },
    prd: {
        title: '상품 관리',
        description: '등록된 상품을 조회하고 관리할 수 있습니다.',
        emptyText: '상품 데이터 연동 예정입니다.'
    },
    ord: {
        title: '주문 관리',
        description: '주문 현황을 확인하고 관리할 수 있습니다.',
        emptyText: '주문 데이터 연동 예정입니다.'
    },
    rvw: {
        title: '리뷰 관리',
        description: '상품 리뷰를 조회하고 답변 상태를 관리할 수 있습니다.',
        emptyText: '리뷰 데이터 연동 예정입니다.'
    },
    cscenter: {
        title: '고객센터 관리',
        description: '공지사항, FAQ, 1:1 문의, 고객 지원 콘텐츠를 관리할 수 있습니다.',
        emptyText: '고객센터 관리 기능은 추후 연결 예정입니다.'
    }
};

const dashboardPlaceholderData = {
    sales: {
        title: '매출 현황',
        description: '결제 완료 주문 기준 매출 통계가 표시될 예정입니다.',
        status: 'API 연결 후 표시',
        metrics: [
            { label: '오늘 매출', value: '연동 예정', basis: `기준: ${todayText}` },
            { label: '이번 달 매출', value: '연동 예정', basis: `기준: ${monthText}` },
            { label: '오늘 결제완료 주문 수', value: 'API 연결 후 표시', basis: `기준: ${todayText}` },
            {
                label: '인기 영양제 카테고리',
                value: 'API 연결 후 표시',
                basis: '기준: 이번 달 결제완료 주문 / 카테고리별 매출 합계'
            }
        ]
    },
    members: {
        title: '회원 현황',
        description: '회원 가입 통계 연동 예정',
        metrics: [
            { label: '전체 회원', value: '-' },
            { label: '활성 회원', value: '-' },
            { label: '탈퇴 회원', value: '-' }
        ]
    },
    orders: {
        title: '주문 현황',
        description: '주문 통계 연동 예정',
        statusLabels: ['결제완료', '배송준비', '배송중', '배송완료', '취소/환불']
    },
    inquiries: {
        title: '문의 처리 현황',
        description: '고객센터 문의 데이터 연동 예정',
        metrics: [
            { label: '미답변 문의', value: '-' },
            { label: '답변 완료 문의', value: '-' },
            { label: '오늘 신규 문의', value: '-', basis: `기준일: ${new Date().toLocaleDateString('sv-SE')}` },
            { label: '문의 처리율', value: '-' }
        ]
    },
    productSalesTop5: {
        title: '상품별 매출 TOP 5',
        description: '결제 완료 주문 기준으로 매출 상위 상품이 표시될 예정입니다.',
        columns: ['순위', '상품명', '카테고리', '결제완료 수량', '매출액'],
        rows: Array.from({ length: 5 }, (_, index) => ({
            rank: `${index + 1}`,
            productName: 'API 연결 후 표시',
            category: '연동 예정',
            paidQuantity: '-',
            salesAmount: '-'
        }))
    }
};

function AdminPage() {
    const location = useLocation();
    // 관리자 현재 탭과 대시보드 상태를 관리한다.
    const [activeTab, setActiveTab] = useState(() => getAdminTabFromPath(location.pathname));
    const [dashboardData, setDashboardData] = useState(dashboardPlaceholderData);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState('');
    // 관리자 회원 목록과 검색 조건 상태를 관리한다.
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminUsersLoading, setAdminUsersLoading] = useState(false);
    const [adminUsersError, setAdminUsersError] = useState('');
    const [adminUsersKeyword, setAdminUsersKeyword] = useState('');
    const [adminUsersStatusCd, setAdminUsersStatusCd] = useState('');
    const [adminUsersStartDate, setAdminUsersStartDate] = useState('');
    const [adminUsersEndDate, setAdminUsersEndDate] = useState('');
    const [adminUsersQueryKeyword, setAdminUsersQueryKeyword] = useState('');
    const [adminUsersQueryStatusCd, setAdminUsersQueryStatusCd] = useState('');
    const [adminUsersQueryStartDate, setAdminUsersQueryStartDate] = useState('');
    const [adminUsersQueryEndDate, setAdminUsersQueryEndDate] = useState('');
    const [adminUsersPage, setAdminUsersPage] = useState(0);
    const [adminUsersTotalPages, setAdminUsersTotalPages] = useState(0);
    const [adminUsersTotalElements, setAdminUsersTotalElements] = useState(0);
    const [adminUserDetailModal, setAdminUserDetailModal] = useState(null);
    const [adminUserDetailLoading, setAdminUserDetailLoading] = useState(false);
    const [adminUserDetailError, setAdminUserDetailError] = useState('');
    // 관리자 상품 목록과 검색 조건 상태를 관리한다.
    const [adminProducts, setAdminProducts] = useState([]);
    const [adminProductsLoading, setAdminProductsLoading] = useState(false);
    const [adminProductsError, setAdminProductsError] = useState('');
    const [adminProductsKeyword, setAdminProductsKeyword] = useState('');
    const [adminProductsStatus, setAdminProductsStatus] = useState('');
    const [adminProductsCategoryId, setAdminProductsCategoryId] = useState('');
    const [adminProductsQueryKeyword, setAdminProductsQueryKeyword] = useState('');
    const [adminProductsQueryStatus, setAdminProductsQueryStatus] = useState('');
    const [adminProductsQueryCategoryId, setAdminProductsQueryCategoryId] = useState('');
    const [adminProductsPage, setAdminProductsPage] = useState(0);
    const [adminProductsTotalPages, setAdminProductsTotalPages] = useState(0);
    const [adminProductsTotalElements, setAdminProductsTotalElements] = useState(0);
    const [adminProductDetailModal, setAdminProductDetailModal] = useState(null);
    const [adminProductDetailForm, setAdminProductDetailForm] = useState(null);
    const [adminProductDetailLoading, setAdminProductDetailLoading] = useState(false);
    const [adminProductDetailSaving, setAdminProductDetailSaving] = useState(false);
    const [adminProductDetailError, setAdminProductDetailError] = useState('');
    // 관리자 주문 목록과 검색 조건 상태를 관리한다.
    const [adminOrders, setAdminOrders] = useState([]);
    const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
    const [adminOrdersError, setAdminOrdersError] = useState('');
    const [adminOrdersKeyword, setAdminOrdersKeyword] = useState('');
    const [adminOrdersPayMthdCd, setAdminOrdersPayMthdCd] = useState('');
    const [adminOrdersStartDate, setAdminOrdersStartDate] = useState('');
    const [adminOrdersEndDate, setAdminOrdersEndDate] = useState('');
    const [adminOrdersQueryKeyword, setAdminOrdersQueryKeyword] = useState('');
    const [adminOrdersQueryPayMthdCd, setAdminOrdersQueryPayMthdCd] = useState('');
    const [adminOrdersQueryStartDate, setAdminOrdersQueryStartDate] = useState('');
    const [adminOrdersQueryEndDate, setAdminOrdersQueryEndDate] = useState('');
    const [adminOrdersPage, setAdminOrdersPage] = useState(0);
    const [adminOrdersTotalPages, setAdminOrdersTotalPages] = useState(0);
    const [adminOrdersTotalElements, setAdminOrdersTotalElements] = useState(0);
    // 관리자 리뷰 목록과 답글 모달 상태를 관리한다.
    const [adminReviews, setAdminReviews] = useState([]);
    const [adminReviewsLoading, setAdminReviewsLoading] = useState(false);
    const [adminReviewsError, setAdminReviewsError] = useState('');
    const [adminReviewsKeyword, setAdminReviewsKeyword] = useState('');
    const [adminReviewsRating, setAdminReviewsRating] = useState('');
    const [adminReviewsStartDate, setAdminReviewsStartDate] = useState('');
    const [adminReviewsEndDate, setAdminReviewsEndDate] = useState('');
    const [adminReviewsQueryKeyword, setAdminReviewsQueryKeyword] = useState('');
    const [adminReviewsQueryRating, setAdminReviewsQueryRating] = useState('');
    const [adminReviewsQueryStartDate, setAdminReviewsQueryStartDate] = useState('');
    const [adminReviewsQueryEndDate, setAdminReviewsQueryEndDate] = useState('');
    const [adminReviewsPage, setAdminReviewsPage] = useState(0);
    const [adminReviewsTotalPages, setAdminReviewsTotalPages] = useState(0);
    const [adminReviewsTotalElements, setAdminReviewsTotalElements] = useState(0);
    const [adminReviewDetailModal, setAdminReviewDetailModal] = useState(null);
    const [adminReviewDetailLoading, setAdminReviewDetailLoading] = useState(false);
    const [adminReviewDetailSaving, setAdminReviewDetailSaving] = useState(false);
    const [adminReviewDetailError, setAdminReviewDetailError] = useState('');
    const [adminReviewDetailMessage, setAdminReviewDetailMessage] = useState('');
    const [adminReviewReplyText, setAdminReviewReplyText] = useState('');
    // 고객센터 공지사항 목록 상태를 관리한다.
    const [adminCsActiveTab, setAdminCsActiveTab] = useState('notices');
    const [adminCsNotices, setAdminCsNotices] = useState([]);
    const [adminCsNoticesLoading, setAdminCsNoticesLoading] = useState(false);
    const [adminCsNoticesError, setAdminCsNoticesError] = useState('');
    const [adminCsNoticesUseYn, setAdminCsNoticesUseYn] = useState('');
    const [adminCsNoticesSort, setAdminCsNoticesSort] = useState('latest');
    const [adminCsNoticesPage, setAdminCsNoticesPage] = useState(0);
    const [adminCsNoticesTotalPages, setAdminCsNoticesTotalPages] = useState(0);
    const [adminCsNoticesTotalElements, setAdminCsNoticesTotalElements] = useState(0);
    const [adminCsNoticesRefreshKey, setAdminCsNoticesRefreshKey] = useState(0);
    // 고객센터 FAQ 목록 상태를 관리한다.
    const [adminCsFaqs, setAdminCsFaqs] = useState([]);
    const [adminCsFaqsLoading, setAdminCsFaqsLoading] = useState(false);
    const [adminCsFaqsError, setAdminCsFaqsError] = useState('');
    const [adminCsFaqsUseYn, setAdminCsFaqsUseYn] = useState('');
    const [adminCsFaqsCategory, setAdminCsFaqsCategory] = useState('');
    const [adminCsFaqsSort, setAdminCsFaqsSort] = useState('latest');
    const [adminCsFaqsPage, setAdminCsFaqsPage] = useState(0);
    const [adminCsFaqsTotalPages, setAdminCsFaqsTotalPages] = useState(0);
    const [adminCsFaqsTotalElements, setAdminCsFaqsTotalElements] = useState(0);
    const [adminCsFaqsRefreshKey, setAdminCsFaqsRefreshKey] = useState(0);
    // 고객센터 1:1 문의 목록과 상세 모달 상태를 관리한다.
    const [adminCsInquiries, setAdminCsInquiries] = useState([]);
    const [adminCsInquiriesLoading, setAdminCsInquiriesLoading] = useState(false);
    const [adminCsInquiriesError, setAdminCsInquiriesError] = useState('');
    const [adminCsInquiriesKeyword, setAdminCsInquiriesKeyword] = useState('');
    const [adminCsInquiriesStatus, setAdminCsInquiriesStatus] = useState('');
    const [adminCsInquiriesType, setAdminCsInquiriesType] = useState('');
    const [adminCsInquiriesStartDate, setAdminCsInquiriesStartDate] = useState('');
    const [adminCsInquiriesEndDate, setAdminCsInquiriesEndDate] = useState('');
    const [adminCsInquiriesQueryKeyword, setAdminCsInquiriesQueryKeyword] = useState('');
    const [adminCsInquiriesQueryStatus, setAdminCsInquiriesQueryStatus] = useState('');
    const [adminCsInquiriesQueryType, setAdminCsInquiriesQueryType] = useState('');
    const [adminCsInquiriesQueryStartDate, setAdminCsInquiriesQueryStartDate] = useState('');
    const [adminCsInquiriesQueryEndDate, setAdminCsInquiriesQueryEndDate] = useState('');
    const [adminCsInquiriesPage, setAdminCsInquiriesPage] = useState(0);
    const [adminCsInquiriesTotalPages, setAdminCsInquiriesTotalPages] = useState(0);
    const [adminCsInquiriesTotalElements, setAdminCsInquiriesTotalElements] = useState(0);
    const [adminCsInquiriesRefreshKey, setAdminCsInquiriesRefreshKey] = useState(0);
    const [adminCsInquiryDetailModal, setAdminCsInquiryDetailModal] = useState(null);
    const [adminCsInquiryDetailLoading, setAdminCsInquiryDetailLoading] = useState(false);
    const [adminCsInquiryDetailSaving, setAdminCsInquiryDetailSaving] = useState(false);
    const [adminCsInquiryDetailError, setAdminCsInquiryDetailError] = useState('');
    const [adminCsInquiryDetailMessage, setAdminCsInquiryDetailMessage] = useState('');
    const [adminCsInquiryAnswerText, setAdminCsInquiryAnswerText] = useState('');
    // 고객센터 공지사항/FAQ 상세 모달 상태를 관리한다.
    const [adminCsDetailModal, setAdminCsDetailModal] = useState(null);
    const [adminCsDetailLoading, setAdminCsDetailLoading] = useState(false);
    const [adminCsDetailError, setAdminCsDetailError] = useState('');
    const [adminCsDetailEditing, setAdminCsDetailEditing] = useState(false);
    const [adminCsEditForm, setAdminCsEditForm] = useState({
        ttl: '',
        ntcTxt: '',
        faqTxt: '',
        faqCtgCd: 'ORDER',
        useYn: 'Y'
    });
    const [adminCsEditSaving, setAdminCsEditSaving] = useState(false);
    const [adminCsCreateModal, setAdminCsCreateModal] = useState(null);
    const [adminCsCreateForm, setAdminCsCreateForm] = useState({
        ttl: '',
        ntcTxt: '',
        faqTxt: '',
        faqCtgCd: 'ORDER',
        useYn: 'Y'
    });
    const [adminCsCreateSaving, setAdminCsCreateSaving] = useState(false);
    const [adminCsCreateError, setAdminCsCreateError] = useState('');
    const [adminAuthChecked, setAdminAuthChecked] = useState(false);
    const [adminAuthAllowed, setAdminAuthAllowed] = useState(false);
    const isAdmin = adminAuthAllowed;

    useEffect(() => {
        let isMounted = true;

        const checkAdmin = async () => {
            setAdminAuthChecked(false);

            try {
                await checkAdminAuth();
                if (!isMounted) return;
                setAdminAuthAllowed(true);
            } catch (error) {
                console.error('관리자 권한 확인 실패:', error);
                if (!isMounted) return;
                setAdminAuthAllowed(false);
                window.location.replace('/');
            } finally {
                if (isMounted) {
                    setAdminAuthChecked(true);
                }
            }
        };

        checkAdmin();

        return () => {
            isMounted = false;
        };
    }, []);

    // 리뷰 모달 성공 메시지를 자동으로 닫는다.
    useEffect(() => {
        if (!adminReviewDetailMessage) return undefined;

        const timerId = window.setTimeout(() => {
            setAdminReviewDetailMessage('');
        }, 1800);

        return () => window.clearTimeout(timerId);
    }, [adminReviewDetailMessage]);

    // 문의 모달 성공 메시지를 자동으로 닫는다.
    useEffect(() => {
        if (!adminCsInquiryDetailMessage) return undefined;

        const timerId = window.setTimeout(() => {
            setAdminCsInquiryDetailMessage('');
        }, 1800);

        return () => window.clearTimeout(timerId);
    }, [adminCsInquiryDetailMessage]);

    // 현재 URL 경로에 맞춰 관리자 탭을 동기화한다.
    useEffect(() => {
        setActiveTab(getAdminTabFromPath(location.pathname));
    }, [location.pathname]);

    // 고객센터 진입 시 기본 탭을 공지사항으로 초기화한다.
    useEffect(() => {
        if (activeTab !== 'cscenter') return;

        setAdminCsActiveTab('notices');
        setAdminCsNoticesPage(0);
    }, [activeTab]);

    // 관리자 대시보드 요약 데이터를 조회한다.
    useEffect(() => {
        if (!isAdmin) return;

        let isMounted = true;

        const fetchDashboardSummary = async () => {
            setDashboardLoading(true);
            setDashboardError('');

            try {
                const summary = await getAdminDashboardSummary();
                if (!isMounted) return;
                setDashboardData(createDashboardData(summary));
            } catch (error) {
                console.error('관리자 대시보드 summary 조회 실패:', error);
                if (!isMounted) return;
                setDashboardData(dashboardPlaceholderData);
                setDashboardError('대시보드 데이터를 불러오지 못해 기본 안내값을 표시합니다.');
            } finally {
                if (isMounted) {
                    setDashboardLoading(false);
                }
            }
        };

        fetchDashboardSummary();

        return () => {
            isMounted = false;
        };
    }, [isAdmin]);

    // 관리자 회원 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'users') return;

        let isMounted = true;

        const fetchAdminUsers = async () => {
            setAdminUsersLoading(true);
            setAdminUsersError('');

            try {
                const response = await getAdminUsers({
                    page: adminUsersPage,
                    size: adminUsersPageSize,
                    keyword: adminUsersQueryKeyword.trim() || undefined,
                    statusCd: adminUsersQueryStatusCd || undefined,
                    startDate: adminUsersQueryStartDate || undefined,
                    endDate: adminUsersQueryEndDate || undefined
                });

                if (!isMounted) return;

                setAdminUsers(Array.isArray(response?.content) ? response.content : []);
                setAdminUsersTotalPages(Number(response?.totalPages) || 0);
                setAdminUsersTotalElements(Number(response?.totalElements) || 0);
            } catch (error) {
                console.error('관리자 회원 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminUsers([]);
                setAdminUsersTotalPages(0);
                setAdminUsersTotalElements(0);
                setAdminUsersError('회원 목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminUsersLoading(false);
                }
            }
        };

        fetchAdminUsers();

        return () => {
            isMounted = false;
        };
    }, [activeTab, adminUsersPage, adminUsersQueryEndDate, adminUsersQueryKeyword, adminUsersQueryStartDate, adminUsersQueryStatusCd, isAdmin]);

    // 관리자 상품 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'prd') return;

        let isMounted = true;

        const fetchAdminProducts = async () => {
            setAdminProductsLoading(true);
            setAdminProductsError('');

            try {
                const response = await getAdminProducts({
                    page: adminProductsPage,
                    size: adminProductsPageSize,
                    keyword: adminProductsQueryKeyword.trim() || undefined,
                    status: adminProductsQueryStatus || undefined,
                    categoryId: adminProductsQueryCategoryId || undefined
                });

                if (!isMounted) return;

                setAdminProducts(Array.isArray(response?.content) ? response.content : []);
                setAdminProductsTotalPages(Number(response?.totalPages) || 0);
                setAdminProductsTotalElements(Number(response?.totalElements) || 0);
            } catch (error) {
                console.error('관리자 상품 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminProducts([]);
                setAdminProductsTotalPages(0);
                setAdminProductsTotalElements(0);
                setAdminProductsError('상품 목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminProductsLoading(false);
                }
            }
        };

        fetchAdminProducts();

        return () => {
            isMounted = false;
        };
    }, [activeTab, adminProductsPage, adminProductsQueryCategoryId, adminProductsQueryKeyword, adminProductsQueryStatus, isAdmin]);

    // 관리자 주문 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'ord') return;

        let isMounted = true;

        const fetchAdminOrders = async () => {
            setAdminOrdersLoading(true);
            setAdminOrdersError('');

            try {
                const response = await getAdminOrders({
                    page: adminOrdersPage,
                    size: adminOrdersPageSize,
                    keyword: adminOrdersQueryKeyword.trim() || undefined,
                    payMthdCd: adminOrdersQueryPayMthdCd || undefined,
                    startDate: adminOrdersQueryStartDate || undefined,
                    endDate: adminOrdersQueryEndDate || undefined
                });

                if (!isMounted) return;

                setAdminOrders(Array.isArray(response?.content) ? response.content : []);
                setAdminOrdersTotalPages(Number(response?.totalPages) || 0);
                setAdminOrdersTotalElements(Number(response?.totalElements) || 0);
            } catch (error) {
                console.error('관리자 주문 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminOrders([]);
                setAdminOrdersTotalPages(0);
                setAdminOrdersTotalElements(0);
                setAdminOrdersError('주문 목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminOrdersLoading(false);
                }
            }
        };

        fetchAdminOrders();

        return () => {
            isMounted = false;
        };
    }, [
        activeTab,
        adminOrdersPage,
        adminOrdersQueryEndDate,
        adminOrdersQueryKeyword,
        adminOrdersQueryPayMthdCd,
        adminOrdersQueryStartDate,
        isAdmin
    ]);

    // 관리자 리뷰 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'rvw') return;

        let isMounted = true;

        const fetchAdminReviews = async () => {
            setAdminReviewsLoading(true);
            setAdminReviewsError('');

            try {
                const response = await getAdminReviews({
                    page: adminReviewsPage,
                    size: adminReviewsPageSize,
                    keyword: adminReviewsQueryKeyword.trim() || undefined,
                    rating: adminReviewsQueryRating || undefined,
                    startDate: adminReviewsQueryStartDate || undefined,
                    endDate: adminReviewsQueryEndDate || undefined
                });

                if (!isMounted) return;

                setAdminReviews(Array.isArray(response?.content) ? response.content : []);
                setAdminReviewsTotalPages(Number(response?.totalPages) || 0);
                setAdminReviewsTotalElements(Number(response?.totalElements) || 0);
            } catch (error) {
                console.error('관리자 리뷰 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminReviews([]);
                setAdminReviewsTotalPages(0);
                setAdminReviewsTotalElements(0);
                setAdminReviewsError('리뷰 목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminReviewsLoading(false);
                }
            }
        };

        fetchAdminReviews();

        return () => {
            isMounted = false;
        };
    }, [
        activeTab,
        adminReviewsPage,
        adminReviewsQueryEndDate,
        adminReviewsQueryKeyword,
        adminReviewsQueryRating,
        adminReviewsQueryStartDate,
        isAdmin
    ]);

    // 고객센터 공지사항 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'cscenter' || adminCsActiveTab !== 'notices') return;

        let isMounted = true;

        const fetchAdminCsNotices = async () => {
            setAdminCsNoticesLoading(true);
            setAdminCsNoticesError('');

            try {
                const response = await getAdminCsNotices({
                    page: adminCsNoticesPage,
                    size: adminCsNoticesPageSize,
                    useYn: adminCsNoticesUseYn || undefined,
                    sort: adminCsNoticesSort
                });
                if (!isMounted) return;

                const notices = Array.isArray(response?.content)
                    ? response.content
                    : Array.isArray(response)
                        ? response.slice(
                            adminCsNoticesPage * adminCsNoticesPageSize,
                            (adminCsNoticesPage + 1) * adminCsNoticesPageSize
                        )
                        : [];
                const totalElements = Number(response?.totalElements) || (Array.isArray(response) ? response.length : notices.length);

                setAdminCsNotices(notices);
                setAdminCsNoticesTotalElements(totalElements);
                setAdminCsNoticesTotalPages(Number(response?.totalPages) || Math.ceil(totalElements / adminCsNoticesPageSize));
            } catch (error) {
                console.error('관리자 고객센터 공지사항 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminCsNotices([]);
                setAdminCsNoticesTotalPages(0);
                setAdminCsNoticesTotalElements(0);
                setAdminCsNoticesError('목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminCsNoticesLoading(false);
                }
            }
        };

        fetchAdminCsNotices();

        return () => {
            isMounted = false;
        };
    }, [activeTab, adminCsActiveTab, adminCsNoticesPage, adminCsNoticesRefreshKey, adminCsNoticesSort, adminCsNoticesUseYn, isAdmin]);

    // 고객센터 FAQ 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'cscenter' || adminCsActiveTab !== 'faqs') return;

        let isMounted = true;

        const fetchAdminCsFaqs = async () => {
            setAdminCsFaqsLoading(true);
            setAdminCsFaqsError('');

            try {
                const response = await getAdminCsFaqs({
                    page: adminCsFaqsPage,
                    size: adminCsFaqsPageSize,
                    useYn: adminCsFaqsUseYn || undefined,
                    faqCtgCd: adminCsFaqsCategory || undefined,
                    sort: adminCsFaqsSort
                });
                if (!isMounted) return;

                const faqs = Array.isArray(response?.content)
                    ? response.content
                    : Array.isArray(response)
                        ? response.slice(
                            adminCsFaqsPage * adminCsFaqsPageSize,
                            (adminCsFaqsPage + 1) * adminCsFaqsPageSize
                        )
                        : [];
                const totalElements = Number(response?.totalElements) || (Array.isArray(response) ? response.length : faqs.length);

                setAdminCsFaqs(faqs);
                setAdminCsFaqsTotalElements(totalElements);
                setAdminCsFaqsTotalPages(Number(response?.totalPages) || Math.ceil(totalElements / adminCsFaqsPageSize));
            } catch (error) {
                console.error('관리자 고객센터 FAQ 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminCsFaqs([]);
                setAdminCsFaqsTotalPages(0);
                setAdminCsFaqsTotalElements(0);
                setAdminCsFaqsError('목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminCsFaqsLoading(false);
                }
            }
        };

        fetchAdminCsFaqs();

        return () => {
            isMounted = false;
        };
    }, [activeTab, adminCsActiveTab, adminCsFaqsCategory, adminCsFaqsPage, adminCsFaqsRefreshKey, adminCsFaqsSort, adminCsFaqsUseYn, isAdmin]);

    // 고객센터 1:1 문의 목록을 조회한다.
    useEffect(() => {
        if (!isAdmin || activeTab !== 'cscenter' || adminCsActiveTab !== 'inquiries') return;

        let isMounted = true;

        const fetchAdminCsInquiries = async () => {
            setAdminCsInquiriesLoading(true);
            setAdminCsInquiriesError('');

            try {
                const response = await getAdminCsInquiries({
                    page: adminCsInquiriesPage,
                    size: adminCsInquiriesPageSize,
                    keyword: adminCsInquiriesQueryKeyword.trim() || undefined,
                    status: adminCsInquiriesQueryStatus || undefined,
                    type: adminCsInquiriesQueryType || undefined,
                    startDate: adminCsInquiriesQueryStartDate || undefined,
                    endDate: adminCsInquiriesQueryEndDate || undefined
                });

                if (!isMounted) return;

                setAdminCsInquiries(Array.isArray(response?.content) ? response.content : []);
                const totalElements = Number(response?.totalElements) || 0;
                setAdminCsInquiriesTotalElements(totalElements);
                setAdminCsInquiriesTotalPages(Number(response?.totalPages) || Math.ceil(totalElements / adminCsInquiriesPageSize));
            } catch (error) {
                console.error('관리자 고객센터 문의 목록 조회 실패:', error);
                if (!isMounted) return;
                setAdminCsInquiries([]);
                setAdminCsInquiriesTotalPages(0);
                setAdminCsInquiriesTotalElements(0);
                setAdminCsInquiriesError('문의 목록을 불러오지 못했습니다.');
            } finally {
                if (isMounted) {
                    setAdminCsInquiriesLoading(false);
                }
            }
        };

        fetchAdminCsInquiries();

        return () => {
            isMounted = false;
        };
    }, [
        activeTab,
        adminCsActiveTab,
        adminCsInquiriesPage,
        adminCsInquiriesQueryEndDate,
        adminCsInquiriesQueryKeyword,
        adminCsInquiriesQueryStartDate,
        adminCsInquiriesQueryStatus,
        adminCsInquiriesQueryType,
        adminCsInquiriesRefreshKey,
        isAdmin
    ]);

    if (!adminAuthChecked) {
        return null;
    }

    if (!isAdmin) {
        return (
            <div className="adminAccessDenied">
                <div className="adminAccessCard">
                    <h1>접근 권한이 없습니다.</h1>
                    <p>관리자 계정으로 로그인한 경우에만 이용할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    // 관리자 대시보드 화면을 렌더링한다.
    const renderDashboard = () => {
        const { sales, members, orders, inquiries, productSalesTop5 } = dashboardData;

        return (
            <div className="adminDashboard">
                {(dashboardLoading || dashboardError) && (
                    <div className="adminDashboardNotice">
                        {dashboardLoading ? '대시보드 데이터를 불러오는 중입니다.' : dashboardError}
                    </div>
                )}
                <section className="adminHeroCard">
                    <div>
                        <span className="adminHeroBadge">VitaPick Admin</span>
                        <h2>운영 현황을 한눈에 확인하는 관리자 대시보드입니다.</h2>
                    </div>
                    <div className="adminHeroBubble">VP</div>
                </section>

                <section className="adminOpsSection">
                    <div className="adminPanelHeader">
                        <div>
                            <h3>{sales.title}</h3>
                            <p>{sales.description}</p>
                        </div>
                        <span>{sales.status}</span>
                    </div>
                    <div className="adminMetricGrid">
                        {sales.metrics.map((item) => (
                            <MetricCard
                                key={item.label}
                                label={item.label}
                                value={item.value}
                                basis={item.basis}
                                note={item.note}
                            />
                        ))}
                    </div>
                </section>

                <div className="adminDashboardGrid">
                    <section className="adminOpsSection">
                        <div className="adminPanelHeader">
                            <div>
                                <h3>{members.title}</h3>
                                <p>{members.description}</p>
                            </div>
                        </div>
                        <MonthlyLineChart data={members.monthlyNewUsers} />
                        <div className="adminMiniMetricList">
                            {members.metrics.map((item) => (
                                <MetricCard key={item.label} label={item.label} value={item.value} note={item.note} />
                            ))}
                        </div>
                    </section>

                    <section className="adminOpsSection">
                        <div className="adminPanelHeader">
                            <div>
                                <h3>{orders.title}</h3>
                                <p>{orders.description}</p>
                            </div>
                        </div>
                        <MonthlyBarChart data={orders.monthlyPaidOrders} />
                    </section>
                </div>

                <div className="adminDashboardGrid">
                    <section className="adminOpsSection">
                        <div className="adminPanelHeader">
                            <div>
                                <h3>{inquiries.title}</h3>
                                <p>{inquiries.description}</p>
                            </div>
                        </div>
                        <div className="adminMetricGrid twoCol">
                            {inquiries.metrics.map((item) => (
                                <MetricCard key={item.label} label={item.label} value={item.value} note={item.note} />
                            ))}
                        </div>
                    </section>

                    <section className="adminOpsSection adminTopProductsSection">
                        <div className="adminPanelHeader">
                            <div>
                                <h3>{productSalesTop5.title}</h3>
                                <p>{productSalesTop5.description}</p>
                            </div>
                        </div>
                        <TopProductsTable data={productSalesTop5} />
                    </section>
                </div>
            </div>
        );
    };

    // 아직 연결되지 않은 필터 안내 화면을 렌더링한다.
    const renderFilterMock = (type) => (
        <section className="adminFilterCard">
            <div className="adminField">
                <label>{type === 'rvw' ? '상품명 검색' : '검색어'}</label>
                <input type="text" placeholder="검색어를 입력하세요" disabled />
            </div>
            <div className="adminField">
                <label>{type === 'rvw' ? '별점' : '상태'}</label>
                <select disabled>
                    <option>전체</option>
                </select>
            </div>
            <div className="adminField">
                <label>{type === 'ord' ? '주문 기간' : '기간 선택'}</label>
                <input type="text" placeholder="연동 예정" disabled />
            </div>
            <button type="button" className="adminPrimaryBtn" disabled>검색</button>
        </section>
    );

    // 고객센터 문의 검색 조건을 적용한다.
    const handleAdminCsInquiriesSearch = (event) => {
        event.preventDefault();
        setAdminCsInquiriesQueryKeyword(adminCsInquiriesKeyword);
        setAdminCsInquiriesQueryStatus(adminCsInquiriesStatus);
        setAdminCsInquiriesQueryType(adminCsInquiriesType);
        setAdminCsInquiriesQueryStartDate(adminCsInquiriesStartDate);
        setAdminCsInquiriesQueryEndDate(adminCsInquiriesEndDate);
        setAdminCsInquiriesPage(0);
    };

    // 고객센터 문의 필터 값을 변경한다.
    const handleAdminCsInquiriesFilterChange = (setter) => (event) => {
        setter(event.target.value);
    };

    // 고객센터 문의 상세 모달을 닫는다.
    const closeAdminCsInquiryDetailModal = () => {
        if (adminCsInquiryDetailSaving) return;
        setAdminCsInquiryDetailModal(null);
        setAdminCsInquiryDetailError('');
        setAdminCsInquiryDetailMessage('');
        setAdminCsInquiryAnswerText('');
    };

    // 고객센터 문의 상세 모달을 연다.
    const handleAdminCsInquiryDetailOpen = async (inquiry) => {
        const inquiryId = inquiry?.inquiryId ?? inquiry?.inqId;

        setAdminCsInquiryDetailModal(inquiry);
        setAdminCsInquiryAnswerText(inquiry.ansTxt || '');
        setAdminCsInquiryDetailError('');
        setAdminCsInquiryDetailMessage('');

        if (!inquiryId) {
            setAdminCsInquiryDetailError('상세 정보를 불러오지 못했습니다.');
            return;
        }

        setAdminCsInquiryDetailLoading(true);

        try {
            const detail = await getAdminCsInquiryDetail(inquiryId);
            const nextDetail = {
                ...inquiry,
                ...(detail || {})
            };
            setAdminCsInquiryDetailModal(nextDetail);
            setAdminCsInquiryAnswerText(nextDetail.ansTxt || '');
            setAdminCsInquiryDetailError('');
        } catch {
            setAdminCsInquiryDetailModal(inquiry);
            setAdminCsInquiryDetailError('상세 정보를 불러오지 못했습니다.');
        } finally {
            setAdminCsInquiryDetailLoading(false);
        }
    };

    // 고객센터 문의 답변 저장을 처리한다.
    const handleAdminCsInquiryAnswerSave = async () => {
        const inquiryId = adminCsInquiryDetailModal?.inquiryId ?? adminCsInquiryDetailModal?.inqId;
        const ansTxt = adminCsInquiryAnswerText.trim();

        if (!inquiryId) return;

        if (!ansTxt) {
            setAdminCsInquiryDetailError('답변 내용을 입력해 주세요.');
            return;
        }

        setAdminCsInquiryDetailSaving(true);
        setAdminCsInquiryDetailError('');
        setAdminCsInquiryDetailMessage('');

        try {
            const detail = await saveAdminCsInquiryAnswer(inquiryId, { ansTxt });
            const nextDetail = {
                ...adminCsInquiryDetailModal,
                ...(detail || {}),
                ansTxt: detail?.ansTxt ?? ansTxt
            };

            setAdminCsInquiryDetailModal(nextDetail);
            setAdminCsInquiryAnswerText(nextDetail.ansTxt || '');
            setAdminCsInquiriesRefreshKey((key) => key + 1);
            setAdminCsInquiryDetailMessage('답변이 저장 되었습니다.');
        } catch {
            setAdminCsInquiryDetailError('답변 저장에 실패했습니다.');
        } finally {
            setAdminCsInquiryDetailSaving(false);
        }
    };

    // 고객센터 목록 필터 변경 시 첫 페이지로 이동한다.
    const handleAdminCsFilterChange = (setter, resetPage) => (event) => {
        setter(event.target.value);
        resetPage(0);
    };

    // 고객센터 등록 모달을 연다.
    const openAdminCsCreateModal = (type) => {
        setAdminCsCreateModal(type);
        setAdminCsCreateError('');
        setAdminCsCreateForm({
            ttl: '',
            ntcTxt: '',
            faqTxt: '',
            faqCtgCd: 'ORDER',
            useYn: 'Y'
        });
    };

    // 고객센터 등록 모달을 닫는다.
    const closeAdminCsCreateModal = () => {
        if (adminCsCreateSaving) return;
        setAdminCsCreateModal(null);
        setAdminCsCreateError('');
    };

    // 고객센터 등록 폼 값을 변경한다.
    const handleAdminCsCreateFormChange = (event) => {
        const { name, value } = event.target;
        setAdminCsCreateForm((form) => ({
            ...form,
            [name]: value
        }));
    };

    // 고객센터 공지사항/FAQ 등록을 처리한다.
    const handleAdminCsCreateSubmit = async (event) => {
        event.preventDefault();

        const title = adminCsCreateForm.ttl.trim();
        const bodyField = adminCsCreateModal === 'notice' ? 'ntcTxt' : 'faqTxt';
        const body = adminCsCreateForm[bodyField].trim();

        if (!title || !body) {
            setAdminCsCreateError('제목과 내용을 입력해 주세요.');
            return;
        }

        setAdminCsCreateSaving(true);
        setAdminCsCreateError('');

        try {
            if (adminCsCreateModal === 'notice') {
                await createAdminCsNotice({
                    ttl: title,
                    ntcTxt: body,
                    useYn: adminCsCreateForm.useYn
                });
                setAdminCsNoticesPage(0);
                setAdminCsNoticesRefreshKey((key) => key + 1);
            } else {
                await createAdminCsFaq({
                    faqCtgCd: adminCsCreateForm.faqCtgCd,
                    ttl: title,
                    faqTxt: body,
                    useYn: adminCsCreateForm.useYn
                });
                setAdminCsFaqsPage(0);
                setAdminCsFaqsRefreshKey((key) => key + 1);
            }

            setAdminCsCreateModal(null);
        } catch {
            setAdminCsCreateError('등록에 실패했습니다. 입력 내용을 확인하고 다시 시도해 주세요.');
        } finally {
            setAdminCsCreateSaving(false);
        }
    };

    // 고객센터 상세 모달을 닫는다.
    const closeAdminCsDetailModal = () => {
        if (adminCsEditSaving) return;
        setAdminCsDetailModal(null);
        setAdminCsDetailError('');
        setAdminCsDetailEditing(false);
    };

    // 고객센터 공지사항/FAQ 상세 모달을 연다.
    const handleAdminCsDetailOpen = async (type, item) => {
        const id = type === 'notice' ? item.ntcId : item.faqId;
        const getDetail = type === 'notice' ? getAdminCsNoticeDetail : getAdminCsFaqDetail;

        setAdminCsDetailModal({ type, item });
        setAdminCsDetailLoading(true);
        setAdminCsDetailError('');
        setAdminCsDetailEditing(false);

        try {
            const detail = await getDetail(id);
            setAdminCsDetailModal({ type, item: detail || item });
        } catch {
            setAdminCsDetailModal({ type, item });
            setAdminCsDetailError('상세 정보를 불러오지 못해 목록 데이터를 표시합니다.');
        } finally {
            setAdminCsDetailLoading(false);
        }
    };

    // 고객센터 상세 모달을 수정 모드로 전환한다.
    const handleAdminCsEdit = (type, item) => {
        if (type === 'notice') {
            setAdminCsEditForm({
                ttl: item?.ttl || '',
                ntcTxt: item?.ntcTxt || '',
                useYn: item?.useYn || 'Y'
            });
            setAdminCsDetailError('');
            setAdminCsDetailEditing(true);
            return;
        }

        setAdminCsEditForm({
            ttl: item?.ttl || '',
            faqTxt: item?.faqTxt || '',
            faqCtgCd: normalizeFaqCategoryCode(item?.faqCtgCd),
            useYn: item?.useYn || 'Y'
        });
        setAdminCsDetailError('');
        setAdminCsDetailEditing(true);
    };

    // 고객센터 수정 폼 값을 변경한다.
    const handleAdminCsEditFormChange = (event) => {
        const { name, value } = event.target;
        setAdminCsEditForm((form) => ({
            ...form,
            [name]: value
        }));
    };

    // 고객센터 수정 모드를 취소한다.
    const handleAdminCsEditCancel = () => {
        setAdminCsDetailEditing(false);
        setAdminCsDetailError('');
    };

    // 고객센터 공지사항/FAQ 수정을 저장한다.
    const handleAdminCsNoticeEditSubmit = async (event) => {
        event.preventDefault();

        const isNotice = adminCsDetailModal?.type === 'notice';
        const id = isNotice ? adminCsDetailModal?.item?.ntcId : adminCsDetailModal?.item?.faqId;
        const title = adminCsEditForm.ttl.trim();
        const body = isNotice ? adminCsEditForm.ntcTxt.trim() : adminCsEditForm.faqTxt.trim();

        if (!id || !title || !body) {
            setAdminCsDetailError('제목과 내용을 입력해 주세요.');
            return;
        }

        setAdminCsEditSaving(true);
        setAdminCsDetailError('');

        try {
            const response = isNotice
                ? await updateAdminCsNotice(id, {
                    ttl: title,
                    ntcTxt: body,
                    useYn: adminCsEditForm.useYn
                })
                : await updateAdminCsFaq(id, {
                    faqCtgCd: normalizeFaqCategoryCode(adminCsEditForm.faqCtgCd),
                    ttl: title,
                    faqTxt: body,
                    useYn: adminCsEditForm.useYn
                });
            const nextItem = {
                ...adminCsDetailModal.item,
                ...(response || {}),
                ttl: response?.ttl || title,
                ...(isNotice ? { ntcTxt: response?.ntcTxt || body } : { faqTxt: response?.faqTxt || body }),
                ...(!isNotice ? { faqCtgCd: response?.faqCtgCd || normalizeFaqCategoryCode(adminCsEditForm.faqCtgCd) } : {}),
                useYn: response?.useYn || adminCsEditForm.useYn
            };

            setAdminCsDetailModal({ type: adminCsDetailModal.type, item: nextItem });
            if (isNotice) {
                setAdminCsNotices((items) => items.map((notice) => (
                    notice.ntcId === id ? { ...notice, ...nextItem } : notice
                )));
                setAdminCsNoticesRefreshKey((key) => key + 1);
            } else {
                setAdminCsFaqs((items) => items.map((faq) => (
                    faq.faqId === id ? { ...faq, ...nextItem } : faq
                )));
                setAdminCsFaqsRefreshKey((key) => key + 1);
            }
            setAdminCsDetailEditing(false);
        } catch {
            setAdminCsDetailError(isNotice ? '등록에 실패했습니다. 입력 내용을 확인하고 다시 시도해 주세요.' : '수정에 실패했습니다. 입력 내용을 확인하고 다시 시도해 주세요.');
        } finally {
            setAdminCsEditSaving(false);
        }
    };

    // 고객센터 공지사항/FAQ 삭제를 처리한다.
    const handleAdminCsDelete = async (type, item) => {
        const id = type === 'notice' ? item.ntcId : item.faqId;
        const deleteItem = type === 'notice' ? deleteAdminCsNotice : deleteAdminCsFaq;
        const resetPage = type === 'notice' ? setAdminCsNoticesPage : setAdminCsFaqsPage;

        if (!window.confirm('선택한 항목을 삭제하시겠습니까?')) return;

        setAdminCsDetailLoading(true);
        setAdminCsDetailError('');

        try {
            await deleteItem(id);
            closeAdminCsDetailModal();
            if (type === 'notice') {
                setAdminCsNotices((items) => items.filter((notice) => notice.ntcId !== id));
                setAdminCsNoticesTotalElements((count) => Math.max(count - 1, 0));
            } else {
                setAdminCsFaqs((items) => items.filter((faq) => faq.faqId !== id));
                setAdminCsFaqsTotalElements((count) => Math.max(count - 1, 0));
            }
            resetPage(0);
        } catch {
            setAdminCsDetailError('삭제 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setAdminCsDetailLoading(false);
        }
    };

    // 고객센터 하위 탭을 변경한다.
    const handleAdminCsTabChange = (tab) => {
        setAdminCsActiveTab(tab);

        if (tab === 'notices') {
            setAdminCsNoticesPage(0);
            return;
        }

        if (tab === 'faqs') {
            setAdminCsFaqsPage(0);
            return;
        }

        setAdminCsInquiriesPage(0);
    };

    // 고객센터 목록 페이지네이션을 렌더링한다.
    const renderCsPagination = (currentPage, totalPages, onPageChange) => {
        if (totalPages <= 0) return null;

        return (
            <Pagination
                currentPage={currentPage + 1}
                totalPage={Math.max(totalPages, 1)}
                onPageChange={(page) => onPageChange(page - 1)}
            />
        );
    };

    // 고객센터 공지사항 목록 화면을 렌더링한다.
    const renderAdminCsNotices = () => (
        <section className="adminOpsSection">
            <div className="adminPanelHeader">
                <div>
                    <h3>공지사항 목록</h3>
                    <p>총 {adminCsNoticesTotalElements.toLocaleString()}건의 공지사항을 조회했습니다.</p>
                </div>
                <div className="adminPanelActions">
                    <span>{adminCsNoticesLoading ? '조회 중' : `${adminCsNoticesPage + 1} / ${Math.max(adminCsNoticesTotalPages, 1)}`}</span>
                    <button type="button" className="adminPrimaryBtn" onClick={() => openAdminCsCreateModal('notice')}>
                        등록
                    </button>
                </div>
            </div>

            <div className="adminFilterCard adminCsListFilterCard">
                <div className="adminField">
                    <label>사용여부</label>
                    <select
                        value={adminCsNoticesUseYn}
                        onChange={handleAdminCsFilterChange(setAdminCsNoticesUseYn, setAdminCsNoticesPage)}
                    >
                        {adminCsUseYnOptions.map((option) => (
                            <option key={`notice-use-${option.value || 'all'}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField">
                    <label>등록일</label>
                    <select
                        value={adminCsNoticesSort}
                        onChange={handleAdminCsFilterChange(setAdminCsNoticesSort, setAdminCsNoticesPage)}
                    >
                        {adminCsSortOptions.map((option) => (
                            <option key={`notice-sort-${option.value}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {adminCsNoticesError && (
                <div className="adminDashboardNotice">{adminCsNoticesError}</div>
            )}

            {!adminCsNoticesError && adminCsNoticesLoading && (
                <div className="adminDashboardNotice">공지사항 목록을 불러오는 중입니다.</div>
            )}

            {!adminCsNoticesError && !adminCsNoticesLoading && adminCsNotices.length === 0 && (
                <div className="adminUsersEmpty">공지사항 데이터가 없습니다.</div>
            )}

            {!adminCsNoticesError && adminCsNotices.length > 0 && (
                <>
                    <AdminCsNoticesTable notices={adminCsNotices} onTitleClick={(notice) => handleAdminCsDetailOpen('notice', notice)} />
                    {renderCsPagination(adminCsNoticesPage, adminCsNoticesTotalPages, setAdminCsNoticesPage)}
                </>
            )}
        </section>
    );

    // 고객센터 FAQ 목록 화면을 렌더링한다.
    const renderAdminCsFaqs = () => (
        <section className="adminOpsSection">
            <div className="adminPanelHeader">
                <div>
                    <h3>FAQ 목록</h3>
                    <p>총 {adminCsFaqsTotalElements.toLocaleString()}건의 FAQ를 조회했습니다.</p>
                </div>
                <div className="adminPanelActions">
                    <span>{adminCsFaqsLoading ? '조회 중' : `${adminCsFaqsPage + 1} / ${Math.max(adminCsFaqsTotalPages, 1)}`}</span>
                    <button type="button" className="adminPrimaryBtn" onClick={() => openAdminCsCreateModal('faq')}>
                        등록
                    </button>
                </div>
            </div>

            <div className="adminFilterCard adminCsListFilterCard adminCsFaqListFilterCard">
                <div className="adminField">
                    <label>사용여부</label>
                    <select
                        value={adminCsFaqsUseYn}
                        onChange={handleAdminCsFilterChange(setAdminCsFaqsUseYn, setAdminCsFaqsPage)}
                    >
                        {adminCsUseYnOptions.map((option) => (
                            <option key={`faq-use-${option.value || 'all'}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField">
                    <label>카테고리</label>
                    <select
                        value={adminCsFaqsCategory}
                        onChange={handleAdminCsFilterChange(setAdminCsFaqsCategory, setAdminCsFaqsPage)}
                    >
                        {adminCsFaqCategoryFilterOptions.map((option) => (
                            <option key={`faq-category-${option.value || 'all'}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField">
                    <label>등록일</label>
                    <select
                        value={adminCsFaqsSort}
                        onChange={handleAdminCsFilterChange(setAdminCsFaqsSort, setAdminCsFaqsPage)}
                    >
                        {adminCsSortOptions.map((option) => (
                            <option key={`faq-sort-${option.value}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {adminCsFaqsError && (
                <div className="adminDashboardNotice">{adminCsFaqsError}</div>
            )}

            {!adminCsFaqsError && adminCsFaqsLoading && (
                <div className="adminDashboardNotice">FAQ 목록을 불러오는 중입니다.</div>
            )}

            {!adminCsFaqsError && !adminCsFaqsLoading && adminCsFaqs.length === 0 && (
                <div className="adminUsersEmpty">FAQ 데이터가 없습니다.</div>
            )}

            {!adminCsFaqsError && adminCsFaqs.length > 0 && (
                <>
                    <AdminCsFaqsTable faqs={adminCsFaqs} onTitleClick={(faq) => handleAdminCsDetailOpen('faq', faq)} />
                    {renderCsPagination(adminCsFaqsPage, adminCsFaqsTotalPages, setAdminCsFaqsPage)}
                </>
            )}
        </section>
    );

    // 고객센터 1:1 문의 목록 화면을 렌더링한다.
    const renderAdminCsInquiries = () => (
        <>
            <form className="adminFilterCard adminCsInquiryFilterCard" onSubmit={handleAdminCsInquiriesSearch}>
                <div className="adminField">
                    <label>검색어</label>
                    <input
                        type="text"
                        value={adminCsInquiriesKeyword}
                        onChange={(event) => setAdminCsInquiriesKeyword(event.target.value)}
                        placeholder="제목, 작성자를 입력하세요"
                    />
                </div>
                <div className="adminField">
                    <label>문의 상태</label>
                    <select
                        value={adminCsInquiriesStatus}
                        onChange={handleAdminCsInquiriesFilterChange(setAdminCsInquiriesStatus)}
                    >
                        {inquiryStatusOptions.map((option) => (
                            <option key={option.value || 'all-inquiry-status'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField">
                    <label>문의 유형</label>
                    <select
                        value={adminCsInquiriesType}
                        onChange={handleAdminCsInquiriesFilterChange(setAdminCsInquiriesType)}
                    >
                        {inquiryTypeOptions.map((option) => (
                            <option key={`inquiry-type-${option.value || 'all'}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField adminDateRangeField">
                    <label>날짜</label>
                    <div className="adminDateRangeInputs">
                        <input
                            type="date"
                            value={adminCsInquiriesStartDate}
                            onChange={handleAdminCsInquiriesFilterChange(setAdminCsInquiriesStartDate)}
                            aria-label="시작일"
                        />
                        <span>~</span>
                        <input
                            type="date"
                            value={adminCsInquiriesEndDate}
                            onChange={handleAdminCsInquiriesFilterChange(setAdminCsInquiriesEndDate)}
                            aria-label="종료일"
                        />
                    </div>
                </div>
                <button type="submit" className="adminPrimaryBtn">검색</button>
            </form>

            <section className="adminOpsSection">
                <div className="adminPanelHeader">
                    <div>
                        <h3>1:1 문의 목록</h3>
                        <p>총 {adminCsInquiriesTotalElements.toLocaleString()}건의 문의를 조회했습니다.</p>
                    </div>
                    <span>{adminCsInquiriesLoading ? '조회 중' : `${adminCsInquiriesPage + 1} / ${Math.max(adminCsInquiriesTotalPages, 1)}`}</span>
                </div>

                {adminCsInquiriesError && (
                    <div className="adminDashboardNotice">{adminCsInquiriesError}</div>
                )}

                {!adminCsInquiriesError && adminCsInquiriesLoading && (
                    <div className="adminDashboardNotice">문의 목록을 불러오는 중입니다.</div>
                )}

                {!adminCsInquiriesError && !adminCsInquiriesLoading && adminCsInquiries.length === 0 && (
                    <div className="adminUsersEmpty">문의 데이터가 없습니다.</div>
                )}

                {!adminCsInquiriesError && adminCsInquiries.length > 0 && (
                    <>
                        <AdminCsInquiriesTable inquiries={adminCsInquiries} onInquiryOpen={handleAdminCsInquiryDetailOpen} />
                        {renderCsPagination(adminCsInquiriesPage, adminCsInquiriesTotalPages, setAdminCsInquiriesPage)}
                    </>
                )}
            </section>
        </>
    );

    // 선택된 고객센터 하위 탭 목록을 렌더링한다.
    const renderActiveAdminCsList = () => {
        if (adminCsActiveTab === 'faqs') return renderAdminCsFaqs();
        if (adminCsActiveTab === 'inquiries') return renderAdminCsInquiries();

        return renderAdminCsNotices();
    };

    // 고객센터 관리 화면을 렌더링한다.
    const renderCsCenter = () => (
        <>
            <div className="adminFeatureGrid adminCsTabGrid">
                <FeatureCard
                    title="공지사항 관리"
                    text="공지사항 목록과 노출 상태를 확인합니다."
                    active={adminCsActiveTab === 'notices'}
                    onClick={() => handleAdminCsTabChange('notices')}
                />
                <FeatureCard
                    title="FAQ 관리"
                    text="자주 묻는 질문과 답변 목록을 확인합니다."
                    active={adminCsActiveTab === 'faqs'}
                    onClick={() => handleAdminCsTabChange('faqs')}
                />
                <FeatureCard
                    title="1:1 문의 관리"
                    text="고객 문의 목록을 조회합니다."
                    active={adminCsActiveTab === 'inquiries'}
                    onClick={() => handleAdminCsTabChange('inquiries')}
                />
            </div>

            {renderActiveAdminCsList()}
            {adminCsInquiryDetailModal && (
                <AdminCsInquiryDetailModal
                    inquiry={adminCsInquiryDetailModal}
                    answerText={adminCsInquiryAnswerText}
                    loading={adminCsInquiryDetailLoading}
                    saving={adminCsInquiryDetailSaving}
                    error={adminCsInquiryDetailError}
                    message={adminCsInquiryDetailMessage}
                    onAnswerChange={(event) => setAdminCsInquiryAnswerText(event.target.value)}
                    onAnswerSave={handleAdminCsInquiryAnswerSave}
                    onClose={closeAdminCsInquiryDetailModal}
                />
            )}
            {adminCsCreateModal && (
                <AdminCsCreateModal
                    type={adminCsCreateModal}
                    form={adminCsCreateForm}
                    saving={adminCsCreateSaving}
                    error={adminCsCreateError}
                    onChange={handleAdminCsCreateFormChange}
                    onClose={closeAdminCsCreateModal}
                    onSubmit={handleAdminCsCreateSubmit}
                />
            )}
            {adminCsDetailModal && (
                <AdminCsDetailModal
                    type={adminCsDetailModal.type}
                    item={adminCsDetailModal.item}
                    loading={adminCsDetailLoading}
                    error={adminCsDetailError}
                    editing={adminCsDetailEditing}
                    editForm={adminCsEditForm}
                    saving={adminCsEditSaving}
                    onEditFormChange={handleAdminCsEditFormChange}
                    onEditCancel={handleAdminCsEditCancel}
                    onEditSubmit={handleAdminCsNoticeEditSubmit}
                    onClose={closeAdminCsDetailModal}
                    onEdit={() => handleAdminCsEdit(adminCsDetailModal.type, adminCsDetailModal.item)}
                    onDelete={() => handleAdminCsDelete(adminCsDetailModal.type, adminCsDetailModal.item)}
                />
            )}
        </>
    );

    // 회원 검색 조건을 적용한다.
    const handleAdminUsersSearch = (event) => {
        event.preventDefault();
        setAdminUsersQueryKeyword(adminUsersKeyword);
        setAdminUsersQueryStatusCd(adminUsersStatusCd);
        setAdminUsersQueryStartDate(adminUsersStartDate);
        setAdminUsersQueryEndDate(adminUsersEndDate);
        setAdminUsersPage(0);
    };

    // 회원 엑셀 다운로드를 처리한다.
    const handleAdminExcelDownload = async () => {

        try {

            const blob = await downloadAdminDashboardExcel();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;
            link.download = 'admin_report.xlsx';

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error('dashboard excel download failed:', error);
        }
    };

    // 회원 검색 시작일을 변경한다.
    const handleAdminUsersStartDateChange = (event) => {
        const nextStartDate = event.target.value;

        setAdminUsersStartDate(nextStartDate);
        setAdminUsersEndDate((currentEndDate) => (
            currentEndDate && nextStartDate && currentEndDate < nextStartDate ? '' : currentEndDate
        ));
        event.currentTarget.parentElement?.querySelector('input[aria-label="가입 종료일"]')?.focus();
    };

    // 회원 검색 종료일을 변경한다.
    const handleAdminUsersEndDateChange = (event) => {
        const nextEndDate = event.target.value;

        setAdminUsersEndDate(
            adminUsersStartDate && nextEndDate && nextEndDate < adminUsersStartDate ? '' : nextEndDate
        );
    };

    const handleAdminUserDetailOpen = async (user) => {
        const userNum = user?.userNum;

        if (!userNum) return;

        setAdminUserDetailModal(user);
        setAdminUserDetailLoading(true);
        setAdminUserDetailError('');

        try {
            const response = await getAdminUserDetail(userNum);
            setAdminUserDetailModal(response);
        } catch (error) {
            console.error('관리자 회원 상세 조회 실패:', error);
            setAdminUserDetailError('회원 상세 정보를 불러오지 못했습니다.');
        } finally {
            setAdminUserDetailLoading(false);
        }
    };

    const closeAdminUserDetailModal = () => {
        setAdminUserDetailModal(null);
        setAdminUserDetailLoading(false);
        setAdminUserDetailError('');
    };

    // 회원 관리 화면을 렌더링한다.
    const renderUsers = () => (
        <>
            <form className="adminFilterCard" onSubmit={handleAdminUsersSearch}>
                <div className="adminField">
                    <label>검색어</label>
                    <input
                        type="text"
                        value={adminUsersKeyword}
                        onChange={(event) => setAdminUsersKeyword(event.target.value)}
                        placeholder="아이디 또는 닉네임을 입력하세요"
                    />
                </div>
                <div className="adminField">
                    <label>회원 상태</label>
                    <select
                        value={adminUsersStatusCd}
                        onChange={(event) => setAdminUsersStatusCd(event.target.value)}
                    >
                        {statusCdOptions.map((option) => (
                            <option key={option.value || 'all-status'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField adminDateRangeField">
                    <label>가입일</label>
                    <div className="adminDateRangeInputs">
                        <input
                            type="date"
                            value={adminUsersStartDate}
                            onChange={handleAdminUsersStartDateChange}
                            aria-label="가입 시작일"
                        />
                        <span>~</span>
                        <input
                            type="date"
                            value={adminUsersEndDate}
                            min={adminUsersStartDate || undefined}
                            onChange={handleAdminUsersEndDateChange}
                            aria-label="가입 종료일"
                        />
                    </div>
                </div>
                <button type="submit" className="adminPrimaryBtn">검색</button>
            </form>

            <section className="adminOpsSection">
                <div className="adminPanelHeader">
                    <div>
                        <h3>회원 목록</h3>
                        <p>총 {adminUsersTotalElements.toLocaleString()}명의 회원을 조회했습니다.</p>
                    </div>
                    <span>{adminUsersLoading ? '조회 중' : `${adminUsersPage + 1} / ${Math.max(adminUsersTotalPages, 1)}`}</span>
                </div>

                {adminUsersError && (
                    <div className="adminDashboardNotice">{adminUsersError}</div>
                )}

                {!adminUsersError && adminUsersLoading && (
                    <div className="adminDashboardNotice">회원 목록을 불러오는 중입니다.</div>
                )}

                {!adminUsersError && !adminUsersLoading && adminUsers.length === 0 && (
                    <div className="adminUsersEmpty">회원 데이터가 없습니다.</div>
                )}

                {!adminUsersError && adminUsers.length > 0 && (
                    <>
                        <AdminUsersTable users={adminUsers} onUserOpen={handleAdminUserDetailOpen} />
                        <Pagination
                            currentPage={adminUsersPage + 1}
                            totalPage={adminUsersTotalPages}
                            onPageChange={(page) => setAdminUsersPage(page - 1)}
                        />
                    </>
                )}
            </section>
            {adminUserDetailModal && (
                <AdminUserDetailModal
                    user={adminUserDetailModal}
                    loading={adminUserDetailLoading}
                    error={adminUserDetailError}
                    onClose={closeAdminUserDetailModal}
                />
            )}
        </>
    );

    // 상품 검색 조건을 적용한다.
    const handleAdminProductsSearch = (event) => {
        event.preventDefault();
        setAdminProductsQueryKeyword(adminProductsKeyword);
        setAdminProductsQueryStatus(adminProductsStatus);
        setAdminProductsQueryCategoryId(adminProductsCategoryId);
        setAdminProductsPage(0);
    };

    const handleAdminProductDetailOpen = async (product) => {
        const prdId = product?.prdId;

        if (!prdId) return;

        setAdminProductDetailModal(product);
        setAdminProductDetailForm(createAdminProductDetailForm(product));
        setAdminProductDetailLoading(true);
        setAdminProductDetailError('');

        try {
            const response = await getAdminProductDetail(prdId);
            setAdminProductDetailModal(response);
            setAdminProductDetailForm(createAdminProductDetailForm(response));
        } catch (error) {
            console.error('관리자 상품 상세 조회 실패:', error);
            setAdminProductDetailError('상품 상세 정보를 불러오지 못했습니다.');
        } finally {
            setAdminProductDetailLoading(false);
        }
    };

    const handleAdminProductDetailFormChange = (event) => {
        const { name, value } = event.target;

        setAdminProductDetailForm((form) => ({
            ...form,
            [name]: value
        }));
    };

    const handleAdminProductDetailSave = async () => {
        const payload = createAdminProductUpdatePayload(adminProductDetailForm);
        const validationMessage = validateAdminProductUpdatePayload(payload);
        const prdId = adminProductDetailModal?.prdId;

        if (!prdId || validationMessage) {
            setAdminProductDetailError(validationMessage || '상품 상세 정보를 불러오지 못했습니다.');
            return;
        }

        setAdminProductDetailSaving(true);
        setAdminProductDetailError('');

        try {
            const response = await updateAdminProduct(prdId, payload);
            setAdminProductDetailModal(response);
            setAdminProductDetailForm(createAdminProductDetailForm(response));
            setAdminProducts((products) => products.map((product) => (
                product.prdId === response?.prdId ? { ...product, ...response } : product
            )));
        } catch (error) {
            console.error('관리자 상품 수정 실패:', error);
            setAdminProductDetailError('상품 정보를 수정하지 못했습니다.');
        } finally {
            setAdminProductDetailSaving(false);
        }
    };

    const closeAdminProductDetailModal = () => {
        setAdminProductDetailModal(null);
        setAdminProductDetailForm(null);
        setAdminProductDetailLoading(false);
        setAdminProductDetailSaving(false);
        setAdminProductDetailError('');
    };

    // 상품 관리 화면을 렌더링한다.
    const renderPrd = () => (
        <>
            <form className="adminFilterCard" onSubmit={handleAdminProductsSearch}>
                <div className="adminField">
                    <label>검색어</label>
                    <input
                        type="text"
                        value={adminProductsKeyword}
                        onChange={(event) => setAdminProductsKeyword(event.target.value)}
                        placeholder="상품명 및 제조사를 입력하세요"
                    />
                </div>
                <div className="adminField">
                    <label>상품 상태</label>
                    <select
                        value={adminProductsStatus}
                        onChange={(event) => setAdminProductsStatus(event.target.value)}
                    >
                        {productStatusOptions.map((option) => (
                            <option key={option.value || 'all-product-status'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField">
                    <label>카테고리</label>
                    <select
                        value={adminProductsCategoryId}
                        onChange={(event) => setAdminProductsCategoryId(event.target.value)}
                    >
                        {productCategoryOptions.map((option) => (
                            <option key={option.value || 'all-product-category'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="adminPrimaryBtn">검색</button>
            </form>

            <section className="adminOpsSection">
                <div className="adminPanelHeader">
                    <div>
                        <h3>상품 목록</h3>
                        <p>총 {adminProductsTotalElements.toLocaleString()}개의 상품을 조회했습니다.</p>
                    </div>
                    <span>{adminProductsLoading ? '조회 중' : `${adminProductsPage + 1} / ${Math.max(adminProductsTotalPages, 1)}`}</span>
                </div>

                {adminProductsError && (
                    <div className="adminDashboardNotice">{adminProductsError}</div>
                )}

                {!adminProductsError && adminProductsLoading && (
                    <div className="adminDashboardNotice">상품 목록을 불러오는 중입니다.</div>
                )}

                {!adminProductsError && !adminProductsLoading && adminProducts.length === 0 && (
                    <div className="adminUsersEmpty">상품 데이터가 없습니다.</div>
                )}

                {!adminProductsError && adminProducts.length > 0 && (
                    <>
                        <AdminProductsTable products={adminProducts} onProductOpen={handleAdminProductDetailOpen} />
                        <Pagination
                            currentPage={adminProductsPage + 1}
                            totalPage={adminProductsTotalPages}
                            onPageChange={(page) => setAdminProductsPage(page - 1)}
                        />
                    </>
                )}
            </section>
            {adminProductDetailModal && (
                <AdminProductDetailModal
                    product={adminProductDetailModal}
                    form={adminProductDetailForm}
                    loading={adminProductDetailLoading}
                    saving={adminProductDetailSaving}
                    error={adminProductDetailError}
                    onChange={handleAdminProductDetailFormChange}
                    onSave={handleAdminProductDetailSave}
                    onClose={closeAdminProductDetailModal}
                />
            )}
        </>
    );

    // 주문 검색 조건을 적용한다.
    const handleAdminOrdersSearch = (event) => {
        event.preventDefault();
        setAdminOrdersQueryKeyword(adminOrdersKeyword);
        setAdminOrdersQueryPayMthdCd(adminOrdersPayMthdCd);
        setAdminOrdersQueryStartDate(adminOrdersStartDate);
        setAdminOrdersQueryEndDate(adminOrdersEndDate);
        setAdminOrdersPage(0);
    };

    // 주문 검색 시작일을 변경한다.
    const handleAdminOrdersStartDateChange = (event) => {
        const nextStartDate = event.target.value;

        setAdminOrdersStartDate(nextStartDate);
        setAdminOrdersEndDate((currentEndDate) => (
            currentEndDate && nextStartDate && currentEndDate < nextStartDate ? '' : currentEndDate
        ));
        event.currentTarget.parentElement?.querySelector('input[aria-label="주문 종료일"]')?.focus();
    };

    // 주문 검색 종료일을 변경한다.
    const handleAdminOrdersEndDateChange = (event) => {
        const nextEndDate = event.target.value;

        setAdminOrdersEndDate(
            adminOrdersStartDate && nextEndDate && nextEndDate < adminOrdersStartDate ? '' : nextEndDate
        );
    };

    // 주문 관리 화면을 렌더링한다.
    const renderOrd = () => (
        <>
            <form className="adminFilterCard adminOrderFilterCard" onSubmit={handleAdminOrdersSearch}>
                <div className="adminField">
                    <label>검색어</label>
                    <input
                        type="text"
                        value={adminOrdersKeyword}
                        onChange={(event) => setAdminOrdersKeyword(event.target.value)}
                        placeholder="주문번호, 상품명, 구매자를 입력하세요"
                    />
                </div>
                <div className="adminField">
                    <label>결제수단</label>
                    <select
                        value={adminOrdersPayMthdCd}
                        onChange={(event) => setAdminOrdersPayMthdCd(event.target.value)}
                    >
                        {orderPaymentMethodOptions.map((option) => (
                            <option key={option.value || 'all-order-category'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField adminDateRangeField">
                    <label>주문일</label>
                    <div className="adminDateRangeInputs">
                        <input
                            type="date"
                            value={adminOrdersStartDate}
                            onChange={handleAdminOrdersStartDateChange}
                            aria-label="주문 시작일"
                        />
                        <span>~</span>
                        <input
                            type="date"
                            value={adminOrdersEndDate}
                            min={adminOrdersStartDate || undefined}
                            onChange={handleAdminOrdersEndDateChange}
                            aria-label="주문 종료일"
                        />
                    </div>
                </div>
                <button type="submit" className="adminPrimaryBtn">검색</button>
            </form>

            <section className="adminOpsSection">
                <div className="adminPanelHeader">
                    <div>
                        <h3>주문 목록</h3>
                        <p>총 {adminOrdersTotalElements.toLocaleString()}건의 주문을 조회했습니다.</p>
                    </div>
                    <span>{adminOrdersLoading ? '조회 중' : `${adminOrdersPage + 1} / ${Math.max(adminOrdersTotalPages, 1)}`}</span>
                </div>

                {adminOrdersError && (
                    <div className="adminDashboardNotice">{adminOrdersError}</div>
                )}

                {!adminOrdersError && adminOrdersLoading && (
                    <div className="adminDashboardNotice">주문 목록을 불러오는 중입니다.</div>
                )}

                {!adminOrdersError && !adminOrdersLoading && adminOrders.length === 0 && (
                    <div className="adminUsersEmpty">주문 데이터가 없습니다.</div>
                )}

                {!adminOrdersError && adminOrders.length > 0 && (
                    <>
                        <AdminOrdersTable orders={adminOrders} />
                        <Pagination
                            currentPage={adminOrdersPage + 1}
                            totalPage={adminOrdersTotalPages}
                            onPageChange={(page) => setAdminOrdersPage(page - 1)}
                        />
                    </>
                )}
            </section>
        </>
    );

    // 리뷰 검색 조건을 적용한다.
    const handleAdminReviewsSearch = (event) => {
        event.preventDefault();
        setAdminReviewsQueryKeyword(adminReviewsKeyword);
        setAdminReviewsQueryRating(adminReviewsRating);
        setAdminReviewsQueryStartDate(adminReviewsStartDate);
        setAdminReviewsQueryEndDate(adminReviewsEndDate);
        setAdminReviewsPage(0);
    };

    // 리뷰 검색 시작일을 변경한다.
    const handleAdminReviewsStartDateChange = (event) => {
        const nextStartDate = event.target.value;

        setAdminReviewsStartDate(nextStartDate);
        setAdminReviewsEndDate((currentEndDate) => (
            currentEndDate && nextStartDate && currentEndDate < nextStartDate ? '' : currentEndDate
        ));
        event.currentTarget.parentElement?.querySelector('input[aria-label="등록 종료일"]')?.focus();
    };

    // 리뷰 검색 종료일을 변경한다.
    const handleAdminReviewsEndDateChange = (event) => {
        const nextEndDate = event.target.value;

        setAdminReviewsEndDate(
            adminReviewsStartDate && nextEndDate && nextEndDate < adminReviewsStartDate ? '' : nextEndDate
        );
    };

    // 리뷰 상세 모달을 닫는다.
    const closeAdminReviewDetailModal = () => {
        if (adminReviewDetailSaving) return;
        setAdminReviewDetailModal(null);
        setAdminReviewDetailError('');
        setAdminReviewDetailMessage('');
        setAdminReviewReplyText('');
    };

    // 리뷰 상세 모달을 연다.
    const handleAdminReviewDetailOpen = async (review) => {
        const reviewId = review?.reviewId;

        if (!reviewId) return;

        setAdminReviewDetailModal(review);
        setAdminReviewReplyText(review.replyTxt || '');
        setAdminReviewDetailLoading(true);
        setAdminReviewDetailError('');
        setAdminReviewDetailMessage('');

        try {
            const detail = await getAdminReviewDetail(reviewId);
            const nextDetail = detail || review;
            setAdminReviewDetailModal(nextDetail);
            setAdminReviewReplyText(nextDetail.replyTxt || '');
        } catch {
            setAdminReviewDetailModal(review);
            setAdminReviewDetailError('상세 정보를 불러오지 못했습니다.');
        } finally {
            setAdminReviewDetailLoading(false);
        }
    };

    // 리뷰 답글 저장을 처리한다.
    const handleAdminReviewReplySave = async () => {
        const reviewId = adminReviewDetailModal?.reviewId;

        if (!reviewId) return;

        setAdminReviewDetailSaving(true);
        setAdminReviewDetailError('');
        setAdminReviewDetailMessage('');

        try {
            const detail = await saveAdminReviewReply(reviewId, { replyTxt: adminReviewReplyText });
            const nextReplyText = detail?.replyTxt ?? adminReviewReplyText;
            setAdminReviewDetailModal((current) => ({
                ...current,
                ...(detail || {}),
                replyTxt: nextReplyText
            }));
            setAdminReviews((reviews) => reviews.map((review) => (
                review.reviewId === reviewId ? { ...review, replyTxt: nextReplyText } : review
            )));
            setAdminReviewReplyText(nextReplyText);
            setAdminReviewDetailMessage('답글이 저장 되었습니다.');
        } catch {
            setAdminReviewDetailError('답글 저장에 실패했습니다.');
        } finally {
            setAdminReviewDetailSaving(false);
        }
    };

    // 리뷰 답글 삭제를 처리한다.
    const handleAdminReviewReplyDelete = async () => {
        const reviewId = adminReviewDetailModal?.reviewId;

        if (!reviewId) return;

        setAdminReviewDetailSaving(true);
        setAdminReviewDetailError('');
        setAdminReviewDetailMessage('');

        try {
            await deleteAdminReviewReply(reviewId);
            setAdminReviewDetailModal((current) => ({
                ...current,
                replyTxt: ''
            }));
            setAdminReviews((reviews) => reviews.map((review) => (
                review.reviewId === reviewId ? { ...review, replyTxt: '' } : review
            )));
            setAdminReviewReplyText('');
            setAdminReviewDetailMessage('답글이 삭제 되었습니다.');
        } catch {
            setAdminReviewDetailError('답글 삭제에 실패했습니다.');
        } finally {
            setAdminReviewDetailSaving(false);
        }
    };

    // 리뷰 관리 화면을 렌더링한다.
    const renderRvw = () => (
        <>
            <form className="adminFilterCard adminReviewFilterCard" onSubmit={handleAdminReviewsSearch}>
                <div className="adminField">
                    <label>검색어</label>
                    <input
                        type="text"
                        value={adminReviewsKeyword}
                        onChange={(event) => setAdminReviewsKeyword(event.target.value)}
                        placeholder="상품명, 작성자를 입력하세요"
                    />
                </div>
                <div className="adminField">
                    <label>평점</label>
                    <select
                        value={adminReviewsRating}
                        onChange={(event) => setAdminReviewsRating(event.target.value)}
                    >
                        {reviewRatingOptions.map((option) => (
                            <option key={option.value || 'all-review-rating'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="adminField adminDateRangeField">
                    <label>등록일</label>
                    <div className="adminDateRangeInputs">
                        <input
                            type="date"
                            value={adminReviewsStartDate}
                            onChange={handleAdminReviewsStartDateChange}
                            aria-label="등록 시작일"
                        />
                        <span>~</span>
                        <input
                            type="date"
                            value={adminReviewsEndDate}
                            min={adminReviewsStartDate || undefined}
                            onChange={handleAdminReviewsEndDateChange}
                            aria-label="등록 종료일"
                        />
                    </div>
                </div>
                <button type="submit" className="adminPrimaryBtn">검색</button>
            </form>

            <section className="adminOpsSection">
                <div className="adminPanelHeader">
                    <div>
                        <h3>리뷰 목록</h3>
                        <p>총 {adminReviewsTotalElements.toLocaleString()}건의 리뷰를 조회했습니다.</p>
                    </div>
                    <span>{adminReviewsLoading ? '조회 중' : `${adminReviewsPage + 1} / ${Math.max(adminReviewsTotalPages, 1)}`}</span>
                </div>

                {adminReviewsError && (
                    <div className="adminDashboardNotice">{adminReviewsError}</div>
                )}

                {!adminReviewsError && adminReviewsLoading && (
                    <div className="adminDashboardNotice">리뷰 목록을 불러오는 중입니다.</div>
                )}

                {!adminReviewsError && !adminReviewsLoading && adminReviews.length === 0 && (
                    <div className="adminUsersEmpty">리뷰 데이터가 없습니다.</div>
                )}

                {!adminReviewsError && adminReviews.length > 0 && (
                    <>
                        <AdminReviewsTable reviews={adminReviews} onReviewOpen={handleAdminReviewDetailOpen} />
                        <Pagination
                            currentPage={adminReviewsPage + 1}
                            totalPage={adminReviewsTotalPages}
                            onPageChange={(page) => setAdminReviewsPage(page - 1)}
                        />
                    </>
                )}
            </section>
            {adminReviewDetailModal && (
                <AdminReviewDetailModal
                    review={adminReviewDetailModal}
                    replyText={adminReviewReplyText}
                    loading={adminReviewDetailLoading}
                    saving={adminReviewDetailSaving}
                    error={adminReviewDetailError}
                    message={adminReviewDetailMessage}
                    onReplyChange={(event) => setAdminReviewReplyText(event.target.value)}
                    onReplySave={handleAdminReviewReplySave}
                    onReplyDelete={handleAdminReviewReplyDelete}
                    onClose={closeAdminReviewDetailModal}
                />
            )}
        </>
    );

    // 현재 선택된 관리자 탭 화면을 렌더링한다.
    const renderContent = () => {
        if (activeTab === 'dashboard') {
            return renderDashboard();
        }

        if (activeTab === 'users') {
            return renderUsers();
        }

        if (activeTab === 'prd') {
            return renderPrd();
        }

        if (activeTab === 'ord') {
            return renderOrd();
        }

        if (activeTab === 'rvw') {
            return renderRvw();
        }

        if (activeTab === 'cscenter') {
            return renderCsCenter();
        }

        return (
            <>
                {activeTab === 'rvw' && (
                    <div className="adminStatusGrid">
                        <MetricCard label="전체 리뷰" value="연동 예정" />
                        <MetricCard label="답변 상태" value="준비중" />
                        <MetricCard label="별점 필터" value="-" />
                    </div>
                )}
                {renderFilterMock(activeTab)}
                <EmptyState text={pageInfo[activeTab].emptyText} />
            </>
        );
    };

    const currentInfo = activeTab === 'dashboard'
        ? {
            title: 'VitaPick 관리자 대시보드',
            description: '운영 현황을 한눈에 확인할 수 있는 관리자 화면입니다.'
        }
        : pageInfo[activeTab];

    return (
        <div className="adminPage">
            <AdminSidebar
                activeTab={activeTab}
                onChangeTab={setActiveTab}
            />

            <main className="adminContent">
                <header className="adminPageHeader">
                    <div>
                        <h1>{currentInfo.title}</h1>
                        <p>{currentInfo.description}</p>
                    </div>
                    {activeTab === 'dashboard' && (
                        <div className="adminHeaderActions">
                            <button
                                type="button"
                                onClick={handleAdminExcelDownload}
                            >
                                데이터 다운로드
                            </button>
                        </div>
                    )}
                </header>

                {renderContent()}
            </main>
        </div>
    );
}

// 관리자 지표 카드를 렌더링한다.
function MetricCard({ label, value, basis }) {
    return (
        <article className="adminMetricCard">
            <span>{label}</span>
            <strong>{value}</strong>
            {basis && <em>{basis}</em>}
        </article>
    );
}

// 관리자 기능 카드를 렌더링한다.
function FeatureCard({ title, text, active = false, onClick }) {
    const Component = onClick ? 'button' : 'article';

    return (
        <Component
            type={onClick ? 'button' : undefined}
            className={`adminFeatureCard${onClick ? ' adminCsTabCard' : ''}${active ? ' active' : ''}`}
            onClick={onClick}
        >
            <span className="adminFeatureIcon">{title.slice(0, 1)}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <strong>{active ? '선택됨' : '목록 보기'}</strong>
        </Component>
    );
}

// 대시보드 인기 상품 표를 렌더링한다.
function TopProductsTable({ data }) {
    return (
        <div className="adminTopProductsTable">
            <div className="adminTopProductsHead">
                {data.columns.map((column) => (
                    <span key={column}>{column}</span>
                ))}
            </div>
            <div className="adminTopProductsBody">
                {data.rows.map((row) => (
                    <div className="adminTopProductsRow" key={row.rank}>
                        <span>{row.rank}</span>
                        <span>{row.productName}</span>
                        <span>{row.category}</span>
                        <span>{row.paidQuantity}</span>
                        <span>{row.salesAmount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 관리자 회원 목록 표를 렌더링한다.
function AdminUsersTable({ users, onUserOpen }) {
    return (
        <div className="adminUsersTable">
            <div className="adminUsersHead">
                <span>회원번호</span>
                <span>아이디</span>
                <span>이름</span>
                <span>연락처</span>
                <span>상태</span>
                <span>권한</span>
                <span>가입일</span>
                <span>수정일</span>
                <span>탈퇴일</span>
            </div>
            <div className="adminUsersBody">
                {users.map((user) => (
                    <div className="adminUsersRow" key={user.userNum ?? user.loginId} role="button" tabIndex={0} onClick={() => onUserOpen(user)} onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onUserOpen(user);
                        }
                    }}>
                        <span>{formatValue(user.userNum)}</span>
                        <span>{formatValue(user.loginId)}</span>
                        <span>{formatValue(user.userNm)}</span>
                        <span>{formatValue(user.tel)}</span>
                        <span>{formatCode(user.statusCd, statusCdOptions)}</span>
                        <span>{formatCode(user.roleCd, roleCdOptions)}</span>
                        <span>{formatDateTime(user.crtAt)}</span>
                        <span>{formatDateTime(user.updAt)}</span>
                        <span>{formatDateTime(user.wdDt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminUserDetailModal({ user, loading, error, onClose }) {
    const purchaseSummary = user?.purchaseSummary || {};
    const recentOrders = Array.isArray(user?.recentOrders) ? user.recentOrders : [];

    return (
        <div className="adminModalOverlay" role="presentation" onClick={onClose}>
            <section className="adminCsDetailModal adminUserDetailModal" role="dialog" aria-modal="true" aria-labelledby="adminUserDetailTitle" onClick={(event) => event.stopPropagation()}>
                <div className="adminCsDetailHeader">
                    <div>
                        <span className="adminCsDetailType">회원 관리</span>
                        <h3 id="adminUserDetailTitle">{formatValue(user?.loginId)}</h3>
                    </div>
                    <button type="button" className="adminModalCloseBtn" onClick={onClose} aria-label="닫기">
                        ×
                    </button>
                </div>

                {error && <div className="adminDashboardNotice">{error}</div>}
                {loading && <div className="adminDashboardNotice">상세 정보를 불러오는 중입니다.</div>}

                <dl className="adminCsDetailMeta">
                    <div>
                        <dt>아이디</dt>
                        <dd>{formatValue(user?.loginId)}</dd>
                    </div>
                    <div>
                        <dt>닉네임</dt>
                        <dd>{formatValue(user?.userNm)}</dd>
                    </div>
                    <div>
                        <dt>성별</dt>
                        <dd>{formatValue(user?.genderCd)}</dd>
                    </div>
                    <div>
                        <dt>이메일</dt>
                        <dd>{formatValue(user?.email)}</dd>
                    </div>
                    <div>
                        <dt>생년월일</dt>
                        <dd>{formatValue(user?.birthYmd)}</dd>
                    </div>
                    <div>
                        <dt>가입일</dt>
                        <dd>{formatDateTime(user?.crtAt)}</dd>
                    </div>
                    <div>
                        <dt>권한</dt>
                        <dd>{formatCode(user?.roleCd, roleCdOptions)}</dd>
                    </div>
                    <div>
                        <dt>상태</dt>
                        <dd>{formatCode(user?.statusCd, statusCdOptions)}</dd>
                    </div>
                    <div>
                        <dt>전화번호</dt>
                        <dd>{formatValue(user?.tel)}</dd>
                    </div>
                </dl>

                <div className="adminUserPurchaseSummary">
                    <div>
                        <span>결제완료 주문 횟수</span>
                        <strong>{formatCount(purchaseSummary.paidOrderCount, '0건')}</strong>
                    </div>
                    <div>
                        <span>총 결제 금액</span>
                        <strong>{formatCurrency(purchaseSummary.totalPaidAmount, '0원')}</strong>
                    </div>
                </div>

                <div className="adminUserRecentOrders">
                    <h4>최근 주문 내역</h4>
                    {recentOrders.length === 0 ? (
                        <div className="adminUsersEmpty">구매 내역이 없습니다.</div>
                    ) : (
                        <div className="adminUserRecentOrdersTable">
                            <div className="adminUserRecentOrdersHead">
                                <span>주문일</span>
                                <span>주문번호</span>
                                <span>결제수단</span>
                                <span>주문상태</span>
                                <span>결제금액</span>
                            </div>
                            <div className="adminUserRecentOrdersBody">
                                {recentOrders.map((order) => (
                                    <div className="adminUserRecentOrdersRow" key={order.orderId ?? order.orderNo}>
                                        <span>{formatDateTime(order.orderDate)}</span>
                                        <span>{formatValue(order.orderNo ?? order.orderId)}</span>
                                        <span>{formatCode(order.payMthdCd, orderPaymentMethodOptions)}</span>
                                        <span>{formatCode(order.orderStatus, orderStatusOptions)}</span>
                                        <span>{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="adminCsDetailActions">
                    <button type="button" className="adminSecondaryBtn" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </section>
        </div>
    );
}

// 관리자 상품 목록 표를 렌더링한다.
function AdminProductsTable({ products, onProductOpen }) {
    return (
        <div className="adminProductsTable">
            <div className="adminProductsHead">
                <span>이미지</span>
                <span>상품번호</span>
                <span>상품명</span>
                <span>브랜드</span>
                <span>카테고리</span>
                <span>가격</span>
                <span>상태</span>
                <span>등록일</span>
                <span>수정일</span>
                <span>삭제일</span>
            </div>
            <div className="adminProductsBody">
                {products.map((product) => (
                    <div className="adminProductsRow" key={product.prdId ?? product.prdNm} role="button" tabIndex={0} onClick={() => onProductOpen(product)} onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onProductOpen(product);
                        }
                    }}>
                        <span>
                            {product.thumbImgUrl ? (
                                <img
                                    className="adminProductThumb"
                                    src={product.thumbImgUrl}
                                    alt={product.prdNm || '상품 이미지'}
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="adminProductThumbEmpty">이미지 없음</span>
                            )}
                        </span>
                        <span>{formatValue(product.prdId)}</span>
                        <span>{formatValue(product.prdNm)}</span>
                        <span>{formatValue(product.brand)}</span>
                        <span>{formatCode(String(product.catCd ?? ''), productCategoryOptions) !== '-' ? formatCode(String(product.catCd ?? ''), productCategoryOptions) : formatValue(product.categoryName)}</span>
                        <span>{formatCurrency(product.price)}</span>
                        <span>{formatCode(product.useYn, productStatusOptions)}</span>
                        <span>{formatDateTime(product.crtAt)}</span>
                        <span>{formatDateTime(product.updAt)}</span>
                        <span>{formatDateTime(product.wdAt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AdminProductDetailModal({ product, form, loading, saving, error, onChange, onSave, onClose }) {
    return (
        <div className="adminModalOverlay" role="presentation" onClick={saving ? undefined : onClose}>
            <section className="adminCsDetailModal adminProductDetailModal" role="dialog" aria-modal="true" aria-labelledby="adminProductDetailTitle" onClick={(event) => event.stopPropagation()}>
                <div className="adminCsDetailHeader">
                    <div>
                        <span className="adminCsDetailType">상품 관리</span>
                        <h3 id="adminProductDetailTitle">{formatValue(product?.prdNm)}</h3>
                    </div>
                    <button type="button" className="adminModalCloseBtn" onClick={onClose} aria-label="닫기" disabled={saving}>
                        ×
                    </button>
                </div>

                {error && <div className="adminDashboardNotice">{error}</div>}
                {loading && <div className="adminDashboardNotice">상세 정보를 불러오는 중입니다.</div>}

                <dl className="adminCsDetailMeta">
                    <div>
                        <dt>상품번호</dt>
                        <dd>{formatValue(product?.prdId)}</dd>
                    </div>
                    <div>
                        <dt>등록일</dt>
                        <dd>{formatDateTime(product?.crtAt)}</dd>
                    </div>
                    <div>
                        <dt>수정일</dt>
                        <dd>{formatDateTime(product?.updAt)}</dd>
                    </div>
                </dl>

                <div className="adminProductDetailForm">
                    <div className="adminField">
                        <label>상품명</label>
                        <input name="prdNm" type="text" value={form?.prdNm || ''} onChange={onChange} disabled={loading || saving} />
                    </div>
                    <div className="adminField">
                        <label>브랜드</label>
                        <input name="brand" type="text" value={form?.brand || ''} onChange={onChange} disabled={loading || saving} />
                    </div>
                    <div className="adminField">
                        <label>카테고리</label>
                        <select name="catCd" value={form?.catCd || ''} onChange={onChange} disabled={loading || saving}>
                            {productCategoryOptions.filter((option) => option.value).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="adminField">
                        <label>상품가격</label>
                        <input name="price" type="number" min="0" value={form?.price ?? ''} onChange={onChange} disabled={loading || saving} />
                    </div>
                    <div className="adminField">
                        <label>상태</label>
                        <select name="useYn" value={form?.useYn || ''} onChange={onChange} disabled={loading || saving}>
                            {productStatusOptions.filter((option) => option.value).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="adminField adminProductDetailWideField">
                        <label>상품 설명</label>
                        <textarea name="descTxt" value={form?.descTxt || ''} onChange={onChange} disabled={loading || saving} />
                    </div>
                    <div className="adminField adminProductDetailWideField">
                        <label>복용 방법</label>
                        <textarea name="dosTxt" value={form?.dosTxt || ''} onChange={onChange} disabled={loading || saving} />
                    </div>
                    <div className="adminField adminProductDetailWideField">
                        <label>주의 사항</label>
                        <textarea name="warnTxt" value={form?.warnTxt || ''} onChange={onChange} disabled={loading || saving} />
                    </div>
                    <div className="adminField adminProductDetailWideField">
                        <label>성분</label>
                        <textarea value={product?.ingr || ''} readOnly />
                    </div>
                </div>

                <div className="adminCsDetailActions">
                    <button type="button" className="adminSecondaryBtn" onClick={onClose} disabled={saving}>
                        닫기
                    </button>
                    <button type="button" className="adminPrimaryBtn" onClick={onSave} disabled={loading || saving}>
                        수정
                    </button>
                </div>
            </section>
        </div>
    );
}

// 관리자 주문 목록 표를 렌더링한다.
function AdminOrdersTable({ orders }) {
    return (
        <div className="adminOrdersTable">
            <div className="adminOrdersHead">
                <span>주문번호</span>
                <span>상품명</span>
                <span>구매자 ID</span>
                <span>구매자명</span>
                <span>결제금액</span>
                <span>결제수단</span>
                <span>주문일</span>
                <span>수정일</span>
            </div>
            <div className="adminOrdersBody">
                {orders.map((order) => (
                    <div className="adminOrdersRow" key={order.orderId ?? order.orderNo}>
                        <span>{formatValue(order.orderNo)}</span>
                        <span>{formatValue(order.productName)}</span>
                        <span>{formatValue(order.buyerId)}</span>
                        <span>{formatValue(order.buyerName)}</span>
                        <span>{formatCurrency(order.totalPrice)}</span>
                        <span>{formatCode(order.payMthdCd, orderPaymentMethodOptions)}</span>
                        <span>{formatDateTime(order.createdAt)}</span>
                        <span>{formatDateTime(order.updatedAt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 관리자 리뷰 목록 표를 렌더링한다.
function AdminReviewsTable({ reviews, onReviewOpen }) {
    return (
        <div className="adminReviewsTable">
            <div className="adminReviewsHead">
                <span>리뷰번호</span>
                <span>상품번호</span>
                <span>상품명</span>
                <span>작성자 ID</span>
                <span>작성자명</span>
                <span>평점</span>
                <span>내용</span>
                <span>답글</span>
                <span>작성일</span>
                <span>수정일</span>
            </div>
            <div className="adminReviewsBody">
                {reviews.map((review) => {
                    const hasReply = Boolean(review.replyTxt);

                    return (
                        <div
                            className={`adminReviewsRow ${hasReply ? 'hasReply' : ''}`}
                            key={review.reviewId ?? `${review.productId}-${review.writerId}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => onReviewOpen(review)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onReviewOpen(review);
                                }
                            }}
                        >
                            <span>{formatValue(review.reviewId)}</span>
                            <span>{formatValue(review.productId)}</span>
                            <span>{formatValue(review.productName)}</span>
                            <span>{formatValue(review.writerId)}</span>
                            <span>{formatValue(review.writerName)}</span>
                            <span>{formatRating(review.rating)}</span>
                            <span className="adminReviewContent" title={formatValue(review.content)}>
                                {formatValue(review.content)}
                            </span>
                            <span>
                                <em className={`adminReviewReplyBadge ${hasReply ? 'done' : 'pending'}`}>
                                    {hasReply ? '답글완료' : '미답변'}
                                </em>
                            </span>
                            <span>{formatDateTime(review.createdAt)}</span>
                            <span>{formatDateTime(review.updatedAt)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// 고객센터 공지사항 목록 표를 렌더링한다.
function AdminCsNoticesTable({ notices, onTitleClick }) {
    return (
        <div className="adminCsNoticesTable">
            <div className="adminCsNoticesHead">
                <span>번호</span>
                <span>제목</span>
                <span>사용여부</span>
                <span>조회수</span>
                <span>등록일</span>
            </div>
            <div className="adminCsNoticesBody">
                {notices.map((notice) => (
                    <div className="adminCsNoticesRow" key={notice.ntcId ?? notice.ttl}>
                        <span>{formatValue(notice.ntcId)}</span>
                        <span className="adminCsListTitle" title={formatValue(notice.ttl)}>
                            <button type="button" onClick={() => onTitleClick(notice)}>
                                {formatValue(notice.ttl)}
                            </button>
                        </span>
                        <span>{formatValue(notice.useYn)}</span>
                        <span>{formatCount(notice.viewCnt, '-', '')}</span>
                        <span>{formatDateTime(notice.crtAt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 고객센터 FAQ 목록 표를 렌더링한다.
function AdminCsFaqsTable({ faqs, onTitleClick }) {
    return (
        <div className="adminCsFaqsTable">
            <div className="adminCsFaqsHead">
                <span>번호</span>
                <span>카테고리</span>
                <span>제목</span>
                <span>사용여부</span>
                <span>조회수</span>
                <span>등록일</span>
            </div>
            <div className="adminCsFaqsBody">
                {faqs.map((faq) => (
                    <div className="adminCsFaqsRow" key={faq.faqId ?? faq.ttl}>
                        <span>{formatValue(faq.faqId)}</span>
                        <span>{formatFaqCategory(faq.faqCtgCd)}</span>
                        <span className="adminCsListTitle" title={formatValue(faq.ttl)}>
                            <button type="button" onClick={() => onTitleClick(faq)}>
                                {formatValue(faq.ttl)}
                            </button>
                        </span>
                        <span>{formatValue(faq.useYn)}</span>
                        <span>{formatCount(faq.viewCnt, '-', '')}</span>
                        <span>{formatDateTime(faq.crtAt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 고객센터 1:1 문의 목록 표를 렌더링한다.
function AdminCsInquiriesTable({ inquiries, onInquiryOpen }) {
    return (
        <div className="adminCsInquiriesTable">
            <div className="adminCsInquiriesHead">
                <span>문의번호</span>
                <span>제목</span>
                <span>작성자 ID</span>
                <span>작성자명</span>
                <span>카테고리</span>
                <span>상태</span>
                <span>조회수</span>
                <span>답변일</span>
                <span>작성일</span>
                <span>수정일</span>
            </div>
            <div className="adminCsInquiriesBody">
                {inquiries.map((inquiry) => (
                    <div
                        className="adminCsInquiriesRow"
                        key={inquiry.inquiryId ?? inquiry.inqId ?? `${inquiry.writerId}-${inquiry.createdAt}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => onInquiryOpen(inquiry)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onInquiryOpen(inquiry);
                            }
                        }}
                    >
                        <span>{formatValue(inquiry.inquiryId ?? inquiry.inqId)}</span>
                        <span className="adminCsInquiryTitle" title={formatValue(inquiry.title)}>
                            {formatValue(inquiry.title)}
                        </span>
                        <span>{formatValue(inquiry.writerId)}</span>
                        <span>{formatValue(inquiry.writerName)}</span>
                        <span>{formatCode(inquiry.category, inquiryTypeOptions)}</span>
                        <span>{formatCode(inquiry.status, inquiryStatusOptions)}</span>
                        <span>{formatCount(inquiry.viewCnt, '-', '')}</span>
                        <span>{formatDateTime(inquiry.answeredAt)}</span>
                        <span>{formatDateTime(inquiry.createdAt)}</span>
                        <span>{formatDateTime(inquiry.updatedAt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 고객센터 문의 상세/답변 모달을 렌더링한다.
function AdminCsInquiryDetailModal({ inquiry, answerText, loading, saving, error, message, onAnswerChange, onAnswerSave, onClose }) {
    return (
        <div className="adminModalOverlay" role="presentation" onClick={onClose}>
            <section className="adminCsDetailModal adminReviewDetailModal" role="dialog" aria-modal="true" aria-labelledby="adminCsInquiryDetailTitle" onClick={(event) => event.stopPropagation()}>
                <div className="adminCsDetailHeader">
                    <div>
                        <span className="adminCsDetailType">1:1 문의 관리</span>
                        <h3 id="adminCsInquiryDetailTitle">{formatValue(inquiry?.title)}</h3>
                    </div>
                    <button type="button" className="adminModalCloseBtn" onClick={onClose} aria-label="닫기" disabled={saving}>
                        ×
                    </button>
                </div>

                {error && <div className="adminDashboardNotice">{error}</div>}
                {loading && <div className="adminDashboardNotice">상세 정보를 불러오는 중입니다.</div>}
                {message && <div className="adminReviewDetailMessage">{message}</div>}

                <dl className="adminCsDetailMeta">
                    <div>
                        <dt>문의번호</dt>
                        <dd>{formatValue(inquiry?.inquiryId ?? inquiry?.inqId)}</dd>
                    </div>
                    <div>
                        <dt>회원번호</dt>
                        <dd>{formatValue(inquiry?.userNum)}</dd>
                    </div>
                    <div>
                        <dt>작성자 ID</dt>
                        <dd>{formatValue(inquiry?.writerId)}</dd>
                    </div>
                    <div>
                        <dt>작성자명</dt>
                        <dd>{formatValue(inquiry?.writerName)}</dd>
                    </div>
                    <div>
                        <dt>카테고리</dt>
                        <dd>{formatCode(inquiry?.category, inquiryTypeOptions)}</dd>
                    </div>
                    <div>
                        <dt>상태</dt>
                        <dd>{formatCode(inquiry?.status, inquiryStatusOptions)}</dd>
                    </div>
                    <div>
                        <dt>답변일</dt>
                        <dd>{formatDateTime(inquiry?.answeredAt)}</dd>
                    </div>
                    <div>
                        <dt>작성일</dt>
                        <dd>{formatDateTime(inquiry?.createdAt)}</dd>
                    </div>
                    <div>
                        <dt>수정일</dt>
                        <dd>{formatDateTime(inquiry?.updatedAt)}</dd>
                    </div>
                </dl>

                <div className="adminCsDetailContent adminReviewDetailContent">
                    <strong>문의 내용</strong>
                    {formatMultilineText(inquiry?.inquiryText)}
                </div>

                <div className="adminCsDetailContent adminReviewDetailContent adminCsInquiryAnswerContent">
                    <strong>기존 답변</strong>
                    {formatMultilineText(inquiry?.ansTxt)}
                </div>

                <div className="adminReviewReplyBox">
                    <label htmlFor="adminCsInquiryAnswerText">답변</label>
                    <textarea
                        id="adminCsInquiryAnswerText"
                        value={answerText}
                        onChange={onAnswerChange}
                        disabled={loading || saving}
                    />
                </div>

                <div className="adminCsDetailActions">
                    <button type="button" className="adminSecondaryBtn" onClick={onClose} disabled={saving}>
                        닫기
                    </button>
                    <button type="button" className="adminPrimaryBtn" onClick={onAnswerSave} disabled={loading || saving}>
                        답변
                    </button>
                </div>
            </section>
        </div>
    );
}

// 관리자 리뷰 상세/답글 모달을 렌더링한다.
function AdminReviewDetailModal({ review, replyText, loading, saving, error, message, onReplyChange, onReplySave, onReplyDelete, onClose }) {
    const hasReply = Boolean(review?.replyTxt);

    return (
        <div className="adminModalOverlay" role="presentation" onClick={onClose}>
            <section className="adminCsDetailModal adminReviewDetailModal" role="dialog" aria-modal="true" aria-labelledby="adminReviewDetailTitle" onClick={(event) => event.stopPropagation()}>
                <div className="adminCsDetailHeader">
                    <div>
                        <span className="adminCsDetailType">리뷰 관리</span>
                        <h3 id="adminReviewDetailTitle">{formatValue(review?.productName)}</h3>
                    </div>
                    <button type="button" className="adminModalCloseBtn" onClick={onClose} aria-label="닫기" disabled={saving}>
                        ×
                    </button>
                </div>

                {error && <div className="adminDashboardNotice">{error}</div>}
                {loading && <div className="adminDashboardNotice">상세 정보를 불러오는 중입니다.</div>}
                {message && <div className="adminReviewDetailMessage">{message}</div>}

                <dl className="adminCsDetailMeta">
                    <div>
                        <dt>리뷰번호</dt>
                        <dd>{formatValue(review?.reviewId)}</dd>
                    </div>
                    <div>
                        <dt>상품명</dt>
                        <dd>{formatValue(review?.productName)}</dd>
                    </div>
                    <div>
                        <dt>작성자 ID</dt>
                        <dd>{formatValue(review?.writerId)}</dd>
                    </div>
                    <div>
                        <dt>작성자명</dt>
                        <dd>{formatValue(review?.writerName)}</dd>
                    </div>
                    <div>
                        <dt>평점</dt>
                        <dd>{formatRating(review?.rating)}</dd>
                    </div>
                    <div>
                        <dt>등록일</dt>
                        <dd>{formatDateTime(review?.createdAt)}</dd>
                    </div>
                </dl>

                <div className="adminCsDetailContent adminReviewDetailContent">
                    <strong>리뷰내용</strong>
                    {formatMultilineText(review?.content)}
                </div>

                <div className="adminReviewReplyBox">
                    <label htmlFor="adminReviewReplyText">답글</label>
                    <textarea
                        id="adminReviewReplyText"
                        value={replyText}
                        onChange={onReplyChange}
                        disabled={loading || saving}
                    />
                </div>

                <div className="adminCsDetailActions">
                    <button type="button" className="adminSecondaryBtn" onClick={onClose} disabled={saving}>
                        닫기
                    </button>
                    <button type="button" className="adminSecondaryBtn" onClick={onReplyDelete} disabled={loading || saving || !hasReply}>
                        삭제
                    </button>
                    <button type="button" className="adminPrimaryBtn" onClick={onReplySave} disabled={loading || saving}>
                        답글
                    </button>
                </div>
            </section>
        </div>
    );
}

// 고객센터 등록 모달을 렌더링한다.
function AdminCsCreateModal({ type, form, saving, error, onChange, onClose, onSubmit }) {
    const isNotice = type === 'notice';

    return (
        <div className="adminModalOverlay" role="presentation" onClick={onClose}>
            <section className="adminCsDetailModal adminCsCreateModal" role="dialog" aria-modal="true" aria-labelledby="adminCsCreateTitle" onClick={(event) => event.stopPropagation()}>
                <div className="adminCsDetailHeader">
                    <div>
                        <span className="adminCsDetailType">{isNotice ? '공지사항' : 'FAQ'} 관리</span>
                        <h3 id="adminCsCreateTitle">{isNotice ? '공지사항 등록' : 'FAQ 등록'}</h3>
                    </div>
                    <button type="button" className="adminModalCloseBtn" onClick={onClose} aria-label="닫기" disabled={saving}>
                        ×
                    </button>
                </div>

                <form className="adminCsCreateForm" onSubmit={onSubmit}>
                    {error && <div className="adminDashboardNotice">{error}</div>}

                    {!isNotice && (
                        <div className="adminField">
                            <label>FAQ 분류</label>
                            <select name="faqCtgCd" value={form.faqCtgCd} onChange={onChange} disabled={saving}>
                                {adminCsFaqCategoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="adminField">
                        <label>제목</label>
                        <input
                            type="text"
                            name="ttl"
                            value={form.ttl}
                            onChange={onChange}
                            placeholder={isNotice ? '공지사항 제목을 입력하세요' : 'FAQ 제목을 입력하세요'}
                            disabled={saving}
                        />
                    </div>

                    <div className="adminField">
                        <label>내용</label>
                        <textarea
                            name={isNotice ? 'ntcTxt' : 'faqTxt'}
                            value={isNotice ? form.ntcTxt : form.faqTxt}
                            onChange={onChange}
                            placeholder={isNotice ? '공지사항 내용을 입력하세요' : 'FAQ 내용을 입력하세요'}
                            disabled={saving}
                        />
                    </div>

                    <div className="adminField">
                        <label>사용여부</label>
                        <select name="useYn" value={form.useYn} onChange={onChange} disabled={saving}>
                            <option value="Y">공개 Y</option>
                            <option value="N">비공개 N</option>
                        </select>
                    </div>

                    <div className="adminCsDetailActions">
                        <button type="button" className="adminSecondaryBtn" onClick={onClose} disabled={saving}>
                            취소
                        </button>
                        <button type="submit" className="adminPrimaryBtn" disabled={saving}>
                            {saving ? '저장 중' : '저장'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

// 고객센터 공지사항/FAQ 상세 모달을 렌더링한다.
function AdminCsDetailModal({ type, item, loading, error, editing, editForm, saving, onEditFormChange, onEditCancel, onEditSubmit, onClose, onEdit, onDelete }) {
    const isNotice = type === 'notice';
    const title = formatValue(item?.ttl);
    const body = isNotice ? item?.ntcTxt : item?.faqTxt;
    const id = isNotice ? item?.ntcId : item?.faqId;

    return (
        <div className="adminModalOverlay" role="presentation" onClick={onClose}>
            <section className="adminCsDetailModal" role="dialog" aria-modal="true" aria-labelledby="adminCsDetailTitle" onClick={(event) => event.stopPropagation()}>
                <div className="adminCsDetailHeader">
                    <div>
                        <span className="adminCsDetailType">{isNotice ? '공지사항' : 'FAQ'} 상세</span>
                        <h3 id="adminCsDetailTitle">{title}</h3>
                    </div>
                    <button type="button" className="adminModalCloseBtn" onClick={onClose} aria-label="닫기" disabled={saving}>
                        ×
                    </button>
                </div>

                {error && <div className="adminDashboardNotice">{error}</div>}
                {loading && <div className="adminDashboardNotice">상세 정보를 불러오는 중입니다.</div>}

                {editing ? (
                    <form className="adminCsCreateForm" onSubmit={onEditSubmit}>
                        {!isNotice && (
                            <div className="adminField">
                                <label>FAQ 분류</label>
                                <select name="faqCtgCd" value={editForm.faqCtgCd} onChange={onEditFormChange} disabled={saving}>
                                    {adminCsFaqCategoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="adminField">
                            <label>제목</label>
                            <input
                                type="text"
                                name="ttl"
                                value={editForm.ttl}
                                onChange={onEditFormChange}
                                placeholder={isNotice ? '공지사항 제목을 입력하세요' : 'FAQ 제목을 입력하세요'}
                                disabled={saving}
                            />
                        </div>
                        <div className="adminField">
                            <label>내용</label>
                            <textarea
                                name={isNotice ? 'ntcTxt' : 'faqTxt'}
                                value={isNotice ? editForm.ntcTxt : editForm.faqTxt}
                                onChange={onEditFormChange}
                                placeholder={isNotice ? '공지사항 내용을 입력하세요' : 'FAQ 내용을 입력하세요'}
                                disabled={saving}
                            />
                        </div>
                        <div className="adminField">
                            <label>사용여부</label>
                            <select name="useYn" value={editForm.useYn} onChange={onEditFormChange} disabled={saving}>
                                <option value="Y">공개 Y</option>
                                <option value="N">비공개 N</option>
                            </select>
                        </div>
                        <div className="adminCsDetailActions">
                            <button type="button" className="adminSecondaryBtn" onClick={onEditCancel} disabled={saving}>
                                취소
                            </button>
                            <button type="submit" className="adminPrimaryBtn" disabled={saving}>
                                {saving ? '저장 중' : '저장'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <dl className="adminCsDetailMeta">
                            <div>
                                <dt>번호</dt>
                                <dd>{formatValue(id)}</dd>
                            </div>
                            {!isNotice && (
                                <div>
                                    <dt>카테고리</dt>
                                    <dd>{formatFaqCategory(item?.faqCtgCd)}</dd>
                                </div>
                            )}
                            <div>
                                <dt>사용여부</dt>
                                <dd>{formatValue(item?.useYn)}</dd>
                            </div>
                            <div>
                                <dt>조회수</dt>
                                <dd>{formatCount(item?.viewCnt, '-', '')}</dd>
                            </div>
                            <div>
                                <dt>등록일</dt>
                                <dd>{formatDateTime(item?.crtAt)}</dd>
                            </div>
                            <div>
                                <dt>수정일</dt>
                                <dd>{formatDateTime(item?.updAt)}</dd>
                            </div>
                        </dl>

                        <div className="adminCsDetailContent">
                            {formatMultilineText(body)}
                        </div>

                        <div className="adminCsDetailActions">
                            <button type="button" className="adminSecondaryBtn" onClick={onClose}>
                                닫기
                            </button>
                            <button type="button" className="adminSecondaryBtn" onClick={onEdit} disabled={loading}>
                                수정
                            </button>
                            <button type="button" className="adminDangerBtn" onClick={onDelete} disabled={loading}>
                                삭제
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

// 월별 회원 추이를 꺾은선 그래프로 렌더링한다.
function MonthlyLineChart({ data = [] }) {
    const series = normalizeMonthlySeries(data);
    const maxCount = getMaxCount(series);
    const points = createLineChartPoints(series, maxCount);

    return (
        <div className="adminChartCard">
            <svg className="adminLineChart" viewBox="0 0 720 160" role="img">
                <line x1="36" y1="120" x2="684" y2="120" />
                {points && <polyline points={points} />}
                {series.map((item, index) => {
                    const x = getChartX(index, series.length);
                    const y = getChartY(item.count, maxCount);

                    return (
                        <g className="adminLinePoint" key={`${item.month}-${index}`}>
                            <circle cx={x} cy={y} r="4" />
                            <g className="adminLineTooltip" transform={`translate(${x}, ${Math.max(y - 24, 18)})`}>
                                <rect x="-44" y="-18" width="88" height="22" rx="11" />
                                <text x="0" y="-4">가입 회원 {item.count}명</text>
                            </g>
                            <text x={x} y="148">{item.month}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// 월별 주문 추이를 막대 그래프로 렌더링한다.
function MonthlyBarChart({ data = [] }) {
    const series = normalizeMonthlySeries(data);
    const maxCount = getMaxCount(series);

    return (
        <div className="adminChartCard adminOrderChartCard">
            <div className="adminBarChart" role="img">
                {series.map((item, index) => (
                    <div className="adminBarItem" key={`${item.month}-${index}`}>
                        <span style={{ height: `${getRatioPercent(item.count, maxCount)}%` }} />
                        <em>주문 {item.count}건</em>
                        <strong>{item.month}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 월별 그래프 데이터를 안전한 숫자 배열로 변환한다.
function normalizeMonthlySeries(data) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .filter((item) => item && item.month !== undefined && item.month !== null)
        .map((item) => ({
            month: String(item.month),
            count: toSafeCount(item.count)
        }));
}

// 월별 그래프 최대값을 구한다.
function getMaxCount(series) {
    return Math.max(0, ...series.map((item) => item.count));
}

// 막대 그래프 높이 비율을 계산한다.
function getRatioPercent(value, maxCount) {
    if (maxCount <= 0) {
        return 0;
    }

    return Math.max(0, Math.min(100, (toSafeCount(value) / maxCount) * 100));
}

// 꺾은선 그래프 좌표 문자열을 만든다.
function createLineChartPoints(series, maxCount) {
    if (!series.length) {
        return '';
    }

    return series
        .map((item, index) => `${getChartX(index, series.length)},${getChartY(item.count, maxCount)}`)
        .join(' ');
}

// 꺾은선 그래프 X 좌표를 계산한다.
function getChartX(index, length) {
    if (length <= 1) {
        return 360;
    }

    return 36 + (648 * index) / (length - 1);
}

// 꺾은선 그래프 Y 좌표를 계산한다.
function getChartY(value, maxCount) {
    if (maxCount <= 0) {
        return 120;
    }

    return 120 - (88 * toSafeCount(value)) / maxCount;
}

// 관리자 빈 상태 화면을 렌더링한다.
function EmptyState({ text }) {
    return (
        <section className="adminEmptyCard">
            <div className="adminEmptyIcon">VP</div>
            <h3>{text}</h3>
            <p>이번 단계에서는 화면 구조만 준비했으며 실제 기능은 연결하지 않았습니다.</p>
        </section>
    );
}

// 대시보드 API 응답을 화면 데이터로 변환한다.
function createDashboardData(summary) {
    if (!summary) {
        return dashboardPlaceholderData;
    }

    return {
        ...dashboardPlaceholderData,
        sales: {
            ...dashboardPlaceholderData.sales,
            status: '',
            metrics: [
                {
                    ...dashboardPlaceholderData.sales.metrics[0],
                    value: formatCurrency(summary.todaySalesAmt, dashboardPlaceholderData.sales.metrics[0].value),
                },
                {
                    ...dashboardPlaceholderData.sales.metrics[1],
                    value: formatCurrency(summary.monthSalesAmt, dashboardPlaceholderData.sales.metrics[1].value),
                },
                {
                    ...dashboardPlaceholderData.sales.metrics[2],
                    value: formatCount(summary.todayPaidOrderCount, dashboardPlaceholderData.sales.metrics[2].value),
                },
                {
                    ...dashboardPlaceholderData.sales.metrics[3],
                    value: summary.popularCategory?.catNm || dashboardPlaceholderData.sales.metrics[3].value,
                }
            ]
        },
        members: {
            ...dashboardPlaceholderData.members,
            monthlyNewUsers: normalizeMonthlySeries(summary.monthlyNewUsers),
            metrics: [
                {
                    ...dashboardPlaceholderData.members.metrics[0],
                    value: formatCount(summary.memberStats?.totalCount, dashboardPlaceholderData.members.metrics[0].value, '명'),
                },
                {
                    ...dashboardPlaceholderData.members.metrics[1],
                    value: formatCount(summary.memberStats?.activeCount, dashboardPlaceholderData.members.metrics[1].value, '명'),
                },
                {
                    ...dashboardPlaceholderData.members.metrics[2],
                    value: formatCount(summary.memberStats?.withdrawnCount, dashboardPlaceholderData.members.metrics[2].value, '명'),
                }
            ]
        },
        orders: {
            ...dashboardPlaceholderData.orders,
            monthlyPaidOrders: normalizeMonthlySeries(summary.monthlyPaidOrders)
        },
        inquiries: {
            ...dashboardPlaceholderData.inquiries,
            metrics: [
                {
                    ...dashboardPlaceholderData.inquiries.metrics[0],
                    value: formatCount(summary.inquiryStats?.waitingCount, dashboardPlaceholderData.inquiries.metrics[0].value),
                },
                {
                    ...dashboardPlaceholderData.inquiries.metrics[1],
                    value: formatCount(summary.inquiryStats?.answeredCount, dashboardPlaceholderData.inquiries.metrics[1].value),
                },
                {
                    ...dashboardPlaceholderData.inquiries.metrics[2],
                    value: formatCount(summary.inquiryStats?.todayNewCount, dashboardPlaceholderData.inquiries.metrics[2].value),
                    basis: `기준일: ${new Date().toLocaleDateString('sv-SE')}`,
                },
                {
                    ...dashboardPlaceholderData.inquiries.metrics[3],
                    value: formatRate(Math.floor(Number(summary.inquiryStats?.answerRate || 0)), dashboardPlaceholderData.inquiries.metrics[3].value),
                }
            ]
        },
        productSalesTop5: {
            ...dashboardPlaceholderData.productSalesTop5,
            rows: Array.isArray(summary.productSalesTop5)
                ? summary.productSalesTop5.map((item, index) => ({
                    rank: `${index + 1}`,
                    productName: item.prdNm || '-',
                    category: item.catNm || '-',
                    paidQuantity: formatCount(item.paidQty, '-', '개'),
                    salesAmount: formatCurrency(item.salesAmt, '-')
                }))
                : dashboardPlaceholderData.productSalesTop5.rows
        }
    };
}

function createAdminProductDetailForm(product) {
    return {
        prdNm: product?.prdNm || '',
        brand: product?.brand || '',
        catCd: product?.catCd === null || product?.catCd === undefined ? '' : String(product.catCd),
        price: product?.price === null || product?.price === undefined ? '' : String(product.price),
        descTxt: product?.descTxt || '',
        dosTxt: product?.dosTxt || '',
        warnTxt: product?.warnTxt || '',
        useYn: product?.useYn || 'Y'
    };
}

function createAdminProductUpdatePayload(form) {
    return {
        prdNm: form?.prdNm || '',
        brand: form?.brand || '',
        catCd: form?.catCd === '' || form?.catCd === undefined ? null : Number(form.catCd),
        price: form?.price === '' || form?.price === undefined ? null : Number(form.price),
        descTxt: form?.descTxt || '',
        dosTxt: form?.dosTxt || '',
        warnTxt: form?.warnTxt || '',
        useYn: form?.useYn || ''
    };
}

function validateAdminProductUpdatePayload(payload) {
    if (!payload.prdNm.trim()
            || !payload.brand.trim()
            || payload.catCd === null
            || payload.price === null
            || Number.isNaN(payload.catCd)
            || Number.isNaN(payload.price)
            || payload.price < 0
            || !payload.descTxt.trim()
            || !payload.dosTxt.trim()
            || !payload.warnTxt.trim()
            || !['Y', 'N'].includes(payload.useYn)) {
        return '필수값을 확인해주세요.';
    }

    return '';
}

// 금액 값을 화면 표시 형식으로 변환한다.
function formatCurrency(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
        return fallback;
    }

    return `${numberValue.toLocaleString()}원`;
}

// 건수 값을 화면 표시 형식으로 변환한다.
function formatCount(value, fallback = '-', unit = '건') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
        return fallback;
    }

    return `${numberValue.toLocaleString()}${unit}`;
}

// 그래프용 숫자 값을 안전하게 변환한다.
function toSafeCount(value) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue < 0) {
        return 0;
    }

    return numberValue;
}

// 비율 값을 화면 표시 형식으로 변환한다.
function formatRate(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
        return fallback;
    }

    return `${numberValue}%`;
}

// 빈 값을 기본 표시값으로 변환한다.
function formatValue(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    return value;
}

// 여러 줄 텍스트를 화면 표시 요소로 변환한다.
function formatMultilineText(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value).split('\n').map((line, index) => (
        <span key={`${line}-${index}`}>
            {line || ' '}
        </span>
    ));
}

// 코드 값을 옵션 라벨로 변환한다.
function formatCode(value, options) {
    if (!value) {
        return '-';
    }

    return options.find((option) => option.value === value)?.label || value;
}

// FAQ 카테고리 코드를 라벨로 변환한다.
function formatFaqCategory(value) {
    if (!value) {
        return '-';
    }

    const categoryLabels = {
        ORDER: '주문',
        DELIVERY: '배송',
        PRODUCT: '상품',
        MEMBER: '회원',
        ETC: '기타'
    };

    return categoryLabels[value] || formatCode(value, adminCsFaqCategoryOptions);
}

// FAQ 카테고리 값을 코드로 변환한다.
function normalizeFaqCategoryCode(value) {
    const categoryCodes = {
        주문: 'ORDER',
        배송: 'DELIVERY',
        상품: 'PRODUCT',
        회원: 'MEMBER',
        기타: 'ETC'
    };

    return categoryCodes[value] || value || 'ORDER';
}

// 리뷰 평점을 화면 표시 형식으로 변환한다.
function formatRating(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return `${value}점`;
}

// 일시 값을 화면 표시 형식으로 변환한다.
function formatDateTime(value) {
    if (!value) {
        return '-';
    }

    return String(value).replace('T', ' ').slice(0, 16);
}

// 날짜 값을 점 구분 형식으로 변환한다.
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 월 값을 점 구분 형식으로 변환한다.
function formatMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
}

export default AdminPage;
