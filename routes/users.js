const express = require('express');
const router = express.Router();
const _ = require('lodash');
const User = require('../models/User');
const konsole = require('../libs/konsole');
const verifyToken = require('../libs/verifyToken');
const errPrefix = "255";
const ExpressBrute = require('express-brute');

// store for dev only
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store);
const validateRegisterInput = require('../libs/validations/registerUser');

/* GET users listing. */
router.get('/', verifyToken,function (req, res, next) {
    const errors = {};
    User.find().select(["username","email", "enabled"]).then(users => {
        res.send(users);
    }).catch(err => {
        res.send('test respond with a resource: error');
    });

});

/* register new user */
router.post('/register', bruteforce.prevent, function (req, res) {
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check Validation
    if (!isValid) {
        return res.status(400).json({error: true, message: errors, id: errPrefix+'003'});
    }
    //const errors = {};
    User.findOne({$or: [{email: req.body.email}, {username: req.body.username}]}).then(user => {
        if (user) {
            errors.email = 'Email/username already exists';
            return res.status(400).json({ error: true, message: errors, id: errPrefix+"001"});
        } else {
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });
            newUser
                .save()
                .then(user => {
                    res.json(_.pick(user.toJSON(),['_id','username','email']));
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(400).json({ error: true, message: err, id: errPrefix+"002"});
                });
        }
    });
});

/* delete user */
router.delete('/:name', verifyToken,function (req, res) {
 res.send('test respond with a delete user');
});

module.exports = router;
