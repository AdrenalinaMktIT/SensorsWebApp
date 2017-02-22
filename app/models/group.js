var mongoose = require('mongoose');

var groupSchema = mongoose.Schema({

    _id: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    description: String,

    image: String
});

module.exports = mongoose.model('Group', groupSchema);