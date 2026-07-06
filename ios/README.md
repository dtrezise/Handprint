# Handprint iOS

This folder contains the native iPhone-first Handprint app.

The app is built as a SwiftUI application with mock local data first, then intended to connect to the shared Handprint backend once the native product loop feels right.

## Current Toolchain Status

Verified on this Mac:

- Xcode 26.3 is installed and active.
- The `Handprint.xcodeproj` builds for iPhone Simulator.
- The app installs and launches on the iPhone 17 simulator.
- Native unit tests are wired through the `Handprint` scheme.
- XcodeGen is not currently installed, so the checked-in `.xcodeproj` is the source of truth until we install it or regenerate intentionally.

## Generate The Xcode Project

If XcodeGen is installed later:

```bash
brew install xcodegen
cd ios/Handprint
xcodegen generate
open Handprint.xcodeproj
```

If Xcode asks to install simulator components, accept.

## App Target

- Product: Handprint
- Bundle ID placeholder: `com.handprint.app`
- Deployment target: iOS 18.0
- Primary device: iPhone
- Framework: SwiftUI
- URL scheme: `handprint://u/{handle}`
- Backend key: `HANDPRINT_API_BASE_URL` in `Info.plist`

## First Native Product Loop

1. Discover useful local action.
2. Understand why each action matches.
3. RSVP.
4. Check in.
5. Watch the Handprint grow.
6. Share the public Handprint profile.

## Apple Account Items The User Must Do

- Sign in to Xcode with Apple ID.
- Enroll in Apple Developer Program when ready for TestFlight/App Store.
- Choose final bundle identifier and team.

## Local Verification

```bash
xcodebuild -project ios/Handprint/Handprint.xcodeproj \
  -scheme Handprint \
  -destination 'id=825A4969-E9D4-466D-AF1F-8DF00CCE27C1' \
  -configuration Debug \
  CODE_SIGNING_ALLOWED=NO build

xcodebuild test -project ios/Handprint/Handprint.xcodeproj \
  -scheme Handprint \
  -destination 'id=825A4969-E9D4-466D-AF1F-8DF00CCE27C1' \
  CODE_SIGNING_ALLOWED=NO
```
