const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    dataList: [],
    start: '0',
    more: 0,
    listCount: -1,
    loading: false,
    userID: ''
  },
  onLoad: function (options) {
    this.setData({
      userID: app.session.getUserInfo().userID
    })
    this.getProceedsList();
  },
  getProceedsList: function () {
    if (this.data.loading) {
      return;
    }
    this.data.loading = true;
    var that = this;
    mineApi.proceedsList({
      data: {
        start: that.data.start,
        count: 20
      },
    },
      function (res) {
        var dataArr = res.data.activities;
        var dataList = that.data.dataList;
        for (var i in dataArr) {
          dataArr[i].beginTimeStr = app.util.formatTime5(dataArr[i].beginTime);
          dataArr[i].endTimeStr = app.util.formatTime5(dataArr[i].endTime);
          if (dataArr[i].title.length > 25) {
            dataArr[i].title = dataArr[i].title.substring(0, 25) + '...';
          }
        }
        //合并数组，用于上拉加载更多
        var renderArr = that.data.start == '0' ? dataArr : dataList.concat(dataArr);
        that.setData({
          dataList: renderArr,
          start: res.data.start,
          more: res.data.more,
          listCount: renderArr.length
        })
        //未读收款数清零
        if (app.globalData.unreadReceiptCount != null && app.globalData.unreadReceiptCount != 0) {
          app.globalData.unreadReceiptCount = 0;
        }
      },
      function (res) {
        console.log("fail");
      },
      function (res) {
        that.data.loading = false;
      }
    )

  },
  loadMore: function () {
    if (this.data.more == 1) {
      this.getUserApplyList();
    }
    return false;
  },
  refresh: function () {
    this.setData({
      start: '0'
    })
    this.getProceedsList();
  },
  nato_proceedDetail: function (e) {
    var id = e.currentTarget.id
    app.wxService.navigateTo('mine/proceed_detail/proceed_detail', {
      activityID: id
    })
  }
})