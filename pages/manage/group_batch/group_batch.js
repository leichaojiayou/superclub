Page({
  data: {
    emailShowStyle:'',
    group:[],
    activityID:0,
    newGroupName:'',
    haveSelectedApply:false,
    alertTitle:'添加新分组',
    placeHolder:'输入分组名称，限20字',
    maxLength:20,
  },

  tapSeleteItem:function(e){

    var index = e.currentTarget.id
    var group = this.data.group
    var item = group.applys[index]
    item.isSelected = !item.isSelected
    
    var flag = true
    var haveSelectedApply = false
    
    for(var i=0;i<group.applys.length;i++){
      var item = group.applys[i]

      if(item.isSelected){
        haveSelectedApply = true
      }
      
      if(!item.isSelected){
        flag = false
      }
    }
    group.isSelected = flag
    this.setData({
      group:group,
      haveSelectedApply:haveSelectedApply
    })
  },
  tapSelectAll:function(e){
      var group = this.data.group
      var flag = !group.isSelected
      group.isSelected = flag
     for(var i=0;i<group.applys.length;i++){
        group.applys[i].isSelected = flag
     }

    this.setData({
      group:group,
      haveSelectedApply:flag,
    })
  },
  tapForMove:function(e){

    var selectedApplys = this.getSelectedApplys()
    if(selectedApplys.length <= 0){
          wx.showModal({
              title: '请勾选报名成员',
              content: '',
              showCancel:false,
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
          })
      return
    }

    var tag = e.currentTarget.id
    if(tag == 0){
      console.log('移动到分组')
      if(this.data.groupNameArray.length <= 0){
        wx.showModal({
              title: '没有分组，请先添加到新分组',
              content: '',
              showCancel:false,
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
          })
      }
    }else if(tag == 1){
      console.log('创建后，移动到分组')
      this.setData({
        emailShowStyle:"opacity:1;pointer-events:auto;",
      })
      
    }
  },
  tapPickerChanged:function(e){
    var index = e.detail.value
    var groupName = this.data.groupNameArray[index]
    var groupID = this.data.manage_group_ids[index]

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

    this.requestMoveToGroup(groupID,applyids)
    console.log(groupName)
  },
  touchCancel:function(){
    this.setData({
        emailShowStyle:''
      })
  },
  touchAddNew:function(){

    var  name = this.data.newGroupName
    if(!name || name == '' || name == ' '){
      wx.showToast({
                title: '输入内容为空',
                icon: 'success',
                duration: 2000
            })
      return
    }
     this.setData({
        emailShowStyle:''
      })
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
      this.reqeustCreateGroup(this.data.newGroupName,applyids)
  },
  titleInput:function(event){
    this.data.newGroupName = event.detail.value
  },

  onLoad: function (options) {
    var groupNameArray = wx.getStorageSync('manage_group_names')
    var manage_group_ids = wx.getStorageSync('manage_group_ids') 
    var group = wx.getStorageSync('manage_group_batch')
    var activityID = options.activityID
    group.isSelected = false
    for(var i=0;i<group.applys.length;i++){
      var item = group.applys[i]
      item.isSelected = false
    }
    wx.setNavigationBarTitle({
      title: group.text,
    })
    this.setData({
      group:group,
      groupNameArray:groupNameArray,
      manage_group_ids:manage_group_ids,
      activityID:activityID,
    })
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
  requestMoveToGroup:function(groupID,applyIds){

        var activityID = this.data.activityID
        getApp().api('manageApi').moveToGroup({
            data:{
                activity_id:activityID,
                target_groupid:groupID,
                source_groupid:0,
                applyIds:applyIds,
            }},
            function success(res){
                console.log('分组成功');
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
            },
            function fail(res){

            },
        
        )
  },

  reqeustCreateGroup:function(newGroupName,applyIds){
    var activityID = this.data.activityID
    getApp().api('manageApi').createGroup({
            data:{
                activity_id:activityID,
                new_group_name:newGroupName,
                source_groupid:0,
                applyIds:applyIds,
            }},
            function success(res){
                console.log('分组成功');
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
            },
            function fail(res){

            },
        )
    }
})