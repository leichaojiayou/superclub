// pages/sort_one/sort_one.js
Page({
  data:{
    groupID:0,
    groupName:'',
    inputName:'',
  },
  tapSave:function(e){
    this.requestEdit(this.data.groupID,this.data.inputName)
  },
  tapDelete:function(e){
    var that = this
    wx.showModal({
              title: '删除分组？',
              content: '删除后，分组成员不会消失',
              success: function(res) {
                if (res.confirm) {
                  that.requestDelete(that.data.groupID)
                  console.log('用户点击确定')
                }
              }
            })
  },
  didInputChanged:function(event){
      console.log('输入框改变')
      console.log(event.detail.value)
    this.data.inputName = event.detail.value
  },
  onLoad:function(options){
    var groupID = options.groupID
    var groupName = options.groupName

    this.setData({
      groupID:groupID,
      groupName:groupName
    })
    wx.setNavigationBarTitle({
      title: groupName,
    })
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

  requestEdit:function(groupID,groupName){
        var that = this 
        getApp().api('manageApi').editGroupName({
            data:{
                group_id:groupID,
                group_name:groupName
            }},
            function success(res){
                console.log('修改分组名字成功');
                var pages = getCurrentPages()
                var prevPage = pages[pages.length-2]
                prevPage.changeBarTitle(that.data.inputName)
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
            },
            function fail(res){
                console.log(res)
            },
          
        )
    },

    requestDelete:function(groupID){
        var that = this 
        getApp().api('manageApi').deleteGroupName({
            data:{
                group_id:groupID,
            }},
            function success(res){
                console.log('删除本组成功');
                console.log(res);
                wx.navigateBack({
                  delta: 2, // 回退前 delta(默认为1) 页面
                })
            },
            function fail(res){
                console.log(res)
            },
           
        )
    }



})