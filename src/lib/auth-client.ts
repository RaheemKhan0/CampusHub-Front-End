import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:4000" // The base URL of auth server  
})

export type Session = typeof authClient.$Infer.Session;

