import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  ADMIN = "Admin",
  CUSTOMER = "Customer",
  DELIVERY_PARTNER = "DeliveryPartner",
}

export interface IUser extends Document {
  username: string;
  email: string;
  role: UserRole;
  isActivated: boolean;
  clerkId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    isActivated: {
      type: Boolean,
      default: true,
    },
    clerkId: {
      type: String,
      sparse: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
