# iOS TestFlight Readiness

Handprint can wait on a paid Apple Developer Program account until we are ready for TestFlight or App Store distribution. Simulator development, local builds, and most product iteration can continue now.

## Current Native Readiness

- Xcode project exists at `ios/Handprint/Handprint.xcodeproj`.
- App builds for iPhone Simulator.
- App installs and launches on iPhone 17 Simulator.
- App icon assets exist.
- URL scheme exists: `handprint://u/{handle}`.
- Location usage copy exists in `Info.plist`.
- Native tests are wired into the `Handprint` scheme.

## Before TestFlight

1. Enroll or confirm Apple Developer Program membership.
2. Choose the final Apple team owner.
3. Confirm final bundle identifier, likely `app.handprint.ios` or `com.handprint.app`.
4. Set signing team in Xcode.
5. Add App Store Connect app record.
6. Prepare beta privacy answers.
7. Add privacy policy URL.
8. Decide beta tester cohorts.
9. Archive from Xcode.
10. Upload to App Store Connect.
11. Run internal TestFlight.
12. Then invite external testers.

## Privacy Notes For V1

The pilot should collect only:

- account identity
- approximate launch community
- selected interests
- selected skills
- RSVP/check-in activity
- organizer submission fields

The pilot should not collect:

- political party affiliation
- demographic targeting data
- contact graph imports
- precise location history
- payment data
- identity documents unless legal review requires them

## App Review Watchouts

- Be careful with claims about verified impact.
- Keep political/campaign activity out of the first public pilot.
- Be explicit that legal, medical, and financial events are informational or support-oriented only.
- Add a way to report unsafe or misleading events before broad beta.
