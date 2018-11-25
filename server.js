'use strict';

require ('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

/* MODELS */
const {userDataModel, userFavsModel} = require('./models');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const app = express();

app.use(morgan('common'))

/* CORS */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);


/* ROUTERS */

const {router: authRoute, localStrategy, lwtStrategy} = require('./auth');
/*
const userRoute = require('./user/userRouter');
const siteRoute = require('./site/siteRouter');
*/

/* ENDPOINTS */

app.use('/userAccess', authRoute);
/*
app.use('/userSetup', userSetup);
app.use('/userFavorites', userFavorites);
app.use('/userDraw', userDraw);
*/

//BASIC EP TO TEST SERVER START/STOP
app.get('/', (req, res) => res.json({testing: '1-2-3'}))


/* SERVER CATCH-ALL */

app.use('*', function(req, res) {
    res.status(404).json('Please use valid endpoint')
})


/* SERVER START/STOP */

let server;


//SERVER START
function startServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {

        mongoose.connect(databaseUrl, err => {
            if(err) {
                return reject(err)
            }

            server = app.listen(port, () => {
                console.log(`The server is listening on port ${port}`)
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect()
                reject(err)
            })
        })
    })

};

//SERVER STOP
function stopServer() {
    return mongoose.disconnect()
    .then(() => {
        return new Promise((resolve, reject) => {
            console.log('The server is being stopped')

            server.close(err => {
                if(err) {
                    return reject(err)
                }

                resolve()
            })
        })
    })
};

if(require.main === module) {
    startServer(DATABASE_URL).catch(err => {
        console.error(err)
    })
}

module.exports = {app, startServer, stopServer}
