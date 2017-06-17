let mongoose = require('mongoose'),
    Schema = mongoose.Schema;
let bcrypt   = require('bcrypt-nodejs');

let Input = require('../models/inputs');

// define the schema for our user model
let userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: 'Default User Description'
        },

        client_id: {
            type: Schema.Types.ObjectId,
            ref: 'Client'
        },

        user_type: {
            type: String,
            default: 'Monitoreo',
            enum: ['Admin', 'Monitoreo']
        },

        timezone_id: {
            type: Number,
            ref: 'Timezone'
        },

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
    });

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function(password) {
    let user = this;

    // hash the password
    bcrypt.hash(password, null, null, function(err, hash) {
        if (err)
            return next(err);

        user.password = hash;
    });

};

userSchema.methods.lastSession = function (name, cb) {
    Input.find({ $and: [{description: 'Ingreso Correcto.'}, { $text: { $search: name } }]}, { _id: 0, date: 1 }).sort({date: -1}).limit(2).lean().exec()
        .then(function (result) {
            if (result.length >= 2) {
                cb(result[1].date);
            } else {
                cb('N/A');
            }
        })
        .catch(function (err) {
            cb(err);
        })
};

module.exports = mongoose.model('User', userSchema);