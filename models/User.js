const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },  
    phone: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user", 
    }
},
{ timestamps: true }
);

const User = mongoose.model('User', userSchema);
module.exports = User;