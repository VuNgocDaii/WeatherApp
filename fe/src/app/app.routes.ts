import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadComponent:()=>import('../app/weather-page/weather-page').then(c=>c.WeatherPage)
    },
    {
        path:'map',
        loadComponent:()=>import('../app/weather-page/weather-page').then(c=>c.WeatherPage)
    }
];
