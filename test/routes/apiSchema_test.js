const assert = require('assert');
const request = require('supertest');
const app = require('../../app');

describe('apiSchema : GET /schema', () => {

    it('GET request to /schema with no content-type specified', (done) => {
        request(app)
            .get('/schema')
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
    it('GET request to /schema with application/ld+json', (done) => {
        request(app)
            .get('/schema')
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