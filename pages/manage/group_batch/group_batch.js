Page({
  data: {
    hiddenAlert:true,
    checkbox_allStatus: false,
    num: 3,
    group_list: [
      { check_Status: false, user_name: "用户昵称1", payment: "已付费 (微信支付)", user_text: '李慧珍帮报1', img: '../images/user.png' },
      { check_Status: false, user_name: "用户昵称1", payment: "已付费 (微信支付)", user_text: '', img: '../images/user.png' }
    ],
    page: {
      checkbox_all_name: 'all',
      checkbox_all_text: '全选',
    },
    statu: 1,
    Setting: false,
    group_array: ['未分组', '第一组', '第二组', '第三组'],
    group_objectArray: [
      {
        id: 0,
        name: '未分组'
      },
      {
        id: 1,
        name: '第一组'
      },
      {
        id: 2,
        name: '第二组'
      },
      {
        id: 3,
        name: '第三组'
      }
    ],
    group_index: 0,

    group:[],
    activityID:0,
    newGroupName:'',
  },
  btn(e) {
    this.setData({
      group_index: e.detail.value
    })
  }
  ,
  btn1(e) {

  }
  ,
  number_check(e) {
    const Group_list = this.data.group_list;
    var num1 = 0;
    for (const item_index in Group_list) {
      num1++;
    }
    this.setData({
      num: num1,
    });
    console.log(this.data.num);
  }
  ,
  button_Select() {
    wx.navigateTo({
      url: '../send_msg/send_msg',
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      },
    })
  }
  ,
  
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
  tapSelectAll:function(e){
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
        hiddenAlert:false
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
  tapCancelAlert:function(){
    this.setData({
        hiddenAlert:true
      })
  },
  tapSureAlert:function(){
     this.setData({
        hiddenAlert:true
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
  didInputChanged:function(event){
    this.data.newGroupName = event.detail.value
    console.log(event.detail.value)
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
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
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