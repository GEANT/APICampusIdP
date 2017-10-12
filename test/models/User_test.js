const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const sampleData = require('../sample_data');

describe('Model User', () => {

    let sampleUser = {
        username: 'sampleuser',
        email: 'sampleuser@example.com',
        password: 'samplepass'
    };
    before((done) => {
        mongoose.connection.collections.users.drop(() => {
            done();
        });
    });


    it('create user', (done) => {

        let user = new User(sampleUser);
        user.save().then(() => {
            assert(!user.isNew);
            done();
        });

    });

    it('read created user', (done) => {
        let user = User.findOne({username: sampleUser.username}).then((users) => {
            assert(users.username === sampleUser.username, 'username dos not match');
            assert(users.email === sampleUser.email, 'Email does not match');
            users.checkPassword(sampleUser.password, function (err, res) {
                assert(res === true,'Password does not match');
            });
            done();
        });

    });


    xit('update user', (done) => {
        let user = User.find({name: sampleUser.name}).then((users) => {
            console.log(users);
        });

        done();
    });

    xit('delete user', (done) => {
        done();
    });
});