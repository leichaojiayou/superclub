// pages/baomingxiangqing/baomingxiangqing.js
Page({
    data: {
        // 1 一行字，2 两行字
        header_status: 1,
// 取消报名按状态 true 不可以点击颜色　false 可以点击颜色
        item7_btn_status: false,
        // 二维码下的取消报名状态 true 不可以点击颜色　false 可以点击颜色
        item7_btn_status: true
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
    },
    nato_apply_page: function (e) {
        wx.navigateTo({
            url: '../apply_page/apply_page'
        })
    },
    nato_order_details_page: function (e) {
        wx.navigateTo({
            url: '../order_details_page/order_details_page'
        })
    }
})