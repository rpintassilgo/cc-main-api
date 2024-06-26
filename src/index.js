const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport')
const session = require('express-session')
const local = require('./config/passport')
const dotenv = require('dotenv').config()
const cors = require('cors');

const app = express();
const port = process.env.BACKEND_PORT;
const authRoute = require('./routes/auth.routes');
const weatherRoute = require('./routes/weather.routes');
const taskRoutes = require('./routes/tasks.routes');
const avatarRoutes = require('./routes/avatar.routes');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000,
            sameSite: 'Lax',
            secure: false
         }
}))
app.use(passport.initialize())
app.use(passport.session())


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
  
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // Caching the preflight response for a day
};
app.use(cors(corsOptions));

app.use('/api/auth', authRoute);
app.use('/api/weather', weatherRoute);
app.use('/api/tasks', taskRoutes);
app.use('/api/avatar', avatarRoutes);

app.listen(port, () => {
    console.log(`Application is listening at port ${port}`);
});

