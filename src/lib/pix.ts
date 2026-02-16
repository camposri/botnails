type PixPayloadInput = {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number | string;
  txid?: string;
  description?: string;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const tlv = (id: string, value: string) => `${id}${pad2(value.length)}${value}`;

const formatAmount = (amount: number | string) => {
  if (typeof amount === "number") return amount.toFixed(2);
  const normalized = amount.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error("Valor inválido para Pix");
  }
  return parsed.toFixed(2);
};

export const crc16ccitt = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

export const buildPixCopyPastePayload = ({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txid = "***",
  description,
}: PixPayloadInput) => {
  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", pixKey);
  const desc = description ? tlv("02", description) : "";
  const merchantAccountInfo = tlv("26", `${gui}${key}${desc}`);

  const payloadFormatIndicator = tlv("00", "01");
  const merchantCategoryCode = tlv("52", "0000");
  const transactionCurrency = tlv("53", "986");
  const transactionAmount = amount == null ? "" : tlv("54", formatAmount(amount));
  const countryCode = tlv("58", "BR");
  const mName = tlv("59", merchantName);
  const mCity = tlv("60", merchantCity);
  const additionalDataField = tlv("62", tlv("05", txid));

  const base = `${payloadFormatIndicator}${merchantAccountInfo}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${mName}${mCity}${additionalDataField}`;
  const withCrcPlaceholder = `${base}6304`;
  const crc = crc16ccitt(withCrcPlaceholder);
  return `${withCrcPlaceholder}${crc}`;
};
