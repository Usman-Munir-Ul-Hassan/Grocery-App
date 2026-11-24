import mongoose, { Schema } from "mongoose";
import { userSchema, UserRole, IUser } from "./user";
import { hashPassword } from "../utils/password";

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

// Mongoose pre-save hook: Automatically hash password if newly created or modified
deliveryPartnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await hashPassword(this.password);
  next();
});

export const DeliveryPartner = mongoose.model<IDeliveryPartner>(
  "DeliveryPartner",
  deliveryPartnerSchema
);
