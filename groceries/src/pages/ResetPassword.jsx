import React, { useEffect, useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import ReCaptcha from '../components/ReCaptcha'

function ResetPassword() {
    const location = useLocation()
    const navigate = useNavigate()

    const [data, setData] = useState({
      email : "",
      newPassword : "",
      confirmPassword : ""
    })

    const [ showPassword, setShowPassword ] = useState(false)
    const [ showConfirmPassword, setShowConfirmPassword ] = useState(false)
    const [ recaptchaToken, setRecaptchaToken ] = useState('')

    const validateValue = Object.values(data).every(el => el) && recaptchaToken

    useEffect(() => {
        if(!(location?.state?.data?.success)){
            navigate('/')
        }

        if(location?.state?.email){
          setData((prev )=>{
            return{
                ...prev,
                email : location?.state?.email
            }
          })
        }
    },[])

    const handleChange = (e) => {
      const { name, value } = e.target
      setData((prev )=>{ 
          return{
              ...prev, 
              [name]: value 
          }
      })
  }


    const handleSubmit = async(e) => {
      e.preventDefault()

      if(data.newPassword !== data.confirmPassword){
          toast.error('Passwords do not match')
          return
      }

      if(!recaptchaToken){
          toast.error('Please complete the reCAPTCHA verification')
          return
      }

      try {
          const response = await Axios({
              ...SummaryApi.resetPassword,
              data : { ...data, recaptchaToken }
          })
          if(response.data.error){
              toast.error(response.data.message)    
          }
          if(response.data.success){
              toast.success(response.data.message)
              navigate('/login')
              setData({
                  email: '',
                  newPassword: '',
                  confirmPassword: ''
              })
              setRecaptchaToken('')
              
          }

      } catch (error) {
          AxiosToastError(error)
      }

  }

  return (
    <section className='w-full container mx-auto px-8'>
            <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-6'>
                <p className='font-semibold text-2xl'>Enter Your Password</p>
                <form className='grid gap-4 py-4' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor="newPassword">Enter Password :</label>
                        <div className='bg-green-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                          <input type={showPassword ? "text" : "password"} id='password' name='newPassword' placeholder='Enter your new password' className='w-full outline-none' value={data.newPassword} onChange={handleChange}/>
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
                        <div className='bg-green-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                            <input type={showConfirmPassword ? "text" : "password"} id='password' name='confirmPassword' placeholder='conirm password' className='w-full outline-none' value={data.confirmPassword} onChange={handleChange}/>
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

                    <div className='grid gap-1'>
                        <ReCaptcha 
                            onVerify={setRecaptchaToken}
                            onExpired={() => setRecaptchaToken('')}
                            onError={() => setRecaptchaToken('')}
                        />
                    </div>
    
                    <button disabled={!validateValue} className={` ${validateValue ? 'bg-green-800 hover:bg-green-600' : 'bg-gray-500'} text-white p-2 rounded font-semibold my-3 tracking-wider`}>Change Password</button>
                </form>
    
                <p>
                    Already have account ?
                    <Link to={'/login'} className='text-green-700 hover:text-green-800 font-semibold'>Login</Link>
                </p>
            </div>
        </section>
  )
}

export default ResetPassword