const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/forgot-password/reset",
];

const roleHomeRoute: Record<string, string> = {
  admin: "/admin",
  technician: "/technician",
  supervisor: "/supervisor",
};

const roleRoutePrefix: Record<string, string> = {
  admin: "/admin",
  technician: "/technician",
  supervisor: "/supervisor",
};

export { publicRoutes, roleHomeRoute, roleRoutePrefix };
