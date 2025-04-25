import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/summaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useNavigate } from 'react-router-dom'
import fetchUserDetails from '../utils/fetchUserDetails'
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../store/userSlice'

function Login() {
    const [ data, setData ] = useState({
        email: '',
        password: ''
    })

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

    const validateValue = Object.values(data).every(el => el)
    const handleSubmit = async(e) => {
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : data
            })
            if(response.data.error){
                toast.error(response.data.message)    
            }
            if(response.data.success){
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

        } catch (error) {
            AxiosToastError(error)
        }

    }

  return (
    <section className='w-full container mx-auto px-8'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-6'>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="email">Email :</label>
                    <input type="email" id='email' name='email' placeholder='Enter your email' className='bg-green-50 p-2 border rounded outline-none focus:border-primary-200' value={data.email} onChange={handleChange}/>
                </div>
                <div className='grid gap-1'>
                    <label htmlFor="password">password :</label>
                    <div className='bg-green-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                        <input type={showPassword ? "text" : "password"} id='password' name='password' placeholder='Enter your password' className='w-full outline-none' value={data.password} onChange={handleChange}/>
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

                <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-2 rounded font-semibold my-3 tracking-wider`}>Login</button>
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