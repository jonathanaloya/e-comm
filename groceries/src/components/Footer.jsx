import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'

import { FaSquareXTwitter } from 'react-icons/fa6'

function Footer() {
  return (
    <footer className='border-t'>
        <div className='container mx-auto p-4 text-center flex flex-col lg:flex-row lg:justify-between gap-2 '>
            <p>&copy; All Rights Reserved 2025</p>
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
    </footer>
  )
}

export default Footer