const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WeatherSchema = new Schema({
    city: String,
    weather: {
        main: String,
        description: String,
        icon: String,
    },
    temperature: Number,
    humidity: Number,
    visibility: Number,
    wind: {
        speed: Number,
        direction: String,
    },
    time: String,
    lat: Number,
    lon: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Weather = mongoose.model('Weather', WeatherSchema);
module.exports = Weather;
