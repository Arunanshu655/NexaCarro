export const requireAuth = (user) => {
  if (!user) {
    throw new Error("Unauthorized");
  }
};

export const requireAdmin = (user) => {
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
};