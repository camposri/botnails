import { describe, expect, it } from "vitest";
import { crc16ccitt, buildPixCopyPastePayload } from "@/lib/pix";

describe("pix payload", () => {
  it("computes CRC16-CCITT for known sample", () => {
    const sampleWithoutCrc =
      "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304";
    expect(crc16ccitt(sampleWithoutCrc)).toBe("1D3D");
  });

  it("builds payload with trailing CRC", () => {
    const payload = buildPixCopyPastePayload({
      pixKey: "27178920874",
      merchantName: "BOTNAILS",
      merchantCity: "BRASILIA",
      amount: 49,
      txid: "BOTNAILS",
    });

    expect(payload.endsWith("6304" + payload.slice(-4))).toBe(true);
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });
});
