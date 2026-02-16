import { describe, expect, it } from "vitest";
import { isValidMobileBR, normalizePhoneBR } from "@/lib/phone";

describe("phone", () => {
  it("normalizes BR phones to E.164", () => {
    expect(normalizePhoneBR("(44) 99999-0000")?.e164).toBe("+5544999990000");
    expect(normalizePhoneBR("+55 44 99999-0000")?.e164).toBe("+5544999990000");
  });

  it("validates BR mobile format", () => {
    expect(isValidMobileBR("44999990000")).toBe(true);
    expect(isValidMobileBR("+55 (44) 99999-0000")).toBe(true);
    expect(isValidMobileBR("44333330000")).toBe(false);
    expect(isValidMobileBR("")).toBe(false);
  });
});
