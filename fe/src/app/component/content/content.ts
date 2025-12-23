import { Component, ApplicationRef, effect, Output, EventEmitter } from '@angular/core';
import { CityService } from '../../service/city-service';
import { HourService } from '../../service/hour-service';
import { signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { Hour } from '../../model/hour';
import { City } from '../../model/city';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Day } from '../../model/day';
import { DayTree } from '../../share/utils/day-util';
import { DayService } from '../../service/day-service';
import { STORAGE_CITY } from '../../share/constants/constans';
import { WMO_ICON_MAP,WMO_WW_EN } from '../../share/constants/constans';
import { DeegrePipe } from '../../share/pipe/deegrePipe';

const STORAGE_CURDAY = 'storage_curday';
const STORAGE_CURTIME = 'storage_curtime';
const API_KEY = '8dbd93011c9639f3899f8bcdb229f5e9';

import { Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';



type CityDTO = {
  cityName: string;
  lat: number;
  lon: number;
  country: string;
}
@Component({
  selector: 'app-content',

  templateUrl: './content.html',
  styleUrl: './content.scss',
  imports: [CommonModule, AutoCompleteModule, FormsModule, DeegrePipe],
})
export class Content {

  @Output() weatherChange = new EventEmitter<Hour>();
  loading = signal(true);time = 0;
  constructor(private cityService: CityService, private hourService: HourService, private ar: ApplicationRef, private dayService: DayService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    
    effect(() => {
      this.time++;
      const isLoading = this.loading();
      console.log('loading changed ->', isLoading);

      if (isLoading && this.time > 1) {
        this.loadCurCityPage(false);
        console.log(this.curCity.cityName + ' load');
      }
    });
  }

  sunsetTime: Date = new Date();
  sunriseTime: Date = new Date();
  lon: any = 0;
  lat: any = 0;
  curCity: any = '';
  curDay = new Hour(new Date(), 0, 0, 0, 0, 0, 0, '');
  curWeatherDescription: string='';
  check: number = 0;
  aqi: string = '';
  forecastToday: Hour[] = [];
  forecast7Days: Day[] = [];
  selectedCity: CityDTO = {
    cityName: '',
    lat: 0,
    lon: 0,
    country: ''
  };
  citySuggestions: CityDTO[] = [];

  onSearchCity(e: any) {
    const q = String(e.query ?? '').trim();
    console.log('Search String:' + q);
    if (!q) {
      this.citySuggestions = [];
      return;
    }
    this.fetchCities(q);
  }

  private async fetchCities(q: string) {
    try {
      // this.aborter?.abort();
      // this.aborter = new AbortController();

      const url =
        `http://api.openweathermap.org/geo/1.0/direct` +
        `?q=${encodeURIComponent(q)}` +
        `&limit=3` +
        `&appid=${API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) {
        this.citySuggestions = [];
        return;
      }

      const data = (await res.json()) as any[];
      console.log('***', data);
      console.log(res);
      this.citySuggestions = (data ?? []).map(x => ({
        cityName: x.name,
        lat: x.lat,
        lon: x.lon,
        country: x.country
      })) as CityDTO[];

    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      this.citySuggestions = [];
    }
  }

  draftCity: any = '';

  commitCity(ev: any) {
    this.selectedCity = ev.value as CityDTO;
    this.lat = this.selectedCity.lat;
    this.lon = this.selectedCity.lon;
    this.loading.set(true);
  }

  clearCity() {
    this.draftCity = '';
    this.selectedCity = {
      cityName: '',
      lat: 0,
      lon: 0,
      country: ''
    };
  }


  async ngOnInit() {
    this.loadCurCityPage(true);
  }

  async loadCurCityPage(mode: boolean) {
    this.forecast7Days = [];
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    let checkCityExisted: boolean = false;
    let dataLocateCity = this.cityService.load();
    console.log(this.loading);
    await this.getUserLocation(mode);
    console.log(this.curCity.lat + ' ' + this.curCity.lon + ' ' + this.curCity.cityName + ' ' + this.aqi);
    for (let d of dataLocateCity) if (d.cityId === this.curCity.cityId) checkCityExisted = true;
    this.curWeatherDescription = this.weatherDescFromCode(this.curDay.weatherCode);
    console.log(this.curDay);
    console.log(this.loading);



    const all = this.hourService.load()
      .filter(d => d.cityId === this.curCity.cityId && this.cityService.compareDay(d.time, new Date()))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    this.forecastToday = all?.slice(0, 24);
    console.log('////////');
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 0, 0, 0, 0);

    let tree = this.dayService.loadTreeFromLocal();
    console.log('Log from tree ' + this.curCity.cityId, to, tree.getMaxDate());

    console.log(tree.rangeByCity(this.curCity.cityId, from, to));

    console.log('City exist for add info: ' + checkCityExisted);
    if (to < tree.getMaxDate() || checkCityExisted === false) {
      console.log('load 7 day new' + to);
      let jsonC = localStorage.getItem(STORAGE_CITY);
      if (jsonC) {
        const dataCity = JSON.parse(jsonC) as City[];
        for (let c of dataCity) {
          tree = await this.addDataDayOfCity(tree, c.lat, c.lon, c.cityId);
        }
      }
      this.dayService.saveTreeToLocal(tree);
    }

    const foreCastPerDay = tree.rangeByCity(this.curCity.cityId, from, to);
    // console.log(foreCastPerDay);
    this.sunsetTime = foreCastPerDay[0].sunset;
    this.sunriseTime = foreCastPerDay[0].sunrise;
    for (let f of foreCastPerDay) this.forecast7Days.push(f);
    this.loading.set(false);
    console.log(this.forecast7Days);
  }

  ngOnChanges() {
    console.log('data change');
  }

  async getUserLocation(mode: boolean): Promise<void> {
    return new Promise((resolve, rejects) => {
      navigator.geolocation.getCurrentPosition(async position => {

        if (mode) {
          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
          // console.log('123   ', this.lat, this.lon);
        } else {
          this.lat = this.selectedCity.lat;
          this.lon = this.selectedCity.lon;
          // console.log('1234   ', this.lat, this.lon);
        }

        const [curCity, curDay, aqi] = await Promise.all([
          this.cityService.loadCityInfo(await this.cityService.add('none', this.lat, this.lon, false)),
          this.hourService.checkWeatherNow(this.lat, this.lon),
          this.hourService.getAQI(this.lat, this.lon),
        ]);

        this.curCity = curCity;
        // console.log('new city fecth ' + curCity.cityName);
        this.curDay = curDay;
        this.weatherChange.emit(this.curDay);
        this.aqi = aqi;
        resolve();
      })
    });

  }

  weatherDescFromCode(code: number | null | undefined) {
    if (code == null) return "";
    return WMO_WW_EN[code] ?? "Unknown weather code";
  }


  toDate(value: any): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);

    if (typeof value === 'string') {
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

  formatHour(value: any): string {
    const d = this.toDate(value);
    if (!d) return '--';
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d);
  }

  async addDataDayOfCity(tree: DayTree, lat: number, lon: number, cityId: number): Promise<DayTree> {
    let url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=Asia%2FBangkok&forecast_days=14';
    let res = await fetch(url);
    let data = await res.json()
    for (let i = 0; i < 7; i++) {
      let s = data.daily.time[i];
      const [y, m, d] = s.split('-').map(Number);
      let date: Date = new Date(y, m - 1, d, 0, 0, 0, 0);
      let day = new Day(date, cityId, data.daily.weather_code[i],
        data.daily.temperature_2m_max[i], data.daily.temperature_2m_min[i],
        data.daily.sunrise[i], data.daily.sunset[i], data.daily.wind_speed_10m_max[i],
        this.getWmoIcon(data.daily.weather_code[i], true));

      day.icon = this.getWmoIcon(day.weatherCode, true);
      console.log(day);
      tree.upsert(day);

    }
    return tree;
  }
  isDayTime(time: any): boolean {
    const d = this.toDate(time);
    if (!d) return true;
    const h = d.getHours();
    return h >= 6 && h < 18;
  }
  getWmoIcon(code: number, isDay: boolean): string {
    const def = WMO_ICON_MAP[code] ?? 'not-available';
    return typeof def === 'string' ? def : (isDay ? def.day : def.night);
  }

 
  tempUnit = signal('C');

  toggleTempUnit() {
    if (this.tempUnit()==='C') this.tempUnit.set('F');
    else this.tempUnit.set('C');
  }

  toggleLocate() {
    this.time = 0;
    this.draftCity='';
    this.loading.set(true);
    this.loadCurCityPage(true);
  }

}
