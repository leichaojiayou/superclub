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
      type: type,
      newTitle: e.title
    })

  },

  changeTxt: function (e) {
    this.setData({
      newTitle: e.detail.value
    })
  },
  //clean club name
  cleanValue: function () {
    this.setData({
      title: '',
      newTitle:false   
    })
  },

  //post param to server
  formSubmit: function (e) {

    const that = this;
    let formData = e.detail.value;
    let param = {
      data: formData
    }
    if (param.data.title.length > 15) {
      App.util.showTip(this, '不可超过15个字符');
      return
    }
    param.data.formId = e.detail.formId;
    if (this.data.title == formData.title) {
      wxService.navigateBack();
      return;
    }
    clubApi.uniquenClubName(param, res => { }, res => { }, res => {
      if (res.data.status === 0) {
        App.util.showTip(this, '俱乐部名称已被使用！')
      } else {
        const type = that.data.type;
        if (!type) {
          param.data.club_id = that.data.clubID;
          clubApi.modifyClub(param, res => {
            if (res.data.status == 1) {
              App.event.trigger('club', {
                title: param.data.title
              });
              App.event.trigger('clubHome', {
                title: param.data.title
              })

              wxService.navigateBack();
            }
          })
        } else {//创建俱乐部时
          App.event.trigger('club_fill', {
            title: param.data.title
          }, {}, true)
          wxService.navigateBack();
        }
      }
    });
  }
})