import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes

export const useAutoLogout = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector(state => state.auth);
    const timeoutRef = useRef(null);

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        if (isAuthenticated) {
            timeoutRef.current = setTimeout(() => {
                dispatch(logout());
                alert('Admin session expired due to inactivity');
            }, INACTIVITY_TIME);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        resetTimer();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isAuthenticated]);
};