Page({
  data: {
    button_Status: false,
    click_Status: true,

    fieldName: "",
    fieldOptions: [{optionName:"", addOrRemvoer: 1 }]//1 添加 2 删除

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.info(options);
    var isEdit = options.isEidt

    if (true) {
      //var applyField = JSON.parse(options.applyField);
      //var fieldNames =  JSON.parse(options.fieldNames);
      var applyField = { "isCheck": true, "text": "你好2", "canEidt": true, "option": "a1,a2", "defaultValue": "", "fieldName": "你好2", "fieldType": 2 }
      var fieldNames = ["昵称", "性别", "手机", "真实姓名", "身份证", "你好2", "你好", "你好3"]
      this.setData({
        fieldName: applyField.fieldName,
        applyField: applyField,
        fieldNames: fieldNames
      })
      if (applyField.fieldType == 2) {//文本：1 单选：2
        var fieldOpt = applyField.option.split(",");
        var fieldOpts = [];
        for(var i=0;i<fieldOpt.length;i++){
          var opt = {};
          opt.optionName = fieldOpt[i];
          opt.addOrRemvoer = 2;
          fieldOpts[i] = opt;
        }
        fieldOpts[fieldOpt.length-1].addOrRemvoer = 1;
        this.setData({ 
          fieldOptions: fieldOpts,
          button_Status:true
          })
      }

    }else{
      this.setData({click_Status:false})
    }
  },
  // input当用户输入时
  fieldNameInp(e) {
    var value = e.detail.value;
    var Status = false;
    value.replace(/(^\s*)|(\s*$)/g, "");
    if (value != '') {
      Status = true;
    }

    this.setData({
      button_Status: Status,
      fieldName:e.detail.value
    });
  },
  // input当用户输入时
  fieldOptInp(e) {
    var value = e.detail.value;
    var Status = false;
    value.replace(/(^\s*)|(\s*$)/g, "");
    if (value != '') {
      Status = true;
    }
    var index = e.currentTarget.id.split("_")[1];
   
    var fieldOptions = this.data.fieldOptions;
    fieldOptions[index].optionName = e.detail.value

    this.setData({
      button_Status: Status,
      fieldOptions:fieldOptions
    });
  },
  binditem_button(e) {
    var Click_Status = this.data.click_Status;
    Click_Status = !Click_Status;
    this.setData({
      click_Status: Click_Status
    });
  }
  ,
  // 保存按钮事件
  saveField(e) {
    var fields = {};
    var option = [];
    var fieldOptions = this.data.fieldOptions;
    for(var i=0;i<fieldOptions.length;i++){
      option[i] = fieldOptions[i].optionName;
    }
    var optStr = option.join(",")

    fields.field_name = this.data.fieldName;
    fields.option = optStr;
    console.info(fields);
     app.globalData.fields =this.data.fields;  //存储数据到app对象上
     wx.navigateBack();
  }
  ,
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
  addApplyItem: function (e) {
    var fieldOptions = this.data.fieldOptions;
    var fieldOpt = {optionName:"", addOrRemvoer: 2 }
    fieldOptions.splice(0, 0, fieldOpt)
    this.setData({ fieldOptions: fieldOptions })
  },
  removerApplyItem: function (e) {
    console.info(e)
    var index = e.currentTarget.id;
    console.info(index)
    var fieldOptions = this.data.fieldOptions;
    fieldOptions.splice(index, 1)
    this.setData({ fieldOptions: fieldOptions })
  }
})