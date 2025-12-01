import { createContext, useContext, useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch, useSelector } from "react-redux";
import { handleAddItemCart } from "../store/cartProduct";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { handleAddAddress } from "../store/addressSlice";
import { setOrder } from "../store/orderSlice";
import { logout } from "../store/userSlice";

const GlobalContext = createContext(null);

const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state?.user);

  const fetchCartItem = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data || []));
      } else {
        dispatch(handleAddItemCart([]));
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.sessionExpired) {
        dispatch(logout());
        dispatch(setOrder([]));
      }
      dispatch(handleAddItemCart([]));
    }
  };

  const updateCartItem = async (id, qty) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: id,
          qty: qty,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        // toast.success(responseData.message)
        fetchCartItem();
        return responseData;
      }
    } catch (error) {
      AxiosToastError(error);
      return error;
    }
  };
  const deleteCartItem = async (cartId) => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: {
          _id: cartId,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  useEffect(() => {
    const qty = cartItem.reduce((preve, curr) => {
      return preve + curr.quantity;
    }, 0);
    setTotalQty(qty);

    const tPrice = cartItem.reduce((preve, curr) => {
      const priceAfterDiscount = pricewithDiscount(
        curr?.productId?.price,
        curr?.productId?.discount
      );

      return preve + priceAfterDiscount * curr.quantity;
    }, 0);
    setTotalPrice(tPrice);

    const notDiscountPrice = cartItem.reduce((preve, curr) => {
      return preve + curr?.productId?.price * curr.quantity;
    }, 0);
    setNotDiscountTotalPrice(notDiscountPrice);
  }, [cartItem]);

  const handleLogoutOut = async () => {
    try {
      // Call backend logout API
      await Axios({
        ...SummaryApi.logout
      });
    } catch (error) {
      // Ignore logout API errors
    } finally {
      // Preserve device ID to keep device trusted
      const deviceId = localStorage.getItem('deviceId');
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore device ID
      if (deviceId) {
        localStorage.setItem('deviceId', deviceId);
      }
      
      // Clear Redux states
      dispatch(logout());
      dispatch(handleAddItemCart([]));
      dispatch(handleAddAddress([]));
      dispatch(setOrder([]));
    }
  };

  const fetchAddress = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getAddress,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.sessionExpired) {
        dispatch(logout());
        dispatch(handleAddItemCart([]));
        dispatch(setOrder([]));
      }
    }
  };
  const fetchOrder = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getOrderItems,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        dispatch(setOrder(responseData.data));
      }
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data?.sessionExpired) {
        dispatch(logout());
        dispatch(handleAddItemCart([]));
        dispatch(setOrder([]));
      }
    }
  };

  useEffect(() => {
    if (user?._id) {
      const orderCompleted = sessionStorage.getItem('orderCompleted');
      if (orderCompleted) {
        dispatch(handleAddItemCart([]));
        sessionStorage.removeItem('orderCompleted');
      } else {
        fetchCartItem();
      }
      fetchAddress();
    }
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
        fetchCartItem,
        updateCartItem,
        deleteCartItem,
        fetchAddress,
        totalPrice,
        totalQty,
        notDiscountTotalPrice,
        fetchOrder,
        handleLogoutOut,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
export { useGlobalContext };