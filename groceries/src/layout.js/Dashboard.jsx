import React from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    <section className='bg-white'>
        <div className='container mx-auto p-6 grid lg:grid-cols-[250px_1fr]'>
            {/**left side for menu */}
            <div className='py-4 sticky top-28 overflow-y-auto hidden lg:block'>
                <UserMenu />
            </div>

            {/**right side for content */}
            <div className='bg-white p-4'>
                <Outlet />
            </div>
        </div>
    </section>
  )
}

export default Dashboard