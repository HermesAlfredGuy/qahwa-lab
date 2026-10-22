## Goal

Deliver a single self-contained HTML page for Qahwa Lab that makes the visitor feel they've been handed a document from a lab that happens to roast coffee — and makes them book a cupping or buy a 250 g bag.

## Medium and deliverables

Mobile-first responsive single-page website, one `index.html` (inline CSS + JS, CDN for three.js r165, GSAP/ScrollTrigger, Lenis). Deliverables: live URL via `publish-pages.sh`; screenshots at 390 / 768 / 1440 px; a 12 s capture of the hero morph proving motion; `qa.sh` report.

## Concept

**"Contour → Curve."** Jazan's Khawlani terraces aren't scenery, they're a data set: hand-cut steps following elevation, drawn on paper by farmers before a single tree goes in. The site opens on those contour lines as a live 3D wireframe ridge, and as you scroll, the mountain flattens into a roast curve — the same line, re-read by the roaster. Terroir becomes a graph; the graph becomes a bag. It's a lab notebook written in the language of the land, so every section is annotated like a field record: numbers first, adjectives almost never.

**Alternative:** a "cupping table" page that runs entirely sideways — horizontal scroll as a long wooden bench, each section a bowl on it.

Visual style: **mineral editorial lab** — sun-bleached paper, roast-ink type, terracotta rules, mono data. Mood words: dry, exact, warm, unhurried, high-altitude. References: **Onyx Coffee Lab** (steal the numbers-forward product cards and roast transparency); **Studio Freight, "Adieu"** (oversized grotesk, grain, slow scroll reveals); **Active Theory's shader terrain work** (steal the contour-line morph aesthetic, not the neon).

## Content

**Facts.** Qahwa Lab, Al Khobar (Prince Faisal bin Fahd Rd, Al Ulaya). Roasts Khawlani arabica from Jazan's Haraz highlands, 1,600–2,200 m, 42 partner families, 2025/26 harvest. 6 kg Probat drum, Tuesday roasts, bags dated to the hour. Q-grade 86.5. Three profiles: **Saba** (filter, 8:40, drop 196 °C), **Shamal** (medium, 10:20, 205 °C), **Nashi** (espresso, 11:05, 208 °C). SAR 78 / 84 / 88 per 250 g. Cupping table Saturdays 10:00, six seats.

**Voice.** A lab report with a pulse. Short declaratives, real units, no "artisanal", no "passion". Em dashes allowed, exclamation marks forbidden.

**Sections, in order:**
1. **Hero** — live contour terrain + headline.
2. **Origin** — Jazan terraces; the ridge scroll-translates into the roast curve.
3. **Cultivar** — Khawlani facts as a data strip (elevation, shade trees, harvest window, drying days).
4. **The Roast** — three profiles as mini curve charts with exact timings; hover/tap reveals development %.
5. **The Lab** — Al Khobar address, drum photo, Saturday cupping booking CTA.
6. **The Drop** — three bags, prices, date code, "add to bag" (front-end only, opens a confirmation sheet).
7. **Notes** — tasting-note wall (cocoa nib, dried fig, cardamom husk, juniper, palm sugar) + Q-grader quote.
8. **Visit/Footer** — hours, brew recipe, WhatsApp, colophon.

**Copy.** H1: *"The mountain made it. The lab reads it."* Sub: *"Khawlani arabica, grown on a staircase between 1,600 and 2,200 metres in Jazan. Roasted in Al Khobar, Tuesdays, six kilos at a time."* CTAs: *"Taste the 2025/26 harvest"* / *"Book the Saturday table."* Origin line: *"Forty-two families cut these steps by hand. We just wrote down what they taste like."* Lab line: *"The drum turns at 48 rpm. The room smells like the third minute of first crack."*

## Signature moment

A full-bleed three.js scene, orthographic camera, no perspective trickery: a 160×160 wireframe plane (GL lines, no fills) displaced by a baked Jazan elevation heightmap, drawn in `#17120E` at 0.35 opacity over raw linen. 84 lines, numbered in tiny mono at the right edge like a survey sheet. As the hero scrolls out and Origin scrolls in, a single GSAP timeline lerps the same geometry from terrain to a roast curve — the ridge collapses to a flat X/Y graph, and one line detaches, thickens to terracotta `#B4471F`, and traces the Saba curve while timestamp labels type themselves on at 0:00, 4:20, 8:40. On mobile the plane's line count drops to 48 and the camera pulls back; the morph is identical. A 2D canvas fallback draws the same two states for no-WebGL devices.

## Look

**Palette:** `#F2E7D3` raw linen (page base) · `#17120E` roast ink (type, wireframe) · `#B4471F` terracotta (curve, CTAs, rules) · `#6E7B54` highland green (cultivar blocks) · `#C9A227` jute gold (data ticks only) · `#E3CBB0` sandstone (panels, alternating bands).

**Type mood:** grotesk-expressive. Display: a wide, tight-tracked grotesk, lowercase, 88 px mobile / 160 px desktop, letterspacing −0.03em. Data: a monospace at 11 px, uppercase, +0.12em. Body: same grotesk at 17/26. `font-pick.sh` to lock the pair.

**Layout:** 12-column grid, hard left alignment, never centred; each section opens with a mono eyebrow and a hairline terracotta rule spanning full bleed. Asymmetric splits (5/7, 4/8). Generous negative space above headlines, dense data below.

**Imagery:** no stock photography. One macro image of green beans as a half-tone sandstone duotone, everything else drawn — SVG contour marks, a diagram of the drum, a terraced cross-section. Grain overlay at 6% on the whole page.

**Motion:** heavy, mechanical, warm — everything eases like a drum slowing (`power3.out`, 0.9–1.4 s). Scroll-linked only, no autoplay loops except the hero wireframe drifting 2 px/s. Preloader counts harvest days. Full motion regardless of OS reduced-motion setting, per house rule.

**Sound:** none. Silent page, WebAudio-free; the drum is implied by motion. No voiceover.

## Toolchain

`oneshot-page.sh` for a first concept draft and structural copy, `minimax` for a second headline pass, then hand-build the single file — editorial kit patterns for the multi-section rhythm, no framework. `font-pick.sh` for the grotesk/mono pairing. three.js r165 for the wireframe terrain with a canvas fallback; GSAP + ScrollTrigger + Lenis for the scroll timeline and smooth scroll. 21st.dev only for the booking sheet. `qa.sh` for web gates, vision review of real captures at 390/768/1440, `publish-pages.sh` to ship.

## Acceptance

1. `qa.sh` clean: 0 text leaks, 0 line clashes, no 390 px horizontal overflow, a11y AA contrast on every pairing.
2. Full motion plays when the OS reports reduced-motion — verified on capture.
3. The contour→curve morph runs at 60 fps on a mid-tier phone and completes in one continuous scroll, no jump cuts.
4. Canvas fallback renders both states with no WebGL.
5. All eight sections present in order; every number on the page matches the brief's fact sheet.
6. No stock photography, no purple-blue gradient, no glass cards, nothing centred.
7. Lighthouse mobile performance ≥ 85 with the CDN bundle deferred.
8. A fresh designer reviewer scores it ≥ 8.5/10 against Onyx, Adieu, Active Theory.

## Assumptions

Invented the Q-grade (86.5), all profile timings, prices, family count (42), address and hours — plausible for a Khobar specialty roaster. Chose the contour-morph hero over a 3D bag or a liquid/coffee-splash scene because it's distinctive and builds in one pass. Chose silent over ambient audio so nothing autoplays against the visitor. Skipped a cart backend: "add to bag" opens a confirmation sheet and a WhatsApp deep link. Assumed Latin-first typography with an Arabic wordmark set as SVG so no webfont dependency. Bag sizes fixed at 250 g to keep the product grid three-across on mobile.
