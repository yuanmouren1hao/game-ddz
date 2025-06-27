const GameRoom = require('../models/gameRoom');
const GameLog = require('../models/gameLog');
const { shuffle, dealCards } = require('../utils/gameUtils');

class GameService {
    static async createRoom(creatorId, roomId) {
        return await GameRoom.createRoom(creatorId, roomId);
    }

    static async joinRoom(roomId, userId) {
        return await GameRoom.joinRoom(roomId, userId);
    }

    static async startGame(roomId) {
        const room = await GameRoom.findOne({ roomId });
        if (!room) {
            throw new Error('房间不存在');
        }
        if (room.players.length < 3) {
            throw new Error('需要至少3名玩家才能开始游戏');
        }
        if (room.status !== 'waiting') {
            throw new Error('游戏已开始或已结束');
        }

        // 初始化游戏数据
        const deck = shuffle();
        const { hands, landlordCards } = dealCards(deck);

        room.status = 'playing';
        room.gameData = {
            currentPlayer: 0,
            landlordIndex: -1,
            hands,
            landlordCards,
            playedCards: [],
            lastPlay: null,
            passCount: 0
        };

        return await room.save();
    }

    static async playCards(roomId, playerId, cards) {
        const room = await GameRoom.findOne({ roomId });
        if (!room) {
            throw new Error('房间不存在');
        }
        if (room.status !== 'playing') {
            throw new Error('游戏未开始');
        }

        // 验证玩家是否可以出牌
        const playerIndex = room.players.findIndex(p => p.user.equals(playerId));
        if (playerIndex === -1) {
            throw new Error('玩家不在房间中');
        }
        if (room.gameData.currentPlayer !== playerIndex) {
            throw new Error('不是你的回合');
        }

        // 验证牌型逻辑
        // TODO: 实现牌型验证

        // 更新游戏状态
        room.gameData.lastPlay = {
            playerIndex,
            cards
        };
        room.gameData.currentPlayer = (playerIndex + 1) % 3;
        room.gameData.passCount = 0;

        return await room.save();
    }
}

    /**
     * 保存游戏记录
     * @param {string} userId - 用户ID
     * @param {string} gameId - 游戏ID
     * @param {number} score - 游戏得分
     * @param {number} duration - 游戏时长(秒)
     * @param {Object} details - 牌局详情
     * @returns {Promise<Object>} 保存的游戏记录
     */
    static async saveGameRecord(userId, gameId, score, duration, details) {
    const record = new GameLog({
        userId,
        gameId,
        gameType: 'ddz',
        action: 'result',
        score,
        duration,
        details
    });

    return await record.save();
}

    /**
     * 获取用户游戏记录
     * @param {string} userId - 用户ID
     * @param {number} limit - 返回记录数量
     * @returns {Promise<Array>} 游戏记录列表
     */
    static async getUserGameRecords(userId, limit = 10) {
    return await GameLog.find({
        userId,
        action: 'result'
    })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
}

    /**
     * 获取游戏排行榜
     * @param {number} limit - 返回记录数量
     * @param {string} gameType - 游戏类型
     * @returns {Promise<Array>} 排行榜数据
     */
    static async getLeaderboard(limit = 10, gameType = 'ddz') {
    return await GameLog.aggregate([
        {
            $match: {
                action: 'result',
                gameType: gameType
            }
        },
        {
            $group: {
                _id: '$userId',
                totalScore: { $sum: '$score' },
                gamesPlayed: { $sum: 1 },
                lastPlayed: { $max: '$timestamp' }
            }
        },
        {
            $sort: { totalScore: -1 }
        },
        {
            $limit: parseInt(limit)
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $project: {
                userId: '$_id',
                username: '$user.username',
                avatar: '$user.avatar',
                totalScore: 1,
                gamesPlayed: 1,
                lastPlayed: 1
            }
        }
    ]);
}
}

module.exports = GameService;