const __config = require('../utils/constant');

/**
 * @param param 
 *              {
 *                  method:'get',
 *                  failToast:'定制了fail  toast内容',
 *                  successToast:'定制了 success toast内容'',
 *                  data:{
 *                          id:2,
 *                          userNo:1234
 *                       }
 *                  loading:false    
 *              }
 * @param path  
 * @param callback function[]
 * 
 */
const wxRequest = (param, path, ...fn) => {
    const session = getApp().session;
    //show loading dialog
    let hideToast = false //是否已经隐藏了toast
    const upload = param.requestType && param.requestType === 'upload'
    if (!param.loading) {
        wx.showToast({
            title: upload ? "上传中...." : "加载中...",
            icon: "loading",
            duration: 10000
        })
    }
    let url = __config.BASE_URL + path + '?platform=3&sys_version=2.1&api_version=15&_key=' + session.getUserKey()

    let requestParam = new Object();
    if (param) {
        requestParam.url = url;
        if (upload) {
            //上传请求
            requestParam.filePath = param.filePath
            requestParam.name = 'file'
        } else {
            // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            requestParam.method = param.method || 'GET';
            // 设置请求的 header
            requestParam.header = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            requestParam.data = param.data || {}
        }
    } else {
        console.debug('that param is null')
        return
    }

    //设置success callback
    if (fn[0]) {
        requestParam.success = res => {
            if (!param.loading) {
                //先把请求过程中的loading弹窗隐藏，因为外部的success方法有可能toast
                wx.hideToast();
                hideToast = true
            }
            if (res.statusCode >= 200 && res.statusCode < 300) {
                if (upload) {
                    var data = JSON.parse(res.data)
                    res.data = data
                }
                if (res.data.status == 1) {
                    typeof fn[0] === 'function' && fn[0](res);
                } else if (res.data.code == 103) {
                    //没登录，key过期了
                    getApp().relogin(resSuccess => {
                        wxRequest(param, path, ...fn)
                    }, resFail => {
                        if (fn[1]) {
                            typeof fn[1] === 'function' && fn[1](res);
                        }
                    })
                } else if (fn[1]) {
                    typeof fn[1] === 'function' && fn[1](res);
                }
            } else if (fn[1]) {
                typeof fn[1] === 'function' && fn[1](res);
            }
        }
    } else {
        console.debug('Don\'t have success callback')
        return
    }

    //设置fail callback
    if (fn[1]) {
        requestParam.fail = res => {
            if (!param.loading) {
                //先把请求过程中的loading弹窗隐藏，因为外部的success方法有可能toast
                wx.hideToast();
                hideToast = true
            }
            typeof fn[1] === 'function' && fn[1](res);
        }
    }

    //seting complete callback
    if (fn[2]) {
        requestParam.complete = res => {
            if (!param.loading && !hideToast) {
                wx.hideToast();
            }
            typeof fn[2] === 'function' && fn[2](res)
        }
    } else {
        requestParam.complete = res => {
            if (!param.loading && !hideToast) {
                wx.hideToast();
            }
            if (res.statusCode != 200 && param.failToast) {
                wx.showToast(param.failToast)
            } else if (param.successToast) {
                wx.showToast(param.successToast)
            }
        }
    }
    if (upload) {
        wx.uploadFile(requestParam)
    } else {
        wx.request(requestParam)
    }
}


module.exports = {
    wxRequest
}