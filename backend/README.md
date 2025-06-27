# 斗地主游戏后端服务

## 项目概述
这是一个斗地主游戏的后端服务，提供游戏房间管理、玩家匹配、游戏逻辑处理等功能。基于Node.js和Express框架开发，使用MongoDB和MySQL双数据库存储数据。

## 技术栈
- **运行时**: Node.js
- **框架**: Express
- **数据库**: 
  - MongoDB (存储游戏状态和用户数据)
  - MySQL (存储关系型数据)
- **认证**: JWT + bcryptjs
- **测试**: Jest + Supertest

## 数据库表结构

### MongoDB表结构

#### 1. User表 (users)
| 字段名 | 类型 | 描述 |
|--------|------|------|
| username | String | 用户名 |
| password | String | 加密后的密码 |
| email | String | 用户邮箱 |

#### 2. GameRoom表 (gamerooms)
| 字段名 | 类型 | 描述 |
|--------|------|------|
| roomId | String | 房间唯一ID |
| creator | ObjectId | 创建者ID(关联User) |
| players | Array | 玩家数组(包含用户ID、座位号、准备状态) |
| maxPlayers | Number | 最大玩家数(默认3) |
| status | String | 房间状态(waiting/playing/finished) |
| gameData | Object | 游戏数据对象 |
| createdAt | Date | 房间创建时间 |

#### 3. GameLog表 (gamelogs)
| 字段名 | 类型 | 描述 |
|--------|------|------|
| userId | ObjectId | 用户ID(关联User) |
| gameId | String | 游戏ID |
| action | String | 操作类型(start/play/end) |
| details | Object | 操作详情 |
| timestamp | Date | 操作时间 |

### MySQL表结构
(主要用于存储关系型数据，具体表结构待补充)

## 目录结构
```
backend/
├── .env                # 环境变量配置
├── app.js              # 应用入口文件
├── config/             # 数据库配置
│   └── db.js          
├── controllers/        # 业务逻辑控制器
│   ├── authController.js
│   └── gameController.js
├── models/             # 数据库模型
│   ├── gameLog.js
│   ├── gameRoom.js
│   └── user.js
├── routes/             # API路由
│   ├── auth.js
│   └── game.js
├── services/           # 核心服务逻辑
│   └── gameService.js
└── utils/              # 工具函数
    ├── auth.js
    └── gameUtils.js
```

## 安装与运行

### 前置条件
- Node.js (v16+)
- MongoDB
- MySQL

### 安装步骤
1. 克隆项目
2. 进入backend目录:
   ```bash
   cd backend
   ```
3. 安装依赖:
   ```bash
   npm install
   ```
4. 复制.env.example并配置:
   ```bash
   cp .env.example .env
   ```
   编辑.env文件配置数据库连接等信息

### 运行项目
- 开发模式:
  ```bash
  npm run dev
  ```
- 生产模式:
  ```bash
  npm start
  ```

### 测试
```bash
npm test
```

## API文档
API文档请参考[API文档链接](API_DOCS_URL)

## 环境变量
| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| MONGO_URI | MongoDB连接字符串 | mongodb://localhost:27017/doudizhu |
| MYSQL_HOST | MySQL主机地址 | localhost |
| MYSQL_USER | MySQL用户名 | root |
| MYSQL_PASSWORD | MySQL密码 | password |
| MYSQL_DATABASE | MySQL数据库名 | doudizhu |
| JWT_SECRET | JWT密钥 | your_jwt_secret |
| PORT | 服务端口 | 3000 |

## 贡献指南
1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request