'use strict';
const app = require('../../app');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const assert = require('assert');
const mongoose = require('mongoose');
//const User = require('../../models/User');

describe('API /idp', () => {
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

        })
    });
    context('Create new IDP', () => {
        xit('POST /idp with missing JWT', (done) => {
            done();
        });
        xit('POST /idp with incorrect JWT', (done) => {
            done();
        });
        xit('POST /idp with correct JWT and incorrect data', (done) => {
            done();
        });
        xit('POST /idp with correct JWT and input data but such IDP already exists ', (done) => {
            done();
        });
        xit('POST /idp with correct JWT and input data - expect successful creation', (done) => {
            done();
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


