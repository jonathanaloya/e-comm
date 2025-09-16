// src/components/Flutterwave.jsx

import React from "react";
import toast from "react-hot-toast"; 
import Axios from "axios";

const FlutterwavePaymentButton = ({
  amount,
  email,
  name,
  phone,
  cartItemsList,
  addressList,
  selectAddress,
  fetchCartItem,
  fetchOrder,
  onSuccess,
  onClose,
}) => {

  const initiatePayment = async () => {
    if (!amount || !email || !name || !phone) {
      toast.error("Please ensure all customer and amount details are provided.");
      return;
    }

    if (selectAddress === -1 || !addressList[selectAddress]?._id) {
      toast.error("Please select an address before proceeding with payment.");
      return;
    }

    try {
      // 1️⃣ Call backend /checkout API
      const res = await Axios.post(
        `${process.env.REACT_APP_API_URL}/api/order/checkout`,
        {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: amount,
          totalAmt: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success && res.data.data) {
        const flutterwaveLink = res.data.data;

        // 2️⃣ Redirect user to Flutterwave checkout
        window.location.href = flutterwaveLink;

      } else {
        toast.error(res.data.message || "Failed to initiate payment.");
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Something went wrong while initiating payment.");
      if (onClose) onClose();
    }
  };

  return (
    <button
      className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
      onClick={initiatePayment}
      disabled={!amount || !email || !name || !phone}
    >
      Online Payment
    </button>
  );
};

export default FlutterwavePaymentButton;
