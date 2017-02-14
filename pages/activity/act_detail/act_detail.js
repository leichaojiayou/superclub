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

//测试数据
var activityId = 591623;
var clubId = 100315;
const loadCount = 10;//一次加载的数目
let commentText;
let applyStart = '', commentStart = '', applyMore = 0, commentMore = 0;//报名列表、评论列表请求start，报名、评论列表是否还能加载更多
/**
 * 报名状态：
 * 1、未报名，显示立即报名按钮
 * 2、已报名已付款，显示修改报名按钮
 * 3、未付款，显示立即付款
 * 4、报名日期已截至，显示报名已关闭
 */
let applyStatus;
Page({
    data: {
        activityEntity: {},//活动详情实体
        cover: '',//活动封面
        actTitle: '',//活动标题
        publishMan: '',//发布者昵称
        createTime: '',//发布时间
        deadlineTime: '',//报名截止时间
        readNum: '',//阅读量
        shareNum: '',//分享量
        actAddress: '',//活动地点描述
        hideActAddress: false,//没有设置地点时隐藏
        actTime: '',//活动时间（2014.1.1-2014.2.2）
        actCost: '',//活动费用（¥150～¥300）
        hideActCost: false,//免费活动隐藏票价选项
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
        costAct: false,
        applyStatus: -100,//报名状态, -1.未报名 0.未审核 1.通过 2.取消 3.拒绝 4.不通过,7作废
        payStatus: -100,//支付状态, -1:未报名 0:不作考虑 1：待付款 2：已付款 3:等待退款 4:已退款 5:待付款-延后 6 付款超时 7 其他付款方式未付，8其他付款方式 已付款
        applyButtonText: '',//报名按钮文字
        tickets: [],//票价列表
        minCost: 0,//最低票价
        maxCost: 0,//最高票价
        status: 0,//tab切换按钮
        showCommentDialog: false,//评论输入框显示
        guide: '',//活动须知
        costDesc: '',//费用说明
    },
    changePage: function (e) {//切换tab操作
        let id = e.target.id;
        this.setData({
            status: id
        });
    },
    showApplyDiaolg: function () {
        wx.showActionSheet({
            itemList: ['帮人报名', '取消报名', '修改报名资料'],
            success: function (res) {
                console.log(res.tapIndex)
                if (res.tapIndex == 0) {
                    app.wxService.navigateTo('../apply_page/apply_page');
                }
            }
        })
    },
    applyButton: function () {//我要报名or修改报名 按钮
        let that = this;
        switch (applyStatus) {
            /*  1、立即报名 2、修改报名 3、立即付款 4、报名已关闭*/
            case 1:
                app.wxService.navigateTo('activity/apply_page/apply_page',{activityId:activityId})
                break;
            case 2:
                that.showApplyDiaolg();
                break;
            case 3:
                wx.showToast({title: '立即付款'});
                break;
            case 4:
                wx.showToast({title: '报名已关闭'});
                break;
        }
    },
    viewActAddress: function () {//查看活动地图位置
        let latitude = this.data.activityEntity.latInt / 1000000;
        let longitude = this.data.activityEntity.lngInt / 1000000;
        console.log(latitude + "aaaaaaaa" + longitude);
        wx.openLocation({latitude: latitude, longitude: longitude})
    },

    loadApplyList: function (start) {//加载报名列表列表请求
        let that = this;
        actApi.getActApplyList({
            data: {
                activity_id: activityId,
                start: start,
                count: loadCount,
            }
        }, function (res) {
            let applyList = res.data.applyList;
            applyStart = res.data.start;
            applyMore = res.data.more;
            applyList.forEach(function (element) {
                element.applyTime = app.util.formatTime3(element.applyTime);
            });
            if (start != 0) {//加载更多
                applyList = that.data.applyed.concat(applyList)
            }
            that.setData({
                applyed: applyList,
                hideApplyLoadMore: applyMore == 1,
            });
            console.log("---------报名列表数据---------\n", that.data.applyed)
            console.info(JSON.stringify(res.data));
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            wx.showModal({title: '报名列表加载失败', content: errorMsg.title + '；' + errorMsg.content})
        }, function (res) {
            console.log(res)
        });
    },
    loadingMoreApply: function () {//点击加载更多报名人
        this.loadApplyList(applyStart);
    },
    loadComment: function (start) {//加载评论列表
        let that = this;
        actApi.getActComment({
            data: {
                activity_id: activityId,
                start: start,
                count: loadCount,
            }
        }, function (res) {
            let commentList = res.data.commentList;
            commentStart = res.data.start;
            commentMore = res.data.more;
            commentList.forEach(function (element) {
                element.postTime = app.util.formatTime3(element.postTime);
            });
            if (start != 0) {//加载更多
                commentList = that.data.comments.concat(commentList)
            }
            that.setData({
                comments: commentList,
                hideCommentLoadMore: applyMore == 1,
            });
            console.log("----------评论列表数据--------\n", that.data.comments)
            console.info(JSON.stringify(res.data));
        }, function (res) {
            let errorMsg = utils.getErrorMsg(res);
            wx.showModal({title: '报名列表加载失败', content: errorMsg.title + '；' + errorMsg.content})
        }, function (res) {
            console.log(res)
        });
    },
    loadingMoreComment: function () {//点击加载更多报名人
        this.loadComment(commentStart);
    },
    onLoad: function (params) {
        if (params.activityID) {
            activityId = params.activityID;
        }
        let that = this;
        actApi.getActDetail({//活动详情请求
                data: {
                    activity_id: activityId,
                    club_id: clubId
                },
            },
            function (res) {//成功回调
                let data = res.data.activityEntity;
                let applyButtonText = '';
                let currentTime = new Date();
                if (data.deadlineTime > currentTime.getMilliseconds()) {//报名时间未截至
                    if (!data.costAct) {//免费活动
                        if (data.applyStatus === 1) {
                            applyButtonText = "修改报名";
                            applyStatus = 2;
                        } else {
                            applyButtonText = "立即报名"
                            applyStatus = 1;
                        }
                    } else {//付费活动
                        if (data.payStatus === 1) {//待付款
                            applyButtonText = "立即付款";
                            applyStatus = 3;
                        } else if (data.applyStatus) {//
                            applyButtonText = "立即报名"
                            applyStatus = 1;
                        } else {
                            applyButtonText = "修改报名";
                            applyStatus = 2;
                        }
                    }
                } else {
                    applyButtonText = "报名已关闭";
                    applyStatus = 4;
                }
                let surplusCount = '';//剩余名额
                if (data.apllyNum === -1) {
                    surplusCount = "报名名额不限"
                } else if (data.haveApplyNum === data.apllyNum) {
                    surplusCount = "暂无名额"
                } else {
                    surplusCount = "剩余名额 " + (data.apllyNum - data.haveApplyNum);
                }
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
                            element.surplusCount = "报名名额不限"
                        } else if (element.memberCount === element.applyCount) {
                            element.surplusCount = "暂无名额"
                        } else {
                            element.surplusCount = "剩余名额 " + (element.memberCount - element.applyCount);
                        }
                    });
                }
                let actCost = '¥';//活动金额
                if (maxCost > minCost) {
                    actCost = '¥' + minCost + "～" + '¥' + maxCost;
                } else {
                    actCost = '¥' + minCost;
                }
                let guide;//报名须知
                if (data.guide && data.guide.lengh > 0) {
                    guide = data.guide;
                } else {
                    guide = "无"
                }
                that.setData({
                    activityEntity: data,
                    cover: data.cover,
                    actTitle: data.title,
                    publishMan: data.actUserNick,
                    createTime: app.util.formatTime3(data.createTime) + '发布',
                    deadlineTime: "报名截止时间 " + app.util.formatTime4(data.deadlineTime),
                    readNum: '阅读' + data.readNum,
                    shareNum: '分享' + data.shareNum,
                    actAddress: data.actAddress,
                    hideActAddress: data.lngInt != 0 && data.latInt != 0,//经纬度都为0则是没有设置地址
                    actTime: app.util.formatTime3(data.beginTime) + '-' + app.util.formatTime3(data.endTime),
                    actCost: actCost,
                    hideActCost: data.howToPay != 1,//免费活动不显示 费用内容
                    publishClub: data.clubName,
                    hideHost: data.clubId != 0,
                    contents: data.contents,
                    haveApplyNum: data.haveApplyNum,
                    apllyNum: data.apllyNum,
                    surplusCount: surplusCount,
                    costAct: data.howToPay != 1,
                    applyStatus: data.applyStatus,
                    payStatus: data.payStatus,
                    applyButtonText: applyButtonText,
                    tickets: data.tickets,
                    minCost: minCost,
                    maxCost: maxCost,
                    guide: guide,
                    costDesc: data.costDesc,
                })
                console.info(JSON.stringify(res.data));
                that.loadApplyList();
                that.loadComment(0);
            },
            function (res) {//失败回调
                let errorMsg = utils.getErrorMsg(res);
                wx.showModal({title: '活动详情加载失败', content: errorMsg.title + '；' + errorMsg.content})
            });
    },
    onShareAppMessage: function () {
        return {
            title: '活动详情',
            path: 'activity/act_detail/act_detail'
        }
    },
    showCommentDialog: function () {//显示我要评论弹窗
        this.setData({
            showCommentDialog: true
        })
    },
    hideCommentDialog: function () {//隐藏我要评论弹窗
        this.setData({
            showCommentDialog: false
        })
    },
    commentText: function (e) {//评论内容赋值
        commentText = e.detail.value
    },
    commentAction: function () {//评论操作
        let that = this;
        if (!commentText || commentText.length == 0) {
            wx.showToast({title: '请输入评论内容'})
        } else {
            actApi.createActComment({
                data: {
                    activity_id: activityId,
                    content: commentText,
                    refCommentId: 0,
                }
            }, function (res) {//评论成功
                wx.showToast({title: '评论成功'})
            }, function (res) {
                let errorMsg = utils.getErrorMsg(res);
                wx.showModal({title: '评论失败', content: errorMsg.title + '；' + errorMsg.content})
            }, function (res) {
                console.log(res)
                that.hideCommentDialog();
                that.loadComment(0);
            })
        }
    }
})