import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
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
            }
        ],
    },
])

export default router