import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { Link, useParams, useNavigate } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/validURLConvert";

const ProductListPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const allCategory = useSelector(state => state.product.allCategory);
  const allSubCategory = useSelector(state => state.product.allSubCategory);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  
  // Extract IDs from URL params
  useEffect(() => {
    const categoryParam = params.category;
    const subCategoryParam = params.subCategory;
    
    if (categoryParam) {
      const categoryIdFromUrl = categoryParam.split('-').pop();
      setCategoryId(categoryIdFromUrl);
    }
    
    if (subCategoryParam) {
      const subCategoryIdFromUrl = subCategoryParam.split('-').pop();
      setSubCategoryId(subCategoryIdFromUrl);
    }
  }, [params]);
  
  const fetchProductdata = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 8,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data);
        } else {
          setData(prev => [...prev, ...responseData.data]);
        }
        setTotalPage(responseData.totalCount);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  // Full page loading spinner overlay
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
        <Loading />
      </div>
    );
  }

  useEffect(() => {
    if (categoryId && subCategoryId) {
      setPage(1);
      setData([]);
    }
  }, [categoryId, subCategoryId]);
  
  useEffect(() => {
    if (categoryId && subCategoryId && page) {
      fetchProductdata();
    }
  }, [categoryId, subCategoryId, page]);
  
  return (
    <section className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((product) => (
            <CardProduct key={product._id} data={product} />
          ))}
        </div>
        
        {data.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
        
        {data.length > 0 && data.length < totalPage && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setPage(prev => prev + 1)}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductListPage;
