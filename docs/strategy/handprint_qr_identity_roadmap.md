# Handprint QR Identity Roadmap

## Purpose

Evaluate the idea that every personal Handprint mark should also function as a QR code that opens the user's public World Changer page.

## Working Interpretation

"UR Code" is confirmed as QR Code. The product goal is not merely to attach a QR code beside the Handprint logo. The better goal is to make the Handprint itself a recognizable, scannable civic identity artifact over time.

## Strategic Assessment

This is a strong product idea because it completes the loop between real-world action and digital identity:

1. User participates in the world.
2. Their Handprint grows.
3. The Handprint becomes shareable and scannable.
4. Other people see what they have done.
5. Other people can join the app or join the promoted actions.

This moves Handprint beyond a profile link. It becomes a portable signal: on a phone lock screen, event badge, sticker, flyer, volunteer table, resume, campus poster, name tag, email signature, or social post.

## Recommended Expertise Roles

### Visual Identity Designer

Own the balance between the Handprint as an emotional brand mark and the QR code as a functional scan object.

### QR Reliability Engineer

Validate scan readability across iPhone and Android cameras, print sizes, lighting, contrast, error correction, and visual overlays.

### Growth And Referral Designer

Design what happens after scan: join app, follow this World Changer, join promoted event, recruit a friend, or give earned appreciation.

### Privacy And Safety Lead

Decide what public profile data is safe to expose from a physical scan, and how users can revoke or rotate a code.

### Trust And Abuse Lead

Protect against copied codes, impersonation, malicious stickers, spam scans, and fake event promotion.

### World Enabler Operations Lead

Design World Enabler uses: event check-in posters, volunteer badges, team leader cards, recruitment tables, and post-event confirmation flows.

### Print And Physical Experience Designer

Ensure the user's single Handprint QR works on stickers, flyers, t-shirts, badges, wristbands, lanyards, and posters.

## Product Recommendation

Build this as a "Scan My Handprint" system with two layers:

1. Scannable code: a high-reliability QR code that points to a short Handprint URL.
2. Handprint frame: a visual identity layer around or inside the code that makes it feel personal and proud.

Do not make the first version too visually clever. If the code fails to scan, the whole idea loses trust. V1 should be conservative and reliable. A Handprint-shaped QR exploration is explicitly deferred to a later design pass.

## Recommended URL Model

Use short, durable URLs:

- `handprint.app/h/dan`
- `handprint.app/u/dan`
- `handprint.app/h/{publicId}`

Recommendation: use a non-guessable public ID behind the scenes while still showing a friendly handle. For example:

- Display: `@dan`
- Scan URL: `/h/hp_7K2Q9D`
- Redirects to: `/u/dan`

This allows code rotation, abuse response, and handle changes without breaking every printed QR code.

## Public Page After Scan

The scan destination should open a World Changer page optimized for a stranger:

- Who is this?
- What have they actually done?
- What have they earned?
- How is the world better for it?
- What are they doing next?
- How can I join?
- How can I start my own Handprint?

The phrase "how the world is better for it" should be treated carefully. It should use concrete impact evidence, not inflated moral claims. Prefer:

- "80 pantry boxes prepared"
- "30 intake sessions supported"
- "45 neighbor resource kits shared"
- "120 donated tools sorted"

Avoid:

- "Changed the world"
- "Saved the community"
- Unsupported claims

## QR Design Principles

- Use high contrast.
- Preserve a quiet zone around the code.
- Do not over-distort the finder squares.
- Keep the Handprint graphic as a frame, center mark, or background texture, not as the data modules in V1.
- Include a readable fallback URL below the code.
- Test at small sizes and printed sizes.
- Use dynamic redirects so the destination can evolve.

## Privacy And Control

Users need controls:

- Public / private Handprint.
- Which marks appear publicly.
- Whether point totals are visible.
- Whether event promotion is visible.
- Rotate QR code.
- Disable QR code.
- Report copied or abusive use.

For minors or youth programs, default public sharing should be restricted or require additional guardian/organization controls.

## Trust And Abuse Risks

### Copied Codes

Someone can screenshot or print another user's Handprint code.

Mitigation: public page should make identity clear, and sensitive actions should require account login.

### Malicious Stickers

Bad actors can place QR stickers in public places.

Mitigation: verified Handprint landing pages should clearly show the destination, app brand, and report controls.

### Overexposure

Users may accidentally make too much of their civic life public.

Mitigation: preview before publishing, mark-level privacy, and clear public/private state.

### Event Spam

Users might use their QR codes to push low-quality or unreviewed events.

Mitigation: only approved events can appear in public "join next" slots.

### QR Rot

Printed codes break if URLs change.

Mitigation: dynamic short IDs and redirect layer.

## Roadmap

### Phase 1: Static Prototype

- Generate a scannable QR for `/u/dan`.
- Add a "Scan my Handprint" card to the public profile.
- Add a QR preview to the Wave tab.
- Add fallback URL text.
- Keep visual styling conservative for scan reliability.

### Phase 2: Branded Handprint Code

- Add Handprint icon in the QR center if scan reliability passes.
- Add colored Handprint frame around the QR.
- Keep "copy link" as the primary sharing action.
- Defer QR image export until physical-world use cases require it.

### Phase 3: Dynamic Code Infrastructure

- Add `/h/{publicId}` redirect route.
- Store public ID separately from handle.
- Add code rotation.
- Add a quiet disable state for the user's QR if abuse or safety issues require it.
- Add scan analytics without collecting unnecessary personal data.

### Phase 4: Scan Landing Experience

- Optimize scanned page for first-time viewers.
- Add "Join this World Changer's next action."
- Add "Start your own Handprint."
- Add "Give earned appreciation" when logged in.
- Avoid event-specific or certificate-specific QR variants in V1 so the app does not become crowded with codes.

### Phase 5: Physical World Kit

- User Handprint badge/sticker concepts.
- World Enabler table signs.
- Flyers.
- Stickers.
- Public World Changer profile link previews.

## Recommended V1 Decision

Implement a conservative but polished QR card first:

- QR points to `/h/hp-dan` in local prototype and redirects to the user's public World Changer page.
- Card title: "Scan my Handprint."
- Shows World Changer tier and point total.
- Shows fallback link.
- On public page, QR appears below the hero or beside share controls.
- In the Wave tab, users can preview the QR card. Export is not a V1 priority.

Do not start by trying to make the entire Handprint line art encode QR data. That can be explored later, but V1 should prioritize scan reliability.

## Founder Decisions

- QR Code is the correct term and technical direction.
- V1 should be conservative and reliable, not experimental.
- Add a design note to revisit a Handprint-shaped QR after scan reliability is proven.
- Use only one QR code per user in V1. It leads to the public World Changer page.
- Do not add QR codes to every badge, certificate, or achievement detail page.
