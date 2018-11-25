'use-strict';

const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');
const {userDataModel} = require('../models');
const {JWT_SECRET} = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {
    
    let theUser;

    /* VERIFY USER EXISTS */

    userDataModel.findOne({username: username})
        .then(_theUser => {
            theUser = _theUser;
            if(!theUser) {
                return Promise.reject({
                    reason: 'ERROR',
                    message: 'Unable to authorize access'
                });
            }
            return theUser.valPass(password);
        })

        /* VALIDATE PASSWORD ENTERED BY USER */
        
        .then(isValid => {
            if(!isValid) {
                return Promise.reject({
                    reason: 'ERROR',
                    message: 'Unable to authorize access'
                });
            }
            return callback(null, theUser);
        })
        .catch(err => {
            if (err.reason === 'ERROR') {
                return callback(null, false, err);
            }
            return callback(err, false);
        });
});

/* EXTRACT JWT FROM REQ HEADER */

const jwtStrategy = new JwtStrategy(
    {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.theUser);
    }
);

module.exports = {localStrategy, jwtStrategy};