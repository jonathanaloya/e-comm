import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";
import { refreshTokenIfNeeded } from './tokenManager';
import toast from 'react-hot-toast';

const Axios = axios.create({
    baseURL: baseURL,
    withCredentials : true
})

// Add a request interceptor
Axios.interceptors.request.use(
    async (config)=> {
    const accessToken = await refreshTokenIfNeeded() || localStorage.getItem('accesstoken')
    if (accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`
    }
     
    return config
  }, 
  (error) => {
    return Promise.reject(error)
  })

  Axios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      let originRequest = error.config

      if(error.response?.status === 401) {
        if (error.response?.data?.sessionExpired) {
          localStorage.removeItem('accesstoken')
          localStorage.removeItem('refreshToken')
          toast.error('Session expired. Please login again.')
          window.location.href = '/login'
          return Promise.reject(error)
        }
        
        if (!originRequest.retry) {
            originRequest.retry = true
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                const newAccessToken = refreshAccessToken(refreshToken)
                if (newAccessToken) {
                    originRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    return Axios(originRequest)
                }
            }
        }
      }

      return Promise.reject(error)
    }
  
)

const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers : {
                Authorization : `Bearer ${refreshToken}`
            }
        })
        const accessToken = response.data.data.accessToken
        localStorage.setItem('accesstoken', accessToken)
        return accessToken
    } catch (error) {
        console.log(error)
    }
}
export default Axios