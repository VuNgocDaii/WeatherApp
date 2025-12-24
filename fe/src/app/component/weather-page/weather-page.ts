import { Component } from '@angular/core';
import { SideBar } from '../side-bar/side-bar';
import { Content } from '../content/content';
import { HourService } from '../../service/hour-service';
import { Hour } from '../../model/hour';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { wmoToKey } from '../../share/utils/date-util';
import { BackgroundPipe } from '../../share/pipe/backgroundPipe';
import { Map } from '../map/map';
@Component({
  selector: 'app-weather-page',
  imports: [SideBar, Content, BackgroundPipe,Map],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
})
export class WeatherPage {
  curDay: Hour | null = null;
  key: string = '';
  dn: string = '';
  constructor(public hourService: HourService, private router: Router) { }
  curUrl: string = '';
  ngOnInit() {
    this.curUrl = this.router.url;
  }
  onWeatherChange(day: Hour) {
    this.curDay = day;
     this.key = wmoToKey(this.curDay!.weatherCode);
    this.dn = this.curDay!.isDay ? 'day' : 'night';
    console.log("*******",this.key,this.dn);
    
  }

  // Cần sửa thêm. TODO
 

  

}
