import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { FaSquareXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className='border-t'>
        <div className='container mx-auto p-4'>
            <div className='flex flex-col lg:flex-row lg:justify-between gap-4'>
                <div className='text-center lg:text-left'>
                    <p>&copy; All Rights Reserved 2025</p>
                    <div className='flex gap-4 justify-center lg:justify-start mt-2 text-sm'>
                        <Link to='/privacy-policy' className='hover:text-primary-100'>Privacy Policy</Link>
                        <Link to='/terms-of-service' className='hover:text-primary-100'>Terms of Service</Link>
                        <Link to='/faq' className='hover:text-primary-100'>FAQ</Link>
                        <Link to='/contact-support' className='hover:text-primary-100'>Support</Link>
                    </div>
                </div>
                <div className='flex items-center gap-4 justify-center text-2xl'>
                    <a href='' className='hover:text-primary-100'>
                        <FaFacebook className='mx-2' />
                    </a>
                    <a href='' className='hover:text-primary-100'>
                        <FaInstagram className='mx-2' />
                    </a>
                    <a href='' className='hover:text-primary-100'>
                        <FaLinkedin className='mx-2' />
                    </a>
                    <a href='' className='hover:text-primary-100'>
                        <FaSquareXTwitter className='mx-2' />
                    </a>
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer