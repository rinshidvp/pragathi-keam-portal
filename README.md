# Pragathi KEAM Help Desk Portal

**KEAM college-eligibility predictor and admissions help desk for TKM College of Engineering — adopted as the official tool of the Pragathi College Union Help Desk, 2026.**

🔗 **Live:** [pragathi-keam-portal.lovable.app](https://pragathi-keam-portal.lovable.app)

---

## The problem

Every KEAM allotment season, hundreds of students and parents queue at the college help desk asking the same question: *"With my rank and category, which colleges and branches can I get?"* The answer lives in scattered PDF cutoff lists that are hard to search on a phone.

## The solution

A mobile-first portal that turns 1,500+ rows of historical KEAM cutoff data into an instant, filterable prediction — plus everything else a new admission needs in one place.

**Features**
- **Cutoff predictor** — enter rank + reservation category (SM, EZ, MU, BH, LA, BX, KU, SC, ST, EW) and get every eligible college/branch, sorted by closing rank, filterable by phase, college and branch
- **Answer keys, academic resources and events** for incoming students
- **Department help-desk contacts** so students reach the right volunteer directly
- **Admin dashboard** — help-desk volunteers upload and manage cutoffs, contacts, events, answer keys and social links without touching code

## Tech stack

| Layer | Tech |
|---|---|
| Framework | TanStack Start (React 19, file-based routing), Vite |
| UI | Tailwind CSS, shadcn/ui (Radix), Framer Motion |
| Data | Supabase (Postgres + Row Level Security, Auth for admin roles) |
| Data fetching | TanStack Query with caching and paginated results |
| Hosting | Cloudflare Workers runtime |

## Architecture

```
Browser ──► TanStack Start (SSR on Workers) ──► Supabase Postgres
                 │                                  ├─ cutoffs (per-category closing ranks)
                 │                                  ├─ colleges / departments
                 └─ /admin (role-gated) ───────────►└─ events, contacts, answer_keys, …
```

Row Level Security allows public read access to reference data; writes are restricted to users with an admin role (`user_roles` table).

## Run locally

```bash
bun install        # or npm install
cp .env .env.local # set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
bun run dev
```

Database schema lives in [`supabase/migrations`](./supabase/migrations).

## Author

Built by [Muhammed Rinshid V P](https://github.com/rinshidvp) · [CosmIQ](https://github.com/rinshidvp)

## License

[MIT](./LICENSE)
