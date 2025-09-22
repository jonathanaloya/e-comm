import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/validURLConvert'

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const params = useParams()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const AllCategory = useSelector(state => state.product.allCategory)
  const [DisplaySubCatory, setDisplaySubCategory] = useState([])
  const [showSidebar, setShowSidebar] = useState(false)
  const navigate = useNavigate()

  console.log(AllSubCategory)

  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  const categoryId = params.category.split("-").slice(-1)[0]
  const subCategoryId = params.subCategory.split("-").slice(-1)[0]


  const fetchProductdata = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 8,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data)
        } else {
          setData([...data, ...responseData.data])
        }
        setTotalPage(responseData.totalCount)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductdata()
  }, [params])


  useEffect(() => {
    const sub = AllSubCategory.filter(s => {
      const filterData = s.category.some(el => {
        return el._id == categoryId
      })

      return filterData ? filterData : null
    })
    setDisplaySubCategory(sub)
  }, [params, AllSubCategory])

  const handleCategoryClick = (categoryId, categoryName) => {
    const subcategory = AllSubCategory.find(sub => {
      return sub.category.some(c => c._id === categoryId)
    })
    if (subcategory) {
      const url = `/${valideURLConvert(categoryName)}-${categoryId}/${valideURLConvert(subcategory.name)}-${subcategory._id}`
      navigate(url)
    }
  }

  return (
    <section className='min-h-screen bg-gray-50'>
      <div className='container mx-auto'>
        {/* Mobile Menu Button */}
        <div className='lg:hidden bg-white shadow-sm p-4 sticky top-16 z-20'>
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className='flex items-center gap-2 text-green-700 font-medium'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
            Categories & Subcategories
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-4 p-4'>
          {/* Sidebar */}
          <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
            showSidebar ? 'block' : 'hidden lg:block'
          } ${showSidebar ? 'fixed inset-0 z-30 lg:relative' : ''}`}>
            {showSidebar && (
              <div className='lg:hidden p-4 border-b flex justify-between items-center'>
                <h3 className='font-semibold'>Categories</h3>
                <button onClick={() => setShowSidebar(false)} className='text-gray-500'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            )}
            
            <div className='max-h-[80vh] overflow-y-auto'>
              {/* Categories Section */}
              <div className='p-4 border-b'>
                <h4 className='font-medium text-gray-700 mb-3'>Categories</h4>
                <div className='grid grid-cols-2 lg:grid-cols-1 gap-2'>
                  {
                    AllCategory.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat._id, cat.name)}
                        className={`p-2 rounded-lg text-left hover:bg-green-50 transition-colors ${
                          categoryId === cat._id ? 'bg-green-100 text-green-700' : 'text-gray-600'
                        }`}
                      >
                        <div className='flex items-center gap-2'>
                          <img src={cat.Image} alt={cat.name} className='w-8 h-8 object-cover rounded' />
                          <span className='text-sm font-medium'>{cat.name}</span>
                        </div>
                      </button>
                    ))
                  }
                </div>
              </div>

              {/* Subcategories Section */}
              <div className='p-4'>
                <h4 className='font-medium text-gray-700 mb-3'>Subcategories</h4>
                <div className='space-y-1'>
                  {
                    DisplaySubCatory.map((s) => {
                      const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`
                      return (
                        <Link 
                          key={s._id}
                          to={link} 
                          onClick={() => setShowSidebar(false)}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors ${
                            subCategoryId === s._id ? 'bg-green-100 text-green-700' : 'text-gray-600'
                          }`}
                        >
                          <img
                            src={s.Image}
                            alt={s.name}
                            className='w-10 h-10 object-cover rounded'
                          />
                          <span className='text-sm font-medium'>{s.name}</span>
                        </Link>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>


          {/* Products Section */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='p-4 border-b'>
              <h3 className='text-xl font-semibold text-gray-800'>{subCategoryName}</h3>
            </div>
            
            <div className='p-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {
                  data.map((p, index) => {
                    return (
                      <CardProduct
                        data={p}
                        key={p._id + "productSubCategory" + index}
                      />
                    )
                  })
                }
              </div>
              
              {loading && (
                <div className='flex justify-center py-8'>
                  <Loading />
                </div>
              )}
              
              {data.length === 0 && !loading && (
                <div className='text-center py-12 text-gray-500'>
                  <p>No products found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Overlay */}
        {showSidebar && (
          <div 
            className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20'
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </section>
  )
}

export default ProductListPage