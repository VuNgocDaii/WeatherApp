import { Injectable } from '@angular/core';
import { City } from '../model/city';
const STORAGE_CITY = 'storage_city';
const STORAGE_CITY_ID = 'storage_city_id';
const STORAGE_DAY = 'storage_day';
@Injectable({
  providedIn: 'root',
})
export class CityService {
  genNewId(): number {
    const raw = localStorage.getItem(STORAGE_CITY_ID);
    let newId = raw ? Number(raw) : 1;
    if (!Number.isFinite(newId) || newId < 0) newId = 0;
    localStorage.setItem(STORAGE_CITY_ID, String(newId + 1));
    return newId;
  }
  load() : City[] {
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
  add(newCityName: string, newLat: number, newLon: number) {
    let newCity = new City(this.genNewId(), newCityName, newLat, newLon);
    let cities = this.load();
    cities.push(newCity);
    localStorage.setItem(STORAGE_CITY,JSON.stringify(cities));
  }
  delete(curCityId:number) {
    let cities = this.load();
    let index = cities.findIndex(c => c.cityId === curCityId);
    cities.splice(index);
    localStorage.setItem(STORAGE_CITY,JSON.stringify(cities));
  }
}
