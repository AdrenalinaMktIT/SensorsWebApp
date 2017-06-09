let mongoose = require('mongoose');

let modelSchema = mongoose.Schema(
    {
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
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Model', modelSchema);