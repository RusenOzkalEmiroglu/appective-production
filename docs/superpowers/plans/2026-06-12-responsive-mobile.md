# Phone-First Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public site and admin panel render cleanly and usably on phones (≤430px) with no horizontal overflow, readable text, and properly stacked layouts — adapting the existing design, not redesigning.

**Architecture:** Mobile-first Tailwind. Replace fixed `px` widths with fluid units, stack horizontal layouts on small screens, scale type/spacing, gate heavy 3D backgrounds off on phones, and add a global `overflow-x-hidden` guard. Work in three ordered layers: foundations → public site → admin.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS. No unit-test framework — verification is `npm run build` + a per-task code-level breakpoint checklist + user phone spot-checks per layer after deploy.

**Branch:** `responsive-mobile` (based on deployed `main`/`f9d26ee`). Do NOT touch the user's uncommitted masthead files: `src/app/api/upload/route.ts`, `src/components/MastheadPopup.tsx`, `src/components/admin/ImageUploader.tsx`, `src/middleware.ts`, `src/app/api/proxy-html5/`. Use `git add <specific files>` only.

## Shared Mobile-First Checklist (apply in every Layer 2 & 3 component task)
When fixing a component for phones, read the file fully first, then:
1. **No fixed widths wider than the viewport:** replace `w-[NNNpx]`, `min-w-[NNNpx]`, inline `style={{ width: 'NNNpx' }}`, or `width={NNN}` containers with fluid equivalents — `w-full`, `max-w-[NNNpx] w-full`, or a `%`. Keep a `max-w-*` cap for desktop.
2. **Stack horizontal layouts on phone:** `flex` rows → `flex-col md:flex-row`; multi-col grids → `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`.
3. **Fluid media:** `<img>`/`next/image` wrappers get `max-w-full h-auto`; absolute/large decorative images get `hidden md:block` if they overflow.
4. **Typography & spacing scale down:** oversized headings get a phone size first, e.g. `text-3xl md:text-5xl lg:text-6xl`; large paddings/margins get a smaller phone base, e.g. `px-4 md:px-8`, `py-12 md:py-20`, `gap-4 md:gap-8`.
5. **Tap targets ≥40px** for buttons/links.
6. **No element forces horizontal scroll at 390px.**
Acceptance per component: `npm run build` passes; visual scan of the JSX confirms a phone-first base class exists for every previously-fixed dimension and every horizontal layout has a stacking class.

---

## Layer 1 — Foundations

### Task 1: Viewport export + global overflow guard

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Add the `Viewport` import and export in `layout.tsx`**
Change the type import line `import type { Metadata } from 'next';` to:
```ts
import type { Metadata, Viewport } from 'next';
```
Immediately after the existing `export const metadata: Metadata = { ... };` block, add:
```ts
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07081e',
};
```

- [ ] **Step 2: Add overflow + media guard to `globals.css`**
Right after the `@tailwind utilities;` line in `src/styles/globals.css`, add:
```css
/* Phone-first guards: prevent stray horizontal scroll and overflowing media */
html, body {
  max-width: 100%;
  overflow-x: hidden;
}
img, video, canvas, iframe {
  max-width: 100%;
}
```

- [ ] **Step 3: Verify build**
Run: `npm run build`
Expected: compiles successfully, no type errors.

- [ ] **Step 4: Commit**
```bash
git add src/app/layout.tsx src/styles/globals.css
git commit -m "feat(responsive): viewport meta + global overflow-x guard"
```

---

### Task 2: `useIsMobile` hook + gate heavy 3D background off on phones

**Files:**
- Create: `src/lib/useIsMobile.ts`
- Modify: `src/app/HomePageClient.tsx`
- Modify: `src/app/interactive-mastheads/page.tsx`

- [ ] **Step 1: Create the hook**
Create `src/lib/useIsMobile.ts`:
```ts
'use client';
import { useEffect, useState } from 'react';

/**
 * SSR-safe: returns false on the server and first client render, then updates
 * after mount and on resize. Default breakpoint matches Tailwind's `md` (768px).
 */
export function useIsMobile(maxWidth = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [maxWidth]);
  return isMobile;
}
```

- [ ] **Step 2: Gate the background in `HomePageClient.tsx`**
Add the import near the other imports:
```ts
import { useIsMobile } from '@/lib/useIsMobile';
```
Inside the `HomePageClient` component body (with the other hooks like `useState`), add:
```ts
const isMobile = useIsMobile();
```
Find the render of `<DynamicTypographicBackground />` (around line 89) and make it conditional:
```tsx
{!isMobile && <DynamicTypographicBackground />}
```

- [ ] **Step 3: Gate the background in `interactive-mastheads/page.tsx`**
Read the file. If it is a client component that renders `<DynamicTypographicBackground />`, add the same `useIsMobile` import + `const isMobile = useIsMobile();` and wrap the render with `{!isMobile && ...}`. If the page is a server component (no `'use client'`), instead wrap the background in a tiny existing/!inline client wrapper OR add `'use client'` only if it has no server-only data needs; if unsure, render the background inside a new minimal client component `src/components/MobileGatedTypographicBackground.tsx` that does the `useIsMobile` gating and import it here. State which path you took.

- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: compiles successfully; no SSR/hook errors.

- [ ] **Step 5: Commit**
```bash
git add src/lib/useIsMobile.ts src/app/HomePageClient.tsx src/app/interactive-mastheads/page.tsx
git commit -m "feat(responsive): disable heavy 3D background on phones via useIsMobile"
```
(Also add `src/components/MobileGatedTypographicBackground.tsx` to the commit if you created it.)

---

## Layer 2 — Public site (phone ≤430px). Apply the Shared Mobile-First Checklist to each.

### Task 3: Fix `RelevantAppfectSection` and `Services` (worst fixed-width offenders)

**Files:**
- Modify: `src/components/RelevantAppfectSection.tsx`
- Modify: `src/components/Services.tsx`

- [ ] **Step 1:** Read `src/components/RelevantAppfectSection.tsx`. Apply the Shared Mobile-First Checklist — it has ~10 fixed widths; convert each to fluid (`w-full max-w-[...]`), stack any side-by-side blocks with `flex-col md:flex-row`, and scale headings/padding for phone.
- [ ] **Step 2:** Read `src/components/Services.tsx`. Apply the checklist — convert its fixed widths, ensure the services grid is `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`, and scale type/spacing.
- [ ] **Step 3: Verify build** — Run: `npm run build` → success.
- [ ] **Step 4: Commit**
```bash
git add src/components/RelevantAppfectSection.tsx src/components/Services.tsx
git commit -m "fix(responsive): RelevantAppfectSection + Services phone layout"
```

### Task 4: Fix `AppfectSection` and `InteractiveAppfectSection`

**Files:**
- Modify: `src/components/AppfectSection.tsx`
- Modify: `src/components/InteractiveAppfectSection.tsx`

- [ ] **Step 1:** Read `AppfectSection.tsx` (large, already has many breakpoints). Focus ONLY on phone breakage: find its 5 fixed widths and any row layouts without a `flex-col` base; fix per the checklist. Do not restructure working desktop layout.
- [ ] **Step 2:** Read `InteractiveAppfectSection.tsx`; apply the checklist (2 fixed widths + stacking + type scale).
- [ ] **Step 3: Verify build** — `npm run build` → success.
- [ ] **Step 4: Commit**
```bash
git add src/components/AppfectSection.tsx src/components/InteractiveAppfectSection.tsx
git commit -m "fix(responsive): AppfectSection + InteractiveAppfectSection phone layout"
```

### Task 5: Fix `Hero`, `WorkShowcase`, `AboutSection`

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/WorkShowcase.tsx`
- Modify: `src/components/AboutSection.tsx`

- [ ] **Step 1:** Read and fix `Hero.tsx` per the checklist (headline type scale `text-4xl md:text-6xl lg:text-7xl`, full-width CTA stacking, no fixed-width overflow).
- [ ] **Step 2:** Read and fix `WorkShowcase.tsx` (cards grid `grid-cols-1 md:grid-cols-2/3`, fluid media).
- [ ] **Step 3:** Read and fix `AboutSection.tsx` (stack text/visual columns `flex-col md:flex-row`, type/padding scale).
- [ ] **Step 4: Verify build** — `npm run build` → success.
- [ ] **Step 5: Commit**
```bash
git add src/components/Hero.tsx src/components/WorkShowcase.tsx src/components/AboutSection.tsx
git commit -m "fix(responsive): Hero + WorkShowcase + AboutSection phone layout"
```

### Task 6: Fix `TeamSection`, `SegmentedPartnerLogos`, `AppfectFeaturesGrid`

**Files:**
- Modify: `src/components/TeamSection.tsx`
- Modify: `src/components/SegmentedPartnerLogos.tsx`
- Modify: `src/components/AppfectFeaturesGrid.tsx`

- [ ] **Step 1:** `TeamSection.tsx` — member grid `grid-cols-2 md:grid-cols-3/4` (2 cols is fine on phone for avatars; never a fixed px row), fix its 3 fixed widths, fluid images.
- [ ] **Step 2:** `SegmentedPartnerLogos.tsx` — logo grid/marquee must not overflow; logos `grid-cols-3 sm:grid-cols-4 md:grid-cols-6` or a contained scroll; fix the 2 fixed widths.
- [ ] **Step 3:** `AppfectFeaturesGrid.tsx` — feature grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-N`, scale.
- [ ] **Step 4: Verify build** — `npm run build` → success.
- [ ] **Step 5: Commit**
```bash
git add src/components/TeamSection.tsx src/components/SegmentedPartnerLogos.tsx src/components/AppfectFeaturesGrid.tsx
git commit -m "fix(responsive): Team + PartnerLogos + FeaturesGrid phone layout"
```

### Task 7: Fix `ContactSection`, `SimpleContact`, `TopBanner`, `JobOpeningsSection`, legal pages

**Files:**
- Modify: `src/components/ContactSection.tsx`
- Modify: `src/components/SimpleContact.tsx`
- Modify: `src/components/TopBanner.tsx`
- Modify: `src/components/JobOpenings/JobOpeningsSection.tsx`
- Modify (if needed): `src/app/cookie-policy/page.tsx`, `src/app/privacy-policy/page.tsx`, `src/app/terms-of-service/page.tsx`

- [ ] **Step 1:** `ContactSection.tsx` + `SimpleContact.tsx` — form full-width inputs, `flex-col md:flex-row` for any side-by-side, fix the 1 fixed width.
- [ ] **Step 2:** `TopBanner.tsx` (0 breakpoints currently) — make the banner image/area fluid (`w-full h-auto`, `max-w-full`), text/button scale.
- [ ] **Step 3:** `JobOpenings/JobOpeningsSection.tsx` — list/cards stack `grid-cols-1 md:grid-cols-2`.
- [ ] **Step 4:** Open each legal page; if any uses a fixed-width container or large type, apply `max-w-full px-4` and a phone type scale. If already fluid text, no change — say so.
- [ ] **Step 5: Verify build** — `npm run build` → success.
- [ ] **Step 6: Commit**
```bash
git add src/components/ContactSection.tsx src/components/SimpleContact.tsx src/components/TopBanner.tsx src/components/JobOpenings/JobOpeningsSection.tsx src/app/cookie-policy/page.tsx src/app/privacy-policy/page.tsx src/app/terms-of-service/page.tsx
git commit -m "fix(responsive): Contact + TopBanner + JobOpenings + legal pages phone layout"
```

---

## Layer 3 — Admin (phone)

### Task 8: AdminLayout mobile drawer

**Files:**
- Modify: `src/components/admin/AdminLayout.tsx`

- [ ] **Step 1:** Read `src/components/admin/AdminLayout.tsx`. It renders `<div className="flex h-screen"><aside className="w-64 ...">...</aside><main className="flex-1 ...">...</main></div>`. Convert the `<aside>` into a responsive drawer:
  - Add a client state `const [drawerOpen, setDrawerOpen] = useState(false);` (the component is already `'use client'` / uses hooks — confirm; if not, add `'use client'`).
  - On phones the sidebar is hidden by default and slides in; on `md+` it is static as today. Apply to the `<aside>`:
    `className="... w-64 ... fixed inset-y-0 left-0 z-40 transform transition-transform md:static md:translate-x-0 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}"`
  - Add a top bar visible only on phone (`md:hidden`) inside `<main>` (or above it) containing a hamburger button that toggles `setDrawerOpen(o => !o)`.
  - Add a backdrop `<div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setDrawerOpen(false)} />` rendered only when `drawerOpen`.
  - Close the drawer when a nav item is selected (call `setDrawerOpen(false)` in the existing nav item click handler / alongside `onSectionChange`).
- [ ] **Step 2: Verify build** — `npm run build` → success.
- [ ] **Step 3: Commit**
```bash
git add src/components/admin/AdminLayout.tsx
git commit -m "feat(responsive): admin sidebar becomes mobile drawer with hamburger"
```

### Task 9: Admin tables horizontally scrollable + forms stack

**Files:**
- Modify: `src/components/admin/NewsletterSubscribers.tsx`
- Modify: `src/components/admin/JobApplicationsManagementPage.tsx`
- Modify: `src/components/admin/AdminPartnersManagementPage.tsx`
- Modify (forms, grid collapse): `src/components/admin/ServiceForm.tsx`, `src/components/admin/GameForm.tsx`, `src/components/admin/MastheadForm.tsx`, `src/components/admin/WebPortalForm.tsx`, `src/components/admin/DigitalMarketingForm.tsx`

- [ ] **Step 1:** For each of the three table components, find the `<table ...>` and wrap it in a scroll container: `<div className="overflow-x-auto">...<table className="min-w-full ...">...</table></div>` so wide tables scroll instead of breaking the page.
- [ ] **Step 2:** For each form component, find multi-column grids (`grid-cols-2`, `grid grid-cols-3`, or flex rows of inputs) and make them collapse on phone: `grid-cols-1 md:grid-cols-2`; ensure inputs are `w-full`.
- [ ] **Step 3:** Verify the admin dashboard cards in `src/app/admin/page.tsx` already use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (they do per the spec) — no change unless an overflow is found.
- [ ] **Step 4: Verify build** — `npm run build` → success.
- [ ] **Step 5: Commit**
```bash
git add src/components/admin/NewsletterSubscribers.tsx src/components/admin/JobApplicationsManagementPage.tsx src/components/admin/AdminPartnersManagementPage.tsx src/components/admin/ServiceForm.tsx src/components/admin/GameForm.tsx src/components/admin/MastheadForm.tsx src/components/admin/WebPortalForm.tsx src/components/admin/DigitalMarketingForm.tsx
git commit -m "fix(responsive): admin tables scrollable + forms stack on phone"
```

---

## Layer-end verification (after each layer)
- `npm run build` passes.
- Push branch; deploy a Vercel preview (or merge to main per the user's preference).
- User spot-checks on their phone and reports any remaining breakage; fix reported issues before moving to the next layer.

## Self-Review notes (addressed)
- Spec coverage: Foundations → Tasks 1–2; public site sections → Tasks 3–7 (all 13 listed components + legal pages); admin drawer → Task 8; admin tables/forms → Task 9.
- No unit tests exist; verification adapted to build + checklist + user phone spot-check, as the spec's Verification section specifies.
- `useIsMobile` signature is defined once (Task 2) and reused consistently.
- The 3D gating only targets `DynamicTypographicBackground` (the only rendered heavy background; `ParticleBackground` is commented out, `LivingTypography` not rendered) — matches the codebase.
