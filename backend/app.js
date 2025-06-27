require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接数据库
const { mongoConnection } = require('./config/db');

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection failed:', err);
        process.exit(1);
    });

// 测试MySQL连接
const { mysqlPool } = require('./config/db');
mysqlPool.getConnection()
    .then(conn => {
        console.log('MySQL connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('MySQL connection failed:', err);
        process.exit(1);
    });

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});