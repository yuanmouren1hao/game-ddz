const GameRoom = require('../models/gameRoom');
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

module.exports = GameService;