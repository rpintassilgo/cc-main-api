const axios = require('axios').default;
const Compass = require("cardinal-direction");
const luxon = require('luxon')
const lookup = require('country-code-lookup')
const Weather = require('../models/Weather');

module.exports = class WeatherController{

    static async getCoordinatesByCityName(req,res){
        const city = req.params.city;
        let data = null;

        try {
            const response = await axios.get(`${process.env.GEO_API_URL}?q=${city}&limit=5&appid=${process.env.OPEN_WEATHER_API_KEY}`, 
            { headers: {'Content-type': 'application/json'}});
                
            response.data.forEach(el => el.country = lookup.byIso(el.country).country);
            data = response.data;

            return res.send(data)
            
        } catch (error) {
            return res.status(400).send({ error: 'Geolocation API failed' });
        }
    }

    static async getWeatherByCoordinates(req,res){
        const { lat, lon } = req.query;
        let data = null

        try {
            // Check the database for existing weather data
            const existingWeather = await Weather.findOne({ lat, lon }).sort({ createdAt: -1 }).exec();
            if (existingWeather) {
                const oneHourAgo = luxon.DateTime.now().minus({ hours: 1 });
                if (luxon.DateTime.fromISO(existingWeather.createdAt) > oneHourAgo) {
                    return res.send(existingWeather);
                }
            }

            // If no recent data found, fetch new data from the API
            const response = await axios.get(`${process.env.WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_API_KEY}`, {
                headers: { 'Content-type': 'application/json' }
            });

            const weather = {
                city: response.data.city,
                weather: {
                    main: response.data.weather[0].main,
                    description: response.data.weather[0].description,
                    icon: response.data.weather[0].icon,
                },
                temperature: (response.data.main.temp - 273.15).toFixed(1),
                humidity: response.data.main.humidity,
                visibility: response.data.visibility,
                wind: {
                    speed: (response.data.wind.speed * 3.6).toFixed(1),
                    direction: Compass.cardinalFromDegree(response.data.wind.deg, Compass.CardinalSubset.Ordinal),
                },
                time: luxon.DateTime.fromSeconds(response.data.dt).toFormat('yyyy/MM/dd HH:mm:ss')
            }

            data = weather;

            return res.send(data)
          
        } catch (error) {
            return res.status(400).send({ error: 'Weather API failed' });
        }
    };

    // getForecast by coordinates or city id
    static async getForecast(req,res){
        let data = null
        
        const city = {
            id: req.query.cityid,
            lat: req.query.lat,
            lon: req.query.lon,
        };

        if(!((city.id !== undefined && city.lat === undefined && city.lon === undefined) ||
           (city.id === undefined && city.lat !== undefined && city.lon !== undefined))) 
            return res.status(400).send({ error: 'Invalid query parameters' });
        
        const isCoordinates = city.id === undefined ? true : false;
        
        try { 
            const url = isCoordinates == false ? `${process.env.FORECAST_API_URL}?id=${city.id}&cnt=5&appid=${process.env.OPEN_WEATHER_API_KEY}` :
                        `${process.env.FORECAST_API_URL}?lat=${city.lat}&lon=${city.lon}&cnt=5&appid=${process.env.OPEN_WEATHER_API_KEY}`;
                
            const response = await axios.get(url, 
            { headers: {'Content-type': 'application/json'}});
                
            let forecast = []
            response.data.list.forEach(el => {
                forecast.push({
                    city: el.city,
                    weather: {
                        main: el.weather[0].main,
                        description: el.weather[0].description,
                    },
                    temperature: (el.main.temp - 273.15).toFixed(1),
                    humidity: el.main.humidity,
                    visibility: el.visibility,
                    wind: {
                        speed: (el.wind.speed * 3.6).toFixed(1),
                        direction: Compass.cardinalFromDegree(el.wind.deg, Compass.CardinalSubset.Ordinal),
                    },
                    time: luxon.DateTime.fromSeconds(el.dt).toFormat('yyyy/MM/dd HH:mm:ss')
                })
            })
        
            data = forecast;

            return res.send(data)
          
        } catch (error) {
            return res.status(400).send({ error: 'Forecast API failed' });
        }
    };

};
