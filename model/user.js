const mongoose = require("mongoose");

const signupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    acctype: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        
    },
    department: {
        type: String
       
    },
    address: {
        type: String
        
    },
    birthdate: {
        type: Date
       
    }
});

module.exports = mongoose.model("users", signupSchema);