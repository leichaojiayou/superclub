//index.js
//获取应用实例
const app = getApp()
const userApi = app.api("userApi")
const clubApi = app.api("clubApi")
const actApi = app.api("actApi")
const systemApi = app.api("systemApi")

const COUNT = 5

Page({
  data: {
    item:[
      {sort:'骑行',color:'rgb(145 ,213 ,192)'},
      {sort:'徒步',color:'rgb(145 ,213 ,192)'},
      {sort:'篮球',color:'rgb(145 ,213 ,192)'},
    ],
    clubs: [],
    statu: '2',
    myClub: {},
    loadingActs: false,
    hasMore: false,
    city: '',
    hotActs: [],
    index_empty: false,
    start: 0,
  },

  onLoad() {
    if (app.session.getUserKey() && app.session.getUserKey() != "") {
      //已经登录了。
      this.loadClubs()
      return
    }

    this.login()
  },

  login: function (userRes) {
    //调用微信登录，获取微信code
    let that = this
    wx.login({
      success: (res) => {
        if (res.code) {
          // 检查用户是否已经绑定超级俱乐部账号
          //https://mp.weixin.qq.com/debug/wxadoc/dev/api/open.html#wxgetuserinfoobject
          //获取微信用户信息, 获取encryptedData和iv
          wx.getUserInfo({
            success: (userRes) => {
              userApi.login({
                method:"POST",
                data: {
                  encryptedData: userRes.encryptedData,
                  iv: userRes.iv,
                  code: res.code
                }
              }, (res) => {
                that.validateBind(res)
              }, (res) => {
                let errorData = app.util.getErrorMsg(res)
                if (errorData.content != '') {
                  app.wxService.showToast(errorData.content)
                }
                that.showLoginFailDialog()
              })
            },
            fail: (res) => {
              that.showLoginFailDialog()
            }
          })
        } else {
          // weixin code empty
          that.showLoginFailDialog()
        }
      },
      fail: res => {
        that.showLoginFailDialog()
      }
    });
  },

  //登录出错
  showLoginFailDialog: function () {
    let that = this
    app.wxService.showModal({
      title: '提示',
      content: '账号登录失败，请重试',
      showCancel: false,
    }, res => {
      that.login()
    })
  },

  validateBind: function (res) {
    let data = res.data;
    var that = this
    if (data.status != 1) {
      // let errorCode = data.code;
      // if (errorCode == 20001) {
      //   //未绑定手机号码
      //   wx.redirectTo({
      //     url: '../bind/bind'
      //   })
      // }
    } else {
      //已经绑定了超级俱乐部账号ß
      app.session.saveUserInfo(data.user, data._key)
      that.loadClubs();
    }
  },

  loadClubs: function () {
    //请求我加入的俱乐部列表
    let that = this
    userApi.myClubs({}, (res) => {
      let status = 1
      let clubName = ""
      let data = res.data;
      let clubList = data.clubs;
      let len = clubList.length;
      let clubs = []
      for (var i = 0; i < len; i++) {
        let club = clubList[i];
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
          that.setData({
            myClub: club
          })
        } else {
          clubs.push(club)
        }
      }


      let index_empty = clubs.length == 0 &&
        app.session.recentClubs().length == 0 &&
        !that.data.myClub.title

      //index_empty = true

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
      }
    })
  },

  manageClub: function (e) {
    let myClub = this.data.myClub;
    let status = this.data.statu;
    if (status == 1) {
      clubApi.createClubCheck({}, res => {
        if (res.data.check == 0) {
          app.wxService.showToast(res.data.msg)
          return
        }
        //创建俱乐部
        wx.navigateTo({
          url: '../cjjlb/cjjlb'
        })
      }, res => {
        let errorData = app.wxService.util.getErrorMsg(res)
        app.wxService.showToast(errorData.errorContent)
      })
    } else if (status == 2) {
      //俱乐部审核中
    } else if (status == 3) {
      //进入管理页面
      app.wxService.navigateTo("../gljlb/gljlb?clubId=" + myClub.clubID)
    }
  },

  clubHome: function (e) {
    let clubId = e.currentTarget.dataset.id
    app.wxService.navigateTo('club/clubhome/clubhome?clubId=' + clubId)
  },

  //================================================
  // 首页为空
  //================================================
  emptyHandle: function () {
    let that = this
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
          that.refreashActs(true)
        })
      }
    })
  },

  refreashActs: function () {
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
    let start = this.data.start
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
      that.start = data.start
      that.hasMore == data.more == 1
      let hotActs = res.data.activities
      if (hotActs == null) hotActs = []
      hotActs.forEach(e => {
        e.formatTime = app.util.formatTime2(e.begin)
        e.price = app.util.formatMoney(e.cost)
        //actStatus:活动状态 0报名中，1报名关闭，2活动结束
        if (e.actStatus == 1) {
          e.actStatusText == "报名关闭"
        } else if (e.actStatus == 2) {
          e.actStatusText == "活动结束"
        } else {
          e.actStatusText == "报名中"
        }
      })
      let dataList = that.data.hotActs
      var renderArr = refresh ? hotActs : dataList.concat(dataArr);
      that.setData({
        hotActs: renderArr
      })
    }, res => {
      that.data.loadingActs = false
    })
  },

  actDetails(e) {
    // 查看活动详情
    let activityId = e.currentTarget.dataset.id
    app.wxService.navigateTo('activity/act_detail/act_detail', {
      activityID: activityId
    })
  },
})