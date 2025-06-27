const GameLog = require('../models/gameLog');
const GameService = require('../services/gameService');
const { authMiddleware } = require('../utils/auth');

// 创建游戏房间
exports.createRoom = async (req, res) => {
    try {
        const { userId } = req;
        const { roomName, maxPlayers } = req.body;

        // 使用游戏服务创建房间
        const roomId = `room_${Date.now()}`;
        const room = await GameService.createRoom(userId, roomId);

        // 记录游戏日志
        await GameLog.create({
            userId,
            gameId: roomId,
            action: 'start',
            details: { roomName, maxPlayers }
        });

        res.status(201).json({
            roomId,
            roomName,
            maxPlayers,
            creator: userId,
            room
        });
    } catch (error) {
        console.error('创建房间错误:', error);
        res.status(500).json({ message: '创建房间失败: ' + error.message });
    }
};

// 加入游戏房间
exports.joinRoom = async (req, res) => {
    try {
        const { userId } = req;
        const { roomId } = req.params;

        // 使用游戏服务加入房间
        const room = await GameService.joinRoom(roomId, userId);

        // 记录游戏日志
        await GameLog.create({
            userId,
            gameId: roomId,
            action: 'play',
            details: { action: 'join' }
        });

        res.json({
            roomId,
            userId,
            room,
            message: '成功加入房间'
        });
    } catch (error) {
        console.error('加入房间错误:', error);
        res.status(400).json({ message: '加入房间失败: ' + error.message });
    }
};

// 获取房间列表
exports.getRooms = async (req, res) => {
    try {
        // 获取所有活跃房间逻辑
        const rooms = []; // 这里应该有实际的房间查询逻辑

        res.json({ rooms });
    } catch (error) {
        console.error('获取房间列表错误:', error);
        res.status(500).json({ message: '获取房间列表失败' });
    }
};

// 开始游戏
exports.startGame = async (req, res) => {
    try {
        const { userId } = req;
        const { roomId } = req.params;

        // 使用游戏服务开始游戏
        const room = await GameService.startGame(roomId);

        // 记录游戏日志
        await GameLog.create({
            userId,
            gameId: roomId,
            action: 'start_game',
            details: {}
        });

        res.json({
            roomId,
            userId,
            room,
            message: '游戏开始'
        });
    } catch (error) {
        console.error('开始游戏错误:', error);
        res.status(400).json({ message: '开始游戏失败: ' + error.message });
    }
};

// 出牌操作
exports.playCards = async (req, res) => {
    try {
        const { userId } = req;
        const { roomId } = req.params;
        const { cards } = req.body;

        // 使用游戏服务出牌
        const room = await GameService.playCards(roomId, userId, cards);

        // 记录游戏日志
        await GameLog.create({
            userId,
            gameId: roomId,
            action: 'play_cards',
            details: { cards }
        });

        res.json({
            roomId,
            userId,
            room,
            message: '出牌成功'
        });
    } catch (error) {
        console.error('出牌错误:', error);
        res.status(400).json({ message: '出牌失败: ' + error.message });
    }
};