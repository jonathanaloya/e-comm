import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function EmailVerification() {
    const [ data, setData ] = useState(["","","","","",""])
    const navigate = useNavigate()
    const inputRef = useRef([])
    const location = useLocation()

    useEffect(() => {
        if(!location?.state?.email){
            navigate('/register')
        }
    },[])

    const validateValue = data.every(el => el)
    const handleSubmit = async(e) => {
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.verifyRegistrationOtp,
                data : {
                    otp : data.join(""),
                    email : location?.state?.email
                }
            })
            if(response.data.error){
                toast.error(response.data.message)    
            }
            if(response.data.success){
                toast.success(response.data.message)
                setData(["","","","","",""])
                navigate('/login')
            }

        } catch (error) {
            AxiosToastError(error)
        }

    }

  return (
    <section className='w-full container mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='bg-white my-4 w-full max-w-md sm:max-w-lg mx-auto rounded-lg shadow-md p-4 sm:p-6'>
            <p className='font-semibold text-2xl'>Verify Your Email</p>
            <p className='text-sm text-gray-600 mt-2'>
                We've sent a verification code to <strong>{location?.state?.email}</strong>
            </p>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="otp">Enter Verification Code :</label>
                    <div className='flex items-center gap-1 justify-between mt-3'>
                        {
                            data.map((element, index) => {
                                return (
                                    <input 
                                    key={"otp"+index} 
                                    type="text" 
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    id='otp'
                                    ref = {(ref) =>{ 
                                        inputRef.current[index] = ref
                                        return ref
                                    }}
                                    value={data[index]} 
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '')
                                        const newData = [...data]
                                        newData[index] = value
                                        setData(newData)

                                        if(value && index < 5){
                                            inputRef.current[index+1].focus()
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if(e.key === 'Backspace' && !data[index] && index > 0){
                                            inputRef.current[index-1].focus()
                                        }
                                    }}
                                    maxLength={1} className='bg-green-50 w-full max-w-16 p-2 border rounded outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-center font-semibold'/>
                                )
                            })
                        }
                    </div>
                </div>

                <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-3 rounded-lg font-semibold my-4 tracking-wider w-full text-base transition-colors`}>Verify Email</button>
            </form>

            <p>
                Back to 
                <Link to={'/register'} className='text-green-700 hover:text-green-800 font-semibold'> Register</Link>
            </p>
        </div>
    </section>
  )
}

export default EmailVerification