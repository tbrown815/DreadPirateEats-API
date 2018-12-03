'use strict';

require ('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors')

/* MODELS */
const {userDataModel, userFavsModel} = require('./models');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL, CLIENT_ORIGIN} = require('./config');

const app = express();

app.use(cors({origin: CLIENT_ORIGIN}))

app.use(morgan('dev'))

/* ROUTERS */
const {router: authRoute, localStrategy, jwtStrategy} = require('./auth');
const accessRoute = require('./access/accessRoute');
/*
const userRoute = require('./user/userRouter');
*/


passport.use(localStrategy);
passport.use(jwtStrategy);

/* ENDPOINTS */
app.use('/userAuth', authRoute);
app.use('/userAccess', accessRoute);
/*
app.use('/userSite', userRoute);
*/

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

app.use(express.static('public'));

//BASIC EP TO TEST SERVER START/STOP
app.get('/test', (req, res) => res.json({testing: '1-2-3'}))


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
