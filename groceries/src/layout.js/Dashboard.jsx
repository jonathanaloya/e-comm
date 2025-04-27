import React from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    <section className='bg-white'>
        <div className='container mx-auto p-3 grid lg:grid-cols-[250px,1fr]'>
            {/**left side for menu */}
            <div className='py-14 sticky top-24 overflow-y-auto hidden lg:block border-r max-h-[calc(100vh-100px)]'>
                <UserMenu />
            </div>

            {/**right side for content */}
            <div className='bg-white min-h-[75vh] '>
                <Outlet />
            </div>
        </div>
    </section>
  )
}

export default Dashboard