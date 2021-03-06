var app = getApp()
const actApi = app.api("actApi")

Page({
  data: {
    acts: [],
    //分页
    loading: false,
    start: 0,
    hasMore: true,
  },

  onLoad() {
    this.loadMoreMsgs()
  },

  viewAgreement() {
    app.wxService.showModal({
      title: '提示',
      content: '请用浏览器访问https://im.51julebu.com/resource/pages/starlevel_tab.html',
      showCancel: false
    })
  },

  selectAct: function (e) {
    let act = e.currentTarget.dataset.act
    if(act.applyCount == 0) {
      app.util.showTip(this, '还没人报名')
      return
    }
    let activityId = act.activityID
    app.wxService.navigateTo('index/group_page/group_page', {
      activityId: activityId,
      delta: 1
    })
  },

  loadMoreMsgs() {
    if (this.data.loading) return
    if (!this.data.hasMore) return
    let that = this
    this.data.loading = true
    let start = this.data.start
    actApi.manageActs({
      data: {
        user_id: app.session.getUserInfo().userID,
        exceptProxyAct: 1,
        start: start,
        count: 20
      }
    }, (res) => {
      //成功回调
      that.data.loading = false
      let activities = res.data.activities
      activities.forEach(e => {
        e.beginTime = app.util.formatTime2(e.begin, true)
        e.endTime = app.util.formatTime2(e.end, true)
        e.timeFlag = e.activityStatus == 0
      })
      let renderArray = that.data.acts.concat(activities)
      that.setData({
        acts: renderArray,
        start: res.data.start,
        hasMore: res.data.more == 1
      })
    }, res => {
      that.data.loading = false
    })
  }
})