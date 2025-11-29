import { Schema, model, Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    cartId: {
      type: Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },

    product: {
      productId: {
        type: Types.ObjectId,
        ref: "Product",
      },
      featuredId: {
        type: Types.ObjectId,
        ref: "Featured",
      },
      size: {
        type: Number,
      },
      unitSize: {
        type: Number,
      },
      range: {
        type: Number,
      },
    },

    serviceId: {
      type: Types.ObjectId,
      ref: "Service",
    },

    cartItems: [cartItemSchema],

    type: {
      type: String,
      enum: ["product", "service", "cart"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    quantity: {
      type: Number,
      min: 1,
    },

    totalAmount: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);
