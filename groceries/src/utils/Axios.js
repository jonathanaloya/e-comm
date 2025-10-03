import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";
import { refreshTokenIfNeeded } from "./tokenManager";
import toast from "react-hot-toast";
import { logout } from "../store/userSlice";
import { handleAddItemCart } from "../store/cartProduct";
import { setOrder } from "../store/orderSlice";
import store from "../store";

// CSRF token management
let csrfToken = null;

// Create a basic axios instance for CSRF token fetching (before Axios is fully defined)
const basicAxios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

const fetchCSRFToken = async () => {
  try {
    const response = await basicAxios.get(SummaryApi.csrfToken.url);
    if (response.data.success) {
      csrfToken = response.data.csrfToken;
      sessionStorage.setItem("csrfToken", csrfToken);
      return csrfToken;
    }
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
  }
  return null;
};

const getCSRFToken = async () => {
  // Try to get from memory first
  if (csrfToken) return csrfToken;

  // Try to get from sessionStorage
  csrfToken = sessionStorage.getItem("csrfToken");
  if (csrfToken) return csrfToken;

  // Fetch new token
  return await fetchCSRFToken();
};

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Add a request interceptor
Axios.interceptors.request.use(
  async (config) => {
    const accessToken =
      (await refreshTokenIfNeeded()) || localStorage.getItem("accesstoken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add CSRF protection for non-GET requests
    if (config.method !== "get") {
      const token = await getCSRFToken();
      if (token) {
        config.headers["x-csrf-token"] = token;
      }
    }

    config.headers["X-Requested-With"] = "XMLHttpRequest";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    let originRequest = error.config;

    // Handle CSRF token errors
    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "Invalid CSRF token"
    ) {
      csrfToken = null;
      sessionStorage.removeItem("csrfToken");

      if (!originRequest._csrfRetry) {
        originRequest._csrfRetry = true;
        const newToken = await getCSRFToken();
        if (newToken) {
          originRequest.headers["x-csrf-token"] = newToken;
        }
        return Axios(originRequest);
      }
    }

    if (error.response?.status === 401) {
      if (error.response?.data?.sessionExpired) {
        // Call backend logout to clear cookies/session
        try {
          await Axios.get("/api/user/logout");
        } catch (e) {}
        // Clear Redux state
        store.dispatch(logout());
        store.dispatch(handleAddItemCart([]));
        store.dispatch(setOrder([]));
        // Clear all auth data securely
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = "accessToken=; Max-Age=0; path=/;";
        document.cookie = "refreshToken=; Max-Age=0; path=/;";
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (!originRequest.retry) {
        originRequest.retry = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            originRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return Axios(originRequest);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    const accessToken = response.data.data.accessToken;
    localStorage.setItem("accesstoken", accessToken);
    return accessToken;
  } catch (error) {
    console.log(error);
  }
};
export default Axios;
