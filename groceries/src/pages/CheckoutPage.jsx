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
import { useNavigate } from 'react-router-dom';
import FlutterwavePaymentButton from '../components/Flutterwave'; // Updated import

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(addressList.length > 0 ? 0 : -1); // Default to first address if available
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const user = useSelector(state => state.user.user);
  const navigate = useNavigate();

  // Update selected address if address list changes
  useEffect(() => {
    if (addressList.length > 0 && selectAddress === -1) setSelectAddress(0);
    if (addressList.length === 0) setSelectAddress(-1);
  }, [addressList]);

  // Prepare customer info for Flutterwave
  const customerEmail = user?.email || "";
  const customerName = user?.name || "";
  const customerPhone = addressList[selectAddress]?.mobile || user?.mobile || "";

  // Cash on Delivery handler
  const handleCashOnDelivery = async () => {
    if (selectAddress === -1 || !addressList[selectAddress]?._id) {
      toast.error("Please select an address before proceeding with Cash on Delivery.");
      return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        }
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) fetchCartItem();
        if (fetchOrder) fetchOrder();
        navigate('/success', { state: { text: "Order" } });
      }

    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Flutterwave Payment handlers
  const handleOnlinePaymentSuccess = async (flutterwaveResponse) => {
    if (selectAddress === -1 || !addressList[selectAddress]?._id) {
      toast.error("Please select an address before proceeding with Online Payment.");
      return;
    }

    console.log("Payment successful, Flutterwave response:", flutterwaveResponse);

    try {
      const response = await Axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/checkout`,
        {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
          paymentId: flutterwaveResponse.transaction_id,
          paymentStatus: flutterwaveResponse.status,
          paymentMethod: "Flutterwave",
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message || "Order placed successfully!");
        if (fetchCartItem) fetchCartItem();
        if (fetchOrder) fetchOrder();
        navigate("/success", { state: { text: "Order" } });
      } else {
        toast.error(responseData.message || "Failed to create order after payment.");
      }
    } catch (error) {
      console.error("Error creating order after payment:", error);
      toast.error("Something went wrong while creating your order.");
    }
  };

  const handleOnlinePaymentClose = () => {
    console.log("Flutterwave payment modal closed.");
    toast.info("Payment was not completed.");
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
                <div className={`border rounded p-3 flex gap-3 hover:bg-blue-50 cursor-pointer ${selectAddress == index ? 'border-green-600 ring-2 ring-green-600' : ''}`}>
                  <input
                    id={"address" + index}
                    type='radio'
                    value={index}
                    onChange={() => setSelectAddress(index)}
                    name='address'
                    checked={selectAddress == index}
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
            {/* Flutterwave Payment Button */}
            <FlutterwavePaymentButton
              cartItemsList={cartItemsList}
              amount={totalPrice}
              addressList={addressList}
              selectAddress={selectAddress}
              email={customerEmail}
              name={customerName}
              phone={customerPhone}
              fetchCartItem={fetchCartItem}
              fetchOrder={fetchOrder}
              onSuccess={handleOnlinePaymentSuccess}
              onClose={handleOnlinePaymentClose}
              disabled={
                selectAddress === -1 || !customerEmail || !customerName || !customerPhone
              }
            />

            {/* Cash on Delivery */}
            <button
              className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white rounded'
              onClick={handleCashOnDelivery}
              disabled={selectAddress === -1}
            >
              Cash on Delivery
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;
