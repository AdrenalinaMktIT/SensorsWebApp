let mongoose = require('mongoose');

let timezoneSchema = mongoose.Schema(
    {
        _id: {
            type: Number,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }
);

module.exports = mongoose.model('Timezone', timezoneSchema);