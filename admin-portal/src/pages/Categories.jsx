import { useState, useEffect } from 'react'
import { adminAPI } from '../utils/api'
import toast from 'react-hot-toast'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false)
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' })
  const [subCategoryForm, setSubCategoryForm] = useState({ name: '', category: '', image: '' })
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryImageFile, setCategoryImageFile] = useState(null)
  const [subCategoryImageFile, setSubCategoryImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchSubCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories()
      setCategories(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch categories')
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await adminAPI.getSubCategories()
      setSubCategories(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch subcategories')
    }
  }

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
    setLoading(true)
    setUploading(true)
    try {
      let imageUrl = categoryForm.image
      
      if (categoryImageFile) {
        imageUrl = await uploadImage(categoryImageFile)
      }
      
      const response = await adminAPI.createCategory({
        name: categoryForm.name,
        Image: imageUrl
      })
      if (response.data.success) {
        toast.success('Category created successfully')
        setShowCategoryModal(false)
        setCategoryForm({ name: '', image: '' })
        setCategoryImageFile(null)
        fetchCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleCreateSubCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUploading(true)
    try {
      let imageUrl = subCategoryForm.image
      
      if (subCategoryImageFile) {
        imageUrl = await uploadImage(subCategoryImageFile)
      }
      
      const response = await adminAPI.createSubCategory({
        name: subCategoryForm.name,
        category: subCategoryForm.category,
        image: imageUrl
      })
      if (response.data.success) {
        toast.success('Subcategory created successfully')
        setShowSubCategoryModal(false)
        setSubCategoryForm({ name: '', category: '', image: '' })
        setSubCategoryImageFile(null)
        fetchSubCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subcategory')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleEditCategory = async (category) => {
    setCategoryForm({ name: category.name, image: category.Image })
    setEditingCategory(category._id)
    setShowCategoryModal(true)
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await adminAPI.updateCategory({
        _id: editingCategory,
        name: categoryForm.name,
        Image: categoryForm.image
      })
      if (response.data.success) {
        toast.success('Category updated successfully')
        setShowCategoryModal(false)
        setCategoryForm({ name: '', image: '' })
        setEditingCategory(null)
        fetchCategories()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await adminAPI.deleteCategory({ _id: categoryId })
        if (response.data.success) {
          toast.success('Category deleted successfully')
          fetchCategories()
          fetchSubCategories()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category')
      }
    }
  }

  const handleDeleteSubCategory = async (subCategoryId) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const response = await adminAPI.deleteSubCategory({ _id: subCategoryId })
        if (response.data.success) {
          toast.success('Subcategory deleted successfully')
          fetchSubCategories()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete subcategory')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Category
          </button>
          <button
            onClick={() => setShowSubCategoryModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Subcategory
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center space-x-4 mb-3">
                {category.Image && (
                  <img src={category.Image} alt={category.name} className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {subCategories.filter(sub => sub.category === category._id).length} subcategories
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
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
              {subCategories.map((subCategory) => (
                <tr key={subCategory._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{subCategory.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categories.find(cat => cat._id === subCategory.category)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDeleteSubCategory(subCategory._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded-lg"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
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
                    setShowCategoryModal(false)
                    setEditingCategory(null)
                    setCategoryForm({ name: '', image: '' })
                  }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : loading ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubCategoryModal && (
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
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  required
                  className="w-full p-2 border rounded-lg"
                  value={subCategoryForm.category}
                  onChange={(e) => setSubCategoryForm({...subCategoryForm, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  onClick={() => setShowSubCategoryModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories