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
}

module.exports = System