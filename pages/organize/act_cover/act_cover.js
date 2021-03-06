var app = getApp()
const utils = app.util;
var organizeApi = app.api("organizeApi");
Page({
  data: {
    resList: [],
    walks: [],
    runs: [],
    rides: [],
    // 图片预览模式
    previewMode: false,
    modelImgSrc: ""
  },
  onLoad: function () {
    var that = this
    organizeApi.getActCover({//活动校验
      data: {}
    },
      function (res) {
        console.info(res)
        var resList = res.data.result
        that.setData({ resList: resList })
      });
  },

  // 进入预览模式
  enterPreviewMode: function (e) {
    var img = e.currentTarget.id;
    var imgItem = img.split("_")[0];
    var imgsrc = img.split("_")[1];
    this.setData({ previewMode: true, modelImgSrc: imgsrc });
  },

  // 退出预览模式
  leavePreviewMode: function () {
    this.setData({ previewMode: false });
  },
  choseActCover: function () {
    app.globalData.modelImgSrc = this.data.modelImgSrc;  //存储数据到app对象上
    wx.navigateBack();
  },


})