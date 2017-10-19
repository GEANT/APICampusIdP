const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('Authentication and request for JWT', () => {

    let fakeUser = {
        name: 'fakeuser',
        password: 'password'
    };

    let properUser = {
        name: 'properuser',
        password: 'properpassword'
    };

    let disabledUser = {
      name: 'disableduser',
      password: 'pass'
    };

    let jwtToken;

    before((done) => {
        mongoose.connection.collections.users.drop(() => {
            done()
        });
    });

    before((done) => {
        const user1 = new User({
            username: properUser.name,
            email: 'proper@example.com',
            password: properUser.password,
        });
        user1.save(done);
    });
    before((done) => {
        const user2 = new User({
            username: disabledUser.name,
            password: disabledUser.password,
            email: 'dfsdfsd@example.com',
            disabled: true
        });
        user2.save(done);
    });


    describe('Authentication',()=>{
        describe('For incorrect data/request', () => {
            it('reject a GET', (done) => {
                request(app)
                    .get('/authenticate')
                    .expect(404)
                    .end((err, res) => {
                        if (err) {
                            done(err);
                        }
                        else {
                            done();
                        }
                    })
            });

            it('401 for empty POST request', (done) => {
                request(app)
                    .post('/authenticate')
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
            it('authentication failed for fake user', (done) => {
                request(app)
                    .post('/authenticate')
                    .send(fakeUser)
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
            it('authentication failed for disabled user', (done) => {
                request(app)
                    .post('/authenticate')
                    .send(disabledUser)
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

        it('authentication success', (done) => {
            request(app)
                .post('/authenticate')
                .send(properUser)
                .expect(200)
                .expect("Content-type", /json/)
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



    describe('JWT check for successfule authn', () => {
        xit('authentication success + jwt check', (done) => {
            request(app)
                .post('/authenticate')
                .send(properUser)
                .expect(200)
                .expect("Content-type", /json/)
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


});