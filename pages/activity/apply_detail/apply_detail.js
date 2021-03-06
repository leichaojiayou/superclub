/**
 * 报名详情就扣：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplyDetail
 */
const app = getApp();
const utils = app.util;
const actApi = app.api("actApi");
const clubApi = app.api("clubApi");
const session = app.session;
let applyId;
let recvResult = 0;
Page({
    data: {
        clubInfo: {},
        actInfo: {},
        applyInfo: {},

        costAct: false,//是否付费活动
        cancelApplyAble: false,// 取消报名按状态 true 不可以点击颜色　false 可以点击颜色
        applyStatusIco: '',//报名状态图标
        applyStatusText: '',//报名状态描述
        statusDesc: '',//报名状态说明
        applyExpiredTime: -1,//名额截止时间
        unPayCountDown: '',//名额保留倒计时
        actTitle: '',//活动标题
        hasHost: false,//是否有主办方
        host: '',//主办方
        actTime: '',//活动时间
        nickAndPhone: '',//昵称和和手机
        ticketName: '',//票名
        ticketCost: '',//票价
        applyInfos: [],//待付款可能会有多个报名信息
        qrCodeDesc: '',//电子票描述
        qrcode: '',
        /**
         * 详情类型
         * 1、报名成功-非帮报名
         * 2、报名成功-帮报名
         * 3、报名审核中
         * 4、待付款
         * 5、报名取消-超时未付款
         * 6、报名取消-主办方审核不通过
         * 7、报名取消-主办方拒绝
         * 8、报名取消-报名者取消
         * 9、退款中
         * 10、退款审核不通过
         */
        detailType: 0,
        hasHelpApply: 0,//是否有帮人报名, 0为无, 1为有.

        hasPayInfo: false,//是否显示支付信息
        payCost: 0,//订单总价
        reduceCost: 0,//优惠
        needPayCost: 0,//实付金额
        orderNum: '',//订单编号
        payTime: '',//支付时间
        payWay: '',//支付方式
        orderId: '',//交易单号
        shoukuanAccount: '',//收款账户
        refundStatus: '',//退款状态
        refuseReason: '',//拒绝退款原因
        isNeedJoinClub: 1,// 是否需要加入俱乐部才能报名该活动, 0为不需要, 1为需要.
        needJoinCheck: 0,// 是否需要验证加入（0：不需要 1：需要）
        needjoinText: '',//加入俱乐部需要填写的验证消息
        joinShowStyle: '',//加入俱乐部验证弹窗style
        formId: 0,//
        actStatus: 0,// 活动状态, 0为正常状态, 1为关闭报名, 2为活动结束
        helperApply: 0,//是否允许帮报名, 1为允许, 2为不允许.
    },
    onLoad: function (options) {
        if (options) {
            applyId = options.applyId;
        }
        recvResult = 0;
        session.saveApplyInfo({current: 0, infos: []})
        this.getApplyDetail();
    },
    /**
     * 收到上一个页面返回的数据
     */
    recvData: function (result) {
        recvResult = result;
    },
    getApplyDetail: function () {
        let that = this;
        actApi.applyDetail({
                data: {
                    applyID: applyId,
                }
            }, function (res) {
                console.log(JSON.stringify(res.data));
                let detailType = 0;
                let applyInfos = [];
                let applyInfo = res.data.data.applyInfos[0];
                let actInfo = res.data.data.actInfo;
                let actStatus = actInfo.actStatus;
                let clubInfo = res.data.data.actClubInfo;
                let orderInfo = res.data.data.orderInfo;
                let unPayMoeny = 0;//待付金额
                if (clubInfo == null) {//防止崩溃
                    clubInfo = new Object();
                }

                res.data.data.applyInfos.forEach(function (item) {
                    let info = new Object();
                    info.nickAndPhone = item.userName + "-" + item.mobile;
                    info.ticketName = actInfo.howToPay != 1 ? item.ticketName : "免费体验票";
                    info.ticketCost = actInfo.howToPay != 1 ? "¥" + item.ticketCost / 100 : "免费";
                    if (actInfo.howToPay != 1 && item.payStatus == 1) {
                        unPayMoeny = unPayMoeny + item.ticketCost;
                    }
                    applyInfos.push(info);
                });
                if (!orderInfo) {
                    orderInfo = new Object()
                }
                let payee = res.data.data.payee;
                if (!payee) {
                    payee = new Object()
                }
                let cancelApplyAble = true;
                if (actInfo.howToPay != 1) {//在线付费活动，取消报名按钮改为申请退款按钮，点击弹出提示
                    cancelApplyAble = false;
                }
                if (applyInfo.applyStatus == 3) {//主办方拒绝
                    detailType = 7;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmqx@2x.png';
                    that.data.applyStatusText = '报名取消';
                    if (applyInfo.reason) {
                        that.data.statusDesc = '主办方取消，原因：' + applyInfo.reason;
                    } else {
                        that.data.statusDesc = '主办方取消';
                    }
                } else if (applyInfo.applyStatus == 2 || applyInfo.payStatus == 4) {//报名者取消
                    detailType = 8;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmqx@2x.png';
                    that.data.applyStatusText = '报名取消';
                    if (applyInfo.reason) {
                        that.data.statusDesc = '我已取消，原因：' + applyInfo.reason;
                    } else {
                        that.data.statusDesc = '我已取消';
                    }
                } else if (actInfo.howToPay != 1 && (applyInfo.payStatus == 1 || applyInfo.payStatus == 5 || (applyInfo.applyUserType == 0 && applyInfo.payStatus == 6))) {//待付款
                    detailType = 4;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmdd@2x.png';
                    that.data.applyStatusText = '待付款' + utils.formatMoney(unPayMoeny);
                    cancelApplyAble = true;
                    if (actStatus == 1 || actStatus == 2) {//待付款，但是报名关闭或活动结束，显示为报名取消
                        detailType = 7;
                        that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmqx@2x.png';
                        that.data.applyStatusText = '报名取消';
                        if (actStatus == 1) {
                            that.data.statusDesc = '超时未付款';//'活动报名已经关闭';
                        } else if (actStatus == 2) {
                            that.data.statusDesc = '超时未付款';//'活动已结束';
                        }
                    }
                } else if (applyInfo.refundStatus == 0 || applyInfo.refundStatus == 2) {//退款中
                    detailType = 9;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmdd@2x.png';
                    that.data.applyStatusText = '退款中，待主办方审核';
                    that.data.statusDesc = '退款原因：' + applyInfo.reason;
                } else if (applyInfo.refundStatus == 1) {//退款审核不通过
                    detailType = 10;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmqx@2x.png';
                    that.data.applyStatusText = '报名成功';
                    that.data.statusDesc = '退款已关闭';
                    that.data.refundStatus = '退款关闭';
                    that.data.refuseReason = "关闭原因    主办方拒绝退款，原因：" + applyInfo.refuseReason;
                } else if (applyInfo.applyStatus == 1 && applyInfo.applyUserType == 0) {//自己报名成功
                    detailType = 1;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmcg@2x.png';
                    that.data.applyStatusText = '报名成功';
                    if (applyInfo.payStatus >= 7) {//其他支付方式
                        that.data.refundStatus = '其他支付方式';
                        cancelApplyAble = true;
                    }
                } else if (applyInfo.applyStatus == 1 && applyInfo.applyUserType == 1) {//帮人报名成功
                    detailType = 2;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmcg@2x.png';
                    that.data.applyStatusText = '报名成功';
                    if (applyInfo.payStatus >= 7) {//其他支付方式
                        that.data.refundStatus = '其他支付方式';
                        cancelApplyAble = true;
                    }
                } else if ((actInfo.howToPay != 1 && applyInfo.payStatus == 2 && applyInfo.applyStatus == 0)
                    || (actInfo.howToPay != 2 && applyInfo.applyStatus == 0)) {//待审核
                    detailType = 3;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmdd@2x.png';
                    that.data.applyStatusText = '报名审核中';
                    cancelApplyAble = false;
                } else if (actInfo.howToPay != 1 && applyInfo.payStatus == 6) {//超时未付款
                    detailType = 5;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmqx@2x.png';
                    that.data.applyStatusText = '报名取消';
                    that.data.statusDesc = '超时未付款';
                } else if (applyInfo.applyStatus == 4) {//审核不通过
                    detailType = 6;
                    that.data.applyStatusIco = 'https://cdn.51julebu.com/xiaochengxu/image/bmqx@2x.png';
                    that.data.applyStatusText = '报名取消';
                    if (applyInfo.reason) {
                        that.data.statusDesc = '主办方审核不通过，原因：' + applyInfo.reason;
                    } else {
                        that.data.statusDesc = '主办方审核不通过';
                    }
                }
                if (actInfo.howToPay != 1 && applyInfo.refundStatus == 3) {//已退款要显示便签
                    that.data.refundStatus = '已退款'
                }
                let hasHost = false;
                if (clubInfo && clubInfo.clubTitle && clubInfo.clubID > 0) {
                    hasHost = true;
                }
                that.setData({
                    clubInfo: clubInfo,
                    actInfo: actInfo,
                    applyInfo: applyInfo,
                    costAct: actInfo.howToPay != 1,
                    cancelApplyAble: cancelApplyAble,
                    detailType: detailType,
                    applyExpiredTime: orderInfo.applyExpiredTime,
                    applyStatusIco: that.data.applyStatusIco,
                    applyStatusText: that.data.applyStatusText,
                    statusDesc: that.data.statusDesc,
                    actTitle: actInfo.actTitle,
                    hasHost: hasHost,
                    host: "主办方：" + clubInfo.clubTitle,
                    actTime: "活动时间：" + actInfo.activityTime,
                    nickAndPhone: applyInfo.userName + "-" + applyInfo.mobile,
                    ticketName: actInfo.howToPay != 1 ? applyInfo.ticketName : "免费体验票",
                    ticketCost: actInfo.howToPay != 1 ? "¥" + applyInfo.ticketCost / 100 : "免费",
                    applyInfos: applyInfos,
                    hasPayInfo: actInfo.howToPay != 1 && applyInfo.payStatus == 2,//付费活动已付款，有支付信息
                    payCost: orderInfo.orderMoney / 100,
                    reduceCost: orderInfo.offersMoney / 100,
                    needPayCost: orderInfo.payMoney / 100,
                    orderNum: orderInfo.payNo,
                    payTime: utils.formatTime7(orderInfo.payTime),
                    payWay: orderInfo.payWayName,
                    orderId: orderInfo.orderID,
                    shoukuanAccount: payee.nick + "-" + payee.userNum,
                    qrcode: applyInfo.qrcode,
                    hasHelpApply: res.data.data.hasHelpApply,
                    refundStatus: that.data.refundStatus,
                    refuseReason: that.data.refuseReason,
                    needJoinCheck: actInfo.needJoinCheck,
                    isNeedJoinClub: actInfo.isNeedJoinClub,
                    actStatus: actStatus,
                    helperApply: actInfo.helperApply,
                });
                if (orderInfo.applyExpiredTime > 0 && orderInfo.applyExpiredTime > Date.now()) {
                    countdown(that);
                }
            },
            function (res) {
                let errorMsg = utils.getErrorMsg(res);
                utils.showTip(that, '报名详情加载失败:' + errorMsg.content);
            },
            function (res) {
                console.log(res)
            }
        );
    },
    goToActDetail: function () {//报名详情不可以进入活动详情页面
        /*        app.wxService.navigateTo("activity/act_detail/act_detail", {
         clubID: this.data.clubInfo.clubID,
         activityID: this.data.actInfo.actID
         })*/
    },
    cancelApply: function (e) {//取消报名
        let that = this;

        //payStatus: 报名付费状态：0:不作考虑 1：待付款 2：已付款 3:等待退款 4:已退款 5:待付款-延后 6 付款超时 7 其他付款方式未付，8其他付款方式 已付款
        if (this.data.actInfo.isGroupApply == 1) {//组队报名
            this.showModal('暂不支持组队活动报名修改');
        } else if (this.data.howToPay == 1 || this.data.applyInfo.payStatus == 1 || this.data.applyInfo.payStatus == 5 || this.data.applyInfo.payStatus == 6) {//免费和待支付可以直接取消
            this.cancelApplyAction(this.data.howToPay != 1 && this.data.applyInfo.payStatus >= 7, this.data.actInfo.actID, applyId);
        } else if (this.data.actInfo.isSupportRefund != 1) {
            utils.showTip(this, '当前活动不支持退款');
        } else if (this.data.hasHelpApply == 1 && this.data.applyInfo.applyUserType == 0) {
            utils.showTip(this, '取消帮报名才可以取消自己报名');
        } else if (this.data.applyInfo.payStatus == 2) {
            app.wxService.navigateTo('activity/apply_cancel/apply_cancel', {
                activityId: this.data.actInfo.actID,
                applyId: applyId,
            });
        } else if (this.data.applyInfo.payStatus == 3) {//取消退款？
            utils.showTip(this, '取消退款')
        } else {
            this.cancelApplyAction(this.data.howToPay != 1 && this.data.applyInfo.payStatus >= 7, this.data.actInfo.actID, applyId);
        }
    },
    editApply: function (e) {//编辑报名
        let that = this;
        if (that.data.actInfo.isGroupApply == 1) {//组队报名
            app.wxService.showModal({
                showCancel: false, confirmText: '知道了', content: '暂不支持组队活动报名修改'
            })
        } else {
            app.wxService.navigateTo("activity/apply_page/apply_page", {
                activityId: that.data.actInfo.actID,
                applyId: applyId,
                type: 2
            })
        }
    },
    helpApply: function (e) {//帮人报名
        if (this.data.actInfo.isGroupApply == 1) {//组队报名
            app.wxService.showModal({
                showCancel: false, confirmText: '知道了', content: '暂不支持组队活动报名，请在超级俱乐部App或网页端报名活动'
            })
        } else if (this.data.detailType == 4) {//待付款，去支付
            app.wxService.navigateTo('activity/apply_p/apply_page', {
                activityId: this.data.actInfo.actID,
                type: 5,
                helperApply: this.data.actInfo.helperApply,
            });
        } else if (this.data.helperApply == 2) {//此活动不能帮人报名
            utils.showTip(this, "当前活动不允许帮人报名");
        } else if (this.data.isNeedJoinClub == 1) {//报名需要检测俱乐部
            this.joinClubTips();
        } else {
            app.wxService.navigateTo('activity/apply_p/apply_page', {
                activityId: this.data.actInfo.actID,
                type: 2,
                helperApply: this.data.actInfo.helperApply,
            });
        }
    },
    retryApply: function (e) {//重新报名
        if (this.data.actInfo.isGroupApply == 1) {//组队报名
            app.wxService.showModal({
                showCancel: false, confirmText: '知道了', content: '暂不支持组队活动报名，请在超级俱乐部App或网页端报名活动'
            })
        } else if (this.data.isNeedJoinClub == 1) {
            this.joinClubTips();
        } else {
            app.wxService.navigateTo('activity/apply_p/apply_page', {
                activityId: this.data.actInfo.actID,
                applyId: this.data.applyInfo.applyID,
                type: 4,
                helperApply: this.data.actInfo.helperApply,
                applyUserType: this.data.applyInfo.applyUserType,
            });
        }
    },
    hideAuthDialog() {
        this.setData({dialogInfo: {applySucceed: ''}});
    },
    /**
     * 显示报名成功弹窗
     * @param check 0、报名成功；1、待审核
     */
    showApplySuccessDialog: function (check) {
        this.setData({
            dialogInfo: {
                check: check,
                applySucceed: 'opacity:1;pointer-events:auto;'
            }
        })
    },
    hideToasts: function () {//报名成功弹窗确认按钮
        this.hideAuthDialog();
    },
    onShow: function () {
        let that = this;
        switch (recvResult) {
            case 1://对应需求文档情况1 - 报名成功, 新绑定了报名手机号.
            case 3://对应需求文档情况3 - 报名成功.
                that.showApplySuccessDialog(0);
                that.getApplyDetail();
                break;
            case 2://对应需求文档情况2 - 报名成功待审核, 新绑定了报名手机号.
            case 4://对应需求文档情况4 - 报名成功待审核.
                that.showApplySuccessDialog(1);
                that.getApplyDetail();
                break;
            case 5://修改报名资料成功
                that.getApplyDetail();
                utils.showTip(that, '修改成功');
                break;
            case 110://支付失败
                utils.showTip(that, '报名费用支付失败');
                break;
        }
        recvResult = 0;//每次收到数据消费完后要置空
    },
    cancelApplyAction: function (otherPay, activityId, applyId) {//取消报名操作
        if (applyId <= 0) {
            utils.showTip(this, "applyId为" + applyId);
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
                            applyID: applyId,
                            reason: reason,
                        },
                        method: 'POST'
                    }, function (res) {
                        if (otherPay) {
                            app.wxService.showModal({
                                showCancel: false,
                                content: '您已取消报名，您报名时选择的是其他支付方式，如已私下向主办方支付报名费用，请与主办方协商退款'
                            })
                        } else {
                            utils.showTip(that, '取消报名成功');
                        }
                        app.event.emit(app.config.EVENT_APPLY_CHANGE, {actId: activityId, count: -1});
                    }, function (res) {
                        let errorMsg = utils.getErrorMsg(res);
                        utils.showTip(that, '取消报名失败:' + errorMsg.content);
                    }, function (res) {
                        console.log(res);
                        that.getApplyDetail();
                    });
                }
            }
        })
    },
    /**
     * 是否加入俱乐部提醒（有些活动必须加入俱乐部才能报名）
     */
    joinClubTips: function () {
        let that = this;
        app.wxService.showModal({
            title: '温馨提示：',
            content: '该活动仅面向' + that.data.clubInfo.clubTitle + '俱乐部成员开放。确定加入俱乐部？',
        }, function (res) {//加入俱乐部操作
            if (res.confirm) {
                that.joinClub();
            }
        })
    },
    joinClub: function () {
        if (this.data.needJoinCheck === 1) {//加入俱乐部是否需要验证
            this.setData({
                joinShowStyle: "opacity:1;pointer-events:auto;",
                join: '请输入验证信息',
                needjoinText: app.session.getUserInfo().nick + "申请加入",//加入俱乐部默认文字
            });
        } else {
            this.joinClubApi(null);
        }
    },
    /**
     * 调用 加入俱乐部接口
     * @param needjoinText 验证消息
     */
    joinClubApi: function (needjoinText) {
        let param = {data: {}}, that = this;
        param.data.club_id = that.data.clubInfo.clubID;
        if (needjoinText) {
            param.data.info = needjoinText;
        }
        param.data.formId = that.data.formId;
        clubApi.clubJoined(param, res => {
        }, res => {
        }, res => {
            console.log(res);
            that.hideClubCheck();
            if (res.data.status == 1) {
                if (!needjoinText) {
                    that.setData({
                        'clubHome.roleType': 1
                    });
                    utils.showTip(this, '加入成功');
                    app.event.emit(app.config.EVENT_CLUB_CHANGE, null);
                } else {
                    utils.showTip(this, '申请已提交，请耐心等候审核');
                }
                that.getApplyDetail();
            } else {
                utils.showTip(this, res.data.msg);
            }
        })
    },
    //=============加入俱乐部验证弹窗===============
    hideClubCheck: function () {
        this.setData({
            joinShowStyle: "",
        });
    },
    /**
     * 获取验证消息文本
     */
    titleInputJoin: function (e) {
        this.setData({
            needjoinText: e.detail.value
        })
    },

    /**
     * 验证消息 提示框 确定按钮
     */
    touchAddNewJoin: function () {
        if (this.data.needjoinText && this.data.needjoinText.length > 0) {
            this.joinClubApi(this.data.needjoinText);
        } else {
            utils.showTip(this, '请输入验证信息');
        }
    },

    /**
     * 验证消息 提示框 取消按钮
     */
    touchCancelJoin: function () {
        this.setData({
            joinShowStyle: "",
        });
    },
});

function countdown(that) {
    var remainTime = that.data.applyExpiredTime - new Date().getTime();
    var remainTimeStr = '';
    if (remainTime > 0) {
        remainTimeStr = dateformat(remainTime);
    }
    that.setData({
        statusDesc: '名额保留：',
        unPayCountDown: remainTimeStr
    });
    if (remainTimeStr == '') {
        that.setData({
            statusDesc: '',
            unPayCountDown: '',
        });
        return;
    }
    var time = setTimeout(function () {
        countdown(that);
    }, 1000)
}

// 时间格式化输出
function dateformat(micro_second) {
    var remain_time = micro_second - new Date().getTime();
    // 秒数
    var second = Math.floor(micro_second / 1000);
    // 分钟位
    var min = Math.floor(second / 60);
    // 秒位
    var sec = second % 60;
    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }
    return min + ":" + sec;
}