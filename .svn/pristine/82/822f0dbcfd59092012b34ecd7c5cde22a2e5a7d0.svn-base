// pages/remove_member_page/remove_member_page.js
const App = getApp();
Page({
  data: {
    list_group: [{
      text: 'A', list: [{
        img: '../../../assets/images/user.png', name: '用户昵称1', check: false
      }, {
        img: '../../../assets/images/user.png', name: '用户昵称2', check: false
      }]
    }, {
      text: 'B', list: [{
        img: '../../../assets/images/user.png', name: '用户昵称3', check: false
      }, {
        img: '../../../assets/images/user.png', name: '用户昵称4', check: false
      }]
    }],
  },
  bind_Select(e) {
    const obj = e.currentTarget.dataset;
    const id = obj.id;
    const item = obj.item;
    const List_group = this.data.list_group;
    List_group[id].list[item].check = !List_group[id].list[item].check;
    this.setData({
      list_group: List_group,
    });
  }
  ,
  onLoad: function (e) {
    this.setData({
      type: e.type
    })
  },

  appoint: e => {
    let result = e.currentTarget.dataset.result;
    //0:voic chariman 1:manager
    App.wxService.navigateTo('club/appointMember/appointMember', {
      type: 2,
      status: 1,
      result:result
    });
  },
  
  cancel: e => {
    App.wxService.navigateBack();
  }

})