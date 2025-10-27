import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        name : "",
        image : "",
    })
    const [openConfimBoxDelete,setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory,setDeleteCategory] = useState({
        _id : ""
    })
    // const allCategory = useSelector(state => state.product.allCategory)


    // useEffect(()=>{
    //     setCategoryData(allCategory)
    // },[allCategory])

    const fetchCategory = async()=>{
        try {
            setLoading(true)
            // Placeholder for API call
            setCategoryData([])
        } catch (error) {

        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchCategory()
    },[])

    const handleDeleteCategory = async()=>{
        try {
            // Placeholder for delete API call
            toast.success("Category deleted successfully")
            fetchCategory()
            setOpenConfirmBoxDelete(false)
        } catch (error) {
            toast.error("Failed to delete category")
        }
    }

  return (
    <section className=''>
        <div className='p-2   bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Category</h2>
            <button onClick={()=>setOpenUploadCategory(true)} className='text-sm border border-primary-200 hover:bg-primary-200 px-3 py-1 rounded'>Add Category</button>
        </div>
        {
            !categoryData[0] && !loading && (
                <div className='text-center py-8'>No categories found</div>
            )
        }

        <div className='p-4 grid  grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2'>
            {
                categoryData.map((category,index)=>{
                    return(
                        <div className='w-32 h-56 rounded shadow-md' key={category._id}>
                            <img
                                alt={category.name}
                                src={category.image}
                                className='w-full object-scale-down'
                            />
                            <div className='items-center h-9 flex gap-2'>
                                <button onClick={()=>{
                                    setOpenEdit(true)
                                    setEditData(category)
                                }} className='flex-1 bg-green-100 hover:bg-green-200 text-green-600 font-medium py-1 rounded'>
                                    Edit
                                </button>
                                <button onClick={()=>{
                                    setOpenConfirmBoxDelete(true)
                                    setDeleteCategory(category)
                                }} className='flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-1 rounded'>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                })
            }
        </div>

        {
            loading && (
                <div className='text-center py-8'>Loading...</div>
            )
        }

        {
            openUploadCategory && (
                <div>Upload Category Modal Placeholder</div>
            )
        }

        {
            openEdit && (
                <div>Edit Category Modal Placeholder</div>
            )
        }

        {
           openConfimBoxDelete && (
            <div className='fixed top-0 right-0 bottom-0 left-0 z-50 bg-neutral-800 bg-opacity-70 p-4 flex justify-center items-center'>
                <div className='bg-white w-full max-w-md p-4 rounded'>
                    <div className='flex justify-between items-center gap-3'>
                        <h1 className='font-semibold'>Delete Permanently</h1>
                        <button onClick={()=>setOpenConfirmBoxDelete(false)}>
                            <span className='text-xl'>×</span>
                        </button>
                    </div>
                    <p className='my-4'>Are you sure you want to delete this item?</p>
                    <div className='w-fit ml-auto flex items-center gap-3'>
                        <button onClick={()=>setOpenConfirmBoxDelete(false)} className='px-4 py-2 border rounded border-red-500 text-red-500 hover:bg-red-500 hover:text-white'>Cancel</button>
                        <button onClick={handleDeleteCategory} className='px-4 py-2 border rounded border-green-500 text-green-500 hover:bg-green-500 hover:text-white'>Confirm</button>
                    </div>
                </div>
            </div>
           )
        }
    </section>
  )
}

export default CategoryPage