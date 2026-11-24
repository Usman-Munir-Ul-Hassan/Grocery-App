import mongoose, { Schema } from "mongoose";
import { userSchema, UserRole, IUser } from "./user";

export interface ILiveLocation {
  latitude: number;
  longitude: number;
}

export interface IDeliveryPartner extends IUser {
  password: string;
  phone?: string;
  liveLocation?: ILiveLocation;
  branch?: mongoose.Types.ObjectId;
}

export const deliveryPartnerSchema = new Schema(
  {
    ...userSchema.obj,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [UserRole.DELIVERY_PARTNER],
      default: UserRole.DELIVERY_PARTNER,
    },
    phone: {
      type: String,
      trim: true,
    },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  { timestamps: true }
);

export const DeliveryPartner = mongoose.model<IDeliveryPartner>(
  "DeliveryPartner",
  deliveryPartnerSchema
);
