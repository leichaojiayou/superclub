// pages/payment/payment.js
Page({
  data:{
    item:{
      payremainingtime:'29:00',
      activityname:'活动名称活动名称活动名称活动名称活动名称活动名称活动名称活动名称',
      starttime:'11月12日 12:00',
      msg:'大风吹 - 1234567',
      cost:'¥120.00'
    },
    agreenstatu:false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  agreenbtn:function(e){
    this.setData({
      agreenstatu:!this.data.agreenstatu
    })
  }
})