const assert = require("assert");
const request = require("supertest");
const chai = require('chai');
const expect = chai.expect;
const app = require("../../app");
const mongoose = require("mongoose");
const User = require("../../models/User");
const sampleUser = require("../sample_data").sampleUser;
const sampleDisabledUser = require("../sample_data").sampleDisabledUser;

describe("Model User", () => {
    before(done => {
        User.find()
            .remove().then(() => done())
            .catch(error => done(error));
    });

    /*before(done => {
        mongoose.connection.collections.users.drop((err, res) => {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });
*/
    describe("Create", () => {
        it("create user as disabled", done => {
            let user = new User(sampleDisabledUser);
            user
                .save()
                .then(() => {
                    assert(!user.isNew);
                    done();
                })
                .catch(err => {
                    done(err);
                });
        });

        it("read created user", done => {
            let sampleUser = sampleDisabledUser;
            let user = User.findOne({username: sampleUser.username})
                .then(users => {
                    assert(
                        users.username === sampleUser.username,
                        "username dos not match"
                    );
                    assert(users.email === sampleUser.email, "Email does not match");
                    assert(users.enabled === false);
                    users.checkPassword(sampleUser.password, function (err, res) {
                        assert(res === true, "Password does not match");
                    });
                    done();
                })
                .catch(err => {
                    done(err);
                });
        });

        it("create user as enabled", done => {
            let user = new User(sampleUser);
            user
                .save()
                .then(() => {
                    assert(!user.isNew);
                    done();
                })
                .catch(err => {
                    done(err);
                });
        });

        it("read created user", done => {
            let user = User.findOne({username: sampleUser.username})
                .then(users => {
                    assert(
                        users.username === sampleUser.username,
                        "username dos not match"
                    );
                    assert(users.email === sampleUser.email, "Email does not match");
                    // console.log(`FFF: ${JSON.stringify(users)}`);
                    assert(users.enabled === true);
                    users.checkPassword(sampleUser.password, function (err, res) {
                        assert(res === true, "Password does not match");
                    });
                    done();
                })
                .catch(err => {
                    done(err);
                });
        });
    });

    describe("Remove", () => {
        before(done => {
            User.find().remove().then(
                () => done()
            ).catch(err => done(err));
        });
        beforeEach(done => {
            let nuser = new User(sampleUser);

            nuser.save().then(() => done()).catch(err => done(err));
        });

        it("user instance", done => {
            let user = User.findOne({name: sampleUser.username});
            user.remove()
                .then(() => User.findOne({name: sampleUser.username}))
                .then(u => {
                    assert(u === null);
                    done();
                })
                .catch(err => {
                    done(err);
                });
        });
    });

    describe("Update", () => {
        it("update user password", done => {
            let newPass = "321";
            User.findOne({name: sampleUser.name}).then(user => {

                expect(user).to.not.equal(null);
                return user;

            }).then(user => {
                user.password = newPass;
                user.save().then(() => {
                    return User.findOne({name: sampleUser.name});
                }).then(nuser => {
                    nuser.checkPassword(newPass, function (err, isMatch) {
                        expect(isMatch).to.equal(true);
                        done();
                    });
                }).catch(e => done(e));
            }).catch(e => {
                done(e);
            });
        });
        it("update user email", done => {
            let email = "321@example.com";
            User.findOne({name: sampleUser.name}).then(user => {

                expect(user).to.not.equal(null);
                return user;
            })
                .then(user => {
                user.email = email;
                user.save()
                    .then(() => {
                        return User.findOne({name: sampleUser.name});
                    })
                    .then(nuser => {
                        expect(nuser.email).to.equal(email);
                        done();
                    })
                    .catch(e => {
                        done(e);
                    });
            })
                .catch(e => done(e));
        });
        it("check for incorrect password", done => {
            let newPass = "321";
            let wrongPass = "123";
            User.findOne({name: sampleUser.name}).then(user => {
                expect(user).to.not.equal(null);
                return user;
            }).then(user => {
                user.password = newPass;
                user.save().then(() => {
                    return User.findOne({name: sampleUser.name});
                }).then(nuser => {
                    nuser.checkPassword(wrongPass, function (err, isMatch) {
                        expect(isMatch).to.equal(false);
                        done();
                    });
                }).catch(e => done(e))
            }).catch(e => done(e));
        });
    });
});
