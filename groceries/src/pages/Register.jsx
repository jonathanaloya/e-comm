import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'

function Register() {
    const [ data, setData ] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [ showPassword, setShowPassword ] = useState(false)
    const [ showConfirmPassword, setShowConfirmPassword ] = useState(false)
    const navigate = useNavigate()
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

        if(data.password !== data.confirmPassword){
            toast.error('Passwords do not match')
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data : data
            })

            if(response.data.error){
                // Check if there are specific validation errors
                if (response.data.errors && response.data.errors.length > 0) {
                    // Display the first validation error
                    toast.error(response.data.errors[0])
                } else {
                    // Fallback to generic message
                    toast.error(response.data.message)
                }
            }
            if(response.data.success){
                toast.success(response.data.message)
                navigate('/login')
                setData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                })
            }

        } catch (error) {
            AxiosToastError(error)
        }

    }

  return (
    <section className='w-full container mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='bg-white my-4 w-full max-w-md sm:max-w-lg mx-auto rounded-lg shadow-md p-4 sm:p-6'>
            <p>Welcome to Fresh Katale</p>

            <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="name">Name :</label>
                    <input type="text" id='name' placeholder='Enter your name' autoFocus name='name' className='bg-green-50 p-3 border rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 w-full text-base' value={data.name} onChange={handleChange}/>
                </div>
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
                </div>
                <div className='grid gap-1'>
                    <label htmlFor="confirmPassword">Confirm Password :</label>
                    <div className='bg-green-50 p-3 border rounded-lg flex items-center focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200'>
                        <input type={showConfirmPassword ? "text" : "password"} id='confirmPassword' name='confirmPassword' placeholder='Please Confirm Password' className='w-full outline-none text-base bg-transparent' value={data.confirmPassword} onChange={handleChange}/>
                        <div onClick={() => setShowConfirmPassword(preve => !preve)} className='cursor-pointer'>
                            {
                                showConfirmPassword ? (
                                    <FaRegEye size={20} />
                                ) : (
                                    <FaRegEyeSlash size={20} />
                                )
                            }
                        </div>
                    </div>
                </div>

                <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-3 rounded-lg font-semibold my-4 tracking-wider w-full text-base transition-colors`}>Register</button>
            </form>

            <p>
                Already have an account ?
                <Link to={'/login'} className='text-green-700 hover:text-green-800 font-semibold'>Login</Link>
            </p>
        </div>
    </section>
  )
}

export default Register