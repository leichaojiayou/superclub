// pages/julebumingcheng/julebumingcheng.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
Page({
  data: {},
  onLoad: function (e) {
    let type = '';
    if (e.type) {
      type = e.type
    }
    this.setData({
      clubID: e.clubID,
      title: e.title,
      type: type
    })
  },

  //clean club name
  cleanValue: function () {
    this.setData({
      title: ''
    })
  },
  change: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  //post param to server
  formSubmit: function (e) {
    const that = this;
    let data = e.detail.value;
    let param = {
      data: data
    }
    clubApi.uniquenClubName(param, res => {
      if (res.data.status === 0) {
        let obj = {};
        obj.content = '俱乐部名称已被使用！';
        obj.showCancel = false;
        App.wxService.showModal(obj);
      } else {
        const type = that.data.type;
        let pages = getCurrentPages(), prevPage = pages[pages.length - 2]
        param.data.club_id = that.data.clubID;
        clubApi.modifyClub(param, res => {
          if (res.data.status) {
            //wxService.setGlobalTempClub(App, param.data)
            prevPage.setData({
              tempTitle: param.data.title
            })
            wxService.navigateBack();
          }
        })
      }
    });
  }
})