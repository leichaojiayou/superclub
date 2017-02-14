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
      payeeType: e.payeeType
    })
  },
  setMangerAccount: function (e) {
    this.setData({
      payeeType: 2
    })
  },
  setMasterAccount: function (e) {
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
        prevPage.setData({
          tempPayeetype: param.data.payee_type
        })
        //wxService.setGlobalTempClub(App, param.data);
        wxService.navigateBack();
      }
    });

  }
})