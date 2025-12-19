import { Component } from '@angular/core';
import { SideBar } from "./side-bar/side-bar";
import { Content } from "./content/content";

@Component({
  selector: 'app-weather-page',
  imports: [SideBar, Content],
  templateUrl: './weather-page.html',
  styleUrl: './weather-page.scss',
})
export class WeatherPage {

}
