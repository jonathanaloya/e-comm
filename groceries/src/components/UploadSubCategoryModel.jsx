import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import uploadImage from '../utils/uploadImage'
import { useSelector } from 'react-redux'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

function UploadSubCategoryModel({close, fetchData}) {
    const [subCategoryData, setSubCategoryData] = useState({
        name: '',
        Image: '',
        category: []
    })

    const allCategory = useSelector(state => state.product.allCategory)

    const handleChange = (e) => {
        const { name, value } = e.target
        setSubCategoryData((prev )=>{ 
            return{
                ...prev, 
                [name]: value 
            }
        })
    }

    const handleUploadSubCategoryImage = async(e) => {
        const file = e.target.files[0]
        if(!file){
            return
        }
        const response = await uploadImage(file)
            const { data : ImageResponse } = response
            setSubCategoryData((prev)=>{ 
                return{
                    ...prev, 
                    Image: ImageResponse.data.url
                }     
              })
    }

    const handleRemoveCategory = (categoryId) => {
        const index = subCategoryData.category.findIndex(el => el._id === categoryId)
        subCategoryData.category.splice(index, 1)
        setSubCategoryData({...subCategoryData})
    }

    const handleSubmitSubCategory = async(e) => {
        e.preventDefault()
        try {
            const response = await Axios({
                ...SummaryApi.createSubCategory,
                data : subCategoryData
            })
            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                }
                if(fetchData){
                    fetchData()
                }
                
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

  return (
    <section className='fixed top-0 left-0 right-0 bottom-0 bg-neutral-800 bg-opacity-50 z-50 flex justify-center items-center'>
        <div className='w-full max-w-5xl bg-white p-4 rounded'>
            <div className='flex justify-between items-center gap-3'>
                <h1 className='font-semibold'>Add Sub Category</h1>
                <button onClick={close}>
                    <IoClose size={25}/>
                </button>
            </div>
            <form className='my-3 grid gap-3' onSubmit={handleSubmitSubCategory}>
                <div className='grid gap-1'>
                    <label htmlFor='name'> Name</label>
                    <input id='name' name='name' value={subCategoryData.name} onChange={handleChange} className='p-3 bg-green-50 border outline-none focus-within:border-primary-200 rounded'/>
                </div>
                <div className='grid gap-1'>
                    <p> Image</p>
                    <div className='flex flex-col lg:flex-row items-center gap-3'>
                        <div className='border h-36 w-full lg:w-36 bg-green-50 flex items-center justify-center'>
                            {
                                !subCategoryData.Image ? (
                                    <p className='text-sm text-neutral-500'>No Image</p>
                                ) : (
                                    <img alt='subCategory' 
                                    src={subCategoryData.Image} 
                                    className='h-full w-full object-scale-down'/>
                                )
                            }
                        </div>
                        <label htmlFor="uploadSubCategoryImage">
                            <div className='px-4 py-2 border rounded border-primary-200 text-primary-200 hover:bg-primary-200 hover:text-neutral-800 cursor-pointer'>
                                Upload Image
                            </div>
                            <input type="file" id='uploadSubCategoryImage' className='hidden' onChange={handleUploadSubCategoryImage} />
                        </label>
                        
                    </div>
                </div>
                    <div className='grid gap-1'>
                        <label htmlFor="">Select Category</label>
                        <div className='border focus-within:border-primary-200 rounded'>
                        {/* display value */}
                        <div className='flex flex-wrap gap-2'>
                            {
                                subCategoryData.category.map((category, index) => {
                                    return(
                                        <p key={category._id+"subcategory"} className='bg-white shadow-md px-1 py-1 flex items-center gap-2'>
                                            {category?.name}
                                            <div onClick={() => handleRemoveCategory(category._id)} className='cursor-pointer hover:text-red-600'>
                                                <IoClose size={15}/>
                                            </div>
                                        </p>
                                    )
                                })
                            }
                        </div>
                        

                        {/* display category */}
                        <select onChange={(e)=>{
                            const value = e.target.value
                            const categoryDetails = allCategory.find(el => el._id === value)
                            setSubCategoryData((prev )=>{
                                return{
                                    ...prev, 
                                    category: [...prev.category, categoryDetails]
                                }
                            })
                        }} name="category" id="" className='w-full p-3 bg-transparent outline-none border'>
                            <option value={""}>Select Category</option>
                            {
                                allCategory.map((category, index) => {
                                    return(
                                        <option key={category._id+"subcategory"} value={category?._id}>{category?.name}</option>
                                    )
                                })
                            }
                        </select>
                    </div>
                </div>
                <button 
                className={` 
                ${ subCategoryData?.name && 
                subCategoryData?.Image && 
                subCategoryData?.category[0] ? 
                'bg-primary-200 text-neutral-800' : 'bg-neutral-400'}
                px-4 py-2 border rounded border-primary-200 text-black
                 hover:bg-primary-100 hover:text-neutral-800 font-semibold`}>
                    Submit
                </button>  
            </form>
        </div>
    </section>
  )
}

export default UploadSubCategoryModel