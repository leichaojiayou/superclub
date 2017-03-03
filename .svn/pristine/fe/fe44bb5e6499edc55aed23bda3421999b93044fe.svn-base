//app.js
const __api = require('api/api');

const __service = require('utils/wxService');
const __session = require('utils/session');
const __utils = require('utils/util')
const __config = require('utils/constant');

App({
  onLaunch: function () {

  },

  // getUserInfo: function (cb) {
  //   var that = this
  //   if (this.globalData.userInfo) {
  //     typeof cb == "function" && cb(this.globalData.userInfo)
  //   } else {
  //     //调用登录接口
  //     let loginParam = new Object();
  //     wx.login({
  //       success: function (res) {
  //         loginParam.code = res.code;
  //         wx.getUserInfo({
  //           success: function (res) {
  //             that.globalData.userInfo = res.userInfo
  //             typeof cb == "function" && cb(that.globalData.userInfo)
  //             //set userInfo
  //             loginParam.encryptedData = res.encryptedData;
  //             loginParam.iv = res.iv;
  //             that.globalData.loginParam = loginParam
  //             that.getLoginParam(loginParam, that.session);
  //           }
  //         })
  //       }
  //     })
  //   }
  // },

  // getLoginParam: (param, obj) => {
  //   wx.request({
  //     url: __config.LOGIN_URL,
  //     data: param,
  //     success: (res) => {
  //       if (res.statusCode == 200) {
  //         let data = res.data;
  //         if (data.status != 0) {
  //           obj.saveUserInfo(data.user, data._key)
  //         } else {
  //           obj.setCode(data.code, data.status)
  //         }
  //       }
  //     }
  //   });
  // },

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
})