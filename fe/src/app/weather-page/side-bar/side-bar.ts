
import { Component, OnInit } from '@angular/core';
import { Day } from '../../model/day';
import { DayTree } from '../../utils/day-util';
import { DayService } from '../../service/day-service';
import { STORAGE_CITY } from '../../share';
import { City } from '../../model/city';
import { json } from 'stream/consumers';
@Component({
  selector: 'app-side-bar',
  imports: [],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})

export class SideBar implements OnInit {
  constructor(private dayService: DayService) {}

  async ngOnInit(): Promise<void> {
    let tree = this.dayService.loadTreeFromLocal();
    
    let jsonC = localStorage.getItem(STORAGE_CITY);
    if (jsonC) {
      const dataCity = JSON.parse(jsonC) as City[];
      for (let c of dataCity) {
        tree = await this.addDataDayOfCity(tree,c.lat,c.lon,c.cityId);
       
      }
      let dataCity1 = tree.rangeByCity(1,new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), 0, 0, 0, 0),new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay()+10, 0, 0, 0, 0));
      console.log(dataCity1); 
       console.log('Max date in tree'+tree.getMaxDate());
    }
    
   
    
  }
  async addDataDayOfCity(tree: DayTree,lat: number, lon:number, cityId:number):Promise<DayTree>{
    let url = 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=Asia%2FBangkok&forecast_days=14';
    let res = await fetch(url);
    let data = await res.json()
    for (let i=7;i<8;i++) {
      let s = data.daily.time[i];
      const [y, m, d] = s.split('-').map(Number);
      let date : Date = new Date(y, m - 1, d, 0, 0, 0, 0);
      let day = new Day(date, cityId, data.daily.weather_code[i],
                        data.daily.temperature_2m_max[i],data.daily.temperature_2m_min[i],
                      data.daily.sunrise[i],data.daily.sunset[i],data.daily.wind_speed_10m_max[i]);
       tree.upsert(day);
                      console.log(day);
                      
    }
    console.log(data.daily);
    return tree;
  }
}

