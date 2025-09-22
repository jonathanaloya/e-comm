import banner from '../assets/banner.jpg'
import bannerMobile from '../assets/mob.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/validURLConvert'
import {Link, useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()

  const handleRedirectProductListpage = (id,cat)=>{
      console.log(id,cat)
      const subcategory = subCategoryData.find(sub =>{
        const filterData = sub.category.some(c => {
          return c._id == id
        })

        return filterData ? true : null
      })
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`

      navigate(url)
      console.log(url)
  }


  return (
   <section className='bg-white'>
      <div className='container mx-auto'>
          <div className={`w-full h-48 md:h-64 lg:h-80 bg-blue-100 rounded ${!banner && "animate-pulse my-2" } `}>
              <img
                src={banner}
                className='w-full h-full object-cover hidden lg:block'
                alt='banner' 
              />
              <img
                src={bannerMobile}
                className='w-full h-full object-cover lg:hidden'
                alt='banner' 
              />
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-6'>
        <h2 className='text-2xl font-semibold mb-4 text-center'>Shop by Category</h2>
        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded-lg p-3 shadow-sm animate-pulse'>
                    <div className='bg-gray-200 aspect-square rounded-lg mb-2'></div>
                    <div className='bg-gray-200 h-4 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat,index)=>{
                return(
                  <div 
                    key={cat._id+"displayCategory"} 
                    className='bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group'
                    onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}
                  >
                    <div className='aspect-square mb-2 overflow-hidden rounded-lg bg-gray-50'>
                        <img 
                          src={cat.Image}
                          alt={cat.name}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-200'
                        />
                    </div>
                    <p className='text-sm font-medium text-center text-gray-700 truncate'>{cat.name}</p>
                  </div>
                )
              })
            )
          }
        </div>
      </div>

      {/***display category product */}
      {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }



   </section>
  )
}

export default Home