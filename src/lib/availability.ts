export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type AvailabilityInterval = {
  start: string;
  end: string;
};

export type AvailabilityDay = {
  enabled: boolean;
  intervals: AvailabilityInterval[];
};

export type AvailabilityConfigV1 = {
  version: 1;
  step_minutes: number;
  days: Record<DayKey, AvailabilityDay>;
};

export const DEFAULT_AVAILABILITY: AvailabilityConfigV1 = {
  version: 1,
  step_minutes: 30,
  days: {
    sun: { enabled: false, intervals: [{ start: "09:00", end: "18:00" }] },
    mon: { enabled: true, intervals: [{ start: "09:00", end: "18:00" }] },
    tue: { enabled: true, intervals: [{ start: "09:00", end: "18:00" }] },
    wed: { enabled: true, intervals: [{ start: "09:00", end: "18:00" }] },
    thu: { enabled: true, intervals: [{ start: "09:00", end: "18:00" }] },
    fri: { enabled: true, intervals: [{ start: "09:00", end: "18:00" }] },
    sat: { enabled: false, intervals: [{ start: "09:00", end: "18:00" }] },
  },
};

export const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const dayKeyFromDate = (date: Date): DayKey => DAY_KEYS[date.getDay()]!;

export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map((n) => Number(n));
  return h * 60 + m;
};

export const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const normalizeAvailability = (
  input: unknown,
): AvailabilityConfigV1 => {
  if (!input || typeof input !== "object") return DEFAULT_AVAILABILITY;
  const candidate = input as Partial<AvailabilityConfigV1>;
  if (candidate.version !== 1 || !candidate.days) return DEFAULT_AVAILABILITY;

  const days: AvailabilityConfigV1["days"] = {
    ...DEFAULT_AVAILABILITY.days,
  };

  for (const key of DAY_KEYS) {
    const d = (candidate.days as any)?.[key] as Partial<AvailabilityDay> | undefined;
    if (!d) continue;
    const enabled = typeof d.enabled === "boolean" ? d.enabled : days[key].enabled;
    const intervalsRaw = Array.isArray(d.intervals) ? d.intervals : days[key].intervals;
    const intervals = intervalsRaw
      .map((it: any) => ({ start: String(it?.start || ""), end: String(it?.end || "") }))
      .filter((it) => /^\d{2}:\d{2}$/.test(it.start) && /^\d{2}:\d{2}$/.test(it.end))
      .filter((it) => timeToMinutes(it.end) > timeToMinutes(it.start));

    days[key] = {
      enabled,
      intervals: intervals.length ? intervals : days[key].intervals,
    };
  }

  const step_minutes =
    typeof candidate.step_minutes === "number" && candidate.step_minutes > 0
      ? Math.round(candidate.step_minutes)
      : DEFAULT_AVAILABILITY.step_minutes;

  return {
    version: 1,
    step_minutes,
    days,
  };
};

export const buildSlotStartsForDate = (
  availability: AvailabilityConfigV1,
  date: Date,
  serviceDurationMinutes: number,
) => {
  const day = availability.days[dayKeyFromDate(date)];
  if (!day.enabled) return [] as string[];

  const step = availability.step_minutes;
  const slots: number[] = [];

  for (const interval of day.intervals) {
    const start = timeToMinutes(interval.start);
    const end = timeToMinutes(interval.end);
    const lastStart = end - serviceDurationMinutes;
    for (let t = start; t <= lastStart; t += step) slots.push(t);
  }

  const uniqueSorted = Array.from(new Set(slots)).sort((a, b) => a - b);
  return uniqueSorted.map(minutesToTime);
};

export const isTimeWithinAvailability = (
  availability: AvailabilityConfigV1,
  date: Date,
  startTime: string,
  serviceDurationMinutes: number,
) => {
  const start = timeToMinutes(startTime);
  const end = start + serviceDurationMinutes;
  const day = availability.days[dayKeyFromDate(date)];
  if (!day.enabled) return false;
  return day.intervals.some((it) => {
    const a = timeToMinutes(it.start);
    const b = timeToMinutes(it.end);
    return start >= a && end <= b;
  });
};

