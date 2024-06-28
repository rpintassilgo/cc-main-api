require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);

mongoose.Promise = global.Promise;

module.exports = mongoose;