var app = getApp()
import pick from '../../../template/organize/picker.js'
Page({
  data: {
    refunds: [],
    refund: 1,
    time: 0,
    timetxt: "",
    pointTime: 0
  },
  onLoad: function (options) {
    console.info(options)
    var canRefund = options.canRefund
    var refundTime = options.refundTime
    var begin = options.begin
    var refunds = []
    for (var i = 1; i <= 3; i++) {
      var refund = {}
      if (i == 1) {
        refund.text = "活动开始前均可申请退款"
        refund.time = 0
      } else if (i == 2) {
        refund.text = "指定时间前可申请退款"
        refund.time = Number(refundTime)
      } else if (i == 3) {
        refund.text = "不支持退款"
        refund.time = 0
      }
      if (canRefund == i) {
        refund.isDefault = 1
      } else {
        if (canRefund == undefined && i == 1) {//组织活动默认选第一个
          refund.isDefault = 1
        } else {
          refund.isDefault = 0
        }
      }
      refunds[i - 1] = refund
    }

    //设置指定时间
    var redtime = 0
    if (refundTime == 0 || refundTime == undefined) {
      if (begin != 0 && begin != undefined) {//活动开始时间
        redtime = new Date(begin)
      } else {
        redtime = new Date()
      }
    } else {
      redtime = new Date(Number(refundTime))
    }
    var timetxt = redtime.getFullYear() + '年' + (redtime.getMonth() + 1) + '月' + redtime.getDate() + '日 ' + redtime.getHours() + ':' + redtime.getMinutes()

    this.setData({
      refunds: refunds,
      timetxt: timetxt,
      time: Number(redtime),
      refund:canRefund == undefined?1:canRefund
    })

    if (canRefund == 2) {
      this.setData({pointTime:1})
      this.togglePicker()
    }

    this.initDateControl()
  },
  onUnload: function () {
    // 页面关闭
    app.globalData.actRefund = {
      refund: this.data.refund,
      time: this.data.time
    };

  },
  changehidden: function (e) {
    var index = e.target.id;
    var refunds = this.data.refunds;
    for (var i = 0; i < refunds.length; i++) {
      refunds[i].isDefault = 0;
    }
    refunds[index].isDefault = 1;
    var refund = Number(index) + 1;
    var pointTime = 0
    if (refund == 2) {//指定时间可退款
      pointTime = 1
      this.togglePicker()
    }
    this.setData({
      refunds: refunds,
      pointTime: pointTime,
      refund: refund
    })
  },
  //时间控件
  initDateControl: function () {
    var that = this
    pick.initDateControl(that)
  },
  bindChange: function (e) {
    var that = this
    pick.bindChange(e, that)
  },
  togglePicker: function () {
    var that = this
    pick.togglePicker(that)
  },
  touchCancel: function (event) {
    var that = this
    pick.touchCancel(event, that)
  },
  touchAdd: function (event) {
    var that = this
    pick.touchAdd(event, that)
  }

})