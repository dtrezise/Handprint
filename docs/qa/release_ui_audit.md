# Release UI Audit

## Automated Coverage

- Web type checking, backend tests, and production build.
- iPhone onboarding, Reach search, RSVP, Clear, tab navigation, profile settings, and Wave disclosures.
- Accessibility text, Reduce Motion, Increase Contrast, landscape, long content, empty accounts, and large result sets.
- iPad core tab and Wave disclosure routes.

## Responsive Review

- Portrait phone: primary navigation and actions remain reachable.
- Landscape phone: Reach and Wave remain usable without hiding the tab bar.
- iPad: the phone-first layout expands safely; no iPad redesign is implied by this audit.
- Long content: names and event titles wrap without covering actions.
- Empty content: Reach, Print, Wave, and Shake retain useful next actions.
- Large content: result lists remain scrollable and the persistent navigation stays responsive.

## Interaction Review

- Web dialogs lock background scrolling, close with Escape, and return focus to their opener.
- Wave conversation and public Handprint content use progressive disclosure.
- Search feedback uses a 400 ms response window on web and iPhone.
- Motion-heavy feedback is disabled when Reduce Motion is enabled.
- Card boundaries strengthen when Increase Contrast is enabled.

## Copy Review

- Main navigation uses Reach, Print, Wave, and Shake.
- User-facing organization language uses World Enabler or Enabler.
- Organizer remains an internal data and permission term where changing it would break contracts.
- Follow and Following remain action states inside the Shake network, not navigation labels.
