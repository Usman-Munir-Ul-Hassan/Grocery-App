import mongoose, { Schema } from "mongoose";
import { userSchema, UserRole, IUser } from "./user";
import { hashPassword } from "../utils/password";

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

// Mongoose pre-save hook: Automatically hash password if newly created or modified
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await hashPassword(this.password);
  next();
});

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
