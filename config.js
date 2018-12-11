'use strict';

//exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/dreadpirateeats';
exports.DATABASE_URL = process.env.DATABASE_URL;

//exports.DATABASE_URL = 'mongodb://localhost/dreadpirateeats';

//exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-dreadpirateeats';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;


exports.PORT = process.env.PORT || 8080;

exports.YELP_TOKEN = process.env.YELP_TOKEN;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE || '5d';

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN

//module.exports = {CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'};

//module.exports = {CLIENT_ORIGIN: '*'};

//exports.CLIENT_ORIGIN = 'http://localhost:3000'

//exports.CLIENT_ORIGIN = 'https://shielded-eyrie-90605.herokuapp.com'
