import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadComponent:()=>import('../app/component/weather-page/weather-page').then(c=>c.WeatherPage)
    },
    {
        path:'map',
        loadComponent:()=>import('../app/component/weather-page/weather-page').then(c=>c.WeatherPage)
    }
];
