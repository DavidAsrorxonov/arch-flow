import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

function routeFromEnv(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    return new URL(value).pathname;
  } catch {
    return fallback;
  }
}

const signInRoute = routeFromEnv(
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  "/sign-in",
);
const signUpRoute = routeFromEnv(
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  "/sign-up",
);

const isPublicRoute = createRouteMatcher([
  "/",
  `${signInRoute}(.*)`,
  `${signUpRoute}(.*)`,
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
