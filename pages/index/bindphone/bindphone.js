// pages/bindphone_page/bindphone_page.js
var app = getApp()
var userApi = app.api("userApi")

Page({
  data: {
    status: 1, // 1:输入手机号码， 2: 显示输入验证码 3: 验证中
    phone: "",
    code: "",
    time: 30,
    interval: "",
    timing: true
  },

  onLoad: function (options) {

  },

  contentInput: function (e) {
    if (this.data.status == 1) {
      // 输入手机号码
      this.setData({
        phone: e.detail.value
      })
    } else {
      //输入验证码
      this.setData({
        code: e.detail.value
      })
    }
  },

  sendCode: function () {
    let that = this
    let phone = this.data.phone
    if (phone.length != 11) {
      app.util.showTip(this, "手机号不合法")
      return
    }
    userApi.sendAuthCode({
      method: 'POST',
      data: {
        phone: phone,
        auth_type: 2,
      }
    }, res => {
      app.util.showTip(this, "已发送验证码到手机，请注意查收！")
      let interval = setInterval(() => {
        let leftTime = that.data.time - 1
        if (leftTime > 0) {
          that.setData({
            time: leftTime
          })
        } else {
          clearInterval(interval)
          that.setData({
            timing: false,
            time: 30
          })
        }
      }, 1000)
      that.setData({
        interval: interval,
        status: 2,
        timing: true
      })
    }, res => {
      let errorData = app.util.getErrorMsg(res)
      let errorMsg = errorData.content
      if (errorMsg == '') {
        errorMsg = "发送验证码失败"
      }
      app.util.showTip(this, errorMsg)
    })
  },

  checkCode: function () {
    let that = this
    let code = this.data.code
    let phone = this.data.phone
    if (code == '') {
      app.util.showTip(this, "请填写验证码")
      return
    }
    this.setData({
      status: 3
    })
    userApi.bindPhone({
      method: 'POST',
      data: {
        code: code,
        phone: phone
      }
    }, res => {
      //绑定手机成功, 重新登录一下
      getApp().relogin(res => {
        app.wxService.navigateBack(1)
      })
    }, res => {
      that.setData({
        status: 2
      })
      let errorData = app.util.getErrorMsg(res)
      let errorMsg = errorData.content
      if (errorMsg == '') {
        errorMsg = "验证失败"
      }
      app.util.showTip(this, errorMsg)
    })
  },

  viewAgreement() {
    app.wxService.showModal({
      title: '提示',
      content: '请用浏览器访问https://im.51julebu.com/resource/pages/protocol_supperClub.html',
      showCancel: false
    })
  },

  onUnload: function () {
    clearInterval(this.data.interval)
  }
})