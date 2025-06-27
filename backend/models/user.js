const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

class User {
    static async create({ username, password, email }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email]
        );
        return result.insertId;
    }

    static async findByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User;