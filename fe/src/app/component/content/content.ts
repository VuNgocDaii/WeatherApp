import { Component, ApplicationRef, effect, Output, EventEmitter, Input } from '@angular/core';
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
import { WMO_ICON_MAP, WMO_WW_EN } from '../../share/constants/constans';
import { DeegrePipe } from '../../share/pipe/deegrePipe';
import { toDate } from '../../share/utils/date-util';
import { TooltipModule } from 'primeng/tooltip';
import { HourPipe } from '../../share/pipe/hourPipe';
import { weatherDescFromCode } from '../../share/utils/weather-code-util';
import { isDayTime } from '../../share/utils/date-util';
import { API_KEY } from '../../share/constants/constans';
import { getWmoIcon } from '../../share/utils/weather-code-util';
import { compareDay } from '../../share/utils/date-util';
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
  imports: [CommonModule, AutoCompleteModule, FormsModule, DeegrePipe, HourPipe, TooltipModule],
})
export class Content {

  @Output() weatherChange = new EventEmitter<Hour>();
  // check change unit of deegre
  tempUnit = signal('C');
  // check reload 
  loading = signal(true);
  // mark first time load
  time = 0;
  //
  sunsetTime: Date = new Date();
  sunriseTime: Date = new Date();
  curWeatherDescription: string = '';
  aqi: string = '';
  //
  lon: any = 0;
  lat: any = 0;
  //
  @Input() curCity: any = '';
  curDay = new Hour(new Date(), 0, 0, 0, 0, 0, 0, '');

  // 24h in day
  forecastToday: Hour[] = [];
  // next week
  forecast7Days: Day[] = [];

  selectedCity: CityDTO = {
    cityName: '',
    lat: 0,
    lon: 0,
    country: ''
  };
  citySuggestions: CityDTO[] = [];
  // temperary search string
  draftCity: any = '';
  //
  isFav = false;
  constructor(private cityService: CityService, private hourService: HourService, private dayService: DayService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.time++;
      const isLoading = this.loading();
      if (isLoading && this.time > 1) {
        this.loadCurCityPage(false);
      }
    });
  }

  async ngOnInit() {
    this.loadCurCityPage(true);
  }
  async ngOnChanges() {
    this.loadCurFavorCityPage(this.curCity);
  }
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

  async loadCurCityPage(mode: boolean) {
    this.showFavourite = false;
    this.forecast7Days = [];
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    let checkCityExisted: boolean = false;
    let dataLocateCity = this.cityService.load();
    console.log(this.loading);
    await this.getUserLocation(mode);
    this.isFav = this.curCity.isFavour;


    for (let d of dataLocateCity) if (d.cityId === this.curCity.cityId) checkCityExisted = true;
    console.log(this.curCity.cityId + ' ' + this.curCity.lon + ' ' + this.curCity.cityName + ' ' + this.aqi + ' ' + this.isFav);
    this.curWeatherDescription = weatherDescFromCode(this.curDay.weatherCode);
    console.log(this.curDay);
    console.log(this.loading);



    const all = this.hourService.load()
      .filter(d => d.cityId === this.curCity.cityId && compareDay(d.time, new Date()))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    this.forecastToday = all?.slice(0, 24);

    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 0, 0, 0, 0);

    let tree = this.dayService.loadTreeFromLocal();
    if (to < tree.getMaxDate() || checkCityExisted === false) {
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
    this.sunsetTime = foreCastPerDay[0].sunset;
    this.sunriseTime = foreCastPerDay[0].sunrise;
    for (let f of foreCastPerDay) this.forecast7Days.push(f);
    this.loading.set(false);
    console.log(this.forecast7Days);
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
        this.curDay = curDay;
        this.weatherChange.emit(this.curDay);
        this.aqi = aqi;
        resolve();
      })
    });

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
        getWmoIcon(data.daily.weather_code[i], true));

      day.icon = getWmoIcon(day.weatherCode, true);
      console.log(day);
      tree.upsert(day);

    }
    return tree;
  }

  toggleTempUnit() {
    if (this.tempUnit() === 'C') this.tempUnit.set('F');
    else this.tempUnit.set('C');
  }

  toggleLocate() {
    this.time = 0;
    this.draftCity = '';
    this.loading.set(true);
    this.loadCurCityPage(true);
  }

  toggleFav(cityId: number) {
    this.showFavourite = false;
    this.isFav = !this.isFav;
    this.cityService.changeFavor(cityId);
  }

  showFavourite = false;

  favourites: City[] = [];
  @Output() favouriteListChange = new EventEmitter<City[]>();
  toggleFavourite() {
    console.log('???');
    this.favourites = this.cityService.loadFavourCity().sort((a, b) => a.cityName.localeCompare(b.cityName));
    console.log(this.favourites);
    this.openFavourite.emit()
    this.favouriteListChange.emit(this.favourites);
    this.showFavourite = !this.showFavourite;
  }

  loadCurFavorCityPage(city: City) {
    this.curCity = city;
    this.selectedCity.cityName = city.cityName;
    this.selectedCity.country = city.country;
    this.selectedCity.lat = city.lat;
    this.selectedCity.lon = city.lon;
    this.loadCurCityPage(false);
  }

  @Output() openCompare = new EventEmitter<void>();
  @Output() openFavourite = new EventEmitter<void>();

  showFavConfirm = false;
  pendingFavAction: string = '';
  pendingCityId?: number;

  openFavConfirm(cityId: number) {
    this.pendingCityId = cityId;

    this.pendingFavAction = this.isFav ? 'remove' : 'add';
    this.showFavConfirm = true;
  }

  confirmFavAction() {
    if (this.pendingCityId == null) return;

    this.toggleFav(this.pendingCityId);

    this.closeFavConfirm();
  }

  closeFavConfirm() {
    this.showFavConfirm = false;
    this.pendingFavAction = '';
    this.pendingCityId = undefined;
  }

}
