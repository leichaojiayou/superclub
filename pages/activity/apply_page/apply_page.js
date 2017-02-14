const app = getApp();
const actApi = app.api("actApi");
const utils = app.util;
let activityId;//活动ID

let inputData = new Object();
Page({
    data: {
        isCost: false,
        selectTicketIndex: 0,
        selectTicket: {}
        ,//已选择的票价
        rightArrow: "https://cdn.51julebu.com/xiaochengxu/image/right-errow.png",
        tickets: [],//票价列表
        fields: [],//需要填写的信息列表
        dialogInfo: {},//报名成功弹窗类型
    },
    ticketSelect: function (e) {//费用选择器
        this.setData({
            selectTicketIndex: e.detail.value,
            selectTicket: this.data.tickets[e.detail.value],
        })
    },
    pickerEvent: function (e) {//选择器事件
        let that = this;
        let index = e.currentTarget.dataset.index;
        let item = e.currentTarget.dataset.item;
        that.data.fields[index].defaultValue = item.option[e.detail.value];
        this.setData({
            fields: that.data.fields,
        })
        inputData[item.fieldName] = item.option[e.detail.value];
        console.log(inputData, e);
    },
    inputEvent: function (e) {//输入框事件
        let index = e.currentTarget.dataset.index;
        let item = e.currentTarget.dataset.item;

        inputData[item.fieldName] = e.detail.value;
        console.log(inputData);
    },
    hideModal() {
        this.setData({
            dialogInfo: {
                applySucceed: ''
            }
        });
    },
    /**
     * 显示报名成功弹窗
     * @param check 0、报名成功；1、待审核
     */
    showCheck: function (check) {
        this.setData({
            dialogInfo: {
                check: check,
                applySucceed: 'opacity:1;pointer-events:auto;'
            }
        })
    },
    hideToasts: function () {//报名成功弹窗确认按钮
        this.hideModal();
        app.wxService.navigateBack();
        //app.wxService.navigateTo("activity/apply_success/apply_success",);
    },
    onLoad: function (options) {
        let that = this;
        if (options.activityId) {
            activityId = options.activityId;
        }
        console.log(activityId);
        actApi.getApplyInfo({
            data: {
                activity_id: activityId,
            },
        }, function (res) {
            let data = res.data;
            let fields = res.data.fields;
            fields.forEach(function (item) {
                if (item.fieldType == 2 && item.option) {//选择
                    item.option = item.option.split(',');
                    inputData[item.fieldName] = item.option[0];
                } else {//文本填写
                    inputData[item.fieldName] = null;
                    if (item.fieldName == "手机") {
                        item.inputType = "number"
                    } else {
                        item.inputType = "text"
                    }
                }
            });

            if (typeof tickets == Array && tickets.length != 0) {//付费活动
                let tickets = res.data.tickets;
                let selectTicket = data.tickets[0];
                tickets.forEach(function (item) {
                    item.desc = item.name + "：" + (item.cost / 100);
                });
                that.setData({
                    isCost: true,
                    fields: data.fields,
                    selectTicket: selectTicket,
                    tickets: tickets,
                });
            } else {//免费活动
                that.setData({
                    isCost: false,
                    fields: data.fields,
                });
            }
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            wx.showModal({title: '报名信息加载失败', content: errorMsg.title + '；' + errorMsg.content})
        }, function (res) {
            console.log(JSON.stringify(res.data))
        });
    },
    checkInput: function () {
        for (let item of this.data.fields) {
            let value = inputData[item.fieldName];
            if (!value || value.lengh == 0) {
                app.wxService.showModal({title: "报名信息填写错误", content: item.fieldName + "为空"});
                return false;
            }
        }
        return true;
    },
    apply: function (e) {//立即报名
        let that = this;
        let data = JSON.stringify(inputData);
        console.log(data);
        if (this.checkInput()) {
            actApi.actApplySelf({
                    data: {
                        activity_id: activityId,
                        data: data,
                        ticket_id: 0,
                        phone: inputData["手机"],
                        paid: 0,
                        applyPlatform: 3,
                    }
                }
                , function (res) {
                    app.wxService.showToast("报名成功");
                    let result = res.data.result;
                    if (result > 0) {//报名成功
                        if (that.data.isCost) {//付费活动
                        } else {//免费活动
                            if (result == 1 || result == 3) {
                                that.showCheck(0);
                            } else {
                                that.showCheck(1);
                            }
                        }
                    } else {//报名失败
                        // -1: 需要验证手机, 需要弹出验证码输入框.
                        // -2: 手机验证码验证失败.
                        // -3: 临时用户输入的手机号已关联了老用户.
                        let error = "";//报名错误信息
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
                        app.wxService.showModal({title: '报名失败', content: errorMsg.title + '；' + errorMsg.content})
                    }
                }, function (res) {
                    let errorMsg = utils.getErrorMsg(res);
                    app.wxService.showModal({title: '报名失败', content: errorMsg.title + '；' + errorMsg.content})
                }, function (res) {
                    console.log(res)
                });
        }
    },
    helpApply: function (e) {//帮人报名
        //app.wxService.navigateTo("activity/helpenlist/helpenlist")
        this.showCheck(1)
    }
})