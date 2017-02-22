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
        type: String,
        ref: 'Type'
    }]
});

module.exports = mongoose.model('Model', modelSchema);