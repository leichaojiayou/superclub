
// pages/clubhome/clubhome.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
const config = require('../../../utils/constant')
Page({
  data: {
    img: {
      imgStart: config.CDN_URL + '/xiaochengxu/image/stars.png',
      imgRight: config.CDN_URL + '/xiaochengxu/image/right-errow.png',
      imgQrcode: config.CDN_URL + '/xiaochengxu/image/qrcode.png',
      imgMember: config.CDN_URL + '/xiaochengxu/image/member@2x.png',
      imgAct: config.CDN_URL + '/xiaochengxu/image/active.png',
    },
    count: 10,
  },

  onLoad: function (e) {
    this.getClubIndex(true);
    this.getMamberActivity();
  },

  /**
   * 获取俱乐部主页
   */
  getClubIndex: function (loading) {
    const that = this;
    let param = {}
    let data = {
      club_no: 30328
    }
    param.data = data;
    if (loading) {
      param.loading = loading;
    }
    clubApi.clubIndex(param, (res) => {
      that.setData({
        club: res.data.club
      })
    });
  },

  /**
   * 获取用户活动信息
   */
  getMamberActivity: function () {
    const that = this;
    let param = {}
    let data = {
      user_id: 14389,
      start: 0,
      count: that.data.count,
      exceptProxyAct: 0
    }
    param.data = data;
    clubApi.clubActs(param, (res) => {
      let data = res.data;
      if (data) {
        let activities = data.activities;
        activities.forEach((e) => {
          e.flag = App.util.compareDate(new Date(e.end));
          e.begin = App.util.formatTime2(e.begin);
          e.end = App.util.formatTime2(e.end);
        });
        that.setData({
          activity: activities,
          count: that.data.count + 10
        })
      }
    })
  },

  lower: function (e) {
    this.getMamberActivity()
  },

  actDetail: function (e) {
    wxService.navigateTo('activity/act_detail/act_detail', { activityID: e.currentTarget.dataset.actid })
  },

  toClubInformation: function () {
    wxService.navigateTo('club/clubInformation/clubInformation', { club_no: 30328 })
    //wxService.uploadImg(res=>{console.log(res)})
  },

  onShow: function () {
    let tempClub = App.globalData.temp.club
    if (tempClub) {
      this.setData({
        modifyTitle: tempClub.title,
        modifyLogo: tempClub.logo,
        modifyfeatures: tempClub.features,
        modifySlogan: tempClub.slogan
      })
    }

  },
  onUnload: function () {
    wxService.cleanTemp(App, 'club');
  }
})
