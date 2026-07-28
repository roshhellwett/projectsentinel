import { describe, expect, it } from "vitest";
import { canSubmitChatMessage } from "../chatUtils";

describe("canSubmitChatMessage", () => {
  it("rejects empty or whitespace-only input", () => {
    expect(canSubmitChatMessage("   ", false)).toBe(false);
    expect(canSubmitChatMessage("", false)).toBe(false);
  });

  it("accepts non-empty text when not busy", () => {
    expect(canSubmitChatMessage("hello", false)).toBe(true);
  });

  it("rejects sends while the chat is busy", () => {
    expect(canSubmitChatMessage("hello", true)).toBe(false);
  });
});
