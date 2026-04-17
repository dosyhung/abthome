import { useState, useEffect, useRef } from 'react';

/**
 * Hook theo dõi hoạt động của người dùng
 * @param {Function} onIdle - Hàm được gọi khi người dùng không hoạt động sau thời gian cấu hình
 * @param {number} idleTime - Thời gian rảnh rỗi (mặc định 5 phút = 300,000 ms)
 */
const useIdleTimeout = (onIdle, idleTime = 5 * 60 * 1000) => {
    const timeoutIdRef = useRef(null);

    const handleTimeout = () => {
        if (typeof onIdle === 'function') {
            onIdle();
        }
    };

    const resetTimeout = () => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }
        timeoutIdRef.current = setTimeout(handleTimeout, idleTime);
    };

    useEffect(() => {
        // Cài đặt timeout lần đầu tiên
        resetTimeout();

        // Danh sách các sự kiện tương tác để reset giờ
        const events = [
            'mousemove',
            'mousedown',
            'keypress',
            'DOMMouseScroll',
            'mousewheel',
            'touchmove',
            'MSPointerMove',
            'scroll'
        ];

        // Lắng nghe sự kiện
        events.forEach((event) => window.addEventListener(event, resetTimeout));

        // Dọn dẹp listener khi component bị unmount
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
            events.forEach((event) => window.removeEventListener(event, resetTimeout));
        };
    }, [idleTime, onIdle]); // Re-run effect nếu cấu hình thay đổi

    return { resetTimeout };
};

export default useIdleTimeout;
