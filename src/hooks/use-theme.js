import { useState, useEffect, useCallback } from 'react';
export function useTheme() {
    const [theme, setTheme] = useState(() => {
        // Lấy theme từ localStorage hoặc mặc định là 'light'
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme)
                return savedTheme;
            // Kiểm tra system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });
    useEffect(() => {
        const root = window.document.documentElement;
        // Thêm transition class trước khi đổi theme
        root.classList.add('theme-transition');
        // Xóa class cũ và thêm class mới
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Lưu vào localStorage
        localStorage.setItem('theme', theme);
        // Xóa transition class sau animation
        const timeout = setTimeout(() => {
            root.classList.remove('theme-transition');
        }, 300);
        return () => clearTimeout(timeout);
    }, [theme]);
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);
    const setLightTheme = useCallback(() => setTheme('light'), []);
    const setDarkTheme = useCallback(() => setTheme('dark'), []);
    return {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setTheme,
    };
}
