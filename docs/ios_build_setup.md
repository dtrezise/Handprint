# iPhone Build Setup

This document tracks what is required to turn the native SwiftUI scaffold in `ios/Handprint` into a runnable iPhone app.

## Current Status

Completed:

- Native SwiftUI source scaffold.
- iPhone-first tab structure.
- Mock data matching the web prototype.
- Discover, Handprint, Share, Organize, and Review screens.
- Handprint glyph in SwiftUI Canvas.
- Local RSVP/check-in/mark progression.
- XcodeGen project spec.

Blocked until user/Xcode setup:

- Xcode install.
- iOS Simulator install.
- Apple ID sign-in inside Xcode.
- Apple Developer Program enrollment.
- Device signing and TestFlight upload.

## Required User Actions

1. Install Xcode 26 or later from Apple.
2. Open Xcode once and let it install platform/simulator components.
3. Sign in to Xcode with your Apple ID.
4. Enroll in the Apple Developer Program when ready for TestFlight/App Store.
5. Decide final bundle identifier. Current placeholder is `com.handprint.app`.
6. Decide whether the developer account is individual or organization-owned.

## After Xcode Is Installed

Run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
xcodebuild -version
xcrun simctl list devices available
```

Install XcodeGen:

```bash
brew install xcodegen
cd /Users/dan/Documents/GitHub/Handprint/ios/Handprint
xcodegen generate
open Handprint.xcodeproj
```

In Xcode:

- Select the `Handprint` target.
- Set Team under Signing & Capabilities.
- Confirm bundle identifier.
- Select an iPhone simulator.
- Run.

## 12 Native iPhone Next Steps

1. Install and activate Xcode 26+.
2. Generate `Handprint.xcodeproj` from `project.yml`.
3. Run the app on an iPhone simulator.
4. Run the app on a physical iPhone.
5. Replace placeholder app icon JSON with real icon assets.
6. Tune the Handprint glyph for iPhone screen sizes.
7. Add event detail screens and deep links.
8. Add native universal-link handling for public Handprint URLs.
9. Add local persistence for profile, RSVPs, and marks.
10. Add Supabase networking behind the current mock store.
11. Add push notification permission flow for joined actions.
12. Prepare TestFlight metadata, privacy nutrition labels, and beta tester groups.

## Native Product Principle

The iPhone app should not feel like the website squeezed into a phone. It should feel like a personal civic wallet:

- Fast to open.
- Proud to share.
- Clear about trust.
- Useful within one thumb.
- Built around the handprint as an identity object.
