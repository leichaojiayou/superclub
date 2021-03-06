var app = getApp()
const clubApi = app.api("clubApi")
const actApi = app.api("actApi")

Page({
  data: {
    clubId: 0,
    threelabel: [{
        txt: '会员',
        amount: 0
      },
      {
        txt: '本月活动',
        amount: 0
      },
      {
        txt: '本月报名',
        amount: 0
      },
    ],
    item: [{
        img: 'https://cdn.51julebu.com/xiaochengxu/image/active.png',
        content: '组织活动'
      },
      {
        img: 'https://cdn.51julebu.com/xiaochengxu/image/member+.png',
        content: '招募会员'
      },
      {
        img: 'https://cdn.51julebu.com/xiaochengxu/image/msg.png',
        content: '免费短信'
      },
      {
        img: 'https://cdn.51julebu.com/xiaochengxu/image/list.png',
        content: '管理消息'
      }
    ],
    img: {
      noimgAct: app.util.getClubImg() + 'norecord@2x.png',
    },
    //分页
    loading: false,
    start: 0,
    hasMore: true,
    acts: [],

    club: {
      joinUnCheckNum: 0,
      codeHehe: '',
    },
    hideQrCode: true,
    backOrTo: 0, //跳转标志，如果从俱乐部主页跳转过来，set 1，这时从管理主页跳俱乐部主页，只需要返回即可
  },

  onLoad(params) {
    let clubId = params.clubId;
    this.data.clubId = clubId
    this.data.backOrTo = params.backOrTo | 0
    this.loadClubInfo()
    this.onReachBottom()
  },

  onShow() {
    app.event.remove(app.config.EVENT_CLUB_MODIFY, this)
    app.event.remove(app.config.EVENT_ACTIVITY_CHANGE, this)
    app.event.remove(app.config.EVENT_APPLY_CHANGE, this)
  },

  onHide() {
    //监听俱乐部信息的更改
    app.event.on(app.config.EVENT_CLUB_MODIFY, this, info => {
      let club = this.data.club
      for (let key in info) {
        club[key] = info[key]
      }
      this.setData({
        club: club
      })
    })

    //发布了新活动
    app.event.on(app.config.EVENT_ACTIVITY_CHANGE, this, info => {
      let count = info.count ? info.count : 0
      if (count == 0) return
      if (count > 0) {
        //发布新活动
        this.data.start = 0
        this.data.hasMore = true
        this.onReachBottom()
      } else {
        //删除活动
        let actId = info.actId
        let acts = this.data.acts
        for (var i = 0; i < acts.length; i++) {
          let act = acts[i]
          if (act.activityID == actId) {
            acts.slice(i, 1)
            break
          }
        }
        this.setData({
          acts: acts
        })
      }
      //更改本月活动数
      let threelabel = this.data.threelabel
      let thisMonth = threelabel[1]
      thisMonth.amount = thisMonth.amount + count
      this.setData({
        threelabel: threelabel
      })
    })

    //报名人数发生更改
    app.event.on(app.config.EVENT_APPLY_CHANGE, this, info => {
      let count = info.count ? info.count : 0
      if (count == 0) return
      //更改本月报名人数
      let threelabel = this.data.threelabel
      let thisMonth = threelabel[2]
      thisMonth.amount = thisMonth.amount + count
      this.setData({
        threelabel: threelabel
      })
      let actId = info.actId
      let acts = this.data.acts
      for (var i = 0; i < acts.length; i++) {
        let act = acts[i]
        if (act.activityID == actId) {
          act.applyCount += count
          break
        }
      }
      this.setData({
        acts: acts
      })
    })
  },

  loadClubInfo() {
    //获取俱乐部详情
    let clubId = this.data.clubId
    let that = this
    clubApi.clubDetailLite({
      loading: true,
      data: {
        club_id: clubId
      }
    }, (res) => {
      let clubInfo = res.data.club;
      clubInfo.clubimg = clubInfo.logo
      clubInfo.clubicon = app.util.getClubImg(clubInfo.score, false)
      if (clubInfo.title.length > 25) {
        clubInfo.clubname = clubInfo.title.slice(0, 25) + "..."
      } else {
        clubInfo.clubname = clubInfo.title
      }
      clubInfo.clubcode = clubInfo.qrcode
      clubInfo.clubtext = "ID:" + clubInfo.clubNo + "  成员" + clubInfo.memberCount
      that.setData({
        club: clubInfo,
        threelabel: [{
            txt: '会员',
            amount: clubInfo.memberCount
          },
          {
            txt: '本月活动',
            amount: clubInfo.monthActCount
          },
          {
            txt: '本月报名',
            amount: clubInfo.monthApplyCount
          },
        ]
      })
    })
  },

  onReachBottom() {
    if (this.data.loading) return
    if (!this.data.hasMore) return
    let that = this
    this.data.loading = true
    let start = this.data.start
    //获取俱乐部管理活动列表
    actApi.manageActs({
        data: {
          user_id: app.session.getUserInfo().userID,
          start: start,
          club_id: that.data.clubId,
          count: 15,
          //exceptProxyAct: 1 //产品说也显示代理活动
        }
      },
      (res) => {
        that.data.loading = false
        let activities = res.data.activities;
        activities.forEach(e => {
          e.beginTime = app.util.formatTime2(e.begin, true)
          e.endTime = app.util.formatTime2(e.end, true)
          if(e.ticketCount > 1) {
            e.money = '￥' + e.cost + '起'
          } else if(e.cost > 0) {
            e.money = '￥' + e.cost
          } else {
            e.money = '免费'
          }
        })
        let renderArray = start == 0 ? activities : that.data.acts.concat(activities)
        that.setData({
          acts: renderArray,
          start: res.data.start,
          hasMore: res.data.more == 1
        })
      }, res => {
        that.data.loading = false
      }
    )
  },

  nato: function (e) {
    var that = this
    switch (e.currentTarget.id) {
      case '0': //发布活动
        app.wxService.navigateTo("organize/act_op/act_op")
        break;
      case '1': //招募会员
        that.showClubQrCode()
        break;
      case '2': //免费短信
        app.wxService.navigateTo("index/mfdx/mfdx")
        break;
      case '3': //待办事项
        app.wxService.navigateTo("index/manage_messages/manage_messages", {
          clubId: that.data.clubId,
          num: that.data.club.joinUnCheckNum
        })
        break;
    }
  },

  showClubQrCode() {
    let that = this
    let club = that.data.club
    if (club.clubQrCode) {
      club.codeHehe = 'opacity:1;pointer-events:auto;'
      club.clubcode = club.clubQrCode
      that.setData({
        club: club
      })
      return
    }
    //生成俱乐部二维码
    let path = 'pages/club/clubhome/clubhome?clubId=' + that.data.clubId
    app.api("systemApi").createQrCode(path, res => {
      let qrcode = res.data.result;
      let club = that.data.club
      club.clubQrCode = qrcode
      that.setData({
        club: club
      })
      that.showClubQrCode()
    }, res => {
      app.util.showTip(this, '生成二维码失败')
    })
  },

  clubModify: function () {
    app.wxService.navigateTo('club/clubInformation/clubInformation?clubId=' + this.data.clubId)
  },

  clubDetail: function () {
    if (this.data.backOrTo != 0) {
      app.wxService.navigateBack()
    } else {
      app.wxService.navigateTo('club/clubhome/clubhome', {
        clubId: this.data.clubId,
        backOrTo: 1
      })
    }
  },

  actDetail: function (e) {
    let activity = e.currentTarget.dataset.activity
    let activityId = activity.activityID
    let clubId = this.data.clubId

    let errorMsg = ''
    if (activity.isGroupApply != 0) {
      //组队活动
      errorMsg = app.config.MSG_GROUP_NOT_SUPPORT
    } else if (activity.isProxyActivity != 0) {
      //代理活动
      errorMsg = app.config.MSG_PROXY_NOT_SUPPORT
    }
    if (errorMsg != '') {
      app.wxService.showModal({
        title: '提示',
        content: errorMsg,
        showCancel: false,
      })
      return
    }

    app.wxService.navigateTo("../../manage/manage_apply/manage_apply", {
      actId: activityId,
      clubID: clubId,
      howToPay: activity.howToPay
    })
  },

  closeCode: function () {
    let club = this.data.club
    club.codeHehe = ''
    this.setData({
      club: club
    })
  },

  onShareAppMessage: function () {
    return {
      title: '一起来玩超级俱乐部吧',
      path: '/pages/club/clubhome/clubhome?clubId=' + this.data.clubId
    }
  }
})