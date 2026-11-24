import type { FastifyRequest, FastifyReply } from "fastify";
import { Customer, DeliveryPartner, UserRole } from "../models";
import { sendResponse, sendError } from "../utils/responseHandler";

// Update User: Updates delivery partner's liveLocation (GPS) or customer profile
export async function updateUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { userId, role } = request.user!;

    // 1. Choose the right collection based on the user's role
    let UserModel;
    if (role === UserRole.CUSTOMER) {
      UserModel = Customer;
    } else if (role === UserRole.DELIVERY_PARTNER) {
      UserModel = DeliveryPartner;
    } else {
      request.log.warn(`[tracking.controller.updateUser] -> Invalid role for update: ${role}`);
      return sendError(reply, 400, "Invalid user role for update");
    }

    // 2. Update the document in MongoDB (e.g. liveLocation: { latitude, longitude })
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: request.body },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      request.log.warn(`[tracking.controller.updateUser] -> User not found: ${userId}`);
      return sendError(reply, 404, "User not found");
    }

    // 3. Remove password from the object before sending back
    const userProfile = updatedUser.toObject();
    delete (userProfile as { password?: string }).password;

    return sendResponse(reply, 200, "User updated successfully", userProfile);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    request.log.error(`[tracking.controller.updateUser] -> ${errorMessage}`);
    return sendError(reply, 500, "Failed to update user", error);
  }
}
