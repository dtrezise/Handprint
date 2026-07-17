import assert from "node:assert/strict";
import test from "node:test";
import { restoreDialogFocus } from "../lib/focus-return";

test("dialog cleanup returns focus to the control that opened it", () => {
  let focusCount = 0;

  restoreDialogFocus({ focus: () => { focusCount += 1; } });

  assert.equal(focusCount, 1);
});

test("dialog focus return tolerates a missing opener", () => {
  assert.doesNotThrow(() => restoreDialogFocus(null));
});
