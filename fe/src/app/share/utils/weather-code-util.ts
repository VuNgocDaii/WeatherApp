import { WMO_WW_EN } from "../constants/constans";
import { WMO_ICON_MAP } from "../constants/constans";
export function weatherDescFromCode(code: number | null | undefined) {
    if (code == null) return "";
    return WMO_WW_EN[code] ?? "Unknown weather code";
  }


 export function getWmoIcon(code: number, isDay: boolean): string {
    const def = WMO_ICON_MAP[code] ?? 'not-available';
    return typeof def === 'string' ? def : (isDay ? def.day : def.night);
  }