import React, { useEffect, useState, useRef } from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoSearch, IoClose } from 'react-icons/io5'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'
import useMobile from '../hooks/useMobile'
import SearchSuggestions from './SearchSuggestions'

const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isSearchPage,setIsSearchPage] = useState(false)
    const [isMobile] = useMobile()
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const searchRef = useRef(null)
    const inputRef = useRef(null)
    
    // Get search text from URL
    const params = new URLSearchParams(location.search)
    const searchText = params.get('q') || ''

    useEffect(() => {
        const isSearch = location.pathname === '/search'
        setIsSearchPage(isSearch)
        
        // Set input value from URL search params
        if (isSearch) {
            setInputValue(searchText)
        } else {
            setInputValue('')
        }
    }, [location, searchText])
    
    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false)
                setIsFocused(false)
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const redirectToSearchPage = () => {
        navigate('/search')
        setShowSuggestions(true)
        // Focus input after navigation
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }, 100)
    }

    const handleOnChange = (e) => {
        const value = e.target.value
        setInputValue(value)
        
        if (value.trim()) {
            const url = `/search?q=${encodeURIComponent(value.trim())}`
            navigate(url, { replace: true })
        } else {
            navigate('/search', { replace: true })
        }
    }
    
    const handleInputFocus = () => {
        setIsFocused(true)
        setShowSuggestions(true)
    }
    
    const handleSuggestionClick = (suggestionText) => {
        setInputValue(suggestionText)
        const url = `/search?q=${encodeURIComponent(suggestionText)}`
        navigate(url)
        setShowSuggestions(false)
        setIsFocused(false)
    }
    
    const clearSearch = () => {
        setInputValue('')
        navigate('/search', { replace: true })
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            const url = `/search?q=${encodeURIComponent(inputValue.trim())}`
            navigate(url)
            setShowSuggestions(false)
            setIsFocused(false)
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
            setIsFocused(false)
        }
    }

  return (
    <div ref={searchRef} className='relative w-full min-w-[300px] lg:min-w-[420px]'>
      <div className='lg:h-12 h-11 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200'>
        <div>     
            {
                (isMobile && isSearchPage) ? (
                    <Link to={'/'} className=' h-full flex justify-center items-center p-2 m-1 group-focus-within:text-primary-200 bg-white rounded-full shadow-md'>
                <FaArrowLeft size={22} />
                </Link>
                ) : (
                    <button className=' h-full flex justify-center items-center p-3 group-focus-within:text-primary-200'>
                        <IoSearch size={22}/>
                    </button> 
                )
            }     
        </div>
        <div className='w-full h-full'>
            {
                !isSearchPage ? (
                    <div onClick={redirectToSearchPage} className='w-full h-full flex items-center'>
                    <TypeAnimation
                        sequence={[
                            // Same substring at the start will only be typed out once, initially
                            'Search for your "fruits"',
                            1000, // wait 1s before replacing the next text"
                            'Search for your "fresh vegetables"',
                            1000,
                            'Search for your "bananas"',
                            1000,
                            'Search for all your "groceries"',
                            1000,
                            'Search for all your "dairy products"',
                            1000,
                            'search for your "bread and pastries"',
                            1000,
                            'Search for your "grains and cereals"',
                            1000,
                            'Search for your "Poultry products"',
                            1000
                        ]}
                        wrapper="span"
                        speed={50}
                        repeat={Infinity}
                    />
                    </div>
                ) : (
                    // When search page is active
                    <div className='w-full h-full flex items-center'>
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder='Search for your groceries'
                            autoFocus 
                            value={inputValue}
                            className='w-full bg-transparent h-full outline-none flex-1 pr-8'
                            onChange={handleOnChange}
                            onFocus={handleInputFocus}
                            onKeyDown={handleKeyDown}
                        />
                        {inputValue && (
                            <button 
                                onClick={clearSearch}
                                className='absolute right-3 text-gray-400 hover:text-gray-600'
                            >
                                <IoClose size={18} />
                            </button>
                        )}
                    </div>
                )
            }
        </div>
      </div>
      
      {/* Search Suggestions */}
      {isSearchPage && (
        <SearchSuggestions 
          searchText={isFocused && !inputValue.trim() ? '' : inputValue}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
          isVisible={showSuggestions && isFocused}
        />
      )}
    </div>
  )
}

export default Search