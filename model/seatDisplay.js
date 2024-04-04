const mongoose = require("mongoose");

const reserveSchema = new mongoose.Schema({
    labnum: {
        type: String,
        required: true
    },
    seatnum: {
        type: String,
        required: true
    },
    timereserved: {
        type: String,
        required: true
    },
    slotreserverd: {
        type: String,
        required: true
    },
    datereserved: {
        type: String,
        required: true
    },
    reservedby: {
        type: String,
        required: true
    },
    order:  {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    istaken: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model("seatDisplays", reserveSchema);