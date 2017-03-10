var mongoose = require('mongoose');

var modelSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sensors: [{
        type: Number,
        ref: 'Sensor'
    }]
});

module.exports = mongoose.model('Model', modelSchema);