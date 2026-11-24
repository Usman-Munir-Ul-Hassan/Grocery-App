import mongoose, { Schema, Document } from "mongoose";

export interface IBranch extends Document {
  name: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  deliveryPartners: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const branchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: {
      type: String,
      trim: true,
    },
    deliveryPartners: [
      {
        type: Schema.Types.ObjectId,
        ref: "DeliveryPartner",
      },
    ],
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranch>("Branch", branchSchema);
