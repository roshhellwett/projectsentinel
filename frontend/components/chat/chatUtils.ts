export function canSubmitChatMessage(value: string, busy: boolean) {
  return !busy && value.trim().length > 0;
}
