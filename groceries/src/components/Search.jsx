import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoSearch } from 'react-icons/io5'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation'
import useMobile from '../hooks/useMobile'

function Search() {

    const navigate = useNavigate()
    const location = useLocation()
    const [isSearchPage, setIsSearchPage] = useState(false)
    const [ isMobile ] = useMobile()

    useEffect(() => {
        const isSearch = location.pathname === '/search'
        setIsSearchPage(isSearch)
    }, [location])

    const redirectToSearchPage = () => {
        navigate('/search')
    }

  return (
    <div className='w-full min-w-[300px] lg:min-w-[420px] lg:h-12 h-11 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200'>
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
                            'search for your "breads and pastries"',
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
                    <div className='w-full h-full'>
                        <input type="text" placeholder='Search for your groceries'
                        autoFocus 
                        className='w-full bg-transparent h-full outline-none'/>
                    </div>
                )
            }
        </div>
        
    </div>
  )
}

export default Search