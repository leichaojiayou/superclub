// pages/remove_member_page/remove_member_page.js
const App = getApp();
Page({
  data: {
    search_text: '搜索',
    remove_text: '每日移除上限',
    remove: '20人',
    icon_img: '../../../assets/images/right-errow.png',
    list_group: [{
      text: '管理员', num: '2', list: [{
        img: '../../../assets/images/user.png', name: '用户昵称1', check: false
      }]
    }, {
      text: '成员', num: '3', list: [{
        img: '../../../assets/images/user.png', name: '用户昵称3', check: false
      }]
    }],
    button_text: '取消',
    button_text1: '确定',
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
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  ensure: function(e) {
   App.wxService.redirectTo('./removeMember')
  },
  cancel: e => {
    App.wxService.navigateBack();
  }
})