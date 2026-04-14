

## Plan: Refactor Portal to KEAM Aspirant Help Desk

Restructure the public-facing portal from a general college union site to a focused "KEAM Aspirant Help Desk" while keeping the existing sunset theme, Supabase backend, and admin CRUD intact.

### Database Change

**New table: `cutoff_ranks`** — to power the TKMCE Cut-Off Predictor section.

```sql
CREATE TABLE public.cutoff_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch text NOT NULL,
  year integer NOT NULL,
  general_rank integer,
  obc_rank integer,
  sc_rank integer,
  st_rank integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Public read, admin write (same pattern as other tables)
```

### File Changes

#### 1. `src/components/HeroSection.tsx` — New headline and CTAs
- Headline: "Your Gateway to TKMCE: Official KEAM Help Desk 2026."
- Sub-headline: "Run by Pragathi College Union. For the Students, By the Students."
- CTAs: "Access Mock Tests" (links to #resources) and "Join Aspirant Community" (links to WhatsApp/external)

#### 2. `src/components/EventsSection.tsx` → Rename to "Live KEAM Alerts"
- Change heading to "Live KEAM Alerts"
- Subtitle: "Stay updated with KEAM notifications, deadlines & important dates"
- Add a pulsing "LIVE" badge for visual urgency
- Add alert-style icons (Bell/AlertTriangle) instead of Calendar for upcoming deadlines

#### 3. New `src/components/CutoffSection.tsx` — TKMCE Cut-Off Predictor
- Static/dynamic table showing previous year cut-off ranks by branch (CS, EC, ME, CE, EEE, etc.)
- Fetches from new `cutoff_ranks` table; falls back to hardcoded sample data if empty
- Clean table with branch rows and rank columns (General, OBC, SC, ST)

#### 4. `src/components/AcademicSection.tsx` — KEAM-focused redesign
- Heading: "KEAM Prep Resources"
- Group by KEAM subjects: Physics, Chemistry, Mathematics
- Display as visually distinct cards in 4 categories: "Subject-wise PYQs", "High-Yield Topics", "Formula Sheets", "Mock Tests"
- Each card shows an icon and count of available resources

#### 5. `src/components/ContactsSection.tsx` — Help Desk Directory
- Title: "Direct Mentorship & Help Desk"
- Two-tier layout: "Union Leaders" at top (larger cards) and "Help Desk Volunteers" below (smaller grid)
- Distinguish tiers by role field (e.g., roles containing "Chairman", "Vice", "Leader" go to top tier)
- Keep prominent Call and WhatsApp buttons

#### 6. `src/components/Header.tsx` — Update branding
- Change center text from "Pragathi 2026 / College Union" to "KEAM Help Desk 2026 / Pragathi College Union"

#### 7. `src/components/Footer.tsx` — Minor text update
- Update tagline to reference KEAM Help Desk

#### 8. `src/routes/index.tsx` — Update meta and add CutoffSection
- Update page title/meta to "KEAM Help Desk 2026 — Pragathi College Union"
- Add `<CutoffSection />` between EventsSection and AcademicSection

#### 9. Admin Dashboard Updates
- `src/components/admin/AdminDashboard.tsx` — Rename tab labels: "Events" → "KEAM Alerts", "Resources" → "KEAM Resources"
- `src/components/admin/ManageEvents.tsx` — Update heading to "Manage KEAM Alerts/Notifications"
- `src/components/admin/ManageResources.tsx` — Update subject dropdown to default KEAM subjects (Physics, Chemistry, Mathematics); add resource types "Formula Sheet", "High-Yield Topics"
- New `src/components/admin/ManageCutoffs.tsx` — CRUD for cutoff rank data; add as a new tab in the admin sidebar

### Section Order on Homepage
1. Header
2. Hero (KEAM Help Desk)
3. Live KEAM Alerts
4. TKMCE Cut-Off Predictor
5. KEAM Prep Resources
6. Direct Mentorship & Help Desk
7. Footer

### Technical Notes
- No changes to the sunset theme CSS, Supabase client, or auth flow
- The `cutoff_ranks` table gets the same RLS pattern: public SELECT, admin-only INSERT/UPDATE/DELETE
- All existing Supabase queries remain; only labels and UI layout change

