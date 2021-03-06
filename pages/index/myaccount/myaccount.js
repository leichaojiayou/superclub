// pages/myaccount/myaccount.js
var app = getApp()
Page({
    data: {
        status: 0,
        header_img: 'https://cdn.51julebu.com/xiaochengxu/image/Kitty.png',
        name: '名称',
        idnumber: '---',
        clubRole: 0,
        clubRoleText: '',
    },

    onShow() {
        let userInfo = app.session.getUserInfo()
        this.setData({
            status: app.session.isTempUser() ? 0 : 1,
            header_img: userInfo.avatar,
            name: userInfo.nick,
            idnumber: userInfo.mobile
        })

        let clubInfo = app.session.getMyClubInfo()
        if (clubInfo != null && clubInfo.roleType && clubInfo.roleType >= 2) { //有担任管理以上级别
            // 2 会长 3 副会长 4 管理员
            let role = clubInfo.title + " | "
            if (clubInfo.roleType == 2) {
                role += '会长'
            } else if (clubInfo.roleType == 3) {
                role += '副会长'
            } else {
                role += '管理员'
            }
            this.setData({
                clubRole: 1,
                clubRoleText: role
            })
        }
    },

    nato_bindphone: function (e) {
        wx.navigateTo({
            url: '../bindphone/bindphone'
        })
    }
})