let mongoose = require('mongoose');

let sensorSchema = mongoose.Schema(
    {
        _id : {
            type: Number,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: 'Default User Description'
        },

        type : {
            type: String,
            ref: 'Type'
        },

        params : {
            critical : [{
                less_than : Number,
                greather_than : Number
            }],
            warning : [{
                less_than : Number,
                greather_than : Number
            }],
            ok : [{
                less_than : Number,
                greather_than : Number
            }]
        },

        propagate_alerts : false,

        group : {
            type: Number,
            ref: 'Group'
        }

    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Sensor', sensorSchema);