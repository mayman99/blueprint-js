const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    email: String,
    projects: Array,
    username: String,
    profileimage: String
})

module.exports = mongoose.model('UserModel', userModel);