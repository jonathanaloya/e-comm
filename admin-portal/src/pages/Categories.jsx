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
            const response = await fetch('/api/category/get-category')
            const data = await response.json()
            if(data.success){
                setCategoryData(data.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchCategory()
    },[])

    const handleDeleteCategory = async()=>{
        try {
            const response = await fetch('/api/category/delete-category', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deleteCategory)
            })
            const data = await response.json()
            if(data.success){
                toast.success(data.message)
                fetchCategory()
                setOpenConfirmBoxDelete(false)
            } else {
                toast.error(data.message || "Failed to delete category")
            }
        } catch (error) {
            console.error('Error deleting category:', error)
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

        <div className='p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {
                categoryData.map((category,index)=>{
                    return(
                        <div className='bg-white p-4 rounded-lg shadow-md border' key={category._id}>
                            <div className='flex items-center space-x-4 mb-3'>
                                {category.image && (
                                    <img src={category.image} alt={category.name} className="w-16 h-16 object-cover rounded" />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{category.name}</h3>
                                </div>
                            </div>
                            <div className='flex space-x-2'>
                                <button onClick={()=>{
                                    setOpenEdit(true)
                                    setEditData(category)
                                }} className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors'>
                                    Edit
                                </button>
                                <button onClick={()=>{
                                    setOpenConfirmBoxDelete(true)
                                    setDeleteCategory(category)
                                }} className='flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors'>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setOpenUploadCategory(false)}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

        {
            openEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-lg"
                                    defaultValue={editData.name}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setOpenEdit(false)}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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