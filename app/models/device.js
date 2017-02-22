var mongoose = require('mongoose');

var deviceSchema = mongoose.Schema({

    _id : {
        type: Number,
        required: true
    },

    model : {
        type: Number,
        ref: 'Model'
    },

    keys : {
        master : Number,
        user : Number
    },

    report1 : {
        ip : String,
        port : Number,
        refresh : Number
    },

    report2 : {
        ip : String,
        port : Number,
        refresh : Number
    },

    apn : {
        name : String,
        user : String,
        pass : String
    },

    name : String,

    carrier : {
        type: String,
        ref: 'Carrier'
    },

    cell_number : String,

    timezone_id : {
        type: Number,
        ref: 'Timezone'
    },

    timeout : Number,

    client_id : {
        type: Number,
        ref: 'Client'
    },

    sms_config : {
        type: Boolean,
        default: false
    },

    calibrated : {
        type: Boolean,
        default: false
    },

    buzzer : {
        type: Boolean,
        default: false
    },

    active : {
        type: Boolean,
        default: true
    }

});

module.exports = mongoose.model('Device', deviceSchema);