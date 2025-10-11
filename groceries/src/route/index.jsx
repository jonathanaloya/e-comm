import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import EmailVerification from "../pages/EmailVerification";
import LoginOtpVerification from "../pages/LoginOtpVerification";
import ResetPassword from "../pages/ResetPassword";
import MobileUserMenu from "../pages/MobileUserMenu";
import Profile from "../pages/Profile";
import MyOrder from "../pages/MyOrder";
import Address from "../pages/Address";
import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import Cart from "../pages/Cart";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import FAQ from "../pages/FAQ";
import ContactSupport from "../pages/ContactSupport";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import OrderTracking from "../pages/OrderTracking";
import AboutUs from "../pages/AboutUs";



const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: "search",
                element: <SearchPage />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "login-otp-verification",
                element: <LoginOtpVerification />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "email-verification",
                element: <EmailVerification />
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "/otp-verification",
                element: <OtpVerification />
            },
            {
                path:"reset-password",
                element: <ResetPassword />
            },
            {
                path:"user",
                element: <MobileUserMenu />
            },
            {
                path: "profile",
                element: <Profile />
            },
            {
                path: "myorders",
                element: <MyOrder />
            },
            {
                path: "address",
                element: <Address />
            },
            {
                path : ":category",
                children : [
                    {
                        path : ":subCategory",
                        element : <ProductListPage/>
                    }
                ]
            },
            {
                path : "product/:product",
                element : <ProductDisplayPage/>
            },
            {
                path : 'cart',
                element : <Cart/>
            },
            {
                path : "checkout",
                element : <CheckoutPage/>
            },
            {
                path : "success",
                element : <Success/>
            },
            {
                path : "cancel",
                element : <Cancel/>
            },
            {
                path: "faq",
                element: <FAQ/>
            },
            {
                path: "contact-support",
                element: <ContactSupport/>
            },
            {
                path: "privacy-policy",
                element: <PrivacyPolicy/>
            },
            {
                path: "terms-of-service",
                element: <TermsOfService/>
            },
            {
                path: "track-order/:orderId",
                element: <OrderTracking/>
            },
            {
                path: "about-us",
                element: <AboutUs/>
            }
        ],
    },
])

export default router