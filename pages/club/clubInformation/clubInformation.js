const App = getApp();
const clubApi = App.api('clubApi');
const userApi = App.api("userApi")
const wxService = App.wxService;
const session = App.session;

const util = require('../../../utils/util')
Page({
    data: {
        page: {
            club_logo_img: util.getClubImg() + 'club_logo.jpg',
            club_statistics_icon: util.getClubImg() + 'member@2x.png',
            img: util.getClubImg() + 'black-errow@2x.png',
        },
        isReWriteLister: true,//是否要启动监听器
        club: {
            isReLoad: false,//是否刷新
            roleType:1
        },
        time: 60, //倒计时
        isServerDoIt:0 //服务处理临时用户问题 0：服务器处理 1：不做处理
    },
    onLoad(e) {
        this.setData({
            clubId: e.clubId
        });
        this.getClubIndex();
    },

    /**
     * 获取俱乐部详情
     */
    getClubIndex() {
        const that = this;
        let param = { data: {} };
        param.data.club_id = this.data.clubId
        clubApi.clubIndex(param, res => {
            if (res.data.status == 1) {
                let club = res.data.club, score = club.score, img = that.data.page.grade;
                club.gradeImg = util.getClubImg(score);
                that.setData({
                    club: club
                })
                if (that.data.isReWriteLister) {
                    App.event.addListener('club', that);
                    that.data.isReWriteLister = false;
                }
                clubApi.memeberList(param, res => {
                    App.event.addListener('club-ioc', that);
                    if (res.data.status === 1) {
                        let members = res.data.members;
                        that.setData({
                            chrimanIoc: members[1],
                            mangerIoc: members[2],
                        })
                    }
                });
            }
        });
    },

    tips() {
        var that = this;
        if (that.data.club.roleType == 0) {
            let toastParam = {
                title: '提示',
                content: '你还不是俱乐部成员，加入俱乐部即可查看俱乐部资料',
            }
            wxService.showModal(toastParam, res => {
                if (res.confirm) {

                    if(that.data.isServerDoIt == 0) {
                        this.__joinClub();
                    } else {

                        if (!getApp().session.isTempUser()) {
                            this.__joinClub();
                        } else {
                            this.__showSMSPopup();
                        }
                    }

                }
            });
        } else {
            that.memberGather();
        }

    },


    //seting club name
    setClubName(e) {
        let data = this.data, param = {};
        param.clubID = data.club.clubID;
        param.title = data.club.title;
        wxService.navigateTo('club/modify/clubName/clubName', param);
    },

    //seting logo
    setClubLogo() {
        const that = this;
        wxService.uploadImg(res => {
            that.setData({
                clubLogo: res[0]
            })
            let param = {
                data: {}
            }
            param.data.club_id = that.data.club.clubID;
            param.data.logo = res[0]
            clubApi.modifyClub(param, res => {
                if (res.data.status == 1) {
                    that.setData({
                        'club.logo': param.data.logo
                    })

                    App.event.trigger('clubHome', {
                        logo: param.data.logo
                    })
                }
            })
        }, 1);

    },

    //seting grade
    setGrade() {
        wxService.navigateTo('../../../template/common/grade/grade', {
            score: this.data.club.score
        });
    },

    //seting address
    setAddress() {
        const data = this.data;
        wxService.navigateTo('club/modify/province/province', {
            clubID: data.club.clubID
        });
    },

    //主打项目
    setProjects(e) {
        let data = this.data, features = data.modifyFeatures || data.club.features, i = 0, items = [],ids = [];
        for (; i < features.length; i++) {
            items.push(features[i].name);
            ids.push(features[i].id);
        }
        wxService.navigateTo('club/modify/masterProjects/masterProjects', {
            features: items.join(','),
            ids:ids.join(','),
            clubID: data.club.clubID
        });
    },

    //设置加入方式
    setJoinWay() {
        const data = this.data;
        let param = {}, needJoinCheck = data.modifyNeedJoinCheck;
        param.clubID = data.club.clubID;
        param.needJoinCheck = needJoinCheck || data.club.needJoinCheck;
        wxService.navigateTo('club/modify/joinWay/joinWay', param);
    },


    //设置收款账号
    setAccountGather() {
        const data = this.data;
        let param = {};

        param.clubID = data.club.clubID;
        param.payeeType = data.club.payeeType;
        param.roleType = data.club.roleType;
        wxService.navigateTo('club/modify/accountGather/accountGather', param);
    },

    //任免副会长
    setViceChariman() {
        //0:haven't viceChariman 2:have viceChariman
        const that = this;
        wxService.navigateTo('club/modify/appointMember/appointMember', {
            type: 0,
            clubID: that.data.club.clubID
        });
    },

    //任免管理员
    setManager() {
        const that = this;
        wxService.navigateTo('club/modify/appointMember/appointMember', {
            type: 1,
            clubID: that.data.club.clubID
        });
    },

    //移除会员
    removeMember() {
        const that = this;
        wxService.navigateTo('club/modify/removeMember/removeMember', {
            clubID: that.data.club.clubID
        });
    },

    //宣言
    setDeclaration() {
        const data = this.data;
        let param = {};
        param.clubID = data.club.clubID;
        param.slogan = data.club.slogan;
        wxService.navigateTo('club/modify/declaration/declaration', param);

    },

    //设置简介
    setDescription() {
        const data = this.data
        let param = {};
        param.clubID = data.club.clubID;
        param.description = data.club.description;
        wxService.navigateTo('club/modify/description/description', param);
    },

    //memberGather
    memberGather() {
        wxService.navigateTo('club/modify/clubMember/clubMember', {
            clubID: this.data.club.clubID
        });
    },

    //退出 删除 加入俱乐部
    optionClub: function (e) {
        const role = this.data.club.roleType;
        const formId = e.detail.formId;
        if (role == 2) {//删除
            this.__deleteClub(formId);
        } else if (role != 0) {//退出
            this.__clubQuited(formId);
        } else {//加入
            this.setData({
                formId: formId
            })

            if (this.data.isServerDoIt == 0) {
                this.__joinClub();

            } else {
                if (!getApp().session.isTempUser()) {
                    this.__joinClub();
                } else {
                    this.__showSMSPopup();
                }

            }
        }
    },

    __deleteClub: function (formId) {
        const that = this;
        let toastParam = {
            title: '确定删除俱乐部？',
            content: '\t所有活动、群、俱乐部成员将同时删除，且不能恢复。',
        }
        wxService.showModal(toastParam, res => {
            if (res.confirm) {
                let param = { data: {} }
                param.data.club_id = that.data.club.clubID;
                param.data.formId = formId;
                clubApi.clubDeleted(param, res => {
                    if (res.data.status == 1) {
                        wxService.showToast('申请已提交');
                        App.wxService.navigateBack();
                    }
                });
            }
        })
    },

    __clubQuited: function (formId) {
        let toastParam = {
            content: '退出俱乐部？',
        }
        wxService.showModal(toastParam, res => {
            if (res.confirm) {
                let param = { data: {} }, club = this.data.club, that = this;
                param.data.club_id = this.data.club.clubID;
                param.data.formId = formId;
                clubApi.clubQuited(param, res => {
                    if (res.data.status == 1) {
                        that.setData({
                            'club.roleType': 0
                        })
                        App.event.trigger('clubHome', {
                            roleType: 0
                        })
                        App.event.emit(App.config.EVENT_CLUB_CHANGE, null)
                    }

                });
            }
        });
    },

    /*==========check code============*/
    /**
     * 临时用户，绑定手机号
     */
    bindPhone() {
        let that = this, phone = this.data.phone;
        userApi.sendAuthCode({
            data: {
                auth_type: 2,
                phone: phone
            }
        }, res => {
            that.data.interval = setInterval(() => {
                let leftTime = that.data.time - 1;
                if (leftTime > 0) {
                    that.setData({
                        time: leftTime
                    })
                } else {
                    clearInterval(that.data.interval)
                    that.setData({
                        status: 0,
                        time: 60
                    })
                }
            }, 1000)
            that.__showCodePopup(phone);
        }, res => {
            let errorData = App.util.getErrorMsg(res)
            let errorMsg = errorData.content
            if (errorMsg == '') {
                errorMsg = "发送验证码失败"
            }
            wxService.showToast(errorMsg)
        })
    },



    //=============================================

    /**
      *获取input phone number 
      */
    titleInput: function (e) {
        this.setData({
            phone: e.detail.value
        })
    },

    /**
     * 点击发送验证码
     */
    touchAddNewSendPhone: function () {
        //点击发送验证码
        if (this.data.phone && this.data.phone.length > 10) {
            this.bindPhone()
        } else {
            this.setData({
                param: {
                    style: "",
                    sendPhone: 1
                },
                status: 1
            })
            App.util.showTip(this, '请输入正确的电话号码');
        }
    },

    /**
     * cancel send phone
     */
    touchCancelSendPhone: function () {
        this.setData({
            param: {
                style: "",
                focus: false,
                sendPhone: 1
            },
        })
    },

    /**
     * 重新发送验证码
     */
    getAuthCode: function () {
        if (this.data.time == 60) {
            this.bindPhone();
        }
    },
    //=============================================
    //获取验证码
    authInput: function (e) {
        this.setData({
            code: e.detail.value
        })
    },
    /**
     * 验证码 取消
     */
    touchCancel: function () {
        this.setData({
            param: {
                style: ''
            }
        })
    },

    /**
     * 发验证码 确定按钮 
     * 加入俱乐部
     */
    touchAddNew: function () {
        let param = { data: {} }, that = this;
        param.data.phone = this.data.phone;
        param.data.code = this.data.code;
        if (param.data.code.length > 3) {
            userApi.bindPhone(param, res => { }, res => { }, res => {
                if (res.data.status == 1) {//加入俱乐部成功
                    App.relogin(res => {
                        that.setData({
                            param: {
                                style: ''
                            },
                            time: 60,
                        })
                        if (that.data.club.needJoinCheck == 1) {
                            that.__showCheckPopup();
                        } else {
                            that.__joinClub();
                        }
                    });
                } else {
                    that.__hideToast();
                }
            });

        } else {
            this.__hideToast();
        }
    },
    /*============================*/



    /*==========join check============*/

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
        this.__joinClubApi(this.data.needjoinText);
    },

    /**
     * 验证消息 提示框 取消按钮
     */
    touchCancelJoin: function () {
        this.setData({
            joinShowStyle: "",
        });
    },
    /*==========================*/

    /**
     * 显示验证码弹窗
     */
    __showCodePopup: function (phone) {
        this.setData({
            param: {
                style: "opacity:1;pointer-events:auto;",
                phone: phone,
                focus: true,
            },
            status: 1
        })
    },

    /**
     * 显示绑定手机
     */
    __showSMSPopup: function () {
        this.setData({
            param: {
                style: 'opacity:1;pointer-events:auto;',
                focus: true,
                sendPhone: 1
            },
        })
    },

    __hideToast: function () {
        App.util.showTip(this, '验证码不正确');
        clearInterval(this.data.interval)
        this.setData({
            param: {
                style: ''
            },
            time: 60
        })
    },

    /**
     * 显示验证消息弹窗
     */
    __showCheckPopup: function () {
        this.setData({
            joinShowStyle: "opacity:1;pointer-events:auto;",
            join: '请输入验证信息',
            needjoinText: App.session.getUserInfo().nick + "申请加入"
        });
    },

    __hideCheckPopup: function () {
        this.setData({
            joinShowStyle: "",
        });
    },



    /**
     * 判断是否有验证消息
     */
    __joinClub: function () {
        if (this.data.club.needJoinCheck === 1) {
            this.__showCheckPopup();
        } else {
            this.__joinClubApi();
        }
    },

    /**
     * 调用 加入俱乐部接口 
     * @param needjoinText 验证消息
     */
    __joinClubApi: function (needjoinText) {
        let param = { data: {} }, that = this;
        param.data.club_id = that.data.club.clubID;
        if (needjoinText) {
            param.data.info = needjoinText;
        }
        param.data.formId = that.data.formId;
        clubApi.clubJoined(param, res=>{},res=>{},res => {
            console.log(res);
            that.__hideCheckPopup();
            if (res.data.status == 1) {
                if (!needjoinText) {
                    that.setData({
                        'club.roleType': 1
                    })
                    App.event.trigger('clubHome', {
                        roleType: 1
                    })

                    App.util.showTip(this, '加入成功');
                    App.event.emit(App.config.EVENT_CLUB_CHANGE, null)
                } else {
                    App.util.showTip(this, '申请已提交，请耐心等候审核');
                }
            } else {
                App.util.showTip(this, res.data.msg);
            }
        })
    },


    reload: function (e) {
        const clubId = e.currentTarget.dataset.clubid;
        this.onLoad({
            clubId: clubId
        })
    },

    /**
     * 解决 接口调用问题
     */
    onShow:function(){
        if(this.data.club.isReLoad){
            this.onLoad(this.data.clubId);
        }
    },

    onUnload: function () {
        App.event.removeListener('club');

        let club = this.data.club
        if (club && club.roleType >= 2) {
            let newClub = {}
            newClub.title = club.title
            newClub.slogan = club.slogan
            newClub.logo = club.logo
            newClub.features = club.features
            getApp().event.emit(getApp().config.EVENT_CLUB_MODIFY, newClub)
        }
    }
})