// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInShillings } from '../utils/DisplayPriceInShillings';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Added Link
import FlutterwavePaymentButton from '../components/Flutterwave'; // Updated import

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);
  const [finalTotal, setFinalTotal] = useState(totalPrice);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(addressList.length > 0 ? 0 : -1); // Default to first address if available
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const user = useSelector(state => state.user.user); // This correctly gets the user object
  const navigate = useNavigate();
  const location = useLocation(); // To check URL params after redirect

  // --- Start: Added for Login Prompt ---
  const isLoggedIn = user?._id; // Simple boolean check for logged-in status
  // --- End: Added for Login Prompt ---

  // Function to calculate delivery fee
  const calculateDeliveryFee = async (addressIndex) => {
    if (addressIndex === -1 || !addressList[addressIndex]?._id) {
      setDeliveryFee(0);
      setFinalTotal(totalPrice);
      return;
    }

    setIsCalculatingDelivery(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL;
      const response = await Axios.post(
        `${API_BASE_URL}/api/order/calculate-delivery-fee`,
        {
          addressId: addressList[addressIndex]._id,
          cartTotal: totalPrice
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // This assumes token is present
          },
        }
      );

      const { data: responseData } = response;
      if (responseData.success) {
        setDeliveryFee(responseData.data.deliveryFee);
        setFinalTotal(responseData.data.finalTotal);
      } else {
        console.error('Failed to calculate delivery fee:', responseData.message);
        setDeliveryFee(8000); // Default delivery fee
        setFinalTotal(totalPrice + 8000);
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      // Fallback: If no token or server error, assume default delivery fee.
      // You might want to handle unauthorized errors specifically (e.g., toast.error("Please login to calculate delivery fee."))
      setDeliveryFee(8000); // Default delivery fee on error
      setFinalTotal(totalPrice + 8000);
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  // Update selected address if address list changes
  useEffect(() => {
    if (addressList.length > 0 && selectAddress === -1) {
      setSelectAddress(0);
      // Only calculate delivery if logged in, otherwise it might fail without token
      if (isLoggedIn) calculateDeliveryFee(0);
    }
    if (addressList.length === 0) setSelectAddress(-1);
  }, [addressList, isLoggedIn]); // Add isLoggedIn to dependency array

  // Calculate delivery fee when address or total price changes
  useEffect(() => {
    if (selectAddress !== -1 && isLoggedIn) { // Only calculate if logged in
      calculateDeliveryFee(selectAddress);
    } else if (!isLoggedIn) {
        // Reset delivery fee and final total if not logged in and can't calculate
        setDeliveryFee(0);
        setFinalTotal(totalPrice);
    }
  }, [selectAddress, totalPrice, isLoggedIn]); // Add isLoggedIn to dependency array

  // Prepare customer info for Flutterwave - ensure these are only used if user is logged in
  const customerEmail = user?.email || "";
  const customerName = user?.name || "";
  const customerPhone = addressList[selectAddress]?.mobile || user?.mobile || "";

  // This `useEffect` hook will run when the component mounts
  // and check for Flutterwave redirect parameters in the URL to verify payment.
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const transaction_id = query.get('transaction_id');
    const tx_ref = query.get('tx_ref');
    const status = query.get('status'); // Flutterwave also sends a status like 'successful', 'cancelled'

    // If we have Flutterwave parameters, it means we've been redirected back
    if (transaction_id && tx_ref) {
      if (status === 'successful') {
        if (isLoggedIn) { // Only verify if logged in
            toast.loading("Verifying payment...");
            verifyPaymentOnBackend(transaction_id, tx_ref);
        } else {
            toast.dismiss();
            toast.error("Please log in to finalize payment verification.");
            navigate('/login?redirect=/checkout' + location.search); // Redirect to login with current search params
        }
      } else if (status === 'cancelled') {
        toast.dismiss();
        toast.error("Payment was cancelled.");
        setIsProcessing(false);
        setPaymentMethod('');
        navigate(location.pathname, { replace: true });
      } else {
        toast.dismiss();
        toast.error("Payment status unknown. Please check your order history.");
        setIsProcessing(false);
        setPaymentMethod('');
      }
    }
  }, [location.search, navigate, isLoggedIn]); // Rerun when search params or login status change


  // Function to call your backend's verification endpoint
  const verifyPaymentOnBackend = async (transaction_id, tx_ref) => {
    if (!isLoggedIn) {
        toast.dismiss();
        toast.error("You must be logged in to verify payment.");
        navigate('/login?redirect=/checkout' + location.search);
        return;
    }
    try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL;
      const response = await Axios.get(
        `${API_BASE_URL}/api/order/verify-payment?transaction_id=${transaction_id}&tx_ref=${tx_ref}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { data: responseData } = response;
      toast.dismiss(); // Dismiss the "Verifying payment" toast

      if (responseData.success) {
        toast.success(responseData.message || "Payment verified and order placed successfully!");
        if (fetchCartItem) fetchCartItem(); // Refresh cart
        if (fetchOrder) fetchOrder();       // Refresh order history
        navigate("/success", { state: { text: "Order" } }); // Navigate to success page
      } else {
        toast.error(responseData.message || "Payment verification failed.");
        navigate("/payment-failed", { state: { tx_ref, message: responseData.message } });
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error verifying payment with backend:", error);
      toast.error("An error occurred during payment verification.");
      navigate("/payment-failed", { state: { tx_ref, message: "Network error during verification." } });
    }
  };


  // Cash on Delivery handler
  const handleCashOnDelivery = async () => {
    if (!isLoggedIn) {
        toast.error("Please log in to place a Cash on Delivery order.");
        navigate('/login?redirect=/checkout');
        return;
    }
    // Validate address selection first
    if (selectAddress === -1 || !addressList[selectAddress]?._id) {
      toast.error("Please select a delivery address first!");
      document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (cartItemsList.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (finalTotal <= 0) {
      toast.error("Total amount must be greater than zero.");
      return;
    }

    setIsProcessing(true);
    setPaymentMethod('COD');
    toast.loading("Processing your order...");

    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]._id,
          subTotalAmt: totalPrice,
          totalAmt: finalTotal, // Use final total including delivery fee
          paymentMethod: "Cash on Delivery", // Explicitly set payment method
        }
      });

      const { data: responseData } = response;
      toast.dismiss();

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) fetchCartItem();
        if (fetchOrder) fetchOrder();
        navigate('/success', { state: { text: "Order" } });
      }

    } catch (error) {
      toast.dismiss();
      AxiosToastError(error);
    } finally {
      setIsProcessing(false);
      setPaymentMethod('');
    }
  };

  // Online payment handler with proper validation
const handleOnlinePaymentInitiation = async () => {
  if (!isLoggedIn) {
        toast.error("Please log in to proceed with online payment.");
        navigate('/login?redirect=/checkout');
        return;
  }
  // Validate address selection first
  if (selectAddress === -1 || !addressList[selectAddress]?._id) {
    toast.error("Please select a delivery address first!");
    document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (cartItemsList.length === 0) {
    toast.error("Your cart is empty!");
    return;
  }

  if (finalTotal <= 0) {
    toast.error("Total amount must be greater than zero.");
    return;
  }

  setIsProcessing(true);
  setPaymentMethod('ONLINE');
  toast.loading("Preparing payment...");

  try {
    const selectedAddressId = addressList[selectAddress]._id;
    const amountToSend = totalPrice; // Or include shipping if needed
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Map cart items to match backend expectation
    const listItems = cartItemsList.map(item => ({
      productId: {
        _id: item.productId._id.toString(), // ensure string
        name: item.productId.name,
        image: Array.isArray(item.productId.image) ? item.productId.image : [item.productId.image]
      },
      quantity: Number(item.quantity),
      price: Number(item.productId.price) // ensure non-zero number
    }));


    const backendResponse = await Axios.post(
      `${API_BASE_URL}/api/order/checkout`,
      {
        userId: user?._id,
        list_items: listItems,
        addressId: selectedAddressId,
        subTotalAmt: totalPrice,
        totalAmt: finalTotal, // Use final total including delivery fee
        customerEmail: customerEmail,
        customerName: customerName,
        customerPhone: customerPhone,
        redirect_url: window.location.origin + '/checkout'
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const { data: responseData } = backendResponse;

    if (responseData.success && responseData.data) {
      toast.dismiss();
      toast.success("Redirecting to payment gateway...");
      
      // Listen for page visibility change to reset processing state if user returns
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // Reset processing state when user returns to page
          setTimeout(() => {
            setIsProcessing(false);
            setPaymentMethod('');
          }, 2000); // Small delay to avoid immediate reset
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Redirect to payment gateway
      window.location.href = responseData.data;
    } else {
      toast.dismiss();
      toast.error(responseData.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
      setPaymentMethod('');
    }
  } catch (error) {
    toast.dismiss();
    console.error("Error initiating payment with backend:", error);
    AxiosToastError(error, "Could not start payment. Please try again.");
    setIsProcessing(false);
    setPaymentMethod('');
  }
};

  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        
        {/* Address Selection */}
        <div className='w-full'>
          <h3 className='text-lg font-semibold mb-2'>Choose your address</h3>
          <div className='bg-white p-2 grid gap-4'>
            {addressList.length > 0 ? addressList.map((address, index) => (
              <label key={address._id} htmlFor={"address" + index} className={!address.status ? "hidden" : ""}>
                <div className={`border rounded p-3 flex gap-3 hover:bg-blue-50 cursor-pointer ${selectAddress === index ? 'border-green-600 ring-2 ring-green-600' : ''}`}>
                  <input
                    id={"address" + index}
                    type='radio'
                    value={index}
                    onChange={() => {
                      setSelectAddress(index);
                      // Only calculate delivery if logged in
                      if (isLoggedIn) calculateDeliveryFee(index);
                    }}
                    name='address'
                    checked={selectAddress === index}
                    className="accent-green-600"
                  />
                  <div>
                    <p className="font-medium">{address.name}</p>
                    <p>{address.address_line}</p>
                    <p>{address.city}, {address.state || ''} - {address.pincode}</p>
                    <p>{address.country}</p>
                    <p>Mobile: {address.mobile}</p>
                  </div>
                </div>
              </label>
            )) : (
              <p className="text-center text-gray-500 py-4">No addresses found. Please add one.</p>
            )}
            {/* Show Add new address button only if logged in or allow guest address? */}
            {isLoggedIn && ( // Only show "Add new address" if logged in
              <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer text-green-600 hover:text-green-700 hover:border-green-700'>
                Add new address
              </div>
            )}
             {!isLoggedIn && (
                <div className='h-16 bg-gray-100 border-2 border-dashed flex justify-center items-center text-gray-400'>
                    Log in to add new address
                </div>
            )}
          </div>
        </div>

        {/* Order Summary & Payments */}
        <div className='w-full max-w-md bg-white py-4 px-2'>
          <h3 className='text-lg font-semibold mb-2'>Summary</h3>
          <div className='bg-white p-4 border rounded'>
            <h3 className='font-semibold mb-2'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1 text-gray-700'>
              <p>Items total</p>
              <p className='flex items-center gap-2'>
                {notDiscountTotalPrice && notDiscountTotalPrice !== totalPrice && (
                  <span className='line-through text-neutral-400'>{DisplayPriceInShillings(notDiscountTotalPrice)}</span>
                )}
                <span>{DisplayPriceInShillings(totalPrice)}</span>
              </p>
            </div>
            <div className='flex gap-4 justify-between ml-1 text-gray-700'>
              <p>Quantity total</p>
              <p className='flex items-center gap-2'>{totalQty} {totalQty > 1 ? 'items' : 'item'}</p>
            </div>
            <div className='flex gap-4 justify-between ml-1 text-gray-700'>
              <p>Delivery Charge</p>
              <p className='flex items-center gap-2'>
                {isCalculatingDelivery ? (
                  <span className="text-sm">Calculating...</span>
                ) : deliveryFee === 0 && isLoggedIn ? ( // Display "Free" only if logged in and calculated
                  <span className="text-green-600 font-medium">Free</span>
                ) : !isLoggedIn ? (
                  <span className="text-gray-500">Log in to calculate</span>
                ) : (
                  <span>{DisplayPriceInShillings(deliveryFee)}</span>
                )}
              </p>
            </div>
            <hr className="my-2 border-gray-200" />
            <div className='font-semibold flex items-center justify-between gap-4 text-lg'>
              <p>Grand total</p>
              <p>
                {isCalculatingDelivery ? (
                  <span className="text-sm">Calculating...</span>
                ) : (
                  DisplayPriceInShillings(finalTotal)
                )}
              </p>
            </div>
          </div>

          <div className='w-full flex flex-col gap-4 mt-4'>
            {/* Conditional rendering for Login Prompt or Payment Buttons */}
            {!isLoggedIn ? (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded" role="alert">
                <p className="font-bold mb-2">Almost there!</p>
                <p>To finalize your order and proceed with payment, please log in to your account.</p>
                <Link
                  to="/login?redirect=/checkout" // Redirect back to checkout after login
                  className="mt-4 w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                >
                  Continue to Login
                </Link>
                {/* Optional: Add a guest checkout option if you implement it */}
                {/* <p className="text-sm mt-2 text-center">Or <Link to="/guest-checkout" className="underline">continue as guest</Link></p> */}
              </div>
            ) : (
              <>
                {/* Online Payment Button */}
                <button
                  className={`py-2 px-4 font-semibold text-white rounded flex items-center justify-center gap-2 ${
                    isProcessing && paymentMethod === 'ONLINE' ? 'bg-gray-400 cursor-not-allowed' :
                    selectAddress === -1 ? 'bg-gray-400 cursor-not-allowed' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={handleOnlinePaymentInitiation}
                  disabled={
                    selectAddress === -1 || cartItemsList.length === 0 || finalTotal <= 0 || (isProcessing && paymentMethod === 'ONLINE') || isCalculatingDelivery
                  }
                >
                  {isProcessing && paymentMethod === 'ONLINE' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : selectAddress === -1 ? (
                    'Select Address First'
                  ) : (
                    'Pay Online'
                  )}
                </button>
                {/* Cash on Delivery Button */}
                <button
                  className={`py-2 px-4 border-2 font-semibold rounded flex items-center justify-center gap-2 ${
                    isProcessing && paymentMethod === 'COD' ? 'border-gray-400 text-gray-400 cursor-not-allowed' :
                    selectAddress === -1 ? 'border-gray-400 text-gray-400 cursor-not-allowed' :
                    'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                  onClick={handleCashOnDelivery}
                  disabled={selectAddress === -1 || cartItemsList.length === 0 || finalTotal <= 0 || (isProcessing && paymentMethod === 'COD') || isCalculatingDelivery}
                >
                  {isProcessing && paymentMethod === 'COD' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Processing...
                    </>
                  ) : selectAddress === -1 ? (
                    'Select Address First'
                  ) : (
                    'Cash on Delivery'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;