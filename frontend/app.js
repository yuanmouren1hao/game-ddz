App({
    globalData: {
        userInfo: null,
        isLogin: false,
        gameStatus: 'waiting' // waiting, dealing, playing, ended
    },
    onLaunch() {
        // 初始化云开发环境
        wx.cloud.init({
            env: 'dev-xxxx', // 需要替换为实际环境ID
            traceUser: true
        })
        // 检查本地登录状态
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.globalData.userInfo = userInfo
            this.globalData.isLogin = true
        }
    },
    // 用户登录方法
    login() {
        return new Promise((resolve, reject) => {
            wx.getUserProfile({
                desc: '用于记录游戏成绩和排名',
                success: res => {
                    this.globalData.userInfo = res.userInfo
                    this.globalData.isLogin = true
                    wx.setStorageSync('userInfo', res.userInfo)
                    resolve(res.userInfo)
                },
                fail: err => {
                    console.error('登录失败:', err)
                    reject(err)
                }
            })
        })
    }
})