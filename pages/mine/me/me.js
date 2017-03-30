// pages/mine/me/me.js
const app = getApp();
const mineApi = app.api("mineApi");
const actApi = app.api("actApi");
const clubApi = app.api("clubApi");
const utils = app.util;
const session = app.session;
var needCountdown = false;
let recvResult = 0;
let currentActItem;
Page({
    data: {
        userStatus: 0,// 0 临时用户
        dataList: [],
        start: '0',
        more: 0,
        applyActCount: -1,
        loading: false,

        userName: '',
        userAvater: '',
        userNum: '',
        bindPhone: '',
        unreadReceiptCount: 0,

        needjoinText: '',//加入俱乐部需要填写的验证消息
        joinShowStyle: '',//加入俱乐部验证弹窗style
        formId: 0,//
    },
    onShow: function () {
        app.event.remove(app.config.EVENT_APPLY_CHANGE, this);
        this.setData({
            userStatus: app.session.isTempUser() ? 0 : 1,
            userName: app.session.getUserInfo().nick,
            userAvater: app.session.getUserInfo().avatar,
            userNum: app.session.getUserInfo().num,
            bindPhone: app.session.getUserInfo().mobile,
            unreadReceiptCount: app.globalData.unreadReceiptCount
        })
        this.getMoneyNotifyCount();
        needCountdown = true;
        this.countdown();
        let that = this;
        switch (recvResult) {
            case 1://对应需求文档情况1 - 报名成功, 新绑定了报名手机号.
            case 3://对应需求文档情况3 - 报名成功.
                that.showApplySuccessDialog(0);
                that.refresh();
                break;
            case 2://对应需求文档情况2 - 报名成功待审核, 新绑定了报名手机号.
            case 4://对应需求文档情况4 - 报名成功待审核.
                that.showApplySuccessDialog(1);
                that.refresh();
                break;
            case 5://修改报名资料成功
                that.refresh();
                app.util.showTip(that, "修改成功");
                break;
            case 110://支付失败
                app.wxService.showModal({title: "提示", content: "报名费用支付失败"})
                break;
        }
        recvResult = 0;//每次收到数据消费完后要置空
    },
    onHide: function () {
        needCountdown = false;

        //报名人数发生更改
        app.event.on(app.config.EVENT_APPLY_CHANGE, this, info => {
            this.refresh();
        })
    },
    onLoad: function () {
        this.getUserApplyList();
        recvResult = 0;
    },
    onUnload: function () {
        app.event.remove(app.config.EVENT_APPLY_CHANGE, this);
    },
    //请求用户活动报名记录
    getUserApplyList: function () {
        if (this.data.loading) {
            return;
        }
        this.data.loading = true;
        var that = this;
        mineApi.userApplyList({
                data: {
                    user_id: app.session.getUserInfo().userID,
                    start: that.data.start,
                    count: 30
                },
            },
            function (res) {
                var dataArr = res.data.activities;
                var dataList = that.data.dataList;
                //合并数组，用于上拉加载更多
                var renderArr = that.data.start == '0' ? dataArr : dataList.concat(dataArr);
                that.setData({
                    dataList: renderArr,
                    start: res.data.start,
                    more: res.data.more,
                    applyActCount: res.data.applyActCount
                })
            },
            function (res) {
                if (app.util.getErrorMsg(res).content) {
                    app.util.showTip(that, app.util.getErrorMsg(res).content);
                }
            },
            function (res) {
                that.data.loading = false;
            }
        )
    },
    //获取用户钱包未读收款数
    getMoneyNotifyCount: function () {
        var that = this;
        mineApi.moneyNotifyCount({
                loading: true,
                data: {},
            },
            function (res) {
                app.globalData.unreadReceiptCount = res.data.unreadReceiptCount;
                that.setData({
                    unreadReceiptCount: res.data.unreadReceiptCount
                })
            },
            function (res) {
                console.log("fail");
            },
            function (res) {
            }
        )
    },

    // 页面上拉触底事件的处理函数，用于上拉加载更多
    loadMore: function () {
        if (this.data.more == 1) {
            this.getUserApplyList();
        }
        return false;
    },
    refresh: function () {
        this.setData({
            start: '0'
        })
        this.getUserApplyList();
    },
    //报名详情
    goToApplyDetail: function (e) {
        var id = e.currentTarget.id;
        app.wxService.navigateTo('activity/apply_detail/apply_detail', {applyId: id})
    },
    //修改报名
    changeApply: function (e) {
        let item = e.currentTarget.dataset.item;
        if (!item || item.activityID <= 0 || item.applyId <= 0) {
            app.util.showTip(this, "数据错误");
            console.log(item);
            return;
        }
        if (item.isGroupApply == 1) {//组队报名
            this.showModal('暂不支持组队活动报名修改')
        } else {
            app.wxService.navigateTo("activity/apply_page/apply_page", {
                activityId: item.activityID,
                applyId: item.applyId,
                type: 2
            })
        }
    },
    //取消报名  待审核和其他支付方式可以取消
    cancelApply: function (e) {
        let item = e.currentTarget.dataset.item;
        //payStatus: 报名付费状态：0:不作考虑 1：待付款 2：已付款 3:等待退款 4:已退款 5:待付款-延后 6 付款超时 7 其他付款方式未付，8其他付款方式 已付款
        if (item.isGroupApply == 1) {//组队报名
            this.showModal('暂不支持组队活动报名修改');
        } else if (item.howToPay == 1 || item.payStatus == 1 || item.payStatus == 5 || item.payStatus == 6) {//免费和待支付可以直接取消
            this.cancelApplyAction(item.howToPay != 1 && item.payStatus >= 7, item.activityID, item.applyId);
        } else if (item.isSupportRefund != 1) {
            utils.showTip(this, '当前活动不支持退款');
        } else if (item.hasHelpApply == 1 && item.applyUserType == 0) {
            utils.showTip(this, '取消帮报名才可以取消自己报名');
        } else if (item.payStatus == 2) {
            app.wxService.navigateTo('activity/apply_cancel/apply_cancel', {
                activityId: item.activityID,
                applyId: item.applyId,
            });
        } else if (item.payStatus == 3) {//取消退款？
            utils.showTip(this, '取消退款')
        } else {
            this.cancelApplyAction(item.howToPay != 1 && item.payStatus >= 7, item.activityID, item.applyId);
        }
    },
    //重新报名
    againApply: function (e) {
        let item = e.currentTarget.dataset.item;
        if (item.isGroupApply == 1) {//组队报名
            this.showModal('暂不支持组队活动报名，请在超级俱乐部App或网页端报名活动')
        } else if (item.isNeedJoinClub == 1) {//报名需要检测俱乐部
            currentActItem = item;
            this.joinClubTips();
        } else {
            app.wxService.navigateTo('activity/apply_p/apply_page', {
                activityId: item.activityID,
                applyId: item.applyId,
                type: 4,
                helperApply: item.helperApply,
                applyUserType: item.applyUserType,
            });
        }
    },
    //去支付按钮
    toPay: function (e) {
        let id = e.currentTarget.id;
        app.wxService.navigateTo('activity/apply_p/apply_page', {
            activityId: id,
            type: 5
        });
    },
    //申请退款
    applyRefund: function (e) {
        let item = e.currentTarget.dataset.item;
        //payStatus: 报名付费状态：0:不作考虑 1：待付款 2：已付款 3:等待退款 4:已退款 5:待付款-延后 6 付款超时 7 其他付款方式未付，8其他付款方式 已付款
        if (item.isGroupApply == 1) {//组队报名
            this.showModal('暂不支持组队活动报名修改');
        } else if (item.howToPay == 1 || item.payStatus == 1 || item.payStatus == 5 || item.payStatus == 6) {//免费和待支付可以直接取消
            this.cancelApplyAction(item.howToPay != 1 && item.payStatus >= 7, item.activityID, item.applyId);
        } else if (item.isSupportRefund != 1) {
            utils.showTip(this, '当前活动不支持退款');
        } else if (item.hasHelpApply == 1 && item.applyUserType == 0) {
            utils.showTip(this, '取消帮报名才可以取消自己报名');
        } else if (item.payStatus == 2) {
            app.wxService.navigateTo('activity/apply_cancel/apply_cancel', {
                activityId: item.activityID,
                applyId: item.applyId,
            });
        } else if (item.payStatus == 3) {//取消退款？
            utils.showTip(this, '取消退款')
        } else {
            this.cancelApplyAction(item.howToPay != 1 && item.payStatus >= 7, item.activityID, item.applyId);
        }
    },
    //不支持退款
    noSupportRefund: function (e) {
        app.util.showTip(this, "不支持退款");
        // this.showModal('不支持退款')
    },
    //提示弹窗
    showModal: function (msg) {
        app.wxService.showModal({
            content: msg,
            showCancel: false,
            confirmText: '知道了'
        })
    },
    nato_myaccount: function (e) {
        if (app.session.getUserKey() == null) {
            app.wxService.showModal({
                title: '提示',
                content: app.config.MSG_AUTH_FAIL,
                showCancel: false,
            })
            return
        }
        app.wxService.navigateTo('index/myaccount/myaccount')
    },
    nato_myWallet: function (e) {
        if (app.session.getUserKey() == null) {
            //没有授权获取微信用户信息
            app.wxService.showModal({
                title: '提示',
                content: app.config.MSG_AUTH_FAIL,
                showCancel: false,
            })
        } else if (app.session.isTempUser()) {
            //如果是临时用户，先绑定手机号码，才可以进去我的钱包
            app.wxService.navigateTo('index/bindphone/bindphone')
        } else {
            app.wxService.navigateTo('mine/my_wallet/my_wallet')
        }
    },
    countdown: function () {
        if (needCountdown) {
            // console.log("countdown");
            countdown(this);
        }
    },
    /**
     * 收到上一个页面返回的数据
     */
    recvData: function (result) {
        recvResult = result;
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
    cancelApplyAction: function (otherPay, activityId, applyId) {//取消报名操作
        if (applyId <= 0) {
            app.util.showTip(this, "applyId为" + applyId);
        }
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
                        if (otherPay) {
                            app.wxService.showModal({
                                showCancel: false,
                                content: '您已取消报名，您报名时选择的是其他支付方式，如已私下向主办方支付报名费用，请与主办方协商退款'
                            })
                        } else {
                            app.util.showTip(that, "取消报名成功");
                        }
                    }, function (res) {
                        app.util.showTip(that, "取消报名失败");
                    }, function (res) {
                        console.log(res);
                        that.refresh();
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
            content: '该活动仅面向' + currentActItem.fromClubName + '俱乐部成员开放。确定加入俱乐部？',
        }, function (res) {//加入俱乐部操作
            if (res.confirm) {
                that.joinClub();
            }
        })
    },
    joinClub: function () {
        if (currentActItem.needJoinCheck === 1) {//加入俱乐部是否需要验证
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
        param.data.club_id = currentActItem.actClubId;
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
                that.getUserApplyList();
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
    var list = that.data.dataList
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.payStatus == 1) {
            var remain_time = item.applyExpiredTime - new Date().getTime();
            if (remain_time > 0) {
                item.remainTime = dateformat(remain_time);
            } else if (remain_time > -1000) {
                that.refresh();
            }
        }
    }
    that.setData({
        dataList: list
    });
    var time = setTimeout(function () {
            that.countdown();
        }
        , 1000)
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