import React, { useEffect, useState } from 'react'
import { FaRegUserCircle } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import UserProfileAvatar from '../components/UserProfileAvatar'
import SummaryApi from '../common/summaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import toast from 'react-hot-toast'
import { setUserDetails } from '../store/userSlice'
import fetchUserDetails from '../utils/fetchUserDetails'

const Profile = () => {
    const user = useSelector(state => state.user)
    const [openProfileAvatar, setOpenProfileAvatar] = useState(false)
    const [userData, setUserData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile
    })

    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        setUserData({
            name: user.name,
            email: user.email,
            mobile: user.mobile
        })
    }, [user])

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setUserData((prev) => 
        {
            return{
                ...prev,
                [name]: value
            }
        })
    }

    const handleSubmit = async(e) => {
        e.preventDefault()

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data : userData
            })

            const { data : responseData }= response

            if(responseData.success){
                toast.success(responseData.message)
                const userData = await fetchUserDetails()
                    dispatch(setUserDetails(userData.data))
            }

        } catch (error) {
            AxiosToastError(false)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div>
        {/** Profile Upload and display image */}
        <div className='w-20 h-20 bg-red-500 flex justify-center items-center rounded-full'>
            {
                user.avatar ? (
                    <img src={user.avatar} alt={user.name} className='w-full h-full overflow-hidden rounded-full drop-shadow-sm' />
                ) : (
                    <FaRegUserCircle size={70} />
                )
            }
        </div>
        <button onClick={() => setOpenProfileAvatar(true)} className='text-sm border px-3 py-1 mt-4 rounded-full border-primary-200 hover:bg-primary-100'>Edit Profile</button>

        {
            openProfileAvatar && (<UserProfileAvatar close={() => setOpenProfileAvatar(false)}/>)
        }

        {/** name, mobile, email, change password */}
        <form className='my-4 grid gap-4' onSubmit={handleSubmit}>
            <div className='grid'>
                <label>Name</label>
                <input type="text" placeholder='Enter your name' className='p-2 bg-green-50 outline-none border focus-within:border-primary-200 rounded' 
                value={userData.name}
                name='name'
                onChange={handleOnChange}
                required/>
            </div>
            <div className='grid'>
                <label htmlFor='email'>Email</label>
                <input type="email" id='email' placeholder='Enter your email' className='p-2 bg-green-50 outline-none border focus-within:border-primary-200 rounded' 
                value={userData.email}
                name='email'
                onChange={handleOnChange}
                required/>
            </div>
            <div className='grid'>
                <label htmlFor='mobile'>Mobile</label>
                <input type="text" placeholder='Enter your mobile number' className='p-2 bg-green-50 outline-none border focus-within:border-primary-200 rounded' 
                value={userData.mobile || ""}
                name='mobile'
                onChange={handleOnChange}
                required/>
            </div>

            <button className='border px-4 py-2 rounded border-primary-100 hover:bg-primary-200 text-primary-200 hover:text-neutral-800 font-semibold' >
                {
                    loading ? "Loading..." : "Submit"
                }
            </button>
        </form>

    </div>
  )
}

export default Profile