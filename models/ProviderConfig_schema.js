const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv1 = require('uuid/v1');


const ProviderConfigSchema = new Schema({

    ver : {
        type : String,
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    flatcompact: Object,



});
ProviderConfigSchema.pre('save', function (next) {
    var obj = this;
    obj.ver = uuidv1();
    next();
});
module.exports = ProviderConfigSchema;