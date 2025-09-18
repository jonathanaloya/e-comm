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
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import FlutterwavePaymentButton from '../components/Flutterwave'; // Updated import

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(addressList.length > 0 ? 0 : -1); // Default to first address if available
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();
  const location = useLocation(); // To check URL params after redirect

  // Update selected address if address list changes
  useEffect(() => {
    if (addressList.length > 0 && selectAddress === -1) setSelectAddress(0);
    if (addressList.length === 0) setSelectAddress(-1);
  }, [addressList]);

  // Prepare customer info for Flutterwave
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
      // It's good practice to clear the URL parameters after processing
      // navigate(location.pathname, { replace: true }); // uncomment if you want to clear URL params

      if (status === 'successful') {
        toast.loading("Verifying payment...");
        verifyPaymentOnBackend(transaction_id, tx_ref);
      } else if (status === 'cancelled') {
        toast.dismiss();
        toast.error("Payment was cancelled or failed on Flutterwave.");
        navigate("/payment-failed", { state: { tx_ref } });
      } else {
        toast.dismiss();
        toast.error("Payment status unknown. Please check your order history.");
      }
    }
  }, [location.search, navigate]); // Rerun when search params change


  // Function to call your backend's verification endpoint
  const verifyPaymentOnBackend = async (transaction_id, tx_ref) => {
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
    if (selectAddress === -1 || !addressList[selectAddress]?._id) {
      toast.error("Please select an address before proceeding with Cash on Delivery.");
      return;
    }
    if (cartItemsList.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (totalPrice <= 0) {
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
          totalAmt: totalPrice,
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

  // Flutterwave Payment handlers
  // This handler is now simplified as the backend initiates the payment redirect
const handleOnlinePaymentInitiation = async () => {
  if (selectAddress === -1 || !addressList[selectAddress]?._id) {
    toast.error("Please select an address before proceeding with Online Payment.");
    return;
  }

  if (cartItemsList.length === 0) {
    toast.error("Your cart is empty!");
    return;
  }

  if (totalPrice <= 0) {
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
        totalAmt: amountToSend,
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
      // Note: We don't reset processing state here because user will be redirected
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
                    onChange={() => setSelectAddress(index)}
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
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer text-green-600 hover:text-green-700 hover:border-green-700'>
              Add new address
            </div>
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
              <p className='flex items-center gap-2'>Free</p>
            </div>
            <hr className="my-2 border-gray-200" />
            <div className='font-semibold flex items-center justify-between gap-4 text-lg'>
              <p>Grand total</p>
              <p>{DisplayPriceInShillings(totalPrice)}</p>
            </div>
          </div>

          <div className='w-full flex flex-col gap-4 mt-4'>
            {/* Flutterwave Payment Button (now triggers backend initiation) */}
            <button
              className={`py-2 px-4 font-semibold text-white rounded flex items-center justify-center gap-2 ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleOnlinePaymentInitiation}
              disabled={
                selectAddress === -1 || cartItemsList.length === 0 || totalPrice <= 0 || isProcessing
              }
            >
              {isProcessing && paymentMethod === 'ONLINE' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                'Pay Online'
              )}
            </button>
            {/* Cash on Delivery */}
            <button
              className={`py-2 px-4 border-2 font-semibold rounded flex items-center justify-center gap-2 ${
                isProcessing ? 'border-gray-400 text-gray-400 cursor-not-allowed' : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
              }`}
              onClick={handleCashOnDelivery}
              disabled={selectAddress === -1 || cartItemsList.length === 0 || totalPrice <= 0 || isProcessing}
            >
              {isProcessing && paymentMethod === 'COD' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                'Cash on Delivery'
              )}
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;