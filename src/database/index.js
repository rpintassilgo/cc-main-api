require('dotenv').config();
const mongoose = require('mongoose');

console.log("MONGO URI: " + process.env.MONGO_URI)
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);

mongoose.Promise = global.Promise;

module.exports = mongoose;