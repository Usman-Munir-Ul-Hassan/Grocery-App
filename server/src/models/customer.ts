import mongoose, { Schema } from "mongoose";
import { userSchema, UserRole, IUser } from "./user";

export interface ICustomer extends IUser {
  phone?: string;
}

export const customerSchema = new Schema(
  {
    ...userSchema.obj,
    role: {
      type: String,
      enum: [UserRole.CUSTOMER],
      default: UserRole.CUSTOMER,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
