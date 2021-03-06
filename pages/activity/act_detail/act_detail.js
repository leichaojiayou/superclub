/**
 * 用到的请求
 * 活动详情：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityAdminGetActivity
 * 报名列表：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityAdminApplyList
 * 评论列表：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityCommentList
 */

//活动详情页面
const app = getApp();
const utils = app.util;
const actApi = app.api("actApi");
const clubApi = app.api("clubApi");
const session = app.session;

let activityId;//
let clubId;
const loadCount = 10;//一次加载的数目
let commentText, commentId;//评论输入框内容、被评论者的ID
let applyStart = 0, commentStart = 0;//报名列表、评论列表请求start，报名、评论列表是否还能加载更多

/**
 * //报名成功、支付成功等页面返回的值
 * -1: 需要验证手机, 需要弹出验证码输入框.
 -2: 手机验证码验证失败.
 -3: 临时用户输入的手机号已关联了老用户.
 1: 对应需求文档情况1 - 报名成功, 新绑定了报名手机号.
 2: 对应需求文档情况2 - 报名成功待审核, 新绑定了报名手机号.
 3: 对应需求文档情况3 - 报名成功.
 4: 对应需求文档情况4 - 报名成功待审核.
 */
let recvResult = 0;
let refresh = 0;//是否每次onshow都强制刷新
Page({
    data: {
        activityEntity: {},//活动详情实体
        cover: '',//活动封面
        actTitle: '',//活动标题
        publishMan: '',//发布者昵称
        createTime: '',//发布时间
        deadlineTime: '',//报名截止时间
        readNum: '',//阅读量
        shareCount: 0,//分享数量
        shareNum: '',//分享量
        actAddress: '',//活动地点描述
        hideActAddress: false,//没有设置地点时隐藏
        actTime: '',//活动时间（2014.1.1-2014.2.2）
        actCost: '',//活动费用（¥150～¥300）
        hideActCost: false,//免费活动隐藏票价选项
        costAct: false,//是否付费活动
        lineDownCost: false,//线下付费活动（不需要在线支付的）
        host: '',//举办方（广州市花都区户外运动俱乐部）
        hideHost: '',//是否显示举办方
        haveApplyNum: 0,//已确认报名人数
        apllyNum: 0,//总可用名额（-1时名额不限）
        surplusCount: "",//剩余名额 123
        contents: [],//活动内容
        hideApplyLoadMore: false,//是否隐藏加载更多报名列表按钮
        applyed: [],//报名列表
        hideCommentLoadMore: false,//是否隐藏加载更多评论列表按钮
        comments: [],//评论列表
        applyStatus: -100,//报名状态, -1.未报名 0.未审核 1.通过 2.取消 3.拒绝 4.不通过,7作废
        payStatus: -100,//支付状态, -1:未报名 0:不作考虑 1：待付款 2：已付款 3:等待退款 4:已退款 5:待付款-延后 6 付款超时 7 其他付款方式未付，8其他付款方式 已付款
        tickets: [],//票价列表
        minCost: 0,//最低票价
        maxCost: 0,//最高票价
        status: 0,//tab切换按钮
        showCommentDialog: false,//评论输入框显示
        guide: '',//活动须知
        costDesc: '',//费用说明
        dialogInfo: {},//报名成功弹窗
        hasHelpApply: 0,//是否有帮人报名, 0为无, 1为有.
        applyId: 0,
        commentInputHolder: "请输入评论内容",//评论输入框提示
        isGroupApply: 0,//是否组队报名活动, 0为否, 1为是.
        isProxyActivity: 0,// 是否代理活动, 0为否, 1为是.
        costText: '',//活动详情左下角的费用信息（¥0.01 或者待付款¥0.01）
        isNeedJoinClub: 1,// 是否需要加入俱乐部才能报名该活动, 0为不需要, 1为需要.
        needJoinCheck: 0,// 是否需要验证加入（0：不需要 1：需要）
        needjoinText: '',//加入俱乐部需要填写的验证消息
        joinShowStyle: '',//加入俱乐部验证弹窗style
        formId: 0,//
        applyCount: 0,
        commentCount: 0,
        isApply: -100,//报名按钮：-1未报名； 0审核中；1已经报名；2取消；3拒绝；4未通过；7退款中 8退款失败
        unpayId: 0,// 待付款ID.
        helperApply: 0,//是否允许帮报名, 1为允许, 2为不允许.
        backOrTo: 0,//1、点击进入俱乐部时，直接navigateBack
        recent: 1, //是否添加到最近访问的俱乐部去

        isActClubUser: 1,//是否活动俱乐部成员
        clubActCount: 0,//俱乐部总活动数
        clubOtherActs: [],//该俱乐部的其他活动
        actClubImg: '',//俱樂部頭像
        /**
         * 报名按钮状态：
         * 1、未报名，显示立即报名按钮
         * 2、已报名已付款，显示修改报名按钮
         * 3、未付款，显示立即付款
         * 4、报名日期已截至，显示报名已关闭
         * 5、暂无名额
         * 6、已报名已付款待审核，显示修改报名按钮、待审核状态
         * 7、退款中，显示撤销退款
         */
        applyButtonStatus: 0,
        rightButtonText: '',//底部右侧按钮文字
        leftButtonText: '',//底部左侧按钮文字
        hideRightButton: false,//
        hideLeftButton: true,//
        leftBottomTextType: 0,//左下角 费用（or报名状态）显示，0、￥9.01起；1、免费（已报名）
        moneyText: '',//左下角文字描述
        isSupportRefund: 1,// 是否支持退款 1：支持 0：不支持
        actUserId: 0,//活动发起者的用户ID
    },
    changePage: function (e) {//切换tab操作
        let id = e.target.id;
        this.setData({
            status: id
        });
    },
    showCostTab: function (e) {
        if (this.data.hideActCost) {
            this.setData({
                status: 2
            })
        }
    },
    showApplyDiaolg: function () {
        let that = this;
        let itemList = ['取消报名', '修改报名资料'];
        wx.showActionSheet({
            itemList: itemList,
            success: function (res) {
                let tap = itemList[res.tapIndex];
                if (tap == '取消报名') {
                    if (that.data.hasHelpApply == 1) {//取消多人报名，进入报名列表页面
                        app.wxService.navigateTo("activity/apply_p/apply_page", {
                            activityId: activityId,
                            type: 3,
                            isSupportRefund: that.data.isSupportRefund,
                        })
                    } else if (that.data.costAct && that.data.payStatus < 7 && that.data.payStatus != 1 && that.data.payStatus != 6) {
                        if (that.data.isSupportRefund != 1) {//不支持退款
                            utils.showTip(that, '当前活动不支持退款');
                            return;
                        }
                        //进入退款页面
                        app.wxService.navigateTo('activity/apply_cancel/apply_cancel', {
                            activityId: activityId,
                            applyId: that.data.applyId,
                        });
                    } else {//非在线付费报名，直接弹窗取消报名
                        that.cancelApply(that.data.applyId);
                    }
                } else if (tap == '修改报名资料') {
                    app.wxService.navigateTo("activity/apply_p/apply_page", {
                        activityId: activityId,
                        type: 3,
                        isSupportRefund: that.data.isSupportRefund,
                    });
                    /*                    if (that.data.hasHelpApply == 1) {
                     app.wxService.navigateTo("activity/apply_p/apply_page", {
                     activityId: activityId,
                     type: 3,
                     });
                     } else {
                     app.wxService.navigateTo("activity/apply_page/apply_page", {
                     activityId: activityId,
                     applyId: that.data.applyId,
                     type: 2,
                     });
                     }*/
                }
            }
        })
    },
    cancelApply: function (applyId) {//取消报名
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
                        if (that.data.costAct && that.data.payStatus >= 7) {
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
                        that.loadApplyList(0);
                        that.loadActDetail();
                    });
                }
            }
        })
    },
    leftButton: function (e) {//底部左侧按钮
        if (this.unLoginTips()) {
            return;
        }
        this.data.formId = e.detail.formId;
        let that = this;
        session.saveApplyInfo({current: 0, infos: []});//先清空帮报名暂存数据
        // isApply 报名按钮：-1未报名； 0审核中；1已经报名；2取消；3拒绝；4未通过；7退款中 8退款失败
        switch (that.data.applyButtonStatus) {
            case 1://立即报名
                if (that.data.isGroupApply == 1) {//不允许组队报名
                    app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: '暂不支持组队活动报名，请在超级俱乐部App或网页端报名活动'
                    })
                } else if (that.data.isApply == 3) {
                    app.wxService.showModal({
                        showCancel: false,
                        content: '你的报名被发起者拒绝'
                    })
                } else {
                    if (that.data.isNeedJoinClub == 1) {//需要加入俱乐部才能报名
                        that.joinClubTips();
                    } else {
                        app.wxService.navigateTo('activity/apply_p/apply_page', {
                            activityId: activityId,
                            type: 1,
                            helperApply: that.data.helperApply,
                        });
                    }
                }
                break;
            case 2://修改报名
            case 3://立即付款
            case 5://暂无名额（还是可以修改报名啊）
                if (that.data.isGroupApply == 1) {//不允许组队报名修改
                    app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: '暂不支持修改组队活动报名信息，请在超级俱乐部App或网页端修改报名'
                    })
                } else if (that.data.isApply == 7) {//退款中不允许修改报名
                    app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: '退款中不允许修改报名'
                    })
                } else {
                    that.showApplyDiaolg();
                }
                break;
            case 4://报名已关闭
                utils.showTip(this, "报名已关闭");
                break;
            case 7:
                app.wxService.showModal({//获取unPayId失败弹窗
                    content: '确定撤销退款申请？',
                    confirmText: "确定"
                }, function (res) {
                    if (res.confirm) {
                        that.revoke();
                    }
                });
                break;
        }
    },
    rightButton: function (e) {//底部右侧按钮
        if (this.unLoginTips()) {
            return;
        }
        this.data.formId = e.detail.formId;
        let that = this;
        session.saveApplyInfo({current: 0, infos: []});//先清空帮报名暂存数据
        // isApply 报名按钮：-1未报名； 0审核中；1已经报名；2取消；3拒绝；4未通过；7退款中 8退款失败
        switch (that.data.applyButtonStatus) {
            case 1://立即报名
                if (that.data.isGroupApply == 1) {//不允许组队报名
                    app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: '暂不支持组队活动报名，请在超级俱乐部App或网页端报名活动'
                    })
                } else if (that.data.isApply == 3) {
                    app.wxService.showModal({
                        showCancel: false,
                        content: '你的报名被发起者拒绝'
                    })
                } else {
                    if (that.data.isNeedJoinClub == 1) {//需要加入俱乐部才能报名
                        that.joinClubTips();
                    } else {
                        app.wxService.navigateTo('activity/apply_p/apply_page', {
                            activityId: activityId,
                            type: 1,
                            helperApply: that.data.helperApply,
                        });
                    }
                }
                break;
            case 2://帮人报名
                if (that.data.isGroupApply == 1) {//不允许组队报名
                    app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: '暂不支持组队活动报名，请在超级俱乐部App或网页端报名活动'
                    })
                } else if (that.data.helperApply == 1) {
                    app.wxService.navigateTo('activity/apply_p/apply_page', {
                        activityId: activityId,
                        type: 2,
                        helperApply: that.data.helperApply,
                    });
                } else {
                    utils.showTip(that, "当前活动不允许帮人报名");
                }
                break;
            case 3://立即付款
                if (that.data.isGroupApply == 1) {//不允许组队报名
                    app.wxService.showModal({
                        showCancel: false,
                        confirmText: '知道了',
                        content: '暂不支持组队活动付款，请在超级俱乐部App或网页端进行操作'
                    })
                } else {
                    app.wxService.navigateTo('activity/apply_p/apply_page', {
                        activityId: activityId,
                        type: 5,
                        helperApply: that.data.helperApply,
                    });
                }
                break;
            case 4://报名已关闭
                utils.showTip(this, "报名已关闭");
                break;
            case 5://暂无名额
                utils.showTip(this, "暂无名额");
                break;
        }
    },
    viewActAddress: function () {//查看活动地图位置
        let latitude = this.data.activityEntity.latInt / 1000000;
        let longitude = this.data.activityEntity.lngInt / 1000000;
        wx.openLocation({latitude: latitude, longitude: longitude})
    },

    loadApplyList: function (start) {//加载报名列表列表请求
        applyStart = start;
        let that = this;
        actApi.getActApplyList({
            data: {
                activity_id: activityId,
                start: start,
                count: loadCount,
            }
        }, function (res) {
            let applyList = res.data.applyList.list;
            let applyCount = res.data.applyList.count;
            let more = false;
            applyStart = res.data.start;
            if (applyList && applyList.length > 0) {
                applyList.forEach(function (element) {
                    element.applyTime = utils.formatTime8(element.applyTime);
                });
                if (applyList.length == loadCount) {
                    more = true;
                } else {
                    more = false;
                }
            } else {
                more = false;
            }
            if (start != 0) {//重新加载
                applyList = that.data.applyed.concat(applyList);
            }
            that.setData({
                applyed: applyList,
                hideApplyLoadMore: !more,
                applyCount: applyCount,
            });
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            utils.showTip(that, '报名列表加载失败' + errorMsg.content);
        }, function (res) {
        });
    },
    loadComment: function (start) {//加载评论列表
        commentStart = start;
        let that = this;
        actApi.getActComment({
            data: {
                activity_id: activityId,
                start: start,
                count: loadCount,
            }
        }, function (res) {
            let commentList = res.data.commentList;
            let commentCount = res.data.commentCount;
            commentStart = res.data.start;
            let more = false;
            if (commentList && commentList.length > 0) {//有数据
                commentList.forEach(function (element) {
                    element.postTime = utils.formatTime8(element.postTime);
                });
                if (commentList.length == loadCount) {
                    more = true;
                } else {
                    more = false;
                }
            } else {//没有数据，代表没有更多
                more = false;
            }
            if (start != 0) {
                commentList = that.data.comments.concat(commentList);
            }
            that.setData({
                comments: commentList,
                hideCommentLoadMore: !more,
                commentCount: commentCount,
                actUserId: res.data.actUserId,
            });
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            utils.showTip(that, '评论加载失败:' + errorMsg.content);
        }, function (res) {
        });
    },
    loadActDetail: function () {//加载详情请求
        let that = this;
        actApi.getActDetail({//活动详情请求
                data: {
                    activity_id: activityId,
                    club_id: clubId
                },
            },
            function (res) {//成功回调
                let data = res.data.activityEntity;
                app.session.addAccessClub(data.clubId, that.data.recent == 1);
                let rightButtonText = '', leftButtonText = '';
                let hideRightButton = false, hideLeftButton = false;
                let costAct = data.howToPay != 1;
                let applyButtonStatus = 0;
                let lineDownCost = false;
                let hideActCost = data.howToPay != 1;
                let isApply = data.isApply;
                let isActClubUser = data.isActClubUser;//是否活动俱乐部成员
                let clubActCount = res.data.clubActCount;//俱乐部总活动数
                let clubOtherActs = res.data.clubOtherActs;
                that.data.moneyText = '';

                //计算活动费用，最大最小值等、、、、
                let minCost = 99999999999, maxCost = 0;//最小最大费用
                if (data.tickets) {
                    data.tickets.forEach(function (element) {
                        if (minCost > element.cost) {
                            minCost = element.cost;
                        }
                        if (maxCost < element.cost) {
                            maxCost = element.cost;
                        }
                        if (element.memberCount === -1) {
                            element.surplusCount = "名额不限"
                        } else if (element.memberCount === element.applyCount) {
                            element.surplusCount = "暂无名额"
                        } else {
                            element.surplusCount = "剩余名额 " + (element.memberCount - element.applyCount);
                        }
                    });
                }
                let actCost = '¥';//活动金额
                if (maxCost > minCost) {
                    actCost = '¥' + minCost / 100 + "～" + '¥' + maxCost / 100;
                } else {
                    actCost = '¥' + minCost / 100;
                }
                if (maxCost == 0) {
                    actCost = "免费";
                }
                if (maxCost > 0 && !costAct) {
                    lineDownCost = true;
                    hideActCost = true;
                }
                //左下角费用显示
                that.data.costText = utils.realformatMoney(minCost);
                if (data.tickets && data.tickets.length > 0) {
                    that.data.leftBottomTextType = 0;
                    if (data.tickets.length > 1) that.data.moneyText = '起';
                    if (lineDownCost) that.data.moneyText = that.data.moneyText + '·线下支付';
                } else {
                    that.data.leftBottomTextType = 1;
                    that.data.moneyText = '免费';
                }
                if (data.actStatus == 1) {//报名已关闭
                    rightButtonText = "报名已关闭";
                    hideLeftButton = true;
                    applyButtonStatus = 4;
                } else
                //报名按钮：-1未报名； 0审核中；1已经报名；2取消；3拒绝；4未通过；7退款中 8退款失败
                if (isApply == 1 || isApply == 0) {//已报名、待审核，都要检查unpayID是否为空,不为空则是待付款状态
                    if (costAct && data.unpayId != 0) {//待付款
                        rightButtonText = "立即付款";
                        leftButtonText = '修改报名';
                        applyButtonStatus = 3;
                        that.data.costText = utils.realformatMoney(data.applyCost);//显示待支付金额
                    } else {//已报名，显示修改报名
                        hideRightButton = data.helperApply == 2;
                        rightButtonText = "帮人报名";
                        leftButtonText = '修改报名';
                        applyButtonStatus = 2;
                        that.data.leftBottomTextType = 1;
                        if (isApply == 0) {// 审核中 0
                            that.data.moneyText = '审核中';
                        } else {
                            that.data.moneyText = '已报名';
                        }
                    }
                } else if (isApply == -1 || isApply == 2 || isApply == 3 || isApply == 4) {//未报名、已取消、拒绝、审核未通过，都显示我要报名
                    rightButtonText = "我要报名";
                    applyButtonStatus = 1;
                    hideLeftButton = true;
                } else if (isApply == 7 || isApply == 8) {//退款中，修改报名按钮要置灰
                    leftButtonText = "撤销退款";
                    applyButtonStatus = 7;
                    hideRightButton = true;
                    that.data.leftBottomTextType = 1;
                    that.data.moneyText = '退款中';
                }
                let surplusCount = '';//报名名额相关显示
                if (data.apllyNum === -1) {
                    surplusCount = "报名名额不限"
                } else if (data.haveApplyNum == data.apllyNum) {
                    if (applyButtonStatus != 3) {//有修改报名和立即付款就不要显示暂无名额了
                        rightButtonText = "暂无名额";
                        hideLeftButton = true;
                    } else {
                        leftButtonText = "修改报名";
                        rightButtonText = "立即付款";
                    }
                    applyButtonStatus = 5;
                    surplusCount = "暂无名额";
                } else {
                    surplusCount = "剩余名额 " + (data.apllyNum - data.haveApplyNum);
                }
                let guide;//报名须知
                if (data.guide && data.guide.length > 0) {
                    guide = data.guide;
                } else {
                    guide = "无"
                }
                clubId = data.clubId;
                that.setData({
                    activityEntity: data,
                    cover: data.cover,
                    actTitle: data.title,
                    publishMan: data.actUserNick,
                    createTime: utils.formatTime3(data.createTime) + '发布',
                    deadlineTime: "报名截止时间 " + utils.formatTime4(data.deadlineTime),
                    readNum: '阅读' + data.readNum,
                    shareCount: data.shareNum,
                    shareNum: '分享' + data.shareNum,
                    actAddress: data.actAddress,
                    hideActAddress: data.lngInt != 0 && data.latInt != 0,//经纬度都为0则是没有设置地址
                    actTime: utils.formatTime2(data.beginTime) + ' 至 ' + utils.formatTime2(data.endTime),
                    actCost: actCost,
                    hideActCost: hideActCost,//免费活动不显示 费用内容
                    publishClub: data.actClubName,
                    host: data.actClubName,
                    hideHost: (data.actClubName && data.actClubName.lenght > 0),
                    contents: data.contents,
                    haveApplyNum: data.haveApplyNum,
                    apllyNum: data.apllyNum,
                    surplusCount: surplusCount,
                    costAct: costAct,
                    lineDownCost: lineDownCost,
                    applyStatus: data.applyStatus,
                    payStatus: data.payStatus,
                    tickets: data.tickets,
                    minCost: minCost,
                    maxCost: maxCost,
                    guide: guide,
                    costDesc: data.costDesc,
                    applyButtonStatus: applyButtonStatus,
                    hasHelpApply: data.hasHelpApply,
                    applyId: data.applyId,
                    isGroupApply: data.isGroupApply,
                    isProxyActivity: data.isProxyActivity,
                    costText: that.data.costText,
                    leftBottomTextType: that.data.leftBottomTextType,
                    moneyText: that.data.moneyText,
                    isNeedJoinClub: data.isNeedJoinClub,
                    needJoinCheck: data.needJoinCheck,
                    isApply: isApply,
                    unpayId: data.unpayId,
                    helperApply: data.helperApply,
                    isActClubUser: isActClubUser,
                    clubActCount: clubActCount,
                    clubOtherActs: clubOtherActs,
                    actClubImg: data.actClubImg,
                    rightButtonText: rightButtonText,
                    leftButtonText: leftButtonText,
                    hideRightButton: hideRightButton,
                    hideLeftButton: hideLeftButton,
                    isSupportRefund: data.isSupportRefund,
                });
                that.loadApplyList(0);
                that.loadComment(0);
            },
            function (res) {//失败回调
                let errorMsg = utils.getErrorMsg(res);
                utils.showTip(that, '活动详情加载失败:' + errorMsg.content);
            });
    },
    /**
     *  params{activityID:1,
     *  clubID:1}
     */
    onLoad: function (params) {
        let that = this;
        activityId = params.activityID;
        clubId = params.clubID;
        refresh = params.refresh;
        that.setData({
            backOrTo: params.backOrTo,
            recent: params.recent ? params.recent : 1,
        });
        session.saveApplyInfo({current: 0, infos: []});
        if (app.session.getUserKey() == null) {
            app.relogin(function (res) {//登录成功
                that.loadActDetail();
            }, function (res) {
                that.loadActDetail();
            });
        } else {
            this.loadActDetail();
        }
    },
    onShareAppMessage: function () {
        let that = this;
        actApi.shareActStat({//发送分享统计
                data: {
                    type: 13,
                    value: activityId,
                }
            }
            , function (res) {
                console.log("分享统计成功，分享数+1");
                let sc = that.data.shareCount + 1;
                that.setData({
                    shareCount: sc,
                    shareNum: "分享" + sc,
                })
            }, function (res) {
                console.log("分享统计失败")
            });
        let url = '/pages/activity/act_detail/act_detail?activityID=' + activityId + "&refresh=109";//从分享页面进入，每次onShow都刷新一下
        return {
            title: this.data.actTitle,
            path: url,
        }
    },
    showCommentDialog: function (e) {//显示我要评论弹窗
        if (this.unLoginTips()) {
            return;
        }
        this.setData({
            showCommentDialog: true,
            commentInputHolder: typeof e == 'string' ? e : "请输入评论内容",
        })
    },
    hideCommentDialog: function () {//隐藏我要评论弹窗
        this.setData({
            showCommentDialog: false,
        });
        commentId = 0;//每次评论操作后 重置被评论人ID
    },
    commentText: function (e) {//评论内容赋值
        commentText = e.detail.value
    },
    commentAction: function () {//评论操作
        let that = this;
        if (!commentText || commentText.length == 0) {
            utils.showTip(that, '请输入评论内容');
        } else {
            actApi.createActComment({
                data: {
                    activity_id: activityId,
                    content: commentText,
                    refCommentId: commentId,
                }
            }, function (res) {//评论成功
                utils.showTip(that, '评论成功');
            }, function (res) {
                let errorMsg = utils.getErrorMsg(res);
                utils.showTip(that, '评论失败:' + errorMsg.content);
            }, function (res) {
                that.hideCommentDialog();
                that.loadComment(0);
            })
        }
    },
    hideAuthDialog()
    {
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
    recvData: function (result) {//报名成功、支付成功以后条用此方法传递参数
        console.log("-------act_detail收到数据-------", result);
        recvResult = result;
    },
    onShow: function () {
        let that = this;
        switch (recvResult) {
            case 1://对应需求文档情况1 - 报名成功, 新绑定了报名手机号.
            case 3://对应需求文档情况3 - 报名成功.
                that.showApplySuccessDialog(0);
                this.loadActDetail();
                break;
            case 2://对应需求文档情况2 - 报名成功待审核, 新绑定了报名手机号.
            case 4://对应需求文档情况4 - 报名成功待审核.
                that.showApplySuccessDialog(1);
                this.loadActDetail();
                break;
            case 101://支付成功
                utils.showTip(that, '报名费用支付成功');
                this.loadActDetail();
                break;
            case 5://修改报名资料成功
                utils.showTip(that, '修改成功');
                this.loadActDetail();
                break;
            case 6:
                this.loadActDetail();
                break;
            case 110://支付失败
                app.wxService.showModal({showCancel: false, content: '您尚未支付报名费用，报名未成功'});
                this.loadActDetail();
                break;
            default://默认也要刷新
                if (refresh == 110) {
                    this.loadActDetail();
                }
                break;
        }
        recvResult = 0;//每次收到数据消费完后要置空
        if (refresh == 109) {
            refresh = 110;
        }
    },
    commentTap: function (e) {//点击评论itam
        if (this.unLoginTips()) {
            return;
        }
        let that = this;
        let item = e.currentTarget.dataset.item;
        let commentActions;
        if (item.actUserId == app.session.getUserInfo().userID) {//自己的评论，可以删除
            commentActions = ["删除"]
        } else {//别人的评论，
            if (that.data.actUserId == app.session.getUserInfo().userID) {
                commentActions = ["删除", "回复"]
            } else {
                commentActions = ["回复"]
            }
        }
        wx.showActionSheet({
            itemList: commentActions,
            success: function (res) {
                let button = commentActions[res.tapIndex];
                if (button == "回复") {
                    commentId = item.actUserId;
                    that.showCommentDialog("回复" + item.userNick + "：");
                } else if (button == "删除") {
                    actApi.deleteActComment({//删除评论请求
                        data: {
                            comment_id: item.id,
                        }
                    }, function (res) {
                        utils.showTip(that, '删除成功');
                    }, function (res) {
                        let errorMsg = utils.getErrorMsg(res);
                        utils.showTip(that, '删除评论错误:' + errorMsg.content);
                    }, function (res) {
                        that.loadComment(0);
                    })
                }
            }
        });
    },
    loadMoreComment: function () {//加载更多评论
        if (this.unLoginTips()) {
            return;
        }
        this.loadComment(commentStart);
    },
    loadMoreApply: function () {//加载更多报名列表
        if (this.unLoginTips()) {
            return;
        }
        this.loadApplyList(applyStart);
    },
    /**
     * 没有登录弹窗提示
     * @returns {boolean} true为未登录
     */
    unLoginTips: function () {
        if (app.session.getUserKey() == null) {
            app.wxService.showModal({
                title: '提示',
                content: '数据加载失败，请稍后重试；' + app.config.MSG_AUTH_FAIL,
                showCancel: false,
            });
            return true;
        } else {
            return false;
        }
    },
    /**
     * 是否加入俱乐部提醒（有些活动必须加入俱乐部才能报名）
     */
    joinClubTips: function () {
        let that = this;
        app.wxService.showModal({
            title: '温馨提示：',
            content: '该活动仅面向' + that.data.publishClub + '俱乐部成员开放。确定加入俱乐部？',
        }, function (res) {//加入俱乐部操作
            if (res.confirm) {
                that.joinClub();
            }
        })
    },
    joinClub: function () {
        if (this.data.isActClubUser == 1) {
            utils.showTip(this, '你已经是该俱乐部成员了');
            return;
        }
        if (this.unLoginTips()) {
            return;
        }
        if (this.data.needJoinCheck === 1) {//加入俱乐部是否需要验证
            this.setData({
                joinShowStyle: "opacity:1;pointer-events:auto;",
                join: '请输入验证信息',
                needjoinText: app.session.getUserInfo().nick + "申请加入",
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
        param.data.club_id = clubId;
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
                that.loadActDetail();
            } else if (res.data.status == 5001) {
                utils.showTip(this, '你已经是该俱乐部成员');
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
    goToHost: function () {//进入主办方
        if (this.unLoginTips()) {
            return;
        }
        if (this.data.backOrTo == 1) {
            app.wxService.navigateBack();
        } else {
            app.wxService.navigateTo('club/clubhome/clubhome?clubId=' + clubId)
        }
    },
    actDetail: function (e) {
        activityId = e.currentTarget.dataset.actid;
        app.wxService.redirectTo('activity/act_detail/act_detail?activityID=' + activityId + "&clubID=" + clubId)
    },
    /**
     * 撤销退款申请
     */
    revoke: function () {
        let that = this;
        actApi.cancelRefund({
            data: {
                applyId: that.data.applyId,
            },
            api_version: 16,
        }, function (res) {
            app.util.showTip(that, '操作成功！');
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            app.util.showTip(that, '撤销失败:' + errorMsg.content);
        }, function (res) {
            that.loadActDetail();
        });
    }
});