'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {userDataModel} = require('../models');
const router = express.Router();
const jsonParser = bodyParser.json();
/*
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jwtAuth = passport.authenticate('jwt', {session: false});
*/

/* GET USER TOKEN */
router.get('/gettoken/:username', (req, res) => {

    userDataModel.findOne({username: req.params.username})
    .then(user => {
        res.json(user.setToken())
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({
            code: '500',
            reason: 'ERROR',
            location: req.params.username,
            message: 'unable to find user'
        })
    })
});

/* GET USER DATA BY USER TOKEN */
router.get('/:id', (req, res) => {
    userDataModel.findById(req.params.id)
    .then(user => {
        res.json(user.cleanUp())
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({
            code: '500',
            reason: 'ERROR',
            location: req.params.id,
            message: 'unable to find id'
        })
    })
});

/* CREATE NEW USER */
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password', 'email']

    const missingField = requiredFields.find(field => !(field in req.body))

    if(missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: 'Field is missing',
            location: missingField
        }).end();
    }

    const checkString = ['username', 'password', 'email']

    const failString = checkString.find(field => 
        field in req.body && typeof req.body[field] !== 'string');

    if(failString) {
        const errMessage = `${field} does not have the correct type!`
        console.error(errMessage)
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: 'Field does not have the correct type!',
            location: field
        }).end();
    }

    const trimFields = ['username', 'password', 'email']
    const untrimmbedField = trimFields.find(field =>
        req.body[field].trim() !== req.body[field])

    if(untrimmbedField) {
        const errMessage = `${untrimmbedField} cannot start or end with whitespace!`
        console.error(errMessage)
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: 'Field cannot start or end with whitespace!',
            location: untrimmbedField
        }).end();
    };

    const credentialLength = {
        username: {min: 8, max: 30},
        password: {min: 8, max: 60}
    };

    const credentialShort = Object.keys(credentialLength).find(field => 'min' in credentialLength[field] && req.body[field].trim().length < credentialLength[field].min);
    const credentialLong = Object.keys(credentialLength).find(field => 'max' in credentialLength[field] && req.body[field].trim().length > credentialLength[field].max);

    if(credentialShort ||  credentialLong) {
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: credentialShort ? `must be a minimum of ${credentialLength[credentialShort].min} characters long`
            : `Cannot be longer than ${credentialLength[credentialLong].max} characters`,
            location: credentialShort || credentialLong
        });
    };

    let {username, password, email}  = req.body;

    return userDataModel.find({username})
    .count()
    .then(count => {
        if(count > 0) {
            return Promise.reject({
                code: 422,
                reason: 'ERROR',
                message: 'Username is not valid, please try again',
                location: 'username'
            })
        };

        return userDataModel.hashPass(password);
    })
    .then(hash => {
        return userDataModel.create({
            username,
            password: hash,
            email
        })
    })
    .then(user => {
        return res.status(201).json(user.cleanUp())
    })
    .catch(err => {
        if(err.reason === 'ERROR') {
            return res.status(err.code).json(err)
        }
        console.error(err)
        res.status(500).json({
            code: '500',
            reason: 'ERROR',
            location: '',
            message: 'Something is broken'
        })
    });
});

module.exports = router;