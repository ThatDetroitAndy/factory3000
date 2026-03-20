# FACTORY 3000 — Project Bible

**Last updated:** March 20, 2026
**Status:** Proof of concept complete

---

## THE VISION

Andy's Factory (YouTube) meets Ryan3000's "1 subscriber = 1 chicken" mechanic, applied to cars.

**Core mechanic:** 1 Subscriber = 1 Car in a virtual factory world.

**The hook:** Subscribers register via a link, pick a car model (Car 1, Car 2, or Car 3), choose a color, name their car, and get a car number. Their car appears in a 3D virtual factory that anyone can visit in a browser. The factory grows as the channel grows.

**Target audience:** Kids and families. Fun, simple, toy-like.

---

## YOUTUBE CHALLENGE (PUBLIC STAKES)

1. The virtual factory must produce as many cars as there are subscribers within 1 year — or the factory gets deleted forever.
2. The real factory must make and sell 1 street-legal car by end of 1 year — or it gets closed forever.

---

## PRODUCT LINES

### Digital
- Virtual car ownership (free with signup)
- $5 rendered photo of your car (canvas capture + payment)
- Future: drive your car around in the virtual world

### Physical
- Car 1, Car 2, Car 3 — real vehicles, leveling up from the most basic go-kart
- Selling actual kits for each level
- 3D printed toy versions of Car 1, Car 2, Car 3
- Release STL files for DIY printing (protect IP first)
- Car 1 should be something kids could actually ride — simple, fun

### Brand
- Mutiny becomes a fun online brand, simple and toylike
- PROTECT the car designs as IP
- Keep naming dead simple: Car 1. Car 2. Car 3.

---

## TECH STACK

### Frontend (Virtual Factory)
- **Three.js** via vanilla JS (proof of concept) → migrate to **React Three Fiber** for production
- **Next.js** app shell (already in Andy's wheelhouse)
- Low-poly / toy-like aesthetic
- Runs in browser, no downloads — critical for kids + YouTube CTAs

### Backend
- **Supabase** for subscriber/car database
- Tables: `cars` (id, name, car_type, color, subscriber_email, created_at, car_number)
- AI content filter on car names (flag offensive words at signup)

### Hosting
- **Vercel** for Next.js app
- Domain: TBD (factory3000.com? mutinyfactory.com?)

### Future Integrations
- **Stripe** for $5 car photo purchases, toy sales, kit preorders
- **YouTube Data API** for subscriber count display / verification
- Instanced rendering (THREE.InstancedMesh) for scaling to 2M+ cars

---

## SIGNUP FLOW (TO BUILD)

1. User visits site → "Register Your Car"
2. Pick model: Car 1, Car 2, or Car 3
3. Pick color (from preset palette)
4. Name your car (AI filter for offensive content)
5. Submit → get assigned a car number
6. Car appears in virtual factory
7. Shareable link: "Visit my car at factory3000.com/car/0472"
8. Data writes to Supabase, factory world reads from Supabase

---

## MONETIZATION IDEAS

| Idea | Price | Complexity |
|------|-------|------------|
| Rendered car photo | $5 | Low — canvas capture + Stripe |
| 3D printed toy (Car 1/2/3) | $15-30? | Medium — need print pipeline |
| DIY STL files | Free / $5? | Low — file hosting |
| Physical go-kart kit (Car 1) | TBD | High — real manufacturing |
| Street-legal car | TBD | The whole Mutiny mission |

---

## ROADMAP

### Phase 1 — DONE ✅
- [x] Proof of concept: 500 cars on factory floor
- [x] 3 car types (go-kart, pickup, SUV) in toy style
- [x] Search-and-fly-to mechanic
- [x] Factory environment (floor, walls, conveyors, lighting)
- [x] Orbit/zoom/pan camera controls

### Phase 2 — Signup + Live Data
- [ ] Signup form (Next.js page)
- [ ] Supabase table for car registrations
- [ ] AI name filter (Claude API or simple blocklist)
- [ ] Replace mock data with live Supabase query
- [ ] Shareable car URLs (factory3000.com/car/XXXX)

### Phase 3 — Scale + Polish
- [ ] Switch to InstancedMesh for 100K+ cars
- [ ] Better car models (still low-poly, more character)
- [ ] Factory animations (conveyor belts, robot arms moving)
- [ ] Particle effects (sparks, steam)
- [ ] Sections/zones on factory floor (Car 1 wing, Car 2 wing, Car 3 wing)
- [ ] Subscriber count display synced to YouTube API

### Phase 4 — Monetization
- [ ] $5 car photo (canvas capture + Stripe checkout)
- [ ] Toy store page (3D printed cars)
- [ ] Kit preorder page
- [ ] STL file downloads

### Phase 5 — Gameplay
- [ ] Drive your car around the factory
- [ ] Multiplayer? (ambitious — evaluate later)
- [ ] Factory expansion animations as milestones hit

---

## DESIGN PRINCIPLES

1. **IT'S FOR KIDS.** Everything should feel fun, safe, colorful, toylike.
2. **Keep it simple.** Car 1. Car 2. Car 3. No feature creep on naming.
3. **The factory is the content.** Every milestone, every visual, every fly-through is a YouTube moment.
4. **Real stakes.** The public challenge creates urgency and narrative tension.
5. **Digital-to-physical pipeline.** Virtual car → toy → kit → real vehicle. That's the Mutiny ladder.

---

## FILES

| File | Description |
|------|-------------|
| `factory3000.html` | Proof of concept — standalone HTML/JS with Three.js |
| `FACTORY3000_PROJECT.md` | This file — project bible |

---

## INSPIRATION

- **Ryan3000** (YouTube) — 1 subscriber = 1 chicken, name tags, community identity
- **Satisfactory** — factory aesthetic, conveyor belts, industrial playground
- **Lego / toy aesthetic** — low-poly, bright colors, chunky shapes
- **Google Earth zoom** — wide view → search → fly to your specific spot

---

## OPEN QUESTIONS

- [ ] Domain name? factory3000.com, mutinyfactory.com, other?
- [ ] IP protection strategy for Car 1/2/3 designs — trademark? design patent?
- [ ] Car 1 as a rideable kids vehicle — what's the simplest version of this?
- [ ] How to verify subscriber status at signup? YouTube API OAuth vs. honor system?
- [ ] Multiplayer driving — worth the complexity or save for way later?
