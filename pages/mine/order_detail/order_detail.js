const app = getApp();
const mineApi = app.api("mineApi");
var orderId = 0;

Page({
  data: {
    orderStatus: 0,
    user_text: '',
    user_img: '',
    date: '',
    receipt_text: '收款',
    receipt_price: '',
    order_number_text: '订单编号',
    order_number: '',
    payment_text: '付款方式',
    payment: '',
    payment_date_text: '付款时间',
    payment_date: '',
    transaction_text: '交易单号',
    transaction: '',
    accounts_receivable_text: '收款账户',
    accounts_receivable: '',
  }
  ,
  onLoad: function (options) {
    if (options.orderID) {
      orderId = options.orderID;
    }
    this.getOrderFormDetail();
  },
  getOrderFormDetail: function () {
    var that = this;
    mineApi.orderFormDetail({
      data: {
        order_id: orderId,
        flag: 2
      },
    },
      function (res) {
        var info = res.data.orderForm;
        that.setData({
          orderStatus: info.orderStatus,
          user_text: info.orderDetailInfo.apply.user.nick,
          user_img: info.orderDetailInfo.apply.user.avatar,
          date: app.util.formatTime5(info.createTime),
          receipt_text: info.orderStatus == 4 || info.orderStatus == 3 ? '退款' : '收款',
          receipt_price: info.orderDetailInfo.apply.payMoney,
          order_number_text: '订单编号',
          order_number: info.orderID,
          payment_text: info.orderStatus == 4 || info.orderStatus == 3 ? '退款方式' : '付款方式',
          payment: info.orderStatus == 4 || info.orderStatus == 3 ? info.refundWayName : info.payWayName,
          payment_date_text: info.orderStatus == 4 || info.orderStatus == 3 ? '退款时间' : '付款时间',
          payment_date: info.orderStatus == 4 || info.orderStatus == 3 ? app.util.formatTime6(info.refundTime) : app.util.formatTime6(info.payTime),
          transaction_text: '交易单号',
          transaction: info.payNo,
          accounts_receivable_text: info.orderStatus == 4 || info.orderStatus == 3 ? '退款账户' : '收款账户',
          accounts_receivable: info.orderStatus == 4 || info.orderStatus == 3 ? info.refundUser.nick + "-" + info.refundUser.userNum : info.payee.nick + "-" + info.payee.userNum,
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
  
})