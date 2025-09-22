import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import fetchUserDetails from '../utils/fetchUserDetails'
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../store/userSlice'

function LoginOtpVerification() {
    const [ data, setData ] = useState(["","","","","",""])
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const inputRef = useRef([])
    const location = useLocation()

    useEffect(() => {
        if(!location?.state?.email){
            navigate('/login')
        }
    },[])

    const validateValue = data.every(el => el)
    const handleSubmit = async(e) => {
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.login,
                data : {
                    email: location?.state?.email,
                    otp : data.join("")
                }
            })
            if(response.data.error){
                toast.error(response.data.message)    
            }
            if(response.data.success){
                toast.success('Login successful!')
                localStorage.setItem('accesstoken', response.data.data.accesstoken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData(["","","","","",""])
                navigate('/')
            }

        } catch (error) {
            AxiosToastError(error)
        }

    }

  return (
    <section className='w-full container mx-auto px-8'>
        <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-6'>
            <p className='font-semibold text-2xl'>Enter Login Code</p>
            <p className='text-sm text-gray-600 mt-2'>
                We've sent a login code to <strong>{location?.state?.email}</strong>
            </p>
            <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                <div className='grid gap-1'>
                    <label htmlFor="otp">Enter Login Code :</label>
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
                                    maxLength={1} className='bg-green-50 w-full max-w-16 p-2 border rounded outline-none focus:border-primary-200 text-center font-semibold'/>
                                )
                            })
                        }
                    </div>
                </div>

                <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-2 rounded font-semibold my-3 tracking-wider`}>Verify & Login</button>
            </form>

            <p>
                Back to 
                <Link to={'/login'} className='text-green-700 hover:text-green-800 font-semibold'> Login</Link>
            </p>
        </div>
    </section>
  )
}

export default LoginOtpVerification