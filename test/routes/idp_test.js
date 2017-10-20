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
const invalidIDPConfInput_1 = sampleData.invalidIDPConfInput_1;


let invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
let validToken;

describe('API /idp', () => {

    before((done) => {
        User.find().remove(done);
    });
    before((done) => {
        Provider.find().remove(done);
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


    context('GET /idp/:name/:filter', () => {


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
        context('Authorization', (done) => {
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
        });
        context('POST /idp with correct JWT : Scenarios', () => {

            it('#01 Request with usupported media type', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'applicationf/ld+json')
                    .send(newIDPConfInput)
                    .expect(415)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    });
            });
            it('#02 : syntaticaly incorrect input', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'application/ld+json')
                    .send('sdf }')
                    .expect(400)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    });


            });
            it('#03 incorrect input', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'application/ld+json')
                    .send(invalidIDPConfInput_1)
                    .expect(422)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    });


            });
            xit('#04 incorrect input', (done) => {

            });
            xit('#05 correct input but IDP already exists ', (done) => {
                done();
            });
            it('#06 correct input data - expect successful creation', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'application/ld+json')
                    .send(newIDPConfInput)
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        else {
                            expect(res.body.error).to.equal(false);
                            expect(res.body.message).to.equal('request received');
                            done();
                        }
                    });

            });
            // depends on previous test
            it('#07 correct input data - expect error as IDP already exist', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'application/ld+json')
                    .send(newIDPConfInput)
                    .expect(409)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        else {
                            expect(res.body.error).to.equal(true);
                            expect(res.body.message).to.equal('host already exist');
                            done();
                        }
                    });

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


