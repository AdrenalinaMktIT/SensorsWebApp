var mongoose = require('mongoose');

var clientSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    app_id: {
        type: String
    },
    logo: {
        type: String
    },
    css: {
        type: String
    },
    pdf_certified: {
        type: Boolean,
        default: false
    },
    associated_calculations: [{
        type: String,
        ref: 'Calculation'
    }],
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Client', clientSchema);