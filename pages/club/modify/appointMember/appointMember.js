// pages/dismiss/dismiss.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
const config = require('../../../../utils/constant')
Page({
  data: {
    header_img: config.CDN_URL + '/xiaochengxu/image/user@2x.png',
    isReLoad: false
  },
  onLoad(e) {
    App.event.addListener('appointMember', this);
    this.setData({
      type: e.type,
      removeType: e.type,
      clubID: e.clubID
    });
    if (e.type == 0) {
      this.__voicChriman(e);
    } else {
      this.__manager(e);
    }

  },


  setAppoint(e) {
    let type = e.currentTarget.dataset.type, clubID = this.data.clubID;
    wxService.navigateTo('club/modify/selectMember/selectMember', {
      type: type,
      clubID: clubID,
    });
  },

  removeBtn(e) {
    if (this.data.removeType == 0) {
      console.log(e);
      let userId = this.data.userID, param = { data: {} }, data = this.data, formId = e.detail.formId;
      param.data.club_id = data.clubID;
      param.data.user_ids = userId
      param.data.role_type = 1;
      param.data.formId = formId;
      clubApi.memeberRole(param, res => { }, res => { }, res => {
        if (res.data.status == 1) {
          this.setData({
            type: 0,
            voicChriman: null
          })
          App.event.trigger('club-ioc', { 'chrimanIoc.users': '' }, {}, true);
        }
      }
      );
    } else {
      let clubID = this.data.clubID;
      wxService.navigateTo('club/modify/selectMember/selectMember', {
        type: 1,
        clubID: clubID,
        remove: true
      });
    }
  },

  onShow: function () {
    if (this.data.isReLoad) {
      let e = {
        clubID: this.data.clubID,
        type: this.data.type,
        removeType: false,
      }
      this.onLoad(e);
    }
  },
  //type = 0
  __voicChriman: function (e) {
    App.wxService.setNavigationBarTitle('副会长任免');
    let param = { data: {} }, that = this;
    param.data.club_id = e.clubID;
    param.data.flag = 1;
    clubApi.memeberList(param, res => {
      if (res.data.status == 1) {
        const members = res.data.members, voicCHriman = members[1];
        let user = null, userID = '';
        if (voicCHriman.users.length > 0) {
          user = voicCHriman.users;
          userID = user[0] && user[0].userID;
          that.setData({
            voicChriman: user,
            userID: userID,
            type: 2,
            btn: {
              setBtn: '设置副会长',
              removeBtn: '移除副会长'
            }
          });
        }
      }
    });
  },

  //type :1
  __manager: function (e) {
    App.wxService.setNavigationBarTitle('管理员任免');
    let param = { data: {} }, that = this;
    param.data.club_id = e.clubID;
    param.data.flag = 1;
    clubApi.memeberList(param, res => {
      if (res.data.status == 1) {
        const members = res.data.members, voicChriman = members[2];
        let user = null, userID = [], users = voicChriman.users;
        if (users.length > 0) {
          for (let i = 0; i < users.length; i++) {
            userID.push(users[i].userID)
          }
          that.setData({
            voicChriman: users,
            userID: userID.join(','),
            type: 2,
            btn: {
              setBtn: '设置管理员',
              removeBtn: '移除管理员'
            }
          })
        }
      }
    });
  }

})