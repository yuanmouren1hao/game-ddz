const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

// MySQL连接池配置
const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// MongoDB连接
const mongoConnection = mongoose.connection;

// 监听MongoDB连接事件
mongoConnection.on('connected', () => {
    console.log('MongoDB connected');
});

mongoConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoConnection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// 导出连接
module.exports = {
    mysqlPool,
    mongoConnection
};