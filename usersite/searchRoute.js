'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const {YELP_TOKEN} = require('../config');

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
    
    searchResturants: function() {
        return request({
            method: 'GET',
            url: 'https://api.yelp.com/v3/businesses/search?' + yelpSearchCall.location + yelpSearchCall.term + yelpSearchCall.categories,
            json: true,
            headers: 
                {
                Authorization: YELP_TOKEN
                }
         })
    }
}

function yelpSearchApi(params) {
    console.log ('params: ', params)
    yelpSearchCall.location = params.location
    yelpSearchCall.term = params.term

    return yelpSearchCall.searchResturants()
        
}
/*END - GENERAL RESTURANT SEARCH CALL AND FUNCTION*/ 



/*SPECIFIC RESTURANT DETAIL CALL AND FUNCTION*/ 
let yelpDetailCall = {
    token: YELP_TOKEN,
    favYelpId: null,
    
    searchResturants: function() {
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
    console.log ('params: ', params)
    yelpDetailCall.favYelpId = params.favYelpId

    return yelpDetailCall.searchResturants()
        
}
/*END - SPECIFIC RESTURANT DETAIL CALL AND FUNCTION*/ 


/*ENDPOINT FOR GENERAL SEARCH USING NAME AND ZIP*/
router.post('/search', jsonParser, (req, res) => {

    let location = req.body.resturantZip
    let term = req.body.resturantName

    console.log('location: ', location, 'term: ',term)

    yelpSearchApi({location: `location=${location}`, term: `&term=${term}`})
    
   .then(result => {
           console.log('GENERAL SEARCH USING NAME AND ZIP')
           return res.json(result)
       }
   ) 

})


/*ENDPOINT FOR SPECIFIC RESTURANT DETAIL SEARCH*/ 
router.post('/search/:id', jsonParser, (req, res) => {

    let favYelpId = req.body.favYelpId

    console.log('favYelpId: ', favYelpId)

    yelpDetailApi({favYelpId: `${favYelpId}`})
    
   .then(result => {
           console.log('SPECIFIC RESTURANT DETAIL SEARCH')
           return res.json(result)
       }
   ) 

})




module.exports = router;