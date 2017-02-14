// pages/huodongleixing/huodongleixing.js
Page({
  data:{
    hidden:0
  },
changehidden: function (e) {
    console.log(e.target.id);
    this.setData({
      hidden: 0
    })
  },
  changehidden1: function (e) {
    console.log(e.target.id);
    this.setData({
      hidden:1
    })
  },

})