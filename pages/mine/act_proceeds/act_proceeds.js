const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    isClub: true,
    dataList: [],
    start: '0',
    more: 0,
    listCount: 0,
    userID: app.session.getUserInfo().userID
  },
  onLoad: function (options) {
    this.getProceedsList()
  },
  getProceedsList: function () {
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
        for(var i in dataArr){
          dataArr[i].beginTimeStr = app.util.formatTime5(dataArr[i].beginTime);
          dataArr[i].endTimeStr = app.util.formatTime5(dataArr[i].endTime);
        }
        //合并数组，用于上拉加载更多
        var renderArr = that.data.start == '0' ? dataArr : dataList.concat(dataArr);
        that.setData({
          dataList: renderArr,
          start: res.data.start,
          more: res.data.more,
          listCount: renderArr.length,
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
  loadMore: function () {
    if (this.data.more == 1) {
      this.getUserApplyList();
    }
    return false;
  },
  refresh: function () {
    this.setData({
      start: '0',
      hasRefresh: true
    })
    this.getProceedsList();
  },
  nato_proceedDetail: function (e) {
    var id = e.currentTarget.id
    app.wxService.navigateTo('mine/proceed_detail/proceed_detail',{
      activityID: id
    })
  }
})