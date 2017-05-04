var mongoose = require('mongoose');
var auditLog = require('audit-log');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

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
        type: Number,
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
});

var pluginFn = auditLog.getPlugin('mongoose', {modelName:'User', namePath:'name'}); // setup occurs here
userSchema.plugin(pluginFn.handler); // .handler is the pluggable function for mongoose in this case

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
    var user = this;

    // hash the password
    bcrypt.hash(password, null, null, function(err, hash) {
        if (err)
            return next(err);

        user.password = hash;
    });

};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);