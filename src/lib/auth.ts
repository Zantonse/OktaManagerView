import NextAuth from "next-auth";
import OktaProvider from "next-auth/providers/okta";

async function refreshAccessToken(token: import("next-auth/jwt").JWT) {
  const domain = process.env.NEXT_PUBLIC_OKTA_DOMAIN!;
  const clientId = process.env.OKTA_CLIENT_ID!;
  const clientSecret = process.env.OKTA_CLIENT_SECRET!;

  const response = await fetch(`${domain}/oauth2/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refreshToken!,
    }),
  });

  if (!response.ok) {
    console.error("Failed to refresh access token:", response.status);
    return { ...token, accessToken: undefined, refreshToken: undefined, expiresAt: undefined };
  }

  const data = await response.json();
  return {
    ...token,
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token ?? token.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in as number),
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    OktaProvider({
      clientId: process.env.OKTA_CLIENT_ID!,
      clientSecret: process.env.OKTA_CLIENT_SECRET!,
      issuer: process.env.NEXT_PUBLIC_OKTA_DOMAIN!,
      authorization: {
        params: {
          scope: "openid profile email offline_access okta.governance.accessCertifications.manage okta.governance.reviewer.read okta.accessRequests.request.read okta.accessRequests.request.manage okta.governance.delegates.read okta.governance.principalSettings.manage okta.governance.principalSettings.read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign-in, store tokens from the OAuth response
      if (account && profile) {
        token.oktaId = profile.sub ?? undefined;
        token.email = profile.email;
        token.name = profile.name;
        token.accessToken = account.access_token ?? undefined;
        token.refreshToken = account.refresh_token ?? undefined;
        token.expiresAt = account.expires_at ?? undefined;
        return token;
      }

      // On subsequent requests, refresh the access token if it expires within 60s
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt - 60) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      // Expose Okta user ID and access token in the session
      if (session.user) {
        session.user.id = token.oktaId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
