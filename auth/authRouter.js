'use-strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');
const router = express.Router();
const localAuth = passport.authenticate('local', {session:false});
const jwtAuth = passport. authenticate('jwt', {session: false});

/* GENERATE VALID JWT */

const createAuthToken = function(theUser) {
    return jwt.sign({theUser}, config.JWT_SECRET,
        {
            subject: theUser.username,
            expiresIn: config.JWT_EXPIRE,
            algorithm: 'HS256'
        })
};

router.use(bodyParser.json());

router.post('/login', localAuth, (req, res) => {
    const authToken = createAuthToken(req.theUser.cleanUp())
    res.json({authToken})
});

router.post('/refresh', jwtAuth, (req, res) => {
    const authToken = createAuthToken(req.theUser)
    res.json({authToken})
});

module.exports = {router};