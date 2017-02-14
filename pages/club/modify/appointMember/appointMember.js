// pages/dismiss/dismiss.js
const App = getApp();
Page({
  data: {
    header_img: '../../../assets/images/user@2x.png',
    status3_name: '副会长昵称'
  },

  onLoad(e) {
    let btn = {};
    if (e.result == 0) {
      btn.setBtn = '设置副会长';
      btn.removeBtn = '移除副会长';
    } else {
      btn.setBtn = '设置管理员';
      btn.removeBtn = '移除管理员';
    }
    this.setData({
      //0:voic  chariman  1: manager   2: 
      type: e.type,
      status: e.status || 0,
      btn: btn
    });

    if (e.type == 0) {
      App.wxService.setNavigationBarTitle('副会长任免');
    } else {
      App.wxService.setNavigationBarTitle('管理员任免');
    }
  },
  setAppoint(e){
    let type = e.currentTarget.dataset.type;
    App.wxService.navigateTo('club/selectMember/selectMember', {
      type: type
    });
  },
  removeBtn(){
    App.wxService.navigateTo('club/removeMember/removeMember', {
      type: 1
    });
  }

})