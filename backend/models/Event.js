const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Event', EventSchema);