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
  const [guestCartItems, setGuestCartItems] = useState([]);

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

  const migrateGuestCartToUser = async () => {
    const savedGuestCart = localStorage.getItem('guestCart');
    if (!savedGuestCart) return;
    
    try {
      const guestItems = JSON.parse(savedGuestCart);
      console.log('Migrating guest cart items:', guestItems);
      
      // Add each guest cart item to user's cart
      for (const item of guestItems) {
        try {
          await Axios({
            ...SummaryApi.addTocart,
            data: {
              productId: item._id
            }
          });
          
          // If quantity > 1, update the quantity
          if (item.quantity > 1) {
            // Get the cart item ID after adding
            const cartResponse = await Axios({
              ...SummaryApi.getCartItem,
            });
            
            if (cartResponse.data.success) {
              const userCartItem = cartResponse.data.data.find(cartItem => 
                cartItem.productId._id === item._id
              );
              
              if (userCartItem) {
                await Axios({
                  ...SummaryApi.updateCartItemQty,
                  data: {
                    _id: userCartItem._id,
                    qty: item.quantity
                  }
                });
              }
            }
          }
        } catch (error) {
          console.log('Error migrating item:', item._id, error);
        }
      }
      
      // Clear guest cart after migration
      localStorage.removeItem('guestCart');
      setGuestCartItems([]);
      
      // Fetch updated cart
      fetchCartItem();
      
      toast.success('Cart items transferred successfully!');
    } catch (error) {
      console.error('Error migrating guest cart:', error);
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

  // Load guest cart from localStorage
  useEffect(() => {
    if (!user?._id) {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        setGuestCartItems(JSON.parse(savedCart));
      }
    } else {
      // Clear guest cart when user logs in
      setGuestCartItems([]);
    }
  }, [user]);
  
  // Initial load of guest cart
  useEffect(() => {
    const savedCart = localStorage.getItem('guestCart');
    if (savedCart && !user?._id) {
      setGuestCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Calculate totals for both authenticated and guest users
  useEffect(() => {
    const currentCart = user?._id ? cartItem : guestCartItems;
    
    const qty = currentCart.reduce((preve, curr) => {
      return preve + curr.quantity;
    }, 0);
    setTotalQty(qty);

    const tPrice = currentCart.reduce((preve, curr) => {
      const productData = user?._id ? curr?.productId : curr;
      const priceAfterDiscount = pricewithDiscount(
        productData?.price,
        productData?.discount
      );

      return preve + priceAfterDiscount * curr.quantity;
    }, 0);
    setTotalPrice(tPrice);

    const notDiscountPrice = currentCart.reduce((preve, curr) => {
      const productData = user?._id ? curr?.productId : curr;
      return preve + productData?.price * curr.quantity;
    }, 0);
    setNotDiscountTotalPrice(notDiscountPrice);
  }, [cartItem, guestCartItems, user]);

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
        // Check if there are guest cart items to migrate
        const savedGuestCart = localStorage.getItem('guestCart');
        if (savedGuestCart && JSON.parse(savedGuestCart).length > 0) {
          migrateGuestCartToUser();
        } else {
          fetchCartItem();
        }
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
        guestCartItems,
        setGuestCartItems,
        migrateGuestCartToUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
export { useGlobalContext };