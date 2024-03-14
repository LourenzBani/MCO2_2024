const mongoose = require("mongoose");


const seatSchema = new mongoose.Schema({
    date_id: {
        type: String,
        required: true
    },
    day_reserved: {
        type: String,
        required: true
    },
    reserved_by: {
        type: String,
        required: true
    },
    seat_num: {
        type: String,
        required: true
    },
    time_reserved: {
        type: String,
        required: true
    },
    time_slot_from: {
        type: String,
        required: true
    },
    time_slot_to: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("seat", seatSchema);
