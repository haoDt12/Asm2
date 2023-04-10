const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true
    },
    avatar: {
        data: Buffer,
        contentType: String
    },
    email: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

const UserModel = new mongoose.model('user',  UserSchema);

module.exports = UserModel;