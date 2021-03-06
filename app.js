//app.js
const __api = require('api/api');

const __service = require('utils/wxService');
const __session = require('utils/session');
const __utils = require('utils/util')
const __config = require('utils/constant');
const __event = require('utils/event');

App({
  onLaunch: function () {

  },

  /**
   * key过期，重新登录, 传入两个回调方法，成功和失败
   */
  relogin: (...fn) => {
    let succesCallBack = fn[0] ? fn[0] : res => {

    }
    let failCallBack = fn[1] ? fn[1] : res => {

    }
    wx.login({
      success: (res) => {
        if (res.code) {
          // 检查用户是否已经绑定超级俱乐部账号
          //https://mp.weixin.qq.com/debug/wxadoc/dev/api/open.html#wxgetuserinfoobject
          //获取微信用户信息, 获取encryptedData和iv
          wx.getUserInfo({
            success: (userRes) => {
              getApp().api("userApi").login({
                method: "POST",
                data: {
                  encryptedData: userRes.encryptedData,
                  iv: userRes.iv,
                  code: res.code
                }
              }, (res) => {
                let data = res.data;
                getApp().session.setKeyPrefix(data.user.userID + "_")
                getApp().session.saveUserInfo(data.user, data._key)
                succesCallBack(res)
              }, (res) => {
                failCallBack(res)
              })
            },
            fail: (res) => {
              failCallBack(res)
            }
          })
        } else {
          // weixin code empty
          failCallBack(res)
        }
      },
      fail: res => {
        failCallBack(res)
      }
    });
  },

  globalData: {
    userInfo: null,
    temp: {}
  },

  /**
   * 调用api 新方法
   * @param name
   *    eg:
   *      const actApi = getApp().actApi().api('actApi');
   *      actApi.getActApplyList('url',res=>{},res=>{},res=>{})
   */
  api(name) {
    return __api.factory(name)
  },

  wxService: new __service,
  session: new __session,
  util: __utils,
  event: new __event,
  config: __config,
})