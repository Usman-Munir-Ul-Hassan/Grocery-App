import mongoose, { Schema, Document } from "mongoose";
import { getNextSequenceValue } from "./counter";

export enum OrderStatus {
  AVAILABLE = "available",
  CONFIRMED = "confirmed",
  ARRIVING = "arriving",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface IOrderItem {
  item: mongoose.Types.ObjectId;
  count: number;
}

export interface ILocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface IOrder extends Document {
  orderId?: string;
  customer: mongoose.Types.ObjectId;
  deliveryPartner?: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryLocation: ILocationPoint;
  pickupLocation: ILocationPoint;
  deliveryPersonLocation?: {
    latitude: number;
    longitude: number;
  };
  totalPrice: number;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    deliveryPartner: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryPartner",
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        count: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    deliveryLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    pickupLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    deliveryPersonLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.AVAILABLE,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderId) {
    const sequenceValue = await getNextSequenceValue("orderId");
    this.orderId = `ORDER-${sequenceValue.toString().padStart(5, "0")}`;
  }
  next();
});

export const Order = mongoose.model<IOrder>("Order", orderSchema);
