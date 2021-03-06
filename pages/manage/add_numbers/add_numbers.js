// pages/add_numbers/add_numbers.js
Page({
  data: {
    activityID:0,
    applyFields:[],
    ticket_id:0,
    paid:0, //0:未付款 1:已付款
    groupName:'',
    howToPay:0,
    adminUserName:'',
  },
  // 选择性别
   bindPickerChange: function(e) {
   
    this.setData({
      index: e.detail.value
    })
  },
  // 选择衣服码数
  bindPickerChange1: function(e) {
 
    this.setData({
      index1: e.detail.value
    })
  },
  onLoad:function(options){
    
    this.setData({
      activityID:options.activityID,
      howToPay:options.howToPay,
    })

    this.reqeustGetApplyFields(options.activityID)
  },
  setPayYes:function(e){
    let userInfo = getApp().session.getUserInfo()
    var adminUserName = userInfo.nick
    var that = this 

    wx.showModal({
      title: '确定设为已付款？',
      content: '',
      success: function(res) {
        if (res.confirm) {
           that.setData({
              adminUserName:adminUserName,
              paid:1,
            })
        }
      }
    })
  },

  tapSaveButton:function(e){

    var applyFields = this.data.applyFields
    var object = new Object()
    for(var i=0;i<applyFields.length;i++){
      var item = applyFields[i]

      if(item.fieldName == '支付方式'){
        continue
      } 
      var title = '请填写'+item.fieldName
      if(item.fieldType == 1){
        if(!item.currentValue || item.currentValue == ''){
          wx.showToast({
            title: title,
            duration: 2000
          })
          return
        }
      }
      object[item.fieldName] = item.currentValue
    }
    // if(this.data.groupName != ''){
    //   object['分组'] = this.data.groupName
    // }

    var dictString = JSON.stringify(object);
    this.reqeustAddNewApply(dictString)
  },
  didInputChanged:function(e){
 
    var index = e.currentTarget.id
    var item = this.data.applyFields[index]
    item.currentValue = e.detail.value
  
  },
  didPickerChanged:function(e){
  
    var index = e.currentTarget.id

    var applyFields = this.data.applyFields
    var item = applyFields[index]
    item.currentValue = item.ranges[e.detail.value]
    if(item.fieldName == '费用选择'){
      this.data.ticket_id = item.ticketids[e.detail.value]
    
    }
    console.log(item.ranges)
    this.setData({
      applyFields:applyFields,
    })
  },


  reqeustGetApplyFields:function(activityID){
        var that = this 
        getApp().api('manageApi').getApplyFields({
            data:{
                activity_id:activityID,
            }},
            function success(res){
                console.log(res)
                var newFields = new Array()
                var applyFields = res.data.applyFields
                for(var i=0;i<applyFields.length;i++){
                  var item = applyFields[i]
                  if(item.fieldType == 2){
                    var ranges = item.option.split(",")
                    if(item.fieldName == '费用选择'){
                      var names = new Array()
                      var ids = new Array()
                      for(var j=0;j< ranges.length;j++){
                        var arr = ranges[j].split("__")
                        ids.push(arr[0])
                        names.push(arr[1])
                      }
                      item.ranges = names
                      item.ticketids = ids 
                      item.currentValue = names[0]
                      that.data.ticket_id = ids[0]
                    }else{
                      item.ranges = ranges
                      item.currentValue = ranges[0]
                    }
                  }

                  if(item.fieldName == '支付方式'){
                    item.payMethod = true
                  }

                  //不要分组的选项
                  //  if(item.fieldName == '分组'){
                  //   that.data.groupName = item.defaultValue
                  // }else
                  if(item.fieldName == '支付状态'){
                     //手动添加
                  }else{
                    newFields.push(item)
                  }
                }
            
                that.setData({
                  applyFields:newFields,
                })
                
            },
            function fail(res){
           
              wx.showModal({
                title: '错误',
                content: res.data.msg,
                success: function(res) {}
              })
            },
        )
  },

  reqeustAddNewApply:function(data){
      
      var activityID = this.data.activityID
      var ticketID = this.data.ticket_id
      var paid = this.data.paid
      getApp().api('manageApi').addNewApply({
          data:{
              activity_id:activityID,
              data:data,
              ticket_id:ticketID,
              paid:paid,
          }},
          function success(res){
           
              wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
              })
          },
          function fail(res){
           
            wx.showModal({
                title: '错误',
                content: res.data.msg,
                success: function(res) {}
              })
          },
      )
  },
})