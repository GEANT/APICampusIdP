const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const version = require('mongoose-version');
const _ = require('lodash');
const ProviderConfig = require('./ProviderConfig_schema');
const konsole = require('../libs/konsole');

const ProviderSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: {unique: false}
    },
    status: {
      type: String,
      required: true
    },
    configs : [ProviderConfig],
    configuration : {
        type: Object
    },
    data: {
        type: Object
    },
    createdBy: String,
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {collection: 'providers'});
ProviderSchema
.virtual('url')
.get(function () {
  return '/idp/' + this.name;
});

ProviderSchema.plugin(version, {
    strategy: 'collection',
    suppressVersionIncrement: false,
    suppressRefIdIndex: false,
    documentProperty: 'entityID',
    collection: 'providers_history'

});
ProviderSchema.pre('save', function (next) {
    let provider = this;
    provider.updatedAt = Date.now();
    konsole('pre saving provider: ' + _.now());
    next();

});
module.exports = mongoose.model('Provider', ProviderSchema);