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
    gameType: {
        type: String,
        required: true,
        enum: ['ddz', 'other'],
        default: 'ddz'
    },
    action: {
        type: String,
        required: true,
        enum: ['start', 'play', 'end', 'result']
    },
    score: {
        type: Number,
        required: function () {
            return this.action === 'result';
        }
    },
    duration: {
        type: Number, // 单位：秒
        required: function () {
            return this.action === 'result';
        }
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