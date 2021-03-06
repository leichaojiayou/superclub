// pages/send_msg/send_msg.js
var app = getApp()
const actApi = app.api("actApi")

Page({
  data: {
    check: false,
    people: 0,
    max_length: 120, //最多输入的字数
    num_txt: 120,
    tips: '短信内容仅限于活动时间、地址、注意事项等重要提示。否则无法通过审核。用户无法回复本短信。短信经审核后由系统发送，请勿发送违法、反动内容。',
    msgContent: "",
    selectIds: 0,
    activityId: 0,
    delta: 0
  },

  onLoad(params) {
    let selectIds = params.selectIds
    let activityId = params.activityId
    this.data.selectIds = selectIds
    this.data.activityId = activityId
    this.data.delta = Number.parseInt(params.delta)

    let selectArray = selectIds.split(',')
    this.setData({
      people: selectArray.length
    })
  },

  //短信内容输入
  inputContentChange(e) {
    let content = e.detail.value
    let max = this.data.max_length
    this.setData({
      msgContent: content,
      num_txt: max - content.length
    })
  },

  //勾选发送给自己
  checkboxChange: function (e) {
    this.setData({
      check: e.detail.value[0] == 1,
    });
  },

  //发送短信
  formSubmit: function (e) {
    let msg = this.data.msgContent
    if (msg === '') {
      app.util.showTip(this, '短信内容不能为空')
      return
    }
    const phone = e.detail.value.input
    if (this.data.check) {
      //发送自己
      const check = /^1\d{10}$/
      if (phone === '') {
        app.util.showTip(this, '请输入手机号码')
        return
      } else if (!check.test(phone)) {
        app.util.showTip(this, '请输入正确手机号码')
        return
      }
    }
    var that = this
    actApi.sendActGroupMsg({
      data: {
        mobile: phone,
        apply_ids: this.data.selectIds,
        activity_id: this.data.activityId,
        content: this.data.msgContent
      }
    }, res => {
      app.wxService.showModal({
        title: '已提交审核',
        content: '审核后会自动发送。',
        showCancel: false,
      }, res => {
        wx.navigateBack({
          delta: that.data.delta + 2
        })
      })
    }), res => {
      let errorData = app.util.getErrorMsg(res)
      let errorMsg = errorData.content
      if (errorMsg == '') {
        errorMsg = '发送短信失败'
      }
      app.util.showTip(this, errorMsg)
    }
  },
})