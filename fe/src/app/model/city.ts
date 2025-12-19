export class City {
    cityId: number;
    cityName: string;
    lat: number;
    lon: number;
    country: string;
    isFavour: boolean;
    constructor(newCityId:number,newCityName: string, newLat:number, newLon: number,newCountry: string, checkFavour: boolean) {
        this.cityId = newCityId;
        this.cityName = newCityName;
        this.lat = newLat;
        this.lon = newLon;
        this.country = newCountry;
        this.isFavour = checkFavour;
    }
}
