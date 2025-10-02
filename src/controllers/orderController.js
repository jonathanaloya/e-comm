import Flutterwave from "flutterwave-node-v3";
import Cart from "../models/cartProductModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import dotenv from "dotenv";
import { sendOrderConfirmationEmail } from "../services/emailService.js";
dotenv.config();

// Initialize Flutterwave with error handling
let flw;
try {
  console.log("Initializing Flutterwave SDK...");
  console.log(
    "FLUTTERWAVE_PUBLIC_KEY present:",
    !!process.env.FLUTTERWAVE_PUBLIC_KEY
  );
  console.log(
    "FLUTTERWAVE_SECRET_KEY present:",
    !!process.env.FLUTTERWAVE_SECRET_KEY
  );

  // Try different initialization approaches
  if (typeof Flutterwave === "function") {
    flw = new Flutterwave(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    );
    console.log("Flutterwave initialized with direct constructor");
  } else if (Flutterwave.default && typeof Flutterwave.default === "function") {
    flw = new Flutterwave.default(
      process.env.FLUTTERWAVE_PUBLIC_KEY,
      process.env.FLUTTERWAVE_SECRET_KEY
    );
    console.log("Flutterwave initialized with default export");
  } else {
    console.error("Flutterwave constructor not found");
  }

  if (flw) {
    console.log("Flutterwave SDK initialized successfully");
  } else {
    console.error("Failed to initialize Flutterwave SDK");
  }
} catch (error) {
  console.error("Error initializing Flutterwave:", error);
}

// Utility function for Flutterwave webhook signature verification
export function verifyFlutterwaveWebhook(signature, secretHash, rawBody) {
  if (!signature || !secretHash || !rawBody) {
    return false;
  }
  const hash = crypto
    .createHmac("sha256", secretHash)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    // Validate required fields
    if (
      !userId ||
      !list_items ||
      !Array.isArray(list_items) ||
      list_items.length === 0 ||
      !addressId
    ) {
      return response.status(400).json({
        message: "Missing required fields: userId, list_items, or addressId",
        error: true,
        success: false,
      });
    }

    // Validate each item in list_items
    for (const item of list_items) {
      if (
        !item.productId ||
        !item.productId._id ||
        (!item.price && !item.productId.price) ||
        !item.quantity
      ) {
        return response.status(400).json({
          message:
            "Invalid item in list_items: missing productId, price, or quantity",
          error: true,
          success: false,
          debug: {
            hasProductId: !!item.productId,
            hasProductIdId: !!item.productId?._id,
            hasPrice: !!item.price,
            hasProductPrice: !!item.productId?.price,
            hasQuantity: !!item.quantity,
          },
        });
      }
    }

    // Calculate delivery fee for COD orders
    const validTotalAmt = Number(totalAmt) || Number(subTotalAmt) || 0;
    const deliveryFee = await calculateDeliveryFeeWithAddress(
      addressId,
      validTotalAmt
    );
    const finalTotalAmt = validTotalAmt + deliveryFee;

    // Prepare items array and calculate order total
    let items = [];
    let subTotal = 0;
    for (const el of list_items) {
      const price =
        Number(el.price) ||
        Number(el.productId?.price) -
          (Number(el.productId?.price) * Number(el.discount || 0)) / 100 ||
        0;
      const quantity = Number(el.quantity) || 1;
      const itemTotal = price * quantity;
      subTotal += itemTotal;
      items.push({
        productId: el.productId._id,
        product_details: {
          name: el.productId.name,
          image: el.productId.image,
        },
        price,
        quantity,
        itemTotal,
      });
    }

    const orderDoc = {
      userId: userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      items: items,
      paymentId: "", // No paymentId for COD
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt: subTotal,
      totalAmt: subTotal + deliveryFee,
      deliveryFee: deliveryFee,
    };

    const generatedOrder = await Order.create(orderDoc);

    ///remove from the cart
    const removeCartItems = await Cart.deleteMany({ userId: userId });
    const updateInUser = await User.updateOne(
      { _id: userId },
      { shopping_cart: [] }
    );

    // Send order confirmation email and admin notification
    try {
      const user = await User.findById(userId);
      const address = await (
        await import("../models/addressModel.js")
      ).default.findById(addressId);

      if (user && user.email) {
        const orderForEmail = {
          mainOrderId: generatedOrder.orderId,
          orderId: generatedOrder.orderId,
          createdAt: generatedOrder.createdAt,
          payment_status: generatedOrder.payment_status,
          order_status: "confirmed",
          totalAmount: generatedOrder.totalAmt,
          deliveryFee: generatedOrder.deliveryFee,
          items: generatedOrder.items.map((item) => ({
            product_details: item.product_details,
            quantity: item.quantity,
            totalAmt: item.itemTotal,
            name: item.product_details.name,
            price: item.price,
          })),
        };

        // Send customer confirmation
        await sendOrderConfirmationEmail(orderForEmail, user, address);
        // Send admin notification
        const { sendAdminOrderNotification } = await import(
          "../services/emailService.js"
        );
        await sendAdminOrderNotification(orderForEmail, user, address);
      }
    } catch (emailError) {
      // Don't fail the order if email fails
    }

    return response.json({
      message: "Order successfully",
      error: false,
      success: true,
      data: generatedOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmout);
  return actualPrice;
};

// Delivery fee calculation based on location (Jumia Uganda style)
function calculateDeliveryFee(addressId, cartTotal = 0) {
  // Jumia Uganda delivery fee structure
  const deliveryRates = {
    // Kampala Central areas
    kampala_central: {
      fee: 4000, // 3,000 UGX
      freeDeliveryThreshold: 50000, // Free delivery above 50,000 UGX
    },
    // Kampala suburbs
    kampala_suburbs: {
      fee: 6000, // 4,000 UGX
      freeDeliveryThreshold: 75000, // Free delivery above 75,000 UGX
    },
    // Wakiso, Mukono (Greater Kampala)
    greater_kampala: {
      fee: 5000, // 5,000 UGX
      freeDeliveryThreshold: 100000, // Free delivery above 100,000 UGX
    },
    // Major cities (Jinja, Mbarara, Gulu, etc.)
    major_cities: {
      fee: 15000, // 7,000 UGX
      freeDeliveryThreshold: 150000, // Free delivery above 150,000 UGX
    },
    // Other towns
    other_towns: {
      fee: 25000, // 10,000 UGX
      freeDeliveryThreshold: 200000, // Free delivery above 200,000 UGX
    },
    // Default
    default: {
      fee: 5000, // 5,000 UGX
      freeDeliveryThreshold: 100000, // Free delivery above 100,000 UGX
    },
  };

  // Determine delivery zone based on address (Jumia Uganda zones)
  function getDeliveryZone(address) {
    if (!address) return "default";

    const city = address.city?.toLowerCase() || "";
    const state = address.state?.toLowerCase() || "";
    const addressLine = address.address_line?.toLowerCase() || "";

    // Kampala Central (CBD, Nakasero, Kololo, etc.)
    if (
      addressLine.includes("central") ||
      addressLine.includes("cbd") ||
      addressLine.includes("nakasero") ||
      addressLine.includes("kololo") ||
      addressLine.includes("bugolobi") ||
      addressLine.includes("muyenga") ||
      city.includes("kampala central")
    ) {
      return "kampala_central";
    }

    // Kampala suburbs
    if (
      city.includes("kampala") ||
      state.includes("kampala") ||
      addressLine.includes("kampala") ||
      addressLine.includes("ntinda") ||
      addressLine.includes("kiwatule") ||
      addressLine.includes("najera") ||
      addressLine.includes("kansanga") ||
      addressLine.includes("ggaba") ||
      addressLine.includes("kabalagala")
    ) {
      return "kampala_suburbs";
    }

    // Greater Kampala (Wakiso, Mukono, Entebbe)
    if (
      city.includes("wakiso") ||
      state.includes("wakiso") ||
      addressLine.includes("wakiso") ||
      city.includes("mukono") ||
      state.includes("mukono") ||
      addressLine.includes("mukono") ||
      city.includes("entebbe") ||
      state.includes("entebbe") ||
      addressLine.includes("entebbe") ||
      addressLine.includes("nansana") ||
      addressLine.includes("kira") ||
      addressLine.includes("bweyogerere") ||
      addressLine.includes("kyanja")
    ) {
      return "greater_kampala";
    }

    // Major cities
    if (
      city.includes("jinja") ||
      addressLine.includes("jinja") ||
      city.includes("mbarara") ||
      addressLine.includes("mbarara") ||
      city.includes("gulu") ||
      addressLine.includes("gulu") ||
      city.includes("lira") ||
      addressLine.includes("lira") ||
      city.includes("fort portal") ||
      addressLine.includes("fort portal") ||
      city.includes("mbale") ||
      addressLine.includes("mbale") ||
      city.includes("masaka") ||
      addressLine.includes("masaka") ||
      city.includes("soroti") ||
      addressLine.includes("soroti")
    ) {
      return "major_cities";
    }

    // Default to other towns
    return "other_towns";
  }

  try {
    // If no address provided, return default fee
    if (!addressId) {
      const defaultRate = deliveryRates.default;
      return cartTotal >= defaultRate.freeDeliveryThreshold
        ? 0
        : defaultRate.fee;
    }

    // Determine delivery zone based on actual address data
    const zone = getDeliveryZone(addressId);
    const rate = deliveryRates[zone] || deliveryRates.default;

    // Check if eligible for free delivery
    if (cartTotal >= rate.freeDeliveryThreshold) {
      return 0;
    }

    return rate.fee;
  } catch (error) {
    return deliveryRates.default.fee;
  }
}

// Enhanced delivery fee calculation (Jumia Uganda style)
export async function calculateDeliveryFeeWithAddress(
  addressId,
  cartTotal = 0
) {
  try {
    // Import Address model dynamically to avoid circular dependency
    const { default: Address } = await import("../models/addressModel.js");

    if (addressId) {
      const address = await Address.findById(addressId);
      if (address) {
        // Use zone-based calculation (like Jumia)
        const deliveryFee = calculateDeliveryFee(address, cartTotal);
        return deliveryFee;
      }
    }

    return calculateDeliveryFee(null, cartTotal);
  } catch (error) {
    return calculateDeliveryFee(null, cartTotal);
  }
}

// Format phone number for Uganda mobile money
function formatUgandaPhoneNumber(phoneNumber) {
  if (!phoneNumber) return "256700000000"; // Default fallback

  let formatted = phoneNumber.toString().replace(/\s+/g, ""); // Remove spaces

  // Remove leading + if present
  if (formatted.startsWith("+")) {
    formatted = formatted.substring(1);
  }

  // If it starts with 256 (Uganda country code), use as is
  if (formatted.startsWith("256")) {
    return formatted;
  }

  // If it starts with 0, replace with 256
  if (formatted.startsWith("0")) {
    return "256" + formatted.substring(1);
  }

  // If it's just the local number (7XX, 3XX, etc.), add 256
  if (
    formatted.length >= 9 &&
    (formatted.startsWith("7") ||
      formatted.startsWith("3") ||
      formatted.startsWith("4"))
  ) {
    return "256" + formatted;
  }

  // Fallback to default
  return "256700000000";
}

export async function paymentController(request, response) {
  try {
    // Check if Flutterwave is properly initialized
    if (!flw) {
      return response.status(500).json({
        message: "Payment service not available. Please contact support.",
        error: true,
        success: false,
      });
    }

    const userId = request.userId; // From auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    if (
      !userId ||
      !list_items ||
      list_items.length === 0 ||
      !totalAmt ||
      !addressId
    ) {
      return response.status(400).json({
        message:
          "Missing required order details: userId, list_items, totalAmt, or addressId.",
        error: true,
        success: false,
      });
    }

    // Calculate delivery fee based on subtotal (not the total that may already include delivery)
    const subTotal = subTotalAmt || totalAmt;
    const deliveryFee = await calculateDeliveryFeeWithAddress(
      addressId,
      subTotal
    );
    const finalTotalAmt = subTotal + deliveryFee;

    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    // Unique transaction reference for Flutterwave
    const tx_ref = `FLW-${uuidv4().substring(0, 8)}-${Date.now()}`;

    // Group ID to link all items in this checkout
    const mainOrderId = `ORD-GROUP-${uuidv4()}`;

    // Create individual Order documents per item with unique orderId
    const orderPromises = list_items.map(async (item) => {
      if (
        !item.productId ||
        !item.productId._id ||
        !item.productId.name ||
        !item.productId.image ||
        !item.price ||
        !item.quantity
      ) {
        throw new Error("Invalid product item structure in list_items.");
      }

      // Use discounted price sent from frontend
      const itemPrice = Number(item.price);
      const itemTotal = itemPrice * item.quantity;

      const uniqueOrderId = `ORD-${uuidv4()}`; // Only use UUID

      return Order.create({
        userId,
        orderId: uniqueOrderId, // guaranteed unique
        mainOrderId: mainOrderId, // group ID
        productId: item.productId._id,
        product_details: {
          name: item.productId.name,
          image: Array.isArray(item.productId.image)
            ? item.productId.image
            : [item.productId.image],
        },
        delivery_address: addressId,
        subTotalAmt: itemTotal, // Use discounted price total
        totalAmt: itemTotal, // Use discounted price total
        deliveryFee: deliveryFee, // Add delivery fee to each order item
        quantity: item.quantity || 1, // Ensure quantity is saved
        paymentId: tx_ref,
        payment_status: "pending",
      });
    });

    const createdOrderDocs = await Promise.all(orderPromises);

    // Always redirect to Vercel site for consistency
    const baseUrl =
      process.env.FRONTEND_URL || "https://e-comm-rho-five.vercel.app";

    console.log("Payment redirect URL: Always using Vercel site", {
      baseUrl,
      finalRedirectUrl: `${baseUrl}/checkout`,
      requestOrigin: request.headers.origin,
    });

    // Prepare payload for Flutterwave v3 payments API (hosted payment)
    const payload = {
      tx_ref: tx_ref,
      amount: finalTotalAmt, // Use final total including delivery fee
      currency: "UGX",
      redirect_url: `${baseUrl}/checkout`,
      payment_options: "card,mobilemoneyuganda",
      customer: {
        email: user.email,
        phonenumber: formatUgandaPhoneNumber(user.mobile),
        name: user.name || "Customer",
      },
      customizations: {
        title: "Fresh Katale",
        description: `Payment for Order ${mainOrderId}`,
        logo: "https://e-comm-rho-five.vercel.app/logo.jpg",
      },
      meta: {
        mainOrderId: mainOrderId,
        userId: userId.toString(),
        expectedAmount: finalTotalAmt,
        expectedCurrency: "UGX",
      },
    };

    // For hosted payments, we'll use direct HTTP API call to Flutterwave
    // since the Node.js SDK doesn't have a direct hosted payment method
    const axios = await import("axios");

    console.log("Flutterwave API call details:", {
      url: "https://api.flutterwave.com/v3/payments",
      hasSecretKey: !!process.env.FLUTTERWAVE_SECRET_KEY,
      secretKeyPrefix: process.env.FLUTTERWAVE_SECRET_KEY?.substring(0, 10),
      payloadKeys: Object.keys(payload),
    });

    let responseData;
    try {
      const flutterwaveResponse = await axios.default.post(
        "https://api.flutterwave.com/v3/payments",
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      responseData = flutterwaveResponse.data;
      console.log("Flutterwave API response:", {
        status: responseData?.status,
        hasLink: !!responseData?.data?.link,
        message: responseData?.message,
      });
    } catch (axiosError) {
      console.error("Flutterwave API error:", {
        status: axiosError.response?.status,
        message: axiosError.response?.data?.message,
        fullError: axiosError.message,
      });
      return response.status(500).json({
        message:
          axiosError.response?.data?.message ||
          "Failed to connect to payment service",
        error: true,
        success: false,
      });
    }

    if (
      responseData &&
      responseData.status === "success" &&
      responseData.data?.link
    ) {
      return response.status(200).json({
        message: "Payment initiated successfully",
        success: true,
        error: false,
        data: responseData.data.link, // Flutterwave v3 API returns link
        mainOrderId: mainOrderId,
        tx_ref: tx_ref,
      });
    } else {
      // Mark orders as failed if Flutterwave initiation fails
      await Order.updateMany(
        { paymentId: tx_ref },
        { payment_status: "failed" }
      );
      return response.status(400).json({
        message: responseData?.message || "Failed to initiate payment",
        error: true,
        success: false,
        flutterwaveResponse: responseData,
      });
    }
  } catch (error) {
    return response.status(500).json({
      message:
        error.message ||
        "An unexpected error occurred during payment initiation",
      error: true,
      success: false,
    });
  }
}

export async function verifyPaymentController(request, response) {
  try {
    // transaction_id is from Flutterwave redirect (query param usually)
    // tx_ref is also from Flutterwave redirect (query param usually)
    const { transaction_id, tx_ref } = request.query; // IMPORTANT: Changed from body to query as per redirect_url

    if (!transaction_id || !tx_ref) {
      return response.status(400).json({
        message:
          "Transaction ID and Transaction Reference are required for verification.",
        success: false,
        error: true,
      });
    }

    // Find the associated orders using the tx_ref
    const pendingOrders = await Order.find({ paymentId: tx_ref });

    if (!pendingOrders || pendingOrders.length === 0) {
      return response.status(404).json({
        message: "No pending orders found for this transaction reference.",
        success: false,
        error: true,
      });
    }

    // Check if any of these orders are already successful (to prevent double processing)
    const alreadySuccessful = pendingOrders.some(
      (order) => order.payment_status === "successful"
    );
    if (alreadySuccessful) {
      return response.status(200).json({
        message: "Payment already successfully verified.",
        success: true,
        error: false,
        // You might return relevant order data here
      });
    }

    const verifyResponse = await flw.Transaction.verify({ id: transaction_id });
    const paymentData = verifyResponse.data; // This is the actual transaction data from Flutterwave

    if (
      verifyResponse.status === "success" &&
      paymentData &&
      paymentData.status === "successful"
    ) {
      // --- IMPORTANT SECURITY CHECKS ---
      // Get expected values from one of the orders (they all share the same totalAmt/currency for the entire transaction)
      const firstOrder = pendingOrders[0];
      const expectedAmount = firstOrder.totalAmt; // This is the totalAmt of an individual item
      const expectedCurrency = "UGX"; // Should be consistent with the currency sent in initiatePayment

      // The original `totalAmt` for the entire cart transaction was saved in `meta.expectedAmount`
      // We need to retrieve the original totalAmt that was passed to Flutterwave for the whole cart.
      // This is best retrieved from the `meta` object that Flutterwave sends back, or from a dedicated Payment model.
      // For now, let's assume `meta` contains `expectedAmount`.
      const expectedTotalAmountForCart = paymentData.meta
        ? paymentData.meta.expectedAmount
        : firstOrder.totalAmt; // Fallback, but meta is best

      if (
        paymentData.amount >= expectedTotalAmountForCart && // Compare actual paid amount vs. expected total cart amount
        paymentData.currency === expectedCurrency &&
        paymentData.tx_ref === tx_ref // Ensure the tx_ref matches
      ) {
        // Payment is successful and all security checks pass
        await Order.updateMany(
          { paymentId: tx_ref }, // Update all orders associated with this tx_ref
          {
            payment_status: "successful",
            paymentId: paymentData.id.toString(), // Store Flutterwave's actual transaction ID
            invoice_receipt: paymentData.flw_ref, // Flutterwave's reference
          }
        );

        // Clear user's cart after successful payment
        const userId = pendingOrders[0].userId;
        console.log("Online Payment: Clearing cart for userId:", userId);

        const cartDeleteResult = await Cart.deleteMany({ userId: userId });
        console.log(
          "Online Payment: Cart items deleted:",
          cartDeleteResult.deletedCount
        );

        const userUpdateResult = await User.updateOne(
          { _id: userId },
          { shopping_cart: [] }
        );
        console.log("Online Payment: User shopping_cart cleared");

        // Send order confirmation email for successful payment
        try {
          const user = await User.findById(userId);
          const address = await (
            await import("../models/addressModel.js")
          ).default.findById(pendingOrders[0].delivery_address);

          if (user && user.email) {
            // Group orders by mainOrderId for email
            const groupedForEmail = {};
            pendingOrders.forEach((order) => {
              const key = order.mainOrderId || order.orderId;
              if (!groupedForEmail[key]) {
                groupedForEmail[key] = {
                  mainOrderId: key,
                  orderId: key,
                  createdAt: order.createdAt,
                  payment_status: "successful",
                  order_status: "confirmed",
                  totalAmount: 0,
                  deliveryFee: order.deliveryFee || 0,
                  items: [],
                };
              }
              groupedForEmail[key].totalAmount += order.totalAmt;
              groupedForEmail[key].items.push({
                product_details: order.product_details,
                quantity: order.quantity,
                totalAmt: order.totalAmt,
                name: order.product_details.name,
                price: order.totalAmt / (order.quantity || 1),
              });
            });

            // Send email for the first/main order group
            const mainOrder = Object.values(groupedForEmail)[0];
            if (mainOrder) {
              await sendOrderConfirmationEmail(mainOrder, user, address);

              // Send admin notification
              const { sendAdminOrderNotification } = await import(
                "../services/emailService.js"
              );
              await sendAdminOrderNotification(mainOrder, user, address);
            }
          }
        } catch (emailError) {
          // Don't fail the payment verification if email fails
        }

        // --- FULFILLMENT LOGIC HERE ---
        // For example:
        // - Update inventory for each product in `pendingOrders`
        // - Send order confirmation emails to the user

        return response.status(200).json({
          message: "Payment verified successfully",
          success: true,
          error: false,
          data: paymentData,
        });
      } else {
        // Amount, currency, or tx_ref mismatch - potential fraud or error
        await Order.updateMany(
          { paymentId: tx_ref },
          { payment_status: "failed" }
        );
        return response.status(400).json({
          message:
            "Payment verification failed: Amount, currency, or transaction reference mismatch.",
          success: false,
          error: true,
          flutterwaveData: paymentData,
        });
      }
    } else {
      // Flutterwave verification status is not 'successful'
      await Order.updateMany(
        { paymentId: tx_ref },
        { payment_status: "failed" }
      );
      return response.status(400).json({
        message:
          "Payment verification failed (Flutterwave status not successful)",
        success: false,
        error: true,
        flutterwaveData: paymentData,
      });
    }
  } catch (error) {
    // If an error occurs, it's safer to mark as failed or investigate manually
    // If you encounter an error here, the payment status for orders might still be 'pending'
    // You might want to add a retry mechanism or alert for such cases.
    await Order.updateMany(
      { paymentId: request.query.tx_ref }, // Use tx_ref from query for fallback
      { payment_status: "failed" }
    ).catch((e) =>
      console.error("Error updating orders on verification catch:", e)
    ); // Catch update errors too

    return response.status(500).json({
      message:
        error.message ||
        "An unexpected error occurred during payment verification",
      success: false,
      error: true,
    });
  }
}

// <<< NEW: Exporting this helper function so the webhook handler can use it
export const getOrderProductItems = async ({
  originalListItems,
  userId,
  addressId,
  paymentId,
  payment_status,
}) => {
  const productList = [];

  if (originalListItems && originalListItems.length > 0) {
    for (const item of originalListItems) {
      const itemPriceAfterDiscount = pricewithDiscount(
        item.price,
        item.discount
      ); // Use item.price/discount from meta
      const subTotalForItem = itemPriceAfterDiscount * item.quantity;

      const payload = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: item.productId, // Directly use productId from meta
        product_details: {
          name: item.name, // Directly use name from meta
          image: item.image, // Directly use image from meta
        },
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: subTotalForItem,
        totalAmt: subTotalForItem,
        quantity: item.quantity,
        unitPriceCharged: itemPriceAfterDiscount,
      };

      productList.push(payload);
    }
  }

  return productList;
};

// <<< REMOVED: The old webhookStripe function is removed.
// <<< NEW: This is the combined Flutterwave webhook handler function.
export async function webhookFlutterwaveController(request, response) {
  try {
    // Verify request signature
    const hash = crypto
      .createHmac(
        "sha256",
        process.env.FLUTTERWAVE_WEBHOOK_SECRET || process.env.FLW_SECRET_HASH
      ) // Use consistent env var
      .update(JSON.stringify(request.body))
      .digest("hex");

    // Use secure comparison to prevent timing attacks
    const expectedHash = request.headers["verif-hash"];
    if (
      !expectedHash ||
      !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))
    ) {
      return response.status(401).json({ message: "Invalid signature" });
    }

    const event = request.body;

    if (event.event === "charge.completed") {
      const data = event.data;
      const { status, id, tx_ref, flw_ref, meta } = data;

      if (status === "successful") {
        // Update orders using tx_ref (paymentId) instead of orderId
        const updateResult = await Order.updateMany(
          { paymentId: tx_ref },
          {
            payment_status: "successful",
            paymentId: id.toString(),
            invoice_receipt: flw_ref,
          }
        );

        // Clear user's cart if payment is successful
        if (meta?.userId) {
          console.log("Webhook: Clearing cart for userId:", meta.userId);
          const webhookCartDelete = await Cart.deleteMany({
            userId: meta.userId,
          });
          console.log(
            "Webhook: Cart items deleted:",
            webhookCartDelete.deletedCount
          );
          await User.updateOne({ _id: meta.userId }, { shopping_cart: [] });
          console.log("Webhook: User shopping_cart cleared");
        }
      } else {
        const updateResult = await Order.updateMany(
          { paymentId: tx_ref },
          { payment_status: "failed" }
        );
      }
    }

    return response.status(200).json({ status: "ok" });
  } catch (error) {
    return response.status(500).json({ message: "Webhook processing failed" });
  }
}

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId; // order id

    const orderlist = await Order.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address")
      .populate("productId", "name price image category");

    // Group orders by mainOrderId for better display
    const groupedOrders = {};
    const ungroupedOrders = [];

    orderlist.forEach((order) => {
      if (order.mainOrderId) {
        if (!groupedOrders[order.mainOrderId]) {
          groupedOrders[order.mainOrderId] = {
            mainOrderId: order.mainOrderId,
            createdAt: order.createdAt,
            payment_status: order.payment_status,
            order_status: order.order_status,
            delivery_address: order.delivery_address,
            paymentId: order.paymentId,
            items: [],
            totalAmount: 0,
            deliveryFee: order.deliveryFee || 0,
          };
        }
        groupedOrders[order.mainOrderId].items.push(order);
        groupedOrders[order.mainOrderId].totalAmount += order.totalAmt;
      } else {
        ungroupedOrders.push(order);
      }
    });

    const formattedOrders = {
      groupedOrders: Object.values(groupedOrders),
      individualOrders: ungroupedOrders,
      totalOrders: orderlist.length,
    };

    return response.json({
      message: "order list",
      data: formattedOrders,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// API endpoint to calculate delivery fee with distance
export async function calculateDeliveryFeeController(request, response) {
  try {
    const { addressId, cartTotal, coordinates } = request.body;

    if (!addressId || cartTotal === undefined) {
      return response.status(400).json({
        message: "Address ID and cart total are required",
        error: true,
        success: false,
      });
    }

    // If coordinates are provided, update the address with coordinates
    if (coordinates && coordinates.lat && coordinates.lng) {
      const { default: Address } = await import("../models/addressModel.js");

      await Address.findByIdAndUpdate(addressId, {
        coordinates: coordinates,
      });
    }

    const deliveryFee = await calculateDeliveryFeeWithAddress(
      addressId,
      cartTotal
    );
    const finalTotal = cartTotal + deliveryFee;

    return response.json({
      message: "Delivery fee calculated successfully",
      data: {
        deliveryFee: deliveryFee,
        cartTotal: cartTotal,
        finalTotal: finalTotal,
        isFreeDelivery: deliveryFee === 0,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Failed to calculate delivery fee",
      error: true,
      success: false,
    });
  }
}
