const assert = require('assert');
const request = require('supertest');
const app = require('../../app');

describe('apiSchema routes', () => {

    it('handles a GET request to /schema', (done) => {
        request(app)
            .get('/schema')
            .expect(200)
            .expect('Content-Type',/json/)
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