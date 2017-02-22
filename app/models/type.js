var mongoose = require('mongoose');

var typeSchema = mongoose.Schema({

    _id: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Type', typeSchema);