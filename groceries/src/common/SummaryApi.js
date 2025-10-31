

export const baseURL = "https://freshkatale.com/api";


const SummaryApi = {
    csrfToken : {
        url : '/user/csrf-token',
        method : 'get'
    },
    register : {
        url : '/user/register',
        method : 'post'
    },
    verifyRegistrationOtp : {
        url : '/user/verify-registration-otp',
        method : 'post'
    },
    login : {
        url : '/user/login',
        method : 'post'
    },
    forgot_password : {
        url : '/user/forgot-password',
        method : 'put'
    },
    forgot_password_otp_vrification : {
        url : '/user/verify-forgot-password-otp',
        method : 'put'
    },
    resetPassword : {
        url : '/user/reset-password',
        method : 'put'
    },
    refreshToken : {
        url : '/user/refresh-token',
        method : 'post'
    },
    getUserLoginDetails : {
        url : '/user/user-details',
        method : 'get'
    },
    logout : {
        url : '/user/logout',
        method : 'get'
    },
    uploadAvatar : {
        url : '/user/upload-avatar',
        method : 'put'
    },
    updateUserDetails : {
        url : '/user/update-user',
        method : 'put'
    },
    addCategory : {
        url : '/category/add-category',
        method : 'post'
    },
    uploadImage : {
        url : '/file/upload-image',
        method : 'post'
    },
    getCategory : {
        url : '/category/get-category',
        method : 'get'
    },
    updateCategory : {
        url : '/category/update-category',
        method : 'put'
    },
    deleteCategory : {
        url : '/category/delete-category',
        method : 'delete'
    },
    createSubCategory : {
        url : '/subcategory/create',
        method : 'post'
    },
    getSubCategory : {
        url : '/subcategory/get',
        method : 'post'
    },
    updateSubCategory : {
        url : '/subcategory/update',
        method : 'put'
    },
    deleteSubCategory : {
        url : '/subcategory/delete',
        method : 'delete'
    },
    createProduct : {
        url : '/product/create',
        method : 'post'
    },
    getProduct : {
        url : '/product/get',
        method : 'post'
    },
    getProductByCategory : {
        url : '/product/get-product-by-category',
        method : 'post'
    },
    getProductByCategoryAndSubCategory : {
        url : '/product/get-product-by-category-and-subcategory',
        method : 'post'
    },
    getProductDetails : {
        url : '/product/get-product-details',
        method : 'post'
    },
    updateProduct : {
        url : '/product/update',
        method : 'put'
    },
    deleteProduct : {
        url : '/product/delete',
        method : 'delete'
    },
    searchProduct : {
        url : '/product/search',
        method : 'post'
    },
    addTocart : {
        url : "/cart/create",
        method : 'post'
    },
    getCartItem : {
        url : '/cart/get',
        method : 'get'
    },
    updateCartItemQty : {
        url : '/cart/update-qty',
        method : 'put'
    },
    deleteCartItem : {
        url : '/cart/delete-cart-item',
        method : 'delete'
    },
    createAddress : {
        url : '/address/create',
        method : 'post'
    },
    getAddress : {
        url : '/address/get',
        method : 'get'
    },
    updateAddress : {
        url : '/address/update',
        method : 'put'
    },
    disableAddress : {
        url : '/address/disable',
        method : 'delete'
    },
    CashOnDeliveryOrder : {
        url : "/order/cash-on-delivery",
        method : 'post'
    },
    payment_url : {
        url : "/order/checkout",
        method : 'post'
    },
    getOrderItems : {
        url : '/order/order-list',
        method : 'get'
    },
    createSupportTicket : {
        url : '/support/create-ticket',
        method : 'post'
    },
    getUserSupportTickets : {
        url : '/user/support-tickets',
        method : 'get'
    },
    getUserSupportTicketDetails : {
        url : '/user/support-tickets',
        method : 'get'
    },

    getOrderTracking : {
        url : '/order/tracking',
        method : 'get'
    }
}

export default SummaryApi