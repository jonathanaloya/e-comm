import React, { useEffect, useState } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import TableDisplay from '../components/TableDisplay'
import { createColumnHelper } from '@tanstack/react-table'
import SummaryApi from '../common/SummaryApi'
import { HiPencil } from 'react-icons/hi'
import { MdDelete } from 'react-icons/md'
import ViewImage from '../components/ViewImage'
import EditSubCategory from '../components/EditSubCategory'
import Confirmbox from '../components/Confirmbox'
import toast from 'react-hot-toast'

function SubCategory() {
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false)
  const [ data, setData ] = useState([])
  const [loading, setLoading] = useState(false)
  const columnHelper = createColumnHelper()
  const [imageURL, setImageURL] = useState("")
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({
    _id : ''
  })

  const [deleteSubCategory, setDeleteSubCategory] = useState({
    _id : ''
  })

  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  
  const fetchSubCategory = async() => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getSubCategory
      })

      const { data : responseData } = response

      if(responseData.success){
        setData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubCategory()
  }, [])

  const column = [
    columnHelper.accessor('name',{
      header : "Name"
    }),
    columnHelper.accessor('Image',{
      header : "Image",
      cell : ({row})=>{
        console.log("row")
        return <div className='flex justify-center items-center'>
            <img 
                src={row.original.Image}
                alt={row.original.name}
                className='w-8 h-8 cursor-pointer'
                onClick={()=>{
                  setImageURL(row.original.Image)
                }}     
            />
        </div>
      }
    }),
    columnHelper.accessor("category",{
       header : "Category",
       cell : ({row})=>{
        return(
          <>
            {
              row.original.category.map((c, index)=>{
                return(
                  <p key={c._id + "table"} className='shadow-md px-1 flex items-center justify-center'>{c.name}</p>
                  
                )
              })
            }
          </>
        )
       }
    }),
    columnHelper.accessor("_id",{
      header : "Action",
      cell : ({row})=>{
        return(
          <div className='flex items-center justify-center gap-3'>
              <button onClick={()=>{
                  setOpenEdit(true)
                  setEditData(row.original)
              }} className='p-2 bg-green-100 rounded-full hover:text-green-600'>
                  <HiPencil size={20}/>
              </button>
              <button onClick={()=>{
                setOpenDeleteConfirmBox(true)
                setDeleteSubCategory(row.original)
              }} className='p-2 bg-red-100 rounded-full text-red-500 hover:text-red-600'>
                  <MdDelete  size={20}/>
              </button>
          </div>
        )
      }
    })
  ]

  const handleDeleteSubCategory = async() => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data : deleteSubCategory
      })

      const { data : responseData } = response

      if(responseData.success){
        toast.success(responseData.message)
        setOpenDeleteConfirmBox(false)
        fetchSubCategory()
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  return (
    <section>
      <div className='p-2 font-semibold bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Sub Category</h2>
            <button onClick={() => setOpenAddSubCategory(true)} className='text-sm border-primary-200 hover:bg-primary-200 px-3 py-1 border rounded'>Add Sub Category</button>
        </div>
        <div className='overflow-auto w-full max-w-[95vw]'>
          <TableDisplay data={data} column={column}/>
        </div>

        {
            openAddSubCategory && <UploadSubCategoryModel close={() => setOpenAddSubCategory(false)} fetchData={fetchSubCategory}/>
        }
        {
          imageURL &&
          <ViewImage url={imageURL} close={() => setImageURL("")} />
        }
        {
          openEdit &&
          <EditSubCategory close={() => setOpenEdit(false)} data={editData} fetchData={fetchSubCategory}/>
        }
        {
          openDeleteConfirmBox &&
          <Confirmbox cancel={() => setOpenDeleteConfirmBox(false)} close={() => setOpenDeleteConfirmBox(false)} data={deleteSubCategory} confirm={handleDeleteSubCategory}/>
        }
    </section>
  )
}

export default SubCategory