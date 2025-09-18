import React, { useEffect, useState } from 'react'
import { IoSearch, IoClose } from 'react-icons/io5'
import { FiTrendingUp } from 'react-icons/fi'
import { FaHistory } from 'react-icons/fa'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'

const SearchSuggestions = ({ 
  searchText, 
  onSuggestionClick, 
  onClose, 
  isVisible 
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [popularSearches, setPopularSearches] = useState([])
  const [loading, setLoading] = useState(false)

  // Get recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    setRecentSearches(recent)
    
    // Default popular searches (can be fetched from API)
    setPopularSearches([
      'Fresh Fruits', 
      'Vegetables', 
      'Dairy Products', 
      'Bread', 
      'Rice', 
      'Cooking Oil', 
      'Milk', 
      'Eggs'
    ])
  }, [])

  // Fetch search suggestions
  useEffect(() => {
    if (searchText && searchText.length > 1) {
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [searchText])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchText,
          page: 1,
          limit: 5
        }
      })

      if (response.data.success) {
        const productSuggestions = response.data.data.map(product => ({
          type: 'product',
          text: product.name,
          id: product._id,
          image: product.image?.[0]?.url,
          price: product.price
        }))
        setSuggestions(productSuggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    // Add to recent searches
    const newRecentSearches = [suggestion.text, ...recentSearches.filter(s => s !== suggestion.text)].slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
    setRecentSearches(newRecentSearches)
    
    onSuggestionClick(suggestion.text)
  }

  const clearRecentSearch = (searchTerm, e) => {
    e.stopPropagation()
    const updatedRecent = recentSearches.filter(s => s !== searchTerm)
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))
    setRecentSearches(updatedRecent)
  }

  const clearAllRecentSearches = () => {
    localStorage.removeItem('recentSearches')
    setRecentSearches([])
  }

  if (!isVisible) return null

  return (
    <div className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
      {/* Search Suggestions */}
      {searchText && searchText.length > 1 && (
        <div>
          <div className='px-4 py-2 border-b bg-gray-50'>
            <h4 className='font-medium text-sm text-gray-700'>Search Results</h4>
          </div>
          
          {loading ? (
            <div className='px-4 py-3'>
              <div className='flex items-center gap-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary-200'></div>
                <span className='text-sm text-gray-500'>Searching...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id || index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer'
                >
                  {suggestion.image ? (
                    <img 
                      src={suggestion.image} 
                      alt={suggestion.text}
                      className='w-8 h-8 rounded object-cover'
                    />
                  ) : (
                    <div className='w-8 h-8 bg-gray-200 rounded flex items-center justify-center'>
                      <IoSearch className='text-gray-400' size={16} />
                    </div>
                  )}
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{suggestion.text}</p>
                    {suggestion.price && (
                      <p className='text-xs text-gray-500'>UGX {suggestion.price.toLocaleString()}</p>
                    )}
                  </div>
                  <IoSearch className='text-gray-400' size={16} />
                </div>
              ))}
            </div>
          ) : searchText.length > 1 && (
            <div className='px-4 py-3 text-sm text-gray-500 text-center'>
              No products found for "{searchText}"
            </div>
          )}
        </div>
      )}

      {/* Recent Searches */}
      {!searchText && recentSearches.length > 0 && (
        <div>
          <div className='px-4 py-2 border-b bg-gray-50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FaHistory className='text-gray-500' size={14} />
              <h4 className='font-medium text-sm text-gray-700'>Recent Searches</h4>
            </div>
            <button 
              onClick={clearAllRecentSearches}
              className='text-xs text-red-600 hover:text-red-800'
            >
              Clear All
            </button>
          </div>
          
          <div>
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick({ text: search })}
                className='flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer'
              >
                <div className='flex items-center gap-3'>
                  <FaHistory className='text-gray-400' size={16} />
                  <span className='text-sm'>{search}</span>
                </div>
                <button
                  onClick={(e) => clearRecentSearch(search, e)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <IoClose size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {!searchText && recentSearches.length === 0 && (
        <div>
          <div className='px-4 py-2 border-b bg-gray-50'>
            <div className='flex items-center gap-2'>
              <FiTrendingUp className='text-gray-500' size={14} />
              <h4 className='font-medium text-sm text-gray-700'>Popular Searches</h4>
            </div>
          </div>
          
          <div>
            {popularSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick({ text: search })}
                className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer'
              >
                <FiTrendingUp className='text-gray-400' size={16} />
                <span className='text-sm'>{search}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Search Tips */}
      <div className='px-4 py-2 bg-gray-50 border-t'>
        <p className='text-xs text-gray-500'>
          💡 Tip: Use filters to narrow down your search results
        </p>
      </div>
    </div>
  )
}

export default SearchSuggestions