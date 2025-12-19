import { Component, ApplicationRef, effect } from '@angular/core';
import { CityService } from '../../service/city-service';
import { HourService } from '../../service/hour-service';
import { signal } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { Hour } from '../../model/hour';
import { City } from '../../model/city';
import { AutoCompleteModule } from 'primeng/autocomplete';

const STORAGE_CURDAY = 'storage_curday';
const STORAGE_CURTIME = 'storage_curtime';
const API_KEY = '8dbd93011c9639f3899f8bcdb229f5e9';

import { Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { url } from 'inspector';


const WMO_WW_EN: Record<number, string> = {
  0: "Cloud development not observed / not available",
  1: "Clouds dissolving or becoming less developed",
  2: "Sky state overall unchanged",
  3: "Clouds forming or developing",

  4: "Visibility reduced by smoke (fires/industrial/volcanic ash)",
  5: "Haze",
  6: "Widespread dust in suspension (not raised by wind at station)",
  7: "Dust/sand raised by wind at/near station (no dust whirls; no storm)",
  8: "Dust/sand whirls seen at/near station (no duststorm/sandstorm)",
  9: "Duststorm or sandstorm in sight (or occurred at station in past hour)",

  10: "Mist",
  11: "Shallow fog/ice fog in patches at station",
  12: "Shallow fog/ice fog more or less continuous at station",
  13: "Lightning visible (no thunder heard)",
  14: "Precipitation visible but not reaching the ground/sea (virga)",
  15: "Precipitation visible, reaching ground/sea, distant (>5 km)",
  16: "Precipitation visible, reaching ground/sea, nearby (not at station)",
  17: "Thunderstorm (no precipitation at time of observation)",
  18: "Squalls at/within sight of station",
  19: "Funnel cloud (tornado/waterspout) at/within sight of station",

  // 20–29: happened during the preceding hour, not at observation time
  20: "Drizzle (non-freezing) or snow grains occurred (not showers)",
  21: "Rain (non-freezing) occurred (not showers)",
  22: "Snow occurred (not showers)",
  23: "Rain & snow or ice pellets occurred (not showers)",
  24: "Freezing drizzle or freezing rain occurred (not showers)",
  25: "Rain showers occurred",
  26: "Snow showers or mixed rain/snow showers occurred",
  27: "Hail showers (or rain + hail) occurred",
  28: "Fog or ice fog occurred",
  29: "Thunderstorm occurred (with or without precipitation)",

  // 30–39: dust/sandstorm or blowing/drifting snow
  30: "Light/moderate duststorm or sandstorm decreasing",
  31: "Light/moderate duststorm or sandstorm no change",
  32: "Light/moderate duststorm or sandstorm starting/increasing",
  33: "Severe duststorm or sandstorm decreasing",
  34: "Severe duststorm or sandstorm no change",
  35: "Severe duststorm or sandstorm starting/increasing",
  36: "Light/moderate blowing snow (generally low, below eye level)",
  37: "Heavy drifting/blowing snow (generally low, below eye level)",
  38: "Light/moderate blowing snow (generally high, above eye level)",
  39: "Heavy drifting/blowing snow (generally high, above eye level)",

  // 40–49: fog/ice fog at observation time
  40: "Fog/ice fog at a distance (not at station in preceding hour)",
  41: "Fog/ice fog in patches at station",
  42: "Fog/ice fog thinning (sky visible)",
  43: "Fog/ice fog thinning (sky not visible)",
  44: "Fog/ice fog no change (sky visible)",
  45: "Fog/ice fog no change (sky not visible)",
  46: "Fog/ice fog forming or thickening (sky visible)",
  47: "Fog/ice fog forming or thickening (sky not visible)",
  48: "Rime-depositing fog (sky visible)",
  49: "Rime-depositing fog (sky not visible)",

  // 50–59: drizzle
  50: "Light drizzle, intermittent (non-freezing)",
  51: "Light drizzle, continuous (non-freezing)",
  52: "Moderate drizzle, intermittent (non-freezing)",
  53: "Moderate drizzle, continuous (non-freezing)",
  54: "Heavy drizzle, intermittent (non-freezing)",
  55: "Heavy drizzle, continuous (non-freezing)",
  56: "Light freezing drizzle",
  57: "Moderate/heavy freezing drizzle",
  58: "Light drizzle and rain",
  59: "Moderate/heavy drizzle and rain",

  // 60–69: rain
  60: "Light rain, intermittent (non-freezing)",
  61: "Light rain, continuous (non-freezing)",
  62: "Moderate rain, intermittent (non-freezing)",
  63: "Moderate rain, continuous (non-freezing)",
  64: "Heavy rain, intermittent (non-freezing)",
  65: "Heavy rain, continuous (non-freezing)",
  66: "Light freezing rain",
  67: "Moderate/heavy freezing rain",
  68: "Light rain/drizzle with snow",
  69: "Moderate/heavy rain/drizzle with snow",

  // 70–79: solid precipitation (not showers)
  70: "Light snow, intermittent",
  71: "Light snow, continuous",
  72: "Moderate snow, intermittent",
  73: "Moderate snow, continuous",
  74: "Heavy snow, intermittent",
  75: "Heavy snow, continuous",
  76: "Ice prisms / diamond dust (with or without fog)",
  77: "Snow grains (with or without fog)",
  78: "Isolated star-like snow crystals (with or without fog)",
  79: "Ice pellets (not showers)",

  // 80–99: showers and/or thunderstorm related
  80: "Light rain showers",
  81: "Moderate/heavy rain showers",
  82: "Violent rain showers",
  83: "Light mixed rain & snow showers",
  84: "Moderate/heavy mixed rain & snow showers",
  85: "Light snow showers",
  86: "Moderate/heavy snow showers",
  87: "Light showers of snow pellets / small hail (with/without rain)",
  88: "Moderate/heavy showers of snow pellets / small hail (with/without rain)",
  89: "Light hail showers (no thunder)",
  90: "Moderate/heavy hail showers (no thunder)",

  // 91–94: thunderstorm in preceding hour, not at observation time
  91: "Slight rain now; thunderstorm in preceding hour (not now)",
  92: "Moderate/heavy rain now; thunderstorm in preceding hour (not now)",
  93: "Slight snow/mixed/hail now; thunderstorm in preceding hour (not now)",
  94: "Moderate/heavy snow/mixed/hail now; thunderstorm in preceding hour (not now)",

  // 95–99: thunderstorm at observation time
  95: "Thunderstorm (slight/moderate), no hail; with rain/snow",
  96: "Thunderstorm (slight/moderate) with hail",
  97: "Thunderstorm (heavy), no hail; with rain/snow",
  98: "Thunderstorm with duststorm/sandstorm",
  99: "Thunderstorm (heavy) with hail",
};

type ForecastDay = {
  date: Date;
  tempAvg: number;
  weatherCodeAvg: number;
};
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
  imports: [CommonModule, AutoCompleteModule, FormsModule],
})
export class Content {
  

  loading = signal(true);
  constructor(private cityService: CityService, private hourService: HourService, private ar: ApplicationRef,
    @Inject(PLATFORM_ID) private platformId: Object) {
    let time = 0;
    effect(() => {
      time++;
      const isLoading = this.loading();
      console.log('loading changed ->', isLoading);

      if (isLoading && time > 1) {
        this.loadCurCityPage(false);
        console.log(this.curCity.name + ' load');
      }
    });

  }
  lon: any = 0;
  lat: any = 0;
  curCity: any = '';
  curDay = new Hour(new Date(),0,0,0,0,0,0,'');

  check: number = 0;
  aqi: string = '';
  forecastToday: Hour[] = [];
  forecast7Days: ForecastDay[] = [];
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
    console.log(this.loading);
    await this.getUserLocation(mode);
    console.log(this.lat + ' ' + this.lon + ' ' + this.curCity + ' ' + this.aqi);
    console.log(this.curDay);
    console.log(this.loading);


    //  this.forecastToday = this.dayService.load().filter(d=>d.cityId === this.curCity.cityId && this.cityService.compareDay(d.time,new Date()));
    //  for (let f of this.forecastToday) console.log(f);

    const all = this.hourService.load()
      .filter(d => d.cityId === this.curCity.cityId && this.cityService.compareDay(d.time, new Date()))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    this.forecastToday = all?.slice(0, 24);
    // let count:number = 0;
    //         let dataDay = this.dayService.load();
    //     for (let d of dataDay) {console.log(count,d.time,d.apparentTemp);count+=1;}


    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const da = new Date(start);
      da.setDate(start.getDate() + i);

      const forecastInDay = this.hourService.load()
        .filter(d => d.cityId === this.curCity.cityId && this.cityService.compareDay(d.time, da));

      if (forecastInDay.length === 0) {
        this.forecast7Days.push({ date: da, tempAvg: NaN, weatherCodeAvg: NaN });
        continue;
      }

      let sumTemp = 0;
      let sumCode = 0;

      for (const f of forecastInDay) {
        sumTemp += Number(f.temp ?? 0);
        sumCode += Number(f.weatherCode ?? 0);
      }

      const tempAvg = Math.round(sumTemp / forecastInDay.length);
      const weatherCodeAvg = Math.round(sumCode / forecastInDay.length);

      this.forecast7Days.push({ date: da, tempAvg, weatherCodeAvg });

      console.log(i, da, weatherCodeAvg, tempAvg);
    }

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
        }
        const [curCity, curDay, aqi] = await Promise.all([
          this.cityService.loadCityInfo(await this.cityService.add('none', this.lat, this.lon, false)),
          this.hourService.checkWeatherNow(this.lat, this.lon),
          this.hourService.getAQI(this.lat, this.lon),
        ]);

        this.curCity = curCity;
        this.curDay = curDay;
        this.aqi = aqi;


        this.loading.set(false);
        resolve();
      })
    });

  }

  weatherDescFromCode(code: number | null | undefined) {
    // console.log('call1');
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


}
