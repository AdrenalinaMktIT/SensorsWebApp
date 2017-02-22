var mongoose = require('mongoose');

var carrierSchema = mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    logo: {
        type: String
    }
});

module.exports = mongoose.model('Carrier', carrierSchema);