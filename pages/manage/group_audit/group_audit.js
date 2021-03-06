Page({
  data: {
    group:[],
    emailShowStyle:'',
    refuseReason:'',
    alertTitle:'',
    placeHolder:'输入不通过的原因，30字以内',
    applyCheck:0,
    formId:0,
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
  touchCancel:function(){
    this.setData({
        emailShowStyle:''
      })
  },
  touchAddNew:function(e){
     var formId = e.detail.formId
     this.data.formId = formId
     console.log('formId = '+formId)
     this.setData({
        emailShowStyle:''
      })
      if(!this.data.refuseReason || this.data.refuseReason == '' || this.data.refuseReason == ' '){
        wx.showToast({
          title: '输入不可为空',
          icon: 'success',
          duration: 2000
        })
        return
      }

     var applyids = this.getApplyIds()
     var action = 4
     this.requestAudit(action,applyids,this.data.refuseReason)
  },
  titleInput:function(event){
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
        emailShowStyle:"opacity:1;pointer-events:auto;",
        alertTitle:'确定不通过这'+selectedApplys.length+'个人的报名?',
        placeHolder:'输入不通过的原因，30字以内',
      })
    }else if(tag == 1){
      //通过
      var title = '是否批量通过'+selectedApplys.length+'个人的报名？'
      this.setData({
        applyCheckStyle:1,
        applyTitle:title,
      })
    }
  },

  tapCancel:function(){
    this.setData({
        applyCheckStyle:0,
    })
  },
  tapSure:function(e){
    var formId = e.detail.formId
    this.data.formId = formId
    console.log('formId = '+formId)
 
    this.setData({
        applyCheckStyle:0,
    })
    var applyids = this.getApplyIds()
    var action = 1
    this.requestAudit(action,applyids,'')
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
      var formId = this.data.formId
      getApp().api('manageApi').auditApplys({
            data:{
                refuseReason:refuseReason,
                action:action,
                apply_ids:applyIds,
                formId:formId,
            }},
            function success(res){
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                  complete: function() {
                    // complete
                    console.log('退回 complete')
                    var pages = getCurrentPages()
                    var page = pages[2]
                    page.showMessage('操作成功')
                  }
                })
            },
            function fail(res){

            },
        )
  }
})