var mongoose = require('mongoose');
var Schema = mongoose.Schema;
bcrypt = require('bcrypt');
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {unique: true}
    },
    password: {
        type: String,
        required: true
    },
    email: String,
    disabled: {
        type: Boolean,
        default: false
    }
}, {collection: 'users'});
UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.checkPassword = function (strToCheck, cb) {
    bcrypt.compare(strToCheck, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });

};

module.exports = mongoose.model('User', UserSchema);
