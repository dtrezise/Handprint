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

1. Replace this read-only pilot endpoint with Supabase-backed queries.
2. Add Sign in with Apple identity mapping.
3. Add RSVP mutation endpoint.
4. Add check-in mutation endpoint.
5. Add organizer submission endpoint.
6. Add review decision endpoint.
7. Add public profile endpoint for `/u/{handle}`.
8. Add universal link association for `handprint.app`.
