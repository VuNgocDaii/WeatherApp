export class City {
    cityId: number;
    cityName: string;
    lat: number;
    lon: number;
    constructor(newCityId:number,newCityName: string, newLat:number, newLon: number) {
        this.cityId = newCityId;
        this.cityName = newCityName;
        this.lat = newLat;
        this.lon = newLon;
    }
}
