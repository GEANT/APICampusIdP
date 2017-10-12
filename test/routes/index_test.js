'use strict';
const app = require('../../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');
const mongoose = require('mongoose');

describe('GET /', () => {
    it('GET / - expect 200 ', (done) => {
        request(app)
            .get('/')
            .expect(200, done);
    });
});