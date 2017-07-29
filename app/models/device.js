let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let deviceSchema = mongoose.Schema(
    {
        _id : {
            type: String,
            required: true
        },

        model : {
            type: Schema.Types.ObjectId,
            ref: 'Model'
        },

        sensors: [{
            type: Schema.Types.ObjectId,
            ref: 'Sensor'
        }],

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

        // viene dado en minutos.
        timeout : Number,

        client_id : {
            type: Schema.Types.ObjectId,
            ref: 'Client'
        },

        active : {
            type: Boolean,
            default: true
        },

        //llenar este campo en la vista
        frecuency : Number

    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

module.exports = mongoose.model('Device', deviceSchema);




































































































