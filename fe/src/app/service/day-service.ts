import { Injectable } from '@angular/core';
import { Day } from '../model/day';
const STORAGE_CITY = 'storage_city';
const STORAGE_CITY_ID = 'storage_city_id';
const STORAGE_DAY = 'storage_day';
@Injectable({
  providedIn: 'root',
})
export class DayService {
  load(): Day[] {
    const json = localStorage.getItem(STORAGE_DAY);
        if (!json) return [];
        try {
          let days = JSON.parse(json) as Day[];
          return days;
        }
        catch {
          return [];
        }
  }
  add(newTime: Date, newCityId: number, newTemp: number, newApparentTemp: number, 
                newWeatherCode: number, newHumidity: number, newWinSpeed: number) {
                  ////////
    let newDay = new Day(newTime, newCityId, newTemp, newApparentTemp, newWeatherCode, newHumidity, newWinSpeed);
    let days = this.load();
    days.push(newDay);
    localStorage.setItem(STORAGE_DAY,JSON.stringify(days));
  }

  
}
