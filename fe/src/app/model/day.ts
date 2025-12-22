export class Day {
    time: Date;
    cityId: number;
    weatherCode: number;
    maxTemp: number;
    minTemp: number;
    sunrise: Date;
    sunset: Date;
    maxWindSpeed: number;
    icon: string;
    constructor(newTime:Date, newCityId:number, newWeatherCode:number, newMaxTemp: number, newMinTemp:number, newSunrise: Date, newSunset: Date, newMaxWindSpeed:number,newIcon: string) {
        this.time = newTime;
        this.cityId = newCityId;
        this.weatherCode = newWeatherCode;
        this.maxTemp = newMaxTemp;
        this.minTemp = newMinTemp;
        this.sunrise = newSunrise;
        this.sunset = newSunset;
        this.maxWindSpeed = newMaxWindSpeed; 
        this.icon = newIcon;
    }
}
