const mongoose = require('mongoose');

const gameLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['start', 'play', 'end']
    },
    details: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GameLog', gameLogSchema);