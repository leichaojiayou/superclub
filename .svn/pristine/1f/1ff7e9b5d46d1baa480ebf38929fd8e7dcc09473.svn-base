// pages/summary/summary.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
Page({
  data: {},
  onLoad: function (e) {
    this.setData({
      clubID: e.clubID,
      description: e.description
    })
  },
  sbmitForm: function (e) {
    let param = { data: {} },pages = getCurrentPages(), prevPage = pages[pages.length - 2];
    param.data.club_id = this.data.clubID;
    param.data.description = e.detail.value.description;
    clubApi.modifyClub(param, res => {
      if (res.data.status == 1) {
        //wxService.setGlobalTempClub(App, param.data)
        prevPage.setData({
          tempDescription:param.data.description
        })
        wxService.navigateBack();
      }
    })
  }
})