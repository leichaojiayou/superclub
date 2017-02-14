Page({
  data: {
    group:[],
    hiddenAlert:true,
    refuseReason:'',
  },
  onLoad: function (options) {

    var group = wx.getStorageSync('manage_group_audit')
    wx.setNavigationBarTitle({
      title: group.text,
    })
    this.setData({
      group:group,
    })
    
  },
  tapCancelAlert:function(){
    this.setData({
        hiddenAlert:true
      })
  },
  tapSureAlert:function(){
     this.setData({
        hiddenAlert:true
      })
     var applyids = this.getApplyIds()
     var action = 4
     this.requestAudit(action,applyids,this.data.refuseReason)
  },
  didInputChanged:function(event){
    this.data.refuseReason = event.detail.value
    console.log(this.data.refuseReason)
  },
  tapSelectAll:function(){
     var group = this.data.group
      var flag = !group.isSelected
      group.isSelected = flag
     for(var i=0;i<group.applys.length;i++){
        group.applys[i].isSelected = flag
    }

    this.setData({
      group:group,
    })
  },
  tapSeleteItem:function(e){
    var index = e.currentTarget.id
    var group = this.data.group
    var item = group.applys[index]
    item.isSelected = !item.isSelected
    
    var flag = true
   
    for(var i=0;i<group.applys.length;i++){
      var item = group.applys[i]
      
      if(!item.isSelected){
        flag = false
      }
    }
    group.isSelected = flag
    this.setData({
      group:group,
    })
  },
  tapButtonClicked:function(e){
    var selectedApplys = this.getSelectedApplys()
    if(selectedApplys.length <= 0){
      wx.showToast({
        title: '没有选择用户',
        icon: '',
        duration: 2000
      })
      return
    }
    var that = this

    var tag = e.currentTarget.id
    var action = 0
    if(tag == 0){
      //不通过   action = 4//不通过
      this.setData({
        hiddenAlert:false
      })
    }else if(tag == 1){
      //通过
      var title = '是否批量通过'+selectedApplys.length+'个人的报名？'
      wx.showModal({
              title: title,
              content: '',
              showCancel:true,
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  var applyids = that.getApplyIds()
                   var action = 1
                   that.requestAudit(action,applyids,'')
                }
              }
          })
    }
  },

 getApplyIds:function(){
    var applyids = ''
    var applys = this.getSelectedApplys()
    for(var i=0;i<applys.length;i++){
      var item = applys[i]
      if(i==0){
        applyids = item.applyID
      }else{
        applyids = applyids + ','+item.applyID
      }
    }
    return applyids
 },

  getSelectedApplys:function(){
    var selectedArray = new Array()
    var group = this.data.group
    for(var i=0;i<group.applys.length;i++){
        var item = group.applys[i]
        if(item.isSelected){
          selectedArray.push(item)
        }
    }
    return selectedArray
  },
  requestAudit:function(action,applyIds,refuseReason){

      getApp().api('manageApi').auditApplys({
            data:{
                refuseReason:refuseReason,
                action:action,
                apply_ids:applyIds,
            }},
            function success(res){
                console.log('审核操作成功');
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
            },
            function fail(res){

            },
        )
  }
})