const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authMiddleware } = require('../utils/auth');

// 创建房间
router.post('/rooms', authMiddleware, gameController.createRoom);

// 加入房间
router.post('/rooms/:roomId/join', authMiddleware, gameController.joinRoom);

// 获取房间列表
router.get('/rooms', gameController.getRooms);

// 开始游戏
router.post('/rooms/:roomId/start', authMiddleware, gameController.startGame);

// 出牌操作
router.post('/rooms/:roomId/play', authMiddleware, gameController.playCards);

module.exports = router;