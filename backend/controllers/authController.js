const User = require('../models/user');
const { generateToken } = require('../utils/auth');

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // 检查用户名是否已存在
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 创建新用户
        const userId = await User.create({ username, password, email });

        // 生成JWT Token
        const token = generateToken(userId);

        res.status(201).json({
            userId,
            username,
            token
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '注册失败' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成JWT Token
        const token = generateToken(user.id);

        res.json({
            userId: user.id,
            username: user.username,
            token
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '登录失败' });
    }
};