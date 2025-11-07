import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUserDetails } from '../store/userSlice';
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

  // Function to validate session with backend
  const validateSession = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      // Make a request to a protected endpoint to check if session is valid
      const response = await Axios({
        ...SummaryApi.getUserLoginDetails
      });
      
      // If successful, update user details in Redux
      if (response.data.success && response.data.data) {
        dispatch(setUserDetails(response.data.data));
      }
    } catch (error) {
      // Session is invalid - force logout
      console.log('Session validation failed - forcing logout');
      forceLogout('Session expired');
    }
  }, [isLoggedIn]);

  const forceLogout = (reason = 'Session expired') => {
    console.log('Forcing logout:', reason);
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear Redux state
    dispatch(logout());
    dispatch(handleAddItemCart([]));
    
    // Show message and redirect
    toast.error(reason + '. Please login again.');
    window.location.href = '/login';
  };

  const resetTimer = useCallback(() => {

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
    }

    // Only set timers if user is logged in
    if (isLoggedIn) {

      // Set warning timer
      warningRef.current = setTimeout(() => {
        toast.error('Your session will expire in 5 minutes due to inactivity', {
          duration: 10000,
          id: 'session-warning'
        });
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer
      timeoutRef.current = setTimeout(() => {
        forceLogout('Session expired due to inactivity');
      }, INACTIVITY_TIMEOUT);

      // Set periodic session validation
      sessionCheckRef.current = setInterval(() => {
        validateSession();
      }, SESSION_CHECK_INTERVAL);

    } else {
    }
  }, [dispatch, user, isLoggedIn]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {

    // Only set up session timeout if user is logged in
    if (isLoggedIn) {

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
        if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
      };
    } else {
      // Clear timers if user is not logged in
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
    }
  }, [handleActivity, resetTimer, user, isLoggedIn]);

  return { resetTimer };
};
