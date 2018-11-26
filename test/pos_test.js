'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const expect = chai.expect;
const {userDataModel, userFavsModel} = require('../models')
const {app, startServer, stopServer} = require('../server');
const config = require('../config');

chai.use(chaiHttp);

    /* STATIC PAGE CHECKS */
    describe('HTML TEST SET', function () {

        it('public should return typeof html and status 200', function () {
            return chai.request(app)
                .get('/')
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.html;
                })
        })
    });