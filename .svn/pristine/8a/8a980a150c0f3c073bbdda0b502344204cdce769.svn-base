const api = require("./request");
class User {
    constructor() {}
    /**
     * 发送手机验证码:
     * http://doc.iweju.com/FitNesse.WejuBaHttp.V223optDoc.OperateDoc.AccountPhoneCodeSendDoc
     */
    sendAuthCode(param, ...fn) {
        api.wxRequest(param, "/ba/account/phone/code/send", ...fn)
    }


    /**
     * 小程序临时用户绑定手机号码
     * http://doc.iweju.com/FitNesse.WejuBaHttp.BindDoc.UserWxPhoneBindDoc
     */
    bindPhone(param, ...fn) {
        api.wxRequest(param, "/ba/user/phone/bind", ...fn)
    }

    /**
     * 小程序登陆: http://doc.iweju.com/FitNesse.WejuBaHttp.BindDoc.UserWxLoginDoc
     * 请求参数： code， encryptedData，iv
     */
    login(param, ...fn) {
        api.wxRequest(param, "/ba/user/wxlogin", ...fn)
    }

    /**
     * 查看自己参与的俱乐部列表: http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubHomeListDoc
     */
    joinedClubs(param, ...fn) {
        api.wxRequest(param, "/ba/club/home/list", ...fn)
    }
    /**
     * 微信绑定账号的检查: 
     */
    phoneCheck(param, ...fn) {
        api.wxRequest(param, "/ba/account/phone/login/check", ...fn)
    }

    /**
     * 我加入的俱乐部: http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubHomeListDoc
     */
    myClubs(params, ...fn) {
        api.wxRequest(params, "/ba/club/home/list", ...fn)
    }
}

module.exports = User