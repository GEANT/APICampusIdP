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

const sampleUser = sampleData.sampleUser;
const sampleUser2 = sampleData.sampleUser2;
const validUserInput = sampleData.validUserInput;
const validUserInput2 = sampleData.validUserInput2;
const newIDPConfInput = sampleData.newIDPConfInput;
const invalidIDPConfInput_1 = sampleData.invalidIDPConfInput_1;
const invalidIDPConfInput_2 = sampleData.invalidIDPConfInput_2;


let invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
let validToken;
let validTokenUser2;

describe('/idp', () => {

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
    before((done) => {
        let user = new User(sampleUser2);
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
                    let result = JSON.parse(res.text);
                    validToken = result.token;
                    // console.log(JSON.stringify(validToken));
                    done();
                }
            });
    });
    beforeEach((done) => {
        validTokenUser2 = null;
        request(app)
            .post('/authenticate')
            .send(validUserInput2)
            .expect(200)
            .expect("Content-type", /json/)
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    let result = JSON.parse(res.text);
                    validTokenUser2 = result.token;
                    // console.log(JSON.stringify(validToken));
                    done();
                }
            });
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
            it('#04 incorrect input - missing hostname', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'application/ld+json')
                    .send(invalidIDPConfInput_2)
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
            it('#05  ');
            it('#06 correct input data - expect successful creation', (done) => {
                request(app)
                    .post('/idp')
                    .set('Authorization', 'Bearer ' + validToken)
                    .set('Content-type', 'application/ld+json')
                    .send(newIDPConfInput)
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res.body.error).to.equal(false);
                        expect(res.body.message).to.equal('request received');

                        let decodedToken = jwt.decode(validToken);
                        let username = decodedToken.sub;
                        let hostname = newIDPConfInput.components.web.hostname;
                        let pQuery = Provider.findOne({name: hostname}).populate('creator');
                        let provider = pQuery.exec();

                        provider.then(p => {
                            expect(p.creator.username).to.equal(username);
                            should.exist(p.configs);
                            let configs = p.configs;
                            configs.should.be.an('array');
                            done();
                        }).catch(err => done(err))
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
    context('GET /idp/:name/:filter', () => {


        it('#01 GET /idp/:name with missing JWT', (done) => {
            request(app)
                .get("/idp/anything")
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
        it('#02 GET /idp/:name/:filter with missing JWT', (done) => {
            request(app)
                .get("/idp/anything/configs")
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

        it('#03 GET /idp/:name with correct JWT but idp doesnt exist', (done) => {
            request(app)
                .get("/idp/fake.example.com")
                .set('Authorization', 'Bearer ' + validToken)
                .set('Content-type', 'application/ld+json')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });
        });
        xit('#04 GET /idp/:name existing IDP with correct JWT but with user has no rights', (done) => {
            request(app)
                .get("/idp/idp.example.com")
                .set('Authorization', 'Bearer ' + validTokenUser2)
                .set('Content-type', 'application/ld+json')
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
        it('#05 GET /idp/:name - jwt valid, idp exists, user has right to view');
    });

    context('Update IDP', () => {
        it('POST /idp with missing :name');
        it('POST /idp/:name with missing JWT');
        it('POST /idp/:name with incorrect JWT');
        it('POST /idp/:name with correct JWT and incorrect data');
        it('POST /idp/:name with correct JWT and input data but such IDP does not exist');
        it('POST /idp/:name with correct JWT and input data - expect successful update');
    });

});


