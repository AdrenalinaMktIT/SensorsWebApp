let mongoose = require('mongoose'),
Schema = mongoose.Schema;

let alertSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        sensors: {
            type: Schema.Types.ObjectId,
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
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Alert', alertSchema);