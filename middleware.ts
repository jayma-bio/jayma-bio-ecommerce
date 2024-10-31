import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Make the root path accessible to signed-out users
  publicRoutes: ["/", "/api/:path*"],
  ignoredRoutes: ["/((?!api|trpc))(_next.*|.+\\.[\\w]+$)"], // Ignores static files
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
