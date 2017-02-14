// pages/mine/me/me.js
const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    dataList: [],
    start: '0',
    more: 0,
    applyActCount: 0,
    hasRefresh: false,
    msg: {
      userName: app.session.getUserInfo().nick,
      userAvater: app.session.getUserInfo().avatar,
      userNum: app.session.getUserInfo().num,
      bindPhone: app.session.getUserInfo().mobile,
    }
  },
  onLoad: function () {
    this.countdown();
    this.getUserApplyList();
  },
  //请求用户活动报名记录
  getUserApplyList: function () {
    var that = this;
    mineApi.userApplyList({
      data: {
        user_id: app.session.getUserInfo().userID,//app.session.getUserInfo().userID //12219 //10237
        start: that.data.start,
        count: 30
      },
    },
      function (res) {
        var dataArr = res.data.activities;
        var dataList = that.data.dataList;
        //合并数组，用于上拉加载更多
        var renderArr = that.data.start == '0' ? dataArr : dataList.concat(dataArr);
        that.setData({
          dataList: renderArr,
          start: res.data.start,
          more: res.data.more,
          applyActCount: res.data.applyActCount,
          hasRefresh: false
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

  // 页面上拉触底事件的处理函数，用于上拉加载更多
  loadMore: function () {
    if (this.data.more == 1) {
      this.getUserApplyList();
    }
    return false;
  },
  refresh: function () {
    if(this.data.hasRefresh){
      return;
    }
    this.setData({
      start: '0',
      hasRefresh: true
    })
    this.getUserApplyList();
  },

  goToApplyDetail: function (e) {
    var id=e.currentTarget.id;
    app.wxService.navigateTo('activity/apply_detail/apply_detail',{
      applyId: id
    })
  },
  changeApply: function (e) {
    var id=e.currentTarget.id;
    app.wxService.navigateTo('activity/apply_detail/apply_detail',{
      applyId: id
    })
  },
  cancelApply: function (e) {
    var id=e.currentTarget.id;
    app.wxService.navigateTo('activity/apply_detail/apply_detail',{
      applyId: id
    })
  },
  toPay: function (e) {
    app.wxService.navigateTo('activity/payment/payment')
  },
  nato_myaccount: function (e) {
    app.wxService.navigateTo('index/myaccount/myaccount')
  },
  nato_myWallet: function (e) {
    app.wxService.navigateTo('mine/my_wallet/my_wallet')
  },
  countdown: function () {
    countdown(this);
  }

})

function countdown(that) {
  var list = that.data.dataList
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (item.payStatus == 1) {
      var remain_time = item.applyExpiredTime - new Date().getTime();
      if (remain_time > 0) {
        item.remainTime = dateformat(remain_time);
      }
    }
  }
  that.setData({
    dataList: list
  });
  var time = setTimeout(function () {
    that.countdown();
  }
    , 1000)
}

// 时间格式化输出
function dateformat(micro_second) {
  var remain_time = micro_second - new Date().getTime();
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 分钟位
  var min = Math.floor(second / 60);
  // 秒位
  var sec = second % 60;
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  return min + ":" + sec;
}