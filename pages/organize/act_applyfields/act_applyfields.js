var app = getApp()
Page({
  data: {
    button_Status: false,//保存按钮
    click_Status: true,//下拉按钮
    fieldIndex: "",//修改第几个报名项，返回可用
    fieldName: "",
    fieldNames: "",//校验名称是否重复
    fieldOptions: [{ optionName: "", addOrRemvoer: 1 }],//1 添加 2 删除 候选项
    isEdit: false
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    var isEdit = options.isEidt
    if (isEdit && isEdit == "true") {
      var applyField = JSON.parse(options.applyField);
      var fieldNames = JSON.parse(options.fieldNames);
      var buttonStatus = false
      var clickStatus = true
      var fieldOpts = [];
      if (applyField.fieldType == 2) {//文本：1 单选：2
        var fieldOpt = applyField.option.split(",");
        for (var i = 0; i < fieldOpt.length; i++) {
          var opt = {};
          opt.optionName = fieldOpt[i];
          opt.addOrRemvoer = 2;
          fieldOpts[i] = opt;
        }
        fieldOpts[fieldOpt.length - 1].addOrRemvoer = 1;
      } else {
        clickStatus = false;
      }
      this.setData({
        fieldName: applyField.fieldName,
        fieldNames: fieldNames,
        fieldOptions: fieldOpts,
        button_Status: true,
        click_Status: clickStatus,
        fieldIndex: options.fieldIndex,
        isEdit:true
      })

    } else {
      var fieldNames = JSON.parse(options.fieldNames);
      this.setData({
        click_Status: false,
        fieldIndex: options.fieldIndex,
        fieldNames: fieldNames,
         isEdit:false
      })
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
      fieldName: e.detail.value
    });
  },
  contains(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
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
      fieldOptions: fieldOptions
    });
  },
  binditem_button(e) {
    var Click_Status = this.data.click_Status;
    Click_Status = !Click_Status;
    var fieldOptions = []
    if (Click_Status) {
      var fopt = this.data.fieldOptions
      if (fopt.length == 0) {
        fieldOptions = [{ optionName: "", addOrRemvoer: 1 }]
        this.setData({
          fieldOptions: fieldOptions
        });
      }
    }
    this.setData({
      click_Status: Click_Status
    });
  }
  ,
  // 保存按钮事件
  saveField() {
    var fields = {};
    var option = [];
    var fieldNames = this.data.fieldNames
    var fieldName = this.data.fieldName
    var isContain = this.contains(fieldNames, fieldName)
    var isEdit = this.data.isEdit

    if (!isEdit && isContain) {//新增的
      wx.showToast({
        title: "已有相同的报名填写项"
      })
    } else {
      var fieldOptions = this.data.fieldOptions;
      var fieldType = 1
      for (var i = 0; i < fieldOptions.length; i++) {
        option[i] = fieldOptions[i].optionName;
      }
      var optStr = option.join(",")
      if (optStr != "") {
        fieldType = 2
      }
      fields.field_name = this.data.fieldName;
      fields.option = optStr;
      fields.fieldType = fieldType
      app.globalData.applyFieldsObject = { fieldIndex: this.data.fieldIndex, fields: fields };  //存储数据到app对象上
      wx.navigateBack();
    }
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
    var fieldOpt = { optionName: "", addOrRemvoer: 2 }
    fieldOptions.splice(0, 0, fieldOpt)
    this.setData({ fieldOptions: fieldOptions })
  },
  removerApplyItem: function (e) {
    var index = e.currentTarget.id;
    var fieldOptions = this.data.fieldOptions;
    fieldOptions.splice(index, 1)
    this.setData({ fieldOptions: fieldOptions })
  }
})