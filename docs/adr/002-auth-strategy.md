# ADR-002: Use Supabase Auth with Google OAuth and Custom JWT Claims Hook

**Date:** June 2026  
**Status:** Accepted

## Decision
We will use Supabase Auth with Google OAuth as the sole authentication provider. Access roles (member, committee, admin) will be:
1. Stored in a public `users` table synced from `auth.users` via database triggers.
2. Embedded directly into the user session token (JWT) using Supabase's **JWT Custom Access Token Hook**.
3. Enforced using a **dual-layer protection model**: checked both in edge middleware (`middleware.ts`) and within each Server Component, Server Action, and Route Handler.

## Reason
1. **Google OAuth Simplicity:** Google sign-in provides a familiar, single-click signup and login process with zero password management, hashing, or reset flow requirements on our end.
2. **JWT Hooks vs DB Lookups:** Fetching the user role from the database on every middleware interceptor pass (which runs on every edge request) would create severe latency and exhaust the Supabase database connection pool/CPU on Vercel. By using a JWT hook, the user's role is safely signed and embedded inside the token payload, allowing the edge middleware to decode and verify permissions instantly with zero database pings.
3. **Trigger-Based Syncing:** Synced profiles in a public `users` table are easily queryable and allow linking additional features like Telegram account IDs and club ratings, which auth metadata alone cannot support.
4. **Dual-Layer Enforcement:** Frontend edge middleware guards are useful for redirection, but not secure on their own. Validating roles a second time inside Server Actions and Route Handlers guarantees data security.

## Alternatives Considered
- **NextAuth.js (Auth.js):** Good but introduces additional server-side endpoints, configuration files, and state synchronization issues when working alongside a Supabase client.
- **Direct Database Lookups in Middleware:** Rejected due to performance bottlenecks. Querying the database on every asset or API request degrades latency and scales poorly on the database free tier.

## Consequences
- A database function `public.custom_access_token_hook` must be registered in the Supabase Dashboard under Authentication → Hooks → Custom Access Token.
- Any change to a member's role in the database requires a token refresh (session update) to take effect in the browser. Supabase handles token refreshment automatically periodically, but a manual sign-out/in forces an immediate update.
