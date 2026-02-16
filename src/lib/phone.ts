export type NormalizedPhone = {
  raw: string;
  digits: string;
  e164: string;
};

export const normalizePhoneBR = (raw: string): NormalizedPhone | null => {
  const digits = raw.replace(/\D/g, "");

  if (!digits) return null;

  if (digits.length === 10 || digits.length === 11) {
    return {
      raw,
      digits,
      e164: `+55${digits}`,
    };
  }

  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    const national = digits.slice(2);
    if (national.length === 10 || national.length === 11) {
      return {
        raw,
        digits: national,
        e164: `+${digits}`,
      };
    }
  }

  return null;
};

export const isValidMobileBR = (raw: string) => {
  const normalized = normalizePhoneBR(raw);
  if (!normalized) return false;
  const d = normalized.digits;
  if (d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (!Number.isFinite(ddd) || ddd < 11 || ddd > 99) return false;
  return d[2] === "9";
};

