import { useState, useEffect } from 'react'
import { FaSearch, FaBox } from 'react-icons/fa'
import { adminAPI } from '../utils/api'
import toast from 'react-hot-toast'

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      const response = await adminAPI.getAllProducts()
      
      if (response.data.success) {
        setProducts(response.data.data)
        setFilteredProducts(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subCategory?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  if (loading) {
    return <div className="p-6">Loading products...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <button 
          onClick={fetchProducts}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, category, or subcategory"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-1 aspect-h-1">
              {product.image?.[0] ? (
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <FaBox className="text-gray-400 text-4xl" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">
                {product.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Category:</span> {product.category?.[0]?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Subcategory:</span> {product.subCategory?.[0]?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Price:</span> UGX {product.price?.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Stock:</span> {product.stock || 0}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.publish ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.publish ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No products found
        </div>
      )}
    </div>
  )
}

export default Products