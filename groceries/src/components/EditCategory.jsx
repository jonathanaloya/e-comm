import React, { useState } from 'react'
import {IoClose} from 'react-icons/io5'
import uploadImage from '../utils/uploadImage'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { set } from 'mongoose'

function EditCategory({close, fetchData, data : categoryData}) {
    const [ data, setData ] = useState({
        _id: categoryData._id,
        name: categoryData.name,
        Image: categoryData.Image
      })
    
      const [loading, setLoading] = useState(false)

    const handleOnChange = (e) => {
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
    
        try {
          setLoading(true)
          const response = await Axios({
            ...SummaryApi.updateCategory,
            data : data
          })
    
          const { data : responseData } = response
    
          if(responseData.success){
            toast.success(responseData.message)
            close()
            fetchData()
          }
        } catch (error) {
          AxiosToastError(error)
        } finally {
          setLoading(false)
        }
      }

    const handleUploadCategoryImage = async(e) => {
          const file = e.target.files[0]
      
          if(!file){
             return
            }
            setLoading(true)
            const response = await uploadImage(file)
            const { data : ImageResponse } = response
            
            setData((prev)=>{ 
              return{
                  ...prev, 
                  Image: ImageResponse.data.url
              }     
            })
            console.log(response)
    }
  return (
    <section className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 flex items-center justify-center'>
          <div className='bg-white max-w-4xl w-full p-4 rounded'>
            <div className='flex items-center justify-center'>
              <h1 className='font-semibold'>Update Category</h1>
              <button onClick={close} className='w-fit ml-auto block'>
                <IoClose size={25} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className='my- grid gap-2'>
              <div className='grid gap-1'>
                <label>Name</label>
                <input type="text" name='name' onChange={handleOnChange} id='categoryName' placeholder='Enter category name' value={data.name} className=' outline-none bg-green-50 border border-green-200 rounded p-2 focus-within:border-primary-200' />
              </div>
              <div className='grid gap-1'>
                <p>Image</p>
                <div className='flex flex-col gap-4 lg:flex-row items-center'>
                  <div className='border bg-green-50 h-36 w-full lg:w-36 flex items-center justify-center'>
                    {
                      data.Image ? (
                        <img alt='category' 
                        src={data.Image} 
                        className='h-full w-full object-scale-down'/>
                      ) : (
                        <p className='text-sm text-neutral-500'>No Image</p>
                      )
    
                    }
                    
                  </div>
                  <label htmlFor="uploadCategoryImage">
                  <div  className={`
                    ${!data.name ?  'bg-gray-200' : ' border-primary-200 hover:bg-primary-200 '} px-4 py-2 rounded cursor-pointer border font-medium`}>
                        {
                            loading ? 'Uploading...' : 'Upload Image'
                        }
                    </div>
                    <input disabled={!data.name} onChange={handleUploadCategoryImage} type="file" id='uploadCategoryImage' className='hidden'/>
                  </label>
                </div>
              </div>
    
              <button className={`${data.name && data.Image ? 'bg-gray-200' : ' bg-primary-100 '} px-4 py-2 rounded border font-semibold hover:bg-primary-200`}>
                Update Category
              </button>
            </form>
          </div>
    
        </section>
  )
}

export default EditCategory