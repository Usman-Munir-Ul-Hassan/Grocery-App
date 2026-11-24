import mongoose, { Schema } from "mongoose";
import { userSchema, UserRole, IUser } from "./user";

export interface IAdmin extends IUser {
  password: string;
}

export const adminSchema = new Schema(
  {
    ...userSchema.obj,
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [UserRole.ADMIN],
      default: UserRole.ADMIN,
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
