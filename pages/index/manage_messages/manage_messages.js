const app = getApp()
const systemApi = app.api("systemApi")
const clubApi = app.api("clubApi")

Page({
  data: {
    clubMsgs: [],
    actMsgs: [],
    tab_index: 0,
    hasLoadActs: false,
    hasLoadClubs: false,
    clubId: 0,
  },

  onLoad: function (options) {
    let clubId = options.clubId
    this.data.clubId = clubId
    let unreadCount = options.num
    if (unreadCount > 0) {
      //俱乐部管理消息大于0，直接定位到俱乐部消息tab页
      this.setData({
        click_onActivity: false,
      });
      this.data.hasLoadClubs = true
      this.loadClubMsgs()
    } else {
      this.data.hasLoadActs = true
      this.loadActCaches()
      this.loadActs()
    }
  },

  loadActCaches() {
    let messages = app.session.getSync("act_messages", [])
    let clubId = this.data.clubId
    messages = messages.filter(e => {
      return e.type == 1 && e.content.clubId == clubId
    })
    messages.forEach(e => {
      e.time = app.util.formatTime2(e.createtime)
    })
    messages.reverse(); //反序显示
    this.setData({
      actMsgs: messages
    })
  },

  loadActs() {
    let that = this
    systemApi.loadSystemMsg(this.data.clubId, res => {
      let messages = res.data.result
      if (messages.length > 0) {
        app.session.addSystemMessages(messages)
        that.loadActCaches()
      }
    })
  },

  loadClubMsgs() {
    let that = this
    let clubId = this.data.clubId
    clubApi.clubMemberJoinMessages({
      data: {
        club_id: clubId
      }
    }, (res) => {
      let data = res.data
      let messages = data.joins;
      messages.forEach((e) => {
        e.time = app.util.formatTime2(e.createTime)
        if (e.joinStatus < 3) {
          e.title = '申请加入俱乐部'
        } else if (e.joinStatus == 3) {
          e.title = '会员管理'
        } else if (e.joinStatus == 4) {
          e.title = '管理员设置'
        } else if (e.joinStatus == 5) {
          e.title = '管理员撤销'
        } else if (e.joinStatus == 6) {
          e.title = '副会长设置'
        } else if (e.joinStatus == 7) {
          e.title = '副会长撤销'
        } else if (e.joinStatus == 8) {
          e.title = '副会长设置'
        } else if (e.joinStatus == 9) {
          e.title = '会员管理'
        } 
      })
      that.setData({
        clubMsgs: messages
      })
    }, res => {

    })
  },

  bindButton(e) {
    let obj = e.currentTarget.dataset;
    let click = obj.id;
    this.setData({
      tab_index: click
    })
    if (click == 0) {
      if (!this.data.hasLoadActs) {
        //实现懒加载
        this.data.hasLoadActs = true
        this.loadActs()
      }
    } else {
      if (!this.data.hasLoadClubs) {
        //实现懒加载
        this.data.hasLoadClubs = true
        this.loadClubMsgs()
      }
    }
  },

  //同意
  bindApprove(e) {
    const info = e.currentTarget.dataset.info
    this.handleJoin(info, true)
  },

  //拒绝
  bindRefuse(e) {
    let info = e.currentTarget.dataset.info
    this.handleJoin(info, false)
  },

  handleJoin(info, approve) {
    let that = this
    clubApi.verfiyClubMemberJoin({
      data: {
        club_id: info.club.clubID,
        user_id: info.user.userID,
        flag: approve ? 1 : -1
      }
    }, (res) => {
      //操作成功，将消息移除
      let messages = that.data.clubMsgs
      for (var i = 0; i < messages.length; i++) {
        let msg = messages[i];
        if (msg.createTime == info.createTime) {
          msg.joinStatus = approve ? 1 : 2
        }
      }

      //更新上一个页面的未读数
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      let unreadCount = prevPage.data.club.joinUnCheckNum - 1
      if (unreadCount < 0) unreadCount = 0
      prevPage.setData({
        club: {
          joinUnCheckNum: unreadCount
        }
      })

      if (approve && prevPage.data.threelabel) {
        let threelabel = prevPage.data.threelabel
        let info = prevPage.data.threelabel[0]
        info.amount = info.amount + 1
        prevPage.setData({
          threelabel: threelabel
        })
      }

      that.setData({
        clubMsgs: messages
      })
    })
  }
})