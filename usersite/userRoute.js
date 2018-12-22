'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { userDataModel, userFavsModel } = require('../models');
const router = express.Router();
const passport = require('passport');
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });


/* GET FAVORITES BY USER */
router.get('/user/:id', jwtAuth, (req, res) => {
    return userFavsModel.find({ userRef: req.params.id })

        .count()
        .then(count => {

            if (count < 1) {
                return res.status(422).json(
                    {
                        code: 422,
                        reason: 'ERROR',
                        message: `${req.params.id} does not exist`,
                        location: `${req.params.id}`
                    })
            }

            userFavsModel.find({ userRef: req.params.id }).sort({'resturantName': 1})

                .then(userFavs => {
                    res.json({
                        userFavs: userFavs.map(
                            (userFavs) => userFavs.cleanUp()
                        )
                    })
                })
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({
                code: '500',
                reason: 'ERROR',
                message: 'Unable to find ID',
                location: req.params.id
            })
        })
});


/* GET FAVORITE BY FAV ID */
router.get('/favs/:id', jwtAuth, (req, res) => {

    return userFavsModel.findById(req.params.id)

        .count()
        .then(count => {

            if (count < 1) {
                return res.status(422).json(
                    {
                        code: 422,
                        reason: 'ERROR',
                        message: `${req.params.id} does not exist`,
                        location: `${req.params.id}`
                    })
            }

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
        })
})


/* CREATE NEW FAVORITE */
router.post('/favs', jsonParser, jwtAuth, (req, res) => {
    const requiredFields = ['userRef', 'resturantName', 'resturantYelpId', 'resturantAlias']

    const missingField = requiredFields.find(field => !(field in req.body))

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: 'Field is missing',
            location: missingField
        }).end();
    }

    const trimFields = ['resturantName', 'resturantYelpId', 'resturantAlias'];
    const untrimmbedField = trimFields.find(field => req.body[field].trim() !== req.body[field]);

    if (untrimmbedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: 'Field cannot start or end with whitespace!',
            location: `${untrimmbedField}`
        }).end();
    }

    userDataModel.findById(req.body.userRef, function (err, _user) {
        req.body.userRef = _user;
    })

        .then(_user => {
            if (!(_user)) {
                return res.status(400).json({
                    code: 400,
                    reason: 'ERROR',
                    message: `Username was not found`,
                    location: 'username'
                }).end();
            }
            else {
                userFavsModel.create({
                    userRef: req.body.userRef,
                    resturantName: req.body.resturantName,
                    resturantCost: req.body.resturantCost,
                    resturantYelpId: req.body.resturantYelpId,
                    resturantAlias: req.body.resturantAlias
                })

                    .then(result => {
                        res.status(201).json(result.cleanUp())
                    })

                    .catch(err => {
                        console.error(err)
                        return res.status(500).json({
                            code: 500,
                            reason: 'ERROR',
                            message: `Something went wrong`,
                            location: ''
                        })
                    })
            }

        })

        .catch(err => {
            console.error(err)
            return res.status(500).json({
                code: 500,
                reason: 'ERROR',
                message: `Something went wrong, unable to POST`,
                location: ''
            })
        })

})

/* EDIT FAVORITE */
router.patch('/favs/:id', jsonParser, jwtAuth, (req, res) => {
    const requiredFields = ['id']
    const missingField = requiredFields.find(field => !(field in req.body))

    if (missingField) {
        return res.status(422).json(
            {
                code: 422,
                reason: 'ERROR',
                message: `${missingField} field is not present`,
                location: `${missingField}`
            });
    }

    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        return res.status(422).json(
            {
                code: 422,
                reason: 'ERROR',
                message: 'req.params.id and req.body.id must match',
                location: 'req.params.id or req.body.id'
            });
    }

    const toUpdate = {};
    const updateAllowed = ['resturantName', 'resturantCost'];

    updateAllowed.forEach(data => {
        if (data in req.body) {
            toUpdate[data] = req.body[data]
        }
    });

    userFavsModel.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true }, function () {
        return res.status(200).json(
            {
                code: 200,
                reason: 'SUCCESS',
                message: 'User favorite has been updated',
                location: 'User Favorite'
            });
    })

})

/* DELETE FAVORITE */
router.delete('/favs/:id', jwtAuth, (req, res) => {

    return userFavsModel.findById(req.params.id)

        .count()
        .then(count => {

            if (count < 1) {

                return res.status(422).json(
                    {
                        code: 422,
                        reason: 'ERROR',
                        message: `${req.params.id} does not exist`,
                        location: `${req.params.id}`
                    });

            }

            userFavsModel.findByIdAndRemove(req.params.id, function () {
                res.json({ "code": "200", "reason": "SUCCESS", "location": "", "message": `User record has been removed` })
                return res.status(200).json(
                    {
                        code: 200,
                        reason: 'SUCCESS',
                        message: `${req.params.id} record has been removed`,
                        location: `${req.params.id}`
                    });
            })

                .catch(err => {
                    console.error(err)
                    return res.status(500).json({
                        code: 500,
                        reason: 'ERROR',
                        message: `An error occurred while deleting the record`,
                        location: ''
                    })
                })
        })

})




module.exports = router;