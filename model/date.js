const mongoose = require("mongoose");

// default time slot availability
const def_timeslot = [
    "09:00:00", "09:30:00", "10:00:00", "10:30:00",
    "11:00:00", "11:30:00", "12:00:00", "12:30:00",
    "13:00:00", "13:30:00", "14:00:00"
]

const dateSchema = new mongoose.Schema({
    labs_id: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("date", dateSchema);
