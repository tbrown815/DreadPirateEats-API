'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { userDataModel, userFavsModel } = require('../models');

const {YELP_TOKEN} = require('../config');
const config = require('../config');

const router = express.Router();
const passport = require('passport');
const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });
const request = require('request-promise');

console.log('token: ', YELP_TOKEN)
console.log('configtoken: ', process.env.YELP_TOKEN)


let yelpCall = {
    token: YELP_TOKEN,
    location: null,
    term: null,
    categories: '&categories=restaurants',
    
    getResturant: function() {
        return request({
            method: 'GET',
            url: 'https://api.yelp.com/v3/businesses/search?' + yelpCall.location + yelpCall.term + yelpCall.categories,
            json: true,
            headers: 
                {
                Authorization: YELP_TOKEN_TMP
                }
         })
    }
}

function yelpApi(params) {
    console.log ('params: ', params)
    yelpCall.location = params.location
    yelpCall.term = params.term

    return yelpCall.getResturant()
        
}

router.post('/search', jsonParser, (req, res) => {

    let location = req.body.location
    let term = req.body.term

    console.log('location: ', location, 'term: ',term)

    console.log('YELP_TOKEN: ', YELP_TOKEN)

    yelpApi({location: `location=${location}`, term: `&term=${term}`})
    
   .then(result => {
           console.log('this is sparta')
           return res.json(result)
       }
   ) 

})




module.exports = router;