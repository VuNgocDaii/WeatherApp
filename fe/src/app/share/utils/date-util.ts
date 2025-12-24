import { Hour } from "../../model/hour";
import { Day } from "../../model/day";
export function toDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);

    if (typeof value === 'string') {
        if (value.includes('T')) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) return d;
        }

        const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (m) {
            const [, y, mo, da, hh, mi, ss] = m;
            return new Date(+y, +mo - 1, +da, +hh, +mi, +(ss ?? 0));
        }
    }
    return null;
}

export function formatHour(value: any): string {
    const d = toDate(value);
    if (!d) return '--';
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d);
}

export function isDayTime(time: any): boolean {
    const d = toDate(time);
    if (!d) return true;
    const h = d.getHours();
    return h >= 6 && h < 18;
}

export function compareDay(a: string | Date, b: string | Date): boolean {
    const d1 = a instanceof Date ? a : new Date(a);
    const d2 = b instanceof Date ? b : new Date(b);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;

    return d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
        && d1.getDate() === d2.getDate();
}

export type HourDTO = {
    time: string;
    cityId: number;
    temp: number;
    apparentTemp: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    icon: string;
};

export function toDTO(h: Hour): HourDTO {
    const d = toDate((h as any).time) ?? new Date();
    return {
        time: d.toISOString(),
        cityId: (h as any).cityId,
        temp: (h as any).temp,
        apparentTemp: (h as any).apparentTemp,
        weatherCode: (h as any).weatherCode,
        humidity: (h as any).humidity,
        windSpeed: (h as any).windSpeed,
        icon: (h as any).icon,
    };
}

export function fromDTO(dto: any, fallbackIcon: (code: number, isDay: boolean) => string): Hour | null {
    const t = toDate(dto?.time);
    if (!t) return null;

    const code = Number(dto.weatherCode ?? 0);
    const icon = String(dto.icon ?? fallbackIcon(code, isDayTime(t)));

    return new Hour(
        t,
        Number(dto.cityId ?? 0),
        Number(dto.temp ?? 0),
        Number(dto.apparentTemp ?? 0),
        code,
        Number(dto.humidity ?? 0),
        Number(dto.windSpeed ?? 0),
        icon
    );
}
//
export type DayDTO = {
  time: string;
  cityId: number;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  sunrise: Date;
  sunset: Date;
  maxWindSpeed: number;
  icon: string;
};


export function toDayDTO(d: Day): DayDTO {
  return {
    time: d.time.toISOString(),
    cityId: d.cityId,
    weatherCode: d.weatherCode,
    maxTemp: d.maxTemp,
    minTemp: d.minTemp,
    sunrise: d.sunrise,
    sunset: d.sunset,
    maxWindSpeed: d.maxWindSpeed,
    icon: d.icon
  };
}

export function fromDayDTO(x: DayDTO): Day {
  return new Day(
    new Date(x.time),
    x.cityId,
    x.weatherCode,
    x.maxTemp,
    x.minTemp,
    new Date(x.sunrise),
    new Date(x.sunset),
    x.maxWindSpeed,
    x.icon
  );
}

export function normalizeDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
export function dateInt(d: Date): number {
  let y = d.getFullYear();
  let m = d.getMonth() + 1;
  let dd = d.getDate();
  return y * 10000 + m * 100 + dd;
}

export function wmoToKey(code: number): string {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([56, 57, 66, 67].includes(code)) return 'sleet';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if (code === 95) return 'thunder';
  if (code === 96 || code === 99) return 'hail';
  return 'cloudy';
}

