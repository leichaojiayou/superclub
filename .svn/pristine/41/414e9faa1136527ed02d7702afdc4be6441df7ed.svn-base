// pages/add_numbers/add_numbers.js
Page({
  data: {
    array: ['男', '女'],
     index: 0,
    array1: ['选手骑行服xs', '选手骑行服s','选手骑行服m'],
    index1: 0,
    rightarrow:'../images/right-errow.png',
    item:
    { t1: '票价', price: '￥270', t2: '潜水22人组票价的名字可以有这么' },

    activityID:0,
    applyFields:[],
    ticket_id:0,
    paid:0, //0:未付款 1:已付款
    groupName:''
  },
  // 选择性别
   bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  // 选择衣服码数
  bindPickerChange1: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index1: e.detail.value
    })
  },
  onLoad:function(options){
    
    this.setData({
      activityID:options.activityID
    })
    console.log('获取的活动id '+options.activityID)
    this.reqeustGetApplyFields(options.activityID)
  },

  tapSaveButton:function(e){


    var applyFields = this.data.applyFields

    var object = new Object()
    for(var i=0;i<applyFields.length;i++){
      var item = applyFields[i]

      if(item.fieldName == '支付方式'){
        continue
      } 

      if(item.fieldType == 1){
        if(!item.currentValue || item.currentValue == ''){
          wx.showToast({
            title: item.defaultValue,
            duration: 2000
          })
          return
        }
      }

      if(item.fieldName == '支付状态'){
        if(item.currentValue == '已付款'){
          this.data.paid = 1
        }else{
          this.data.paid = 0
        }
        continue
      }
      object[item.fieldName] = item.currentValue
    }
    if(this.data.groupName != ''){
      object['分组'] = this.data.groupName
    }

    var dictString = JSON.stringify(object);
    console.log(dictString)

    this.reqeustAddNewApply(dictString)
  },
  didInputChanged:function(e){
    console.log(e)
    var index = e.currentTarget.id
    var item = this.data.applyFields[index]
    item.currentValue = e.detail.value
    console.log(this.data.applyFields)
  },
  didPickerChanged:function(e){
    console.log(e)
    var index = e.currentTarget.id

    var applyFields = this.data.applyFields
    var item = applyFields[index]
    item.currentValue = item.ranges[e.detail.value]
    if(item.fieldName == '费用选择'){
      this.data.ticket_id = item.ticketids[e.detail.value]
      console.log('ticketID: ',this.data.ticket_id)
    }
    console.log(this.data.applyFields)
    this.setData({
      applyFields:applyFields,
    })
  },
  handleTickets:function(tickets){
    

  },

  reqeustGetApplyFields:function(activityID){
        var that = this 
        getApp().api('manageApi').getApplyFields({
            data:{
                activity_id:activityID,
            }},
            function success(res){
                console.log('获取报名信息成功');
                console.log(res);
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
                  if(item.fieldName == '分组'){
                    that.data.groupName = item.defaultValue
                  }else{
                    newFields.push(item)
                  }
                }
                console.log(newFields)
                that.setData({
                  applyFields:newFields,
                })
                
            },
            function fail(res){
              console.log(res);
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
              console.log('t添加报名成功');
              console.log(res);
              wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
              })
          },
          function fail(res){
            console.log(res);
          },
      )
  },


})