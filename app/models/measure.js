let mongoose = require('mongoose');

let measureSchema = mongoose.Schema({

    imei: {
        type: String,
        ref: 'Device'
    },

    packetNumber: {
        type: Number,
        required: true
    },

    triggerEvent: {
        type: Number,
        required: true
    },

    gsmSignalStrength: {
        type: Number,
        required: true
    },

    data: [Number],

    coord: [Number],

    modelAndVersion: String,

    timestamp: Date
});

module.exports = mongoose.model('Measure', measureSchema);