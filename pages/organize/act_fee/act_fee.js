var app = getApp()
Page({
  data: {
    maxApplyCount: "",
    tickets: [],
    neeToPay: 1,
    howToPay: 1,
    costDesc: "",
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    var actId = options.actId;
    if (actId && actId != "") {//编辑活动
      this.setData({
        tickets: JSON.parse(options.tickets),
        neeToPay: options.neeToPay,
        howToPay: options.howToPay,
        costDesc: options.costDesc,
        maxApplyCount: options.maxApplyCount
      })

    } else {
      //var tks = [{ "applyCount": 0, "name": "", "cost": "", "ticketID": 0, "memberCount": "" }]
     // this.setData({ tickets: tks })
      var tks = [{ "memberCount": 100, "cost": 1, "ticketID": 5010, "name": "f1", "applyCount": 0 }, { "memberCount": -1, "cost": 2, "ticketID": 5011, "name": "f2", "applyCount": 0 }, { "memberCount": 200, "cost": 0, "ticketID": 5012, "name": "f3", "applyCount": 1 }, { "memberCount": -1, "cost": 0, "ticketID": 5013, "name": "f4", "applyCount": 0 }]
      this.setData({
        tickets: tks,
        neeToPay: 2,
        howToPay: 3,
        costDesc: " options.costDesc",
        maxApplyCount: 100
      })

    }

  },
  onReady: function () {
    // 页面渲染完成

  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    
  },
  onUnload: function () {
    // 页面关闭
    var setSbubChecked = this.getAppSets();
    // 页面隐藏
    app.globalData.actFeeObject = {
       maxApplyCount: this.data.maxApplyCount,
       tickets:this.data.tickets,
       neeToPay:this.data.neeToPay,
       howToPay:this.data.howToPay,
       costDesc:this.data.costDesc
    };  //存储数据到app对象上
  },
  onlinePay: function (e) {

    var ifCostZero = this.isCostZero();
    if (ifCostZero) {//免费
      wx.showToast({
        title: "免费活动无需开启"
      })
      this.setData({
        neeToPay: 1,
        howToPay: 1
      })
    } else {
      var flag = e.detail.value;
      if (flag) {//在线支付
        this.setData({
          neeToPay: 2,
          howToPay: 2
        })
      } else {
        this.setData({
          howToPay: 1
        })
      }
    }
  },
  otherPay: function (e) {
    var ifCostZero = this.isCostZero();
    if (ifCostZero) {//免费
      wx.showToast({
        title: "免费活动无需开启"
      })
      this.setData({
        neeToPay: 1,
        howToPay: 1
      })
    } else {
      var flag = e.detail;
      if (flag) {//在线支付
        this.setData({
          howToPay: 3,
        })
      } else {
        this.setData({
          howToPay: 2,
        })
      }
    }
  },
  isCostZero: function () {
    var tickets = this.data.tickets;
    var ifCostZero = true;//是否是免费
    if (tickets.length > 0) {
      for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].cost > 0) {
          ifCostZero = false;
        }
      }
    }
    return ifCostZero;
  },
  getAppSets: function () {
    var ticketChecked = true;
    var tickets = this.data.tickets;
    for (var i = 0; i < tickets.length; i++) {
      if (!tickets[i].name || tickets[i].name == "") {
        ticketChecked = false;
        wx.showToast({
          title: "费用名称不能为空"
        })
        break;
      }
      if (tickets[i].name && tickets[i].name.length > 20) {
        ticketChecked = false;
        wx.showToast({
          title: "费用名称必须在20字内"
        })
        break;
      }
      if (tickets[i].cost && tickets[i].cost < 0) {
        ticketChecked = false;
        wx.showToast({
          title: "费用金额必须大于或者等于0"
        })
        break;
      }
    }

    if (!this.data.costDesc || this.data.costDesc == "") {
      ticketChecked = false;
      wx.showToast({
        title: "费用说明不能为空"
      })
    }

    return ticketChecked;
  },
  setItemInfo: function (e) {
    var value = e.detail.value;
    var id = e.target.id;
    var name = id.split("_")[0];
    var index = id.split("_")[1];
    var tickets = this.data.tickets;
    if (name == "name") {
      tickets[index].name = value
    } else {
      var num = /[^0-9]\d*$/;
      if (num.test(value)) {//非数字
        wx.showToast({
          title: "只能输入数字"
        })
      } else {
        if (name == "cost") {
          tickets[index].cost = value
        }
        if (name == "memberCount") {
          if (value == "") {//报名人数不限
            tickets[index].memberCount = "-1"
          } else {
            tickets[index].memberCount = value
          }
        }
      }
    }
    this.setData({ tickets: tickets })
  },
  setCostDesc: function (e) {
    var value = e.detail.value;
    this.setData({ costDesc: value });
  },
  removeItem:function(e){
    var id = e.currentTarget.id;
    var index = id.split("_")[1];
    var tiks = this.data.tickets;
    tiks.splice(index,1)
    this.setData({tickets:tiks})
   

  },
  addItem:function(e){
    var tksItem = [{ "applyCount": 0, "name": "", "cost": "", "ticketID": 0, "memberCount": "" }]
    var id = e.currentTarget.id;
    var index = id.split("_")[1];
    var tiks = this.data.tickets;
    tiks.splice(tiks.length,0,tksItem)
    this.setData({tickets:tiks})
  }


})