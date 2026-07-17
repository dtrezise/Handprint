# iPhone Interaction Audit

Last updated: July 10, 2026

This audit tracks the pass to remove dead-end controls from the iPhone prototype.

## Fixed In This Pass

- Added a keyboard toolbar with a manual dismiss icon across native screens and sheets.
- Enabled interactive keyboard dismissal while scrolling.
- Replaced the Sign in with Apple shell with a working prototype account button.
- Converted onboarding and Handshake text fields to the dark Handprint field style.
- Made GPS request real approximate location permission, map coordinates to the nearest known city, and fall back to reverse-geocoding when needed.
- Promoted the known-city catalog into shared native app data so onboarding, Discover, settings, and tests use the same nearest-city behavior.
- Replaced the default iOS tab behavior with a custom six-tab Handprint navigation bar.
- Added native profile settings routes for Account, Avatar, Location, Privacy, Notifications, Rewards, Interests, and Skills.
- Added visible status feedback for Review approve, reject, and escalate actions.
- Made training credentials tappable with working local upload and verification state transitions.
- Added local persistence for credential state alongside existing profile, action, reward, and network state.
- Cleaned user-facing placeholder language in reward and QR labels.

## Control Coverage

- Onboarding: Back, Next, prototype account, approximate location, skip, interest toggles, skill text field, engagement picker, and reach stepper are functional.
- Discover: organization/event search, location field, city suggestions, cause/distance/rewards/type pickers, GPS, Search, Clear, Details, Follow, RSVP, Check in, Share, Report, and report reason picker are functional.
- Handprint: account editing, avatar prototype choices, profile location, GPS nearest-city lookup, reach slider, privacy toggles, notification toggles, rewards toggle, Interest Select/Clear, Skill Select/Clear, badge sheets, reward sheets, receipt sheets, and credential sheets are functional.
- Wave: QR copy, platform picker, template picker, preview, share link, server review fallback, save draft fallback, local share history, rewrite, and comment queue are functional.
- Handshake: search, segmented filter, saved/suggested World Enabler cards, follow/unfollow, World Changer sheets, and organization/receipt navigation are functional.
- Organize: unlock state, all submission fields, category/listing pickers, capacity stepper, attestation toggle, submit, and rubric are functional.
- Review: report list, approve, reject, and escalate are functional and now show feedback.

## Intentionally Gated States

- Locked skills are disabled until earned or vetted.
- Event RSVP/check-in is disabled on non-joinable events.
- World Enabler submission is disabled until the user has enough credibility and required fields are complete.
- Clear buttons are disabled when there is nothing to clear.

## Remaining Product/Account Decisions

- DAN NEEDED Real Sign in with Apple requires Apple developer configuration, entitlements, and account/session policy.
- DAN NEEDED Real credential document upload requires deciding storage, privacy rules, and verifier workflow.
- DAN NEEDED Real device GPS behavior should be reviewed on a physical iPhone before public pilot.
