const mongoose = require('mongoose');
const { mysqlPool } = require('../config/db');

const gameRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        seat: Number,
        ready: {
            type: Boolean,
            default: false
        }
    }],
    maxPlayers: {
        type: Number,
        default: 3
    },
    status: {
        type: String,
        enum: ['waiting', 'playing', 'finished'],
        default: 'waiting'
    },
    gameData: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 静态方法
gameRoomSchema.statics = {
    async createRoom(creatorId, roomId) {
        const room = new this({
            roomId,
            creator: creatorId,
            players: [{
                user: creatorId,
                seat: 1,
                ready: false
            }]
        });
        return await room.save();
    },

    async joinRoom(roomId, userId) {
        const room = await this.findOne({ roomId });
        if (!room) {
            throw new Error('房间不存在');
        }
        if (room.players.length >= room.maxPlayers) {
            throw new Error('房间已满');
        }
        if (room.players.some(p => p.user.equals(userId))) {
            throw new Error('已在房间中');
        }

        const seat = room.players.reduce((max, p) => Math.max(max, p.seat), 0) + 1;
        room.players.push({
            user: userId,
            seat,
            ready: false
        });
        return await room.save();
    }
};

module.exports = mongoose.model('GameRoom', gameRoomSchema);