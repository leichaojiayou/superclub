// pages/summary/summary.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
Page({
  data: {},
  onLoad: function (e) {
    this.setData({
      clubID: e.clubID,
      description: e.description,
      type: e.type
    })
    setTimeout(() => {
      let data = this.data;
      this.setData({
        newDescription: data.description,
      })
    }, 300);
  },


  delay: function () {
    let data = this.data;
    this.setData({
      newDescription: data.description,
    })
  },

  changeText: function (e) {
    this.setData({
      description: e.detail.value
    })
  },

  submit: function () {
    let param = { data: {} };
    param.data.club_id = this.data.clubID;
    param.data.description = this.data.description;
    param.method = 'POST';
    if (!this.data.type) {
      clubApi.modifyClub(param, res => { }, res => { }, res => {
        if (res.data.status == 1) {
          App.event.trigger('club', {
            description: param.data.description
          })
        }
      })
    } else {
      App.event.trigger('club_fill', {
        desc: this.data.description
      }, {}, true);
    }
    wxService.navigateBack();
  },

  // onUnload: function () {
  //   App.event.trigger('club_fill', {
  //     desc: this.data.description
  //   }, {}, true);
  // }


})