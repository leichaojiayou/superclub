// pages/shezhishoukuanzhanghao/shezhishoukuanzhanghao.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService
Page({
  data: {},
  onLoad: function (e) {
    console.log(e);
    this.setData({
      clubID: e.clubID,
      payeeType: e.payeeType,
      roleType: e.roleType
    })
  },
  setMangerAccount: function (e) {
    if (this.data.roleType != 2) return
    this.setData({
      payeeType: 2
    })
  },
  setMasterAccount: function (e) {
    if (this.data.roleType != 2) return
    this.setData({
      payeeType: 1
    })
  },
  submit: function () {
    let param = { data: {} };
    param.data.club_id = this.data.clubID;
    param.data.payee_type = this.data.payeeType
    clubApi.accountPayeeType(param, res => {
      console.log(res)
      if (res.data.status === 1) {
        let pages = getCurrentPages(), prevPage = pages[pages.length - 2]
        App.event.trigger('club', {
          payeeType: param.data.payee_type
        })
        wxService.navigateBack();
      }
    });
  }
})