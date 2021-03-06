let mongoose = require('mongoose');

let clientSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        app_id: {
            type: String
        },

        logo: {
            type: String
        },

        css_name: {
            type: String
        },

        pdf_certified: {
            type: Boolean,
            default: false
        },

        available_calculations: [{
            type: String,
            ref: 'Calculation'
        }],

        active: {
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

module.exports = mongoose.model('Client', clientSchema);