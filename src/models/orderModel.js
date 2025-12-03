import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      unique: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "product",
          required: true,
        },
        product_details: {
          name: {
            type: String,
            required: true,
          },
          image: {
            type: [String],
            required: true,
          },
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        itemTotal: {
          type: Number,
          required: true,
        },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },

    payment_status: {
      type: String,
      default: "",
    },

    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },

    subTotalAmt: {
      type: Number,
      default: 0,
    },

    totalAmt: {
      type: Number,
      default: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    // quantity is now per item in items array

    mainOrderId: {
      type: String,
      default: "",
    },

    order_status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    invoice_receipt: {
      type: String,
      default: "",
    },

    admin_responses: [
      {
        adminId: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        adminName: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderSchema);

export default Order;
