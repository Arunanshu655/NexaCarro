import User from "../models/User.js";

export const requireAuth = async (user) => {
  if (!user) {
    throw new Error("Unauthorized");
  }

  const currentUser = await User.findById(user.id);

  if (!currentUser) {
    throw new Error("User not found");
  }

  return currentUser;
};

export const requireAdmin = async (user) => {
  const currentUser = await requireAuth(user);

  if (currentUser.role !== "admin") {
    throw new Error("Admin access required");
  }

  return currentUser;
};