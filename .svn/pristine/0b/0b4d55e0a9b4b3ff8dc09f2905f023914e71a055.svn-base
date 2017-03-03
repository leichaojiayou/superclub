// pages/shoukuanxiangqing/shoukuanxiangqing.js
const app = getApp();
const mineApi = app.api("mineApi");
var activityId = 0;

Page({
  data: {
    isClub: true,
    data: {},
    payApplyGroup: {}, //确认报名
    payCount: 0,
    refundApplyGroup: {}, //已退款
    refundApplyCount: 0,
    unpayApplyGroup: {}, //待付
    unpayCount: 0,
    refundCancelGroup: {},//申请退款
    refundCancelCount: 0,
    otherpayApplyGroup: {}, //其他支付
    otherpayCount: 0,
    lists: [
      { isShow: true, title: '3人已确认报名' },
      { isShow: false, title: '1人待付款' }
    ]
  },
  onLoad: function (options) {
    if (options.activityID) {
      activityId = options.activityID;
    }
    this.getProceedsDetail();
  },
  getProceedsDetail: function () {
    var that = this;
    mineApi.proceedsDetail({
      data: {
        activity_id: activityId
      },
    },
      function (res) {
        res.data.activity.beginTimeStr = app.util.formatTime5(res.data.activity.beginTime);
        res.data.activity.endTimeStr = app.util.formatTime5(res.data.activity.endTime);
        res.data.payApplyGroup.isShow = true;
        res.data.refundApplyGroup.isShow = true;
        res.data.unpayApplyGroup.isShow = true;
        res.data.refundCancelGroup.isShow = true;
        res.data.otherpayApplyGroup.isShow = true;
        for(var i in res.data.payApplyGroup.applys){
          res.data.payApplyGroup.applys[i].showTimeStr = app.util.formatTime5(res.data.payApplyGroup.applys[i].showTime);
        }
        for(var i in res.data.refundApplyGroup.applys){
          res.data.refundApplyGroup.applys[i].showTimeStr = app.util.formatTime5(res.data.refundApplyGroup.applys[i].showTime);
        }
        for(var i in res.data.unpayApplyGroup.applys){
          res.data.unpayApplyGroup.applys[i].showTimeStr = app.util.formatTime5(res.data.unpayApplyGroup.applys[i].showTime);
        }
        for(var i in res.data.refundCancelGroup.applys){
          res.data.refundCancelGroup.applys[i].showTimeStr = app.util.formatTime5(res.data.refundCancelGroup.applys[i].showTime);
        }
        for(var i in res.data.otherpayApplyGroup.applys){
          res.data.otherpayApplyGroup.applys[i].showTimeStr = app.util.formatTime5(res.data.otherpayApplyGroup.applys[i].showTime);
        }

        that.setData({
          data: res.data,
          payApplyGroup: res.data.payApplyGroup, //确认报名
          payCount: res.data.payApplyGroup.applyUserCount,
          refundApplyGroup: res.data.refundApplyGroup, //已退款
          refundApplyCount: res.data.refundApplyGroup.applyUserCount,
          unpayApplyGroup: res.data.unpayApplyGroup, //待付
          unpayCount: res.data.unpayApplyGroup.applyUserCount,
          refundCancelGroup: res.data.refundCancelGroup,//申请退款
          refundCancelCount: res.data.refundCancelGroup.applyUserCount,
          otherpayApplyGroup: res.data.otherpayApplyGroup, //其他支付
          otherpayCount: res.data.otherpayApplyGroup.applyUserCount,
        })
      },
      function (res) {
        console.log("fail");
      },
      function (res) {
        app.util.getErrorMsg(res);
      }

    )

  },
  choosePay: function (e) {
    var group = this.data.payApplyGroup
    group.isShow = !group.isShow
    this.setData({
      payApplyGroup: group
    })
  },
  chooseRefundApply: function (e) {
    var group = this.data.refundApplyGroup
    group.isShow = !group.isShow
    this.setData({
      refundApplyGroup: group
    })
  },
  chooseUnpay: function (e) {
    var group = this.data.unpayApplyGroup
    group.isShow = !group.isShow
    this.setData({
      unpayApplyGroup: group
    })
  },
  chooseRefundCancel: function (e) {
    var group = this.data.refundCancelGroup
    group.isShow = !group.isShow
    this.setData({
      refundCancelGroup: group
    })
  },
  chooseOtherpay: function (e) {
    var group = this.data.otherpayApplyGroup
    group.isShow = !group.isShow
    this.setData({
      otherpayApplyGroup: group
    })
  },
  nato_orderDetail: function (e) {
    var id=e.currentTarget.id;
    app.wxService.navigateTo('mine/order_detail/order_detail',{
      orderID: id
    })
  },

})