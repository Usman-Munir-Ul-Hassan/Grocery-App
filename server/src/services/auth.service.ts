import { Customer, DeliveryPartner, Admin, UserRole } from "../models";
import { comparePassword } from "../utils/password";

// Compare plain-text password with hashed password using bcrypt
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await comparePassword(plainPassword, hashedPassword);
}

// Check if a user is active or banned
export function checkUserIsActive(user: { isActivated: boolean }): boolean {
  return user.isActivated === true;
}

// Find an existing customer by phone number
export async function findCustomerByPhone(phone: string) {
  return await Customer.findOne({ phone: phone });
}

// Find an existing customer by email address
export async function findCustomerByEmail(email: string) {
  return await Customer.findOne({ email: email.toLowerCase() });
}

// Register a new customer with their real phone, email, and username
export async function registerNewCustomer(
  phone: string,
  email: string,
  username: string
) {
  const newCustomer = new Customer({
    phone: phone,
    email: email.toLowerCase().trim(),
    username: username.trim(),
    role: UserRole.CUSTOMER,
    isActivated: true,
  });

  return await newCustomer.save();
}

// Find a delivery partner by their email address
export async function findDeliveryPartnerByEmail(email: string) {
  return await DeliveryPartner.findOne({ email: email.toLowerCase() });
}

// Find an admin by their email address
export async function findAdminByEmail(email: string) {
  return await Admin.findOne({ email: email.toLowerCase() });
}

// Find a user in their specific collection using their ID and role
export async function findUserByIdAndRole(userId: string, role: string) {
  if (role === UserRole.CUSTOMER) {
    return await Customer.findById(userId);
  }

  if (role === UserRole.DELIVERY_PARTNER) {
    return await DeliveryPartner.findById(userId);
  }

  if (role === UserRole.ADMIN) {
    return await Admin.findById(userId);
  }

  return null;
}
