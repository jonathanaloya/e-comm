import React, {  useEffect, useState } from 'react'
import UploadCategoryModel from '../components/UploadCategoryModel'
import Loading from '../components/loading'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/summaryApi'


function Category() {
    const [ openUploadCategory, setOpenUploadCategory ] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [ categoryData, setCategoryData ] = useState([])

    const fetchCategory = async() => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getCategory
              })
              const { data : responseData } = response

              if(responseData.success){
                  setCategoryData(responseData.data)
              }

        } catch (error) {
          
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategory()
    }, [])

  return (
    <section>
        <div className='p-2 font-semibold bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Category</h2>
            <button onClick={() => setOpenUploadCategory(true)} className='text-sm border-primary-200 hover:bg-primary-200 px-3 py-1 border rounded'>Add Category</button>
        </div>
        {
          !categoryData[0] && !loading && (
            <NoData />
          )
        }

        <div className='p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2'>
          {
            categoryData.map((category, index) => {
              return (
                <div key={index} className='w-32 h-48 rounded shadow-md'>
                  <img src={category.Image} alt={category.name} className='w-full object-scale-down'/>
                </div>
              )
            })
          }
        </div>

        {
            loading && (
              <Loading />
            )
        }


        {
            openUploadCategory && (
            <UploadCategoryModel fetchData={fetchCategory} close={() => setOpenUploadCategory(false)}/>
          )
        }
    </section>
  )
}

export default Category