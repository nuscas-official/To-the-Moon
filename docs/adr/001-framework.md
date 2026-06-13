# ADR-001: Use Next.js 14 App Router as the Application Framework

**Date:** June 2026  
**Status:** Accepted

## Decision
We will use Next.js 14 App Router with TypeScript as the primary application framework.

## Reason
1. **Single Deployable Unit:** Next.js combines the frontend UI (Server and Client Components), Server Actions, and API Route Handlers into a single, cohesive repository. This eliminates the operational and maintenance overhead of running a separate frontend and backend API.
2. **React Ecosystem:** Next.js is built on React, giving us access to a mature ecosystem of libraries (like Radix UI primitives and Tailwind CSS) and ensuring future student developers will be familiar with the core technology.
3. **App Router Layouts:** App Router's file-based routing and nested layout structure make it simple to implement role-based layouts (such as a shared admin sidebar) and group related features together logically.
4. **Static and Dynamic Rendering:** Next.js automatically optimizes public marketing pages to be static (generating fast first-load times and lowering server costs) while allowing portal pages to be dynamically server-side rendered.

## Alternatives Considered
- **Vite (SPA) + Express (Backend API):** Adds complexity by dividing the code into two systems, requiring two distinct deployment configurations, and introducing CORS management overhead.
- **Astro:** Excellent for static sites, but less ideal for highly dynamic web portals with complex authenticated state management like the ratings system and admin panels.

## Consequences
- Developers must understand the distinction between React Server Components (RSC) and Client Components.
- We must manage session state correctly across both middleware (edge) and server routes using cookie-based authentication via `@supabase/ssr`.
