const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    withdrawSuccess: {}
  },
  onShow: function () {
    if (app.globalData.withdrawSuccess) {
      app.globalData.withdrawSuccess.applyTimeStr = app.util.formatTime6(app.globalData.withdrawSuccess.applyTime);
      this.setData({
        withdrawSuccess: app.globalData.withdrawSuccess
      })
      app.globalData.withdrawSuccess = {};
    } else {
      wx.navigateBack();
    }
  },
  btn_finish: function () {
    wx.navigateBack();
  }
})