'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {userDataModel, userFavsModel} = require('../models');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', {session: false});


/* GET FAVORITES BY USER */
router.get('/user/:id', jwtAuth, (req, res) => {
    userFavsModel.find({user:req.params.id}) //ADD SOME SORTING OPTIONS - DEFAULT AND USER SELECTED FROM FRONTEND
    .then(userFavs => {
        res.json({
            userFavs: userFavs.map(
                (userFavs) => userFavs.cleanUp()
            )
        })
    })
    .catch(err => {
        console.error(err)
        res.status(500).json({
            code: '500',
            reason: 'ERROR',
            location: req.params.id,
            message: 'Unable to find ID'
        })
    })
});


/* GET FAVORITE BY FAV ID */
router.get('/favs/:id', jwtAuth, (req, res) => {
    userFavsModel.findById(req.params.id)
        .then(favs => {
            res.json(favs.cleanUp())
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({
                code: '500',
                reason: 'ERROR',
                location: req.params.id,
                message: 'Unable to find ID'
            })
        })
});


/* CREATE NEW FAVORITE */

/*
term = name

location = zip or city, state

c5Sow5YbMMt6PGbvHHKRSw

dwKVBekNl05xPD_np1kuCg



/* EDIT FAVORITE */




/* DELETE FAVORITE */





module.exports = router;