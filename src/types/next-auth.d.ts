import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    walletId?: string;
  }

  interface JWT {
    userId?: string;
    walletId?: string;
  }
} 