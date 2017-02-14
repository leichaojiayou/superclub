const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
const config = require('../../../utils/constant')
Page({
    data: {
        page: {
            club_logo_img: config.CDN_URL + '/xiaochengxu/image/club_logo.jpg',
            club_start_img: config.CDN_URL + '/xiaochengxu/image/stars.png',
            club_statistics_icon: config.CDN_URL + '/xiaochengxu/image/member.png',
            img: config.CDN_URL + '/xiaochengxu/image/right-errow.png',
        },
    },
    onLoad(options) {
        this.setData({
            clubParam: options
        });
        this.getClubIndex();
    },

    /**
     * 获取俱乐部详情
     */
    getClubIndex() {
        const that = this;
        let param = {};
        param.data = that.data.clubParam;
        clubApi.clubIndex(param, res => {
            that.setData({
                club: res.data.club
            })
        });
    },

    tips() {
        var that = this;
        let toastParam = {
            title: '提示',
            content: '你还不是俱乐部成员，加入俱乐部即可查看俱乐部资料',
        }
        wxService.showModal(toastParam, res => {
            if (res.confirm) {
                console.log('用户点击确定')
                that.__memberGather()
            }
        });
    },


    //seting club name
    setClubName(e) {
        const club = this.data.club, tempClub = wxService.getTemp(App, 'club');
        let param = {}, title = '';
        if (tempClub) {
            title = App.globalData.temp.club.title
        }
        param.clubID = club.clubID;
        param.title = title || club.title;
        wxService.navigateTo('club/modify/clubName/clubName', param);
    },

    //seting logo
    setClubLogo() {
        const that = this;
        wxService.uploadImg(res => {
            console.log(res);
            that.setData({
                clubLogo: res[0]
            })
            let param = {
                data: {}
            }
            param.data.club_id = that.data.club.clubID;
            param.data.logo = res[0]
            clubApi.modifyClub(param, res => {
                if (res.data.status) {
                    wxService.setGlobalTempClub(App, param.data)
                }
            })
        }, 1);

    },

    //seting grade
    setGrade() {
        console.log('test')
    },

    //seting address
    setAddress() {
        console.log('test')
    },

    //主打项目
    setProjects(e) {
        let features = this.data.club.features, i = 0, items = [], tempClub = wxService.getTemp(App, 'club');
        if (tempClub) {
            features = tempClub.features || features;
        }
        for (; i < features.length; i++) {
            items.push(features[i].name);
        }
        wxService.navigateTo('club/modify/masterProjects/masterProjects', {
            features: items,
            clubID: this.data.club.clubID
        });
    },

    //设置加入方式
    setJoinWay() {
        const club = this.data.club, tempClub = wxService.getTemp(App, 'club');
        let param = {}, needJoinCheck = '';
        if (tempClub) {
            needJoinCheck = tempClub.needJoinCheck
        }
        param.clubID = club.clubID;
        param.needJoinCheck = needJoinCheck || club.needJoinCheck;
        wxService.navigateTo('club/modify/joinWay/joinWay', param);
    },

    //设置颜验证消息
    setCheckMsg() {
        const club = this.data.club, tempClub = wxService.getTemp(App, 'club');
        let param = {}, payeeType = '';
        if (tempClub) {
            payeeType = tempClub.payeeType
        }

        param.clubID = club.clubID;
        param.needJoinCheck = payeeType || club.payeeType;
        wxService.navigateTo('club/modify/checkMsg/checkMsg', param);
    },

    //设置收款账号
    setAccountGather() {
        const club = this.data.club, tempClub = wxService.getTemp(App, 'club');
        let param = {}, payeeType = '';
        if (tempClub) {
            payeeType = tempClub.payeeType
        }

        param.clubID = club.clubID;
        param.payeeType = payeeType || club.payeeType;
        wxService.navigateTo('club/modify/accountGather/accountGather', param);
    },

    //任免副会长
    setViceChariman() {
        //0:haven't viceChariman 2:have viceChariman
        wxService.navigateTo('club/modify/appointMember/appointMember', { type: 0 });
    },

    //任免管理员
    setManager() {
        wxService.navigateTo('club/modify/appointMember/appointMember', { type: 1 });
    },

    //移除会员
    removeMember() {
        wxService.navigateTo('club/modify/removeMember/removeMember');
    },

    //宣言
    setDeclaration() {
        const club = this.data.club, tempClub = wxService.getTemp(App, 'club');
        let param = {}, slogan = '';
        if (tempClub) {
            slogan = tempClub.slogan
        }
        param.clubID = club.clubID;
        param.slogan = slogan || club.slogan;
        wxService.navigateTo('club/modify/declaration/declaration', param);

    },

    //设置简介
    setDescription() {
        const club = this.data.club, tempClub = wxService.getTemp(App, 'club');
        let param = {}, description = '';
        if (tempClub) {
            description = tempClub.description
        }
        param.clubID = club.clubID;
        param.description = description || club.description;
        wxService.navigateTo('club/modify/description/description', param);
    },

    //memberGather
    __memberGather() {
        wxService.navigateTo('club/modify/clubMember/clubMember');
    },

    deleteClub() {
        let toastParam = {
            title: '确定删除俱乐部？',
            content: '所有活动、群、俱乐部成员将同时删除，且不能恢复。',
        }
        wxService.showModal(toastParam, res => {
            if (res.confirm) {
                let param = {}
                let data = {
                    club_id: 100401
                }
                param.data = data;
                clubApi.clubDeleted(param, res => { }, res => { }, res => {
                    if (res.statusCode === 200) {
                        let resultObj = res.data;
                        if (resultObj.status == 1) {
                            App.wxService.navigateBack();
                        }
                    }
                });
            }
        })
    },

    clubQuited() {
        let param = {}
        clubApi.clubIndex(param, res => {
            console.log(res);
        });
    },

    joinClub() {
        let param = {}
        clubApi.clubJoined(param, res => {
            console.log(res);
        });
    },

    onShow: function () {
        if (App.globalData.temp && App.globalData.temp.club) {
            let masterProjects = wx.getStorageSync('masterProject'), i = 0, j = 0, modifyFeatures = [],
                club = wxService.getTemp(App, 'club'), features = [];
            if (club && typeof club.features === 'string') {
                features = club.features.split(',')
            }
            if (features.length > 0) {
                for (; i < features.length; i++)
                    for (; j < masterProjects.length; j++) {
                        if (features[i] == masterProjects[j].id) {
                            modifyFeatures.push({
                                name: masterProjects[j].name
                            });
                            break;
                        }
                    }
                wxService.setGlobalTempClub(App, {
                    features: modifyFeatures
                })
            }
            this.setData({
                modifyTitle: club.title,
                modifyFeatures: modifyFeatures,
                modifyNeedJoinCheck: club.need_join_check,
                modifyPayeeType: club.payee_type,
                modifySlogan: club.slogan,
                modifyDescription: club.description,

            })
        }

    },

})