// pages/myaccount/myaccount.js
var app = getApp()
Page({
    data: {
        status: 0,
        header_img: 'https://cdn.51julebu.com/xiaochengxu/image/Kitty.png',
        name: '名称',
        idnumber: '---',
    },

    onLoad() {
        let userInfo = app.session.getUserInfo()
        this.setData({
            status: app.session.isTempUser() ? 0 : 1,
            header_img: userInfo.avatar,
            name: userInfo.nick,
            idnumber: userInfo.userID
        })
    },

    nato_bindphone: function (e) {
        wx.navigateTo({
            url: '../bindphone/bindphone'
        })
    }
})