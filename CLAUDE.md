# Factory 3000

## Project Overview
YouTube-driven virtual car factory. 1 Subscriber = 1 Car. Browser-based 3D factory world built with React Three Fiber. Subscribers sign up via magic link, build a car (pick type, color, name), watch it roll off the conveyor belt, and park it in the lot. Anyone can browse the factory and drive any car around without logging in.

Related to Mutiny Motors (~/Mutiny Motors) — Factory 3000 is the digital/YouTube/community side. Separate codebase, separate deploy.

## The Challenge (Public Stakes)
1. Virtual factory must produce as many cars as there are subscribers within 1 year — or the factory gets deleted forever.
2. Real factory must make and sell 1 street-legal car by end of 1 year — or it gets closed forever.

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind)
- **3D:** React Three Fiber + drei + Three.js
- **Database:** Supabase (project: Factory3000, id: daoxdtyyjvevibrsiamt)
- **Auth:** Supabase Auth (magic link email)
- **Hosting:** Vercel (not yet deployed)
- **Name Filter:** Claude Haiku API + local blocklist
- **Payments:** Stripe (future Phase 4)
- **Vibe:** Satisfactory / industrial playground — mechanical, colorful, fun

## Current Status
- Phase 2 in progress
- 3D factory scene: floor, columns, ceiling, conveyor belt, crate warehouse, parking lot
- 3 car models (go-kart, pickup, SUV) from primitives
- Car builder flow (type → color → name) with magic link auth
- Name filter (blocklist + Claude API)
- API routes: GET/POST cars, filter-name, single car lookup
- Shareable car pages (/car/[number]) with OG metadata
- Search bar with fly-to camera animation
- HUD with car counter + progress bar
- Supabase: cars table with RLS, magic link auth enabled

## Key Concepts
- **381K existing subscribers** shown as numbered crates in warehouse zone (InstancedMesh)
- **Conveyor belt** with assembly stations (TYPE, PAINT, NAME) — cars visibly produced
- **Parking lot** where finished cars park with floating name tags
- **No login required to browse** — auth only for building your car
- **Magic link email** — no passwords

## File Structure
```
src/
  app/
    page.tsx                — Landing page (server) → FactoryApp (client)
    car/[number]/           — Shareable car pages
    auth/callback/          — Magic link handler
    api/cars/               — GET all, POST create
    api/cars/[number]/      — GET single car
    api/filter-name/        — POST name safety check
  components/
    FactoryApp.tsx          — Client wrapper managing state
    factory/                — All 3D components (scene, floor, cars, crates, conveyor, camera)
    builder/                — Car builder UI (type picker, color picker, name input)
    ui/                     — HUD, search bar, auth button
  lib/
    supabase-browser.ts     — Browser client (anon key)
    supabase-server.ts      — Server client (service role)
    types.ts                — Car type, CarType
    colors.ts               — Preset color palette
    constants.ts            — Subscriber count, grid math, factory dimensions
    name-filter.ts          — Blocklist + Claude API
  hooks/
    useAuth.ts              — Supabase auth state + magic link
```

## Supabase Schema
```sql
cars (id UUID PK, car_number SERIAL UNIQUE, user_id UUID UNIQUE, name, car_type, color, parked_x, parked_z, parked_rotation, created_at)
RLS: public SELECT, user INSERT/UPDATE own car only
```

## Design Principles
1. It's for kids — fun, safe, colorful
2. Keep it simple — Car 1, Car 2, Car 3
3. The factory is the content — every visual is a YouTube moment
4. Real stakes — the public challenge creates urgency
5. Digital-to-physical pipeline: virtual car → toy → kit → real vehicle
6. No login wall — the site should be fun without signing up

## Rules
- AI name filter on all car names (blocklist + Claude Haiku)
- Browser-only, no downloads
- One car per account (user_id UNIQUE on cars table)
- Never expose subscriber emails client-side
- Mock data fallback when Supabase is unavailable
