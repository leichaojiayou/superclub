// pages/edit/edit.js
Page({
  data: {
    activityID:0,
    applyID:0,
    nick:'',
    applyFields:[],
    checkStatus:'',//拒绝，取消,无
    emailShowStyle:'',
    reason:'',
    howToPay:1,
    ticketPrice:'￥0.0',
    ticketName:'',
    showTicket:false,
    itemArray:[],//第二组
    payArray:[],//第三组
    fieldGroup:{},//第四组
    alertTitle:'',
    placeHolder:'输入不通过的原因，30字以内',
    adminUserName:'',
    formId:'',
    applyCheckStyle:0,
    applyTitle:'',
  },

  onLoad:function(options){
  
    this.setData({
      activityID:options.activityID,
      applyID:options.applyID,
      nick:options.nick,
      howToPay:options.howToPay,
    })
    this.reqeustGetApplyInfo(options.activityID,options.applyID)
  },

  tapRefuseButton:function(e){
    //弹窗
    var that = this
    var formId = e.detail.formId
    this.data.formId = formId
    console.log('formId = '+formId)
    var checkStatus = this.data.checkStatus
    if(checkStatus == '拒绝'){
      //弹出输入框
      this.setData({
        alertTitle:'确定拒绝"'+this.data.nick+'"的报名吗？Ta将不能再报名本次活动',
        emailShowStyle:"opacity:1;pointer-events:auto;",
      })

    }else{
      //弹提示
      var title = '确定取消"'+this.data.nick+'"的报名吗？Ta将不能再报名本次活动'
      this.setData({
        applyTitle:title,
        applyCheckStyle:1,
      })
    }
  },
  tapCancel:function(e){
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
        this.reqeustRefuseApply('')

    },
  touchAddNew:function(e){
    let formId = e.detail.formId
    this.data.formId = formId
    console.log('fromId = '+formId)
    this.setData({
      emailShowStyle:'',
    })

    var reason = this.data.reason.replace(/(^\s*)|(\s*$)/g,"");

    if(!reason || reason == ''){
      wx.showToast({
        title: '请输入拒绝的原因',
        icon: 'success',
        duration: 2000
      })
      return
    }
    this.reqeustRefuseApply(reason)
    
   },
  titleInput:function(event){
    this.data.reason = event.detail.value
    console.log(event.detail.value)
  },
  //报名选项内容改变了
  didFieldTextChanged:function(e){
    var index = e.currentTarget.id
    var itemArray = this.data.itemArray
    var item = itemArray[index]
    item.currentValue = e.detail.value
  },
  //分组：改变了
  didGroupNameChanged:function(e){
    var index = e.detail.value
    var fieldGroup = this.data.fieldGroup
    fieldGroup.currentValue = fieldGroup.ranges[index]
    this.setData({
      fieldGroup:fieldGroup,
    })
  },
  didItemPickerChanged:function(e){
    var itemIndex = e.currentTarget.id
    var index = e.detail.value
    var itemArray = this.data.itemArray
    var item = itemArray[itemIndex]
    item.currentValue = item.ranges[index]
    this.setData({
      itemArray:itemArray
    })
  },
  tapSaveButton:function(e){
    var object = new Object()
    var itemArray = this.data.itemArray
    for(var i=0;i<itemArray.length;i++){
      var item = itemArray[i]
      object[item.fieldName] = item.currentValue
    }
    object['分组'] = this.data.fieldGroup.currentValue

    var dictString = JSON.stringify(object);
    console.log(dictString)

    //1 : 已经付款
    var paid = 0
    for(var j=0;j<this.data.payArray.length;j++){
       var item = this.data.payArray[j]
       if(item.fieldName == '支付状态' && item.currentValue == '已付款'){
         paid = 1
       }
    }
    this.reqeustSaveApply(dictString,paid)

  },

  setPayYes:function(e){
    console.log('设为已付款')
    console.log(e)
    var index = e.currentTarget.id
    var payArray = this.data.payArray
    console.log(payArray)
    var item = payArray[index]
    console.log(item)
    item.currentValue = '已付款'

    let userInfo = getApp().session.getUserInfo()

    var that = this 
    wx.showModal({
      title: '确定设为已付款？',
      content: '',
      success: function(res) {
        if (res.confirm) {
           that.setData({
              payArray:payArray,
              adminUserName:userInfo.nick,
            })
        }
      }
    })


    
  },

  handleApplys:function(applyFields){

    var itemArray = new Array()
    var payArray = new Array()
    var fieldGroup = {}
    var ticketName = ''
    var ticketPrice = ''
    for(var i=0;i<applyFields.length;i++){
        var item = applyFields[i]
        item.currentValue = item.defaultValue

        if(item.fieldType == 2){
          //带数组：第一组
          var ranges = item.option.split(",")
          item.ranges = ranges
          
          if(item.fieldName == '费用选择'){
            var arr = item.defaultValue.split("__")
            var nameAndPrice = arr[1]
            var arr2 = nameAndPrice.split("¥")
            ticketName = arr2[0]
            ticketPrice = '¥'+arr2[1]
            console.log('this 费用分组')
            this.setData({
              showTicket:true,
            })
            
          }else if(item.fieldName == '分组'){
            //第四组
            fieldGroup = item 
          }else{
            //第二组
            itemArray.push(item)
          }
          
        }else{
          //不带数组
          if(this.data.howToPay == 1){
            itemArray.push(item)
          }else{

            if(item.fieldName == '支付状态' || item.fieldName == '报名状态'){
              //第三组
              payArray.push(item)
            }else{
              //第二组
              itemArray.push(item)
            }
          }
        }
    }

    console.log(payArray)

    this.setData({
      itemArray:itemArray,
      ticketName:ticketName,
      ticketPrice:ticketPrice,
      fieldGroup:fieldGroup,
      payArray:payArray,
    })
  },
 

  reqeustGetApplyInfo:function(data){
      
      var activityID = this.data.activityID
      var applyID = this.data.applyID
      var that = this
      getApp().api('manageApi').getEditApplyInfo({
          data:{
              activity_id:activityID,
              apply_id:applyID,
          }},
          function success(res){
              console.log('获取修改报名信息ok');

              console.log(res);
              var data = res.data
              var checkStatus = data.checkStatus
              if(!checkStatus || checkStatus == 'null' || checkStatus == 'NULL'){
                checkStatus = ''
              }

              var adminUserName = data.adminUserName
              if(!adminUserName || adminUserName == 'null' || adminUserName == 'NULL'){
                adminUserName = ''
              }
              
              that.setData({
                checkStatus:checkStatus,
                adminUserName:adminUserName,
              })
              that.handleApplys(data.applyFields)
          },
          function fail(res){
            console.log(res);
          },
      )
  },

  //拒绝
  reqeustRefuseApply:function(reason){
      
      var applyID = this.data.applyID
      var formId = this.data.formId
      var that = this
      getApp().api('manageApi').refusedApply({
          data:{
              reason:reason,
              apply_id:applyID,
              formId:formId,
          }},
          function success(res){
              console.log('拒绝报名成功');
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

  //保存 paid不用考虑
  reqeustSaveApply:function(dataString,paid){
      
      var applyID = this.data.applyID
      var activityID = this.data.activityID
      var that = this
      getApp().api('manageApi').editApplyInfo({
          data:{
              activity_id:activityID,
              apply_id:applyID,
              data:dataString,
              paid:paid,
          }},
          function success(res){
              console.log('拒绝报名成功');
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