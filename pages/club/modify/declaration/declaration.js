// pages/xuanyan/xuanyan.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
Page({
  data: {},

  onLoad: function (e) {
    this.setData({
      clubID: e.clubID,
      slogan: e.slogan,
      type: e.type,
    })
    setTimeout(() => {
      let data = this.data;
      this.setData({
        newSlogan: data.slogan,
      })
    }, 300);
  },

  delay: function () {
    let data = this.data;
    this.setData({
      newSlogan: data.slogan,
    })
  },

  changeText: function (e) {
    this.setData({
      slogan: e.detail.value
    })
  },

  submit: function () {
    let param = { data: {} };
    param.data.club_id = this.data.clubID;
    param.data.slogan = this.data.slogan;
    param.method = 'POST';
    if (!this.data.type) {
      clubApi.modifyClub(param, res => {
        if (res.data.status == 1) {
          App.event.trigger('club', {
            slogan: param.data.slogan
          })
          App.event.trigger('clubHome', {
            slogan: param.data.slogan
          })
        }
      })
    } else {
      App.event.trigger('club_fill', {
        slogan: this.data.slogan
      }, {}, true);
    }
    wxService.navigateBack();

  },
  // onUnload: function () {
  //   App.event.trigger('club_fill', {
  //     slogan: this.data.slogan
  //   }, {}, true);
  // }


})