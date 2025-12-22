export const STORAGE_CITY = 'storage_city';
export const STORAGE_CITY_ID = 'storage_city_id';
export const STORAGE_HOUR = 'storage_hour';
export const API_KEY = '8dbd93011c9639f3899f8bcdb229f5e9';
export const STORAGE_CURTIME = 'storage_curtime';
export const STORAGE_DAY = "storage_day";
export type IconDef = string | { day: string; night: string };
const dn = (day: string, night: string) => ({ day, night } as const);
export const WMO_ICON_MAP: Record<number, IconDef> = (() => {
  const m: Record<number, IconDef> = {};
  const setRange = (from: number, to: number, icon: IconDef) => {
    for (let i = from; i <= to; i++) m[i] = icon;
  };
  const setList = (codes: number[], icon: IconDef) => {
    for (const c of codes) m[c] = icon;
  };

  m[0] = dn('clear-day', 'clear-night');
  setList([1, 2], dn('partly-cloudy-day', 'partly-cloudy-night'));
  m[3] = 'cloudy';

  m[4] = 'smoke';
  m[5] = dn('haze-day', 'haze-night');
  m[6] = dn('dust-day', 'dust-night');
  setList([7, 8, 9], 'dust-wind');

  m[10] = 'mist';
  setList([11, 12], dn('fog-day', 'fog-night'));
  m[13] = 'lightning';
  setList([14, 15, 16], dn('partly-cloudy-day-rain', 'partly-cloudy-night-rain'));
  m[17] = dn('thunderstorms-day', 'thunderstorms-night');
  m[18] = 'wind';
  m[19] = 'tornado';

  m[20] = 'drizzle';
  m[21] = 'rain';
  m[22] = 'snow';
  m[23] = 'sleet';
  m[24] = 'sleet';
  m[25] = 'rain';
  m[26] = 'snow';
  m[27] = 'hail';
  m[28] = dn('fog-day', 'fog-night');
  m[29] = dn('thunderstorms-day', 'thunderstorms-night');
  setRange(30, 35, 'dust-wind');
  setRange(36, 39, 'wind-snow');
  setRange(40, 49, dn('fog-day', 'fog-night'));
  setRange(50, 55, 'drizzle');
  setList([56, 57], 'sleet');
  setList([58, 59], 'rain');
  setRange(60, 65, 'rain');
  setList([66, 67], 'sleet');
  setList([68, 69], 'sleet');

  setRange(70, 75, 'snow');
  m[76] = 'snowflake';
  m[77] = 'snow';
  m[78] = 'snowflake';
  m[79] = 'sleet';

  m[80] = 'rain';
  m[81] = 'overcast-rain';
  m[82] = 'extreme-rain';
  setList([83, 84], 'sleet');
  setList([85, 86], 'snow');
  setList([87, 88, 89, 90], 'hail');
  setList([91, 92], dn('thunderstorms-day-rain', 'thunderstorms-night-rain'));
  setList([93, 94], dn('thunderstorms-day-snow', 'thunderstorms-night-snow'));
  setList([95, 96, 97, 99], dn('thunderstorms-day-rain', 'thunderstorms-night-rain'));
  m[98] = dn('thunderstorms-day', 'thunderstorms-night');

  return m;
})();

export const WMO_WW_EN: Record<number, string> = {
  0: "Cloud development not observed / not available",
  1: "Clouds dissolving or becoming less developed",
  2: "Sky state overall unchanged",
  3: "Clouds forming or developing",

  4: "Visibility reduced by smoke (fires/industrial/volcanic ash)",
  5: "Haze",
  6: "Widespread dust in suspension (not raised by wind at station)",
  7: "Dust/sand raised by wind at/near station (no dust whirls; no storm)",
  8: "Dust/sand whirls seen at/near station (no duststorm/sandstorm)",
  9: "Duststorm or sandstorm in sight (or occurred at station in past hour)",

  10: "Mist",
  11: "Shallow fog/ice fog in patches at station",
  12: "Shallow fog/ice fog more or less continuous at station",
  13: "Lightning visible (no thunder heard)",
  14: "Precipitation visible but not reaching the ground/sea (virga)",
  15: "Precipitation visible, reaching ground/sea, distant (>5 km)",
  16: "Precipitation visible, reaching ground/sea, nearby (not at station)",
  17: "Thunderstorm (no precipitation at time of observation)",
  18: "Squalls at/within sight of station",
  19: "Funnel cloud (tornado/waterspout) at/within sight of station",

  // 20–29: happened during the preceding hour, not at observation time
  20: "Drizzle (non-freezing) or snow grains occurred (not showers)",
  21: "Rain (non-freezing) occurred (not showers)",
  22: "Snow occurred (not showers)",
  23: "Rain & snow or ice pellets occurred (not showers)",
  24: "Freezing drizzle or freezing rain occurred (not showers)",
  25: "Rain showers occurred",
  26: "Snow showers or mixed rain/snow showers occurred",
  27: "Hail showers (or rain + hail) occurred",
  28: "Fog or ice fog occurred",
  29: "Thunderstorm occurred (with or without precipitation)",

  // 30–39: dust/sandstorm or blowing/drifting snow
  30: "Light/moderate duststorm or sandstorm decreasing",
  31: "Light/moderate duststorm or sandstorm no change",
  32: "Light/moderate duststorm or sandstorm starting/increasing",
  33: "Severe duststorm or sandstorm decreasing",
  34: "Severe duststorm or sandstorm no change",
  35: "Severe duststorm or sandstorm starting/increasing",
  36: "Light/moderate blowing snow (generally low, below eye level)",
  37: "Heavy drifting/blowing snow (generally low, below eye level)",
  38: "Light/moderate blowing snow (generally high, above eye level)",
  39: "Heavy drifting/blowing snow (generally high, above eye level)",

  // 40–49: fog/ice fog at observation time
  40: "Fog/ice fog at a distance (not at station in preceding hour)",
  41: "Fog/ice fog in patches at station",
  42: "Fog/ice fog thinning (sky visible)",
  43: "Fog/ice fog thinning (sky not visible)",
  44: "Fog/ice fog no change (sky visible)",
  45: "Fog/ice fog no change (sky not visible)",
  46: "Fog/ice fog forming or thickening (sky visible)",
  47: "Fog/ice fog forming or thickening (sky not visible)",
  48: "Rime-depositing fog (sky visible)",
  49: "Rime-depositing fog (sky not visible)",

  // 50–59: drizzle
  50: "Light drizzle, intermittent (non-freezing)",
  51: "Light drizzle, continuous (non-freezing)",
  52: "Moderate drizzle, intermittent (non-freezing)",
  53: "Moderate drizzle, continuous (non-freezing)",
  54: "Heavy drizzle, intermittent (non-freezing)",
  55: "Heavy drizzle, continuous (non-freezing)",
  56: "Light freezing drizzle",
  57: "Moderate/heavy freezing drizzle",
  58: "Light drizzle and rain",
  59: "Moderate/heavy drizzle and rain",

  // 60–69: rain
  60: "Light rain, intermittent (non-freezing)",
  61: "Light rain, continuous (non-freezing)",
  62: "Moderate rain, intermittent (non-freezing)",
  63: "Moderate rain, continuous (non-freezing)",
  64: "Heavy rain, intermittent (non-freezing)",
  65: "Heavy rain, continuous (non-freezing)",
  66: "Light freezing rain",
  67: "Moderate/heavy freezing rain",
  68: "Light rain/drizzle with snow",
  69: "Moderate/heavy rain/drizzle with snow",

  // 70–79: solid precipitation (not showers)
  70: "Light snow, intermittent",
  71: "Light snow, continuous",
  72: "Moderate snow, intermittent",
  73: "Moderate snow, continuous",
  74: "Heavy snow, intermittent",
  75: "Heavy snow, continuous",
  76: "Ice prisms / diamond dust (with or without fog)",
  77: "Snow grains (with or without fog)",
  78: "Isolated star-like snow crystals (with or without fog)",
  79: "Ice pellets (not showers)",

  // 80–99: showers and/or thunderstorm related
  80: "Light rain showers",
  81: "Moderate/heavy rain showers",
  82: "Violent rain showers",
  83: "Light mixed rain & snow showers",
  84: "Moderate/heavy mixed rain & snow showers",
  85: "Light snow showers",
  86: "Moderate/heavy snow showers",
  87: "Light showers of snow pellets / small hail (with/without rain)",
  88: "Moderate/heavy showers of snow pellets / small hail (with/without rain)",
  89: "Light hail showers (no thunder)",
  90: "Moderate/heavy hail showers (no thunder)",

  // 91–94: thunderstorm in preceding hour, not at observation time
  91: "Slight rain now; thunderstorm in preceding hour (not now)",
  92: "Moderate/heavy rain now; thunderstorm in preceding hour (not now)",
  93: "Slight snow/mixed/hail now; thunderstorm in preceding hour (not now)",
  94: "Moderate/heavy snow/mixed/hail now; thunderstorm in preceding hour (not now)",

  // 95–99: thunderstorm at observation time
  95: "Thunderstorm (slight/moderate), no hail; with rain/snow",
  96: "Thunderstorm (slight/moderate) with hail",
  97: "Thunderstorm (heavy), no hail; with rain/snow",
  98: "Thunderstorm with duststorm/sandstorm",
  99: "Thunderstorm (heavy) with hail",
};
