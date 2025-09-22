import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import toast from 'react-hot-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout

export const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      toast.error('Your session will expire in 5 minutes due to inactivity', {
        duration: 10000,
        id: 'session-warning'
      });
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      dispatch(logout());
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      toast.error('Session expired due to inactivity. Please login again.');
      window.location.href = '/login';
    }, INACTIVITY_TIMEOUT);
  }, [dispatch]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [handleActivity, resetTimer]);

  return { resetTimer };
};