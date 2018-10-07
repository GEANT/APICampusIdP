const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const version = require('mongoose-version');
const _ = require('lodash');
const konsole = require('../libs/konsole');
const sha1 = require('node-forge').md.sha1;
const States = new Schema({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    jobstate : {
        type:String,
        required: true
    },
    details: String,
    finishstate: {
        type:String,
        required: true
    }
});

/**
 * Jobschema:
 *   name: name of task
 *   params: optional additional params // not used yet
 *   createdBy: username
 *   qtoken
 */
const JobSchema = new Schema({
    name: String,
    params: Object,
    createdBy: String,
    sourceIP: String,
    qtoken: {
        type: String
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider'
    },
    states: [States]
},{collection: 'tasks'});
JobSchema.pre('save', function (next) {
    let job = this;
    job.qtoken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    next();

});
module.exports = mongoose.model('Job', JobSchema);