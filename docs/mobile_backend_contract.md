# Mobile Backend Contract

This is the first contract between the iPhone app and the Handprint backend. The native app uses local pilot data unless `HANDPRINT_API_BASE_URL` is set in `Info.plist`. When configured, it can sync pilot data, profile settings, organizations, impact receipts, social review, and saved Shake connections.

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
    "launchCommunity": "Martinsburg, WV",
    "radiusMiles": 50,
    "interests": ["Food support", "Mutual aid"],
    "skills": ["Writing", "Logistics"],
    "availability": ["Weeknight", "Saturday morning"],
    "engagementLevel": "Helper",
    "rewardsEnabled": true
  },
  "actions": [],
  "marks": [],
  "rsvps": {
    "tenant-rights-clinic": "checkedIn"
  },
  "selectedActionId": "food-shelf-saturday",
  "isOnboarded": false,
  "authState": "appleReady",
  "locationPermission": "notRequested",
  "followedWorldChangers": []
}
```

## Enum Values

`EventStatus`: `approved`, `pending`, `escalated`, `rejected`

`RsvpStatus`: `saved`, `going`, `checkedIn`, `confirmed`

`AuthState`: `signedOut`, `appleReady`, `signedIn`

`LocationPermissionState`: `notRequested`, `approximateAllowed`, `denied`

`EventListingType`: `action`, `awareness`, `sponsored`, `training`, `fundraiser`

## Current Mobile Endpoints

- `GET /api/mobile/pilot`: first mobile session payload.
- `GET /api/mobile/profile`: profile settings, reward visibility, and QR state.
- `POST /api/mobile/profile`: persist default location, reach, reward visibility, and profile settings.
- `GET /api/mobile/profile/{handle}`
- `GET /api/mobile/organizations`
- `GET /api/mobile/organizations/{organizerId}`
- `GET /api/mobile/impact-receipts`
- `GET /api/mobile/impact-receipts/{receiptId}`
- `GET /api/mobile/world-changers`: Shake-network World Changer profiles and saved state.
- `POST /api/mobile/world-changers`: follow/unfollow a World Changer.
- `POST /api/mobile/rsvp`
- `POST /api/mobile/checkin`
- `POST /api/mobile/report`
- `POST /api/mobile/organizer-submit`
- `POST /api/mobile/review`
- `GET /api/mobile/social`
- `POST /api/mobile/social`

## Profile Settings Patch

`POST /api/mobile/profile`

```json
{
  "profile": {
    "launchCommunity": "Martinsburg, WV",
    "radiusMiles": 100,
    "rewardsEnabled": false
  }
}
```

## World Changer Follow Patch

`POST /api/mobile/world-changers`

```json
{
  "handle": "maya-rivera",
  "savedByViewer": false
}
```

## Next Backend Work

1. Replace local SQLite pilot persistence with production database tables when ready.
2. Add Sign in with Apple identity mapping.
3. Add public profile endpoint backed by real profile privacy settings.
4. Add universal link association once the public domain is active.
5. Add server-side audit logs for report and review decisions.
6. Add authenticated organizer/admin authorization.
7. Add mobile endpoints for badge detail and certificate detail.
8. Add mobile endpoints for Reach Rewards eligibility and claims.
