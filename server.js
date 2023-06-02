// https://www.youtube.com/watch?v=JR9BeI7FY3M&list=PL0Zuz27SZ-6P4dQUsoDatjEGpmBpcOW8V&index=2
require('dotenv').config();
const express = require('express');
const path = require('path');
const {logger, logEvents} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require("./config/dbConn");
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3500;
console.log(process.env.NODE_ENV);

connectDB();
 
app.use(logger)

app.use(cors(corsOptions));

//allows our app to receive and parse JSON data
app.use(express.json());

app.use(cookieParser());

//This line below would also work because the server.js file is in the same directory as the public 
// app.use(express.static('public'));
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/' ,require('./routes/root'));
app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/noteRoutes'));

// app.all() function is used to route all types of HTTP requests. Like if we have POST, GET, PUT, DELETE, etc, requests made to any specific route
app.all("*", (req, res) => {
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }
    else if(req.accepts('json')){
        res.json({message: '404 Nor Found'});
    }
    else{
        res.type('txt').send('404 Not Found');
    }
})

app.use(errorHandler);

mongoose.connection.once('open' , () => {
    console.log("Connected to DB");
    app.listen( PORT , () => console.log(`Server running on port ${PORT}`)); 
})

mongoose.connection.on('error' , (err) => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

