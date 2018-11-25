'use strict';

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//ROUTES TO BASE MODELS
/*
userLogin - auth model
userSetup - user data model
userFavorites - user favorites model
userDraw - draws from favorites DB Collection
*/

const userDataSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true} 
})

const userFavsSchema = mongoose.Schema({
    userRef: {type: mongoose.Schema.Types.ObjectId, ref: 'userdata'},
    resturant: {type: String, require: true}
})

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

userDataSchema.methods.cleanUp = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email
    }
}

userFavsSchema.methods.cleanUp = function() {
    return {
        id: this._id,
        userRef: this._userRef,
        resturant: this.resturant
    }
}

//ADD AUTH AND TOKEN METHODS

//SET TOKEN

//VALPASS

//HASHPASS


const userDataModel = mongoose.model('userdata', userDataSchema);
const userFavsModel = mongoose.model('favsdata', userFavsSchema);

module.exports = {userDataModel, userFavsModel};