// pages/create_club/create_club.js
var app = getApp()
var clubApi = app.api("clubApi")
var userApi = app.api("userApi")
var systemApi = app.api("systemApi")

Page({
  data: {
    choose: '请选择',
    input: '输入',
    txt: '写一段简介描述你的俱乐部吧',

    modalShowStyle: "",
    authCode: "",
    status: 0, //0: 显示发送验证码的按钮 1: 倒数中
    time: 30, //倒计时
    interval: "",

    logo: "",
    remoteLogo: "",
    name: "",
    location: "",
    cityId: "",
    setupTime: "",
    feature: "",
    slogan: "",
    desc: "",
    charger: "",
    phone: ""
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
          logo: tempFilePaths[0]
        })
      }
    })
  },

  //俱乐部名称
  clickName() {
    app.wxService("club/modify/clubName/clubName")
  },

  //所在地
  clickLocation() {
    app.wxService("club/modify/")
  },

  //创立时间
  clickSetupTime() {
    //app.wxService("club/modify/")
  },

  //主打项目
  clickFeature() {
    app.wxService("club/modify/masterProjects/masterProjects")
  },

  //宣言
  clickSlogan() {
    app.wxService("club/modify/declaretion/declaretion")
  },

  //简介
  clickDesc() {
    app.wxService("club/modify/description/description")
  },
  //负责人
  inputCharger(e) {
    this.data.charger = e.detail.value
  },
  //联系方式
  inputPhone(e) {
    this.data.phone = e.detail.value
  },

  validate() {
    let errorMsg = ''
    if (this.data.name == '') {
      errorMsg = '俱乐部名称不能为空'
    } else if (this.data.cityId == '') {
      errorMsg = '俱乐部所在地不能为空'
    } else if (this.data.feature == '') {
      errorMsg = '俱乐部主打项目不能为空'
    } else if (this.data.slogan == '') {
      errorMsg = '俱乐部宣言不能为空'
    } else if (this.data.desc == '') {
      errorMsg = '俱乐部简介不能为空'
    } else if (this.data.charger == '') {
      errorMsg = '负责人不能为空'
    } else if (this.data.phone == '') {
      errorMsg = '联系号码不能为空'
    }
    if (errorMsg != '') {
      app.wxService.showToast(errorMsg)
      return false
    }
    //校验通过
    return true
  },

  createClub() {

    const data = this.data

    //todo remove test data 
    // let testlogo = "https://cdn.51julebu.com/club/img/170212/c00135e941674ea79901a4c86f15f200.jpg"
    // data.remoteLogo = testlogo
    data.name = "小程序俱乐部而"
    //data.logo = data.remoteLogo
    data.desc = "哈哈哈"
    data.slogan = "这是是咯共"
    data.cityId = "351"
    data.need_join_check = "0"
    data.charger = "温嘉辉"
    data.phone = "15692004550"
    data.feature = '1001'

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

    clubApi.createClub({
        method: 'POST',
        data: {
          title: data.name,
          logo: data.remoteLogo,
          description: data.desc,
          slogan: data.slogan,
          city_id: data.cityId,
          need_join_check: "0",
          contact_name: data.charger,
          contact_tel: data.phone,
          feature: data.feature
        }
      }, res => {
        //成功
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
        app.wxService.showToast(errorData.title + "," + errorData.content)
      })
  },

  uploadLogo() {
    let localPath = this.data.logo
    systemApi.uploadImage(localPath, res => {
      console.log(res)
      let remoteUrl = res.data.url

    }, res => {
      //上传图片失败
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
        let leftTime = that.data.time - 1;
        if (leftTime > 0) {
          that.setData({
            time: leftTime
          })
        } else {
          clearInterval(interval)
          that.setData({
            status: 0
          })
        }
      }, 1000)
      this.setData({
        modalShowStyle: "opacity:1;pointer-events:auto;",
        status: 1,
        time: 30,
        interval: interval
      })
    }, res => {
      let errorData = app.util.getErrorMsg(res)
      let errorMsg = errorData.content
      if (errorMsg == '') {
        errorMsg = "发送验证码失败"
      }
      app.wxService.showToast(errorMsg)
    })
  },

  sendNum() {
    //点击发送验证码
    this.bindPhone()
  },

  titleInput(e) {
    //输入验证码
    this.data.authCode = e.detail.value
  },

  touchCancel() {
    //点击取消
    clearInterval(this.data.interval)
    this.setData({
      modalShowStyle: ""
    })
  },

  touchAddNew() {
    let that = this
    if (this.data.authCode == '') {
      app.wxService.showToast('验证码不能为空')
      return
    }
    clearInterval(this.data.interval)
    //点击确定
    this.setData({
      modalShowStyle: ""
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
      app.wxService.showToast(errorMsg)
    })
  },

})