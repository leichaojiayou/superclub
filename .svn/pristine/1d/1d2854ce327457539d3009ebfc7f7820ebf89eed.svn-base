// pages/duanxintixing/duanxintixing.js

const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService
Page({
  data: {},

  onLoad: function (e) {
    this.setData({
      clubID: e.clubID,
      needJoinCheck: e.needJoinCheck
    })
  },

  setAnyOneJoin: function (e) {
    this.setData({
      needJoinCheck: 0
    })
  },
  setLessJoin: function (e) {
    this.setData({
      needJoinCheck: 1
    })
  },
  submit: function () {
    let param = {data:{}},pages = getCurrentPages(), prevPage = pages[pages.length - 2];;
    param.data.club_id = this.data.clubID;
    param.data.need_join_check = this.data.needJoinCheck
    clubApi.modifyClub(param, res => { 
      console.log(res)
      if (res.data.status === 1) {
          //wxService.setGlobalTempClub(App, param.data);
          prevPage.setData({
            tempNeedJoinCheck:param.data.need_join_check
          })
          wxService.navigateBack();
        }
    });

  }



})