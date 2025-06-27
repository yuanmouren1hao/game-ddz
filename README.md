# 欢乐斗地主游戏全栈项目

## 项目概述
本项目是一个完整的斗地主游戏实现，包含微信小程序前端和Node.js后端服务，支持多人实时在线对战。

## 项目结构
```
ddz-game/
├── frontend/                  # 微信小程序前端
│   ├── app.js                 # 小程序入口文件
│   ├── app.json               # 全局配置
│   ├── app.wxss               # 全局样式
│   ├── pages/                 # 页面目录
│   │   ├── index/             # 首页
│   │   ├── room/              # 房间页
│   │   └── game/              # 游戏页
│   ├── components/            # 组件
│   │   ├── card/              # 扑克牌组件
│   │   └── player/            # 玩家信息组件
│   └── utils/                 # 工具类
├── backend/                   # Node.js后端
│   ├── app.js                 # 入口文件
│   ├── config/                # 配置
│   │   └── database.js        # 数据库配置
│   ├── controllers/           # 控制器
│   ├── models/                # 数据模型
│   ├── routes/                # 路由
│   ├── services/              # 业务服务
│   └── socket/                # WebSocket服务
├── docs/                      # 文档
└── README.md                  # 项目说明
```

## 技术栈
### 前端技术
- 微信小程序原生开发
- JavaScript ES6+
- WebSocket实时通信
- 自定义组件开发

### 后端技术
- Node.js 16+
- Express 4.x框架
- WebSocket实时通信
- MongoDB 5.0+数据库
- Redis 6.0+缓存
- JWT身份认证

## 核心功能
### 游戏功能
1. 牌局管理
   - 54张扑克牌洗牌算法
   - 三人发牌逻辑
   - 叫地主/抢地主流程
2. 游戏规则
   - 出牌规则验证
   - 牌型判断（单张、对子、顺子等）
   - 胜负判定
3. 游戏状态
   - 准备阶段
   - 叫地主阶段
   - 出牌阶段
   - 结算阶段

### 系统功能
1. 用户系统
   - 微信登录
   - 用户信息管理
2. 房间系统
   - 房间创建/加入
   - 玩家匹配
3. 对战系统
   - 实时状态同步
   - 游戏历史记录

## 前后端交互
### 通信架构
1. 混合通信模式
   - HTTP API：非实时操作
   - WebSocket：实时游戏交互
2. 通信流程
   ```mermaid
   sequenceDiagram
   前端->>后端: HTTP登录获取token
   前端->>后端: WebSocket连接(带token)
   后端-->>前端: 认证成功
   前端->>后端: 加入房间
   后端-->>所有客户端: 房间状态更新
   ```

### 数据格式
1. HTTP响应格式
```json
{
  "code": 200,
  "data": {},
  "message": "success"
}
```

2. WebSocket消息格式
```json
{
  "event": "game_update",
  "data": {
    "currentPlayer": "user1",
    "lastCards": ["3H", "3D", "3S"],
    "remainingCards": 15
  }
}
```

## 接口设计
### RESTful API
| 端点 | 方法 | 描述 |
|------|------|------|
| /api/login | POST | 微信登录 |
| /api/rooms | GET | 获取房间列表 |
| /api/rooms | POST | 创建房间 |

### WebSocket事件
| 事件 | 方向 | 描述 |
|------|------|------|
| join | 前端→后端 | 加入房间 |
| ready | 前端→后端 | 准备游戏 |
| play | 前端→后端 | 出牌 |

## 数据库设计
### MongoDB集合
1. users集合
```javascript
{
  _id: ObjectId,
  openid: String,    // 微信openid
  nickname: String,   // 昵称
  avatar: String,    // 头像
  score: Number      // 积分
}
```

2. games集合
```javascript
{
  _id: ObjectId,
  players: [{
    userId: ObjectId,
    cards: [String],  // 手牌
    isLandlord: Boolean
  }],
  status: String     // preparing/playing/finished
}
```

## 快速开始
### 环境准备
1. 安装Node.js 16+
2. 安装MongoDB 5.0+
3. 安装Redis 6.0+
4. 微信开发者工具

### 启动后端
```bash
cd backend
npm install
npm start
```

### 启动前端
1. 微信开发者工具导入frontend目录
2. 配置合法域名
3. 点击编译运行

## 注意事项
1. 开发环境
   - 需要配置微信小程序合法域名
   - 本地开发需开启HTTPS
2. 生产环境
   - 建议使用PM2管理Node进程
   - 配置Redis持久化
3. 测试建议
   - 使用Postman测试API
   - 使用微信开发者工具调试
```