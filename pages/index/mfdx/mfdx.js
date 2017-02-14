var app = getApp()
const actApi = app.api("actApi")

Page({
  data: {
    item3: [{
      img: '',
      name: '潍坊市马拉松运动协会2017黄河口东营-国际马拉松赛报名啊啊啊啊啊啊啊啊啊啊啊啊',
      time: '2017.12.21 17:30',
      club_name: '',
      money: '',
      freemsg: '1',
      enlistnumber: '12'
    }],
    acts: []
  },

  onLoad() {
    let that = this
    actApi.manageActs({
      data: {
        user_id: app.session.getUserInfo().userID,
        exceptProxyAct: 1
      }
    }, (res) => {
      //成功回调
      that.setData({
        acts: res.data.activities
      })
    })
  },

  selectAct: function (e) {
    let activityId = e.currentTarget.dataset.id
    app.wxService.navigateTo('index/group_page/group_page', {
      activityId: activityId,
      delta: 1
    })
  }
})