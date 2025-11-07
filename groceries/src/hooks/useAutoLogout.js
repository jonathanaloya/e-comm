import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import toast from 'react-hot-toast';

const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 25 * 60 * 1000; // 25 minutes (5 min warning)

export const useAutoLogout = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const isAuthenticated = user._id;
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);

    const handleLogout = (reason = 'inactivity') => {
        dispatch(logout());
        localStorage.clear();
        
        if (reason === 'inactivity') {
            toast.error('Session expired due to inactivity. Please login again.');
        } else {
            toast.error('Session expired. Please login again.');
        }
        
        // Force page reload to reset all state
        window.location.href = '/login';
    };

    const handleSessionExpired = () => {
        handleLogout('expired');
    };

    const showWarning = () => {
        toast('Your session will expire in 5 minutes due to inactivity', {
            duration: 10000,
            icon: '⚠️'
        });
    };

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
        }
        
        if (isAuthenticated) {
            // Set warning timer (5 minutes before logout)
            warningRef.current = setTimeout(showWarning, WARNING_TIME);
            
            // Set logout timer (30 minutes)
            timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIME);
        }
    };

    useEffect(() => {
        // Listen for session expiry from API calls
        window.addEventListener('session-expired', handleSessionExpired);
        
        if (!isAuthenticated) {
            return () => {
                window.removeEventListener('session-expired', handleSessionExpired);
            };
        }

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        resetTimer();

        return () => {
            window.removeEventListener('session-expired', handleSessionExpired);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningRef.current) {
                clearTimeout(warningRef.current);
            }
        };
    }, [isAuthenticated]);
};