var mongoose = require('mongoose');

var profileSchema = mongoose.Schema({

    _id: {
        type: Number,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    carrier : {
        type: String,
        ref: 'Carrier'
    },

    cell_number : String,

    timezone_id : {
        type: Number,
        ref: 'Timezone'
    },

    active : {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Profile', profileSchema);