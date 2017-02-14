const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    dataList: [],
    start: '0',
    more: 0,
    hasRefresh: false,
    item: [
      { txt: '支付宝 - 提现', money: '50.00', time: '2015-07-12 20:34:34', statu: '正在审核', color: 'rgb(255,112,68) ' },
      { txt: '招商银行 - 提现', money: '50.00', time: '2015-07-12 20:34:34', statu: '已打款', color: 'rgb(61,209,165) ' },
    ]
  },
  onLoad: function () {
    this.getWithdrawList();
  },
  getWithdrawList: function () {
    var that = this;
    mineApi.moneyWithdrawList({
      data: {
        start: that.data.start,
        count: 20
      },
    },
      function (res) {
        var dataArr = res.data.record;
        var dataList = that.data.dataList;
        for(var i in dataArr){
          dataArr[i].createTimeStr = app.util.formatTime6(dataArr[i].createTime);
        }
        //合并数组，用于上拉加载更多
        var renderArr = that.data.start == '0' ? dataArr : dataList.concat(dataArr);
        that.setData({
          dataList: renderArr,
          start: res.data.start,
          more: res.data.more,
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
      this.getWithdrawList();
    }
    return false;
  },
  refresh: function () {
    if (this.data.hasRefresh) {
      return;
    }
    this.setData({
      start: '0',
      hasRefresh: true
    })
    this.getWithdrawList();
  },
  nato_withdrawDetail: function (e) {
    var id=e.currentTarget.id;
    app.wxService.navigateTo('mine/withdraw_detail/withdraw_detail',{
      billId: id
    })
  }
})