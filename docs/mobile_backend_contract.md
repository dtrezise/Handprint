# Mobile Backend Contract

This is the first contract between the iPhone app and the Handprint backend. The native app already knows how to call `GET /api/mobile/pilot` when `HANDPRINT_API_BASE_URL` is set in `Info.plist`; otherwise it uses local pilot data.

## Endpoint

`GET /api/mobile/pilot`

## Purpose

Return enough data to render the first authenticated mobile session:

- user profile
- local actions
- handprint marks
- RSVP/check-in status
- app readiness flags

## Response Shape

```json
{
  "profile": {
    "name": "Dan",
    "handle": "dan",
    "launchCommunity": "Northside pilot",
    "radiusMiles": 5,
    "interests": ["Food support", "Mutual aid"],
    "skills": ["Writing", "Logistics"],
    "availability": ["Weeknight", "Saturday morning"],
    "engagementLevel": "Helper"
  },
  "actions": [],
  "marks": [],
  "rsvps": {
    "tenant-rights-clinic": "checkedIn"
  },
  "selectedActionId": "food-shelf-saturday",
  "isOnboarded": false,
  "authState": "appleReady",
  "locationPermission": "notRequested"
}
```

## Enum Values

`EventStatus`: `approved`, `pending`, `escalated`, `rejected`

`RsvpStatus`: `saved`, `going`, `checkedIn`, `confirmed`

`AuthState`: `signedOut`, `appleReady`, `signedIn`

`LocationPermissionState`: `notRequested`, `approximateAllowed`, `denied`

## Next Backend Work

Implemented mock endpoints:

- `GET /api/mobile/pilot`
- `GET /api/mobile/profile/{handle}`
- `POST /api/mobile/rsvp`
- `POST /api/mobile/checkin`
- `POST /api/mobile/report`

Remaining backend work:

1. Replace mock endpoints with Supabase-backed queries.
2. `DAN NEEDED` Decide Supabase/backend account owner and billing.
3. Add Sign in with Apple identity mapping after Apple team setup.
4. Add organizer submission endpoint.
5. Add review decision endpoint.
6. Add public profile endpoint backed by real profile privacy settings.
7. `DAN NEEDED` Choose public domain for universal links.
8. Add universal link association for the chosen domain.
