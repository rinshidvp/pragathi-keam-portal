

## Problem: 404 on Vercel Deployment

This project uses **TanStack Start with SSR** (server-side rendering), not a plain static React SPA. The current `vercel.json` tries to serve everything from `index.html`, but TanStack Start needs a server runtime to handle SSR, routing, and server functions.

**Vercel cannot host this app with a simple static rewrite.** The build toolchain (`@lovable.dev/vite-tanstack-config`) targets a Cloudflare Worker runtime for SSR, which is incompatible with Vercel's serverless functions.

### Your Options

**Option A: Use Lovable's built-in hosting (Recommended)**
- Click **Publish** in the Lovable editor (top-right). Your app is already configured to deploy correctly on Lovable's hosting infrastructure.
- Your published URL is: `https://pragathi-keam-portal.lovable.app`
- You can connect a custom domain from **Project Settings → Domains** after publishing.

**Option B: Self-host on Cloudflare Pages**
- The build output is designed for Cloudflare Workers. You could deploy to Cloudflare Pages with the Workers runtime, but this requires manual setup outside Lovable.
- See: https://docs.lovable.dev/tips-tricks/self-hosting

### What I Will Do

Remove the `vercel.json` file since it serves no purpose for this project and may cause confusion. The app should be published via Lovable's built-in publish flow instead.

### Changes
- **Delete `vercel.json`** — this file is not used by Lovable hosting and incorrectly suggests static SPA hosting.

