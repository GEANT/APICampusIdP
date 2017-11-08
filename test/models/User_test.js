const assert = require("assert");
const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const User = require("../../models/User");
const sampleUser = require("../sample_data").sampleUser;
const sampleDisabledUser = require("../sample_data").sampleDisabledUser;

describe("Model User", () => {
  before(done => {
    User.find().remove(done);
  });

  before(done => {
    mongoose.connection.collections.users.drop((err, res) => {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  });

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
      let user = User.findOne({ username: sampleUser.username })
        .then(users => {
          assert(
            users.username === sampleUser.username,
            "username dos not match"
          );
          assert(users.email === sampleUser.email, "Email does not match");
          // console.log(`FFF: ${JSON.stringify(users)}`);
          assert(users.enabled === false);
          users.checkPassword(sampleUser.password, function(err, res) {
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
      let user = User.findOne({ username: sampleUser.username })
        .then(users => {
          assert(
            users.username === sampleUser.username,
            "username dos not match"
          );
          assert(users.email === sampleUser.email, "Email does not match");
          // console.log(`FFF: ${JSON.stringify(users)}`);
          assert(users.enabled === true);
          users.checkPassword(sampleUser.password, function(err, res) {
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
    beforeEach(done => {
      var nuser = new User(sampleUser);
      nuser.save(done);
    });

    it("user instance", done => {
      let user = User.findOne({ name: sampleUser.username });
      user
        .remove()
        .then(() => {
          return User.findOne({ name: sampleUser.username });
        })
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
    xit("update user", done => {
      let user = User.find({ name: sampleUser.name }).then(users => {
        console.log(users);
      });

      done();
    });
  });
});
