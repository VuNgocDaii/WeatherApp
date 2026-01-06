import { Component, Input } from '@angular/core';
import { City } from '../../model/city';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
@Component({
  selector: 'app-favourite-list',
  imports: [NgFor],
  templateUrl: './favourite-list.html',
  styleUrl: './favourite-list.scss',
})
export class FavouriteList {
  @Input() favourites?: City[];
  @Output() closeFavourite = new EventEmitter<void>();
  @Output() newCity = new EventEmitter<City>();
  close() {
    this.closeFavourite.emit();
  }

  openFavouriteCity(favouriteCity: City) {
    this.newCity.emit(favouriteCity);
    this.close();
  }
}
