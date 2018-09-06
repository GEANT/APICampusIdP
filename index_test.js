'use strict';
const app = require('../../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;
const mongoose = require('mongoose');



// @todo change
const expextedJson = {
    "@context":{},
    "entrypoints":
        {
            "authentication":
                {
                    "url": "http://host.example.com:2456/authenticate",
                    "methods":"post"
                },
            "user":
                {
                    "url": "http://host.example.com:2456/users",
                    "methods": ["post","get"]
                },
            "idp":
                {
                    "url":"http://host.example.com:2456/idp",
                    "methods": ["post","get","delete","put"]
                }
        }
};


describe('root endpoint', () => {
    it('GET / - expect 200 ', (done) => {
        request(app)
            .get('/')
            .end((err,res)=>{
            expect(res.status).to.equal(200);
            assert.deepEqual(res.body,expextedJson);
            done();
            });
    });
});