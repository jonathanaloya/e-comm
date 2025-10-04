import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState, Suspense } from "react";
import fetchUserDetails from "./utils/fetchUserDetails";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import { setAllCategory, setAllSubCategory } from "./store/productSlice";
import Axios from "./utils/Axios";
import SummaryApi from "./common/SummaryApi";
import GlobalProvider from "./provider/GlobalProvider";
import CartMobileLink from "./components/CartMobile";
import FloatingHelpButton from "./components/FloatingHelpButton";
import InstallPrompt from "./components/InstallPrompt";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAutoLogout } from "./hooks/useAutoLogout";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Auto logout hook - automatically logs out inactive users
  useAutoLogout();

  const fetchUser = async () => {
    const userData = await fetchUserDetails();
    if (userData && userData.data) {
      dispatch(setUserDetails(userData.data));
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAllCategory(responseData.data));
      }
    } catch (error) {
    } finally {
    }
  };

  const fetchSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setAllSubCategory(responseData.data));
      }
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    // Always show UI after 100ms regardless of API status
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    const initializeApp = async () => {
      try {
        // Load data in background without blocking UI
        await Promise.all([fetchUser(), fetchCategory(), fetchSubCategory()]);
      } catch (error) {}
    };

    initializeApp();

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <GlobalProvider>
      <Header />
      <main className="min-h-[78vh]">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Toaster />
      {location.pathname !== "/checkout" && <CartMobileLink />}
      {/* Floating Help Button - Available on all pages */}
      <FloatingHelpButton />
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </GlobalProvider>
  );
}

export default App;
