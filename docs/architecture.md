# Technical Architecture

## Recommended Stack

- Frontend: Next.js with App Router
- Styling: Tailwind CSS
- Data: Supabase Postgres with PostGIS when geospatial search becomes real
- Auth: Supabase Auth
- Storage: Supabase Storage for organizer/event media
- Hosting: Vercel for early web app

The current repository includes a local prototype using in-memory mock data. The structure is designed so the mock data can be replaced by Supabase queries without rethinking the product model.

## Core Domain Model

### UserProfile

- `id`
- `name`
- `home_area`
- `radius_miles`
- `interests`
- `skills`
- `availability`
- `engagement_level`
- `created_at`

### Organizer

- `id`
- `name`
- `type`
- `verification_status`
- `trust_tier`
- `contact_email`
- `website`
- `created_at`

### Event

- `id`
- `organizer_id`
- `title`
- `summary`
- `category`
- `skills`
- `starts_at`
- `ends_at`
- `location_name`
- `neighborhood`
- `latitude`
- `longitude`
- `status`
- `review_notes`
- `created_at`

### Recommendation

- `user_id`
- `event_id`
- `score`
- `reasons`
- `created_at`

### RSVP

- `id`
- `user_id`
- `event_id`
- `status`
- `created_at`

Statuses:

- `interested`
- `going`
- `cancelled`
- `attended`
- `organizer_confirmed`

### HandprintMark

- `id`
- `user_id`
- `event_id`
- `mark_type`
- `category`
- `weight`
- `created_at`

Mark types:

- `saved`
- `rsvp`
- `check_in`
- `confirmed_participation`
- `repeat_contribution`

## Recommendation V1

Start with application-level weighted scoring:

- Location fit
- Interest fit
- Availability fit
- Skill fit
- Organizer trust
- Event freshness
- Exploration boost

Each score must produce human-readable match reasons.

## Migration Path

1. Prototype with typed mock data.
2. Add Supabase schema and seed scripts.
3. Replace mock reads with server queries.
4. Add auth.
5. Add organizer/admin dashboards.
6. Add check-in confirmation.
7. Add PostGIS radius matching.
