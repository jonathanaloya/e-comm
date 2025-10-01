import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import { handleAddItemCart } from '../store/cartProduct';
import toast from 'react-hot-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout

export const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Only set timers if user is logged in
    if (user?._id) {
      // Set warning timer
      warningRef.current = setTimeout(() => {
        toast.error('Your session will expire in 5 minutes due to inactivity', {
          duration: 10000,
          id: 'session-warning'
        });
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        // Clear localStorage
        localStorage.clear();
        // Clear Redux state
        dispatch(logout());
        dispatch(handleAddItemCart([]));
        // Show logout message
        toast.error('Session expired due to inactivity. Please login again.');
        // Redirect to login
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    }
  }, [dispatch, user]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Only set up session timeout if user is logged in
    if (user?._id) {
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
    } else {
      // Clear timers if user is not logged in
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    }
  }, [handleActivity, resetTimer, user]);

  return { resetTimer };
};
