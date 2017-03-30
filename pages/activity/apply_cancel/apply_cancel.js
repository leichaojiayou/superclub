const app = getApp();
const utils = app.util;
const actApi = app.api("actApi");
const clubApi = app.api("clubApi");
const session = app.session;

let activityId, applyId;
Page({
    data: {
        reasons: ["个人行程有变，参加不了了", "不符合报名条件，主办方拒绝参加", "主办方变更了活动信息",
            "实际情况跟活动信息不符", "主办方取消了活动", "其他原因"],
        selectReason: -1,
        money: '',//需要退款的金额
        needAudit: false,//退款是否需要审核
        applyUserType: 0,//报名用户类型（0:自己 1:帮人带)
        userName: '',//取消报名的用户名
        formId: 0,
    },
    onLoad: function (param) {
        activityId = param.activityId;
        applyId = param.applyId;
        this.getApplyDetail();
    },
    getApplyDetail: function () {
        let that = this;
        actApi.applyDetail({
                data: {
                    applyID: applyId,
                }
            }, function (res) {
                let applyInfo = res.data.data.applyInfos[0];
                that.setData({
                    money: applyInfo.ticketCost,
                    needAudit: applyInfo.applyStatus != 0,
                    applyUserType: applyInfo.applyUserType,
                    userName: applyInfo.userName,
                });
            },
            function (res) {
                let errorMsg = utils.getErrorMsg(res);
                utils.showTip(that, '报名信息加载失败:' + errorMsg.content);
            },
            function (res) {
            }
        );
    },
    /**
     * 单选事件
     */
    pickerEvent: function (e) {
        let select = e.detail.value;
        this.setData({
            selectReason: select,
        });
    }

    ,
    submit: function (e) {
        this.data.formId = e.detail.formId;
        if (this.data.selectReason >= 0) {
            this.cancelApplyAction();
        } else {
            utils.showTip(this, '请选择取消原因');
        }
    }
    ,

    cancelApplyAction: function () {//取消报名
        if (applyId <= 0) {
            utils.showTip(this, "applyId为" + applyId);
        }
        let that = this;
        actApi.cancelApplySelf({
            data: {
                actID: activityId,
                applyID: applyId,
                reason: that.data.reasons[that.data.selectReason],
                formId: that.data.formId,
            },
            method: 'POST'
        }, function (res) {
            app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: -1});
            that.showTips();
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            utils.showTip(that, '取消报名失败:' + errorMsg.content);
        }, function (res) {

        });

    },
    showTips: function () {
        let that = this;
        let content = '';
        if (that.data.applyUserType == 0) {//自己报名
            if (that.data.needAudit) {
                content = '您要求取消报名，退款申请已提交至主办方，请待主办方处理。如需帮助请联系主办方或超级俱乐部客服';
            } else {
                content = '您已取消报名，报名费用将在2个工作日内原路退回至您支付所使用的账户';
            }
        } else {
            if (that.data.needAudit) {
                content = '您要求取消帮' + that.data.userName + '的报名，退款申请已提交至主办方，请待主办方处理。如需帮助请联系主办方或超级俱乐部客服';
            } else {
                content = '您已取消帮' + that.data.userName + '的报名，ta的报名费用将在2个工作日内原路退回至您支付所使用的账户';
            }
        }
        app.wxService.showModal({
            showCancel: false,
            content: content,
        }, function (res) {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            prevPage.recvData(6);//刷新上一个页面
            app.wxService.navigateBack();
        })
    }
});