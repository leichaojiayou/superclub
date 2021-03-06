
// pages/clubhome/clubhome.js
const App = getApp();
const clubApi = App.api('clubApi');
const userApi = App.api("userApi")
const systemApi = App.api("systemApi")

const wxService = App.wxService;
const session = App.session;
const util = require('../../../utils/util')
Page({
  data: {
    img: {
      imgStart: util.getClubImg(0),
      imgRight: util.getClubImg() + 'right-errow-2@2x.png',
      imgQrcode: util.getClubImg() + 'files-2@2x.png',
      imgMember: util.getClubImg() + 'member@2x.png',
      noimgAct: util.getClubImg() + 'norecord@2x.png',
      imgAct: util.getClubImg() + 'active@2x.png',
    },
    start: 0,
    time: 60, //倒计时
    isReWriteLister: true,//是否要启动监听器
    isServerDoIt: 0 //服务处理临时用户问题 0：服务器处理 1：不做处理
  },
  onPullDownRefresh: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    })
    this.getMamberActivity()
  },
  onLoad: function (e) {
    this.setData({
      clubId: e.clubId,
      backOrTo: e.backOrTo
    });
    this.getClubIndex(true);
  },

  /**
   * 获取俱乐部主页
   */
  getClubIndex: function (loading) {
    const that = this;
    let param = {}
    let data = {
      club_id: that.data.clubId
    }
    param.data = data;
    clubApi.clubIndex(param, res => {
      getApp().session.addAccessClub(that.data.clubId)
      let club = res.data.club, score = club.score, img = that.data.grade;
      club.gradeImg = util.getClubImg(score || 0);
      that.setData({
        clubHome: club
      })
      if (that.data.isReWriteLister) {
        App.event.addListener('clubHome', this);
        that.data.isReWriteLister = false;
      }

      that.getMamberActivity();
    });
  },

  /**
   * 获取用户活动信息
   */
  getMamberActivity: function () {
    if (this.data.more == 0) return
    const that = this;
    let param = {}
    let data = {
      club_id: that.data.clubId,
      start: that.data.start,
      count: 30,
    }
    param.data = data;
    clubApi.clubActs(param, (res) => {
      wx.stopPullDownRefresh()
      console.log(res)
      let data = res.data;
      if (data) {
        let activities = data.acts;
        activities.forEach((e) => {
          e.begin = App.util.formatTime2(e.beginTime, true);
          e.end = App.util.formatTime2(e.endTime, true);
        });
        let oldActs = that.data.activity || [];
        activities = oldActs.concat(activities);
        that.setData({
          activity: activities,
          start: data.start,
          more: data.more,
        })
      }
    })
  },

  onReachBottom: function () {
    this.getMamberActivity()
  },

  /**
   * 分享 俱乐部主页
   */
  onShareAppMessage: function () {
    return {
      title: this.data.clubHome.title,
      path: '/pages/club/clubhome/clubhome?clubId=' + this.data.clubId
    }
  },
  actDetail: function (e) {
    wxService.navigateTo('activity/act_detail/act_detail', {
      activityID: e.currentTarget.dataset.actid,
      clubId: this.data.clubId,
      backOrTo: 1
    })
  },

  toClubInformation: function () {
    wxService.navigateTo('club/clubInformation/clubInformation', {
      clubId: this.data.clubId
    });
  },

  mamgerClub: function () {

    if (this.data.backOrTo == 1) {
      wxService.navigateBack();
    } else {
      wxService.navigateTo('index/gljlb/gljlb', {
        clubId: this.data.clubId,
        backOrTo: 1
      })
    }

  },

  joinClub: function (e) {
    if (this.data.isServerDoIt == 0) {
      //   临时用户直接加入俱乐部
      this.__joinClub();

    } else {
      if (!getApp().session.isTempUser()) {
        this.__joinClub();
      } else {
        this.__showSMSPopup();
      }

    }
  },

  showQrcode: function (e) {
    let club = this.data.clubHome, that = this;
    club.codeHehe = 'opacity:1;pointer-events:auto;';
    club.clubimg = club.logo;
    club.clubname = club.title;
    club.clubtext = 'ID:' + club.clubNo + ' 成员' + club.memberCount
    club.clubicon = util.getClubImg(club.score);
    let path = 'pages/club/clubhome/clubhome?clubId=' + that.data.clubId
    App.api("systemApi").createQrCode(path, res => {
      if (res.data.status == 1) {
        let qrcode = res.data.result;
        club.clubcode = qrcode
        that.setData({
          club: club
        })
      } else {
        App.util.showTip(that, '生成二维失败')
      }

    });
  },

  closeCode: function () {
    let club = this.data.clubHome;
    club.codeHehe = '';
    this.setData({
      club: club
    })
  },

  onShow: function () {
    const data = this.data;
    if (data.isReload) {
      this.getMamberActivity();
    }
    App.event.remove(App.config.EVENT_APPLY_CHANGE, this)
  },

  onHide: function () {
    //报名人数发生更改
    App.event.on(App.config.EVENT_APPLY_CHANGE, this, info => {
      let count = info.count ? info.count : 0
      if (count == 0) return
      //更改本月报名人数
      let actId = info.actId
      let acts = this.data.activity
      for (var i = 0; i < acts.length; i++) {
        let act = acts[i]
        if (act.actID == actId) {
          act.applyCount += count
          break
        }
      }
      this.setData({
        activity: acts
      })
    })
  },


  /*==========check code============*/
  /**
   * 临时用户，绑定手机号
   */
  bindPhone: function () {
    let that = this, phone = this.data.phone;
    let param = { data: {} };
    param.data.auth_type = 2;
    param.data.phone = phone;
    userApi.sendAuthCode(param, res => { }, res => { }, res => {
      if (res.data.status == 1) {
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
      } else {
        App.util.showTip(that, res.data.msg);
      }
    });
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
      App.util.showTip(this, '请输入正确的手机号码');
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
            if (that.data.clubHome.needJoinCheck == 1) {
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

    clearInterval(this.data.interval)
    this.setData({
      param: {
        style: ''
      },
      time: 60
    })
    App.util.showTip(this, '验证码不正确');
  },

  /**
   * 显示验证消息弹窗
   */
  __showCheckPopup: function () {
    this.setData({
      joinShowStyle: "opacity:1;pointer-events:auto;",
      join: '请输入验证信息',
      needjoinText: App.session.getUserInfo().nick + "申请加入",
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
    if (this.data.clubHome.needJoinCheck === 1) {
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
    param.data.club_id = that.data.clubHome.clubID;
    if (needjoinText) {
      param.data.info = needjoinText;
    }
    param.data.formId = that.data.formId;
    clubApi.clubJoined(param, res => { }, res => { }, res => {
      console.log(res);
      that.__hideCheckPopup();
      if (res.data.status == 1) {
        if (!needjoinText) {
          that.setData({
            'clubHome.roleType': 1
          })
          App.util.showTip(this, '加入成功');
          let pages = getCurrentPages(), prevPage = pages[pages.length - 2];  //上一个页面
          prevPage.data.refreshClubs = true
          App.event.emit(App.config.EVENT_CLUB_CHANGE, null)
        } else {
          App.util.showTip(this, '申请已提交，请耐心等候审核');
        }
      } else {
        App.util.showTip(this, res.data.msg);
      }
    })
  },

  /**
   * 上拉刷新
   */
  onPullDownRefresh: function (e) {
    const clubId = this.data.clubId;
    this.onLoad({
      clubId: clubId
    })
  },

  onUnload: function () {
    App.event.removeListener('clubHome');
  }

})
