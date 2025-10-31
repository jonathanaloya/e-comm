import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { adminAPI } from '../utils/api'

const CategoryPage = () => {
    const [openUploadCategory,setOpenUploadCategory] = useState(false)
    const [loading,setLoading] = useState(false)
    const [categoryData,setCategoryData] = useState([])
    const [subCategoryData,setSubCategoryData] = useState([])
    const [openEdit,setOpenEdit] = useState(false)
    const [editData,setEditData] = useState({
        name : "",
        image : "",
    })
    const [openConfimBoxDelete,setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory,setDeleteCategory] = useState({
        _id : ""
    })
    const [categoryForm, setCategoryForm] = useState({ name: '', image: '' })
    const [categoryImageFile, setCategoryImageFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    // Subcategory states
    const [openUploadSubCategory, setOpenUploadSubCategory] = useState(false)
    const [subCategoryForm, setSubCategoryForm] = useState({ name: '', image: '', category: [] })
    const [subCategoryImageFile, setSubCategoryImageFile] = useState(null)
    const [openEditSubCategory, setOpenEditSubCategory] = useState(false)
    const [editSubCategoryData, setEditSubCategoryData] = useState({
        _id: '',
        name: '',
        image: '',
        category: []
    })
    const [openConfirmBoxDeleteSubCategory, setOpenConfirmBoxDeleteSubCategory] = useState(false)
    const [deleteSubCategory, setDeleteSubCategory] = useState({ _id: '' })
    // const allCategory = useSelector(state => state.product.allCategory)


    // useEffect(()=>{
    //     setCategoryData(allCategory)
    // },[allCategory])

    const fetchCategory = async()=>{
        try {
            setLoading(true)
            const response = await adminAPI.getCategories()
            setCategoryData(response.data.data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error('Failed to fetch categories')
        }finally{
            setLoading(false)
        }
    }

    const fetchSubCategories = async()=>{
        try {
            const response = await adminAPI.getSubCategories()
            setSubCategoryData(response.data.data || [])
        } catch (error) {
            console.error('Error fetching subcategories:', error)
        }
    }

    useEffect(()=>{
        fetchCategory()
        fetchSubCategories()
    },[])

    const uploadImage = async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        try {
            const response = await adminAPI.uploadImage(formData)
            return response.data.data.url
        } catch (error) {
            throw new Error('Failed to upload image')
        }
    }

    const handleCreateCategory = async (e) => {
        e.preventDefault()
        setUploading(true)
        try {
            let imageUrl = categoryForm.image

            if (categoryImageFile) {
                imageUrl = await uploadImage(categoryImageFile)
            }

            const response = await adminAPI.createCategory({
                name: categoryForm.name,
                image: imageUrl
            })
            if (response.data.success) {
                toast.success('Category created successfully')
                setOpenUploadCategory(false)
                setCategoryForm({ name: '', image: '' })
                setCategoryImageFile(null)
                fetchCategory()
            }
        } catch (error) {
            console.error('Category creation error:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create category'
            toast.error(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateCategory = async (e) => {
        e.preventDefault()
        setUploading(true)
        try {
            let imageUrl = editData.image

            if (categoryImageFile) {
                imageUrl = await uploadImage(categoryImageFile)
            }

            const response = await adminAPI.updateCategory({
                _id: editData._id,
                name: editData.name,
                image: imageUrl
            })
            if (response.data.success) {
                toast.success('Category updated successfully')
                setOpenEdit(false)
                setEditData({ name: '', image: '' })
                setCategoryImageFile(null)
                fetchCategory()
            }
        } catch (error) {
            console.error('Category update error:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update category'
            toast.error(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteCategory = async()=>{
        try {
            const response = await adminAPI.deleteCategory(deleteCategory)
            if(response.data.success){
                toast.success(response.data.message)
                fetchCategory()
                setOpenConfirmBoxDelete(false)
            }
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error(error.response?.data?.message || 'Failed to delete category')
        }
    }

    const handleCreateSubCategory = async (e) => {
        e.preventDefault()
        setUploading(true)
        try {
            let imageUrl = subCategoryForm.image

            if (subCategoryImageFile) {
                imageUrl = await uploadImage(subCategoryImageFile)
            }

            const response = await adminAPI.createSubCategory({
                name: subCategoryForm.name,
                image: imageUrl,
                category: subCategoryForm.category
            })
            if (response.data.success) {
                toast.success('Subcategory created successfully')
                setOpenUploadSubCategory(false)
                setSubCategoryForm({ name: '', image: '', category: [] })
                setSubCategoryImageFile(null)
                fetchSubCategories()
            }
        } catch (error) {
            console.error('Subcategory creation error:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create subcategory'
            toast.error(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateSubCategory = async (e) => {
        e.preventDefault()
        setUploading(true)
        try {
            let imageUrl = editSubCategoryData.image

            if (subCategoryImageFile) {
                imageUrl = await uploadImage(subCategoryImageFile)
            }

            const response = await adminAPI.updateSubCategory({
                _id: editSubCategoryData._id,
                name: editSubCategoryData.name,
                image: imageUrl,
                category: editSubCategoryData.category
            })
            if (response.data.success) {
                toast.success('Subcategory updated successfully')
                setOpenEditSubCategory(false)
                setEditSubCategoryData({ _id: '', name: '', image: '', category: [] })
                setSubCategoryImageFile(null)
                fetchSubCategories()
            }
        } catch (error) {
            console.error('Subcategory update error:', error)
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update subcategory'
            toast.error(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteSubCategory = async()=>{
        try {
            const response = await adminAPI.deleteSubCategory(deleteSubCategory)
            if(response.data.success){
                toast.success(response.data.message)
                fetchSubCategories()
                setOpenConfirmBoxDeleteSubCategory(false)
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error)
            toast.error(error.response?.data?.message || 'Failed to delete subcategory')
        }
    }

  return (
    <section className=''>
        <div className='p-2   bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Categories Management</h2>
            <div className="space-x-4">
                <button onClick={()=>setOpenUploadCategory(true)} className='text-sm border border-primary-200 hover:bg-primary-200 px-3 py-1 rounded'>Add Category</button>
                <button onClick={()=>setOpenUploadSubCategory(true)} className='text-sm border border-blue-200 hover:bg-blue-200 px-3 py-1 rounded'>Add Subcategory</button>
            </div>
        </div>
        {
            !categoryData[0] && !loading && (
                <div className='text-center py-8'>No categories found</div>
            )
        }

        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
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
                                        <p className="text-sm text-gray-500">
                                            {subCategoryData.filter(sub => sub.category.some(cat => cat._id === category._id)).length} subcategories
                                        </p>
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
        </div>

        {/* Subcategories Section */}
        <div>
            <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {subCategoryData.map((subCategory) => (
                            <tr key={subCategory._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{subCategory.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {subCategory.category?.map(cat => cat.name).join(', ') || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setOpenEditSubCategory(true)
                                                setEditSubCategoryData(subCategory)
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setOpenConfirmBoxDeleteSubCategory(true)
                                                setDeleteSubCategory(subCategory)
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
                        <form onSubmit={handleCreateCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded-lg"
                                    onChange={(e) => setCategoryImageFile(e.target.files[0])}
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload an image file (JPG, PNG, etc.)</p>
                                {categoryImageFile && (
                                    <p className="text-sm text-green-600 mt-1">Selected: {categoryImageFile.name}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Or Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-2 border rounded-lg"
                                    value={categoryForm.image}
                                    onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Alternative: paste an image URL</p>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenUploadCategory(false)
                                        setCategoryForm({ name: '', image: '' })
                                        setCategoryImageFile(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    {uploading ? 'Creating...' : 'Create'}
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
                        <form onSubmit={handleUpdateCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded-lg"
                                    onChange={(e) => setCategoryImageFile(e.target.files[0])}
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload a new image file (JPG, PNG, etc.)</p>
                                {categoryImageFile && (
                                    <p className="text-sm text-green-600 mt-1">Selected: {categoryImageFile.name}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Or Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-2 border rounded-lg"
                                    value={editData.image}
                                    onChange={(e) => setEditData({...editData, image: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Alternative: paste an image URL</p>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenEdit(false)
                                        setEditData({ name: '', image: '' })
                                        setCategoryImageFile(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {uploading ? 'Updating...' : 'Update'}
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

        {/* Add Subcategory Modal */}
        {
            openUploadSubCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Add New Subcategory</h3>
                        <form onSubmit={handleCreateSubCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subcategory Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={subCategoryForm.name}
                                    onChange={(e) => setSubCategoryForm({...subCategoryForm, name: e.target.value})}
                                    placeholder="Enter subcategory name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={subCategoryForm.category[0] || ''}
                                    onChange={(e) => {
                                        setSubCategoryForm({...subCategoryForm, category: [e.target.value]});
                                    }}
                                >
                                    <option value="">Select a category</option>
                                    {categoryData.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Select one category for this subcategory</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subcategory Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded-lg"
                                    onChange={(e) => setSubCategoryImageFile(e.target.files[0])}
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload an image file (JPG, PNG, etc.)</p>
                                {subCategoryImageFile && (
                                    <p className="text-sm text-green-600 mt-1">Selected: {subCategoryImageFile.name}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Or Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-2 border rounded-lg"
                                    value={subCategoryForm.image}
                                    onChange={(e) => setSubCategoryForm({...subCategoryForm, image: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Alternative: paste an image URL</p>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenUploadSubCategory(false)
                                        setSubCategoryForm({ name: '', image: '', category: [] })
                                        setSubCategoryImageFile(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                >
                                    {uploading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

        {/* Edit Subcategory Modal */}
        {
            openEditSubCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Edit Subcategory</h3>
                        <form onSubmit={handleUpdateSubCategory}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subcategory Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={editSubCategoryData.name}
                                    onChange={(e) => setEditSubCategoryData({...editSubCategoryData, name: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={editSubCategoryData.category[0]?._id || editSubCategoryData.category[0] || ''}
                                    onChange={(e) => {
                                        setEditSubCategoryData({...editSubCategoryData, category: [e.target.value]});
                                    }}
                                >
                                    <option value="">Select a category</option>
                                    {categoryData.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Select one category for this subcategory</p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subcategory Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded-lg"
                                    onChange={(e) => setSubCategoryImageFile(e.target.files[0])}
                                />
                                <p className="text-xs text-gray-500 mt-1">Upload a new image file (JPG, PNG, etc.)</p>
                                {subCategoryImageFile && (
                                    <p className="text-sm text-green-600 mt-1">Selected: {subCategoryImageFile.name}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Or Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-2 border rounded-lg"
                                    value={editSubCategoryData.image}
                                    onChange={(e) => setEditSubCategoryData({...editSubCategoryData, image: e.target.value})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Alternative: paste an image URL</p>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenEditSubCategory(false)
                                        setEditSubCategoryData({ _id: '', name: '', image: '', category: [] })
                                        setSubCategoryImageFile(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {uploading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

        {/* Delete Subcategory Confirmation */}
        {
            openConfirmBoxDeleteSubCategory && (
                <div className='fixed top-0 right-0 bottom-0 left-0 z-50 bg-neutral-800 bg-opacity-70 p-4 flex justify-center items-center'>
                    <div className='bg-white w-full max-w-md p-4 rounded'>
                        <div className='flex justify-between items-center gap-3'>
                            <h1 className='font-semibold'>Delete Subcategory Permanently</h1>
                            <button onClick={()=>setOpenConfirmBoxDeleteSubCategory(false)}>
                                <span className='text-xl'>×</span>
                            </button>
                        </div>
                        <p className='my-4'>Are you sure you want to delete this subcategory?</p>
                        <div className='w-fit ml-auto flex items-center gap-3'>
                            <button onClick={()=>setOpenConfirmBoxDeleteSubCategory(false)} className='px-4 py-2 border rounded border-red-500 text-red-500 hover:bg-red-500 hover:text-white'>Cancel</button>
                            <button onClick={handleDeleteSubCategory} className='px-4 py-2 border rounded border-green-500 text-green-500 hover:bg-green-500 hover:text-white'>Confirm</button>
                        </div>
                    </div>
                </div>
            )
        }
    </section>
  )
}

export default CategoryPage