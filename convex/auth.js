import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // Also save the display name entered on the sign-up form
      profile(params) {
        return {
          email: params.email,
          name: params.name,
        };
      },
    }),
  ],
});