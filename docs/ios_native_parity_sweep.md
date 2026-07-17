# iPhone Native Parity Sweep

Last updated: July 10, 2026

This document tracks the mobile-first polish pass that brings the iPhone app closer to the website's dark Handprint experience.

## Implemented In This Sweep

- Dark native theme aligned with the website palette.
- Shared dark cards, fields, pills, metrics, info rows, and screen backgrounds.
- Discover search requires explicit Search before results refresh.
- Discover uses default profile location and reach after Clear.
- Native location and World Enabler/event fields use dark styled inputs.
- Active Discover profile row shows rewards, interests, and skills.
- Follow buttons on event cards save World Enablers into Handshake.
- Handshake shows saved World Enablers and suggested World Enablers.
- Handshake supports network search and filter states.
- Profile settings include default location, reach, and rewards toggle.
- Profile settings now route into native Account, Avatar, Location, Privacy, Notifications, Rewards, Interests, and Skills panels.
- The iPhone app uses a custom six-item Handprint tab bar instead of hiding pages behind iOS More.
- The native location panel shares the same known-city catalog used by Discover suggestions and GPS nearest-city matching.
- Interests can be selected from approved Handprint categories.
- Skills can be selected from an approved catalog.
- Locked/vetted skills explain their unlock path and cannot be selected.
- Local persistence now includes organizer profiles, receipts, rewards, and credentials.
- World Enabler tab now uses dark cards instead of a default iOS Form.
- World Enabler portal preview shows credibility, review queue, receipts, and confirmation concepts.
- World Enabler submission form uses styled dark inputs.
- Do Something rubric appears in the native World Enabler flow.
- Wave share preview uses dark Handprint styling.
- QR reliability remains white-backed for scan contrast.

## iPhone QA Checklist

1. Launch on the narrowest supported iPhone simulator.
2. Confirm onboarding text fits without truncation.
3. Complete onboarding and verify Discover starts empty until Search.
4. Search in Discover and confirm results do not live-refresh before Search.
5. Use Clear and confirm defaults restore from Profile settings.
6. Follow a World Enabler from an event card.
7. Open Handshake and confirm the followed World Enabler appears.
8. Search Handshake and confirm saved plus suggested sections behave correctly.
9. Open Handprint and select/deselect interests.
10. Open Handprint and select/deselect entry skills.
11. Confirm locked skills stay unselectable and readable.
12. Open Account settings, update display name/handle, and confirm the profile summary changes.
13. Open badge, reward, credential, and receipt detail sheets.
14. Open Wave and confirm QR remains high-contrast.
15. Preview Facebook, Instagram, LinkedIn, TikTok, and Messages share formats.
16. Use the Affirmation Agent rewrite flow.
17. Open World Enabler and confirm lock/unlock state is clear.
18. Fill World Enabler submission fields and confirm disabled/enabled submit behavior.
19. Confirm all tabs remain dark and visually consistent.
20. Capture screenshots for Discover, Handprint, Wave, Handshake, Organize, and Review.

## Remaining Native Polish Targets

- Add automated screenshot capture as a repeatable test command.
- Add accessibility contrast checks for all muted text.
- Add Dynamic Type audits for large text sizes.
- Replace prototype avatar symbols with uploadable photos and earned avatar skins.
- Add backend-backed badge and reward detail fetches.
- Add training credential upload and verification actions.
- Add full comment/message history screens.
- Add report, block, and mute controls beyond the current prototype surfaces.
