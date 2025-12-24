
import { Pipe, PipeTransform } from '@angular/core';
import { toDate } from '../utils/date-util';
import { bgList } from '../constants/constans';
@Pipe({
  name: 'backgr',
})
export class BackgroundPipe implements PipeTransform {
  transform(value: any,dn: string): string {
    for (let item of bgList) {
        if (item.key.includes(value) && item.key.includes(dn))
            return item.bg;
    }
    return'/assets/bg/clear_day.jpg';
  }
}