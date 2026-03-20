# Factory 3000

## Project Overview
YouTube-driven virtual car factory. **1 Subscriber = 1 Car.** Browser-based 3D factory world built with React Three Fiber. Anyone can visit, explore, and drive cars without logging in. Subscribers build their own car — pick a type, color, name — watch it roll off the conveyor belt, and celebrate as it parks in the lot with their name floating above it.

Related to Mutiny Motors (~​/Mutiny Motors) — Factory 3000 is the digital/YouTube/community side. Separate codebase, separate deploy.

## Live Site
**https://factory3000.vercel.app**

## The Challenge (Public Stakes)
1. Virtual factory must produce as many cars as there are subscribers within 1 year — or the factory gets deleted forever.
2. Real factory must make and sell 1 street-legal car by end of 1 year — or it gets closed forever.

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind)
- **3D:** React Three Fiber + drei + Three.js
- **Database:** Supabase (project: Factory3000, id: daoxdtyyjvevibrsiamt, region: us-east-1)
- **Auth:** Supabase Auth (magic link email, optional — cars can be built without auth)
- **Hosting:** Vercel (project: factory3000, auto-deploys from GitHub)
- **GitHub:** https://github.com/ThatDetroitAndy/factory3000
- **Name Filter:** Claude Haiku API + local profanity blocklist
- **Payments:** Stripe (future Phase 4)
- **Style:** Bruno Simon-inspired — warm, colorful, playful, fun for kids

## Current Status (Phase 2 — in progress)
### Built ✅
- 3D factory building modeled after Andy's real Detroit factory (5938 Linsdale) — red brick, rolling doors, decorative cornice, corrugated metal rear, blue dumpsters, fire hydrant, utility poles
- 3 detailed car models (go-kart, pickup, SUV) with headlights, taillights, wheels, bumpers, exhaust
- Conveyor belt with 3 colorful assembly stations (TYPE, PAINT, NAME) + robot arms
- Crate warehouse with 381K instanced crates representing unclaimed subscribers
- Parking lot with floating name tags above each car
- Car builder flow: type → color → name (no email required)
- 3D production animation: car travels down conveyor belt, camera follows alongside
- 3D celebration: when car finishes, name floats above it with sparkles + "Press WASD to drive!" prompt
- AI name filter (local blocklist + Claude Haiku API fallback)
- Magic link email claim (optional — to come back and modify your car later)
- Persistent email claim bar (localStorage-based, stays until claimed or dismissed)
- Factory props: trees, bushes, tire stacks, oil barrels, toolboxes, flags, traffic cones, forklift, warning lights
- Warm colorful ground (terracotta sand + grass patches), blue sky, sunset environment map
- Shareable car pages at /car/[number] with OG metadata
- Search bar with fly-to camera animation
- HUD with car counter + progress bar
- Deployed to Vercel with Supabase env vars

### TODO
- [ ] Drive mode (WASD keyboard controls, third-person camera follow)
- [ ] Mobile touch controls for driving
- [ ] Car name max length tuning (currently 24 chars)
- [ ] Domain name (factory3000.com? mutinyfactory.com?)
- [ ] Service role key in Vercel env (needed for server-side car creation)
- [ ] Supabase Auth email templates customization

### Future Phases
- **Phase 3:** InstancedMesh for 100K+ cars, better .glb car models, YouTube API subscriber count, sound effects, mobile optimization
- **Phase 4:** $5 car photo (canvas capture + Stripe), toy store, kit preorders, STL downloads
- **Phase 5:** Multiplayer driving, factory expansion animations, car upgrades

## Key Concepts
- **381K existing subscribers** → numbered crates in warehouse zone (InstancedMesh, visual only)
- **Conveyor belt production** → car visibly travels through assembly stations, camera follows
- **3D celebration** → car name + sparkles + "WASD to drive" appear above car when done (no dialog)
- **No login required** → anyone can build a car. Email is optional, just for claiming ownership.
- **Persistent email prompt** → localStorage tracks unclaimed cars, bar reappears until claimed

## Supabase Schema
```sql
cars (
  id UUID PK,
  car_number SERIAL UNIQUE,
  user_id UUID NULLABLE (null = unclaimed anonymous car),
  name TEXT,
  car_type TEXT CHECK ('car1','car2','car3'),
  color TEXT (hex),
  parked_x FLOAT, parked_z FLOAT, parked_rotation FLOAT,
  created_at TIMESTAMPTZ
)
RLS: public SELECT, anyone INSERT, user UPDATE own car only
```

## File Structure
```
src/
  app/
    page.tsx                     — Server component, fetches cars → FactoryApp
    car/[number]/                — Shareable car pages with OG meta
    auth/callback/               — Magic link handler (supports car claiming)
    api/cars/                    — GET all, POST create (no auth required)
    api/cars/[number]/           — GET single car
    api/cars/claim/              — POST send magic link to claim a car
    api/filter-name/             — POST name safety check
  components/
    FactoryApp.tsx               — Client wrapper: state for cars, flyTo, production, celebration
    factory/
      FactoryScene.tsx           — Main R3F Canvas, composes all 3D
      FactoryBuilding.tsx        — Detroit factory: red brick, rolling doors, trusses, lights, pipes
      FactoryFloor.tsx           — Ground planes, grass patches, dirt road
      FactoryLighting.tsx        — Warm ambient + directional + hemisphere
      FactoryProps.tsx           — Trees, barrels, flags, cones, forklift, etc.
      ConveyorBelt.tsx           — Belt + stations + robot arms
      CrateWarehouse.tsx         — 381K instanced crates
      ParkingLot.tsx             — Parked cars in grid with name tags
      CarModel.tsx               — 3 car types (go-kart, pickup, SUV) from primitives
      CarNameTag.tsx             — Floating HTML label above car
      ProductionCar.tsx          — Animated car traveling conveyor, camera follows
      CelebrationOverlay.tsx     — 3D name + sparkles + "WASD to drive" after production
      CameraControls.tsx         — Orbit controls + fly-to + production mode
    builder/
      CarBuilder.tsx             — Multi-step: type → color → name → build
      TypePicker.tsx             — Car 1/2/3 selection
      ColorPicker.tsx            — 8-color preset palette
      NameInput.tsx              — Name with real-time AI filter
    ui/
      HUD.tsx                    — Title, search, build button, car counter
      SearchBar.tsx              — Search cars by name/number, fly-to
      EmailClaimBar.tsx          — Persistent "save your car" prompt
  lib/
    supabase-browser.ts          — Browser client (anon key, reads only)
    supabase-server.ts           — Server client (service role, writes)
    types.ts                     — Car, CarType
    colors.ts                    — 8 preset car colors
    constants.ts                 — Subscriber count, grid math, factory dims
    name-filter.ts               — Profanity blocklist + Claude Haiku API
  hooks/
    useAuth.ts                   — Supabase auth state + magic link
```

## Design Principles
1. **It's for kids** — fun, safe, colorful, toylike
2. **Keep it simple** — Car 1, Car 2, Car 3
3. **The factory is the content** — every visual is a YouTube moment
4. **Real stakes** — the public challenge creates urgency
5. **Digital-to-physical pipeline** — virtual car → toy → kit → real vehicle
6. **No login wall** — the site should be fun without signing up
7. **Celebrate the moment** — when a car is built, it's a big deal in 3D, not a dialog box

## How We Work
Andy works directly with Claude in Claude Code. Conversations are stream-of-consciousness. The factory building is modeled after Andy's real factory in Detroit. Style inspiration: Bruno Simon (bruno-simon.com).

## Rules
- AI name filter on all car names (blocklist + Claude Haiku, fail-open)
- Browser-only, no downloads
- One car per email (user_id UNIQUE on cars table, nullable for anonymous)
- Never expose subscriber emails client-side
- Mock data fallback when Supabase is unavailable
- Supabase clients must be created inside functions, not at module level (Vercel build requirement)
