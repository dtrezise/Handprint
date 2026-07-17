export type FocusReturnTarget = { focus: () => void };

export function restoreDialogFocus(target: FocusReturnTarget | null) {
  target?.focus();
}
