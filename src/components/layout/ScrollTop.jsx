/* 페이지 이동 시 스크롤 최상단 이동 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollTop() {

    /* 현재 URL 경로 */
    const { pathname } = useLocation();

    /* 경로 변경 시 최상단 이동 */
    useEffect(() => {

        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });

    }, [pathname]);

    return null;
}

export default ScrollTop;