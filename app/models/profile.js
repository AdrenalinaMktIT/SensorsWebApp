let mongoose = require('mongoose');

let profileSchema = mongoose.Schema(
    {
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
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Profile', profileSchema);