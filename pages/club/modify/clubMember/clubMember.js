// 俱乐部成员
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
const util = require('../../../../utils/util')
Page({
  data: {
    search_text: "搜索",
    memberIoc: [
      util.getClubImg(2, true),
      util.getClubImg(3, true),
      util.getClubImg(4, true),
      util.getClubImg(1, true),]

  },
  //组按钮
  bindgroup_button(e) {
    const obj = e.currentTarget.dataset;
    const id = obj.id
    const group_list = this.data.membersList;
    group_list[id].click_status = !group_list[id].click_status;
    this.setData({
      membersList: group_list,
    });

  },
  btn(e) {
    this.setData({
      statu: 1,
    });
  },

  onLoad: function (e) {
    this.setData({
      clubID: e.clubID
    })
    let param = { data: {} }, that = this;
    param.data.club_id = e.clubID;
    clubApi.memeberList(param, res => {
      if (res.data.status == 1) {
      
        const members = res.data.members
        let list = [], statu = 3;
       
        for (let i = 0; i < members.length; i++) {
          let member = {};
          member.click_status = true;
          member.ioc = that.data.memberIoc[i];
          member.text = members[i].roleName;
          member.num = members[i].users.length;
          member.list = members[i].users
          if (i === 3) {
            member.click_status = false;
          }
          statu = 1;
          list.push(member);
        }
         console.log(list)
        that.setData({
          membersList: list,
          statu: statu
        });
      }
    });
  }

})