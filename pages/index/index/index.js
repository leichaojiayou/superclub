//index.js
//获取应用实例
const app = getApp()
const userApi = app.api("userApi")
const clubApi = app.api("clubApi")
const actApi = app.api("actApi")
const systemApi = app.api("systemApi")

const COUNT = 10
const CHECK_INTERVAL = 1000 * 60 * 5 //定时检查系统消息

Page({
  data: {
    clubs: [],
    recentClubs: [],
    statu: 1,
    myClub: {},
    loadingActs: false,
    hasMore: false,
    city: '',
    hotActs: [],
    index_empty: false,
    start: 0,
    refreshClubs: false, //是否需要刷新页面
    firstLoad: true, //是否首次加载页面
    loadingSystemMsg: false, //是否正在请求系统消息
    showingSystemMsg: false, //正在显示系统弹窗
    hasLogin: false, //是否已经登录
  },
  refesh: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    })
  },
  onLoad() {
    this.login()
  },

  onShow() {
    if (!this.data.hasLogin) return

    this.showSystemDialog()
    this.checkSystemMsg()

    app.event.remove(app.config.EVENT_CLUB_MODIFY, this)
    app.event.remove(app.config.EVENT_ACTIVITY_CHANGE, this)
    app.event.remove(app.config.EVENT_CLUB_CHANGE, this)

    if (this.data.refreshClubs) {
      this.data.refreshClubs = false
      this.loadClubs()
    } else {
      let recentClubIds = app.session.recentClubs()
      if (this.data.recentClubs.length != recentClubIds.length) {
        if (recentClubIds.length > 0 && this.data.index_empty) {
          this.setData({
            index_empty: false
          })
        }
        this.loadRecentClubs()
      } else if (recentClubIds.length > 0 &&
        this.data.recentClubs.length > 0 &&
        recentClubIds[0] != this.data.recentClubs[0].clubID) {
        //最近访问的俱乐部刚好满了，需要判断第一个最近访问的俱乐部是否相同
        this.loadRecentClubs()
      }
    }
  },

  onHide() {
    //监听俱乐部信息的更改
    app.event.on(app.config.EVENT_CLUB_MODIFY, this, info => {
      let club = this.data.myClub
      if (club == null) return
      for (let key in info) {
        club[key] = info[key]
      }
      this.setData({
        myClub: club
      })
    })

    app.event.on(app.config.EVENT_ACTIVITY_CHANGE, this, info => {
      //发布了活动，刷新俱乐部列表
      this.loadClubs()
    })

    app.event.on(app.config.EVENT_CLUB_CHANGE, this, info => {
      //加入或者退出俱乐部
      this.data.refreshClubs = true
    })
  },

  onPullDownRefresh: function () {
    this.loadClubs()
  },

  login: function (userRes) {
    //调用微信登录，获取微信code
    let that = this
    wx.login({
      success: (res) => {
        console.log("wx.login() ==> success")
        if (res.code) {
          // 检查用户是否已经绑定超级俱乐部账号
          //https://mp.weixin.qq.com/debug/wxadoc/dev/api/open.html#wxgetuserinfoobject
          //获取微信用户信息, 获取encryptedData和iv
          wx.getUserInfo({
            success: (userRes) => {
              console.log("wx.getUserInfo() ==> success")
              userApi.login({
                method: "POST",
                data: {
                  encryptedData: userRes.encryptedData,
                  iv: userRes.iv,
                  code: res.code
                }
              }, (res) => {
                that.validateBind(res)
              }, (res) => {
                that.showLoginFailDialog('账号登录失败，请重试')
              })
            },
            fail: (res) => {
              //errorMsg: 
              // 1. getUserInfo:fail auth deny 
              // 2.getUserInfo:fail
              console.error("wx.getUserInfo() ==> " + res.errMsg)
              if (res.errMsg.includes('auth deny')) {
                that.weixinAuthFail()
              } else {
                that.showLoginFailDialog('获取微信用户信息失败,请重试')
              }
            }
          })
        } else {
          // weixin code empty
          console.error("wx.login.success with empty code")
          that.weixinAuthFail()
        }
      },
      fail: res => {
        console.error("wx.login() ==> " + res.errMsg)
        //经常出现此错误,但是不应该提示未授权 (login:fail 网络错误 statusCode : 404)
        if (res.errMsg.includes('404')) {
          that.showLoginFailDialog()
        } else {
          that.weixinAuthFail()
        }
      }
    });
  },

  //登录出错
  showLoginFailDialog: function (content = '微信账号登录失败，请重试') {
    let that = this
    app.wxService.showModal({
      title: '提示',
      content: content,
      showCancel: false
    }, res => {
      that.login()
    })
  },

  weixinAuthFail() {
    try {
      console.log('clear local storage')
      wx.clearStorageSync()
    } catch (e) {
      // Do something when catch error
    }
    this.setData({
      //获取微信信息失败，显示活动页面
      index_empty: true
    })
    let that = this
    app.wxService.showModal({
      title: '提示',
      content: app.config.MSG_AUTH_FAIL,
      showCancel: false,
    },
      function (res) {
        that.emptyHandle()
      }
    )
  },

  validateBind: function (res) {
    let data = res.data;
    var that = this
    this.data.hasLogin = true
    //给session添加特定的key.防止多用户数据污染
    app.session.setKeyPrefix(data.user.userID + "_")
    //已经绑定了超级俱乐部账号
    app.session.saveUserInfo(data.user, data._key)
    that.loadClubs();
  },

  loadClubs: function () {
    //请求我加入的俱乐部列表
    let that = this
    userApi.myClubs({}, (res) => {
      let status = 1
      let clubName = ""
      let data = res.data;
      let clubList = data.clubs;
      //更新我加入的俱乐部
      app.session.updateJoinClubs(clubList)
      let len = clubList.length;
      let clubs = []
      that.data.myClub = {}
      for (var i = 0; i < len; i++) {
        let club = clubList[i];
        // club.features.forEach(e => {
        //   if (e.name.length > 2) {
        //     e.name = e.name.slice(0, 2)
        //   }
        // })
        if (club.status == 0) {
          //俱乐部创建审核中
          status = 2
          clubName = club.title
          that.setData({
            myClub: club
          })
        } else if (club.roleType >= 2) {
          //担任管理级别
          status = 3
          clubName = club.title
          let role = ''
          if (club.roleType == 2) {
            role = '会长'
          } else if (club.roleType == 3) {
            role = '副会长'
          } else {
            role = '管理员'
          }
          club.roleIcon = app.util.getClubImg(club.roleType, true)
          club.roleTypeText = role
          that.setData({
            myClub: club
          })
        } else {
          club.type = 1 // 1, //标识点击的是我加入的俱乐部
          clubs.push(club)
        }
      }

      if (that.data.myClub.title) {
        //有担任管理员级别以上，保存担任角色信息
        app.session.saveMyClubInfo(that.data.myClub)
        if (that.data.myClub.status != 0 && that.data.firstLoad) {
          //不是创建中, 第一次登陆
          that.data.firstLoad = false
          app.wxService.navigateTo('index/gljlb/gljlb?clubId=' + that.data.myClub.clubID)
        }
      } else {
        app.session.removeMyClubInfo()
        if (clubs.length != 0 && that.data.firstLoad) {
          that.data.firstLoad = false
          let recentClubs = app.session.recentClubs();
          let emptyRecents = recentClubs == null || recentClubs.length == 0
          if (clubs.length == 1 && emptyRecents) {
            app.wxService.navigateTo('club/clubhome/clubhome?clubId=' + clubs[0].clubID)
          }
        }
      }

      let index_empty = clubs.length == 0 &&
        app.session.recentClubs().length == 0 &&
        !that.data.myClub.title

      //index_empty = true
      clubs.sort((first, second) => {
        return second.newActCount - first.newActCount
      })

      that.setData({
        //渲染UI
        statu: status,
        clubname: clubName,
        clubs: clubs,
        index_empty: index_empty
      })

      if (index_empty) {
        //如果是首页为空，请求热门活动
        that.emptyHandle()
      } else {
        that.loadRecentClubs()
      }
    }, res => {

    }, res => {
      wx.stopPullDownRefresh()
    })
  },

  manageClub: function (e) {
    let myClub = this.data.myClub;
    let status = this.data.statu;
    let that = this
    if (app.session.getUserKey() == null) {
      app.wxService.showModal({
        title: '提示',
        content: app.config.MSG_AUTH_FAIL,
        showCancel: false,
      })
      return
    }

    if (status == 1) {
      clubApi.createClubCheck({}, res => {
        if (res.data.check == 0) {
          app.util.showTip(that, res.data.msg)
          return
        }
        //创建俱乐部
        wx.navigateTo({
          url: '../cjjlb/cjjlb'
        })
      }, res => {
        let errorData = app.util.getErrorMsg(res)
        app.util.showTip(that, errorData.content)
      })
    } else if (status == 2) {
      //俱乐部审核中
    } else if (status == 3) {
      //进入管理页面
      app.wxService.navigateTo("../gljlb/gljlb?clubId=" + myClub.clubID)
      this.markNewActRead(0, myClub)
    }
  },

  clubHome: function (e) {
    let type = e.currentTarget.dataset.type
    let club = e.currentTarget.dataset.club
    this.markNewActRead(type, club)

    let clubId = club.clubID
    app.wxService.navigateTo('club/clubhome/clubhome?clubId=' + clubId)
  },

  //查看新活动，需要把红色数字去掉
  markNewActRead(type, club) {
    if (club.newActCount <= 0) {
      return
    }
    //0: 点击我管理的俱乐部
    //1: 点击我加入的俱乐部
    //2: 点击最近访问的俱乐部
    club.newActCount = 0
    if (type == 0) {
      this.setData({
        myClub: club
      })
      app.session.markClubRead(club)
    } else {
      let clubs = type == 2 ? this.data.recentClubs : this.data.clubs
      for (var i = 0; i < clubs.length; i++) {
        let c = clubs[i]
        if (c.clubID == club.clubID) {
          c.newActCount = 0
          app.session.markClubRead(club)
          break
        }
      }
      clubs.sort((first, second) => {
        return second.newActCount - first.newActCount
      })
      if (type == 2) {
        this.setData({
          recentClubs: clubs
        })
      } else {
        this.setData({
          clubs: clubs
        })
      }
    }
  },

  loadRecentClubs: function () {
    let that = this
    let recentClubs = that.data.index_empty ? app.session.recentClubs() : app.session.allRecentClubs();
    if (recentClubs == null || recentClubs.length == 0) {
      this.setData({
        recentClubs: []
      })
      return
    }
    clubApi.recentClubs(recentClubs, res => {
      let recents = res.data.result
      if (recents == null || recents.length == 0) return
      recents.forEach(e => {
        e.type = 2 //标识点击的是最近访问的俱乐部
      })
      app.session.checkNewActCount(recents)
      if (that.data.clubs.length == 0 && that.data.firstLoad) {
        that.data.firstLoad = false
        if (recents.length == 1) {
          app.wxService.navigateTo('club/clubhome/clubhome?clubId=' + recents[0].clubID)
        }
      }
      recents.sort((first, second) => {
        return second.newActCount - first.newActCount
      })
      that.setData({
        recentClubs: recents
      })
    })
  },

  //================================================
  // 首页为空
  //================================================
  emptyHandle: function () {
    let that = this
    this.data.firstLoad = false
    wx.getLocation({
      success: res => {
        systemApi.locationConvert({
          data: {
            lat: Number.parseInt(res.latitude * 1000000),
            lng: Number.parseInt(res.longitude * 1000000),
          }
        }, res => {
          let city = res.data.City
          that.data.city = city;
          that.refreshActs(true)
        })
      }
    })
  },

  refreshActs: function () {
    this.loadActs(true)
  },

  loadMoreActs: function () {
    this.loadActs(false)
  },

  loadActs: function (refresh) {
    var that = this
    if (this.data.loadingActs) return
    if (this.data.city == '') return
    if (!this.data.hasMore && !refresh) return
    this.data.loadingActs = true
    let start = refresh ? 0 : this.data.start
    actApi.hotActs({
      data: {
        type: 2, //最热活动
        start: start,
        count: COUNT,
        location: that.data.city
      }
    }, res => {
      let data = res.data
      that.data.loadingActs = false
      that.data.start = data.start
      that.data.hasMore = data.more == 1
      let hotActs = res.data.activities
      if (hotActs == null) hotActs = []
      hotActs.forEach(e => {
        e.formatTime = app.util.formatTime2(e.begin)
        if (e.ticketCount > 1) {
          e.price = '￥' + e.cost + '起'
        } else if (e.cost > 0) {
          e.price = '￥' + e.cost
        } else {
          e.price = '免费'
        }
        //actStatus:活动状态 0报名中，1报名关闭，2活动结束
        if (e.actStatus == 1) {
          e.actStatusText = "活动中"
        } else if (e.actStatus == 2) {
          e.actStatusText = "已结束"
        } else {
          e.actStatusText = "报名中"
        }
      })
      let dataList = that.data.hotActs
      var renderArr = refresh ? hotActs : dataList.concat(hotActs);
      that.setData({
        hotActs: renderArr
      })
    }, res => {
      that.data.loadingActs = false
    })
  },

  actDetails(e) {
    // 查看活动详情
    let activity = e.currentTarget.dataset.info
    let activityId = activity.activityID
    app.wxService.navigateTo('activity/act_detail/act_detail', {
      activityID: activityId,
      clubID: activity.clubInfo.clubID,
      backOrTo: 1,
      recent: 0
    })
  },

  clubDetail(e) {
    //俱乐部详情
    // let clubId = e.currentTarget.dataset.id
    // app.wxService.navigateTo('club/clubhome/clubhome', {
    //   clubId: clubId
    // })
  },

  //检查系统消息
  checkSystemMsg: function () {
    let checkTime = app.session.getSync("check", 0)
    if (Date.now() - checkTime <= CHECK_INTERVAL) {
      return
    }
    this.loadClubs() //每隔一定时间检查是否有新活动
    if (this.data.loadingSystemMsg) return
    this.data.loadingSystemMsg = true
    let that = this
    systemApi.loadSystemMsg(0, res => {
      that.data.loadingSystemMsg = false
      app.session.saveSync("check", Date.now())
      app.session.addSystemMessages(res.data.result)
      that.showSystemDialog()
    }, res => {
      that.data.loadingSystemMsg = false
    })
  },

  showSystemDialog: function () {
    let that = this
    if (this.data.showingSystemMsg) return
    let dialogMsgs = app.session.getSync('dialog_messages', [])
    if (dialogMsgs == null || dialogMsgs.length == 0) return
    let msg = dialogMsgs[0]
    this.data.showSystemDialog = true
    getApp().wxService.showModal({
      title: msg.content.title,
      content: msg.content.content,
      showCancel: false
    }, res => {
      let msgs = app.session.getSync('dialog_messages', [])
      if (msgs == null || msgs.length == 0) return
      msgs.shift()
      app.session.saveSync('dialog_messages', msgs)
      that.data.showSystemDialog = false
      that.showSystemDialog()
    })
  },

})