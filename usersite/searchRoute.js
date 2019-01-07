'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const { YELP_TOKEN } = require('../config');

const router = express.Router();
const passport = require('passport');
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });
const request = require('request-promise');


/*GENERAL RESTURANT SEARCH CALL AND FUNCTION*/
let yelpSearchCall = {
    token: YELP_TOKEN,
    location: null,
    term: null,
    categories: '&categories=restaurants',
    sort_by: null,

    searchResturants: function () {
        return request({
            method: 'GET',
            url: 'https://api.yelp.com/v3/businesses/search?' + yelpSearchCall.location + yelpSearchCall.term + yelpSearchCall.categories + yelpSearchCall.sort_by,
            json: true,
            headers:
            {
                Authorization: YELP_TOKEN
            }
        })
    }
}

function yelpSearchApi(params) {

    yelpSearchCall.location = params.location
    yelpSearchCall.term = params.term
    yelpSearchCall.sort_by = params.sort_by

    return yelpSearchCall.searchResturants()

}
/*END - GENERAL RESTURANT SEARCH CALL AND FUNCTION*/



/*SPECIFIC RESTURANT DETAIL CALL AND FUNCTION*/
let yelpDetailCall = {
    token: YELP_TOKEN,
    favYelpId: null,

    searchResturants: function () {
        return request({
            method: 'GET',
            url: 'https://api.yelp.com/v3/businesses/' + yelpDetailCall.favYelpId,
            json: true,
            headers:
            {
                Authorization: YELP_TOKEN
            }
        })
    }
}

function yelpDetailApi(params) {

    yelpDetailCall.favYelpId = params.favYelpId

    return yelpDetailCall.searchResturants()

}
/*END - SPECIFIC RESTURANT DETAIL CALL AND FUNCTION*/


/*ENDPOINT FOR GENERAL SEARCH USING NAME AND ZIP*/
router.post('/search', jsonParser, (req, res) => {


    const requiredFields = ['restaurantZip', 'restaurantName', 'publicSort']

    const missingField = requiredFields.find(field => !(field in req.body))

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ERROR',
            message: 'Field is missing',
            location: missingField
        }).end();
    }

    let location = req.body.restaurantZip
    let term = req.body.restaurantName
    let sort_by = req.body.publicSort

    yelpSearchApi({ location: `location=${location}`, term: `&term=${term}`, sort_by: `&sort_by=${sort_by}` })

        .then(result => {
            return res.json(result)
        }
        )

})


/*ENDPOINT FOR SPECIFIC RESTURANT DETAIL SEARCH*/
router.post('/search/:id', jsonParser, (req, res) => {

    let favYelpId = req.body.favYelpId


    yelpDetailApi({ favYelpId: `${favYelpId}` })

        .then(result => {

            return res.json(result)
        }
        )

})




module.exports = router;