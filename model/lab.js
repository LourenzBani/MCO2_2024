const mongoose = require("mongoose");

const labSchema = new mongoose.Schema({
    labnum: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("lab", labSchema);
