# First Draft Build Notes

## Build Intent

This draft turns Handprint from concept into an evaluable local-pilot app loop.

The product question this version should answer:

> Does it feel useful, trustworthy, and motivating to discover local action and see participation become a visible handprint?

## Implemented Product Loops

### Participant Loop

- Edit launch community, radius, interests, and skills.
- See ranked local action recommendations.
- Understand match reasons.
- RSVP to approved actions.
- Check in after joining.
- See handprint marks update.

### Organizer Loop

- Submit a local action.
- New submissions enter pending review.
- The submitted action appears in the trust queue.

### Trust Loop

- See approved, pending, and escalated actions.
- Approve an action into the joinable feed.
- Escalate sensitive actions.
- Preserve review notes on each action.

## Agentic Review Notes

### Founder/Product Strategist

The draft keeps the first product loop narrow: local discovery, participation, and handprint growth. It avoids payments, public reputation, open social feed, and national scale.

### Civic Trust & Neutrality Architect

The draft blocks RSVP on pending/escalated events and requires review before joinability. Youth-facing and preparedness examples demonstrate why different events need different review pathways.

### Local Engagement UX Designer

The first screen is the working app, not a landing page. Profile controls, recommendations, and handprint feedback are all visible in the primary workflow.

### Sphere Algorithm Designer

Ranking is intentionally explainable. The score uses radius, interest match, skill match, availability, trust tier, status, and capacity pressure.

### Community Operations Lead

The data assumes a Northside pilot with anchor organizers and seeded events. This supports a concierge pilot before marketplace scale.

### Full-Stack/Mobile Engineer

The state model is currently client-side with local storage persistence. It is structured to migrate toward Supabase tables defined in `docs/architecture.md`.

### Data & Impact Systems Agent

Handprint marks distinguish RSVP, check-in, and organizer-confirmed participation. The product should continue to weight verified action above intent.

### Legal/Policy Risk Advisor

Candidate/campaign activity, youth events, medical claims, donations, payments, and demographic targeting remain out of scope until policy review.

## Next Autonomous Build Slice

1. Split the single-page prototype into route-level surfaces.
2. Add Supabase schema and seed data.
3. Add real auth and role-based access.
4. Create organizer/admin persistence.
5. Add event detail URLs and share cards.
6. Add a richer handprint progression model.
7. Add a small smoke-test suite for the core workflow.
