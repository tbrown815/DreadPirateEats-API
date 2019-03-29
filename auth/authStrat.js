'use-strict';

const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { userDataModel } = require('../models');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {

    let user;

    /* VERIFY USER EXISTS */
    userDataModel.findOne({ username: username })
        .then(_user => {
            user = _user;
            if (!user) {
                return Promise.reject({
                    code: 401,
                    reason: 'ERROR',
                    message: 'Unable to authorize access'
                });
            }
            return user.valPass(password);
        })

        /* VALIDATE PASSWORD ENTERED BY USER */
        .then(isValid => {
            if (!isValid) {
                return Promise.reject({
                    code: 401,
                    reason: 'ERROR',
                    message: 'Unable to authorize access'
                });
            }
            return callback(null, user);
        })
        .catch(err => {
            if (err.reason === 'ERROR') {
                return callback(null, false, err);
            }
            return callback(err, false);
        });

    // close the ELSE    }
}); //localStrategy End

/* EXTRACT JWT FROM REQ HEADER */
const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        algorithms: ['HS256']
    },
    (payload, done) => {
        done(null, payload.user);
    }
);

module.exports = { localStrategy, jwtStrategy };