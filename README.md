# NUSCAS Website & Member Portal

A modern web application and member portal prototype built for the **NUS Comics and Animation Society (NUSCAS)**. This portal serves as the digital hub for club members, artists, and administrators to interact, submit reviews, manage events, share artwork, and publish blog articles.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API routes, optimized pre-rendering)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for static type-safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom design token system
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL database, Row Level Security policies, and Google OAuth)
- **Object Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible, ultra-low cost media hosting)
- **Image Processing**: Client-side HTML5 Canvas scaling (to bypass server payload limits) + Server-side [Sharp](https://sharp.pixelplumbing.com/) (for sanitization, formatting, and optimization)
- **Telegram Integration**: [Grammy.js](https://grammy.dev/) webhook handler for bot rating commands

---

## ✨ Key Features

- **Google OAuth Login**: Direct, secure member authentication managed by Supabase.
- **Member Ratings Dashboard**: 
  - Allows members to search, rate, and write reviews for anime and manga titles.
  - Implements daily submission rate limits (30 actions/day) to prevent spam.
- **Event Management**: 
  - Interactive event feeds and detail cards.
  - Media uploader for organizers to share photo galleries from physical gatherings.
- **Media Gallery**: A collaborative gallery for members to share illustrations and fan art, integrated directly with Cloudflare R2 storage.
- **Blog Engine**: Publish newsletters, guides, or editorials using custom MDX rendering, featuring cover image uploads.
- **Telegram Bot Webhook**: Fully integrated chatbot enabling members to query recommendations and update their ratings directly from Telegram.
- **Adaptive Design**: Fully responsive visual aesthetics featuring subtle micro-animations.

---

## 🚀 Setup & Deployment

All detailed guidelines for setting up the database, authenticating services, runing the app locally, and deploying to Vercel have been moved to the documentation.

👉 **Read the [Setup and Deployment Guide](file:///c:/Users/User/Developer/NUSCAS-Website-Prototype/docs/setup-and-deployment.md)** to get started!
