let mongoose = require('mongoose');

let groupSchema = mongoose.Schema(
    {
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
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Group', groupSchema);