export class Hour {
    time: Date;
    cityId: number;
    temp: number;
    apparentTemp: number;
    weatherCode: number; 
    humidity: number;
    windSpeed: number;
    icon: string;
    isDay?: boolean;
    constructor(newTime: Date, newCityId: number, newTemp: number, newApparentTemp: number, 
                        newWeatherCode: number, newHumidity: number, newWinSpeed: number,newIcon: string) {
        ////
        this.time = newTime;
        this.cityId = newCityId;
        this.temp = newTemp;
        this.apparentTemp = newApparentTemp;
        this.weatherCode = newWeatherCode;
        this.humidity = newHumidity;
        this.windSpeed = newWinSpeed;
        this.icon = newIcon;
    }
}
