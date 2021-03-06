// pages/remove_member_page/remove_member_page.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
const config = require('../../../../utils/constant')
Page({
  data: {
    search_text: '搜索',
    remove_text: '每日移除上限',
    remove: '20人',
    icon_img: config.CDN_URL + '/xiaochengxu/image/black-errow@2x.png',
    search: config.CDN_URL + '/xiaochengxu/image/search.png',
    button_text: '取消',
    button_text1: '确定',

  },
  onLoad: function (e) {
    this.setData({
      clubID: e.clubID
    })
    let param = { data: {} }, that = this;
    param.data.club_id = e.clubID;
    param.data.flag = 0;
    clubApi.memeberList(param, res => {
      if (res.data.status == 1) {
        let members = res.data.members;
        members.splice(0,1);
        that.setData({
          members: members
        });
      }
    });
  },

  select: function (e) {
    let members = this.data.members, userId = e.currentTarget.dataset.userid,
      ids = this.data.ids ||[], noMember = true;
    for (let i = 0; i < members.length; i++) {
      let user = members[i].users;
      for (let j = 0; j < user.length; j++) {
        if (userId == user[j].userID) {
          if (user[j].flag) {
            user[j].flag = false;
            for (let k = 0; k < ids.length; k++) {
              if (userId == ids[k]) {
                ids.splice(k, 1);
                break;
              }
            }
          } else {
            user[j].flag = true;
            ids.push(user[j].userID)
            noMember = true;
          }
        }
      }
    }
    if (ids.length == 0) {
      noMember = false;
    }
    this.setData({
      members: members,
      ids: ids,
      noMember: noMember
    });

  },

  ensure: function (e) {
    let data = this.data, param = { data: {} }, count = 0;
    param.data.club_id = data.clubID;
    param.data.user_ids = data.ids.join(',');
    param.data.formId = e.detail.formId;
    let user_ids = param.data.user_ids.split(',');
    for (let i = 0; i < user_ids.length; i++) {
      if (user_ids[i]) {
        count++;
      }
    }
    let toastParam = {
      content: '确定移除' + count + '位成员？',
    }
    wxService.showModal(toastParam, res => {
      if (res.confirm) {
        clubApi.memberRemove(param, res => { }, res => { }, res => {
          console.log(res);
          if (res.data.status == 1) {
            wxService.redirectTo('./removeMember?clubID='+this.data.clubID);
          }else{
            App.util.showTip(this, res.data.msg);
          }
        });
      }
    });
  },
  cancel: e => {
    App.wxService.navigateBack();
  }
})