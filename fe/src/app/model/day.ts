export class Day {
    time: Date;
    cityId: number;
    temp: number;
    apparentTemp: number;
    weatherCode: number; 
    humidity: number;
    winSpeed: number;
    constructor(newTime: Date, newCityId: number, newTemp: number, newApparentTemp: number, 
                        newWeatherCode: number, newHumidity: number, newWinSpeed: number) {
        ////
        this.time = newTime;
        this.cityId = newCityId;
        this.temp = newTemp;
        this.apparentTemp = newApparentTemp;
        this.weatherCode = newWeatherCode;
        this.humidity = newHumidity;
        this.winSpeed = newWinSpeed;
    }
}
