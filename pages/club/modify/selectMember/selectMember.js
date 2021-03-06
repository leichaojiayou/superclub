// pages/remove_member_page/remove_member_page.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
Page({
  data: {},


  onLoad: function (e) {
    this.setData({
      type: e.type,
      clubID: e.clubID,
      remove: e.remove,
      userID: ''
    })
    let param = { data: {} }, that = this;
    param.data.club_id = e.clubID;
    param.data.flag = 1;
    clubApi.memeberList(param, res => {
      let users = []
      if (that.data.type == 1 && !that.data.remove) {
        users = that.__pushMemberToArr(users, res);
      } else if (that.data.type == 1 && that.data.remove) {
        users = that.__pushMangerToArr(users, res);
      } else if (that.data.type == 0) {
        users = that.__pushUserToArr(users, res);
      }
      if (res.data.status == 1) {
        that.setData({
          members: users
        });
      }
    });
  },

  selectMember: function (e) {
    let userId = e.currentTarget.dataset.userid, members = this.data.members, userID = [], ids = '';
    if (this.data.type == 0) {
      for (let i = 0; i < members.length; i++) {
        if (members[i].userID == userId) {
          members[i].roleTpye = 2;
          userID.push(userId);
        } else {
          members[i].roleTpye = 0
        }
      }
    } else {
      userID = this.data.userID || [];
      for (let i = 0; i < members.length; i++) {
        if (members[i].userID == userId) {
          if (members[i].roleTpye == 1) {

            members[i].roleTpye = 0;
            for (let j = 0; j < userID.length; j++) {
              if (userID[j] == userId) {
                userID.splice(j, 1);
                break;
              }
            }

          } else {
            members[i].roleTpye = 1;
            userID.push(members[i].userID);
          }
        }
      }
    }
    this.setData({
      members: members,
      userID: userID
    })
  },


  appoint: function (e) {
    if (this.data.remove) {
      this.__removeMamger(e);
    } else {
      this.__appoint(e);
    }
  },
  __appoint: function (e) {
    const that = this;
    let param = { data: {} };
    param.data.club_id = this.data.clubID;
    param.data.user_ids = this.data.userID.join(',');
    param.data.formId = e.detail.formId;

    if (this.data.type == 0) {//任免副会长
      param.data.role_type = 3;
    } else if (this.data.type == 1 && !that.data.remove) {//任免管理员
      param.data.role_type = 4;
    }
    //权限任免
    clubApi.memeberRole(param, res => { }, res => { }, res => {
      console.log(res);
      if (res.data.status == 1) {
        // 0:voic chariman 1:manager
        let btn = {}, members = that.data.members, users = [],
          ids = param.data.user_ids, removeId = '';
        if (this.data.type == 0) { //设置副会长权限
          btn.setBtn = '设置副会长';
          btn.removeBtn = '移除副会长';
          for (let i = 0; i < members.length; i++) {
            if (param.data.user_ids == members[i].userID) {
              users.push(members[i])
              removeId = ids;
            }
          }

          App.event.trigger('club-ioc', { 'chrimanIoc.users': users }, {}, true);

          let preMangers = that.data.preMangers, newMangers = [];
          for (let i = 0; i < preMangers.length; i++) {
            if (preMangers[i].userID != ids) {
              newMangers.push(preMangers[i]);
            }
          }

          App.event.trigger('club-ioc', { 'mangerIoc.users': newMangers }, {}, true);

        } else {//设置管理员权限
          btn.setBtn = '设置管理员';
          btn.removeBtn = '移除管理员';
          for (let i = 0; i < members.length; i++) {
            if (param.data.user_ids == members[i].userID) {
              users.push(members[i])
            }
          }
          users = that.data.preMangers.concat(users);

          App.event.trigger('club-ioc', { 'mangerIoc.users': users }, {}, true);
        }

        let lister = {
          type: that.data.type,
          btn: btn,
          voicChriman: users,
          removeId: removeId,
          isReLoad:true
        }

        App.event.trigger('appointMember', lister, {}, true);
        wxService.navigateBack();
      } else {
        App.event.trigger('appointMember', { isReLoad:true}, {}, true);
        App.util.showTip(this, res.data.msg);
      }
    });
  },
  __removeMamger: function (e) {
    let that = this, param = { data: {} };
    param.data.club_id = this.data.clubID;
    param.data.user_ids = this.data.userID.join(',')
    param.data.role_type = 1;
    param.data.formId = e.detail.formId;
    clubApi.memeberRole(param, res => {
      if (res.data.status == 1) {
        let btn = {}, members = that.data.members, voicChriman = [], user_ids = param.data.user_ids;
        btn.setBtn = '设置管理员';
        btn.removeBtn = '移除管理员';

        for (let i = 0; i < members.length; i++) {
          if (!user_ids.match(members[i].userID)) {
            voicChriman.push(members[i]);
          }
        }

        App.event.trigger('club-ioc', { 'mangerIoc.users': voicChriman }, {}, true);
        let lister = {
          type: voicChriman.length == 0 ? 1 : 2,
          btn: btn,
          voicChriman: voicChriman,
          isReLoad:true
        }

        App.event.trigger('appointMember', lister, {}, true);
        wxService.navigateBack();
      } else {
        App.util.showTip(this, res.data.msg);
      }
    });

  },

  


  /**
   * user list
   */
  __pushUserToArr: function (users, res) {
    const members = res.data.members
    if (members[2].users) {//管理员
      let mangers = []
      let member = members[2].users
      for (let i = 0; i < member.length; i++) {
        users.push(member[i]);
        mangers.push(member[i]);
      }

      this.setData({
        preMangers: mangers
      });

    }
    if (members[3].users) {//成员
      let member = members[3].users;
      for (let i = 0; i < member.length; i++) {
        users.push(member[i]);
      }
    }
    return users
  },

  /**
   *             用于移除管理员
   *             roleTpye 
   *                      1: 是管理员
   */
  __pushMangerToArr: function (users, res) {
    const members = res.data.members;
    let userID = [];
    if (members[2].users) {//管理员
      let member = members[2].users
      for (let i = 0; i < member.length; i++) {
        users.push(member[i])
      }
    }
    return users
  },

  /**
   * member list
   */
  __pushMemberToArr: function (users, res) {
    const members = res.data.members
    if (members[2].users) {//管理员
      let mangers = [];
      let member = members[2].users
      for (let i = 0; i < member.length; i++) {
        mangers.push(member[i])
      }
      this.setData({
        preMangers: mangers
      });
    }
    if (members[3].users) {//成员
      let member = members[3].users
      for (let i = 0; i < member.length; i++) {
        users.push(member[i])
      }
    }
    return users
  },


})