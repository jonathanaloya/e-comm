import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useNavigate } from 'react-router-dom'

function ForgotPassword() {
    const [ data, setData ] = useState({
        email: ''
    })
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

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data : data
            })
            if(response.data.error){
                toast.error(response.data.message)    
            }
            if(response.data.success){
                toast.success(response.data.message)
                navigate('/otp-verification',{
                    state : data
                })
                setData({
                    email: ''
                })
                
            }

        } catch (error) {
            AxiosToastError(error)
        }

    }

  return (
    <section className='w-full container mx-auto px-8'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-6'>
            <p className='font-semibold text-2xl'>Forgot Password</p>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="email">Email :</label>
                    <input type="email" id='email' name='email' placeholder='Enter your email' className='bg-green-50 p-2 border rounded outline-none focus:border-primary-200' value={data.email} onChange={handleChange}/>
                </div>

                <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-2 rounded font-semibold my-3 tracking-wider`}>Submit</button>
            </form>

            <p>
                Already have account ?
                <Link to={'/login'} className='text-green-700 hover:text-green-800 font-semibold'>Login</Link>
            </p>
        </div>
    </section>
  )
}

export default ForgotPassword