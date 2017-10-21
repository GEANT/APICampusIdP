const assert = require('assert');
const request = require('supertest');
const app = require('../../app');

describe('context : GET /context', () => {

    it('GET no content-type specified', (done) => {
        request(app)
            .get('/context')
            .expect(200)
            .expect('Content-Type',/application\/json/)
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
    });
    it('GET  content-type : application/ld+json', (done) => {
        request(app)
            .get('/context')
            .set('Accept', 'application/ld+json')
            .expect(200)
            .expect('Content-Type',/application\/ld\+json/)
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
    })
});