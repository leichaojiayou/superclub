const app = getApp();
const actApi = app.api("actApi");
const userApi = app.api("userApi");
const utils = app.util
const session = app.session;

let inputData = new Object();
/**
 是否重定向到applylist页面
 */
let redirectPage = false;
let applyInfos;
let applyResult = 0;
let activityId, applyId;//活动ID、报名Id
Page({
    data: {
        type: 0,//0、普通报名模式；1、帮报名填写模式；2、修改报名资料模式；3、帮报名模式(可以立即帮报名);4、重新报名页面;5、支付模式（已报名但未支付）
        isCost: false,
        selectTicketIndex: 0,
        selectTicket: {}, //已选择的票价
        tickets: [], //票价列表
        fields: [], //需要填写的信息列表

        //验证手机的字段
        authCode: "",
        interval: "",
        authDialog: {
            phone: '',
            modalShowStyle: "",
            focus: false,
            status: 0, //0: 显示发送验证码的按钮 1: 倒数中
        },
        countDown: 30,
        formId: 0,
        needPayCost: '',//马上报名按钮上显示金额
        helperApply: 0,//是否允许帮报名, 1为允许, 2为不允许.
        greenButtonText: '',//立即报名按钮
    },
    pickerEvent: function (e) {//选择器事件
        let that = this;
        let index = e.currentTarget.dataset.index;
        let item = e.currentTarget.dataset.item;
        that.data.fields[index].select = e.detail.value;
        that.data.fields[index].defaultValue = item.option[e.detail.value];
        this.setData({
            fields: that.data.fields,
        });
        inputData[item.fieldName] = item.option[e.detail.value];
        console.log(inputData, e);
    },
    inputEvent: function (e) {//输入框事件
        let index = e.currentTarget.dataset.index;
        let item = e.currentTarget.dataset.item;

        inputData[item.fieldName] = e.detail.value;
        this.data.fields[index].defaultValue = e.detail.value;
        console.log(inputData);
    },

    onLoad: function (param) {
        //初始化全局变量
        redirectPage = false;
        applyResult = 0;
        activityId = 0;
        applyId = 0;
        let that = this;
        activityId = param.activityId;
        if (param.type == 4) {//重新报名
            if (param.applyUserType == 0) {//自己重新报名
                param.type = 0;
            } else {//帮人重新报名
                param.type = 3;
                applyId = param.applyId;
            }
        }
        that.data.greenButtonText = param.type != 1 && param.type != 2 ? '马上报名' : '保存';
        that.setData({
            type: param.type,
            helperApply: param.helperApply,
            greenButtonText: that.data.greenButtonText,
        });
        if (that.data.type == 0) {
            app.wxService.setNavigationBarTitle("报名活动");
            that.loadApplyInfo();
        } else if (that.data.type == 1) {
            app.wxService.setNavigationBarTitle("帮人报名");
            applyInfos = session.getApplyInfo();
            if (!applyInfos) {
                applyInfos = {current: 0, infos: []};
                that.loadApplyInfo();
            } else if (!applyInfos.infos) {
                applyInfos = {current: 0, infos: []};
                that.loadApplyInfo();
            } else {//帮人报名编辑模式
                let applyInfo = applyInfos.infos[applyInfos.current];
                console.log(applyInfo);
                if (applyInfo) {
                    that.setData({
                        isCost: applyInfo.isCost,
                        selectTicketIndex: applyInfo.selectTicketIndex,
                        selectTicket: applyInfo.selectTicket,//已选择的票价
                        tickets: applyInfo.tickets,//票价列表
                        fields: applyInfo.fields,//需要填写的信息列表
                    });
                } else {
                    that.loadApplyInfo();
                }
            }
        } else if (that.data.type == 2) {
            app.wxService.setNavigationBarTitle("修改报名资料");
            applyId = param.applyId;
            that.loadApplyInfo();
        } else if (that.data.type == 3) {
            app.wxService.setNavigationBarTitle("帮人报名");
            that.loadApplyInfo();
        }
    },
    loadApplyInfo: function () {//获取报名需要填写的信息
        let that = this;
        actApi.getApplyInfo({
            data: {
                activity_id: activityId,
                apply_id: applyId,
            },
        }, function (res) {
            console.log(JSON.stringify(res.data));
            let data = res.data;
            let actForm = JSON.parse(res.data.actForm);
            let tickets = res.data.tickets;
            let fieldArr = actForm.map(function (item) {
                return item.name;
            });
            let fields = res.data.fields.filter(function (element, index, self) {//用于过滤出真实需要填写的数据
                if (fieldArr.indexOf(element.fieldName) < 0) {
                    return false;
                } else {
                    return true;
                }
            });
            fields.forEach(function (item) {
                if (item.fieldType == 2 && item.option) {//选择
                    item.option = item.option.split(',');
                    if (item.defaultValue) {
                        item.select = item.option.indexOf(item.defaultValue);
                        inputData[item.fieldName] = item.defaultValue;
                    } else {
                        if (item.option.length == 1) {
                            item.defaultValue = item.option[0];
                            item.select = 0;
                            inputData[item.fieldName] = item.defaultValue;
                        } else {
                            inputData[item.fieldName] = null;
                            item.select = -1;
                        }
                    }
                } else {//文本填写
                    inputData[item.fieldName] = item.defaultValue;
                    item.placeHolder = '输入';
                    if (item.fieldName == "手机") {
                        item.inputType = "number";
                        item.placeHolder = "请填写手机";
                        item.maxText = 11;
                        if (data.mobile && that.data.type == 0) {//自己报名自动填写手机
                            item.defaultValue = data.mobile;
                            inputData[item.fieldName] = item.defaultValue;
                        }
                    } else {
                        item.inputType = "text";
                        item.maxText = 30;
                    }
                    if (item.fieldName == "昵称") {
                        item.placeHolder = "请填写昵称";
                        item.maxText = 10;
                        if (data.userNick && that.data.type == 0) {//自己报名自动填写昵称
                            item.defaultValue = data.userNick;
                            inputData[item.fieldName] = item.defaultValue;
                        }
                    }
                }
            });

            if (tickets && tickets.length != 0) {
                let tickets = res.data.tickets;
                let selectTicket = null;
                if (tickets.length == 1) {
                    selectTicket = tickets[0];
                    tickets[0].isDefault = 1;
                }
                if (that.data.type == 2) {
                    selectTicket = tickets[0];
                }
                tickets.forEach(function (item) {
                    item.desc = item.name + "：" + (item.cost / 100);
                    let remain = 0;
                    if (item.memberCount == -1) {
                        remain = "名额不限"
                    } else {
                        if ((item.memberCount - item.applyCount) > 0) {
                            remain = item.memberCount - item.applyCount
                        } else {
                            remain = 0
                        }
                    }
                    item.remain = remain;//名额限制描述
                });
                let needPayCost = '';
                if (that.data.type != 2 && that.data.type != 1 && selectTicket) {//普通报名模式要显示已选择金额
                    needPayCost = data.howToPay != 1 ? utils.realformatMoney(selectTicket.cost) + '，' : '';
                }
                that.setData({
                    isCost: data.howToPay != 1,
                    fields: fields,
                    selectTicketIndex: 0,
                    selectTicket: selectTicket,
                    needPayCost: needPayCost,
                    tickets: tickets,
                });
            } else {//免费活动
                that.setData({
                    isCost: data.howToPay != 1,
                    fields: fields,
                });
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            utils.showTip(that, '报名信息加载失败:' + errorMsg.content);
        }, function (res) {
            console.log(res);
            if (that.data.type == 3) {//帮人报名置空报名id
                applyId = 0;
            }
        });
    },
    trimStr: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },
    checkInput: function (showTips) {//检查填写信息是否有错误
        if (!this.data.selectTicket) {
            utils.showTip(this, '请选择票价');
            return false;
        }
        for (let item of this.data.fields) {
            let value = this.trimStr(inputData[item.fieldName]);
            if (item.fieldName == "身份证" || item.fieldName == "身份证号" || item.fieldName == '身份证号码') {
                let result = utils.checkID(value);
                if (result != 0) {
                    utils.showTip(this, "请输入正确的" + item.fieldName);
                    return;
                }
            }
            if (!value || value.lengh == 0 || (item.fieldName == "手机" && value.length != 11)) {
                if (showTips) {
                    utils.showTip(this, item.fieldName + "填写错误");
                }
                return false;
            }
        }
        return true;
    },
    greenButton: function (e) {//立即报名、或”保存“按钮
        //type: 0、普通报名模式；1、帮报名填写模式；2、修改报名资料模式
        this.data.formId = e.detail.formId;
        let that = this;
        if (that.data.type == 0 || that.data.type == 4 || that.data.type == 3) {//立即报名
            that.apply();
        } else if (that.data.type == 1) {//保存按钮，帮报名,将数据存入stroage，并重定向到applylist
            if (this.checkInput(true)) {
                let applyInfo = {
                    isCost: that.data.isCost,
                    selectTicketIndex: that.data.selectTicketIndex,
                    selectTicket: that.data.selectTicket,//已选择的票价
                    tickets: that.data.tickets,//票价列表
                    fields: that.data.fields,//需要填写的信息列表
                };
                applyInfos.infos[applyInfos.current] = applyInfo;
                session.saveApplyInfo(applyInfos);
                if (redirectPage) {
                    let url = "activity/applylist/applylist?type=1&isCost=" + that.data.isCost + "&activityId=" + activityId;
                    app.wxService.redirectTo(url);
                } else {
                    app.wxService.navigateBack();
                }
            }
        } else if (this.data.type == 2) {//修改报名资料
            that.update();
        } else if (this.data.type == 5) {//立即支付
            that.getUnPayId();
        }
    },
    update: function () {//修改报名资料
        let that = this;
        let data = JSON.stringify(inputData);
        console.log(data);
        if (this.checkInput(true)) {
            actApi.updateApplyInfo({
                    data: {
                        actID: activityId,
                        data: data,
                        ticketID: that.data.selectTicket.ticketID,
                        phone: inputData["手机"],
                        applyPlatform: 3,
                        applyID: applyId,
                    },
                    method: "POST",
                }
                , function (res) {
                    let pages = getCurrentPages();
                    let currPage = pages[pages.length - 1];   //当前页面
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(5);
                    app.wxService.navigateBack();
                }, function (res) {
                    let errorMsg = utils.getErrorMsg(res);
                    utils.showTip(that, '保存失败:' + errorMsg.content);
                }, function (res) {
                    console.log(res)
                });
        }
    },
    apply: function () { //立即报名
        let that = this;
        let data = JSON.stringify(inputData);
        console.log(data);
        if (!this.checkInput()) {
            //utils.showTip(that, '请完善当前用户报名信息');
            return
        } else if (getApp().session.isTempUser()) {
            this.validatePhone();
            return
        }
        let applyRequest = null;
        if (that.data.type == 3) {
            applyRequest = actApi.actApplyHelp;
        } else {
            applyRequest = actApi.actApplySelf;
        }

        applyRequest({
            data: {
                activity_id: activityId,
                data: data,
                ticket_id: that.data.selectTicket.ticketID,
                phone: inputData["手机"],
                paid: 0,
                applyPlatform: 3,
                formId: that.data.formId,
            },
            method: "POST",
        }, function (res) {
            applyResult = res.data.result;
            if (applyResult > 0) { //报名成功，返回活动详情页面，并带回值
                if (!that.data.isCost && that.data.selectTicket.cost == 0) {//支付金额为0，不需要支付
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(applyResult);
                    app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: 1});
                    app.wxService.navigateBack();
                    return;
                }
                if (that.data.isCost && that.data.needPayCost && that.data.needPayCost.length > 0) {
                    that.getUnPayId();
                } else {
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(applyResult);
                    app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: 1});
                    app.wxService.navigateBack();
                }
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
                utils.showTip(that, '报名失败:' + error);
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            utils.showTip(that, '报名失败:' + errorMsg.content);
        }, function (res) {
            console.log(res)
        });
    },
    helpApply: function (e) { //帮人报名(立即报名页面点击帮人报名)
        let that = this;
        if (that.data.helperApply == 2) {
            utils.showTip(that, "当前活动不允许帮人报名");
            return;
        }
        if (!this.checkInput(false)) {
            utils.showTip(that, '请先完善当前用户信息');
            return
        } else if (getApp().session.isTempUser()) {
            this.validatePhone();
            return
        }
        if (this.checkInput(false)) {
            let applyInfo = {
                isSelf: that.data.type == 0,//是否自己的报名信息
                isCost: that.data.isCost,
                selectTicketIndex: that.data.selectTicketIndex,
                selectTicket: that.data.selectTicket,//已选择的票价
                tickets: that.data.tickets,//票价列表
                fields: that.data.fields,//需要填写的信息列表
            };
            applyInfos = {current: 1, infos: [applyInfo]};
            session.saveApplyInfo(applyInfos);
            redirectPage = true;
            that.setData({
                type: 1,
                needPayCost: '',
            });
            app.wxService.setNavigationBarTitle("帮人报名");
            that.loadApplyInfo();
        } else {
            utils.showTip(that, '请先完善当前用户信息');
        }
    },

    /**
     * 微信小程序临时用户，验证手机号码
     */
    validatePhone: function () {
        let phone = inputData["手机"]
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
        let phone = inputData["手机"]
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
    getUnPayId: function () {//报名成功,获取unPayID
        let that = this;
        actApi.getUnPayId({
            data: {
                activity_id: activityId,
            }
        }, function (res) {
            let unPayId = res.data.unPayId;
            if (unPayId > 0) {
                that.checkWeChatLogin(unPayId);
            } else {
                utils.showTip(that, '支付订单ID错误:unPayId=' + unPayId);
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.wxService.showModal({//获取unPayId失败弹窗
                title: '',
                content: '获取支付订单错误:' + errorMsg.content,
                confirmText: "重试"
            }, function (res) {
                if (res.confirm) {//点击重试按钮，重试
                    that.getUnPayId();
                } else {//点击取消按钮，重载活动详情
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
                    prevPage.recvData(applyResult);
                    app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: 1});
                    app.wxService.navigateBack();
                },
                fail: function () {
                    utils.showTip(that, '微信支付失败');
                    let pages = getCurrentPages();
                    let currPage = pages[pages.length - 1];   //当前页面
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(110);//返回act_detail result==110，代表支付失败
                    //app.wxService.navigateBack();
                    that.setData({
                        type: 5,
                        greenButtonText: '立即支付',
                    })
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
     * 票价改变事件
     * @param e
     */
    changehidden: function (e) {
        let index = e.currentTarget.id;
        let tickets = this.data.tickets;
        if (tickets[index].memberCount != -1 && ((tickets[index].memberCount - tickets[index].applyCount) == 0)) {
            //暂无名额
            return;
        }
        for (let i = 0; i < tickets.length; i++) {
            tickets[i].isDefault = 0;
        }
        tickets[index].isDefault = 1;
        let needPayCost = '';
        if (this.data.type != 2 && this.data.type != 1) {
            needPayCost = this.data.isCost ? utils.realformatMoney(tickets[index].cost) + '，' : '';
        }
        this.setData({
            selectTicketIndex: index,
            selectTicket: tickets[index],
            needPayCost: needPayCost,
            tickets: tickets
        });
        //每次选择费用后就关闭
        let animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        animation.translateY(300).step();
        setTimeout(function () {
            animation.translateY(0).step();
            this.setData({animationData: animation});
            this.setData({showModalStatus: false});
        }.bind(this), 0);
    },
    /**
     * 选择票价弹窗
     * @param e
     */
    setModalStatus: function (e) {
        if (this.data.type == 2) {
            return;
        }
        let animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        this.animation = animation;
        animation.translateY(300).step();
        this.setData({
            animationData: animation.export()
        });
        if (e.currentTarget.dataset.status == 1) {
            this.setData(
                {
                    showModalStatus: true
                }
            );
        }
        setTimeout(function () {
            animation.translateY(0).step();
            this.setData({
                animationData: animation
            });
            if (e.currentTarget.dataset.status == 0) {
                this.setData(
                    {
                        showModalStatus: false
                    }
                );
            }
        }.bind(this), 200)
    },
    agreeButton: function () {//超级俱乐部服务协议
        app.wxService.showModal({
            title: '提示',
            content: '请用浏览器访问https://im.51julebu.com/resource/pages/protocol_supperClub.html',
            showCancel: false
        })
    },
});