import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    CDP_API_KEY_ID: z.string().optional(),
    CDP_API_KEY_SECRET: z.string().optional(),
    X402_FACILITATOR_URL: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    MARKETPLACE_SECRET_KEY: z.string().default("dev-secret-key-for-wallet-generation"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_CDP_BASE_URL: z.string().default("https://api.cdp.coinbase.com"),
    NEXT_PUBLIC_BASE_TESTNET_RPC: z.string().default("https://sepolia.base.org"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CDP_API_KEY_ID: process.env.CDP_API_KEY_ID,
    CDP_API_KEY_SECRET: process.env.CDP_API_KEY_SECRET,
    X402_FACILITATOR_URL: process.env.X402_FACILITATOR_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MARKETPLACE_SECRET_KEY: process.env.MARKETPLACE_SECRET_KEY,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NEXT_PUBLIC_CDP_BASE_URL: process.env.NEXT_PUBLIC_CDP_BASE_URL,
    NEXT_PUBLIC_BASE_TESTNET_RPC: process.env.NEXT_PUBLIC_BASE_TESTNET_RPC,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
