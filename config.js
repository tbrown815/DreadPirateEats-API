'use strict';

//exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/dreadpirateeats';
exports.DATABASE_URL = 'mongodb://localhost/dreadpirateeats';


exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-dreadpirateeats';


exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE || '5d';