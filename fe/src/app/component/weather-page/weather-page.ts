import { Component } from '@angular/core';
import { SideBar } from '../side-bar/side-bar';
import { Content } from '../content/content';
import { HourService } from '../../service/hour-service';
import { Hour } from '../../model/hour';   
import { NgClass } from '@angular/common'; 
import { Router } from '@angular/router';  
import { Map } from 'maplibre-gl';       
import { getWmoIcon } from '../../share/utils/weather-code-util';
import { isDayTime } from '../../share/utils/date-util';
@Component({
  selector: 'app-weather-page',
  imports: [SideBar, Content, NgClass],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
})
export class WeatherPage {
  curDay: Hour | null = null;

  constructor(public hourService: HourService, private router: Router) {}
  curUrl:string = '';
  ngOnInit(){
    this.curUrl = this.router.url;
  }
  onWeatherChange(day: Hour) {
    this.curDay = day;
  }
  private bgKeyFromIcon(icon: string): string {
    const s = (icon || '').toLowerCase();
    if (s.includes('thunder') || s === 'lightning') return 'thunder';
    if (s.includes('tornado')) return 'thunder';
    if (s.includes('extreme-rain') || s.includes('overcast-rain')) return 'rain';
    if (s.includes('rain') || s.includes('drizzle')) return 'rain';
    if (s.includes('sleet')) return 'sleet';
    if (s.includes('hail')) return 'hail';
    if (s.includes('snow') || s.includes('snowflake') || s.includes('wind-snow')) return 'snow';
    if (s.includes('fog') || s.includes('mist') || s.includes('haze')) return 'fog';
    if (s.includes('dust') || s.includes('smoke')) return 'dust';
    if (s.includes('wind')) return 'wind';
    if (s.includes('partly-cloudy')) return 'partly';
    if (s.includes('cloudy') || s.includes('overcast')) return 'cloudy';
    if (s.includes('clear')) return 'clear';
    return 'cloudy';
  }

  get bgClass(): string {
    const code = this.curDay?.weatherCode ?? 0;
    const isDay = isDayTime(this.curDay?.time ?? new Date());
    const icon = getWmoIcon(code, isDay);

    const key = this.bgKeyFromIcon(icon);
    return `bg--${key} ${isDay ? 'is-day' : 'is-night'}`;
  }

  get fxClass(): string {
    const code = this.curDay?.weatherCode ?? 0;
    const isDay = isDayTime(this.curDay?.time ?? new Date());
    const icon = getWmoIcon(code, isDay);
    const key = this.bgKeyFromIcon(icon);
    if (key === 'rain') return 'fx--rain';
    if (key === 'snow') return 'fx--snow';
    if (key === 'thunder') return 'fx--thunder';
    if (key === 'cloudy' || key === 'partly') return 'fx--clouds';
    if (key === 'fog') return 'fx--fog';
    if (key === 'dust') return 'fx--dust';
    return '';
  }
}
