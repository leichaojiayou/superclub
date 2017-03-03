var app = getApp()
Page({
  data:{
       walks:[
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
    ],
    runs:[
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
    ],
    rides:[
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
      {img:'https://cdn.51julebu.com/club/img/170210/64940aaf4745433c9486c896e51d2e4e.jpg'},
    ],
    // 图片预览模式
    previewMode: false,

    modelImgSrc:""
  },
 
  // 进入预览模式
  enterPreviewMode:function(e) {
    
    var img = e.currentTarget.id;
    var imgItem = img.split("_")[0];
    var imgIndex = img.split("_")[1];
   
    if(imgItem=="walks"){
      this.setData({modelImgSrc:this.data.walks[imgIndex].img})
    }
    if(imgItem=="runs"){
      this.setData({modelImgSrc:this.data.runs[imgIndex].img})
    }
    if(imgItem=="rides"){
      this.setData({modelImgSrc:this.data.runs[imgIndex].img})
    }
  
    this.setData({previewMode: true});
  },

  // 退出预览模式
  leavePreviewMode:function() {
    this.setData({previewMode: false});
  },
  choseActCover: function() {
    app.globalData.modelImgSrc =this.data.modelImgSrc;  //存储数据到app对象上
    wx.navigateBack();
  },


})