# Admin Panel Hardening & Security — Design

Date: 2026-06-11
Status: Approved (design); plan pending
Site: www.appectiveteknoloji.net — Next.js 14 (App Router) + Tailwind + Supabase, deployed on Vercel.

## Background

The admin panel (`/admin`) manages 13 content sections backed by 15 Supabase tables.
A full live audit (static code review + a safe anon-key CRUD probe against the
production database, see `scripts/audit-admin-crud.mjs`) showed the **database layer
is largely functional**. `SUPABASE_SERVICE_ROLE_KEY` is confirmed set on Vercel, so the
service-role API routes work in production.

The real problems are architectural, not "page totally broken":

1. **Critical security hole.** Nearly every table has a permissive
   `"Allow public access" (ALL, USING true)` RLS policy, and `partner_logos` has RLS
   disabled entirely. The public anon key is shipped in the browser bundle, so **any
   visitor can read, insert, update, and delete all content** (team, partners, services,
   banner, etc.).
2. **Privacy leak.** `newsletter_subscribers` and `job_applications` have public
   `SELECT` policies — subscriber emails and applicant data are publicly readable.
3. **Inconsistent write paths.** Some admin writes go directly from the browser via the
   anon client (SocialLinks, ContactInfo, Newsletter, Mastheads), some via anon-backed
   API routes with no/loose auth (`team-members`, `games`, `web-portals`, `applications`,
   `admin/partners`), and some via correctly-secured service-role API routes (services,
   partner-categories, digital-marketing, job-openings, job-applications).
4. **Dead/broken code.** `contact-info` and `save-social-links` routes write to JSON files
   (`data/*.json`) which is read-only/ephemeral on Vercel; `job-openings/[id]` PUT/DELETE
   also use the filesystem. None are used by the live admin UI; they are confusing traps.

## Goal

Every admin write goes through an **authenticated server API route using the service-role
client**. The public anon key can only **read** public content; it can write nothing.
Dead code removed. Each admin section verified end-to-end.

This must not break the live admin during rollout.

## Architecture

Target pattern for every content type:

- `GET /api/<resource>` — public read (anon, only for homepage-facing data) OR admin-only
  read behind `withAdminAuth` (for private data like newsletter/applications).
- `POST/PUT/DELETE /api/<resource>` — protected by `withAdminAuth*`, mutate via
  `assertSupabaseAdmin()` (service-role client, bypasses RLS).
- Admin React components call these routes via `fetchWithAuth` (attaches the admin's
  Supabase access token; already exists in `src/lib/auth.ts`).

RLS becomes the safety net, not the primary mechanism:
- Public-facing tables: keep `SELECT USING (true)` only.
- Private tables (newsletter_subscribers, job_applications): no public policy; admin reads
  go through the service-role API.
- Drop all `"Allow public access" (ALL true)` policies.
- Enable RLS on `partner_logos` + add a public `SELECT` policy.
- Keep existing `"Admin full access"` (email `@appective.net`) policies as defense-in-depth.

## Work Breakdown

### Component A — Standardize write paths (code)
For each table currently written via anon (browser-direct or anon API), route the write
through a service-role + `withAdminAuth` server endpoint, and update the component to use
`fetchWithAuth`:

| Section | Current write path | Change |
|---|---|---|
| Social Links | browser → anon `social_links` | add `POST/PUT/DELETE /api/social-links` (service-role+auth); rewire `SocialLinksAdmin` |
| Contact Info | browser → anon `contact_info` | add protected route; rewire `ContactInfoAdmin` |
| Newsletter | browser → anon `newsletter_subscribers` | move read+delete to protected `/api/newsletter` (admin GET); rewire `NewsletterSubscribers` |
| Mastheads | browser → anon `interactive_mastheads` | add protected CRUD route; rewire `AdminInteractiveMastheads` |
| Team Members | `/api/team-members` anon, no auth | switch to service-role + `withAdminAuth` |
| Partner Logos | `/api/admin/partners` anon | switch to service-role + `withAdminAuth` |
| Games | `/api/games` anon | switch to service-role + `withAdminAuth` |
| Web Portals | `/api/web-portals` anon | switch to service-role + `withAdminAuth` |
| Applications | `/api/applications` anon | switch to service-role + `withAdminAuth` |

Already correct (verify auth wrappers consistent): services, partner-categories,
digital-marketing, job-openings, job-applications, top-banner/upload-banner, upload.

Public GET endpoints stay on the anon client (homepage reads) unless the data is private.

### Component B — Remove dead code
- Delete or repoint `src/app/api/contact-info/route.ts` (fs) and
  `src/app/api/save-social-links/route.ts` (fs).
- Replace `src/app/api/job-openings/[id]/route.ts` fs logic (or delete if the `?id=` query
  route fully covers admin needs).
- Remove unused `data/*.json` fallbacks in `src/lib/data.ts` once Supabase is the single
  source of truth (keep graceful empty-array fallback, drop fs read).

### Component C — Tighten RLS (database, AFTER A+B deployed & verified)
Migration applied via Supabase, in this order only after the app no longer writes via anon:
1. `ALTER TABLE partner_logos ENABLE ROW LEVEL SECURITY;` + public `SELECT` policy.
2. Drop every `"Allow public access"` (ALL true) policy.
3. Drop public `SELECT` on `newsletter_subscribers` and `job_applications`.
4. Confirm public `SELECT (true)` remains on homepage-facing tables (services, team_members,
   partners, top_banner, games, web_portals, applications, digital_marketing,
   interactive_mastheads, job_openings, social_links, contact_info).

### Component D — Verification
1. Run `npm run dev`; smoke-test every admin section (login as `ozkal@appective.net`):
   create → edit → delete one item per section; confirm it reflects on the public site.
2. Re-run `scripts/audit-admin-crud.mjs`: after Component C, anon writes must **FAIL**
   (security proven); service-role writes still succeed.
3. Confirm the public homepage still renders all sections (anon reads intact).

## Rollout Order (must follow)
1. Land Component A + B (code) on a branch.
2. Deploy to Vercel preview; verify admin works (Component D.1 against preview).
3. Merge to production; verify again.
4. Apply Component C migration.
5. Re-verify (Component D.2, D.3).

## Out of Scope
- Responsive/mobile work (separate phase, to follow this one).
- Auth model overhaul (current email-domain check is acceptable; keep).
- Rotating the exposed anon key (anon key is meant to be public; the fix is RLS, not key rotation).

## Risks
- Dropping RLS policies in the wrong order breaks the live admin → mitigated by the strict
  rollout order (code first, RLS last).
- A missed anon write path would break after RLS tightening → mitigated by the audit script
  re-run and per-section smoke test before/after.
