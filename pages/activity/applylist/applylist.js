const app = getApp();
const utils = app.util;
const actApi = app.api("actApi");
const userApi = app.api("userApi");
const session = app.session;

let activityId;
/**
 * applyInfo内容
 *  let applyInfo = {
   isCost: that.data.isCost,
   selectTicketIndex: that.data.selectTicketIndex,
   selectTicket: that.data.selectTicket,//已选择的票价
   tickets: that.data.tickets,//票价列表
  fields: that.data.fields,//需要填写的信息列表
   };
 */
let applyInfos;
let allCost;//累计需要付款的金额
let applyResult = 0;
let applyCount = 0;//报名数额
let loadEndPayImmediately = false;
Page({
    data: {
        isCost: false,//是否是付费活动
        type: 0,//0、编辑模式（修改报名资料、取消报名）；1、报名模式，一次帮报多个名额;2、立即付款模式
        greenButtonText: '立即报名',
        applyList: [],//报名数据列表(修改报名资料时使用)
        formId: 0,
    },
    onLoad: function (param) {
        applyCount = 0;
        let that = this;
        activityId = param.activityId;
        this.setData({
            type: param.type,
        });
        if (this.data.type == 1) {
            app.wxService.setNavigationBarTitle("报名活动");
            this.setData({isCost: param.isCost == 'true'});
        } else if (this.data.type == 0) {
            app.wxService.setNavigationBarTitle("修改报名资料");
            that.setData({greenButtonText: '立即报名'});
            this.loadApplyList();
        } else if (this.data.type == 2) {
            app.wxService.setNavigationBarTitle("立即付款");
            that.setData({greenButtonText: '立即付款'});
            loadEndPayImmediately = true;
            this.loadApplyList();
        }
    },
    onShow: function () {
        let that = this;
        allCost = 0;
        if (this.data.type == 1) {
            applyInfos = session.getApplyInfo();
            if (applyInfos.infos.length > 0) {
                let infos = [];
                applyInfos.infos.forEach(function (item) {
                    let selectTicket = item.selectTicket;
                    allCost = allCost + selectTicket.cost;
                    let info = that.translationApplyInfo(item);
                    if (info) {
                        infos.push(info);
                    }
                });
                let greenButtonText = '';
                if (that.data.isCost) {
                    greenButtonText = utils.realformatMoney(allCost) + '，马上报名';
                } else {
                    greenButtonText = '马上报名';
                }
                that.setData({
                    applyList: infos,
                    greenButtonText: greenButtonText
                })
            } else {
                app.wxService.navigateBack();
            }
        }
    },
    /**
     * //转换操作，将编辑报名资料页面applyInfo转换为这里可以渲染的数据
     */
    translationApplyInfo: function (applyInfo) {
        console.log(applyInfo);
        if (applyInfo && typeof applyInfo == 'object') {
            let selectTicket = applyInfo.selectTicket;
            let newData = new Object();
            if (selectTicket) {
                newData.feiyong = utils.realformatMoney(selectTicket.cost) + selectTicket.name;
                newData.ticketID = selectTicket.ticketID;
            }
            let extraDatas = [];
            applyInfo.fields.forEach(function (item) {
                if (item.fieldName == "昵称") {
                    newData.userName = item.defaultValue;
                } else if (item.fieldName == "手机") {
                    newData.mobile = item.defaultValue;
                } else if (item.fieldName == "性别") {
                    newData.gender = item.defaultValue;
                } else {
                    let extraData = new Object();
                    extraData.name = item.fieldName;
                    extraData.value = item.defaultValue;
                    extraDatas.push(extraData)
                }
            });
            newData.extraDatas = extraDatas;
            return newData;
        } else {
            return undefined;
        }
    },
    editApply: function (e) {//编辑按钮
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        if (this.data.type == 0 || this.data.type == 2) {//编辑模式
            app.wxService.navigateTo("activity/apply_page/apply_page", {
                activityId: activityId,
                applyId: item.id,
                type: 2
            })
        } else if (this.data.type == 1) {//帮报模式
            session.saveApplyInfo({current: index, infos: applyInfos.infos});
            app.wxService.navigateTo("activity/apply_page/apply_page", {activityId: activityId, type: 1});
        }
    },
    deleteApply: function (e) {//删除按钮
        let that = this;
        let item = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;
        if (this.data.type == 0 || this.data.type == 2) {//编辑模式
            if (item.applyUserType == 0 && that.data.applyList.length > 1) {//删除自己报名要提示
                app.util.showTip(that, '取消帮报名成员，才能取消自己报名');
                return;
            } else if (that.data.isCost && item.payStatus < 7 && this.data.type != 2 && item.payStatus != 1 && item.payStatus != 6) {
                app.wxService.showModal({
                    showCancel: false,
                    confirmText: '知道了', content: '小程序暂不支持付费活动在线退款，请到网页端和App操作'
                });
                return;
            }
            that.cancelApply(item, item.id);
        } else if (this.data.type == 1) {//帮报模式
            let info = applyInfos.infos[index];
            if (info.isSelf && applyInfos.infos.length > 1) {//删除自己报名要提示
                app.util.showTip(that, '取消帮报名成员，才能取消自己报名');
                return;
            }
            applyInfos.infos.splice(index, 1);
            session.saveApplyInfo(applyInfos);
            if (applyInfos.infos.length > 0) {
                let infos = [];
                allCost = 0;
                applyInfos.infos.forEach(function (item) {
                    let info = that.translationApplyInfo(item);
                    let selectTicket = item.selectTicket;
                    allCost = allCost + selectTicket.cost;
                    if (info) {
                        infos.push(info);
                    }
                });
                let greenButtonText = '';
                if (that.data.isCost) {
                    greenButtonText = utils.realformatMoney(allCost) + '，马上报名';
                } else {
                    greenButtonText = '马上报名';
                }
                that.setData({
                    applyList: infos,
                    greenButtonText: greenButtonText,
                })
            } else {
                app.wxService.navigateBack();
            }
        }
    },
    apply: function (e) {//立即报名按钮
        if (this.data.type == 1) {//报名模式要检查手机号是否验证
            let selfInfo = applyInfos.infos[0];
            if (selfInfo.isSelf && app.session.isTempUser()) {//如果第一个不是自己的报名信息，那就是纯粹的帮报名，直接批量报名
                this.validatePhone();
                return;
            }
        }
        this.data.formId = e.detail.formId;
        if (this.data.type == 1) {
            this.applySelf();
        } else if (this.data.type == 2) {
            this.getUnPayId();
        }
    },
    applyBatch: function () { //批量报名
        let that = this;
        if (applyInfos.infos.length <= 0) {//没有需要帮报人
            if (that.data.isCost) {
                that.getUnPayId();
            } else {
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];  //上一个页面
                prevPage.recvData(applyResult);//返回act_detail result==101，代表支付成功
                app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: applyCount});
                app.wxService.navigateBack();
            }
            return;
        }
        let apply_info = [];
        applyInfos.infos.forEach(function (item) {
            let info = new Object();
            if (item.selectTicket && item.selectTicket.ticketID) {
                info.ticketID = item.selectTicket.ticketID;
            }
            info.userID = session.getUserInfo().userID;
            info.actID = activityId;
            info.phone = that.translationApplyInfo(item).mobile;
            let data = new Object();
            item.fields.forEach(function (field) {
                data[field.fieldName] = field.defaultValue;
            });
            info.data = data;
            apply_info.push(info);
        });
        actApi.applyBatch({
            data: {
                apply_info: JSON.stringify(apply_info),
                formId: that.data.formId,
            },
            method: "POST",
        }, function (res) {//自己报名和批量报名成功，直接去支付
            applyResult = res.data.result;
            if (that.data.isCost) {
                that.getUnPayId();
            } else {
                let pages = getCurrentPages();
                let currPage = pages[pages.length - 1];   //当前页面
                let prevPage = pages[pages.length - 2];  //上一个页面
                prevPage.recvData(applyResult);
                app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: applyCount});
                app.wxService.navigateBack();
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.util.showTip(that, '报名失败:' + errorMsg.content);
        }, function (res) {
            console.log(res)
        });

    },
    applySelf: function () { //给自己报名
        let that = this;
        let info = applyInfos.infos[0];
        applyCount = applyInfos.length;
        if (!info.isSelf) {//如果第一个不是自己的报名信息，那就是纯粹的帮报名，直接批量报名
            that.applyBatch();
            return;
        }
        let phone = that.translationApplyInfo(info).mobile;
        let data = new Object();
        info.fields.forEach(function (item) {
            data[item.fieldName] = item.defaultValue;
        });

        actApi.actApplySelf({
            data: {
                activity_id: activityId,
                data: JSON.stringify(data),
                ticket_id: info.selectTicket.ticketID,
                phone: phone,
                paid: 0,
                applyPlatform: 3,
                formId: that.data.formId,
            },
            method: "POST",
        }, function (res) {//自己报名成功后，移除自己的报名信息，开始批量帮报名
            applyResult = res.data.result;
            if (applyResult > 0) { //报名成功，返回活动详情页面，并带回值
                applyInfos.infos.splice(0, 1);
                that.applyBatch();
            } else { //报名失败
                // -1: 需要验证手机, 需要弹出验证码输入框.
                // -2: 手机验证码验证失败.
                // -3: 临时用户输入的手机号已关联了老用户.
                let error = ""; //报名错误信息
                switch (result) {
                    case -1:
                        error = '需要验证手机, 需要弹出验证码输入框.';
                        break;
                    case -2:
                        error = '手机验证码错误';
                        break;
                    case -3:
                        error = '手机号已关联了老用户';
                        break;
                }
                app.util.showTip(that, '报名失败:' + error);
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.util.showTip(that, '报名失败:' + errorMsg.content);
        }, function (res) {
            console.log(res)
        });
    },
    helpAplly: function () {//帮人报名按钮
        let current = applyInfos.infos.length;
        session.saveApplyInfo({current: current, infos: applyInfos.infos});
        app.wxService.navigateTo("activity/apply_page/apply_page", {activityId: activityId, type: 1})
    },
    /**
     * 编辑报名时，收到上一个页面返回的数据
     * result==5,修改报名数据成功，刷新列表
     */
    recvData: function (result) {
        let that = this;
        setTimeout(function () {
            if (result == 5) {
                that.loadApplyList();
                app.util.showTip(that, '修改成功');
            }
        }, 500);
    },
    loadApplyList: function () {//我的报名列表
        let that = this;
        let type = 0;
        if (that.data.type == 0) {
            type = 0;
        } else if (that.data.type == 2) {
            type = 1;
        }
        actApi.getMyApplyList({
            data: {
                activity_id: activityId,
                type: type,//返回类型, 默认为0, 0为修改报名资料, 返回报名成功的. 1为立即支付, 返回待付款的
            }
        }, function (res) {
            console.log(JSON.stringify(res.data));
            let isCost = false;
            let applyEntityList = res.data.applyEntityList;
            if (applyEntityList && applyEntityList.length > 0) {
                let allCost = 0;
                applyEntityList.forEach(function (item) {
                    let o = JSON.parse(item.applyData);
                    let extraDatas = [];
                    for (let property in o) {
                        let extraData = new Object();
                        if (o.hasOwnProperty(property)) {
                            extraData.name = property;
                            extraData.value = o[property];
                            extraDatas.push(extraData);
                        }
                    }
                    isCost = item.howToPay != 1;
                    item.extraDatas = extraDatas;
                    item.gender = item.sex == 1 ? "女" : "男";
                    item.feiyong = utils.realformatMoney(item.cost) + item.ticketName;
                    let payStatus = '';
                    if (item.refundStatus == 0) {
                        payStatus = '退款中';
                    } else if (item.payStatus == 1) {
                        payStatus = '待支付';
                        allCost = allCost + item.cost;
                    } else if (item.payStatus == 2) {
                        payStatus = '已支付';
                    }
                    item.payText = payStatus;
                });
                that.setData({
                    isCost: isCost,
                    applyList: applyEntityList,
                    greenButtonText: utils.realformatMoney(allCost) + '，立即支付'
                });
                if(loadEndPayImmediately){
                    loadEndPayImmediately = false;
                    that.getUnPayId();
                }
            } else {
                let tips = '';
                if (that.data.type == 1 || that.data.type == 0) {
                    tips = '已取消报名';
                } else if (that.data.type == 2) {
                    tips = '已取消报名';
                }
                app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: tips,
                    },
                    function (res) {
                        let pages = getCurrentPages();
                        let prevPage = pages[pages.length - 2];  //上一个页面
                        prevPage.recvData(6);
                        app.wxService.navigateBack();
                    });
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.util.showTip(that, '报名信息加载失败' + errorMsg.content);
        }, function (res) {
            console.log(res);
        });
    },
    cancelApply: function (item, applyId) {//取消报名
        let that = this;
        let cancelReason = ["个人行程有变，参加不了了", "不符合报名条件，主办方拒绝参加", "主办方变更了活动信息",
            "实际情况跟活动信息不符", "主办方取消了活动", "其他原因"]
        wx.showActionSheet({
            itemList: cancelReason,
            success: function (res) {
                let reason = cancelReason[res.tapIndex];
                if (reason) {
                    actApi.cancelApplySelf({
                        data: {
                            actID: activityId,
                            applyID: applyId,
                            reason: reason,
                        },
                        method: 'POST'
                    }, function (res) {
                        if (that.data.isCost && item.payStatus >= 7) {
                            let helpName = '';
                            if (item.applyUserType == 1) {//帮报名和自己报名提示语不一样
                                helpName = '帮' + item.userName;
                            }
                            app.wxService.showModal({
                                showCancel: false,
                                content: '您已取消' + helpName + '报名，您报名时选择的是其他支付方式，如已私下向主办方支付报名费用，请与主办方协商退款'
                            })
                        } else {
                            utils.showTip(that, '取消报名成功');
                        }
                        let pages = getCurrentPages();
                        let prevPage = pages[pages.length - 2];  //上一个页面
                        prevPage.recvData(5);
                        if (item.payStatus == 1) {//待付款取消
                            app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: 0});
                        } else {
                            app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: -1});
                        }
                    }, function (res) {
                        let errorMsg = utils.getErrorMsg(res);
                        app.util.showTip(that, '取消报名失败' + errorMsg.content);
                    }, function (res) {
                        console.log(res);
                        that.loadApplyList();
                    });
                }
            }
        })
    },
    getUnPayId: function () {//报名成功,获取unPayID
        let that = this;
        let costMoney = 0;
        if (that.data.type == 1) {
            applyInfos.infos.forEach(function (item) {
                costMoney = costMoney + item.selectTicket.cost;
            });
            if (costMoney == 0) {//支付金额为0，不需要支付
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 2];  //上一个页面
                prevPage.recvData(applyResult);
                app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: applyCount});
                app.wxService.navigateBack();
                return;
            }
        }
        actApi.getUnPayId({
            data: {
                activity_id: activityId,
            }
        }, function (res) {
            let unPayId = res.data.unPayId;
            if (unPayId > 0) {
                that.checkWeChatLogin(unPayId);
            } else {
                app.util.showTip(that, '支付订单ID错误:' + 'unPayId=' + unPayId);
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.wxService.showModal({//获取unPayId失败弹窗
                title: '获取支付订单错误',
                content: errorMsg.title + '；' + errorMsg.content,
                confirmText: "重试"
            }, function (res) {
                if (res.confirm) {//点击重试按钮，重试
                    that.getUnPayId();
                }
            })
        }, function (res) {
            console.log(res)
        });
    },
    checkWeChatLogin: function (unPayId) {//检查微信登录状态
        let that = this;
        app.relogin(function () {//每次支付之前都重新登录一下
                that.payAction(unPayId);
            },
            function () {
                utils.showTip(that, '支付失败:' + '请授权微信登录');
            });
    },
    payAction: function (unPayId) {//支付操作，先从服务器获取支付必要信息，然后调用微信支付
        let that = this;
        actApi.pay({
            data: {
                order_id: unPayId,
            }
        }, function (res) {
            console.log(JSON.stringify(res.data));
            wx.requestPayment({
                timeStamp: "" + res.data.prepayParams.timestamp,
                nonceStr: "" + res.data.prepayParams.nonceStr,
                package: 'prepay_id=' + res.data.prepayParams.prepayID,
                signType: 'MD5',
                paySign: res.data.prepayParams.sign,
                success: function (res) {//微信返回的支付成功
                    console.debug(res);
                    let pages = getCurrentPages();
                    let currPage = pages[pages.length - 1];   //当前页面
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(101);//返回act_detail result==101，代表支付成功
                    app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: applyCount});
                    app.wxService.navigateBack();
                },
                fail: function () {//支付失败，直接返回
                    let pages = getCurrentPages();
                    let currPage = pages[pages.length - 1];   //当前页面
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(110);//返回act_detail result==110，代表支付失败
                    //app.wxService.navigateBack();
                    that.setData({
                        type: 2,
                    });
                    that.loadApplyList();
                },
                complete: function () {
                }
            })
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.wxService.showModal({//获取unPayId失败弹窗
                title: '',
                content: '获取支付信息失败:' + errorMsg.content,
                confirmText: "重试"
            }, function (res) {
                if (res.confirm) {//点击重试按钮，重试
                    that.payAction(unPayId);
                } else {//点击取消按钮，重载活动详情
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(110);
                }
            });
        }, function (res) {
            console.log(res);
        });
    },

    /**
     * 微信小程序临时用户，验证手机号码
     */
    validatePhone: function () {
        let phone = this.translationApplyInfo(applyInfos.infos[0]).mobile;
        let that = this;
        userApi.sendAuthCode({
            data: {
                auth_type: 2,
                phone: phone
            }
        }, res => {
            let interval = setInterval(() => {
                let leftTime = that.data.countDown - 1;
                let authDialog = that.data.authDialog
                if (leftTime > 0) {
                    that.setData({
                        countDown: leftTime
                    })
                } else {
                    clearInterval(interval)
                    authDialog.status = 0
                    that.setData({
                        authDialog: authDialog,
                        countDown: 30
                    })
                }
            }, 1000)
            let authDialog = that.data.authDialog
            authDialog.phone = phone
            authDialog.status = 1
            authDialog.focus = true
            authDialog.modalShowStyle = "opacity:1;pointer-events:auto;"
            that.setData({
                authDialog: authDialog,
                interval: interval,
                countDown: 30
            })
        }, res => {
            let errorData = app.util.getErrorMsg(res)
            let errorMsg = errorData.content
            if (errorMsg == '') {
                errorMsg = "发送验证码失败"
            }
            utils.showTip(that, errorMsg);
        })
    },

    getAuthCode() {
        //点击发送验证码
        this.validatePhone()
    },

    authInput(e) {
        //输入验证码
        this.data.authCode = e.detail.value
    },

    touchCancel() {
        //点击取消
        clearInterval(this.data.interval)
        let authDialog = this.data.authDialog
        authDialog.modalShowStyle = ""
        authDialog.focus = false
        this.setData({
            authDialog: authDialog,
        })
    },

    touchAddNew() {
        let that = this
        if (this.data.authCode == '') {
            utils.showTip(that, '验证码不能为空');
            return
        }
        clearInterval(this.data.interval)
        //点击确定
        let authDialog = this.data.authDialog
        authDialog.modalShowStyle = ""
        authDialog.focus = false
        this.setData({
            authDialog: authDialog,
        })

        let code = this.data.authCode
        let phone = this.translationApplyInfo(applyInfos.infos[0]).mobile;
        userApi.bindPhone({
            method: 'POST',
            data: {
                code: code,
                phone: phone,
            }
        }, res => {
            //绑定手机成功, 重新登录一下
            getApp().relogin(res => {
                //that.apply()
                utils.showTip(that, "绑定手机成功");
            })
        }, res => {
            let errorData = utils.getErrorMsg(res)
            let errorMsg = errorData.content
            if (errorMsg == '') {
                errorMsg = "绑定手机号码失败"
            }
            utils.showTip(that, errorMsg);
        })
    },
    agreeButton: function () {//超级俱乐部服务协议
        app.wxService.showModal({
            title: '提示',
            content: '请用浏览器访问https://im.51julebu.com/resource/pages/protocol_supperClub.html',
            showCancel: false
        })
    },
});