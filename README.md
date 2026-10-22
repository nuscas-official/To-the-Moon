# NUSCAS Website & Member Portal

A modern web application and member portal for the NUS Comics and Animation Society (NUSCAS). It centralizes member authentication, event management, anime & manga reviews, blogging, artwork sharing, and Telegram integration into a single platform designed specifically for university club operations.

<img width="2561" height="1186" alt="to-the-moon-gold vercel app" src="https://github.com/user-attachments/assets/59a35571-5395-494b-90f3-f72f146acaad" />

---

## Tech Stack

- Framework: Next.js 14
- Language: TypeScript
- Styling: Tailwind CSS
- Backend: Supabase (PostgreSQL, Authentication)
- Object Storage: Cloudflare R2
- Image Processing: Sharp + client-side Canvas resizing
- Bot Integration: Grammy.js (Telegram)

---

## Features

Authentication
- Secure Google OAuth authentication powered by Supabase.
- Invite-only registration using single-use, expiring invite tokens (/join?token=...).
- Unauthorized sign-up attempts are automatically rejected and cleaned up.
- Administrators can generate, revoke, and manage invitations directly from the dashboard.

Anime & Manga Ratings
- Search, rate, and review anime and manga titles.
- Individual ratings are always private.
- Public aggregate scores are only displayed after a title has received at least three member ratings, reducing the risk of de-anonymizing niche titles.
- Daily submission limits (30 actions/day) help prevent spam and abuse.

Anime of the Season
- Members nominate and vote for the season's anime through the Telegram bot.
- The current leader is featured in the homepage hero; seasons follow the anime calendar (Winter/Spring/Summer/Fall) and votes reset each season.
- Committee members can pin a manual pick in Admin → Settings to override the vote.

Event Management
- Interactive event listings and detailed event pages.
- Organizer tools for uploading and managing photo galleries from club events.
  
Artwork Gallery
- Collaborative gallery for members to showcase illustrations and fan art.
- Media is stored on Cloudflare R2 for scalable, low-cost object storage.
  
Blogging Platform
- Rich WYSIWYG MDX editor powered by @mdxeditor/editor.
- Support for cover image uploads.
- Custom MDX compilation and rendering for articles, newsletters, and guides.

Telegram Bot

Members can link their Telegram account to their NUSCAS profile using a secure pairing code.

Supported commands include:
- `/nominate` — Search AniList and nominate an Anime of the Season
- `/vote` — Vote for this season's pick (one vote per member, changeable)
- `/season` — Show the current standings (also works in group chats)
- `/events` — View upcoming events
- `/link`, `/unlink`, `/whoami` — Manage account linking
- `/help` — Display the command reference

---

## Setup & Deployment

Project setup, deployment, database initialization, and environment configuration are documented separately.

👉 See the [Setup and Deployment Guide](docs/setup-and-deployment.md)
