# ADR-003: MDX Rendering and Real-time Markdown Editor Preview

**Date:** June 2026  
**Status:** Accepted  

## Context

The blog system in the NUSCAS portal supports rendering complex articles, reviews, and essays. To provide writers with the freedom of markdown formatting alongside the ability to inject dynamic components in the future, we selected **MDX** (Markdown with JSX) as the content format. We needed to solve:
1. Compiling and rendering MDX server-side on public pages with high performance.
2. Providing a real-time markdown rendering preview in the content editor for both members and admin/committee panels.

## Decision

1. **Server-side Compilation**: We use `next-mdx-remote/rsc` on the server to compile and render MDX strings to HTML. It utilizes Next.js React Server Components (RSC) to compile MDX at request time without adding heavy compile dependencies to the client-side JavaScript bundle.
2. **Client-side Real-time Preview**: For the split-pane content editor (`ArticleForm`), we use `react-markdown` to render a live preview client-side as the author types.
3. **Styling**: Instead of relying on a styling dependency (like `@tailwindcss/typography` which requires Tailwind configuration adjustments), we defined standard CSS formatting classes for the `.markdown-body` class in `globals.css` utilizing our design system's variables. This guarantees a highly consistent look and feel across the application and respects active themes (such as Chaos Mode).

## Alternatives Considered

- **Draft.js / Rich Text Editor**: Deemed too heavy and complex, with poor portability. MDX stores text content directly as simple strings in Postgres, making it highly portable.
- **Client-side compiling with MDXRemote**: Discarded because compiling MDX client-side is expensive and increases first-load JS size.

## Consequences

- Post content is saved as plain text strings containing MDX.
- Real-time client-side preview renders standard Markdown tags, which is sufficient for draft editing.
- Dynamic React components in public posts will compile on Server Components under `/blog/[slug]`.
