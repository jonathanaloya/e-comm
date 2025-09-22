import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import EmailVerification from "../pages/EmailVerification";
import ResetPassword from "../pages/ResetPassword";
import MobileUserMenu from "../pages/MobileUserMenu";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/Profile";
import MyOrder from "../pages/MyOrder";
import Address from "../pages/Address";
import ProductAdmin from "../pages/ProductAdmin";
import UploadProduct from "../pages/UploadProduct";
import SubCategory from "../pages/SubCategory";
import Category from "../pages/Category";
import AdminPermission from "../layouts/AdminPermission";
import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import CartMobile from "../pages/CartMobile";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import Cancel from "../pages/Cancel";
import FAQ from "../pages/FAQ";
import ContactSupport from "../pages/ContactSupport";



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
                path:"dashboard",
                element: <Dashboard />,
                children: [
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
                        path: "category",
                        element: <AdminPermission ><Category /></AdminPermission>
                    },
                    {
                        path: "subcategory",
                        element: <AdminPermission ><SubCategory /></AdminPermission>
                    },
                    {
                        path: "upload-product",
                        element: <AdminPermission ><UploadProduct /></AdminPermission>
                    },
                    {
                        path: "product",
                        element: <AdminPermission ><ProductAdmin /></AdminPermission>
                    }
                ]
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
                element : <CartMobile/>
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
            }
        ],
    },
])

export default router