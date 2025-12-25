
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'deegre',
})
export class DeegrePipe implements PipeTransform {
  transform(value: number, tempUnit: string): number {
    if(tempUnit === 'F'){
        return Math.round((value*9)/5+32);
    }
    return Math.round(value);
  }
}

export function toTemp(value: number,tempUnit:string ): number {
    if (tempUnit === 'F') {
      return Math.round(((value * 9) / 5 + 32) * 10) / 10;
    }
    return Math.round(value * 10) / 10;
  }