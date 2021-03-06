const __config = require('constant');
class WxService {
    constructor(tempFilePaths) {
        this.tempFilePaths = []
    }

    __re() {
        if (!this.navigateToRe) {
            this.navigateToRe = /\.\/|\.\.\//
        }
        return this.navigateToRe;
    }

    /**
     * private function
     */
    __uploadImg(tempFilePaths, i, fn) {
        if (i < 9 && tempFilePaths.length < i) return
        const that = this;
        let tempFilePath = tempFilePaths[i++];
        if (tempFilePath) {
            let uploadObj = {};
            uploadObj.url = __config.UPLOAD_URL;
            uploadObj.filePath = tempFilePath;
            uploadObj.name = 'file'
            uploadObj.success = res => {
                if (res.statusCode != 200) return;
                that.__uploadImg(tempFilePaths, i, fn)
                let successObj = JSON.parse(res.data);
                that.tempFilePaths.push(successObj.url);
                if (i == tempFilePaths.length) {
                    fn(that.tempFilePaths)
                    // wx.hideToast();
                }

            }
            uploadObj.fail = res => {
                console.log(res)
            }
            wx.uploadFile(uploadObj)
        }
    }

    __setPageUrl(page_url, json) {
        page_url = '/pages/' + page_url;
        return this.__setParam(page_url, json);
    }

    __setParam(page_url, json) {
        if (json) {
            let paramSerializer = '';
            let parts = new Array();
            let temp = '';
            for (let key in json) {
                temp = key + '=' + json[key];
                parts.push(temp);
            }
            paramSerializer = parts.join('&')
            page_url += '?' + paramSerializer;
        }
        return page_url;
    }

    __setFn(obj, ...fn) {
        if (fn.length < 4) {
            for (let i = 0; i < fn.length; i++) {
                switch (i) {
                    case 0:
                        if (typeof fn[0] === 'function') {
                            obj.success = fn
                        }
                        break;
                    case 1:
                        if (typeof fn[1] === 'function') {
                            obj.fail = fn[1]
                        }
                        break;
                    case 2:
                        if (typeof fn[2] === 'function') {
                            obj.complete = fn[2]
                        }
                        break;
                }
            }
        }
        return obj
    }


    /**
     * 页面跳转方法
     * @param page_url 可以写出相对路径 或绝对路径
     *                 相对路径的写法:../../../index/index
     *                 绝对路径的写法:inde/index      
     * @param json
     *                  {
     *                      id:2,
     *                      userNo:1234
     *                  }
     * @param success
     *              success callback function
     *              res =>{
     *              
     *              }
     * @param fail
     *              success callback function
     *              res =>{
     *              
     *              }
     * 
     * return url
     *          /pages/index/index?id=2&userNo=1234
     */
    navigateTo(page_url, json, success, fail) {
        if (page_url) {

            if (typeof success != 'function') {
                success = rs => {
                    console.debug('this is a success callback');
                }
            }

            if (typeof fail != 'function') {
                fail = rs => {
                    console.debug('this is a fail callback');
                }
            }

            if (!this.__re().test(page_url)) {
                page_url = this.__setPageUrl(page_url, json);
            } else {
                page_url = this.__setParam(page_url, json);
            }

            wx.navigateTo({
                url: page_url,
                success: res => success(res),
                fail: res => fail(res)
            })
        }
    }

    //显示模态弹窗
    showModal(param, fn) {
        if (!param) return
        if (typeof fn === 'function') {
            param.success = fn
        } else {
            param.success = e => {
                console.debug('this is a success callback')
            }
        }
        wx.showModal(param)
    }

    showToast(message, duration = 3000) {
        wx.showToast({
            title: message,
            duration: duration
        })
    }

    /**
     * close current page and reverse back
     * @param page 
     */
    navigateBack(page) {
        let param = {
            delta: page || 1
        }
        wx.navigateBack(param);
    }

    /**
     * set navigate bar title
     * @param title
     * @param fn callback[]
     */
    setNavigationBarTitle(title, ...fn) {
        if (!title) return
        let param = {
            title: title
        }
        param = this.__setFn(param, ...fn);
        wx.setNavigationBarTitle(param);
    }

    /**
     * close current page and go to other page
     * @param url
     *           ../page
     * @param fn callback[]
     */
    redirectTo(url, ...fn) {
        if (url) {
            if (!this.__re().test(url)) {
                url = '/pages/' + url;
            }
            let param = {
                url: url
            }
            param = this.__setFn(param, ...fn);
            wx.redirectTo(param);
        }

    }

    /**
     * uploadImg
     * @param fn success callback function
     * @param count picture count
     */
    uploadImg(success, count) {
        this.tempFilePaths = [];
        const that = this;
        let imgage = {
            count: count || 9
        };
        imgage.success = res => {
            let tempFilePaths = res.tempFilePaths, i = 0;
            that.__uploadImg(tempFilePaths, i, res => {
                success(res)
                // console.log(res);
            })
        };
        wx.chooseImage(imgage)
    }

}
module.exports = WxService