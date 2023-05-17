const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
const db = require('./dbconfig.js'); 

//routes
const crimeRoutes = require('./api/routes/crimes.js');
const cityRoutes = require('./api/routes/cities');
const categoryRoutes = require('./api/routes/categories');


//using bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//using morgan for logging
app.use(morgan('dev'));

//handling CORS errors by adding headers
app.use((req,res,next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    //for options request
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, DELETE, POST')
    }
    next();
});

//routes which should handle requests
app.use('/crimes', crimeRoutes);
app.use('/cities', cityRoutes);
app.use('/categories', categoryRoutes);

//handling errors 404 and 500 errors and sending a response
app.use((req, res,next) =>{
    const error = new Error();
    error.status = 404;
    next(error);
});

// a funnel for all other errors !404 
app.use((error, req, res, next)=>{
    res.status = error.status || 500;
    res.json({
        error : error.message
    });
});


module.exports = app;