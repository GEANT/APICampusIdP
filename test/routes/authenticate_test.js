const assert = require('assert');
const request = require('supertest');
const app = require('../../app');

describe('/authenticate route', () => {

    let fakeUser = {
        name: 'fakeuser',
        password: 'password'
    };

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
    xit('correct authentication', (done)=>{

    });


});