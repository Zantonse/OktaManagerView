import NextAuth from "next-auth";
import OktaProvider from "next-auth/providers/okta";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID!,
      clientSecret: process.env.OKTA_CLIENT_SECRET!,
      issuer: process.env.NEXT_PUBLIC_OKTA_DOMAIN!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign-in, store the Okta user ID and email
      if (account && profile) {
        token.oktaId = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose Okta user ID in the session
      if (session.user) {
        session.user.id = token.oktaId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
