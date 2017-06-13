let mongoose = require('mongoose');

let modelSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        sensors_config: [{
            position : { type: Number, min: 1, max: 10 },
            type: {
                type: String,
                ref: 'Type'
            }
        }]
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Model', modelSchema);