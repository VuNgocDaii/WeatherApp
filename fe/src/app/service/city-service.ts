import { Injectable } from '@angular/core';
import { City } from '../model/city';
import { compareDay } from '../share/utils/date-util';
import { HourService } from './hour-service';
import { STORAGE_CITY, STORAGE_CITY_ID, STORAGE_CURTIME, API_KEY } from '../share/constants/constans';


@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private hourService: HourService) { }

  genNewId(): number {
    const raw = localStorage.getItem(STORAGE_CITY_ID);
    let newId = raw ? Number(raw) : 1;
    if (!Number.isFinite(newId) || newId < 0) newId = 0;
    localStorage.setItem(STORAGE_CITY_ID, String(newId + 1));
    return newId;
  }

  load(): City[] {
    const json = localStorage.getItem(STORAGE_CITY);
    if (!json) return [];
    try {
      let cities = JSON.parse(json) as City[];
      return cities;
    }
    catch {
      return [];
    }
  }

  loadCurDay(): Date[] {
    const json = localStorage.getItem(STORAGE_CURTIME);
    if (!json) return [];
    try {
      let cities = JSON.parse(json) as Date[];
      return cities;
    }
    catch {
      return [];
    }
  }
  
  async add(newCityName: string, newLat: number, newLon: number, typeFavour: boolean): Promise<number> {
    let newCountry = '';

    if (newCityName === 'none') {
      let urlAddCity = 'http://api.openweathermap.org/geo/1.0/reverse?lat=' + String(newLat) + '&lon=' + String(newLon) + '&limit=1&appid=' + API_KEY;
      let res = await fetch(urlAddCity);
      let data = await res.json();

      newCityName = data[0]?.local_names.vi;
      newCountry = data[0]?.country;

      let curDay = this.loadCurDay()[0];

      if (!compareDay(curDay, new Date())) {
        localStorage.clear();
        let curDayArr: Date[] = [];
        curDayArr.push(new Date());
        localStorage.setItem(STORAGE_CURTIME, JSON.stringify(curDayArr));
      }
      else {
        localStorage.removeItem(STORAGE_CURTIME);
        let curDayArr: Date[] = [];
        curDayArr.push(new Date());
        localStorage.setItem(STORAGE_CURTIME, JSON.stringify(curDayArr));
      }
    }

    let cities = this.load();
    let checkExist = false;
    let newCityId = 1;
    for (let c of cities) { if (c.cityName === newCityName && c.country === newCountry) checkExist = true; newCityId = c.cityId; }

    if (!checkExist) {
      newCityId = this.genNewId();
      let newCity = new City(newCityId, newCityName, newLat, newLon, newCountry, typeFavour);
      cities.push(newCity);

      localStorage.setItem(STORAGE_CITY, JSON.stringify(cities));
      let urlDay = 'https://api.open-meteo.com/v1/forecast?latitude=' + newLat + '&longitude=' + newLon + '&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&timezone=Asia%2FBangkok';
      let resDay = await fetch(urlDay);
      let dayData = await resDay.json();

      for (let i = 0; i < dayData.hourly.time.length; i++) {
        let data = dayData.hourly;
        this.hourService.add(data.time[i], newCityId, data.temperature_2m[i], data.apparent_temperature[i],
          data.weather_code[i], data.relative_humidity_2m[i], data.wind_speed_10m[i]);
      }
    } else {
      let data = this.load();
      for (let c of data)
        if (c.cityName === newCityName && c.country === newCountry) newCityId = c.cityId;
    }
    return newCityId;
  }

  delete(curCityId: number) {
    let cities = this.load();
    let index = cities.findIndex(c => c.cityId === curCityId);
    cities.splice(index);
    localStorage.setItem(STORAGE_CITY, JSON.stringify(cities));
  }

  loadCityInfo(curCityId: number): City {
    let cities = this.load();
    let target = cities.filter(c => c.cityId === curCityId);
    return target[0];
  }
}
