import { Customer, DeliveryPartner, Admin, UserRole } from "../models";

// Check if a user is active or banned
export function checkUserIsActive(user: { isActivated: boolean }): boolean {
  return user.isActivated === true;
}

// Compare plain passwords
export function verifyPassword(inputPassword: string, storedPassword: string): boolean {
  return inputPassword === storedPassword;
}

// Find an existing customer by phone number
export async function findCustomerByPhone(phone: string) {
  return await Customer.findOne({ phone: phone });
}

// Create a new customer if they are logging in for the first time
export async function createNewCustomer(phone: string, email?: string, username?: string) {
  const defaultUsername = username || `customer_${phone.slice(-4)}`;
  const defaultEmail = email || `${phone}@groceryapp.com`;

  const newCustomer = new Customer({
    phone: phone,
    username: defaultUsername,
    email: defaultEmail,
    role: UserRole.CUSTOMER,
    isActivated: true,
  });

  return await newCustomer.save();
}

// Find a delivery partner by their email address
export async function findDeliveryPartnerByEmail(email: string) {
  return await DeliveryPartner.findOne({ email: email });
}

// Find an admin by their email address
export async function findAdminByEmail(email: string) {
  return await Admin.findOne({ email: email });
}
