App({
    globalData: {
        userInfo: null,
        gameStatus: 'waiting' // waiting, dealing, playing, ended
    },
    onLaunch() {
        // 初始化云开发环境
        wx.cloud.init({
            env: 'dev-xxxx', // 需要替换为实际环境ID
            traceUser: true
        })
    }
})