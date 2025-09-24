import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useNavigate } from 'react-router-dom'
import fetchUserDetails from '../utils/fetchUserDetails'
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../store/userSlice'
import ReCaptcha from '../components/ReCaptcha'

function Login() {
    const [ data, setData ] = useState({
        email: '',
        password: ''
    })
    const [ recaptchaToken, setRecaptchaToken ] = useState('')

    const [ showPassword, setShowPassword ] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const handleChange = (e) => {
        const { name, value } = e.target
        setData((prev )=>{ 
            return{
                ...prev, 
                [name]: value 
            }
        })
    }

    const validateValue = Object.values(data).every(el => el) && recaptchaToken
    const handleSubmit = async(e) => {
        e.preventDefault()

        if(!recaptchaToken){
            toast.error('Please complete the reCAPTCHA verification')
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : { ...data, recaptchaToken }
            })

            if(response.data.error){
                toast.error(response.data.message)    
            }
            if(response.data.success){
                if(response.data.requiresTwoFactor){
                    toast.success(response.data.message)
                    navigate('/login-otp-verification', {
                        state: { email: data.email }
                    })
                    setData({
                        email: '',
                        password: '',
                    })
                    setRecaptchaToken('')
                } else {
                    toast.success(response.data.message)
                    localStorage.setItem('accesstoken', response.data.data.accesstoken)
                    localStorage.setItem('refreshToken', response.data.data.refreshToken)

                    const userDetails = await fetchUserDetails()
                    dispatch(setUserDetails(userDetails.data))

                    setData({
                        email: '',
                        password: '',
                    })
                    navigate('/')
                }
            }

        } catch (error) {
            AxiosToastError(error)
        }

    }

  return (
    <section className='w-full container mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='bg-white my-4 w-full max-w-md sm:max-w-lg mx-auto rounded-lg shadow-md p-4 sm:p-6'>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="email">Email :</label>
                    <input type="email" id='email' name='email' placeholder='Enter your email' className='bg-green-50 p-3 border rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 w-full text-base' value={data.email} onChange={handleChange}/>
                </div>
                <div className='grid gap-1'>
                    <label htmlFor="password">password :</label>
                    <div className='bg-green-50 p-3 border rounded-lg flex items-center focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200'>
                        <input type={showPassword ? "text" : "password"} id='password' name='password' placeholder='Enter your password' className='w-full outline-none text-base bg-transparent' value={data.password} onChange={handleChange}/>
                        <div onClick={() => setShowPassword(preve => !preve)} className='cursor-pointer'>
                            {
                                showPassword ? (
                                    <FaRegEye size={20} />
                                ) : (
                                    <FaRegEyeSlash size={20} />
                                )
                            }
                        </div>
                    </div>
                    <Link to={'/forgot-password'} className='text-green-700 block ml-auto hover:text-green-800 font-semibold text-sm'>Forgot Password ?</Link>
                </div>

                <div className='grid gap-1'>
                    <ReCaptcha 
                        onVerify={setRecaptchaToken}
                        onExpired={() => setRecaptchaToken('')}
                        onError={() => setRecaptchaToken('')}
                    />
                </div>

                <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-3 rounded-lg font-semibold my-4 tracking-wider w-full text-base transition-colors`}>Login</button>
            </form>

            <p>
                Don't have an account ?
                <Link to={'/register'} className='text-green-700 hover:text-green-800 font-semibold'>Register</Link>
            </p>
        </div>
    </section>
  )
}

export default Login