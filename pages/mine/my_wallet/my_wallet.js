// pages/wallet_page/wallet_page.js
const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    money: 1,
    identityStatus: 1
  },
  onLoad: function (options) {
    console.log(mineApi);
    this.getMoneyAccount();
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
        app.util.getErrorMsg(res);
      }
    )

  },
  nato_actProceeds: function (e) {
    app.wxService.navigateTo('mine/act_proceeds/act_proceeds')
  },
  nato_withdraw: function (e) {
    app.wxService.navigateTo('mine/withdraw/withdraw')
  },
  nato_idverify: function (e) {
    app.wxService.navigateTo('mine/idverify/idverify')
  },
  nato_transaction: function (e) {
    app.wxService.navigateTo('mine/transaction_record_page/transaction_record_page')
    // app.wxService.navigateTo('mine/order_details_page/order_details_page')
  },

  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})