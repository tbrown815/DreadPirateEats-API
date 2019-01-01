'use strict';

const chai = require('chai');

const chaiHttp = require('chai-http');

const faker = require('faker');

const mongoose = require('mongoose');

const expect = chai.expect;

const {userDataModel, userFavsModel} = require('../models')

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
        "username" : "ricksanchez",
        "password" : "$2a$10$lSCYj7sGs/8IxFvH2KHY5ecVgreWXpi6OEvhOK7UqqyCKGMK95i1y",
        "email" : "test@test.com"
    }
]

let testRestaurantData = [
    {
        "restaurantName" : "Best Bison",
        "restaurantYelpId" : "XY2gaLVR4UPHb9n0qP_TqA",
        "restaurantAlias" : "best-bison-omaha-3"
    },
    {
        "restaurantName" : "Chucks Restaurant",
        "restaurantYelpId" : "VXDUsmrsjYAT8FTGQ0gfwg",
        "restaurantAlias" : "chucks-restaurant-des-moines"
    },
    {
        "restaurantName" : "Cooper's On 5th",
        "restaurantYelpId" : "gbd0C2IfDBsk_Z-R9NcVDw",
        "restaurantAlias" : "coopers-on-5th-west-des-moines"
    },
    {
        "restaurantName" : "HuHot Mongolian Grill",
        "restaurantYelpId" : "GPVDUx06qpXrJ-zTgv_VPw",
        "restaurantAlias" : "huhot-mongolian-grill-west-des-moines"
    },
    {
        "restaurantName" : "Sam & Gabes",
        "restaurantYelpId" : "Xj8ve8_47C_1SDVN1cKIsg",
        "restaurantAlias" : "sam-and-gabes-urbandale"
    },
    {
        "restaurantName" : "Tasty Tacos",
        "restaurantYelpId" : "LzaLzKOa2MLraVxztxmy-A",
        "restaurantAlias" : "tasty-tacos-urbandale"
    },
    {
        "restaurantName" : "California Tacos & More",
        "restaurantYelpId" : "FyC4FzmUwHSK5pFS1EhP1g",
        "restaurantAlias" : "california-tacos-and-more-omaha"
    },
    {
        "restaurantName" : "Dinosaur Bar-B-Que",
        "restaurantYelpId" : "rg941Qb9wA7_AM_TwO9OAg",
        "restaurantAlias" : "dinosaur-bar-b-que-stamford"
    },
    {
        "restaurantName" : "Caribbean Restaurant",
        "restaurantYelpId" : "hXlJOg894rFKIgWhaCWwfw",
        "restaurantAlias" : "caribbean-restaurant-rome"
    },
    {
        "restaurantName" : "The Flying Elk",
        "restaurantYelpId" : "VZUrYnDCTroPt7TQ_0mA2A",
        "restaurantAlias" : "the-flying-elk-stockholm"
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
/*
    //USER TESTS
    describe('USERS IS ABLE TO LOGIN', function () {

        it('USER LOGIN, JWT RECEIVED ON SUCCESS', function () {

            console.log('credentials: ', loginCredentials)

            return chai.request(app)
                .post(`/userAuth/login`)
                .send(loginCredentials)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body).to.have.all.keys('authToken')
                    expect(res.body.authToken).to.have.lengthOf.at.least(1);
                    expect(res.body.authToken).to.be.a('string');
                    console.info('authToken: ', res.text)
                })

        })
    });

        describe('CREATE USER TEST SET', function () {

            it('POST CALL TO CREATE NEW USER', function () {

                const genData = generateData();

                console.log('genData: ', genData)

                return chai.request(app)
                
                .post('/userAccess/new/')

                    .send(genData)

                    .then(function (res) {
                        expect(res).to.have.status(201);
                        expect(res).to.be.json;
                        expect(res).to.be.a('object');
                        expect(res.body).to.have.all.keys('authToken')
                        expect(res.body.authToken).to.have.lengthOf.at.least(1);
                        expect(res.body.authToken).to.be.a('string');

                        console.info('authToken: ', res.text)

                        let userName = genData.username
                        return userName
 
                    })
                    .then(function (userName) {
                        return chai.request(app)
                        .get(`/userAccess/gettoken/${userName}`)
                        
                    })                        
                    .then(function (res) {
                        expect(res.body.id).to.be.a('string');
                        expect(res.body.id).to.have.lengthOf.at.least(1);

                        let userTokenId =  res.body.id

                        return userTokenId

                    })
                    .then(function (userTokenId) {

                        console.log('userTokenId: ', userTokenId)

                        return chai.request(app) 

                        .get(`/userAccess/${userTokenId}`)
                  
                    })
                    .then(function (res) {
                        expect(res.body.id).to.be.a('string');
                        expect(res.body.username).to.equal(genData.username);
                        expect(res.body.username).to.be.a('string');
                        expect(res.body.email).to.equal(genData.email);
                        expect(res.body.email).to.have.lengthOf.at.least(1);
                        expect(res.body.email).to.be.a('string');
                        expect(res.body.email).to.have.string('@');
                        expect(res.body.email).to.have.string('.');
                        console.info('res: ', res.body)

                    })
            })



        });//USERS TEST BLOCK END


    // FAVS TEST BLOCK

    describe('FAVORITES TEST SET', function () {


        it('SEARCH FOR AND CREATE NEW FAVORITE', function () {

            let foodDataRandom = Math.floor(Math.random() * parseInt(testFoodData.length)) + 0;
            let sortDataRandom = Math.floor(Math.random() * parseInt(testSortData.length)) + 0;
            let zipDataRandom = Math.floor(Math.random() * parseInt(testZipCodes.length)) + 0;

            const foodData = testFoodData[foodDataRandom]
            const sortData = testSortData[sortDataRandom]
            const zipData = testZipCodes[zipDataRandom];
            
            const searchPayload = {
                "restaurantZip": zipData,
                "restaurantName": foodData,
                "publicSort": sortData
            }

            console.log('searchPayload: ', searchPayload)

            return chai.request(app)
                .post('/userSite/search/')
                .send(searchPayload)
                .then(function (res) {

                    console.log('res.body: ', res.body.businesses[0])
                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body).to.not.be.null;

                    let newFavData = {
                        "userRef": userData._id,
                        "restaurantName": res.body.businesses[0].name,
                        "restaurantYelpId": res.body.businesses[0].id,
                        "restaurantAlias": res.body.businesses[0].alias
                    }

                    return newFavData

                })
                .then(function (newFavData) {
                    console.log('newFavData: ', newFavData)

                    return chai.request(app)
                    .post('/userSite/favs/')
                    .set('Authorization', `Bearer ${testToken}`)
                    .set('Content-Type', 'application/json')
                    .send(newFavData)
                    .then(function(res) {
                        console.log('Create New res.body: ', res.body)

                        expect(res).to.have.status(201);
                        expect(res).to.be.a('object');
                        expect(res.body).to.not.be.null;
                        expect(res.body.id).to.be.a('string');
                        expect(res.body.id).to.have.lengthOf.at.least(1);
                        expect(res.body.userRef).to.equal(userData.username)
                        expect(res.body.userRef).to.be.a('string');
                        expect(res.body.userRef).to.have.lengthOf.at.least(1);
                        expect(res.body.restaurantName).to.equal(newFavData.restaurantName)
                        expect(res.body.restaurantName).to.be.a('string');
                        expect(res.body.restaurantName).to.have.lengthOf.at.least(1);
                        expect(res.body.restaurantAlias).to.equal(newFavData.restaurantAlias)
                        expect(res.body.restaurantAlias).to.be.a('string');
                        expect(res.body.restaurantAlias).to.have.lengthOf.at.least(1);
                        expect(res.body.restaurantYelpId).to.equal(newFavData.restaurantYelpId)
                        expect(res.body.restaurantYelpId).to.be.a('string');
                        expect(res.body.restaurantYelpId).to.have.lengthOf.at.least(1);


                    })

                })
        })

        it('REQUEST USER FAVS BY USERTOKEN', function () {

            const userTokenId = userData._id;

            return chai.request(app)
                .get(`/userSite/user/${userTokenId}`)
                .set('Authorization', `Bearer ${testToken}`)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.userFavs[0]).to.have.all.keys('id', 'userRef', 'restaurantName', 'restaurantAlias', 'restaurantYelpId')
                    expect(res.body.userFavs[0].id).to.have.lengthOf.at.least(1);
                    expect(res.body.userFavs[0].id).to.be.a('string');
                    expect(res.body.userFavs[0].userRef).to.have.lengthOf.at.least(1);
                    expect(res.body.userFavs[0].userRef).to.be.a('string');
                    expect(res.body.userFavs[0].restaurantName).to.have.lengthOf.at.least(1);
                    expect(res.body.userFavs[0].restaurantName).to.be.a('string');
                    expect(res.body.userFavs[0].restaurantAlias).to.have.lengthOf.at.least(1);
                    expect(res.body.userFavs[0].restaurantAlias).to.be.a('string');
                    expect(res.body.userFavs[0].restaurantYelpId).to.have.lengthOf.at.least(1);
                    expect(res.body.userFavs[0].restaurantYelpId).to.be.a('string');
                    console.log('res.body.userFavs[0]: ', res.body.userFavs[0])
                 })

        })


        it('DELETE A USER FAVORITE AND VERIFY DELETE', function () {

            const favID = favData._id;

            return chai.request(app)
                .delete(`/userSite/favs/${favID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(favID)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                    expect(res.body.reason).to.have.string('SUCCESS');
                    expect(res.body.message).to.have.string(`${favData._id} record has been removed`);
                  console.log('res.body: ', res.body)
                }).then(function () {

                    return chai.request(app)
                        .get(`/userSite/favs/${favID}`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .set('Content-Type', 'application/json')
                        .then(function (res) {

                           expect(res).to.have.status(410);
                           expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message')
                           expect(res.body.reason).to.have.string('ERROR');
                           expect(res.body.message).to.have.string(`${favData._id} does not exist`);
                          console.log('res.body: ', res.body)

                        })
                })

        })


        it('EDIT A USER FAV', function () {

            const favID = favData._id;

            let newVal = {
                id: favData._id,
                resturantName: faker.company.companyName(),

            };

            return chai.request(app)
                .patch(`/userSite/favs/${favID}`)
                .set('Authorization', `Bearer ${testToken}`)
                .set('Content-Type', 'application/json')
                .send(newVal)
                .then(function (res) {

                    expect(res).to.have.status(200);
                    expect(res.body).to.have.all.keys('code', 'reason', 'location', 'message');
                    expect(res.body.reason).to.have.string('SUCCESS');
                    expect(res.body.message).to.have.string('User favorite has been updated');

                }).then(function () {

                    return chai.request(app)
                        .get(`/userSite/favs/${favID}`)
                        .set('Authorization', `Bearer ${testToken}`)
                        .then(function (res) {

                            expect(res).to.have.status(200);
                            expect(res).to.be.a('object');
                            expect(res.body).to.have.all.keys('id', 'userRef', 'restaurantName', 'restaurantAlias', 'restaurantYelpId')
                            expect(res.body.id).to.have.lengthOf.at.least(1);
                            expect(res.body.id).to.be.a('string');
                            expect(res.body.userRef).to.have.lengthOf.at.least(1);
                            expect(res.body.userRef).to.be.a('string');
                            expect(res.body.restaurantName).to.have.lengthOf.at.least(1);
                            expect(res.body.restaurantName).to.be.a('string');
                            expect(res.body.restaurantAlias).to.have.lengthOf.at.least(1);
                            expect(res.body.restaurantAlias).to.be.a('string');
                            expect(res.body.restaurantYelpId).to.have.lengthOf.at.least(1);
                            expect(res.body.restaurantYelpId).to.be.a('string');
                            console.log('res.body.userFavs[0]: ', res.body)
                         })
                })

        });
        
    })// END FAVS TEST BLOCK


    //TEST RESOURCES END
    */
});