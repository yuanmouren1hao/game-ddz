const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authMiddleware } = require('../utils/auth');

// 应用认证中间件
router.use(authMiddleware);

// 创建游戏房间
router.post('/rooms', gameController.createRoom);

// 加入游戏房间
router.post('/rooms/:roomId/join', gameController.joinRoom);

// 获取房间列表
router.get('/rooms', gameController.getRooms);

module.exports = router;