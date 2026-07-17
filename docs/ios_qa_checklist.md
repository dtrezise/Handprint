# iPhone QA Checklist

Status: working draft

Use this checklist when reviewing the native iPhone app in Simulator. The goal is to catch flow, tone, density, and trust issues before deeper backend integration.

## Reach

- App opens without preloading event results before Search.
- Search shows a visible loading state.
- Location autocomplete appears for typed city fragments.
- GPS uses the saved approximate profile location.
- Search stats fit on one line or wrap cleanly.
- Event cards clearly show listing type and reward eligibility.
- Empty states explain which filter likely narrowed results.

## Print

- Profile settings are available from the profile icon and do not occupy the Print dashboard.
- Default location and reach feel editable and understandable.
- Earned rewards active toggle is clear and not noisy.
- Badge grid feels like achievement, not bureaucracy.
- Impact receipts feel affirming and official enough.
- Reach Rewards explain scholarships, Goody Two Shoes, and capacity rewards without implying guaranteed sponsor fulfillment.

## Wave

- QR card is large enough to scan.
- Public URL fallback is readable.
- Wave Kit platform previews are understandable.
- Share text composer feels encouraging.
- Affirmation Agent rewrite feels helpful rather than scolding.
- Share history and draft states are legible.

## Shake

- Shake begins listening automatically while the page is open.
- A gentle physical shake triggers nearby pairing on real devices.
- Only the public Handprint identity is exchanged.
- Search and filters make the resulting network feel discoverable.
- World Enabler cards route to public organization pages.
- World Changer cards open a useful detail view.
- Follow/unfollow behavior feels immediate.
- Recruiting paths are visible and actionable.
- Empty states explain how to build the network.

## World Enabler Mode In Print

- Unlock path explains why hosting is earned.
- Do Something rubric feels clear.
- Listing type picker includes hands-on, awareness, sponsored, training, and fundraiser.
- Awareness and sponsored events are not presented as reward shortcuts.
- Submit-disabled state is understandable.

## Role-Gated Review

- Listing type and reward status are visible.
- Awareness/sponsored warnings are visible but not alarmist.
- Escalate, reject, and approve controls are reachable.
- Report queue language stays neutral.

## Build Checks

- `pnpm typecheck`
- `pnpm test`
- `xcodebuild -project ios/Handprint/Handprint.xcodeproj -scheme Handprint -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17' build`
