/** Eastern Time (New York) — handles EST/EDT via IANA zone. */
export const NY_TIMEZONE = 'America/New_York';

function readNyWallTime(ms: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: NY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? NaN);
  return {
    y: get('year'),
    mo: get('month'),
    d: get('day'),
    h: get('hour'),
    mi: get('minute'),
    s: get('second'),
  };
}

/**
 * Parses `YYYY-MM-DDTHH:mm` from `<input type="datetime-local">` as **wall clock**
 * in America/New_York (not the server's local zone).
 */
export function parseDateTimeLocalAsEastern(input: string): Date {
  const trimmed = input.trim();
  const m = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) {
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) {
      throw new RangeError(`Invalid date: ${input}`);
    }
    return d;
  }

  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const h = +m[4];
  const mi = +m[5];
  const s = m[6] ? +m[6] : 0;

  const start = Date.UTC(y, mo - 1, d) - 48 * 60 * 60 * 1000;
  const end = Date.UTC(y, mo - 1, d) + 48 * 60 * 60 * 1000;

  // Minute scan (datetime-local resolution); avoids DST non‑monotonicity issues with binary search.
  for (let t = start; t <= end; t += 60 * 1000) {
    const p = readNyWallTime(t);
    if (p.y === y && p.mo === mo && p.d === d && p.h === h && p.mi === mi && p.s === s) {
      return new Date(t);
    }
  }

  throw new RangeError(
    `No valid Eastern Time instant for ${trimmed} (possible DST gap)`
  );
}

/** Value for `<input type="datetime-local">` — components in Eastern Time. */
export function formatDateForDatetimeLocalEastern(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const g = (ty: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === ty)?.value ?? '';
  return `${g('year')}-${g('month')}-${g('day')}T${g('hour')}:${g('minute')}`;
}

export function formatNyDateLong(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    timeZone: NY_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatNyTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    timeZone: NY_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  });
}

export function formatNyDateTimeTable(date: Date | string): string {
  // Avoid `dateStyle`/`timeStyle` with `timeZoneName` — some runtimes throw "Invalid option".
  return new Date(date).toLocaleString('en-US', {
    timeZone: NY_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}
