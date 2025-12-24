import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CityService } from '../../service/city-service';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { SideBar } from '../side-bar/side-bar';
type WeatherLayer = { id: string; label: string; tile: string };

@Component({
  selector: 'app-map',
  imports: [CommonModule, FormsModule ],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  MAPTILER_KEY = 'RbAmeLkSfcHaD8uF3xLs';
  OPEN_WEATHER_KEY = '8dbd93011c9639f3899f8bcdb229f5e9';
  constructor(private cityService: CityService, @Inject(PLATFORM_ID) private platformId: Object) { }
  opacity = 0.6;
  city = '';

  layers: WeatherLayer[] = [
    { id: 'temp', label: 'Temp', tile: 'temp_new' },
    { id: 'clouds', label: 'Clouds', tile: 'clouds_new' },
    { id: 'wind', label: 'Wind', tile: 'wind_new' },
    { id: 'precipitation', label: 'Rain', tile: 'precipitation_new' },
    { id: 'snow', label: 'Snow', tile: 'snow_new' },
    { id: 'pressure', label: 'Pressure', tile: 'pressure_new' },
    { id: 'pressureLines', label: 'Pressure Lines', tile: 'pressure_cntr' },
  ];

  activeLayers = new Set<string>([]);

  map: any;
  maplibregl: any;
  isMapLoaded = false;
  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const maplibre = await import('maplibre-gl');
    this.maplibregl = maplibre;

    this.map = new this.maplibregl.Map({
      container: 'map',
      style: `https://api.maptiler.com/maps/streets/style.json?key=${this.MAPTILER_KEY}`,
      center: [0, 0],
      zoom: 1,
    });

    this.map.addControl(new this.maplibregl.NavigationControl(), 'top-right');

    this.map.on('load', () => {
      this.isMapLoaded = true;

      for (const id of this.activeLayers) {
        const layer = this.layers.find((l) => l.id === id);
        if (layer) this.ensureLayerAdded(layer, true);
      }
    });

    this.map.on('click', (e: any) => {
      const { lng, lat } = e.lngLat;
      this.showPopupWeather(lng, lat);
    });
    this.city = await this.getUserLocation();
    await this.searchCity();
  }

  lat: number = 0;
  lon: number = 0;
  async getUserLocation(): Promise<string> {
    let res: string = '';
    navigator.geolocation.getCurrentPosition(async position => {
      this.lat = position.coords.latitude;
      this.lon = position.coords.longitude;
      let urlAddCity = 'http://api.openweathermap.org/geo/1.0/reverse?lat=' + String(this.lat) + '&lon=' + String(this.lon) + '&limit=1&appid=' + this.OPEN_WEATHER_KEY;
       let res = await fetch(urlAddCity);
      let data = await res.json();
     //  console.log(curCity.cityName);
      this.city = data[0].name;
      // this.searchCity();

      return this.city;

    });
    
    return res;
  }
  toggleLayer(id: string) {
    const willDisable = this.activeLayers.has(id);

    if (willDisable) this.activeLayers.delete(id);
    else this.activeLayers.add(id);

    if (!this.isMapLoaded) return;

    const layer = this.layers.find((l) => l.id === id);
    if (!layer) return;

    if (!willDisable) {
      this.ensureLayerAdded(layer, true);
    } else {
      if (this.map?.getLayer?.(id)) {
        this.map.setLayoutProperty(id, 'visibility', 'none');
      }
    }
  }

  onOpacityChange(ev: Event) {
    const val = Number((ev.target as HTMLInputElement).value);
    this.opacity = Number.isFinite(val) ? val : this.opacity;
    this.layers.forEach((layer) => {
      if (this.map?.getLayer?.(layer.id)) {
        this.map.setPaintProperty(layer.id, 'raster-opacity', this.opacity);
      }
    });
  }

  async searchCity(): Promise<void> {
    const city = this.city.trim();
    if (!city) return;
    console.log('searchCity '+city);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${this.OPEN_WEATHER_KEY}&units=metric`
      );
      const data = await response.json();

      if (!response.ok || data?.cod === '404' || data?.cod === 404) {
        alert('City not found');
        return;
      }

      if (data?.coord) {
        this.map.flyTo({ center: [data.coord.lon, data.coord.lat], zoom: 8 });
        this.showPopupWeather(data.coord.lon, data.coord.lat);
      } else {
        alert('City not found');
      }
    } catch {
      alert('Error fetching weather data');
    }
  }

  private ensureLayerAdded(layer: WeatherLayer, visible: boolean) {
    const id = layer.id;

    if (!this.map?.getSource?.(id)) {
      this.map.addSource(id, {
        type: 'raster',
        tiles: [
          `https://tile.openweathermap.org/map/${layer.tile}/{z}/{x}/{y}.png?appid=${this.OPEN_WEATHER_KEY}`,
        ],
        tileSize: 256,
      });
    }
    if (!this.map?.getLayer?.(id)) {
      this.map.addLayer({
        id,
        type: 'raster',
        source: id,
        paint: { 'raster-opacity': this.opacity },
        layout: { visibility: visible ? 'visible' : 'none' },
      });
    } else {
      this.map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      this.map.setPaintProperty(id, 'raster-opacity', this.opacity);
    }
  }

  private async showPopupWeather(lon: number, lat: number) {
    const popup = new this.maplibregl.Popup()
      .setLngLat([lon, lat])
      .setHTML(this.popupHtml('Loading weather data...'))
      .addTo(this.map);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.OPEN_WEATHER_KEY}&units=metric`
      );
      const data = await response.json();

      if (!response.ok) {
        popup.setHTML(this.popupHtml('Failed to fetch weather'));
        return;
      }

      popup.setHTML(
        this.popupHtml(
          `
          <b>${this.escapeHtml(data?.name || 'Unknown')}</b><br>
          Temp: ${data?.main?.temp ?? '?'} °C<br>
          Humidity: ${data?.main?.humidity ?? '?'}%<br>
          Wind: ${data?.wind?.speed ?? '?'} m/s<br>
          ${this.escapeHtml(data?.weather?.[0]?.description ?? '')}
        `.trim(),
          true
        )
      );
    } catch {
      popup.setHTML(this.popupHtml('Failed to fetch weather'));
    }
  }

  private popupHtml(content: string, isRawHtml = false) {
    const safe = isRawHtml ? content : this.escapeHtml(content);
    return `
      <div style="
        background:#fff;
        color:#111;
        padding:10px 12px;
        border-radius:10px;
        min-width: 180px;
        font-size: 14px;
        line-height: 1.35;
      ">
        ${safe}
      </div>
    `;
  }

  private escapeHtml(s: string) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
