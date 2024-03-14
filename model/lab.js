const mongoose = require("mongoose");


const labSchema = new mongoose.Schema({
    labnum: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("lab", labSchema);
