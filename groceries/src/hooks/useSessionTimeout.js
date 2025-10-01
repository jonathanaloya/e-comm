import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import { handleAddItemCart } from '../store/cartProduct';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check session validity every 5 minutes

export const useSessionTimeout = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const sessionCheckRef = useRef(null);

  // Check if user is logged in (either Redux state or localStorage token)
  const isLoggedIn = user?._id || localStorage.getItem('accesstoken') || localStorage.getItem('token');

  console.log('useSessionTimeout: User state:', user);
  console.log('useSessionTimeout: Is logged in:', isLoggedIn);

  // Function to validate session with backend
  const validateSession = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      console.log('useSessionTimeout: Validating session with backend...');
      // Make a request to a protected endpoint to check if session is valid
      await Axios.get(SummaryApi.getUserDetails.url);
      console.log('useSessionTimeout: Session is valid');
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.sessionExpired) {
        console.log('useSessionTimeout: Session expired on backend, logging out...');
        // Clear localStorage
        localStorage.clear();
        // Clear Redux state
        dispatch(logout());
        dispatch(handleAddItemCart([]));
        // Show logout message
        toast.error('Your session has expired. Please login again.');
        // Redirect to login
        window.location.href = '/login';
      }
    }
  }, [dispatch, isLoggedIn]);

  const resetTimer = useCallback(() => {
    console.log('useSessionTimeout: Resetting timer, user logged in:', isLoggedIn);

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log('useSessionTimeout: Cleared existing timeout timer');
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      console.log('useSessionTimeout: Cleared existing warning timer');
    }
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
      console.log('useSessionTimeout: Cleared existing session check timer');
    }

    // Only set timers if user is logged in
    if (isLoggedIn) {
      console.log('useSessionTimeout: Setting up timers for logged in user');

      // Set warning timer
      warningRef.current = setTimeout(() => {
        console.log('useSessionTimeout: Showing warning toast');
        toast.error('Your session will expire in 5 minutes due to inactivity', {
          duration: 10000,
          id: 'session-warning'
        });
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        console.log('useSessionTimeout: Logging out due to inactivity');
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

      // Set periodic session validation
      sessionCheckRef.current = setInterval(() => {
        console.log('useSessionTimeout: Running periodic session validation');
        validateSession();
      }, SESSION_CHECK_INTERVAL);

      console.log('useSessionTimeout: Timers set successfully');
    } else {
      console.log('useSessionTimeout: User not logged in, not setting timers');
    }
  }, [dispatch, user, isLoggedIn]);

  const handleActivity = useCallback(() => {
    console.log('useSessionTimeout: User activity detected, resetting timer');
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    console.log('useSessionTimeout: useEffect triggered, user logged in:', isLoggedIn);

    // Only set up session timeout if user is logged in
    if (isLoggedIn) {
      console.log('useSessionTimeout: Setting up event listeners and timers');

      // Events that indicate user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

      // Add event listeners
      events.forEach(event => {
        console.log('useSessionTimeout: Adding event listener for:', event);
        document.addEventListener(event, handleActivity, true);
      });

      // Start the timer
      resetTimer();

      // Cleanup
      return () => {
        console.log('useSessionTimeout: Cleaning up event listeners and timers');
        events.forEach(event => {
          document.removeEventListener(event, handleActivity, true);
        });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
      };
    } else {
      console.log('useSessionTimeout: User not logged in, clearing timers');
      // Clear timers if user is not logged in
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
    }
  }, [handleActivity, resetTimer, user, isLoggedIn]);

  return { resetTimer };
};
