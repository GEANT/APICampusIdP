'use strict';
const app = require('../../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Provider = require('../../models/Provider');
const jwt = require('jsonwebtoken');
const sampleData = require('../sample_data');


describe('/users', () => {

    before((done) => {
        User.find().remove(done);
    });

    before((done) => {
        mongoose.connection.collections.users.drop(() => {
            done();
        });
    });

    context('Users', () => {
        context('Registration', () => {
            it('Invalid data', (done) => {
                request(app)
                    .post('/users')
                    .set('Content-type', 'applicationf/ld+json')
                    .send()
                    .expect(404)
                    .end((err, res) => {


                        console.log('df');
                        console.log(res);


                            done();

                    });
                //done();
            });
        });
    });
});
