const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    money: 0,
    identityStatus: 1,
    unreadReceiptCount: 0
  },
  onLoad: function (options) {
    console.log(mineApi);
    this.getMoneyAccount();
  },
  onShow: function () {
    this.setData({
      unreadReceiptCount: app.globalData.unreadReceiptCount
    })
    if (app.globalData.submitIdverify != null && app.globalData.submitIdverify) {
      this.getMoneyAccount();
      app.globalData.submitIdverify = null;
    }
  },
  getMoneyAccount: function () {
    var that = this;
    mineApi.moneyAccount({
      data: {
      },
    },
      function (res) {
        that.setData({
          money: res.data.moneyAccount.money,
          identityStatus: res.data.moneyAccount.identityStatus, //res.data.moneyAccount.identityStatus //1
        })
      },
      function (res) {
        console.log("fail");
      },
      function (res) {
      }
    )

  },
  nato_actProceeds: function (e) {
    app.wxService.navigateTo('mine/act_proceeds/act_proceeds')
  },
  nato_withdraw: function (e) {
    app.wxService.navigateTo('mine/withdraw/withdraw')
  },
  nato_tradeRecord: function (e) {
    app.wxService.navigateTo('mine/trade_record/trade_record', {
      tradeType: 0
    })
  },

})