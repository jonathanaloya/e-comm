import React, { useEffect, useState } from 'react'
import CardLoading from '../components/CardLoading'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import CardProduct from '../components/CardProduct'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useLocation, useSearchParams } from 'react-router-dom'
import noDataImage from '../assets/no-data.jpeg'
import { useSelector } from 'react-redux'
import { FaFilter, FaTimes } from 'react-icons/fa'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'

const SearchPage = () => {
  const [data,setData] = useState([])
  const [loading,setLoading] = useState(true)
  const loadingArrayCard = new Array(10).fill(null)
  const [page,setPage] = useState(1)
  const [totalPage,setTotalPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchText = searchParams.get('q') || ''
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [showPriceFilter, setShowPriceFilter] = useState(false)
  const [showCategoryFilter, setShowCategoryFilter] = useState(false)
  
  // Get categories from Redux store
  const allCategory = useSelector(state => state.product.allCategory)
  const allSubCategory = useSelector(state => state.product.allSubCategory)

  const fetchData = async() => {
    try {
      setLoading(true)
      
      // Build search parameters
      const searchData = {
        search: searchText,
        page: page,
        sortBy: sortBy,
        ...(priceRange.min && { minPrice: parseFloat(priceRange.min) }),
        ...(priceRange.max && { maxPrice: parseFloat(priceRange.max) }),
        ...(selectedCategories.length > 0 && { categories: selectedCategories })
      }
      
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: searchData
      })

      const { data : responseData } = response

      if(responseData.success){
        if(responseData.page == 1){
          setData(responseData.data)
        }else{
          setData((preve)=>{
            return[
              ...preve,
              ...responseData.data
            ]
          })
        }
        setTotalPage(responseData.totalPage)
      }
    } catch (error) {
        AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1) // Reset to first page when filters change
    fetchData()
  }, [searchText, sortBy, priceRange, selectedCategories])
  
  useEffect(() => {
    if (page > 1) {
      fetchData()
    }
  }, [page])
  
  // Load filter values from URL params on mount
  useEffect(() => {
    const sort = searchParams.get('sort')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const categories = searchParams.get('categories')
    
    if (sort) setSortBy(sort)
    if (minPrice || maxPrice) {
      setPriceRange({ 
        min: minPrice || '', 
        max: maxPrice || '' 
      })
    }
    if (categories) {
      setSelectedCategories(categories.split(','))
    }
  }, [])
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    if (searchText) params.set('q', searchText)
    if (sortBy !== 'relevance') params.set('sort', sortBy)
    else params.delete('sort')
    
    if (priceRange.min) params.set('minPrice', priceRange.min)
    else params.delete('minPrice')
    
    if (priceRange.max) params.set('maxPrice', priceRange.max)
    else params.delete('maxPrice')
    
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','))
    else params.delete('categories')
    
    setSearchParams(params, { replace: true })
  }, [sortBy, priceRange, selectedCategories])

  const handleFetchMore = () => {
    if(totalPage > page){
      setPage(preve => preve + 1)
    }
  }
  
  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(1)
  }
  
  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }))
    setPage(1)
  }
  
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
    setPage(1)
  }
  
  const clearAllFilters = () => {
    setSortBy('relevance')
    setPriceRange({ min: '', max: '' })
    setSelectedCategories([])
    setPage(1)
  }
  
  const hasActiveFilters = sortBy !== 'relevance' || priceRange.min || priceRange.max || selectedCategories.length > 0

  return (
    <section className='bg-white'>
      <div className='container mx-auto p-4'>
        {/* Header with results count and filter toggle */}
        <div className='flex justify-between items-center mb-4'>
          <div>
            <p className='font-semibold'>Search Results: {data.length}</p>
            {searchText && (
              <p className='text-sm text-gray-600'>for "{searchText}"</p>
            )}
          </div>
          
          <div className='flex items-center gap-4'>
            {/* Sort dropdown */}
            <select 
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              className='border rounded px-3 py-2 text-sm'
            >
              <option value='relevance'>Sort by Relevance</option>
              <option value='price-low-high'>Price: Low to High</option>
              <option value='price-high-low'>Price: High to Low</option>
              <option value='name-az'>Name: A to Z</option>
              <option value='name-za'>Name: Z to A</option>
              <option value='newest'>Newest First</option>
            </select>
            
            {/* Filter toggle button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-2 border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50'
            >
              <FaFilter />
              Filters
              {hasActiveFilters && (
                <span className='bg-primary-200 text-white text-xs rounded-full w-2 h-2'></span>
              )}
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className='bg-gray-50 rounded-lg p-4 mb-4'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='font-semibold'>Filters</h3>
              <div className='flex items-center gap-2'>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className='text-sm text-red-600 hover:text-red-800'
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setShowFilters(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Price Range Filter */}
              <div>
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className='flex items-center justify-between w-full p-2 border rounded bg-white hover:bg-gray-50'
                >
                  <span className='font-medium'>Price Range</span>
                  {showPriceFilter ? <IoChevronUp /> : <IoChevronDown />}
                </button>
                
                {showPriceFilter && (
                  <div className='mt-2 p-3 border rounded bg-white'>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='number'
                        placeholder='Min'
                        value={priceRange.min}
                        onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                        className='w-full border rounded px-2 py-1 text-sm'
                      />
                      <span>-</span>
                      <input
                        type='number'
                        placeholder='Max'
                        value={priceRange.max}
                        onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                        className='w-full border rounded px-2 py-1 text-sm'
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>Price in UGX</p>
                  </div>
                )}
              </div>
              
              {/* Category Filter */}
              <div>
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className='flex items-center justify-between w-full p-2 border rounded bg-white hover:bg-gray-50'
                >
                  <span className='font-medium'>Categories</span>
                  {showCategoryFilter ? <IoChevronUp /> : <IoChevronDown />}
                </button>
                
                {showCategoryFilter && (
                  <div className='mt-2 p-3 border rounded bg-white max-h-40 overflow-y-auto'>
                    {allCategory.map((category) => (
                      <label key={category._id} className='flex items-center gap-2 mb-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          className='rounded'
                        />
                        <span className='text-sm'>{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Active Filters Display */}
              <div>
                <h4 className='font-medium mb-2'>Active Filters</h4>
                <div className='space-y-1'>
                  {sortBy !== 'relevance' && (
                    <span className='inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'>
                      Sort: {sortBy.replace('-', ' ')}
                      <FaTimes className='cursor-pointer' onClick={() => handleSortChange('relevance')} />
                    </span>
                  )}
                  
                  {(priceRange.min || priceRange.max) && (
                    <span className='inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded'>
                      Price: {priceRange.min || '0'} - {priceRange.max || '∞'}
                      <FaTimes className='cursor-pointer' onClick={() => setPriceRange({ min: '', max: '' })} />
                    </span>
                  )}
                  
                  {selectedCategories.map(categoryId => {
                    const category = allCategory.find(cat => cat._id === categoryId)
                    return category ? (
                      <span key={categoryId} className='inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1'>
                        {category.name}
                        <FaTimes className='cursor-pointer' onClick={() => handleCategoryToggle(categoryId)} />
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <InfiniteScroll
              dataLength={data.length}
              hasMore={true}
              next={handleFetchMore}
        >
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 py-4 gap-4'>
              {
                data.map((p,index)=>{
                  return(
                    <CardProduct data={p} key={p?._id+"searchProduct"+index}/>
                  )
                })
              }

            {/***loading data */}
            {
              loading && (
                loadingArrayCard.map((_,index)=>{
                  return(
                    <CardLoading key={"loadingsearchpage"+index}/>
                  )
                })
              )
            }
        </div>
        </InfiniteScroll>

              {
                //no data 
                !data[0] && !loading && (
                  <div className='flex flex-col justify-center items-center w-full mx-auto'>
                    <img
                      src={noDataImage} 
                      className='w-full h-full max-w-xs max-h-xs block'
                    />
                    <p className='font-semibold my-2'>No Data found</p>
                  </div>
                )
              }
      </div>
    </section>
  )
}

export default SearchPage