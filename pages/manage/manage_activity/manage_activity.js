
Page({
  data: {
    count: 1,
    activity:{},

    titleNames:[
      '报名','点赞','评论','分享'
    ],
    titleDatas:[
      '0','0','0','0'
    ],

    imageAndTitles:[
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/manage.png', content: '报名管理' },
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/msg.png', content: '免费短信' },
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/edit.png', content: '编辑活动' },
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/active.png', content: '查看活动' },
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/onemore.png', content: '再发一个' },
    ],
    imageTitleDatas:{
      img: 'https://cdn.51julebu.com/xiaochengxu/image/close.png', content: '关闭报名'
    },
  
    item2: [
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/link.png', content: '复制活动链接' },
      { img: 'https://cdn.51julebu.com/xiaochengxu/image/qrcode.png', content: '下载活动二维码' },
    ]
  },
  skip: function (e) {
    console.log(e.target);
    switch (e.target.id) {
      case '0':
         //报名管理
         var url = "../manage_apply/manage_apply?activityID="+this.data.activity.activityID+"&howToPay="+this.data.activity.howToPay
         console.log(url)
         wx.navigateTo({
                url: url
            })
        break;
      case '1':
        wx.navigateTo({
          url: '../freemsg/freemsg'
        })
        break;
      case '3':
        wx.navigateTo({
          url: '../act_detail/act_detail'
        })
        break;
      case '4':
        break;
      case '5':
      //代理活动判读
        var that = this 
        if(this.data.activity.activityStatus == 0){
            wx.showModal({
              title: '关闭报名？',
              content: '报名页面仍可看到，只是不能继续报名',
              success: function(res) {
                if (res.confirm) {
                  that.requestCloseApply(that.data.activity.activityID)
                  console.log('用户点击确定')
                }
              }
            })
        }else{
            wx.showModal({
              title: '打开报名？',
              content: '确定打开报名？',
              success: function(res) {
                if (res.confirm) {
                  that.requestOpenApply(that.data.activity.activityID)
                  console.log('用户点击确定')
                }
              }
            })
        }
        break;
    }
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    let actId = options.actId
    console.log('活动id = '+actId)
    this.requestMangeActivity(591702)//591722，591702
  },

  //1:显示打开打开 0:显示关闭报名
  changeApplyStatus:function(status){
    var applyContent = '关闭报名'
    var applyImg = 'https://cdn.51julebu.com/xiaochengxu/image/close.png'
    if(status == 1){
      applyContent = '打开报名'
      applyImg = 'https://cdn.51julebu.com/xiaochengxu/image/openApply@2x.png'
    }
    this.setData({    
      imageTitleDatas:{
        img: applyImg, 
        content:applyContent
      },
    })
  },


  requestMangeActivity:function(activityID){
    var that = this
    getApp().api('manageApi').getManageActivity({
      data:{
        activity_id:activityID
      }},
      function success(res) {
        console.log('管理活动成功');
        console.log(res);
        let activity = res.data.activity;

        that.changeApplyStatus(activity.activityStatus)

        that.setData({
          titleDatas:[
            activity.applyCount,
            activity.likeCount,
            activity.commentCount,
            activity.shareCount
          ],
          
          activity:activity,
        })
        
      },
      function fail(res){
        console.log('管理活动失败')
        console.log(res);
      },
     )
  },
  requestCloseApply:function(activityID){
    var that = this
    getApp().api('manageApi').closeApply({
      data:{
        activity_id:activityID
      }},
      function success(res){
        console.log('关闭成功');
        console.log(res);
        that.data.activity.activityStatus = 1
        that.changeApplyStatus(1)

      },
      function fail(res){
        console.log('close failed')
        console.log(res)
      },
   
    )
  },
  requestOpenApply:function(activityID){
    var that = this
    getApp().api('manageApi').openApply({
      data:{
        activity_id:activityID
      }},
      function success(res){
        
        that.data.activity.activityStatus = 0
        that.changeApplyStatus(0)
        console.log('打开成功');
        console.log(res);
      },
      function fail(res){
        console.log('open failed')
        console.log(res)
      },
 
    )
  }
})