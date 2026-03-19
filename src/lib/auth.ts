import PostgresAdapter from "@auth/pg-adapter";
import NextAuth from "next-auth";
import { Pool } from "pg";
import { authConfig } from "./auth.config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  session: { strategy: "jwt" },
});
