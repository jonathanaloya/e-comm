

export const baseURL = "https://freshkatale.com";


const SummaryApi = {
    csrfToken : {
        url : '/api/user/csrf-token',
        method : 'get'
    },
    register : {
        url : '/api/user/register',
        method : 'post'
    },
    verifyRegistrationOtp : {
        url : '/api/user/verify-registration-otp',
        method : 'post'
    },
    login : {
        url : '/api/user/login',
        method : 'post'
    },
    forgot_password : {
        url : '/api/user/forgot-password',
        method : 'put'
    },
    forgot_password_otp_vrification : {
        url : '/api/user/verify-forgot-password-otp',
        method : 'put'
    },
    resetPassword : {
        url : '/api/user/reset-password',
        method : 'put'
    },
    refreshToken : {
        url : '/api/user/refresh-token',
        method : 'post'
    },
    getUserLoginDetails : {
        url : '/api/user/user-details',
        method : 'get'
    },
    logout : {
        url : '/api/user/logout',
        method : 'get'
    },
    uploadAvatar : {
        url : '/api/user/upload-avatar',
        method : 'put'
    },
    updateUserDetails : {
        url : '/api/user/update-user',
        method : 'put'
    },
    addCategory : {
        url : '/api/category/add-category',
        method : 'post'
    },
    uploadImage : {
        url : '/api/file/upload-image',
        method : 'post'
    },
    getCategory : {
        url : '/api/category/get-category',
        method : 'get'
    },
    updateCategory : {
        url : '/api/category/update-category',
        method : 'put'
    },
    deleteCategory : {
        url : '/api/category/delete-category',
        method : 'delete'
    },
    createSubCategory : {
        url : '/api/subcategory/create',
        method : 'post'
    },
    getSubCategory : {
        url : '/api/subcategory/get',
        method : 'post'
    },
    updateSubCategory : {
        url : '/api/subcategory/update',
        method : 'put'
    },
    deleteSubCategory : {
        url : '/api/subcategory/delete',
        method : 'delete'
    },
    createProduct : {
        url : '/api/product/create',
        method : 'post'
    },
    getProduct : {
        url : '/api/product/get',
        method : 'post'
    },
    getProductByCategory : {
        url : '/api/product/get-product-by-category',
        method : 'post'
    },
    getProductByCategoryAndSubCategory : {
        url : '/api/product/get-product-by-category-and-subcategory',
        method : 'post'
    },
    getProductDetails : {
        url : '/api/product/get-product-details',
        method : 'post'
    },
    updateProduct : {
        url : '/api/product/update',
        method : 'put'
    },
    deleteProduct : {
        url : '/api/product/delete',
        method : 'delete'
    },
    searchProduct : {
        url : '/api/product/search',
        method : 'post'
    },
    addTocart : {
        url : "/api/cart/create",
        method : 'post'
    },
    getCartItem : {
        url : '/api/cart/get',
        method : 'get'
    },
    updateCartItemQty : {
        url : '/api/cart/update-qty',
        method : 'put'
    },
    deleteCartItem : {
        url : '/api/cart/delete-cart-item',
        method : 'delete'
    },
    createAddress : {
        url : '/api/address/create',
        method : 'post'
    },
    getAddress : {
        url : '/api/address/get',
        method : 'get'
    },
    updateAddress : {
        url : '/api/address/update',
        method : 'put'
    },
    disableAddress : {
        url : '/api/address/disable',
        method : 'delete'
    },
    CashOnDeliveryOrder : {
        url : "/api/order/cash-on-delivery",
        method : 'post'
    },
    payment_url : {
        url : "/api/order/checkout",
        method : 'post'
    },
    getOrderItems : {
        url : '/api/order/order-list',
        method : 'get'
    },
    createSupportTicket : {
        url : '/api/support/create-ticket',
        method : 'post'
    },

    getOrderTracking : {
        url : '/api/order/tracking',
        method : 'get'
    }
}

export default SummaryApi