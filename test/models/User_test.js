const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const sampleUser = require('../sample_data').sampleUser;

describe('Model User', () => {

    before((done) =>{
        User.find().remove(done);
    });

    before((done) => {
        mongoose.connection.collections.users.drop((err,res) => {
            if(err){
                done(err);
            }
            else {
                done();
            }
        });
    });


    it('create user', (done) => {

        let user = new User(sampleUser);
        user.save().then(() => {
            assert(!user.isNew);
            done();
        }).catch((err)=>{
            done(err);
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
        }).catch((err)=>{
            done(err);
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