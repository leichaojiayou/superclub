var app = getApp()
Page({
  data: {
    hidden: 0,
    actType: 1
  },
  onLoad: function (options) {
    var actType = options.actType;
    if (actType && actType != "") {
      this.setData({ actType: actType })
    }
  },
    onUnload: function () {
    // 页面关闭
    // 页面隐藏
    app.globalData.actType = this.data.actType
     
  },
  openAct: function (e) {
    console.log(e.target.id);
    this.setData({
      hidden: 0,
      actType: 1
    })
  },
  clubAct: function (e) {
    console.log(e.target.id);
    this.setData({
      hidden: 1,
      actType: 2
    })
  },

})