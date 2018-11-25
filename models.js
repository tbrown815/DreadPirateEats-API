'use strict';

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


/*USER DATA SCHEMA */

const userDataSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true} 
})

/*USER FAVORITES SCHEMA */

const userFavsSchema = mongoose.Schema({
    userRef: {type: mongoose.Schema.Types.ObjectId, ref: 'userdata'},
    resturant: {type: String, require: true}
})

/*PRE-HOOKS AND VIRTUAL FOR USER FAVS TO REFERENCE AND POPULATE USER NAME FOR FAVORITES */

userFavsSchema.pre('findOne', function(next) {
    this.populate('userRef');
    next();
})

userFavsSchema.pre('find', function(next) {
    this.populate('userRef');
    next();
})

userFavsSchema.virtual('_userRef').get(function() {
    return `${this.userdata.username}`.trim()
})

/* USER DATA CLEAN-UP METHOD */

userDataSchema.methods.cleanUp = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email
    }
}

/* USER FAVORITES CLEAN-UP METHOD */

userFavsSchema.methods.cleanUp = function() {
    return {
        id: this._id,
        userRef: this._userRef,
        resturant: this.resturant
    }
}

/* SET USER TOKEN */

userDataSchema.methods.setToken = function() {
    return {
        id: this._id
    };
};

/* PASSWORD HASH */

userDataSchema.statics.hashPass = function(pass) {
    return bcrypt.hash(pass, 10);
};

/* PASSWORD VALIDATE */

userDataSchema.statics.valPass = function(pass) {
    return bcrypt.compare(pass, this.password)
};

/* MODELS AND DB COLLECTIONS */

const userDataModel = mongoose.model('userdata', userDataSchema);
const userFavsModel = mongoose.model('favsdata', userFavsSchema);

module.exports = {userDataModel, userFavsModel};