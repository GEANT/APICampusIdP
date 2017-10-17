'use strict';
const app = require('../../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Provider = require('../../models/Provider');
const sampleData = require('../sample_data');

const sampleUser = sampleData.sampleUser;
const validUserInput = sampleData.validUserInput;
const newIDPConfInput = sampleData.newIDPConfInput;


let invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
let validToken;

describe('API /idp', () => {

    before((done) => {
        User.find().remove(done);
    });
    before((done) => {
        mongoose.connection.collections.users.drop(() => {
            done();
        });
    });
    before((done) => {
        mongoose.connection.collections.providers.drop(() => {
            done();
        });
    });
    before((done) => {
        let user = new User(sampleUser);
        user.save().then(() => {
            assert(!user.isNew);
            done();
        });
    });


    beforeEach((done) => {
        validToken = null;
        request(app)
            .post('/authenticate')
            .send(validUserInput)
            .expect(200)
            .expect("Content-type", /json/)
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    var result = JSON.parse(res.text);
                    validToken = result.token;
                    // console.log(JSON.stringify(validToken));
                    done();
                }
            });
    });


    before(() => {
        console.log('BEFORE 2');
    });

    context('GET /idp/:name/:filter', () => {

        beforeEach(() => {
            console.log('BEFOREEACH 2');
        });
        before(() => {
            console.log('BEFORE 3');
        });
        xit('GET /idp/:name with missing JWT', (done) => {
            done();
        });
        xit('GET /idp/:name with incorrect JWT', (done) => {
            done();
        });
        xit('GET /idp/:name existing IDP with correct JWT', (done) => {
            done();
        });
        xit('GET /idp/:name where IDP does not exist', (done) => {

            done();
        })
    });
    context('Create new IDP', () => {
        it('POST /idp with missing Authorization header', (done) => {
            request(app)
                .post('/idp')
                .expect(401)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });

        });
        it('POST /idp by providing Authorization header but missing Bearer token', (done) => {
            request(app)
                .post('/idp')
                .set('Authorization', 'Bddd')
                .expect(401)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });

        });
        it('POST /idp with incorrect Bearer token (invalid JWT)', (done) => {
            request(app)
                .post('/idp')
                .set('Authorization', 'Bearer ' + invalidToken)
                .expect(401)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });

        });

        context('POST /idp with correct JWT : Scenarios', () => {
            it('Request with usupported media type', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'applicationf/ld+json')
                    .send('{ "sdfsdf": "ddd"}')
                    .expect(415)
                    .end((err, res) => {
                        if (err) {
                            console.log('F@ ' + JSON.stringify(JSON.parse(res.text)));
                            done(err);
                        }
                        else {
                            done();
                        }
                    });
            });
            xit('incorrect input #1', (done) => {

            });
            xit('incorrect input #2', (done) => {

            });
            xit('correct input but IDP already exists ', (done) => {
                done();
            });
            xit('correct input data - expect successful creation', (done) => {
                done();
            });
        });


    });
    context('Update IDP', () => {
        xit('POST /idp with missing :name', (done) => {

        });
        xit('POST /idp/:name with missing JWT', (done) => {
            done();
        });
        xit('POST /idp/:name with incorrect JWT', (done) => {
            done();
        });
        xit('POST /idp/:name with correct JWT and incorrect data', (done) => {
            done();
        });
        xit('POST /idp/:name with correct JWT and input data but such IDP does not exist', (done) => {
            done();
        });
        xit('POST /idp/:name with correct JWT and input data - expect successful update', (done) => {
            done();
        });
    });

});


