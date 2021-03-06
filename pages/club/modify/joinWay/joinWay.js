// pages/duanxintixing/duanxintixing.js

const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService
Page({
  data: {},

  onLoad: function (e) {
    this.setData({
      clubID: e.clubID,
      needJoinCheck: e.needJoinCheck,
      type: e.type
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
    let param = { data: {} }, pages = getCurrentPages(), prevPage = pages[pages.length - 2];
    param.data.club_id = this.data.clubID;
    param.data.need_join_check = this.data.needJoinCheck
    if (!this.data.type) {
      clubApi.modifyClub(param, res => {
        console.log(res)
        if (res.data.status === 1) {
          App.event.trigger('club', {
            needJoinCheck: param.data.need_join_check
          })
          wxService.navigateBack();
        }
      });
    } else {//创建俱乐部时
      prevPage.setData({
        tempNeedJoinCheck: param.data.need_join_check
      })
      wxService.navigateBack();
    }

  }



})