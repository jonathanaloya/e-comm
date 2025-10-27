import { useState, useEffect } from 'react'
import { adminAPI } from '../utils/api'
import toast from 'react-hot-toast'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image: [''],
    category: '',
    subCategory: '',
    unit: '',
    stock: '',
    price: '',
    discount: '',
    more_details: {}
  })
  const [productImageFiles, setProductImageFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSubCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getAllProducts()
      setProducts(response.data.data || [])
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories()
      setCategories(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await adminAPI.getSubCategories()
      setSubCategories(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch subcategories')
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

  const handleCreateProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    setUploading(true)
    try {
      let imageUrls = [...productForm.image]
      
      // Upload files if any
      if (productImageFiles.length > 0) {
        const uploadPromises = productImageFiles.map(file => uploadImage(file))
        const uploadedUrls = await Promise.all(uploadPromises)
        imageUrls = [...uploadedUrls, ...imageUrls.filter(url => url)]
      }
      
      const response = await adminAPI.createProduct({
        ...productForm,
        image: imageUrls.filter(url => url),
        stock: parseInt(productForm.stock),
        price: parseFloat(productForm.price),
        discount: parseFloat(productForm.discount) || 0
      })
      if (response.data.success) {
        toast.success('Product created successfully')
        setShowProductModal(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await adminAPI.updateProduct({
        ...productForm,
        _id: editingProduct,
        stock: parseInt(productForm.stock),
        price: parseFloat(productForm.price),
        discount: parseFloat(productForm.discount) || 0
      })
      if (response.data.success) {
        toast.success('Product updated successfully')
        setShowProductModal(false)
        resetForm()
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      image: product.image || [''],
      category: product.category || '',
      subCategory: product.subCategory || '',
      unit: product.unit || '',
      stock: product.stock?.toString() || '',
      price: product.price?.toString() || '',
      discount: product.discount?.toString() || '',
      more_details: product.more_details || {}
    })
    setEditingProduct(product._id)
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await adminAPI.deleteProduct({ _id: productId })
        if (response.data.success) {
          toast.success('Product deleted successfully')
          fetchProducts()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product')
      }
    }
  }

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      image: [''],
      category: '',
      subCategory: '',
      unit: '',
      stock: '',
      price: '',
      discount: '',
      more_details: {}
    })
    setProductImageFiles([])
    setEditingProduct(null)
  }

  const handleImageChange = (index, value) => {
    const newImages = [...productForm.image]
    newImages[index] = value
    setProductForm({ ...productForm, image: newImages })
  }

  const addImageField = () => {
    setProductForm({ ...productForm, image: [...productForm.image, ''] })
  }

  const removeImageField = (index) => {
    const newImages = productForm.image.filter((_, i) => i !== index)
    setProductForm({ ...productForm, image: newImages })
  }

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <button 
          onClick={() => setShowProductModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Start by adding your first product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={product.image?.[0] || '/placeholder-product.jpg'} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-green-600">UGX {product.price?.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded-lg"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., kg, piece, liter"
                      className="w-full p-2 border rounded-lg"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      required
                      className="w-full p-2 border rounded-lg"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subcategory</label>
                    <select
                      required
                      className="w-full p-2 border rounded-lg"
                      value={productForm.subCategory}
                      onChange={(e) => setProductForm({...productForm, subCategory: e.target.value})}
                    >
                      <option value="">Select SubCategory</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory._id} value={subCategory._id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (UGX)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="Enter price in Ugandan Shillings"
                      className="w-full p-2 border rounded-lg"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2 border rounded-lg"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full p-2 border rounded-lg"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({...productForm, discount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full p-2 border rounded-lg"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Product Images</label>
                  
                  {/* File Upload */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full p-2 border rounded-lg"
                      onChange={(e) => setProductImageFiles(Array.from(e.target.files))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload image files (JPG, PNG, etc.) - You can select multiple files</p>
                    {productImageFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Selected files:</p>
                        <ul className="text-xs text-gray-600">
                          {productImageFiles.map((file, index) => (
                            <li key={index}>• {file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* URL Inputs */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium mb-2">Or Image URLs</label>
                    {productForm.image.map((img, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 p-2 border rounded-lg"
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                        />
                        {productForm.image.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add another URL
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false)
                      resetForm()
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
                    {uploading ? 'Uploading Images...' : loading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products