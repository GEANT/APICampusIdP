const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

describe('/authenticate route', () => {

    let fakeUser = {
        name: 'fakeuser',
        password: 'password'
    };

    let properUser = {
        name: 'properuser',
        password: 'properpassword'
    };

    let jwtToken;

    before((done) => {
        mongoose.connection.collections.users.drop(() => {
            done()
        });
    });
    before((done) => {
        const user = new User({
            username: 'properuser',
            email: 'proper@example.com',
            password: 'properpassword'
        });
        user.save().then((res, err) => {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        }).catch(err => {
            done(err);
        });
    });

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
    it('authentication success for proper user/pass', (done) => {
        request(app)
            .post('/authenticate')
            .send(properUser)
            .expect(200)
            .expect("Content-type",/json/)
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