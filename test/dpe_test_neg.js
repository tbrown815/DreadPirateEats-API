'use strict';

const chai = require('chai');

const chaiHttp = require('chai-http');

const faker = require('faker');

const mongoose = require('mongoose');

const expect = chai.expect;

const { userDataModel, userFavsModel } = require('../models')

const { app, startServer, stopServer } = require('../server');

const config = require('../config');

let userData;

let loginCredentials = {
    username: "ricksanchez",
    password: "test9033"
}

let favData;

let testToken;

let testLoginUserData = [
    {
        "username": "ricksanchez",
        "password": "$2a$10$lSCYj7sGs/8IxFvH2KHY5ecVgreWXpi6OEvhOK7UqqyCKGMK95i1y",
        "email": "test@test.com"
    }
]

let testRestaurantData = [
    {
        "restaurantName": "Best Bison",
        "restaurantYelpId": "XY2gaLVR4UPHb9n0qP_TqA",
        "restaurantAlias": "best-bison-omaha-3"
    },
    {
        "restaurantName": "Chucks Restaurant",
        "restaurantYelpId": "VXDUsmrsjYAT8FTGQ0gfwg",
        "restaurantAlias": "chucks-restaurant-des-moines"
    },
    {
        "restaurantName": "Cooper's On 5th",
        "restaurantYelpId": "gbd0C2IfDBsk_Z-R9NcVDw",
        "restaurantAlias": "coopers-on-5th-west-des-moines"
    },
    {
        "restaurantName": "HuHot Mongolian Grill",
        "restaurantYelpId": "GPVDUx06qpXrJ-zTgv_VPw",
        "restaurantAlias": "huhot-mongolian-grill-west-des-moines"
    },
    {
        "restaurantName": "Sam & Gabes",
        "restaurantYelpId": "Xj8ve8_47C_1SDVN1cKIsg",
        "restaurantAlias": "sam-and-gabes-urbandale"
    },
    {
        "restaurantName": "Tasty Tacos",
        "restaurantYelpId": "LzaLzKOa2MLraVxztxmy-A",
        "restaurantAlias": "tasty-tacos-urbandale"
    },
    {
        "restaurantName": "California Tacos & More",
        "restaurantYelpId": "FyC4FzmUwHSK5pFS1EhP1g",
        "restaurantAlias": "california-tacos-and-more-omaha"
    },
    {
        "restaurantName": "Dinosaur Bar-B-Que",
        "restaurantYelpId": "rg941Qb9wA7_AM_TwO9OAg",
        "restaurantAlias": "dinosaur-bar-b-que-stamford"
    },
    {
        "restaurantName": "Caribbean Restaurant",
        "restaurantYelpId": "hXlJOg894rFKIgWhaCWwfw",
        "restaurantAlias": "caribbean-restaurant-rome"
    },
    {
        "restaurantName": "The Flying Elk",
        "restaurantYelpId": "VZUrYnDCTroPt7TQ_0mA2A",
        "restaurantAlias": "the-flying-elk-stockholm"
    }
]

const testFoodData = ['steak', 'BBQ', 'indian', 'sports', 'buffet', 'cofee', 'korean', 'bbq', 'fish', 'salad', 'Shake', 'diner', 'taco', 'sushi', 'chineese', 'chicken', 'breakfast', 'Fries', 'Pizza', 'burger']

const testSortData = ['rating', 'review_count', 'distance']

//Due to fakers tendency to return non-existent zip codes
const testZipCodes = ['60615', '10027', '30319', '92118', '78223', '84132', '32827', '85026', '80220', '97228']

chai.use(chaiHttp);

//Load data to test login call
function createLoginData() {
    console.info('login user data is being loaded');

    const testLoginData = [];

    for (let i = 0; i < 1; i++) {
        testLoginData.push(loadLoginData(testLoginUserData[i]));

        return userDataModel.insertMany(testLoginData);
    }
}

function loadLoginData(testLoginUserData) {

    const id = require('mongoose').Types.ObjectId();

    return {
        _id: id,
        username: testLoginUserData.username,
        password: testLoginUserData.password,
        email: testLoginUserData.email
    }
};


//Create test data for User Collection
function populateTestData() {
    console.info('test user data is being created');
    const testData = [];

    for (let i = 0; i < 1; i++) {
        testData.push(generateData());

        userData = testData[0];

        return userDataModel.insertMany(testData);
    }
};

function populateEmptyUser(emptyUserData) {
    const emptyTestData = []

    emptyTestData.push(emptyUserData)

    return userDataModel.insertMany(emptyTestData);
}

function generateData() {

    const id = require('mongoose').Types.ObjectId();

    return {
        _id: id,
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email()
    }
};

//Create test data for Favs Collection
function populateTestFavData() {
    console.info('test favorite data is being created');
    const testfavData = [];

    for (let i = 0; i < 10; i++) {
        testfavData.push(genUserFavs(testRestaurantData[i]));

        favData = testfavData[0];

        return userFavsModel.insertMany(testfavData);

    }
};

function genUserFavs(testRestaurant) {

    const id = require('mongoose').Types.ObjectId();

    return {
        _id: id,
        userRef: userData._id,
        restaurantName: testRestaurant.restaurantName,
        restaurantAlias: testRestaurant.restaurantAlias,
        restaurantYelpId: testRestaurant.restaurantYelpId

    }
};


function genJWT() {

    const jwt = require('jsonwebtoken');

    const username = userData.username;
    const password = userData.password;

    let user = { username: username, password: password };

    let token = jwt.sign(
        {
            user: {
                username,
                password
            }
        },
        config.JWT_SECRET,
        {
            subject: user.username,
            expiresIn: config.JWT_EXPIRE,
            algorithm: 'HS256'
        }
    );

    testToken = token;
};




function resetDB() {
    console.warn('DB will be deleted and reset');
    return mongoose.connection.dropDatabase();
};

describe('Test Resources', function () {

    //BEFORE - RUNS TO START SERVER
    before(function () {
        return startServer(config.TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return createLoginData();
    })

    beforeEach(function () {
        return populateTestData();
    });

    beforeEach(function () {
        return populateTestFavData();
    })

    beforeEach(function () {
        return genJWT();
    })

    afterEach(function () {
        return resetDB();
    });

    after(function () {
        return stopServer();
    });


    //STATIC PAGE CHECKS
    describe('BASIC CONNECT TEST SET', function () {

        it('basic connectivity should return typeof html and status 200', function () {
            return chai.request(app)
                .get('/')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.html;
                })
        })

    });

    //USER TESTS
    describe('USER TEST SET', function () {

        it('USER UNABLE TO LOGIN RCVS 401 AND EXPECTED ERROR', function () {

            let badUserCredentials = {
                username: "ricksanchezz",
                password: "test9033"
            }

            return chai.request(app)
                .post(`/userAuth/login`)
                .send(badUserCredentials)
                .then(function (res) {
                    console.log('res: ', res.error.status, res.error.text)
                    expect(res.error).to.have.any.keys('status', 'text')
                    expect(res).to.have.status(401);
                    expect(res.error.status).to.equal(401);
                    expect(res.error.text).to.have.string(`Unauthorized`);
                })
                .then(function () {

                    let badPassCredentials = {
                        username: "ricksanchez",
                        password: "test1099"
                    }
                    return chai.request(app)
                        .post(`/userAuth/login`)
                        .send(badPassCredentials)
                        .then(function (res) {
                            expect(res.error).to.have.any.keys('status', 'text')
                            expect(res).to.have.status(401);
                            expect(res.error.status).to.equal(401);
                            expect(res.error.text).to.have.string(`Unauthorized`);
                            console.log('res.body: ', res.error.status, res.error.text)
                        })

                })
        })
    })

    describe('CREATE USER TEST SET', function () {

        it('POST CALL TO CREATE NEW USER - FIELDS ARE MISSING FROM REQUEST', function () {

            const badUsernameData = {
                password: faker.internet.password(),
                email: faker.internet.email()
            }

            console.log('badUsernameData: ', badUsernameData)

            return chai.request(app)

                .post('/userAccess/new/')

                .send(badUsernameData)

                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('is missing from request.');
                    console.info('res: ', res.body)

                })
                .then(function () {

                    const badPasswordData = {
                        username: faker.internet.userName(),
                        email: faker.internet.email()
                    }

                    console.log('badPasswordData: ', badPasswordData)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(badUsernameData)
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('is missing from request.');
                    console.info('res: ', res.body)
                })
                .then(function () {

                    const badEmailData = {
                        username: faker.internet.userName(),
                        password: faker.internet.password(),
                    }

                    console.log('badEmailData: ', badEmailData)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(badEmailData)
                })
                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.message).to.have.string('is missing from request.');
                    console.info('res: ', res.body)
                })
        })

        it('POST CALL TO CREATE NEW USER - FIELDS HAVE WHITESPACE', function () {

            const badUsernameData = {
                username: faker.internet.userName() + ' ',
                password: faker.internet.password(),
                email: faker.internet.email()
            }

            console.log('badUsernameData: ', badUsernameData)

            return chai.request(app)

                .post('/userAccess/new/')

                .send(badUsernameData)

                .then(function (res) {
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('username');
                    expect(res.body.message).to.have.string('cannot contain whitespace.');
                    console.info('res: ', res.body)

                })
                .then(function () {

                    const badPasswordData = {
                        username: faker.internet.userName(),
                        password: ' ' + faker.internet.password(),
                        email: faker.internet.email()
                    }

                    console.log('badPasswordData: ', badPasswordData)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(badPasswordData)
                })
                .then(function (res) {
                    console.info('res: ', res.body)
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('password');
                    expect(res.body.message).to.have.string('cannot contain whitespace.');
                })
                .then(function () {

                    const badEmailData = {
                        username: faker.internet.userName(),
                        password: faker.internet.password(),
                        email: ' ' + faker.internet.email() + ' '
                    }

                    console.log('badEmailData: ', badEmailData)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(badEmailData)
                })
                .then(function (res) {
                    console.info('res: ', res.body)
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('email');
                    expect(res.body.message).to.have.string('cannot contain whitespace.');
                })
        })

        it('POST CALL TO CREATE NEW USER - USERNAME OR PASSWORD FIELD LENGTH IS BAD', function () {

            const userTooShort = {
                username: 'abc',
                password: faker.internet.password(),
                email: faker.internet.email()
            }

            console.log('userTooShort: ', userTooShort)

            return chai.request(app)

                .post('/userAccess/new/')

                .send(userTooShort)

                .then(function (res) {
                    console.info('res: ', res.body)
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('username');
                    expect(res.body.message).to.have.string('must be a minimum of 4 characters long');

                })
                .then(function () {

                    const userTooLong = {
                        username: 'abcdefghijklmnopqrstuvwxyz12345',
                        password: faker.internet.password(),
                        email: faker.internet.email()
                    }

                    console.log('userTooLong: ', userTooLong)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(userTooLong)
                })
                .then(function (res) {
                    console.info('res: ', res.body)
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('username');
                    expect(res.body.message).to.have.string('Cannot be longer than 30 characters');
                })//PASS
                .then(function () {

                    const passTooShort = {
                        username: faker.internet.userName(),
                        password: 'abcd124',
                        email: faker.internet.email()
                    }

                    console.log('passTooShort: ', passTooShort)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(passTooShort)
                })
                .then(function (res) {
                    console.info('res: ', res.body)
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('password');
                    expect(res.body.message).to.have.string('must be a minimum of 8 characters long');
                })
                .then(function () {

                    const passTooLong = {
                        username: faker.internet.userName(),
                        password: 'abcdefghijklmnopqrstuvwxyz12345abcdefghijklmnopqrstuvwxyz12345',
                        email: faker.internet.email()
                    }

                    console.log('passTooLong: ', passTooLong)

                    return chai.request(app)

                        .post('/userAccess/new/')

                        .send(passTooLong)
                })
                .then(function (res) {
                    console.info('res: ', res.body)
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string('password');
                    expect(res.body.message).to.have.string('Cannot be longer than 60 characters');
                })

        })


    });//USERS TEST BLOCK END


    // FAVS TEST BLOCK

    describe('FAVORITES TEST SET', function () {


        it('SEARCH FOR RESTAURANT RETURNS ERROR DUE TO MISSING FIELD', function () {

            let foodDataRandom = Math.floor(Math.random() * parseInt(testFoodData.length)) + 0;
            let sortDataRandom = Math.floor(Math.random() * parseInt(testSortData.length)) + 0;
            let zipDataRandom = Math.floor(Math.random() * parseInt(testZipCodes.length)) + 0;

            const foodData = testFoodData[foodDataRandom]
            const sortData = testSortData[sortDataRandom]
            const zipData = testZipCodes[zipDataRandom];

            const badPayloadZip = {
                "restaurantName": foodData,
                "publicSort": sortData
            }

            console.log('searchPayload: ', badPayloadZip)

            return chai.request(app)
                .post('/userSite/search/')
                .send(badPayloadZip)
                .then(function (res) {

                    let parsedError = JSON.parse(res.error.text)
                    console.log('parsedError: ', parsedError)
                    expect(res).to.be.a('object');
                    expect(res).to.have.status(422);
                    expect(parsedError).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(parsedError.reason).to.have.string('ERROR');
                    expect(parsedError.location).to.have.string('restaurantZip');
                    expect(parsedError.message).to.have.string('Field is missing');

                    })
                    .then(function() {
                        const badPayloadName = {
                        "restaurantZip": zipData,
                        "publicSort": sortData
                        }
            
                        console.log('searchPayload: ', badPayloadName)
            
                        return chai.request(app)
                            .post('/userSite/search/')
                            .send(badPayloadName)
                    })
                    .then(function (res) {

                        let parsedError = JSON.parse(res.error.text)
                        console.log('parsedError: ', parsedError)
                        expect(res).to.be.a('object');
                        expect(res).to.have.status(422);
                        expect(parsedError).to.have.all.keys('code', 'reason', 'location', 'message')
                        expect(parsedError.reason).to.have.string('ERROR');
                        expect(parsedError.location).to.have.string('restaurantName');
                        expect(parsedError.message).to.have.string('Field is missing');
    
                        })
                        .then(function() {
                            const badPayloadSort = {
                            "restaurantZip": zipData,
                            "restaurantName": foodData
                            }
                
                            console.log('searchPayload: ', badPayloadSort)
                
                            return chai.request(app)
                                .post('/userSite/search/')
                                .send(badPayloadSort)
                        })
                        .then(function (res) {
    
                            let parsedError = JSON.parse(res.error.text)
                            console.log('parsedError: ', parsedError)
                            expect(res).to.be.a('object');
                            expect(res).to.have.status(422);
                            expect(parsedError).to.have.all.keys('code', 'reason', 'location', 'message')
                            expect(parsedError.reason).to.have.string('ERROR');
                            expect(parsedError.location).to.have.string('publicSort');
                            expect(parsedError.message).to.have.string('Field is missing');
        
                            })
                })

        it('REQUEST USER FAVS BY USERTOKEN - USER HAS NO FAVS', function () {

            const emptyUserData = generateData();

            populateEmptyUser(emptyUserData)

            console.log('emptyUserInfo: ', emptyUserData)

            return chai.request(app)
                .get(`/userSite/user/${emptyUserData._id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {
                    console.log('res.body: ', res.body)

                    expect(res).to.have.status(206);
                    expect(res).to.be.a('object');
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.equal('NO FAVORITES')
                    expect(res.body.location).to.equal(`${emptyUserData._id}`)
                    expect(res.body.message).to.equal(`Favorites not found for ${emptyUserData._id}`)
      
                })

        })


        it('DELETE A USER FAVORITE AND VERIFY DELETE', function () {

            const badFavID = require('mongoose').Types.ObjectId();
            ;

            return chai.request(app)
                .delete(`/userSite/favs/${badFavID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(badFavID)
                .then(function (res) {

                    expect(res).to.have.status(410);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('ERROR');
                    expect(res.body.location).to.have.string(`${badFavID}`);
                    expect(res.body.message).to.have.string(`${badFavID} does not exist`);
                    console.log('res.body: ', res.body)
                })
        })


        it('EDIT A USER FAV - MISSING ID OR ID AND REQ.BODY DO NOT MATCH', function () {

            const favID = favData._id;

            //"id": favID,
            const badFavIdPayload = {
                "restaurantName": faker.company.companyName()
            }

             return chai.request(app)
                .patch(`/userSite/favs/${favID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(badFavIdPayload)
                .then(function (res) {

                    let parsedError = JSON.parse(res.error.text)
                    console.log('parsedError: ', parsedError)
                    expect(res).to.have.status(422);
                    expect(parsedError).to.have.all.keys('code', 'reason', 'location', 'message');
                    expect(parsedError.reason).to.have.string('ERROR');
                    expect(parsedError.location).to.have.string('id');
                    expect(parsedError.message).to.have.string('id field is not present');

                }).then(function () {

                    const badFavIdMatchPayload = {
                        "id": favID + 12345,
                        "restaurantName": faker.company.companyName()
                    }
                    return chai.request(app)
                    .patch(`/userSite/favs/${favID}`)
                    .set('Authorization', `Bearer ${testToken}`)
                    .set('Content-Type', 'application/json')
                    .send(badFavIdMatchPayload)
                        .then(function (res) {

                    let parsedError = JSON.parse(res.error.text)
                    console.log('parsedError: ', parsedError)
                    expect(res).to.have.status(422);
                    expect(parsedError).to.have.all.keys('code', 'reason', 'location', 'message');
                    expect(parsedError.reason).to.have.string('ERROR');
                    expect(parsedError.location).to.have.string('req.params.id or req.body.id');
                    expect(parsedError.message).to.have.string('req.params.id and req.body.id must match');
                        })
                })

        });

    })// END FAVS TEST BLOCK


    //TEST RESOURCES END
});