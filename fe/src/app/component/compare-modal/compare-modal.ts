import { Component, EventEmitter, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { DayService } from '../../service/day-service';
import { HourService } from '../../service/hour-service';
import { Day } from '../../model/day';
import { API_KEY } from '../../share/constants/constans';
import { toTemp } from '../../share/pipe/deegrePipe';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
  NgApexchartsModule
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];  
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-compare-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    NgApexchartsModule
  ],
  templateUrl: './compare-modal.html',
  styleUrl: './compare-modal.scss'
})
export class CompareModal {
  @ViewChild('chart') chart!: ChartComponent;

  public chartOptions: ChartOptions;


  tempUnit = signal('C');

  @Output() submit = new EventEmitter<{ city1: any; city2: any }>();
  @Output() closeModal = new EventEmitter<void>();

  city1: any;
  city2: any;

  suggestions1: any[] = [];
  suggestions2: any[] = [];

  showCompare = signal(false);

  daysCity1: Day[] = [];
  daysCity2: Day[] = [];

  constructor(
    private dayService: DayService,
    private hourService: HourService
  ) {
    this.chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'line',
        zoom: { enabled: false }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      title: {
        text: '7-Day Temperature Comparison',
        align: 'left'
      },
      grid: {
        borderColor: 'rgba(255,255,255,0.1)'
      },
      xaxis: {
        categories: []
      },
      yaxis: {
        labels: {
          formatter: val => `${val}°C`
        },
        title: {
          text: 'Temperature (°C)'
        }
      },
      tooltip: {
        y: {
          formatter: val => `${val}°C`
        }
      }
    };
  }

  

  async searchCity(e: any, index: number) {
    const q = e.query;
    if (!q) return;

    const res = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${API_KEY}`
    );

    const data = await res.json();

    const list = data.map((x: any) => ({
      cityName: x.name,
      lat: x.lat,
      lon: x.lon,
      country: x.country
    }));

    index === 1
      ? (this.suggestions1 = list)
      : (this.suggestions2 = list);
  }

  async compare() {
    if (!this.city1 || !this.city2) return;

    this.daysCity1 = await this.dayService.get7DayForecast(
      this.city1.lat,
      this.city1.lon,
      1
    );

    this.daysCity2 = await this.dayService.get7DayForecast(
      this.city2.lat,
      this.city2.lon,
      2
    );

    const unit = this.tempUnit();

    this.chartOptions = {
      ...this.chartOptions,
      xaxis: {
        categories: this.daysCity1.map(d =>
          d.time.toLocaleDateString('en-GB', { weekday: 'short' })
        )
      },

      series: [
        {
          name: this.city1.cityName,
          data: this.daysCity1.map(d => toTemp(d.maxTemp,unit))
        },
        {
          name: this.city2.cityName,
          data: this.daysCity2.map(d => toTemp(d.maxTemp,unit))
        }
      ],

      yaxis: {
        labels: {
          formatter: val => `${val}°${unit}`
        },
        title: {
          text: `Temperature (°${unit})`
        }
      },

      tooltip: {
        y: {
          formatter: val => `${val}°${unit}`
        }
      }
    };

    this.showCompare.set(true);
  }

  async setUnit() {
    if (this.tempUnit() === 'C') this.tempUnit.set('F');
    else this.tempUnit.set('C');

    if (this.showCompare()) {
      await this.compare();
    }
  }

  close() {
    this.showCompare.set(false);
    this.closeModal.emit();
  }
}
