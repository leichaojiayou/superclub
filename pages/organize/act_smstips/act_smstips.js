var app = getApp()
Page({
  data: {
    beginSmsTime: 86400,
    beginSmsTimes: []
  },
  onLoad: function (options) {
    console.info(options)
    var beginSmsTime = options.beginSmsTime
    var beginSmsTimes = JSON.parse(options.beginSmsTimes)
    this.setData({
      beginSmsTimes: beginSmsTimes,
      beginSmsTime: beginSmsTime
    })
  },
  onUnload: function () {
    // 页面关闭
    var smsTimes = {}
    smsTimes.beginSmsTime = this.data.beginSmsTime;
    smsTimes.beginSmsTimes =  this.data.beginSmsTimes;
    app.globalData.smsTimes = smsTimes;  //存储数据到app对象上
   
  },
  changehidden: function (e) {
    var index = e.target.id;
    var smsTimes = this.data.beginSmsTimes;
    for (var i = 0; i < smsTimes.length; i++) {
      smsTimes[i].isDefault = 0;
    }
    smsTimes[index].isDefault = 1;
    this.setData({
      beginSmsTime: smsTimes[index].value,
      beginSmsTimes: smsTimes
    })
  }

})