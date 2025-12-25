import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compareCity'
})
export class CompareCityWeatherPipe implements PipeTransform {

  transform(cityA: any, cityB: any): string {
    if (!cityA || !cityB) return '';

    const tempDiff = cityA.apparentTemp - cityB.apparentTemp;
    const humDiff  = cityA.humidity - cityB.humidity;

    if (Math.abs(tempDiff) >= 2) {
      return tempDiff > 0? `${cityA.cityName} is hotter` : `${cityB.cityName} is hotter`;
    }

    if (Math.abs(humDiff) >= 5) {
      return humDiff > 0? `${cityA.cityName} is more humid`: `${cityB.cityName} is more humid`;
    }

    return 'Weather is similar';
  }
}
