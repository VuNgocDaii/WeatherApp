import { Injectable } from '@angular/core';
import { Day } from '../model/day';
import { DayTree,treeItem } from '../share/utils/day-util';
import { STORAGE_DAY } from '../share/constants/constans';
import { getWmoIcon } from '../share/utils/weather-code-util';
@Injectable({
  providedIn: 'root',
})
export class DayService {

  saveTreeToLocal(tree: DayTree) {
    console.log('SAVE TIME')
    const dump = tree.dump();
    localStorage.setItem(STORAGE_DAY, JSON.stringify(dump));
  }

  loadTreeFromLocal(): DayTree {
    const tree = new DayTree();
    const json = localStorage.getItem(STORAGE_DAY);
    if (!json) return tree;

    try {
      const dump = JSON.parse(json) as treeItem[];
      if (Array.isArray(dump)) {
        dump.sort((a, b) => a.key - b.key);
        tree.loadFromDump(dump);
      }
    } catch { }
    return tree;
  }

  async get7DayForecast(
    lat: number,
    lon: number,
    cityId: number
  ): Promise<Day[]> {

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      `&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max` +
      `&timezone=Asia%2FBangkok` +
      `&forecast_days=7`;

    const res = await fetch(url);
    const data = await res.json();

    const daily = data.daily;

    const days: Day[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      const weatherCode = daily.weather_code[i];

      days.push(
        new Day(
          new Date(daily.time[i]),          
          cityId,                             
          weatherCode,                          
          daily.temperature_2m_max[i],          
          daily.temperature_2m_min[i],          
          new Date(daily.sunrise[i]),         
          new Date(daily.sunset[i]),             
          daily.wind_speed_10m_max[i],         
          getWmoIcon(weatherCode,true)
        )
      );
    }

    return days;
  }
}
