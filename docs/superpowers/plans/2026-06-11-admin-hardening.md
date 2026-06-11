# Admin Panel Hardening & Security — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every admin write go through an authenticated, service-role server API route, then tighten Supabase RLS so the public anon key can only read public content and never mutate data.

**Architecture:** Convert anon-client write routes to `assertSupabaseAdmin()` (service-role) behind `withAdminAuth*`. Rewire the four admin components that write directly from the browser (Social, Contact, Newsletter, Mastheads) to call protected API routes via `fetchWithAuth`. Remove dead filesystem-based routes. Only after the deployed app no longer writes via anon, apply an RLS migration that drops the permissive `"Allow public access"` policies, enables RLS on `partner_logos`, and removes the public-read leak on `newsletter_subscribers` / `job_applications`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase JS v2, Tailwind. No unit-test framework in repo — verification uses `scripts/audit-admin-crud.mjs` (anon-key CRUD probe) + `curl` against `npm run dev` + manual admin smoke test.

**Canonical references in this codebase:**
- Secure route template: `src/app/api/services/route.ts` (service-role + `withAdminAuthSimple`).
- Auth wrappers: `src/lib/withAdminAuth.ts` (`withAdminAuth` for `[id]` routes, `withAdminAuthSimple` for static).
- Service-role client: `src/lib/supabaseAdmin.ts` (`assertSupabaseAdmin()`).
- Browser auth fetch: `src/lib/auth.ts` (`fetchWithAuth`).

**Rollout ordering (NON-NEGOTIABLE):** Complete Phase 1 (code) → deploy to a Vercel **preview** → verify admin works → merge to production → verify → only THEN Phase 2 (RLS). Doing RLS before the code ships breaks the live admin.

---

## Phase 1 — Code: route conversions, component rewires, dead-code removal

### Task 1: Convert `team-members` route to service-role + admin auth

**Files:**
- Modify: `src/app/api/team-members/route.ts`

- [ ] **Step 1: Replace imports and client usage**

Replace the top import line:
```ts
import { supabase, TeamMember } from '@/lib/supabase';
```
with:
```ts
import { supabase, TeamMember } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
```
(GET keeps the anon `supabase` for the public read.)

- [ ] **Step 2: Make POST/DELETE protected handlers using the admin client**

Rename `export async function POST` → `async function postHandler`, and `export async function DELETE` → `async function deleteHandler`. Inside each, replace every `supabase` used for the mutation (`.update`, `.insert`, `.delete`) with a local `const admin = assertSupabaseAdmin();` then `admin.from(...)`. The GET stays `export async function GET` using `supabase`.

At the end of the file add:
```ts
export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);
```

- [ ] **Step 3: Verify dev server returns 401 unauthenticated, 200 authenticated path compiles**

Run: `npm run dev` (background), then
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/team-members?id=999999"`
Expected: `401` (auth now required).
Also `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/team-members` → `200` (public read still works).

- [ ] **Step 4: Commit**
```bash
git add src/app/api/team-members/route.ts
git commit -m "fix(admin): secure team-members writes with service-role + admin auth"
```

---

### Task 2: Convert `games` route to service-role + admin auth

**Files:**
- Modify: `src/app/api/games/route.ts`

- [ ] **Step 1: Add imports**
Add after the existing imports:
```ts
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
```

- [ ] **Step 2: Protect mutations**
Rename `export async function POST` → `async function postHandler` and `export async function DELETE` → `async function deleteHandler`. In both, add `const admin = assertSupabaseAdmin();` and replace the mutation `supabase.from('games')...` calls with `admin.from('games')...`. GET stays public anon.
Append:
```ts
export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);
```

- [ ] **Step 3: Verify**
With dev server running:
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/games?id=999999"` → `401`.
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/games` → `200`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/games/route.ts
git commit -m "fix(admin): secure games writes with service-role + admin auth"
```

---

### Task 3: Convert `web-portals` route to service-role + admin auth

**Files:**
- Modify: `src/app/api/web-portals/route.ts`

- [ ] **Step 1: Add imports**
```ts
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
```

- [ ] **Step 2: Protect mutations**
Rename `export async function POST` → `async function postHandler`, `export async function DELETE` → `async function deleteHandler`. Add `const admin = assertSupabaseAdmin();` at the top of each handler body and replace the mutation `supabase.from('web_portals')` (`.insert`, `.upsert`, `.delete`) calls with `admin.from('web_portals')`. GET stays public anon.
Append:
```ts
export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);
```

- [ ] **Step 3: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/web-portals?id=999999"` → `401`.
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/web-portals` → `200`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/web-portals/route.ts
git commit -m "fix(admin): secure web-portals writes with service-role + admin auth"
```

---

### Task 4: Switch `applications` route mutations to service-role

**Files:**
- Modify: `src/app/api/applications/route.ts`

Note: this route is ALREADY wrapped with `withAdminAuthSimple` (auth is fine) but mutates via the anon `supabase` client, which will break after RLS tightening.

- [ ] **Step 1: Ensure import**
Confirm `import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';` exists; add it if missing.

- [ ] **Step 2: Use admin client for mutations**
In `postHandler`, `putHandler`, `deleteHandler`, add `const admin = assertSupabaseAdmin();` and replace each mutating `supabase.from('applications')` (`.insert`/`.update`/`.delete`) with `admin.from('applications')`. Leave any public GET on anon.

- [ ] **Step 3: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/applications?id=999999"` → `401`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/applications/route.ts
git commit -m "fix(admin): applications mutations use service-role client"
```

---

### Task 5: Switch partner-logos write route (`admin/partners`) to service-role

**Files:**
- Modify: `src/app/api/admin/partners/route.ts`

This route already verifies admin via inline `verifyAdmin`, but inserts/deletes with anon `supabase`.

- [ ] **Step 1: Add import**
```ts
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
```

- [ ] **Step 2: Use admin client**
In `POST` and `DELETE`, after the `verifyAdmin` check passes, add `const admin = assertSupabaseAdmin();` and replace `supabase.from('partner_logos')` (`.insert`, `.delete`) with `admin.from('partner_logos')`.

- [ ] **Step 3: Decide on legacy `/api/partner-logos` route**
`src/app/api/partner-logos/route.ts` also writes `partner_logos` via anon with `withAdminAuthSimple`. Grep usage:
Run: `grep -rn "/api/partner-logos" src` 
- If only GET is referenced by components, convert its POST/DELETE handlers to `assertSupabaseAdmin()` too (same edit) so no anon write path remains.
- The admin UI (`AdminPartnersManagementPage`) uses `/api/admin/partners` for logos and `/api/partner-categories` for categories — verify with the grep above.

- [ ] **Step 4: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/admin/partners?id=999999"` → `401`.
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/partner-logos?id=999999"` → `401`.

- [ ] **Step 5: Commit**
```bash
git add src/app/api/admin/partners/route.ts src/app/api/partner-logos/route.ts
git commit -m "fix(admin): partner logo writes use service-role client"
```

---

### Task 6: Create protected `social-links` route + rewire `SocialLinksAdmin`

**Files:**
- Create: `src/app/api/social-links/route.ts`
- Modify: `src/components/admin/SocialLinksAdmin.tsx`

Design: one protected `POST /api/social-links` that replaces the entire set (delete-all + insert), plus a public `GET` for reads. The component manages local state and persists the whole list on save.

- [ ] **Step 1: Create the route**
```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('id');
  if (error) {
    console.error('social-links GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch social links' }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// Replace-all save
async function postHandler(request: NextRequest) {
  try {
    const links = await request.json();
    if (!Array.isArray(links)) {
      return NextResponse.json({ message: 'Expected an array of links' }, { status: 400 });
    }
    const admin = assertSupabaseAdmin();
    const { error: delErr } = await admin.from('social_links').delete().neq('id', 0);
    if (delErr) throw delErr;
    if (links.length > 0) {
      const rows = links.map((l: any) => ({ platform: l.platform, url: l.url }));
      const { error: insErr } = await admin.from('social_links').insert(rows);
      if (insErr) throw insErr;
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('social-links POST error:', e);
    return NextResponse.json({ message: 'Failed to save social links', error: e.message }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);
```

- [ ] **Step 2: Rewire the component to use the API**
In `src/components/admin/SocialLinksAdmin.tsx`:
- Replace the import `import { supabase, SocialLink } from '@/lib/supabase';` with:
```ts
import { SocialLink } from '@/lib/supabase';
import { fetchWithAuth } from '@/lib/auth';
```
- In the load `useEffect`, replace the supabase query with:
```ts
const res = await fetch('/api/social-links');
if (!res.ok) throw new Error('load failed');
const data = await res.json();
setLinks(data || []);
```
- Replace `saveLinks` body's supabase delete/insert with a single call:
```ts
const res = await fetchWithAuth('/api/social-links', {
  method: 'POST',
  body: JSON.stringify(updatedLinks),
});
if (!res.ok) throw new Error((await res.json()).message || 'save failed');
```
- Change `handleAdd`, `handleDelete`, `handleUrlChange` to mutate local `links` state only (no supabase calls); persistence happens via the existing "Kaydet" button which calls `saveLinks(links)`. For `handleAdd`, push the new `{ platform, url }` into state; for `handleDelete`, filter it out; for `handleUrlChange`, map the url. Keep the success/error messaging.

- [ ] **Step 3: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/social-links` → `200`.
`curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/social-links -H 'Content-Type: application/json' -d '[]'` → `401`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/social-links/route.ts src/components/admin/SocialLinksAdmin.tsx
git commit -m "feat(admin): social links via protected API; remove browser-direct writes"
```

---

### Task 7: Convert `contact-info` route to Supabase service-role + rewire `ContactInfoAdmin`

**Files:**
- Modify: `src/app/api/contact-info/route.ts` (currently filesystem JSON — replace entirely)
- Modify: `src/components/admin/ContactInfoAdmin.tsx`

- [ ] **Step 1: Replace the route with a Supabase-backed one**
Overwrite `src/app/api/contact-info/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabase
    .from('contact_info')
    .select('*')
    .order('id');
  if (error) {
    console.error('contact-info GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch contact info' }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

// Upsert each contact-info row provided
async function postHandler(request: NextRequest) {
  try {
    const rows = await request.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ message: 'Expected an array of contact rows' }, { status: 400 });
    }
    const admin = assertSupabaseAdmin();
    for (const row of rows) {
      const payload = { icon: row.icon, title: row.title, details: row.details, link: row.link ?? null };
      if (row.id) {
        const { error } = await admin.from('contact_info').update(payload).eq('id', row.id);
        if (error) throw error;
      } else {
        const { error } = await admin.from('contact_info').insert(payload);
        if (error) throw error;
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('contact-info POST error:', e);
    return NextResponse.json({ message: 'Failed to save contact info', error: e.message }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);
```

- [ ] **Step 2: Rewire `ContactInfoAdmin`**
In `src/components/admin/ContactInfoAdmin.tsx`:
- Replace `import { supabase, ContactInfo } from '@/lib/supabase';` with:
```ts
import { ContactInfo } from '@/lib/supabase';
import { fetchWithAuth } from '@/lib/auth';
```
- In the load effect, replace the `supabase.from('contact_info').select(...)` with `const res = await fetch('/api/contact-info'); const data = await res.json(); setInfo(data || []);` (match the existing state setter name).
- In the save handler, replace the per-row `supabase.from('contact_info').update(...)` with one call:
```ts
const res = await fetchWithAuth('/api/contact-info', {
  method: 'POST',
  body: JSON.stringify(updatedInfo),
});
if (!res.ok) throw new Error((await res.json()).message || 'save failed');
```
(Read the file first to match exact state variable names before editing.)

- [ ] **Step 3: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/contact-info` → `200` (now returns an array from Supabase).
`curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/contact-info -H 'Content-Type: application/json' -d '[]'` → `401`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/contact-info/route.ts src/components/admin/ContactInfoAdmin.tsx
git commit -m "fix(admin): contact-info via Supabase service-role API (was filesystem JSON)"
```

---

### Task 8: Add protected admin endpoints to `newsletter` route + rewire `NewsletterSubscribers`

**Files:**
- Modify: `src/app/api/newsletter/route.ts`
- Modify: `src/components/admin/NewsletterSubscribers.tsx`

The public subscribe (footer) POST must keep working AFTER RLS tightening, so it moves to service-role (no auth, public action). The admin list/delete must require auth and not be publicly readable.

- [ ] **Step 1: Update the route**
In `src/app/api/newsletter/route.ts`:
- Add imports:
```ts
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuthSimple } from '@/lib/withAdminAuth';
```
- **GET (admin list):** rename `export async function GET` → `async function getHandler`; keep its logic but read via `assertSupabaseAdmin()` (so it works after public-read is removed). Add `export const GET = withAdminAuthSimple(getHandler);`.
- **POST (public subscribe):** keep public (no wrapper) but switch the existence-check + insert to `assertSupabaseAdmin()` so it works after RLS tightening.
- **DELETE (admin):** rename to `deleteHandler`, switch to `assertSupabaseAdmin()`, and `export const DELETE = withAdminAuthSimple(deleteHandler);`.

- [ ] **Step 2: Rewire `NewsletterSubscribers` component**
In `src/components/admin/NewsletterSubscribers.tsx`:
- Replace `import { supabase } from '@/lib/supabase';` with `import { fetchWithAuth } from '@/lib/auth';`.
- Replace the load `supabase.from('newsletter_subscribers').select(...)` with:
```ts
const res = await fetchWithAuth('/api/newsletter');
const json = await res.json();
// existing GET returns { subscribers: [...] }
const list = json.subscribers || [];
```
(Match the existing state shape; the route's GET already returns `{ subscribers }`.)
- Replace the delete `supabase.from('newsletter_subscribers').delete().in('id', ...)` with:
```ts
const res = await fetchWithAuth('/api/newsletter', {
  method: 'DELETE',
  body: JSON.stringify({ ids: selectedIds }),
});
if (!res.ok) throw new Error('delete failed');
```
(Read the file to match the exact selected-ids variable.)

- [ ] **Step 3: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/newsletter` → `401` (list now admin-only).
`curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/newsletter -H 'Content-Type: application/json' -d '{"email":"x@y.com"}'` → `201` or `409` (public subscribe still works; delete the test row afterward if `201`).

- [ ] **Step 4: Commit**
```bash
git add src/app/api/newsletter/route.ts src/components/admin/NewsletterSubscribers.tsx
git commit -m "fix(admin): newsletter list/delete admin-only; subscribe uses service-role"
```

---

### Task 9: Add protected CRUD to `mastheads` route + rewire `AdminInteractiveMastheads`

**Files:**
- Modify: `src/app/api/mastheads/route.ts`
- Modify: `src/components/admin/AdminInteractiveMastheads.tsx`

The route currently has a public GET and a deprecated POST. Add real POST/PUT/DELETE using service-role, and rewire the component (which currently writes directly to `interactive_mastheads` via anon).

- [ ] **Step 1: Add protected handlers to the route**
Add imports `assertSupabaseAdmin`. Replace the deprecated `postHandler` with create logic and add put/delete:
```ts
import { assertSupabaseAdmin } from '@/lib/supabaseAdmin';

// maps incoming MastheadItem (camelCase) to DB columns (snake_case)
function toRow(m: any) {
  return {
    ...(m.id ? { id: m.id } : {}),
    category: m.category,
    brand: m.brand,
    title: m.title,
    image: m.image,
    popup_html_path: m.popupHtmlPath,
    popup_title: m.popupTitle,
    popup_description: m.popupDescription ?? null,
    banner_size: m.bannerDetails?.size ?? m.banner_size ?? null,
    banner_platforms: m.bannerDetails?.platforms ?? m.banner_platforms ?? null,
  };
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const admin = assertSupabaseAdmin();
    const row = toRow(body);
    if (!row.id) row.id = `masthead_${Date.now()}`;
    const { data, error } = await admin.from('interactive_mastheads').upsert(row).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    console.error('mastheads POST error:', e);
    return NextResponse.json({ message: 'Failed to save masthead', error: e.message }, { status: 500 });
  }
}

async function deleteHandler(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });
    const admin = assertSupabaseAdmin();
    const { error } = await admin.from('interactive_mastheads').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('mastheads DELETE error:', e);
    return NextResponse.json({ message: 'Failed to delete masthead', error: e.message }, { status: 500 });
  }
}

export const POST = withAdminAuthSimple(postHandler);
export const DELETE = withAdminAuthSimple(deleteHandler);
```
(`withAdminAuthSimple` is already imported in this file.)

- [ ] **Step 2: Rewire the component**
In `src/components/admin/AdminInteractiveMastheads.tsx`:
- Keep the public read via `supabase` OR switch the read to `fetch('/api/mastheads')` (already returns camelCase). Prefer `fetch('/api/mastheads')` for the list to drop the direct supabase read.
- Replace the create/update block (`supabase.from('interactive_mastheads').insert/update`) with:
```ts
const res = await fetchWithAuth('/api/mastheads', {
  method: 'POST',
  body: JSON.stringify(payload), // the MastheadItem being edited/created
});
if (!res.ok) throw new Error((await res.json()).message || 'save failed');
```
- Replace the delete block (`supabase.from('interactive_mastheads').delete().eq('id', ...)`) with:
```ts
const res = await fetchWithAuth(`/api/mastheads?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
if (!res.ok) throw new Error('delete failed');
```
- Remove the now-unused `import { supabase }` if no other usage remains (keep `fetchWithAuth`, already imported). Read the file to match exact variable names (`payload`, `id`).

- [ ] **Step 3: Verify**
`curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "http://localhost:3000/api/mastheads?id=__none__"` → `401`.
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/mastheads` → `200`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/mastheads/route.ts src/components/admin/AdminInteractiveMastheads.tsx
git commit -m "feat(admin): mastheads CRUD via protected service-role API"
```

---

### Task 10: Remove dead filesystem routes and fs fallbacks

**Files:**
- Delete: `src/app/api/save-social-links/route.ts`
- Modify or delete: `src/app/api/job-openings/[id]/route.ts`
- Modify: `src/lib/data.ts`

- [ ] **Step 1: Confirm `save-social-links` is unused, then delete**
Run: `grep -rn "save-social-links" src`
Expected: no component references (only the route file). Then:
```bash
git rm src/app/api/save-social-links/route.ts
```

- [ ] **Step 2: Fix `job-openings/[id]` route**
Run: `grep -rn "/api/job-openings/" src` (note trailing slash → the `[id]` route).
- If components only call `/api/job-openings` (with `?id=`), delete the `[id]` route: `git rm "src/app/api/job-openings/[id]/route.ts"`.
- If something calls `/api/job-openings/<id>`, rewrite its PUT/DELETE to use `assertSupabaseAdmin()` on `job_openings` (mirror `src/app/api/job-openings/route.ts`) instead of `fs`.

- [ ] **Step 3: Drop fs fallback in `src/lib/data.ts`**
Remove the `import fs` / `import path` lines and the `fs.readFile(...JSON...)` fallback branches in `getSocialLinks` and `getContactInfo`. Keep the Supabase query and the `return []` on error. Result:
```ts
import { supabase } from './supabase';

export interface ContactInfo { icon: string; title: string; details: string; link: string; }
export interface SocialLink { platform: string; url: string; }

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { data, error } = await supabase.from('social_links').select('platform, url').order('id');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Could not read social links:', error);
    return [];
  }
}

export async function getContactInfo(): Promise<ContactInfo[]> {
  try {
    const { data, error } = await supabase.from('contact_info').select('icon, title, details, link').order('id');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Could not read contact info:', error);
    return [];
  }
}
```

- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: build succeeds (no references to deleted files / removed fs imports).

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "chore(admin): remove dead filesystem routes and fs fallbacks"
```

---

### Task 11: Phase 1 verification — full admin smoke test on preview

**Files:** none (verification only)

- [ ] **Step 1: Build & deploy preview**
Push the branch and open a Vercel **preview** deployment (or `npm run build && npm start` locally with production env). Confirm `SUPABASE_SERVICE_ROLE_KEY` is present in the preview environment.

- [ ] **Step 2: Manual smoke test (login as `ozkal@appective.net`)**
For each section, create → edit → delete one test item and confirm it reflects on the public site where applicable:
Top Banner, Partners (category + logo), Team Members, Services, Job Openings, Job Applications (status change), Newsletter (view + delete a test sub), Social Media, Contact Info, Mastheads, Games, Digital Marketing, Web Portals.
Expected: every operation succeeds; no 401/500 in the browser network tab.

- [ ] **Step 3: Confirm public site intact**
Load the homepage + `/interactive-mastheads` on the preview. All sections render (anon reads still work — RLS not yet changed).

- [ ] **Step 4: Merge to production and re-verify Step 2 quickly**
Only proceed to Phase 2 after production admin is confirmed working.

---

## Phase 2 — Database: tighten RLS (ONLY after Phase 1 verified in production)

### Task 12: Apply RLS migration

**Files:**
- Apply via Supabase migration (MCP `apply_migration`, name: `tighten_rls_admin_hardening`).

- [ ] **Step 1: Pre-flight — ensure public-read policies exist for homepage tables that currently rely only on "Allow public access"**
These three tables have NO dedicated public SELECT policy and MUST get one before the ALL policy is dropped: `contact_info`, `social_links`, `interactive_mastheads`.

- [ ] **Step 2: Run the migration SQL**
```sql
-- 1. Ensure public READ on homepage-facing tables lacking a dedicated SELECT policy
create policy "Public read access to contact_info" on public.contact_info for select using (true);
create policy "Public read access to social_links" on public.social_links for select using (true);
create policy "Public read access to interactive_mastheads" on public.interactive_mastheads for select using (true);

-- 2. Enable RLS on partner_logos and add public read
alter table public.partner_logos enable row level security;
create policy "Public read access to partner_logos" on public.partner_logos for select using (true);

-- 3. Drop the permissive ALL-true policies (anon can no longer write)
drop policy if exists "Allow public access" on public.applications;
drop policy if exists "Allow public access" on public.contact_info;
drop policy if exists "Allow public access" on public.digital_marketing;
drop policy if exists "Allow public access" on public.games;
drop policy if exists "Allow public access" on public.interactive_mastheads;
drop policy if exists "Allow public access" on public.newsletter_subscribers;
drop policy if exists "Allow public access" on public.services;
drop policy if exists "Allow public access" on public.social_links;
drop policy if exists "Allow public access" on public.team_members;
drop policy if exists "Allow public access" on public.web_portals;
drop policy if exists "Allow public access to top_banner" on public.top_banner;
drop policy if exists "Allow all for authenticated users" on public.partner_logos;

-- 4. Remove public-read privacy leaks (admin reads go through service-role API)
drop policy if exists "Public read access to newsletter_subscribers" on public.newsletter_subscribers;
drop policy if exists "Public read access to job_applications" on public.job_applications;
```

- [ ] **Step 3: Verify policies**
Run (MCP `execute_sql`):
```sql
select tablename, policyname, cmd from pg_policies where schemaname='public' order by tablename, cmd;
```
Expected: every public table has a `SELECT using(true)` policy; NO table has an `ALL using(true)` "Allow public access" policy; `newsletter_subscribers` and `job_applications` have no public SELECT; `partner_logos` has rls enabled with a public SELECT.

---

### Task 13: Phase 2 verification — prove anon can read but not write

**Files:**
- Use: `scripts/audit-admin-crud.mjs`

- [ ] **Step 1: Re-run the anon CRUD audit**
Run: `node scripts/audit-admin-crud.mjs`
Expected: anon INSERT now **FAILS** (RLS) for ALL content tables (team_members, services, games, digital_marketing, web_portals, applications, social_links, contact_info, newsletter_subscribers, interactive_mastheads, top_banner, partner_logos); service-role rows still succeed. This proves the write hole is closed.

- [ ] **Step 2: Confirm public reads still work**
Run: `curl -s -o /dev/null -w "%{http_code}\n" https://www.appectiveteknoloji.net/` → `200`, and visually confirm team/partners/services/footer render.

- [ ] **Step 3: Confirm production admin still works**
Re-run a quick create→delete in two admin sections on production (e.g. Team Members + Social Links). Expected: success (writes go via service-role API).

- [ ] **Step 4: Confirm newsletter privacy**
Run an anon read attempt:
```bash
node -e "import('@supabase/supabase-js').then(async ({createClient})=>{const c=createClient(process.env.URL,process.env.ANON);const {data,error}=await c.from('newsletter_subscribers').select('*');console.log({rows:data?.length,error:error?.message});})"
```
(with `URL`/`ANON` env set) Expected: `rows: 0` or an RLS error — subscriber emails no longer publicly readable.

- [ ] **Step 5: Run Supabase advisors**
Use MCP `get_advisors` (type `security`). Expected: the `partner_logos` RLS-disabled critical advisory is gone.

---

## Self-Review notes (addressed)
- Every spec component maps to tasks: A → Tasks 1–9; B → Task 10; C → Task 12; D → Tasks 11 & 13.
- Strict rollout order is enforced by Task 11 (gate) before Task 12.
- The three tables lacking a dedicated public-read policy (`contact_info`, `social_links`, `interactive_mastheads`) are explicitly given one in Task 12 Step 2 before the ALL policy is dropped — prevents a homepage read regression.
- Public actions that must survive RLS tightening (newsletter subscribe, job application submit) use service-role server routes (Task 8; job-applications already does).
