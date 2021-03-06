// pages/create_club/create_club.js
var app = getApp()
var clubApi = app.api("clubApi")
var userApi = app.api("userApi")
var systemApi = app.api("systemApi")

Page({
  data: {
    choose: '请选择',

    //验证手机的字段
    authCode: "",
    interval: "",
    authDialog: {
      phone: '',
      modalShowStyle: "",
      status: 0, //0: 显示发送验证码的按钮 1: 倒数中
    },
    countDown: 30,

    logo: "",
    remoteLogo: "",
    title: "",
    location: "",
    cityId: "",
    setupTime: "",
    features: [],
    slogan: "",
    desc: "",
    charger: "",
    phone: ""
  },

  onLoad() {
    app.event.addListener('club_fill', this)
  },

  onUnload() {
    app.event.removeListener('club_fill')
  },

  //俱乐部logo
  clickLogo() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          logo: tempFilePaths[0],
          remoteLogo: "",
        })
      }
    })
  },

  //俱乐部名称
  clickName() {
    app.wxService.navigateTo("club/modify/clubName/clubName?type=1&title=" + this.data.title)
  },

  //所在地
  clickLocation() {
    app.wxService.navigateTo("club/modify/province/province?type=1");
  },

  //创立时间
  clickSetupTime() {
    //app.wxService("club/modify/")
  },

  //主打项目
  clickFeature() {
    let ids = ''
    this.data.features.forEach(e => {
      if (ids === '') {
        ids = e.id
      } else {
        ids += ',' + e.id
      }
    })
    app.wxService.navigateTo("club/modify/masterProjects/masterProjects?type=1&features=" + ids)
  },

  //宣言
  clickSlogan() {
    app.wxService.navigateTo("club/modify/declaration/declaration?type=1&slogan=" + this.data.slogan);
  },

  //简介
  clickDesc() {
    app.wxService.navigateTo("club/modify/description/description?type=1&description=" + this.data.desc);
  },
  //负责人
  inputCharger(e) {
    this.setData({
      charger: e.detail.value
    })
  },
  //联系方式
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  validate() {
    let errorMsg = ''
    if (this.data.logo == '') {
      errorMsg = '请上传俱乐部logo'
    } else if (this.data.title == '') {
      errorMsg = '俱乐部名称不能为空'
    } else if (this.data.cityId == '') {
      errorMsg = '俱乐部所在地不能为空'
    } else if (this.data.features.length == 0) {
      errorMsg = '俱乐部主打项目不能为空'
    } else if (this.data.slogan == '') {
      errorMsg = '俱乐部宣言不能为空'
    } else if (this.data.desc == '') {
      errorMsg = '俱乐部简介不能为空'
    } else if (this.data.charger == '') {
      errorMsg = '负责人不能为空'
    } else if (this.data.phone == '') {
      errorMsg = '联系号码不能为空'
    } else if (this.data.phone.length != 11) {
      errorMsg = '联系号码非法'
    }
    if (errorMsg != '') {
      app.util.showTip(this, errorMsg)
      return false
    }
    //校验通过
    return true
  },

  formSubmit(e) {
    if(this.data.charger.length>6){
      app.util.showTip(this, '负责人姓名仅限6个字')
      return
    }else if (this.data.phone.length != 11) {
      app.util.showTip(this, '请输入正确的手机号码')
      return
    }

    let formId = e.detail.formId
    this.data.formId = formId
    this.createClub()
  },

  createClub() {
    let that = this
    const data = this.data
    if (this.validate() == false) {
      //缺少必填项
      return
    }
    if (app.session.isTempUser()) {
      //临时用户，需要先绑定手机
      this.setData({
        modalShowStyle: "opacity:1;pointer-events:auto;"
      })
      this.bindPhone()
      return
    }

    if (data.remoteLogo === '') {
      //先上传logo到服务器
      this.uploadLogo()
      return
    }

    let features = ''
    data.features.forEach(e => {
      if (features != '') {
        features += ','
      }
      features += e.id
    })
    let formId = this.data.formId
    clubApi.createClub({
        method: 'POST',
        data: {
          title: data.title,
          logo: data.remoteLogo,
          description: data.desc,
          slogan: data.slogan,
          city_id: data.cityId,
          need_join_check: "0",
          contact_name: data.charger,
          contact_tel: data.phone,
          feature: features,
          formId: formId
        }
      }, res => {
        //成功
        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        prevPage.setData({
          refreshClubs: true
        })
        app.wxService.showModal({
          title: "创建申请已提交",
          content: "申请已提交，工作人员将在3个工作日内联系您，请耐心等候并保持电话畅通",
          showCancel: false,
        }, res => {
          if (res.confirm) {
            app.wxService.navigateBack(1)
          }
        })
      },
      res => {
        //失败
        let errorData = app.util.getErrorMsg(res)
        app.util.showTip(that, errorData.content)
      })
  },

  uploadLogo() {
    let that = this
    let localPath = this.data.logo
    systemApi.uploadImage(localPath, res => {
      let remoteUrl = res.data.url
      that.setData({
        remoteLogo: remoteUrl
      })
      that.createClub()
    }, res => {
      //上传图片失败
      app.util.showTip(that, "上传俱乐部头像失败")
    })
  },

  /**
   * 临时用户，绑定手机号
   */
  bindPhone() {
    let that = this
    let phone = this.data.phone
    userApi.sendAuthCode({
      data: {
        auth_type: 2,
        phone: phone
      }
    }, res => {
      let interval = setInterval(() => {
        let leftTime = that.data.countDown - 1;
        let authDialog = that.data.authDialog
        if (leftTime > 0) {
          that.setData({
            countDown: leftTime
          })
        } else {
          clearInterval(interval)
          authDialog.status = 0
          that.setData({
            authDialog: authDialog,
            countDown: 30
          })
        }
      }, 1000)
      let authDialog = that.data.authDialog
      authDialog.phone = phone
      authDialog.status = 1
      authDialog.focus = true
      authDialog.modalShowStyle = "opacity:1;pointer-events:auto;"
      that.setData({
        authDialog: authDialog,
        interval: interval,
        countDown: 30
      })
    }, res => {
      let errorData = app.util.getErrorMsg(res)
      let errorMsg = errorData.content
      if (errorMsg == '') {
        errorMsg = "发送验证码失败"
      }
      app.util.showTip(that, errorMsg)
    })
  },

  getAuthCode() {
    //点击发送验证码
    this.bindPhone()
  },

  authInput(e) {
    //输入验证码
    this.data.authCode = e.detail.value
  },

  touchCancel() {
    //点击取消
    clearInterval(this.data.interval)
    let authDialog = this.data.authDialog
    authDialog.modalShowStyle = ""
    authDialog.focus = false
    this.setData({
      authDialog: authDialog,
    })
  },

  touchAddNew() {
    let that = this
    if (this.data.authCode == '') {
      app.util.showTip(this, "验证码不能为空")
      return
    }
    clearInterval(this.data.interval)
    //点击确定
    let authDialog = this.data.authDialog
    authDialog.modalShowStyle = ""
    authDialog.focus = false
    this.setData({
      authDialog: authDialog,
    })

    let code = this.data.authCode
    let phone = this.data.phone
    userApi.bindPhone({
      method: 'POST',
      data: {
        code: code,
        phone: phone,
      }
    }, res => {
      //绑定手机成功, 重新登录一下
      getApp().relogin(res => {
        that.createClub()
      })
    }, res => {
      let errorData = app.util.getErrorMsg(res)
      let errorMsg = errorData.content
      if (errorMsg == '') {
        errorMsg = "绑定手机号码失败"
      }
      app.util.showTip(that, errorMsg)
    })
  },

})