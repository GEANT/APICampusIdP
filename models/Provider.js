var mongoose = require('mongoose');
var version = require('mongoose-version');
var _ = require('lodash');
var Schema = mongoose.Schema;
var ProviderSchema = new Schema({
    entityID: {
        type: String,
        required: true,
        index: {unique: false}
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
    }
}, {collection: 'providers'});


ProviderSchema.plugin(version, {
    strategy: 'collection',
    suppressVersionIncrement: false,
    suppressRefIdIndex: false,
    documentProperty: 'entityID',
    collection: 'providers_history',

});
ProviderSchema.pre('save', function (next) {
    var provider = this;
    provider.updatedAt = Date.now();
    console.log('pre saving provider: ' + _.now());
    next();

});
module.exports = mongoose.model('Provider', ProviderSchema);