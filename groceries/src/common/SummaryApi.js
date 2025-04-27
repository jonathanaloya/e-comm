
export const baseURL = "http://localhost:5000"

const SummaryApi = {
    register : {
        url : '/api/user/register',
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
    }
}

export default SummaryApi