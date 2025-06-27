const GameLog = require('../models/gameLog');
const GameService = require('../services/gameService');
const { validationResult } = require('express-validator');

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

// 获取游戏排行榜
exports.getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, gameType = 'ddz' } = req.query;

        const leaderboard = await GameService.getLeaderboard(
            parseInt(limit),
            gameType
        );

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('获取排行榜失败:', error);
        res.status(500).json({
            success: false,
            message: '获取排行榜失败: ' + error.message
        });
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

// 保存游戏结果
exports.saveGameResult = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req;
        const { roomId, score, duration, details } = req.body;

        // 保存游戏记录
        const record = await GameLog.create({
            userId,
            gameId: roomId,
            gameType: 'ddz',
            action: 'result',
            score,
            duration,
            details
        });

        res.status(201).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('保存游戏结果失败:', error);
        res.status(500).json({
            success: false,
            message: '保存游戏结果失败: ' + error.message
        });
    }
};

// 获取游戏记录
exports.getGameRecords = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        // 获取游戏记录
        const records = await GameLog.find({
            userId,
            action: 'result'
        })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .exec();

        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        console.error('获取游戏记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取游戏记录失败: ' + error.message
        });
    }
};