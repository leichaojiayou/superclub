var app = getApp()
Page({
  data: {
    maxApplyCountTxt: "",
    maxApplyCount: -1,
    tickets: [],
    neeToPay: 1,
    howToPay: 2,
    costDesc: "",
    payeeCount: "",
    payee: {},//收款账号
    president: {},//会长账号
    isPresident: 0,
    clubId: "",
    payinfo: true,
    actId: 0,
    showPayButton: true
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    console.info(options)
    var payee = options.payee;
    var president = options.president;
    var isPresident = options.isPresident;
    var actId = options.actId;
    if (payee && payee != undefined && payee != null && payee != "" && payee != "null") {
      payee = JSON.parse(payee);
      this.setData({
        payeeCount: payee.nick + "-" + payee.userNum,
        payee: payee
      })
    } else {
      this.setData({
        president: JSON.parse(options.president)
      })
    }
    this.setData({ isPresident: isPresident, clubId: options.clubId, actId: actId })
    if (options.tickets != "null" && options.tickets != "[]") {//组织活动再次修改票价
      var tickets = JSON.parse(options.tickets);
      for (var i = 0; i < tickets.length; i++) {
        //tickets[i].cost = tickets[i].cost
        tickets[i].canEdit = false
      }
      this.setData({
        tickets: tickets,
        neeToPay: options.neeToPay,
        howToPay: options.howToPay,
        maxApplyCount: options.maxApplyCount
      })
    } else {
      var tks = [{ "applyCount": 0, "name": "", "cost": "", "ticketID": 0, "memberCount": "", canEdit: true }]
      this.setData({
        tickets: tks,
        neeToPay: 1,
        howToPay: 2
      })
    }
    this.setData({ costDesc: options.costDesc, showPayButton: (options.showPayButton == "true" ? true : false) })
    // if (actId && actId != undefined && actId != null && actId != "" && actId != "null" && actId != "0" && actId != 0) {//编辑活动
    //   this.setData({
    //     tickets: JSON.parse(options.tickets),
    //     neeToPay: options.neeToPay,
    //     howToPay: options.howToPay,
    //     costDesc: options.costDesc,
    //     maxApplyCount: options.maxApplyCount
    //   })
    // } else {
    //   if (options.tickets != "[]") {//组织活动再次修改票价
    //     this.setData({
    //       tickets: JSON.parse(options.tickets),
    //       neeToPay: options.neeToPay,
    //       howToPay: options.howToPay,
    //       costDesc: options.costDesc,
    //       maxApplyCount: options.maxApplyCount
    //     })
    //   } else {
    //     var tks = [{ "applyCount": 0, "name": "", "cost": "", "ticketID": 0, "memberCount": "" }]
    //     this.setData({
    //       tickets: tks,
    //       neeToPay: 1,
    //       howToPay: 2
    //     })
    //   }
    // }

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

    var tickes = this.data.tickets;
    var tks = []
    //"applyCount": 0, "name": "", "cost": "", "ticketID": 0, "memberCount": "" 
    if (this.data.neeToPay == 2) {
      for (var i = 0; i < tickes.length; i++) {
        var tk = {}
        tk.applyCount = tickes[i].applyCount
        tk.name = tickes[i].name
        tk.cost = tickes[i].cost
        tk.memberCount = tickes[i].memberCount
        tk.ticketID = tickes[i].ticketID
        if (tickes[i].name != "" && tickes[i].cost != "") {
          var count = tickes[i].memberCount
          if (count == "") {
            tk.memberCount = -1
          }
        }
        tks[i] = tk
      }
    }
    app.globalData.actFeeObject = {
      maxApplyCount: this.data.maxApplyCount,
      tickets: tks,
      neeToPay: this.data.neeToPay,
      howToPay: this.data.howToPay,
      costDesc: this.data.costDesc
    };  //存储数据到app对象上
  },
  onlinePay: function (e) {
    var actId = this.data.actId;
    if (actId && actId != "") {//编辑活动
      this.setOnlinePay(e);
    } else {//组织活动
      var payee = this.data.payee
      var president = this.data.president
      var payetxt = JSON.stringify(payee)
      if (payetxt && payetxt != "" && payetxt != "{}") {
        this.setOnlinePay(e);
      } else {
        var ifCostZero = this.isCostZero();
        if (!ifCostZero) {
          var that = this
          var isPresident = this.data.isPresident
          if (isPresident == 1) {//会长
            wx.showModal({
              content: "尊敬的会长大人：活动已能在线付费，请设置俱乐部收款账户！",
              confirmText: "去设置",
              showCancel: false,
              success: function (res) {
                app.wxService.navigateTo('club/modify/accountGather/accountGather', {
                  clubID: that.data.clubId,
                  roleType: 2
                })
              }
            })
          } else {//其他
            wx.showModal({
              content: "俱乐部未设置支付收款账户，请联系会长在俱乐部管理者设置",
              confirmText: "打电话",
              cancelText: "稍后联系",
              success: function (res) {
                var confirm = res.confirm
                if (confirm) {
                  wx.showModal({
                    content: "确定呼叫：" + president.nick + " " + president.mobile + " ？",
                    confirmText: "呼叫",
                    cancelText: "取消",
                    success: function (res) {
                      var cfirm = res.confirm
                      if (cfirm) {
                        wx.makePhoneCall({
                          phoneNumber: president.mobile,
                          success: function () {
                            console.log("成功拨打电话")
                          }
                        })
                      }
                    }
                  })
                }
              }
            })
          }
        }
      }
    }
  },

  setOnlinePay: function (e) {

    var actId = this.data.actId;

    var flag = e.detail.value;
    var ifCostZero = this.isCostZero();
    if (ifCostZero) {//免费
      // wx.showToast({
      //   title: "免费活动无需开启"
      // })
      this.setData({
        neeToPay: 1,
        howToPay: 1,
        payinfo: flag
      })
    } else {
      if (flag) {//在线支付
        this.setData({
          neeToPay: 2,
          howToPay: 2
        })
      } else {
        this.setData({
          neeToPay: 2,
          howToPay: 1
        })
      }
      this.setData({ payinfo: flag })
    }

  },

  isCostZero: function () {
    var tickets = this.data.tickets;
    var ifCostZero = true;//是否是免费
    var flag = true;//费用格式是否正确
    var cost = 0
    if (tickets && tickets.length > 0) {
      for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].name != "" && tickets[i].cost == "") {
          flag = false;//费用不能为空
        }
        if (tickets[i].name != "" && tickets[i].cost != "") {//不能填
          cost += Number(tickets[i].cost)
        }
      }
    }
    if (flag && cost != 0) {
      ifCostZero = false;
    }
    return ifCostZero;
  },
  getAppSets: function () {
    var ticketChecked = true;
    var tickets = this.data.tickets;
    var flag = true;//费用格式是否正确
    var cost = 0
    if (tickets && tickets.length > 0) {
      for (var i = 0; i < tickets.length; i++) {
        if (tickets[i].name != "" && tickets[i].cost == "") {
          flag = false;//费用不能为空
          break;
        }
        if (tickets[i].name != "" && tickets[i].cost != "") {//不能填
          cost += Number(tickets[i].cost)
        }
      }
    }
    if (flag && cost == 0) {
      this.setData({
        neeToPay: 1
      })
    } else {
      for (var i = 0; i < tickets.length; i++) {
        if (!tickets[i].name || tickets[i].name == "") {
          ticketChecked = false;
          wx.showToast({
            title: "费用名称不能为空"
          })
          break;
        } else {
          for (var j = i + 1; j < tickets.length; j++) {
            if (tickets[j].name && tickets[j].name != "") {
              if (tickets[i].name == tickets[j].name) {
                ticketChecked = false;
                wx.showToast({
                  title: "费用名称不能重复"
                })
                break;
              }
            }
            if (!ticketChecked) {
              break;
            }
          }
        }
        if (tickets[i].name && tickets[i].name.length > 20) {
          ticketChecked = false;
          wx.showToast({
            title: "费用名称必须在20字内"
          })
          break;
        }
        if ((tickets[i].name != "" && tickets[i].cost == "") || Number(tickets[i].cost) < 0) {
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
      this.setData({
        neeToPay: 2
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
      var num = /[^\d.]/g;
      if ((num.test(value))) {//非数字
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
            var num = /^[0-9]*[0-9][0-9]*$/;
            if (!(num.test(value))) {//整数
              wx.showToast({
                title: "只能输入整数"
              })
            } else {
              tickets[index].memberCount = value
            }
          }
        }
      }
    }
    this.setData({ tickets: tickets })
  },
  setMaxApplyCount: function (e) {
    var value = e.detail.value;
    var maxApplyNum = "";
    //  var maxApplyNumTxt = "";
    if (value && value != "") {
      var num = /[^0-9]\d*$/;
      if (num.test(value)) {//非数字
        wx.showToast({
          title: "只能输入数字"
        })
        maxApplyNum = -1;
        //       var maxApplyNumTxt = "";
      } else {
        maxApplyNum = value;
        //     var maxApplyNumTxt = value;
      }
    } else {
      maxApplyNum = -1;
      //    var maxApplyNumTxt = "";
    }
    this.setData({
      maxApplyCount: maxApplyNum,
    })
  },
  setCostDesc: function (e) {
    var value = e.detail.value;
    this.setData({ costDesc: value });
  },
  removeItem: function (e) {
    var id = e.currentTarget.id;
    var index = id.split("_")[1];
    var tiks = this.data.tickets;
    tiks.splice(index, 1)
    this.setData({ tickets: tiks })
  },
  addItem: function (e) {
    var tksItem = { "applyCount": 0, "name": "", "cost": "", "ticketID": 0, "memberCount": "", canEdit: true }
    var id = e.currentTarget.id;
    var index = id.split("_")[1];
    var tiks = this.data.tickets;
    tiks.splice(tiks.length, 0, tksItem)
    this.setData({ tickets: tiks })
  }
})