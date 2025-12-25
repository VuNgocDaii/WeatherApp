import { Injectable } from '@angular/core';
import { Hour } from '../model/hour';
import { WMO_ICON_MAP,STORAGE_HOUR } from '../share/constants/constans';
import { HourTree } from '../share/utils/hour-util';
import { getWmoIcon } from '../share/utils/weather-code-util';
import { isDayTime } from '../share/utils/date-util';
import { toDate } from '../share/utils/date-util';
import { fromDTO,toDTO } from '../share/utils/date-util';
@Injectable({
  providedIn: 'root',
})
export class HourService {
  private tree = new HourTree();
  private loaded = false;

  load(): Hour[] {
    this.ensureLoaded();
    return this.tree.toArray();
  }

  add(newTime: Date,
    newCityId: number,
    newTemp: number,
    newApparentTemp: number,
    newWeatherCode: number,
    newHumidity: number,
    newWinSpeed: number
  ) {
    this.ensureLoaded();

    const newIcon = getWmoIcon(newWeatherCode, isDayTime(newTime));

    const item = new Hour(
      newTime,
      newCityId,
      newTemp,
      newApparentTemp,
      newWeatherCode,
      newHumidity,
      newWinSpeed,
      newIcon
    );
    console.log(item);
    const key = this.tree.hourKey(newTime);
    this.tree.insert(key, item);
    this.persist();
  }

  async checkWeatherNow(lat: number, lon: number): Promise<Hour> {
    console.log(lat,lon);
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      String(lat) +
      '&longitude=' +
      String(lon) +
      '&current=temperature_2m,is_day,weather_code,rain,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=Asia%2FBangkok&forecast_days=1';

    const res = await fetch(url);
    const data = await res.json();

    const now = new Date();
    const newIcon = getWmoIcon(data.current.weather_code, (data.current.is_day === 1));
    let dataHour = new Hour(
      now,
      0,
      Math.round(data.current.temperature_2m),
      Math.round(data.current.apparent_temperature),
      data.current.weather_code,
      data.current.relative_humidity_2m,
      data.current.wind_speed_10m,
      newIcon
    );
    
    if (data.current.is_day===1) dataHour.isDay = true; else dataHour.isDay = false;
    return dataHour;
  }

  async getAQI(lat: string, lon: string): Promise<string> {
    const url =
      'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' +
      lat +
      '&longitude=' +
      lon +
      '&current=us_aqi&timezone=Asia%2FBangkok&forecast_days=3&domains=cams_global';

    const res = await fetch(url);
    const data = await res.json();
    return String(data.current.us_aqi);
  }

  private ensureLoaded() {
    if (this.loaded) return;
    this.loaded = true;

    this.tree.clear();

    const json = localStorage.getItem(STORAGE_HOUR);
    if (!json) return;

    try {
      const raw = JSON.parse(json) as any[];
      for (const dto of raw) {
        const h = fromDTO(dto, (code, isDay) => getWmoIcon(code, isDay));
        if (h) this.tree.insert(this.tree.hourKey(h.time), h);
      }
    } catch {
    }
  }

  private persist() {
    const list = this.tree.toArray().map((h) => toDTO(h));
    localStorage.setItem(STORAGE_HOUR, JSON.stringify(list));
  }
}
