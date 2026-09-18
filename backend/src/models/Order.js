import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  quantity: Number,

  price: Number

});

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [orderItemSchema],

  totalPrice: Number,

  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered","cancelled"],
    default: "pending"
  },
      payment: {
      status: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "refunded",
        ],
        default: "pending",
      },

      razorpayOrderId: {
        type: String,
        default: null,
      },

      razorpayPaymentId: {
        type: String,
        default: null,
      },
    },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);