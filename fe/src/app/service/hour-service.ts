import { Injectable } from '@angular/core';
import { Hour } from '../model/hour';

import { WMO_BUCKET_MAP,ICON_FILE,STORAGE_HOUR } from '../share';
@Injectable({
  providedIn: 'root',
})
export class HourService {

getWeatherIconName(code: number, time: any): string {
    // console.log('call ' + code, time);
    const d = this.toDate(time) ?? new Date();
    const safeCode = Number.isFinite(code) ? Math.min(99, Math.max(0, code)) : 0;
    const bucket = WMO_BUCKET_MAP[safeCode] ?? 'cloudy';

    const file = ICON_FILE[bucket];
    if (typeof file === 'string') return file;

    return this.isDayTime(d) ? file.day : file.night;
  }

  isDayTime(time: any): boolean {
    const d = this.toDate(time);
    if (!d) return true;
    const h = d.getHours();
    return h >= 6 && h < 18;
  }

  toDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);

    if (typeof value === 'string') {
      // ISO: "2025-12-17T06:51:26.289Z" hoặc "2025-12-17T00:00"
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


  load(): Hour[] {
    const json = localStorage.getItem(STORAGE_HOUR);
        if (!json) return [];
        try {
          let days = JSON.parse(json) as Hour[];
          return days;
        }
        catch {
          return [];
        }
  }
  add(newTime: Date, newCityId: number, newTemp: number, newApparentTemp: number, 
                newWeatherCode: number, newHumidity: number, newWinSpeed: number) {
                  ////////
    let newIcon = this.getWeatherIconName(newWeatherCode,newTime);
    let newDay = new Hour(newTime, newCityId, newTemp, newApparentTemp, newWeatherCode, newHumidity, newWinSpeed,newIcon);
    let days = this.load();
    days.push(newDay);
    localStorage.setItem(STORAGE_HOUR,JSON.stringify(days));
  }
  async checkWeatherNow(lat: number, lon: number): Promise<Hour>{
    let url = 'https://api.open-meteo.com/v1/forecast?latitude='+String(lat)+'&longitude='+String(lon)+'&current=temperature_2m,is_day,weather_code,rain,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=Asia%2FBangkok&forecast_days=1'
    let res = await fetch(url);
    let data = await res.json();
    // console.log(data);
    let newIcon = this.getWeatherIconName(data.current.weather_code,new Date());
    let curDay = new Hour(new Date(), 0, Math.round(data.current.temperature_2m), Math.round(data.current.apparent_temperature),
                        data.current.weather_code, data.current.relative_humidity_2m, data.current.wind_speed_10m,newIcon);
    return curDay;
  }
  
  async getAQI(lat:string, lon:string): Promise<string> {
    let url = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+lat+'&longitude='+lon+'&current=us_aqi&timezone=Asia%2FBangkok&forecast_days=3&domains=cams_global';
    let res = await fetch(url);
    let data = await res.json();
    return String(data.current.us_aqi); 
  }
}
