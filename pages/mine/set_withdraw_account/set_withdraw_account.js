const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    realName: '',
    bindList: [],
    bindCount: 0,
    unbindList: [],

    touch_startX: 0,
    touch_startY: 0,
    touch_endX: 0,
    touch_endY: 0
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
          if(res.data.bind[i].accountName == '支付宝'){
            res.data.bind.splice(i, 1); 
          }
        }
        for(var i in res.data.unbind){
          if(res.data.unbind[i].accountName == '支付宝'){
            res.data.unbind.splice(i, 1); 
          }
        }
        that.setData({
          realName: res.data.realName,
          bindList: res.data.bind,
          bindCount: res.data.bind.length,
          unbindList: res.data.unbind
        })
      },
      function (res) {
        console.log("fail");
      },
      function (res) {
      }
    )
  },
  deleteAccountReq: function (accountId) {
    var that = this;
    mineApi.deleteGatherAccount({
      data: {
        account_id: accountId
      },
    },
      function (res) {
        that.getGatherAccountList();
        if(app.globalData.withdrawAccount.accountID!=null && app.globalData.withdrawAccount.accountID==accountId){
          app.globalData.withdrawAccount = {};
        }
      },
      function (res) {
        console.log("fail");
      },
      function (res) {
      }
    )
  },
  clickAccount: function (e) {
    var index = e.currentTarget.id;
    var list = this.data.bindList;
    app.globalData.withdrawAccount = this.data.bindList[index];
    wx.navigateBack();   //返回上一个页面
  },
  cancelDelete(e) {
    var index = e.currentTarget.id;
    var list = this.data.bindList;
    list[index].delete = false;
    this.setData({
      bindList: list
    })
  },
  deleteAccount(e) {
    var index = e.currentTarget.id;
    var that = this;
    wx.showModal({
      title: '提醒',
      content: '确定要删除账号吗？',
      success: function (res) {
        if (res.confirm) {
          that.deleteAccountReq(that.data.bindList[index].accountID);
        }
      },
      function(res) {
        console.log(res.data);
      }
    })
  },
  //按下事件开始  
  mytouchstart: function (e) {
    this.data.touch_startX = e.touches[0].pageX;
    this.data.touch_startY = e.touches[0].pageY;
  },

  //滑动事件  
  mytouchmove: function (e) {
    var index = e.currentTarget.id;
    var list = this.data.bindList;
    let currentX = e.touches[0].pageX;
    let currentY = e.touches[0].pageY;

    if ((currentX - this.data.touch_startX) < 0) {
      list[index].delete = true;
      this.setData({
        bindList: list
      })
    } else {
      list[index].delete = false;
      this.setData({
        bindList: list
      })
    }
  },

  nato_addWithdrawAccount: function (e) {
    var index = e.currentTarget.id;
    var realName = '';
    if(app.globalData.realName!=null && app.globalData.realName!=''){
      realName = app.globalData.realName;
    }else{
      realName = this.data.realName;
    }
    app.globalData.selectAccount = {
      accountName: this.data.unbindList[index].accountName,
      accountType: this.data.unbindList[index].accountType,
      realName: realName
    }
    app.wxService.navigateTo('mine/add_withdraw_account/add_withdraw_account')
  }
})