export const STORAGE_CITY = 'storage_city';
export const STORAGE_CITY_ID = 'storage_city_id';
export const STORAGE_HOUR = 'storage_hour';
export const API_KEY = '8dbd93011c9639f3899f8bcdb229f5e9';
export const STORAGE_CURTIME = 'storage_curtime';
export const STORAGE_DAY = "storage_day";
type Bucket = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder';
export const ICON_FILE: Record<Bucket, string | { day: string; night: string }> = {
    clear: { day: 'clear-day', night: 'clear-night' },
    partly: { day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
    cloudy: 'cloudy',
    fog: 'fog',
    rain: 'rain',
    snow: 'snow',
    thunder: 'thunderstorms',
  };
export const WMO_BUCKET_MAP: Bucket[] = [
  // 0..9
  'clear', 'partly', 'partly', 'cloudy', 'fog', 'fog', 'fog', 'fog', 'fog', 'fog',
  // 10..19
  'fog', 'fog', 'fog', 'thunder', 'rain', 'rain', 'snow', 'rain', 'cloudy', 'thunder',
  // 20..29
  'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'snow', 'rain', 'rain', 'thunder',
  // 30..39
  'fog', 'fog', 'fog', 'fog', 'fog', 'fog', 'snow', 'snow', 'snow', 'snow',
  // 40..49
  'thunder', 'thunder', 'thunder', 'thunder', 'thunder', 'fog', 'fog', 'fog', 'fog', 'fog',
  // 50..59
  'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'rain',
  // 60..69
  'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'rain', 'snow', 'rain',
  // 70..79
  'snow', 'snow', 'snow', 'snow', 'snow', 'snow', 'snow', 'snow', 'snow', 'snow',
  // 80..89
  'rain', 'rain', 'rain', 'snow', 'snow', 'snow', 'snow', 'rain', 'rain', 'rain',
  // 90..99
  'thunder', 'thunder', 'thunder', 'thunder', 'thunder', 'thunder', 'thunder', 'thunder', 'thunder', 'thunder',
];

