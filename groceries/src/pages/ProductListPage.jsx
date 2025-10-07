import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useParams } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";

const ProductListPage = () => {
  const params = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Extract IDs from URL params
        const categoryParam = params.category;
        const subCategoryParam = params.subCategory;
        
        if (!categoryParam || !subCategoryParam) {
          setData([]);
          return;
        }
        
        const categoryId = categoryParam.split('-').pop();
        const subCategoryId = subCategoryParam.split('-').pop();
        
        const response = await Axios({
          ...SummaryApi.getProductByCategoryAndSubCategory,
          data: {
            categoryId,
            subCategoryId,
            page: 1,
            limit: 20,
          },
        });

        const { data: responseData } = response;
        if (responseData.success) {
          setData(responseData.data || []);
        } else {
          setData([]);
        }
      } catch (error) {
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
        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((product) => (
              <CardProduct key={product._id} data={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductListPage;
