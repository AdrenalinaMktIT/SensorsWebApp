let mongoose = require('mongoose');

let calculationSchema = mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        required_sensors: [{
            type: String,
            ref: 'Type'
        }]
    }
);

module.exports = mongoose.model('Calculation', calculationSchema);