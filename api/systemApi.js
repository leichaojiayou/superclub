const api = require("./request");
class System {
    constructor() {}

    /**
     * 根据经纬度查询所在的城市
     * lat, lng
     */
    locationConvert(param, ...fn) {
        api.wxRequest(param, "/ba/club/geocode", ...fn);
    }

    /**
     * path: 图片的本地路径
     * 
     * 在success的res获取上传后的路径
     * let remoteUrl = res.data.url
     */
    uploadImage(path, ...fn) {
        let param = {}
        param.requestType = "upload"
        param.filePath = path
        api.wxRequest(param, "/upload", ...fn);
    }

    /**
     * 加载系统的活动消息
     * http://doc.iweju.com/FitNesse.WejuBaHttp.BindDoc.SysMessageListDoc
     */
    loadSystemMsg(clubId, ...fn) {
        let param = {}
        param.loading = true
        param.data = {}
        param.data.clubId = clubId
        api.wxRequest(param, "/ba/sys/applet/message/list", ...fn);
    }

    /**
     * 生成二维码
     * http://doc.iweju.com/FitNesse.WejuBaHttp.BindDoc.WxAppQrCodeDoc
     */
    createQrCode(path, ...fn) {
        let param = {}
        param.data = {}
        param.data.path = path
        api.wxRequest(param, "/ba/sys/wxapp/qrcode", ...fn);
    }
}

module.exports = System