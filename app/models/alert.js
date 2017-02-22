var mongoose = require('mongoose');

var alertSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    sensor: {
        type: Number,
        ref: 'Sensor'
    },

    less_than: {
        type: Number,
        required: true
    },

    greater_than: {
        type: Number,
        required: true
    },

    profile: {
        type: Number,
        ref: 'Profile'
    }
});

module.exports = mongoose.model('Alert', alertSchema);