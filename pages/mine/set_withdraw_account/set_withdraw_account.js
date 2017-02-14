const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    realName: '',
    bindList: [],
    bindCount: 0,
    unbindList: [],
    touch_start: 0,
    touch_end: 0,
    
  },
  onShow: function () {
    this.getGatherAccountList();
  },
  getGatherAccountList() {
    var that = this;
    mineApi.gatherAccountList({
      data: {
      },
    },
      function (res) {
        for (var i in res.data.bind) {
          res.data.bind[i].delete = false;
        }
        that.setData({
          realName: res.data.realName,
          bindList: res.data.bind,
          bindCount: res.data.bind.lenght,
          unbindList: res.data.unbind
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
  deleteAccountReq(accountId){
    var that = this;
    mineApi.gatherAccountList({
      data: {
        account_id: accountId
      },
    },
      function (res) {
        this.getGatherAccountList();
      },
      function (res) {
        console.log("fail");
      },
      function (res) {
        app.util.getErrorMsg(res);
      }
    )

  },
  clickAccount: function (e) {
    var index = e.currentTarget.id;
    //触摸时间距离页面打开的毫秒数  
    var touchTime = this.data.touch_end - this.data.touch_start;
    //如果按下时间大于350为长按  
    if (touchTime > 350) {
      var list = this.data.bindList;
      list[index].delete = true;
      this.setData({
        bindList: list
      })
    }else {
      app.globalData.withdrawAccount = this.data.bindList[index];
      wx.navigateBack();   //返回上一个页面
    }
  },
  cancelDelete(e){
    var id = e.currentTarget.id;
    var list = this.data.bindList;
      list[id].delete = false;
      this.setData({
        bindList: list
      })
  },
  deleteAccount(e){
    var index = e.currentTarget.id;
    var that = this;
    wx.showModal({
        title: '提醒',
        content: '确定要删除账号吗？',
        success: function (res) {
          if (res.confirm) {
            that.deleteAccountReq(this.data.bindList[index].accountID);
          }
        },
        function(res) {
          console.log(res.data);
        }
      })
  },
  //按下事件开始  
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  //按下事件结束  
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },

  nato_addWithdrawAccount: function (e) {
    var index = e.currentTarget.id;
    app.globalData.selectAccount = {
      accountName: this.data.unbindList[index].accountName,
      accountType: this.data.unbindList[index].accountType,
      realName: this.data.realName
    }
    app.wxService.navigateTo('mine/add_withdraw_account/add_withdraw_account')
  }
})