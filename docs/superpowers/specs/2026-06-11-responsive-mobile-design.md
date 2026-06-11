# Responsive / Mobile (Phone-First) — Design

Date: 2026-06-11
Status: Approved (design); plan pending
Site: www.appectiveteknoloji.net — Next.js 14 (App Router) + Tailwind CSS, deployed on Vercel.

## Goal

Make the entire site — public homepage, legal pages, AND the admin panel — render cleanly
and usably on **phones (priority, ≤430px)** without horizontal overflow, broken layouts, or
unreadable text. Tablet (768–1024px) should also be not-broken, but phone is the priority.
This is a **mobile adaptation of the existing design**, not a redesign — keep the current look
on desktop; aim for clean/usable/professional on phone, not pixel-perfection.

## Context (current state)

- Tailwind is already used, but responsive-class coverage is **inconsistent**: some components
  use many breakpoints (`AppfectSection`), others use **none** (`TopBanner`, `SimpleContact`,
  the 3D backgrounds), and several use **fixed pixel widths** that overflow on phones
  (`RelevantAppfectSection`, `AppfectSection`, `Services`, `Header`, `TeamSection`).
- `Header` **already has** a working mobile menu (hamburger + full-screen overlay, `md:hidden`).
- `AdminLayout` has a **fixed `w-64` sidebar always visible**, with **no mobile drawer** — on a
  phone it eats half the screen and crushes the content.
- Heavy Three.js backgrounds (`DynamicTypographicBackground`, `ParticleBackground`,
  `LivingTypography`) have no responsive handling — a perf/readability problem on phones.
- Homepage sections (rendered by `src/app/HomePageClient.tsx`): Header, Hero, Services,
  RelevantAppfectSection, WorkShowcase, AboutSection, JobOpeningsSection, ContactSection,
  AppfectFeaturesGrid, DynamicTypographicBackground.

## Approach

**Mobile-first, component-by-component, using Tailwind breakpoints** (the codebase's existing
pattern). For each component: replace fixed `px` widths with fluid units (`w-full`, `max-w-*`,
`%`), stack horizontal layouts on small screens (`flex-col` / `grid-cols-1` → `md:flex-row` /
`md:grid-cols-*`), scale typography and spacing down for phones, and constrain media
(`max-w-full h-auto`). Disable/lighten heavy 3D backgrounds on small screens. Add a global
`overflow-x-hidden` guard so no stray element causes horizontal scroll.

Rejected alternatives: (2) a global CSS scale/zoom hack — fragile and blurry; (3) separate
dedicated mobile components — doubles code and causes drift. Only build a separate mobile
variant if a single section is genuinely intractable inline.

## Architecture / Shared Units

- **Viewport:** add an explicit `export const viewport` in `src/app/layout.tsx`
  (`width: 'device-width', initialScale: 1`) to guarantee correct mobile scaling (Next injects a
  default, but make it explicit and add `themeColor`).
- **`overflow-x-hidden` guard:** add to `html, body` in `src/styles/globals.css` to prevent
  horizontal scroll from any one offender while sections are being fixed.
- **`useIsMobile` hook** (new, `src/lib/useIsMobile.ts`): a small client hook returning whether
  the viewport is below a breakpoint (e.g. 768px), SSR-safe (defaults to false, updates on mount
  + resize). Used to skip mounting the heavy 3D background components on phones. Where a
  background is purely decorative CSS, a Tailwind `hidden md:block` is enough and no hook is needed.

## Work Breakdown (three layers, in order)

### Layer 1 — Foundations
- `layout.tsx`: add `viewport` export.
- `globals.css`: `html, body { overflow-x: hidden; }` and ensure `max-width: 100%` on media.
- `useIsMobile` hook.
- Gate the 3 heavy 3D backgrounds so they do not mount/run on phones
  (`DynamicTypographicBackground`, `ParticleBackground` if used, `LivingTypography`): render
  nothing (or a lightweight static fallback) below the mobile breakpoint.

### Layer 2 — Public site (phone ≤430px)
Audit and fix each homepage section for phone, in this priority order (worst offenders first):
1. `RelevantAppfectSection` (10 fixed widths)
2. `AppfectSection` / `InteractiveAppfectSection`
3. `Services`
4. `Hero`
5. `WorkShowcase`
6. `TeamSection`
7. `SegmentedPartnerLogos`
8. `AppfectFeaturesGrid`
9. `AboutSection`
10. `ContactSection` / `SimpleContact`
11. `JobOpenings/JobOpeningsSection`
12. `TopBanner`
13. Legal pages: `cookie-policy`, `privacy-policy`, `terms-of-service` (likely text-only — quick pass).

Per section: no horizontal overflow at 390px; text legible (min ~14px body); tap targets ≥40px;
images fluid; multi-column blocks stack; no element wider than the viewport.

### Layer 3 — Admin (phone)
- `AdminLayout`: convert the fixed `w-64` sidebar into a **mobile drawer** — hidden by default on
  phone, toggled by a hamburger button in a top bar, slides in over the content (overlay +
  backdrop); unchanged on `md+` (sidebar stays static). Reuse the existing `activeSection`
  navigation; close the drawer on selection.
- Admin **tables** (`NewsletterSubscribers`, `JobApplicationsManagementPage`,
  `AdminPartnersManagementPage`, etc.): make wide tables horizontally scrollable
  (`overflow-x-auto` wrapper) so they don't break the layout on phone. (Card-stacking is a
  nice-to-have, out of scope for "clean & usable".)
- Admin **forms/grids** (ServiceForm, GameForm, MastheadForm, etc.): ensure multi-column grids
  collapse to one column on phone (`grid-cols-1 md:grid-cols-2`) and inputs are full-width.
- Admin **dashboard cards** already use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` — verify.

## Verification

The sandbox has no internet, so automated mobile screenshots (Playwright) are not possible.
Verification is therefore:
1. `npm run build` passes after each layer.
2. Code-level breakpoint correctness review (no fixed widths > viewport; stacking classes present).
3. After each layer is deployed to production (or a preview), the **user spot-checks on their phone**
   and reports any remaining breakage, which is then fixed.

## Out of Scope
- Visual redesign / new layouts (this is adaptation only).
- Pixel-perfect polish (explicitly deprioritized).
- Tablet-specific tuning beyond "not broken".
- Admin table card-stacking (horizontal scroll is sufficient).
- The user's uncommitted masthead work (left untouched).

## Risks
- A single missed overflow source can still cause horizontal scroll → mitigated by the global
  `overflow-x-hidden` guard plus per-section checks.
- Disabling 3D on mobile could leave a section looking empty → use a lightweight static fallback
  (solid/gradient background) where the 3D was load-bearing visually.
- No screenshot verification → rely on user phone spot-checks per layer; keep changes small and
  reviewable so regressions are easy to localize.
