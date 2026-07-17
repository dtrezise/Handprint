# Handprint UI Regression Baselines

These captures are review references for UI cleanup, not pixel-perfect golden tests. Compare structure, clipping, overlap, text fit, safe-area behavior, and visual hierarchy before accepting layout changes.

## Baseline Matrix

- `ios-reach-iphone17pro.png`: iPhone portrait Reach shell and primary controls.
- `ios-wave-iphone17pro.png`: iPhone portrait Wave identity and sharing flow.
- `ios-wave-ipad-a16.png`: iPad Wave layout audit without an iPad-specific redesign.

The automated iPhone UI suite also covers landscape, accessibility text, Reduce Motion, Increase Contrast, long names and titles, an empty account, and a 120-action result set.

## Refresh Rules

1. Refresh a baseline only after the corresponding behavior tests pass.
2. Keep the same simulator model, color scheme, launch state, and orientation.
3. Review changes side by side. Do not approve a new image solely because the test suite passes.
4. Record intentional hierarchy or spacing changes in the pull request summary.

## Web Matrix

The web release audit targets 1440 x 900 desktop, 1024 x 768 tablet, 390 x 844 mobile portrait, and 844 x 390 mobile landscape. Browser captures should be refreshed from the in-app browser when its localhost navigation session is available.
