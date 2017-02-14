// 俱乐部成员
Page({
  data: {
    search_text: "搜索",
    group_list: [{
      click_status: true, text: "管理员", num: "3人", list: [{
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: "会长"
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: "副会长"
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: "管理员"
      }]
    }, {
      click_status: true, text: "成员", num: "6人", list: [{
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: ""
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: ""
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: ""
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: ""
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: ""
      }, {
        img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: ""
      }]
    }],
    list2: [{
      img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: "会长"
    }, {
      img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: "副会长"
    }, {
      img: "../images/user.png", icon: "../images/user.png", name_text: "用户名称", grade_text: "管理员"
    }]
    ,
    statu: 3,
    // statu: 1  俱乐部成员1
    //  statu: 2 俱乐部成员2
    //   statu: 3  俱乐部成员3
  },
  //组按钮
  bindgroup_button(e) {
    const obj = e.currentTarget.dataset;
    const id = obj.id
    const group_list = this.data.group_list;
    group_list[id].click_status = !group_list[id].click_status;
    this.setData({
      group_list: group_list,
    });

  },
  btn(e) {
    this.setData({
      statu: 1,
    });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})