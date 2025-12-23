
import { Pipe, PipeTransform } from '@angular/core';
import { toDate } from '../utils/date-util';
@Pipe({
  name: 'hour',
})
export class HourPipe implements PipeTransform {
  transform(value: any): string {
    const d = toDate(value);
          if (!d) return '--';
          return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d);
  }
}