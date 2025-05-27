import React, {  use, useEffect, useState } from 'react'
import UploadCategoryModel from '../components/UploadCategoryModel'
import Loading from '../components/loading'
import NoData from '../components/NoData'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import EditCategory from '../components/EditCategory'
import Confirmbox from '../components/Confirmbox'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { useSelector } from 'react-redux'


function Category() {
    const [ openUploadCategory, setOpenUploadCategory ] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [ categoryData, setCategoryData ] = useState([])
    const [openEdit, setOpenEdit] = useState(false)
    const [editData, setEditData] = useState({
      name: '',
      Image: ''
    })
    const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false)
    const [deleteCategory, setDeleteCategory] = useState({
      _id: ''
    })

    const allCategory = useSelector(state => state.product.allCategory)
    
    useEffect(() => {
      setCategoryData(allCategory)
    },[allCategory])

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

    const handleDeleteCategory = async() => {
      try {
        setLoading(true)
        const response = await Axios({
          ...SummaryApi.deleteCategory,
          data : deleteCategory
        })

        const { data : responseData } = response

        if(responseData.success){
          toast.success(responseData.message)
          setOpenConfirmBoxDelete(false)
          fetchCategory()
        }
      } catch (error) {
        AxiosToastError(error)
      } finally {
        setLoading(false)
      }
    }

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
                  <h3 className='text-center font-medium'>{category.name}</h3>

                  <div className='flex items-center h-9 gap-2'>
                    <button onClick={() => {
                      setOpenEdit(true)
                      setEditData(category)
                      }}className='flex-1 bg-green-100 text-green-600 font-medium py-1 rounded hover:bg-green-200'>
                      Edit
                    </button>
                    <button onClick={() => {setOpenConfirmBoxDelete(true) ; setDeleteCategory(category)}} className='flex-1 bg-red-100 text-red-600 font-medium py-1 rounded hover:bg-red-200'>
                      Delete
                    </button>
                  </div>
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

        {
            openEdit && (
              <EditCategory data={editData} close={() => setOpenEdit(false)} fetchData={fetchCategory}/>
            )
        }

        {
            openConfirmBoxDelete && (
              <Confirmbox close={() => setOpenConfirmBoxDelete(false)} cancel={() => setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory}/>
            )
        }
    </section>
  )
}

export default Category