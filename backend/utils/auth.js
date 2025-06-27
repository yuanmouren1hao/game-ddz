const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('无效的Token');
    }
};

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: '请提供认证Token' });
    }

    try {
        const decoded = verifyToken(token);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

module.exports = {
    generateToken,
    verifyToken,
    authMiddleware
};