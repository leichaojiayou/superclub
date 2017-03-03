const app = getApp();
const mineApi = app.api("mineApi");
var tradeId = 0;

Page({
  data: {
    info: {},
  },
  onLoad: function (options) {
    if (options.tradeId) {
      tradeId = options.tradeId;
    }
    this.getTradeDetail();
  },
  getTradeDetail: function () {
    var that = this;
    mineApi.tradeRecordDetail({
      data: {
        trade_id: tradeId
      },
    },
      function (res) {
        var info = res.data.tradeRecord;

        if(info.tradeType==1){
          info.tradeDetailInfo.activity.beginTimeStr = app.util.formatTime5(info.tradeDetailInfo.activity.beginTime);
          info.tradeDetailInfo.activity.endTimeStr = app.util.formatTime5(info.tradeDetailInfo.activity.endTime);
          var orderForms = info.tradeDetailInfo.orderForms;
          for(var i in orderForms){
            orderForms[i].payTimeStr = app.util.formatTime6(orderForms[i].payTime);
          }
        }else if(info.tradeType==2){
          info.tradeDetailInfo.activity.beginTimeStr = app.util.formatTime5(info.tradeDetailInfo.activity.beginTime);
          info.tradeDetailInfo.activity.endTimeStr = app.util.formatTime5(info.tradeDetailInfo.activity.endTime);
          info.tradeDetailInfo.orderForm.refundTimeStr = app.util.formatTime6(info.tradeDetailInfo.orderForm.refundTime);
        }else if(info.tradeType==3){
          info.tradeDetailInfo.orderForm.payTimeStr = app.util.formatTime6(info.tradeDetailInfo.orderForm.payTime);
        }else if(info.tradeType==4){
          info.tradeDetailInfo.orderForm.refundTimeStr = app.util.formatTime6(info.tradeDetailInfo.orderForm.refundTime);
        }else if(info.tradeType==5){
          info.tradeDetailInfo.withdrawInfo.createTimeStr = app.util.formatTime6(info.tradeDetailInfo.withdrawInfo.createTime);
          var apply = info.tradeDetailInfo.withdrawInfo.apply;
          for(var i in apply){
            apply[i].timeStr = app.util.formatTime6(apply[i].time);
          }
        }else if(info.tradeType==7){
          info.tradeDetailInfo.orderInfo.SettlementTimeStr = app.util.formatTime6(info.tradeDetailInfo.orderInfo.SettlementTime);
        }else if(info.tradeType==8){
          info.tradeDetailInfo.orderInfo.SettlementTimeStr = app.util.formatTime6(info.tradeDetailInfo.orderInfo.SettlementTime);
        }

        that.setData({
          info: info
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