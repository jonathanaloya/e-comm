import React, { useState } from 'react'
import { FaRegUserCircle } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/summaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { updatedAvatar } from '../store/userSlice'
import { IoClose } from "react-icons/io5";


function UserProfileAvatar({close}) {
  const user = useSelector(state => state.user)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const handleUploadAvatarImage = async(e) => {
    const file = e.target.files[0]

    if(!file){
       return
      }
    const formData = new FormData()
    formData.append('avatar', file)

    setLoading(true)
    try {
      const response = await Axios({
        ...SummaryApi.uploadAvatar,
        data : formData
      })
      const { data : responseData }= response
      dispatch(updatedAvatar(responseData.data.avatar))
      console.log(response)

    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }

  }

  return (
    <section className='fixed top-0 left-0 bottom-0 right-0 bg-neutral-900 bg-opacity-40 p-4 flex justify-center items-center'>
        <div className='bg-white max-w-sm rounded w-full p-4 flex flex-col justify-center items-center'>
          <button onClick={close} className='text-neutral-800 w-fit block ml-auto'>
            <IoClose size={40}/>
          </button>
          <div className='w-20 h-20 flex justify-center items-center rounded-full'>
              {
                  user.avatar ? (
                      <img src={user.avatar} alt={user.name} className='w-full h-full overflow-hidden rounded-full drop-shadow-sm' />
                  ) : (
                      <FaRegUserCircle size={70} />
                  )
              }
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="uploadProfile">
              <div className='border border-primary-200 hover:bg-primary-200 rounded px-4 py-1 mt-2 text-sm cursor-pointer'>
                {
                  loading ? "Loading..." : "Upload"
                }
              </div>
              <input onChange={handleUploadAvatarImage} type="file" id="uploadProfile" className='hidden'/>
            </label>
          </form>
          
        </div>
    </section>
  )
}

export default UserProfileAvatar