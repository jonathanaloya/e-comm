import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useParams, Link } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/validURLConvert";
import noDataImage from '../assets/nodata.png'
import { baseURL } from '../common/SummaryApi'

const ProductListPage = () => {
  const params = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [subCategoryInfo, setSubCategoryInfo] = useState(null);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showSubCategoriesMenu, setShowSubCategoriesMenu] = useState(false);
  
  const allCategory = useSelector(state => state.product.allCategory);
  const allSubCategory = useSelector(state => state.product.allSubCategory);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Extract IDs from URL params
        const categoryParam = params.category;
        const subCategoryParam = params.subCategory;
        
        console.log('URL Params:', { categoryParam, subCategoryParam });
        
        if (!categoryParam || !subCategoryParam) {
          console.log('Missing params');
          setData([]);
          return;
        }
        
        const categoryId = categoryParam.split('-').pop();
        const subCategoryId = subCategoryParam.split('-').pop();
        
        console.log('Extracted IDs:', { categoryId, subCategoryId });
        
        // Find category and subcategory info
        const category = allCategory.find(cat => cat._id === categoryId);
        const subCategory = allSubCategory.find(sub => sub._id === subCategoryId);
        
        setCategoryInfo(category);
        setSubCategoryInfo(subCategory);
        
        const response = await Axios({
          ...SummaryApi.getProductByCategoryAndSubCategory,
          data: {
            categoryId: [categoryId],
            subCategoryId: [subCategoryId],
            page: 1,
            limit: 20,
          },
        });

        console.log('Full API Response:', response);
        console.log('Response.data:', response.data);
        
        const { data: responseData } = response;
        console.log('ResponseData:', responseData);
        console.log('ResponseData.success:', responseData.success);
        console.log('ResponseData.data:', responseData.data);
        
        if (responseData.success) {
          console.log('Products found:', responseData.data?.length || 0);
          console.log('Setting data to:', responseData.data);
          setData(responseData.data || []);
        } else {
          console.log('API returned success: false, message:', responseData.message);
          setData([]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        AxiosToastError(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [params.category, params.subCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600">Home</Link>
            {categoryInfo && (
              <>
                <span className="mx-2">/</span>
                <span className="text-green-600 font-medium">{categoryInfo.name}</span>
              </>
            )}
            {subCategoryInfo && (
              <>
                <span className="mx-2">/</span>
                <span className="text-green-600 font-medium">{subCategoryInfo.name}</span>
              </>
            )}
          </nav>
        </div>

        {/* All Categories - Mobile Hamburger Menu */}
        <div className="mb-6">
          {/* Mobile Categories Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowCategoriesMenu(!showCategoriesMenu)}
              className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border w-full justify-between"
            >
              <span className="font-semibold">Browse Categories</span>
              <svg className={`w-5 h-5 transition-transform ${showCategoriesMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Mobile Categories Dropdown */}
            {showCategoriesMenu && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto">
                {allCategory
                  .filter(cat => cat._id !== categoryInfo?._id)
                  .map(cat => {
                    const firstSubCategory = allSubCategory.find(sub => 
                      sub.category.some(c => c._id === cat._id)
                    );
                    
                    return (
                      <Link
                        key={cat._id}
                        to={firstSubCategory ? 
                          `/${valideURLConvert(cat.name)}-${cat._id}/${valideURLConvert(firstSubCategory.name)}-${firstSubCategory._id}` :
                          `/category/${valideURLConvert(cat.name)}-${cat._id}`
                        }
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                        onClick={() => setShowCategoriesMenu(false)}
                      >
                                <img 
                                  src={cat.Image && String(cat.Image).startsWith('http') ? cat.Image : (cat.Image ? `${baseURL}${cat.Image}` : noDataImage)}
                                  alt={cat.name}
                                  className="w-8 h-8 object-cover rounded"
                                  onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = noDataImage }}
                                />
                        <span className="font-medium">{cat.name}</span>
                      </Link>
                    );
                  })
                }
              </div>
            )}
          </div>
          
          {/* Desktop Categories Grid */}
          <div className="hidden sm:block">
            <h2 className="text-xl font-semibold mb-4">Browse All Categories</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
              {allCategory
                .filter(cat => cat._id !== categoryInfo?._id)
                .map(cat => {
                  const firstSubCategory = allSubCategory.find(sub => 
                    sub.category.some(c => c._id === cat._id)
                  );
                  
                  return (
                    <Link
                      key={cat._id}
                      to={firstSubCategory ? 
                        `/${valideURLConvert(cat.name)}-${cat._id}/${valideURLConvert(firstSubCategory.name)}-${firstSubCategory._id}` :
                        `/category/${valideURLConvert(cat.name)}-${cat._id}`
                      }
                      className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                    >
                      <img 
                        src={cat.Image && String(cat.Image).startsWith('http') ? cat.Image : (cat.Image ? `${baseURL}${cat.Image}` : noDataImage)}
                        alt={cat.name}
                        className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 object-cover rounded"
                        onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = noDataImage }}
                      />
                      <p className="text-xs font-medium truncate">{cat.name}</p>
                    </Link>
                  );
                })
              }
            </div>
          </div>
        </div>

        {/* Active Category Header */}
        {categoryInfo && (
          <div className="mb-6 sm:mb-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm border-2 border-green-200">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <img 
                src={categoryInfo.Image && String(categoryInfo.Image).startsWith('http') ? categoryInfo.Image : (categoryInfo.Image ? `${baseURL}${categoryInfo.Image}` : noDataImage)}
                alt={categoryInfo.name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = noDataImage }}
              />
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{categoryInfo.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Explore our {categoryInfo.name.toLowerCase()} collection</p>
              </div>
            </div>
          </div>
        )}

        {/* Subcategories */}
        {categoryInfo && (
          <div className="mb-6 sm:mb-8">
            {/* Mobile Subcategories Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowSubCategoriesMenu(!showSubCategoriesMenu)}
                className="flex items-center gap-2 bg-white rounded-lg p-3 shadow-sm border w-full justify-between mb-2"
              >
                <span className="font-semibold">Browse {categoryInfo.name} Subcategories</span>
                <svg className={`w-5 h-5 transition-transform ${showSubCategoriesMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Current Subcategory Display */}
              {subCategoryInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                      {subCategoryInfo.image && subCategoryInfo.image.length > 0 ? (
                        <img 
                          src={Array.isArray(subCategoryInfo.image) ? subCategoryInfo.image[0] : subCategoryInfo.image} 
                          alt={subCategoryInfo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-green-700">Current: {subCategoryInfo.name}</span>
                  </div>
                </div>
              )}
              
              {/* Mobile Subcategories Dropdown */}
              {showSubCategoriesMenu && (
                <div className="bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto">
                  {allSubCategory
                    .filter(sub => sub.category.some(cat => cat._id === categoryInfo._id))
                    .map(sub => (
                      <Link
                        key={sub._id}
                        to={`/${valideURLConvert(categoryInfo.name)}-${categoryInfo._id}/${valideURLConvert(sub.name)}-${sub._id}`}
                        className={`flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 ${
                          sub._id === subCategoryInfo?._id ? 'bg-green-50' : ''
                        }`}
                        onClick={() => setShowSubCategoriesMenu(false)}
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {sub.image && sub.image.length > 0 ? (
                            <img 
                              src={Array.isArray(sub.image) ? sub.image[0] : sub.image} 
                              alt={sub.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: sub.image && sub.image.length > 0 ? 'none' : 'flex'}}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <span className="font-medium">{sub.name}</span>
                        {sub._id === subCategoryInfo?._id && (
                          <svg className="w-4 h-4 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
            
            {/* Desktop Subcategories Grid */}
            <div className="hidden sm:block">
              <h2 className="text-xl font-semibold mb-4">Browse {categoryInfo.name} Subcategories</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allSubCategory
                  .filter(sub => sub.category.some(cat => cat._id === categoryInfo._id))
                  .map(sub => (
                    <Link
                      key={sub._id}
                      to={`/${valideURLConvert(categoryInfo.name)}-${categoryInfo._id}/${valideURLConvert(sub.name)}-${sub._id}`}
                      className={`bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow ${
                        sub._id === subCategoryInfo?._id ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                    >
                      <div className="w-14 h-14 mx-auto mb-2 bg-gray-100 rounded overflow-hidden">
                        {sub.image && sub.image.length > 0 ? (
                          <img 
                            src={Array.isArray(sub.image) ? sub.image[0] : sub.image} 
                            alt={sub.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: sub.image && sub.image.length > 0 ? 'none' : 'flex'}}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm font-medium truncate">{sub.name}</p>
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            {subCategoryInfo ? `${subCategoryInfo.name} Products` : 'Products'} ({data.length})
          </h2>
        </div>
        
        {data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {data.map((product, index) => (
              <CardProduct key={product._id || index} data={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 text-base sm:text-lg mb-2">No products available yet</p>
            <p className="text-gray-400 text-xs sm:text-sm">Check back soon for new products in this category!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductListPage;
