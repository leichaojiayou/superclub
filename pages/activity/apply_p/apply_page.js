/**
 * Created by liujinqiang on 2017/3/21.
 */
const app = getApp();
const utils = app.util;
const session = app.session;
const actApi = app.api("actApi");
const userApi = app.api("userApi");

let activityId;
let applyId;//重新报名时获取以前的报名信息用的
let applyUserType;//重新报名时确定是帮自己重新报名还是帮人报名的重新报名
let field = [];//报名时需要填写的item
let applyResult = 0;

let saveIndex = 0;//循环保存报名信息时的index
let currentApplyIndex;//当前选择的报名对象在applys数组里面的位置
let recvResult = 0;
let applyAble = true;
Page({
    data: {
        type: 0,//1、从我要报名按钮进入；2、从帮人报名按钮进入；3、从修改报名or取消报名进入；4、重新报名按钮进来；5、立即支付按钮进来；
        helperApply: 0,//是否允许帮报名, 1为允许, 2为不允许.
        //各种区域显示状态
        showTicket: true,
        showHelp: true,
        showAgree: true,
        canHelp: false,//能否帮人报名
        //报名列表;{isSelf:是否自己的报名信息；
        // applyStatus:1、已经报名，2、未报名，3、已报名但有修改，4、待支付，5、审核中；
        // payType:支付类型，1、免费（待支付）2、其他支付方式，3、在线支付，4、退款中,5、待支付
        // needSave：需要请求服务器保存，比如修改了已报名、待支付的报名数据}
        applys: [],
        currentApply: {},//当前正在操作的报名对象
        tickets: [],//票价列表
        bottomButtonText: '马上报名',
        howToPay: 0,
        isSupportRefund: 1,// 是否支持退款 1：支持 0：不支持
        applyMaxNum: 0,//当前最多还可以报名人数

        //票价弹窗属性
        animationData: null,
        showModalStatus: false,

        formId: 0,
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
    },

    onLoad: function (param) {
        activityId = param.activityId;
        applyId = param.applyId;
        applyUserType = param.applyUserType;
        this.setData({
            type: param.type,
            helperApply: param.helperApply,
            showHelp: param.helperApply == 1,
            isSupportRefund: param.isSupportRefund,
        });
        if (param.type == 1) {
            this.loadApplyData();
        } else if (param.type == 2) {
            this.loadApplyData();
        } else if (param.type == 3) {
            this.setData({
                showHelp: false,
                showAgree: false,
                bottomButtonText: '保存',
            });
            this.loadApplyData();
        } else if (param.type == 4) {//重新报名
            this.loadRetryApplyData();
        } else if (param.type == 5) {//立即支付
            this.loadApplyData();
        }
    },
    /**
     * 从重新报名进来，读取以前的报名信息
     */
    loadRetryApplyData: function () {
        let that = this;
        actApi.getApplyInfo({
            data: {
                activity_id: activityId,
                apply_id: applyId,
            },
        }, function (res) {
            field = [];
            that.data.applys = [];
            let data = res.data;
            let howToPay = data.howToPay;
            let tickets = data.tickets;
            let actForm = JSON.parse(res.data.actForm);
            let applyMaxNum = data.applyMaxNum;
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
            fields.forEach(function (e) {
                if (e.fieldType == 2 && e.option) {//选择
                    e.option = e.option.split(',');
                    if (e.option.length == 1) {
                        e.defaultValue = e.option[0];
                    }
                    e.select = e.option.indexOf(e.defaultValue);
                } else {
                    e.plaeceHolder = '输入';
                    if (e.fieldName == "手机") {
                        e.inputType = "number";
                        e.placeHolder = "请填写手机";
                        e.maxText = 11;
                        e.oneLine = true;
                    } else {
                        e.inputType = "text";
                        e.maxText = 30;
                    }
                    if (e.fieldName == "昵称") {
                        e.placeHolder = "请填写昵称";
                        e.maxText = 10;
                        e.oneLine = true;
                    } else if (e.fieldName == "真实姓名") {
                        e.placeHolder = "请填写真实姓名";
                        e.oneLine = true;
                    }
                    else if (e.fieldName == "姓名") {
                        e.placeHolder = "请填写姓名";
                        e.oneLine = true;
                    }
                    else if (e.fieldName == "身份证姓名") {
                        e.placeHolder = "请填写身份证姓名";
                        e.oneLine = true;
                    }
                    else if (e.fieldName == "身份证") {
                        e.placeHolder = "请填写身份证";
                        e.oneLine = true;
                    }
                    else if (e.fieldName == "身份证号码") {
                        e.placeHolder = "请填写身份证号码";
                        e.oneLine = true;
                    }
                    else if (e.fieldName == "身份号码") {
                        e.placeHolder = "请填写身份号码";
                        e.oneLine = true;
                    }
                    else if (e.fieldName == "身份证号") {
                        e.placeHolder = "请填写身份证号";
                        e.oneLine = true;
                    }
                }
                let json = JSON.stringify(e);
                field.push(JSON.parse(json));
            });
            field.forEach(function (e) {
                e.defaultValue = '';
            });
            if (that.data.type == 4) {//重新报名进来
                let applyItem = new Object();//{isSelf:是否自己的报名信息；applyStatus:1、已经报名，2、未报名，3、已报名但有修改}
                applyItem.applyActionIco = 'https://cdn.51julebu.com/xiaochengxu/image/delet2@2x.png';
                applyItem.applyActionText = '删除';
                applyItem.applyStatusText = '未报名';
                applyItem.fields = fields;
                applyItem.isSelf = applyUserType == 0;
                applyItem.applyStatus = 2;
                if (tickets && tickets.length == 1) {//只有一个选项时，默认选中
                    let selectTicket = tickets[0];
                    if (selectTicket.memberCount != -1 && ((selectTicket.memberCount - selectTicket.applyCount) == 0)) {
                        //没有名额，不用自动选中
                    } else {
                        applyItem.selectTicket = tickets[0];
                        applyItem.selectTicketIndex = 0;
                    }
                }
                that.data.applys.push(applyItem);
            } else {
                utils.showTip(that, '接口调用错误，请检联系客服');
            }
            that.data.showTicket = !!(tickets && tickets.length > 0);
            that.setData({
                showTicket: that.data.showTicket,
                tickets: tickets,
                applys: that.data.applys,
                howToPay: howToPay,
                applyMaxNum: applyMaxNum,
            })
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            utils.showTip(that, '报名信息加载失败:' + errorMsg.content);
        }, function (res) {
        });
    },
    loadApplyData: function () {
        let that = this;
        actApi.getMyApplyList({
                data: {
                    activity_id: activityId,
                    type: this.data.type == 5 ? 1 : 2,//返回类型, 默认为0, 0为修改报名资料, 返回报名成功的. 1为立即支付, 返回待付款的
                },
                api_version: 16,
            }, function (res) {
                field = [];
                that.data.applys = [];
                let data = res.data;
                let howToPay = data.howToPay;
                let tickets = data.tickets;
                let actForm = JSON.parse(res.data.actForm);
                let applyList = res.data.applyEntityList;
                let applyMaxNum = data.applyMaxNum;
                that.data.howToPay = howToPay;
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
                fields.forEach(function (e) {
                    if (e.fieldType == 2 && e.option) {//选择
                        e.option = e.option.split(',');
                        if (e.option.length == 1) {
                            e.defaultValue = e.option[0];
                        }
                        e.select = e.option.indexOf(e.defaultValue);
                    } else {
                        //，真实姓名、姓名、身份证姓名、身份证、身份证号码、身份号码、身份证号
                        e.plaeceHolder = '输入';
                        if (e.fieldName == "手机") {
                            e.inputType = "number";
                            e.placeHolder = "请填写手机";
                            e.maxText = 11;
                            e.oneLine = true;
                        } else {
                            e.inputType = "text";
                            e.maxText = 30;
                        }
                        if (e.fieldName == "昵称") {
                            e.placeHolder = "请填写昵称";
                            e.maxText = 10;
                            e.oneLine = true;
                        } else if (e.fieldName == "真实姓名") {
                            e.placeHolder = "请填写真实姓名";
                            e.oneLine = true;
                        }
                        else if (e.fieldName == "姓名") {
                            e.placeHolder = "请填写姓名";
                            e.oneLine = true;
                        }
                        else if (e.fieldName == "身份证姓名") {
                            e.placeHolder = "请填写身份证姓名";
                            e.oneLine = true;
                        }
                        else if (e.fieldName == "身份证") {
                            e.placeHolder = "请填写身份证";
                            e.oneLine = true;
                        }
                        else if (e.fieldName == "身份证号码") {
                            e.placeHolder = "请填写身份证号码";
                            e.oneLine = true;
                        }
                        else if (e.fieldName == "身份号码") {
                            e.placeHolder = "请填写身份号码";
                            e.oneLine = true;
                        }
                        else if (e.fieldName == "身份证号") {
                            e.placeHolder = "请填写身份证号";
                            e.oneLine = true;
                        }
                    }
                    let json = JSON.stringify(e);
                    field.push(JSON.parse(json));
                });
                if (that.data.type == 1) {//从我要报名进来的，先给自己添加一个报名表格
                    let applyItem = new Object();//{isSelf:是否自己的报名信息；applyStatus:1、已经报名，2、未报名，3、已报名但有修改}
                    fields.forEach(function (element) {
                        if (element.fieldName == "手机" && data.mobile) {//自己报名自动填写手机
                            element.defaultValue = data.mobile;
                        } else if (element.fieldName == "昵称" && data.userNick) {//自己报名自动填写昵称
                            element.defaultValue = data.userNick;
                        } else if (element.fieldName == '性别' && data.sex) {
                            element.defaultValue = data.sex == 1 ? '女' : '男';
                            element.select = element.option.indexOf(element.defaultValue)
                        }
                    });
                    applyItem.applyActionIco = 'https://cdn.51julebu.com/xiaochengxu/image/delet2@2x.png';
                    applyItem.applyActionText = '删除';
                    if (howToPay == 1) {
                        applyItem.applyStatusText = '未报名';
                    } else {
                        applyItem.applyStatusText = '待支付';
                    }
                    applyItem.fields = fields;
                    applyItem.isSelf = true;
                    applyItem.applyStatus = 2;
                    if (tickets && tickets.length == 1) {//只有一个选项时，默认选中
                        let selectTicket = tickets[0];
                        if (selectTicket.memberCount != -1 && ((selectTicket.memberCount - selectTicket.applyCount) == 0)) {
                            //没有名额，不用自动选中
                        } else {
                            applyItem.selectTicket = tickets[0];
                            applyItem.selectTicketIndex = 0;
                        }
                    }
                    that.data.applys.push(applyItem);
                } else if (that.data.type == 2) {//帮人报名进来，先添加一个帮报信息
                    that.data.applys.push(that.generateApplyItem(false));
                } else if (that.data.type == 3 || that.data.type == 5) {//从取消报名or修改报名进入or待支付
                    if (applyList.length == 0) {//没有报名信息，弹窗提示
                        app.wxService.showModal({
                                showCancel: false,
                                confirmText: '知道了',
                                content: "已取消所有报名",
                            },
                            function (res) {
                                let pages = getCurrentPages();
                                let prevPage = pages[pages.length - 2];
                                prevPage.recvData(6);//刷新上一个页面
                                app.wxService.navigateBack();
                            });
                        return;
                    }

                    applyList.forEach(function (apply) {
                            let applyItem = that.generateApplyItem(apply.applyUserType == 0);
                            if (tickets && tickets.length > 0) {
                                tickets.forEach(function (t) {
                                    if (t.ticketID == apply.ticketID) {
                                        applyItem.selectTicket = t;
                                        applyItem.selectTicketIndex = tickets.indexOf(t);
                                    }
                                });
                            }
                            applyItem.applyActionIco = 'https://cdn.51julebu.com/xiaochengxu/image/delet2@2x.png';
                            applyItem.applyActionText = '删除';
                            if (apply.howToPay == 1) {//payType:支付类型，1、免费,2、其他支付方式，3、在线支付，4、退款中}
                                applyItem.payType = 1;
                                applyItem.applyStatusText = '已报名';
                            } else if (apply.payStatus >= 7) {//其他支付方式
                                applyItem.payType = 2;
                                applyItem.applyStatusText = '已支付';
                            } else if (apply.refundStatus == 0) {//退款中
                                applyItem.payType = 4;
                                applyItem.applyActionIco = 'https://cdn.51julebu.com/xiaochengxu/image/back123@2x.png';
                                applyItem.applyActionText = '撤销';
                                applyItem.applyStatusText = '退款中';
                            } else if (apply.payStatus == 2) {//在线支付
                                applyItem.payType = 3;
                                applyItem.applyStatusText = '已支付';
                            } else {
                                applyItem.payType = 1;
                                applyItem.applyStatusText = '已报名';
                            }
                            applyItem.applyId = apply.id;
                            if (that.data.type == 5 || apply.payStatus == 1) {
                                applyItem.applyStatus = 4;
                                applyItem.payType = 5;
                                applyItem.applyStatusText = '待支付';
                            } else {
                                if (apply.applyStatus == 0) {//待审核
                                    applyItem.applyStatus = 5;
                                    applyItem.applyStatusText = '待审核';
                                } else {
                                    applyItem.applyStatus = 1;
                                }
                            }
                            applyItem.fields.forEach(function (field) {
                                if (field.fieldName == '昵称') {
                                    field.defaultValue = apply.userName;
                                } else if (field.fieldName == "性别") {
                                    field.defaultValue = apply.sex == 1 ? '女' : '男';
                                    field.select = field.option.indexOf(field.defaultValue);
                                } else if (field.fieldName == '手机' || field.fieldName == '手机号') {
                                    field.defaultValue = apply.mobile;
                                } else {
                                    let applyData = JSON.parse(apply.applyData);
                                    for (let property in applyData) {
                                        if (applyData.hasOwnProperty(property)) {
                                            if (field.fieldName == property) {
                                                if (field.fieldType == 2) {//单选
                                                    field.defaultValue = applyData[property];
                                                    field.select = field.option[field.defaultValue];
                                                } else {
                                                    field.defaultValue = applyData[property];
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                            that.data.applys.push(applyItem);
                        }
                    );
                } else if (that.data.type == 4) {//重新报名进来
                    utils.showTip(that, '重新报名进来，不要调用这个接口');
                }
                that.data.showTicket = !!(tickets && tickets.length > 0);
                let needCost = 0;
                if (that.data.type == 5) {
                    that.data.applys.forEach(function (apply) {
                        if (apply.selectTicket) {
                            needCost = needCost + apply.selectTicket.cost;
                        }
                    });
                }
                if (that.data.showTicket)
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
                let bottomButtonText = '马上报名';
                if (that.data.type == 3) {
                    bottomButtonText = '保存';
                } else if (that.data.type == 5) {
                    bottomButtonText = needCost > 0 ? utils.formatMoney(needCost) + ' 立即支付' : '马上报名'
                }
                that.setData({
                    showTicket: that.data.showTicket,
                    tickets: tickets,
                    applys: that.data.applys,
                    howToPay: howToPay,
                    bottomButtonText: bottomButtonText,
                    applyMaxNum: applyMaxNum,
                })
            },
            function (res) {
                let errorMsg = utils.getErrorMsg(res);
                utils.showTip(that, '报名信息加载失败:' + errorMsg.content);
            }
        )
        ;
    },
    helpApply: function (e) {
        if (this.data.applys.length >= this.data.applyMaxNum) {
            utils.showTip(this, '最多帮报10人');
            return;
        }
        this.data.applys.push(this.generateApplyItem(false));
        this.setData({
            applys: this.data.applys,
            bottomButtonText: this.getNeedPayMoney('马上报名'),
        })
    },

    /**
     * 马上报名按钮文字
     */
    getNeedPayMoney: function (buttonText) {
        let cost = 0;
        if (this.data.howToPay != 1 && this.data.tickets && this.data.tickets.length == 1) {//只有一个选项时，默认选中
            this.data.applys.forEach(function (apply) {
                if (apply.selectTicket) {
                    cost = cost + apply.selectTicket.cost;
                }
            });
        }
        return cost > 0 ? utils.formatMoney(cost) + buttonText : buttonText;
    },

    /**
     * 立即报名按钮
     * @param e
     */
    greenButton: function (e) {
        this.data.formId = e.detail.formId;
        if (this.checkInput(true)) {//1、从我要报名按钮进入；2、从帮人报名按钮进入；3、从修改报名or取消报名进入；4、重新报名按钮进来；5、立即支付按钮进来；
            if (getApp().session.isTempUser()) {//验证手机号
                this.validatePhone();
                return
            }
            if (this.data.type == 1) {
                this.applySelf();
            } else if (this.data.type == 2) {
                this.applySelf();
            } else if (this.data.type == 3) {
                saveIndex = 0;
                this.saveApplyData(true);
            } else if (this.data.type == 4) {
                this.applySelf();
            } else if (this.data.type == 5) {
                saveIndex = 0;
                this.saveApplyData(true);
            }
        }
    },
    /**
     * 生成ApplyItem数据
     * @param self
     * @returns {Object}
     */
    generateApplyItem: function (self) {
        let applyItem = new Object();//{isSelf:是否自己的报名信息；applyStatus:1、已经报名，2、未报名，3、已报名但有修改}
        applyItem.fields = new Array();
        field.forEach(function (element) {
            let json = JSON.stringify(element);
            applyItem.fields.push(JSON.parse(json))
        });
        applyItem.applyActionIco = 'https://cdn.51julebu.com/xiaochengxu/image/delet2@2x.png';
        applyItem.applyActionText = '删除';
        if (this.data.howToPay == 1) {
            applyItem.applyStatusText = '未报名';
        } else {
            applyItem.applyStatusText = '待支付';
        }
        applyItem.isSelf = self;
        applyItem.applyStatus = 2;
        if (this.data.tickets && this.data.tickets.length == 1) {//只有一个选项时，默认选中
            applyItem.selectTicket = this.data.tickets[0];
            applyItem.selectTicketIndex = 0;
        }
        return applyItem;
    },

    /**
     * 输入事件
     */
    inputEvent: function (e) {
        let applyItemIndex = e.currentTarget.dataset.applyindex;
        let index = e.currentTarget.dataset.index;
        this.data.applys[applyItemIndex].fields[index].defaultValue = e.detail.value;
        if (this.data.applys[applyItemIndex].applyStatus == 1 || this.data.applys[applyItemIndex].applyStatus == 4 || this.data.applys[applyItemIndex].applyStatus == 5) {
            this.data.applys[applyItemIndex].needSave = true;
        }
    },
    /**
     * 单选事件
     */
    pickerEvent: function (e) {
        let applyItemIndex = e.currentTarget.dataset.applyindex;
        let index = e.currentTarget.dataset.index;
        let select = e.detail.value;
        let item = e.currentTarget.dataset.item;
        this.data.applys[applyItemIndex].fields[index].defaultValue = item.option[select];
        this.data.applys[applyItemIndex].fields[index].select = select;
        if (this.data.applys[applyItemIndex].applyStatus == 1 || this.data.applys[applyItemIndex].applyStatus == 4 || this.data.applys[applyItemIndex].applyStatus == 5) {
            this.data.applys[applyItemIndex].needSave = true;
        }
        this.setData({
            applys: this.data.applys,
        });
    },
    /**
     * 循环保存报名信息
     */
    saveApplyData: function (preSaveSuccess) {
        let that = this;
        let count = this.data.applys.length;
        if (preSaveSuccess) {//上一个保存成功
            if (saveIndex == count) {//全部保存成功，退出页面
                if (that.data.type == 5) {
                    that.applySelf();
                } else {
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(5);
                    app.wxService.navigateBack();
                }
            }
        } else {//上一个保存失败
            return;
        }
        let applyItem = this.data.applys[saveIndex];
        if (applyItem.needSave) {
            let phone = '', data = new Object();
            applyItem.fields.forEach(function (field) {
                if (field.fieldName == '手机') {
                    phone = field.defaultValue;
                }
                data[field.fieldName] = field.defaultValue;
            });
            actApi.updateApplyInfo({
                data: {
                    actID: activityId,
                    data: JSON.stringify(data),
                    ticketID: that.data.howToPay == 1 ? '' : applyItem.selectTicket.ticketID,
                    phone: phone,
                    applyPlatform: 3,
                    applyID: applyItem.applyId,
                },
                method: "POST",
            }, function (res) {//保存成功
                saveIndex = saveIndex + 1;
                applyItem.needSave = false;
                that.saveApplyData(true);
            }, function (res) {
                let errorMsg = utils.getErrorMsg(res);
                utils.showTip(that, '保存失败:' + errorMsg.content);
                that.saveApplyData(false);
            }, function (res) {
            });
        } else {
            saveIndex = saveIndex + 1;
            this.saveApplyData(true);
        }
    },
    /**
     * 删除一个报名Item
     * @param e
     */
    deleteApplyItem: function (e) {
        let index = e.currentTarget.dataset.index;
        let applyItem = this.data.applys[index];
        if (this.data.applys.length > 1 && applyItem.isSelf) {
            let canCancel = true;
            this.data.applys.forEach(function (element) {
                if (!element.isSelf && element.payType != 4) {
                    canCancel = false;
                }
            });
            if (!canCancel) {
                utils.showTip(this, '取消帮报名成员，才能取消自己报名');
                return;
            }
        }
        if (applyItem.applyStatus == 1 || applyItem.applyStatus == 3 || applyItem.applyStatus == 4 || applyItem.applyStatus == 5) {//需要请求服务器取消报名
            if (applyItem.payType == 1 || applyItem.payType == 5) {//免费和待支付可以直接取消
                this.cancelApplyAction(applyItem);
            } else if (this.data.isSupportRefund != 1) {
                utils.showTip(this, '当前活动不支持退款');
            } else if (applyItem.payType == 3) {//payType:支付类型，1、免费（待支付）2、其他支付方式，3、在线支付，4、退款中,5、待支付}
                app.wxService.navigateTo('activity/apply_cancel/apply_cancel', {
                    activityId: activityId,
                    applyId: applyItem.applyId,
                });
            } else if (applyItem.payType == 4) {//退款中的报名，进行撤销退款操作
                this.cancelRefundAction(applyItem);
            } else {
                this.cancelApplyAction(applyItem);
            }
            return;
        }
        this.data.applys.splice(index, 1);
        if (this.data.applys.length == 0) {//没有报名信息，弹窗提示
            app.wxService.showModal({
                    showCancel: false,
                    confirmText: '知道了',
                    content: "已取消所有报名",
                },
                function (res) {
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];
                    prevPage.recvData(6);//刷新上一个页面
                    app.wxService.navigateBack();
                });
            return;
        }
        this.setData({
            applys: this.data.applys,
            bottomButtonText: this.getNeedPayMoney('马上报名'),
        })
    },
    cancelApplyAction: function (applyItem) {//取消报名
        if (applyItem.applyId <= 0) {
            utils.showTip(this, "applyId为" + applyItem.applyId);
        }
        let that = this;
        let cancelReason = ["个人行程有变，参加不了了", "不符合报名条件，主办方拒绝参加", "主办方变更了活动信息",
            "实际情况跟活动信息不符", "主办方取消了活动", "其他原因"];
        wx.showActionSheet({
            itemList: cancelReason,
            success: function (res) {
                let reason = cancelReason[res.tapIndex];
                if (reason) {
                    actApi.cancelApplySelf({
                        data: {
                            actID: activityId,
                            applyID: applyItem.applyId,
                            reason: reason,
                        },
                        method: 'POST'
                    }, function (res) {
                        let content = '';
                        if (applyItem.isSelf) {
                            content = '您已取消报名，您报名时选择的是其他支付方式，如已私下向主办方支付报名费用，请与主办方协商退款';
                        } else {
                            let userName = '';
                            applyItem.fields.forEach(function (field) {
                                if (field.fieldName == '昵称5') {
                                    userName = field.defaultValue;
                                }
                            });
                            content = '您已取消帮' + userName + '报名，您报名时选择的是其他支付方式，如已私下向主办方支付报名费用，请与主办方协商退款';
                        }
                        if (applyItem.payType == 2) {//其他支付方式取消报名
                            app.wxService.showModal({
                                showCancel: false,
                                content: content,
                            })
                        } else {
                            utils.showTip(that, '取消报名成功');
                        }
                        app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: -1});
                        let index = that.data.applys.indexOf(applyItem);
                        that.data.applys.splice(index, 1);//不再请去服务器，直接从列表中删除对应数据
                        if (that.data.applys.length == 0) {//取消所有的报名信息了，弹窗提示
                            app.wxService.showModal({
                                    showCancel: false,
                                    confirmText: '知道了',
                                    content: "已取消所有报名",
                                },
                                function (res) {
                                    let pages = getCurrentPages();
                                    let prevPage = pages[pages.length - 2];
                                    prevPage.recvData(6);//刷新上一个页面
                                    app.wxService.navigateBack();
                                });
                        } else {
                            that.setData({
                                applys: that.data.applys,
                            });
                        }
                    }, function (res) {
                        let errorMsg = utils.getErrorMsg(res);
                        utils.showTip(that, '取消报名失败:' + errorMsg.content);
                    }, function (res) {
                        //that.loadApplyData();
                    });
                }
            }
        })
    },
    /**
     * 检查输入内容
     * @param showTips 是否弹窗提示
     * @returns {boolean}
     */
    checkInput: function (showTips) {
        this.setData({
            applys: this.data.applys,
        });
        let that = this;
        let errorField = null;
        this.data.applys.forEach(function (applyItem) {
            if (that.data.howToPay == 1 || (applyItem.selectTicketIndex >= 0 && applyItem.selectTicket)) {
                if (that.data.howToPay != 1 && applyItem.selectTicket.memberCount != -1 && ((applyItem.selectTicket.memberCount - applyItem.selectTicket.applyCount) <= 0)) {
                    applyItem.selectTicket = null;
                    applyItem.selectTicketIndex = -1;
                    applyItem.ticketRed = true;
                    if (!errorField) errorField = '费用名额不足，请重新选择';
                } else {
                    applyItem.ticketRed = false;
                }
            } else {
                applyItem.ticketRed = true;
                if (!errorField) errorField = '全部报名项不能为空';
            }
            if (that.data.tickets && that.data.tickets.length > 0) {//需要选择票价
                if (applyItem.selectTicket && applyItem.selectTicketIndex >= 0) {//选择了票价
                    if (applyItem.selectTicket.memberCount != -1 && ((applyItem.selectTicket.memberCount - applyItem.selectTicket.applyCount) <= 0)) {
                        //选择的票价没有名额了
                        applyItem.selectTicket = null;
                        applyItem.selectTicketIndex = -1;
                        applyItem.ticketRed = true;
                        if (!errorField) errorField = '活动名额不足';
                    } else {
                        applyItem.ticketRed = false;
                    }
                } else {
                    applyItem.ticketRed = true;
                    if (!errorField) errorField = '全部报名项不能为空';
                }
            }
            applyItem.fields.forEach(function (field) {
                if (field.fieldName == '手机' || field.fieldName == '手机号') {
                    if (field.defaultValue && field.defaultValue.length == 11) {
                        field.red = false;
                    } else if (!field.defaultValue) {
                        field.red = true;
                        if (!errorField) errorField = '全部报名项不能为空';
                    } else {
                        field.red = true;
                        if (!errorField) errorField = '手机号码或身份号码有误';
                    }
                } else if (field.fieldName == '身份证' || field.fieldName == '身份证号') {
                    if (utils.checkID(field.defaultValue) == 0) {
                        field.red = false;
                    } else if (!field.defaultValue) {
                        field.red = true;
                        if (!errorField) errorField = '全部报名项不能为空';
                    } else {
                        field.red = true;
                        if (!errorField) errorField = '手机号码或身份号码有误';
                    }
                } else if (field.defaultValue) {
                    field.red = false;
                } else {
                    field.red = true;
                    if (!errorField) errorField = '全部报名项不能为空';
                }
            })
        });
        if (errorField && showTips) utils.showTip(this, errorField);
        this.setData({
            applys: this.data.applys,
        });
        if (errorField) {
            return false;
        } else {
            return true;
        }
    },
    applySelf: function () { //给自己报名
        if (!applyAble) {
            //utils.showTip(this, '30秒内不能重复报名');
            return;
        }
        applyAble = false;
        setTimeout(function () {
            applyAble = true;
        }, 30 * 1000);
        let that = this;
        let applyItem = this.data.applys[0];
        if (!applyItem.isSelf) {//如果第一个不是自己的报名信息，那就是纯粹的帮报名，直接批量报名
            that.applyBatch();
            return;
        }
        if (applyItem.applyStatus == 1 || applyItem.applyStatus == 4 || applyItem.applyStatus == 5) {//自己已经报名成功,直接进入批量报名
            that.applyBatch();
            return;
        }
        let phone = '', data = new Object();
        applyItem.fields.forEach(function (field) {
            if (field.fieldName == '手机') {
                phone = field.defaultValue;
            }
            data[field.fieldName] = field.defaultValue;
        });
        actApi.actApplySelf({
            data: {
                activity_id: activityId,
                data: JSON.stringify(data),
                ticket_id: (applyItem.selectTicket && applyItem.selectTicket.ticketID) ? applyItem.selectTicket.ticketID : 0,
                phone: phone,
                paid: 0,
                applyPlatform: 3,
                formId: that.data.formId,
            },
            method: "POST",
        }, function (res) {//自己报名成功后，移除自己的报名信息，开始批量帮报名
            applyResult = res.data.result;
            if (applyResult > 0) { //报名成功，返回活动详情页面，并带回值
                if (that.data.howToPay == 1) {
                    if (applyResult == 1 || applyResult == 3) {//报名不需要审核
                        applyItem.applyStatus = 1;
                    } else {
                        applyItem.applyStatus = 5;
                    }
                } else {
                    applyItem.applyStatus = 4;
                }
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
        });
    },
    applyBatch: function () { //批量报名
        let that = this;
        let needApply = false;
        this.data.applys.forEach(function (apply) {
            if (apply.applyStatus == 2) {//有未报名的item
                needApply = true;
            }
        });
        if (!needApply) {//没有需要报名的，直接去支付
            that.getUnPayId();
            applyAble = true;
            return;
        }
        let apply_info = [];
        that.data.applys.forEach(function (item) {
            if (item.isSelf || item.applyStatus != 2) {
                return;
            }
            let info = new Object();
            let data = new Object();
            if (item.selectTicket && item.selectTicket.ticketID) {
                info.ticketID = item.selectTicket.ticketID;
            }
            info.userID = session.getUserInfo().userID;
            info.actID = activityId;
            item.fields.forEach(function (field) {
                if (field.fieldName == '手机') {
                    info.phone = field.defaultValue;
                }
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
            that.data.applys.forEach(function (apply) {//循环把报名数据的状态改成报名成功或待支付
                if (!apply.isSelf) {
                    if (that.data.howToPay == 1) {
                        if (applyResult == 1 || applyResult == 3) {//报名不需要审核
                            apply.applyStatus = 1;
                        } else {
                            apply.applyStatus = 5;
                        }
                    } else {
                        apply.applyStatus = 4;
                    }
                }
            });
            that.getUnPayId();
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.util.showTip(that, '报名失败:' + errorMsg.content);
        }, function (res) {
            applyAble = true;
        });

    },

//以下是支付操作
    getUnPayId: function () {//报名成功,获取unPayID
        let that = this;
        //不管支付成没成功，返回上一个页面需要刷新
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.recvData(6);
        if (this.data.howToPay == 1) {//不需要支付，直接返回上一个页面
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];  //上一个页面
            prevPage.recvData(applyResult);
            app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: that.data.applys.length});
            app.wxService.navigateBack();
            return;
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
            wx.requestPayment({
                timeStamp: "" + res.data.prepayParams.timestamp,
                nonceStr: "" + res.data.prepayParams.nonceStr,
                package: 'prepay_id=' + res.data.prepayParams.prepayID,
                signType: 'MD5',
                paySign: res.data.prepayParams.sign,
                success: function (res) {//微信返回的支付成功
                    console.debug(res);
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(applyResult);//返回act_detail result==101，代表支付成功
                    app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: that.data.applys.length});
                    app.wxService.navigateBack();
                },
                fail: function () {//支付失败，直接返回
                    utils.showTip(that, '支付失败');
                    that.setData({
                        type: 5,
                    });
                    that.loadApplyData();
                    let pages = getCurrentPages();
                    let prevPage = pages[pages.length - 2];  //上一个页面
                    prevPage.recvData(110);
                },
                complete: function () {
                }
            })
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.wxService.showModal({//获取unPayId失败弹窗
                title: '',
                content: '支付失败:' + errorMsg.content,
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
        });
    },

    /**
     * 撤销退款
     */
    cancelRefundAction: function (applyItem) {
        let that = this;
        app.wxService.showModal({//获取unPayId失败弹窗
            title: '',
            content: '确定撤销退款申请？',
        }, function (res) {
            if (res.confirm) {
                actApi.cancelRefund({
                    data: {
                        applyId: applyItem.applyId,
                    },
                    api_version: 16,
                }, function (res) {
                    app.util.showTip(that, '操作成功！');
                    applyItem.payType = 3;
                    applyItem.applyActionIco = 'https://cdn.51julebu.com/xiaochengxu/image/delet2@2x.png';
                    applyItem.applyActionText = '删除';
                    applyItem.applyStatusText = '已支付';
                    that.setData({applys: that.data.applys});
                }, function (res) {
                    let errorMsg = utils.getErrorMsg(res);
                    app.util.showTip(that, '撤销失败:' + errorMsg.content);
                }, function (res) {
                    // that.loadApplyData();
                });
            }
        });
    },

    recvData: function (result) {//报名成功、支付成功以后条用此方法传递参数
        console.log("-------apply_apge-------", result);
        recvResult = result;
    },
    onShow: function () {
        let that = this;
        switch (recvResult) {
            case 6:
                this.loadApplyData();
                break;
        }
        recvResult = 0;//每次收到数据消费完后要置空
    },
    agreeButton: function () {//超级俱乐部服务协议
        app.wxService.showModal({
            title: '提示',
            content: '请用浏览器访问https://im.51julebu.com/resource/pages/protocol_supperClub.html',
            showCancel: false
        })
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

//以下是票价弹窗内容
    /**
     * 票价改变事件
     * @param e
     */
    changehidden: function (e) {
        let that = this;
        let index = e.currentTarget.id;
        let tickets = this.data.tickets;
        let applys = this.data.applys;
        let selectTicket = tickets[index];
        if (selectTicket.memberCount != -1 && ((selectTicket.memberCount - selectTicket.applyCount) == 0)) {
            //暂无名额
            return;
        }
        for (let i = 0; i < tickets.length; i++) {
            tickets[i].isDefault = 0;
        }
        applys[currentApplyIndex].selectTicket = selectTicket;
        applys[currentApplyIndex].selectTicketIndex = index;
        this.setData({
            tickets: tickets,
            currentApply: applys[currentApplyIndex],
            applys: applys,
            bottomButtonText: that.getNeedPayMoney('马上报名'),
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
        if (this.data.type == 3) {//修改报名信息不能修改票种
            return;
        }
        currentApplyIndex = e.currentTarget.dataset.index;
        let animation = wx.createAnimation({
            duration: 200,
            timingFunction: "linear",
            delay: 0
        });
        this.animation = animation;
        animation.translateY(300).step();
        this.setData({animationData: animation.export()});
        if (e.currentTarget.dataset.status == 1) {
            let currentApply = this.data.applys[currentApplyIndex];
            let tickets = this.data.tickets;
            tickets.forEach(function (e) {
                e.isDefault = 0;
            });
            if (currentApply.selectTicketIndex >= 0 && currentApply.selectTicket) {
                tickets[currentApply.selectTicketIndex].isDefault = 1;
            }
            this.setData({
                showModalStatus: true,
                currentApply: currentApply,
                tickets: tickets,
            });
        }
        setTimeout(function () {
            animation.translateY(0).step();
            this.setData({
                animationData: animation,
            });
            if (e.currentTarget.dataset.status == 0) {
                this.setData({showModalStatus: false});
            }
        }.bind(this), 200)
    },
    hideModelStatus: function () {
        this.setData({showModalStatus: false});
    }
});