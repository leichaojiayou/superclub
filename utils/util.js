function formatTime(date) {
    return __formatTime(date, 0);
}

/**
 * 比较2个时间
 *
 * @param date t1 开始时间
 * @param date t2 结束时间
 *         return ture t1>t2
 * */
function compareDate(t1, t2) {
    let flag = false;
    if (t2) {
        if (t1.getTime() > t2.getTime()) {
            flag = true;
        }
    } else {
        if (t1.getTime() > new Date().getTime()) {
            flag = true;
        }
    }
    return flag;
}

/**
 * 格式化为 MM-dd  HH:ss
 */
function formatTime2(milliseconds, type) {
    return __formatTime(milliseconds, 2, type);
}

/**
 * 格式化时间为2017.1.1
 * @param milliseconds 毫秒数
 */
function formatTime3(milliseconds) {
    return __formatTime(milliseconds, 3);
}
/**
 * 格式化时间为2017年9月29日 20:18
 * @param milliseconds 毫秒数
 */
function formatTime4(milliseconds) {
    return __formatTime(milliseconds, 4);
}

/**
 * 格式化为 yy月dd日  MM:ss
 */
function formatTime5(milliseconds) {

    return __formatTime(milliseconds, 5);
}

/**
 * 格式化时间为2017-09-29 20:18:20
 * @param milliseconds 毫秒数
 */
function formatTime6(milliseconds) {
    return __formatTime(milliseconds, 6);
}

/**
 * 格式化时间为2017-09-29 20:18
 * @param milliseconds 毫秒数
 */
function formatTime7(milliseconds) {
    return __formatTime(milliseconds, 7);
}

/**
 * 1分钟：刚刚
 * 1小时：N分钟前
 * 当天：N小时前
 * 昨天：昨天 HH:mm
 * N天前：MM-dd HH:mm
 * 去年：yyyy-MM-dd HH:mm
 */
function formatTime8(milliseconds) {
    let now = Date.now();
    if (milliseconds > now) {
        return '错误时间';
    }
    let dt = now - milliseconds;
    if (dt < 60000) {
        return '刚刚';
    } else if (dt < 3600000) {
        return parseInt(dt / 60000) + '分钟前';
    } else if (dt < 1000 * 60 * 60 * 24) {//小时前
        return parseInt(dt / (1000 * 60 * 60)) + '小时前';
    } else if (dt < 1000 * 60 * 60 * 48) {//昨天
        let date = new Date(dt - 1000 * 60 * 60 * 24);
        let hour = date.getHours();
        let minute = date.getMinutes();
        return '昨天 ' + [hour, minute,].map(formatNumber).join(':');
    } else if (dt < 1000 * 60 * 60 * 24 * 365) {//今年内
        return formatTime2(milliseconds, 2);
    } else {
        return formatTime7(milliseconds, 7);
    }
}


/**
 * 格式化为 yy月dd日  MM:ss
 */
function formatTime9(milliseconds) {
    return __formatTime(milliseconds, 9);
}

function __formatTime(milliseconds, type, ft) {
    let date = milliseconds, format = '';
    if (typeof milliseconds != 'object') {
        date = new Date(milliseconds);
    }

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    switch (type) {
        case 0:
            format = [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
            break;
        case 2:
            if (ft) {
                format = [month, day].map(formatNumber).join('-');
            } else {
                format = [month, day].map(formatNumber).join('-') + ' ' + [hour, minute,].map(formatNumber).join(':')
            }
            break;
        case 3:
            format = [year, month, day].map(formatNumber).join('.');
            break;
        case 4:
            format = [year, month, day].map(formatNumber).join('.') + ' ' + [hour, minute].map(formatNumber).join(':');
            break;
        case 5:
            format = [month].map(formatNumber) + '月' + [day].map(formatNumber) + '日' + ' ' + [hour, minute].map(formatNumber).join(':')
            break;
        case 6:
            format = [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
            break;
        case 7:
            format = [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
            break;
        case 9:
            format = [month].map(formatNumber) + '-' + [day].map(formatNumber) + ' ' + [hour, minute].map(formatNumber).join(':')
            break;
    }
    return format;
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
 * cent: 单位分
 * 输入0 => 免费
 * 输入金额(901) => ￥9.01
 */
function formatMoney(cent) {
    if (cent == 0) return '免费'
    let yuan = Number.parseInt(cent / 100)
    let jiao = Number.parseInt((cent - yuan * 100) / 10)
    let cen = cent - yuan * 100 - jiao * 10
    return '¥' + yuan + '.' + jiao + cen
}

/**
 * cent: 单位分
 * 输入金额(901) => ￥9.01
 */
function realformatMoney(cent) {
    if (cent == 0) return '¥0'
    let yuan = Number.parseInt(cent / 100)
    let jiao = Number.parseInt((cent - yuan * 100) / 10)
    let cen = cent - yuan * 100 - jiao * 10
    return '¥' + yuan + '.' + jiao + cen
}

/**
 * 获取网络错误信息描述
 * @param res
 * @returns {*}
 */
function getErrorMsg(res) {
    const statusCode = res.statusCode;
    const status = res.data.status;
    const code = res.data.code;
    const msg = res.data.msg;
    if (statusCode < 200 && statusCode > 299) {
        let errorContent = '';
        if (statusCode < 200) {
            errorContent = '指示信息，表示请求已接收，继续处理';
        } else if (statusCode < 400) {
            errorContent = '重定向，要完成请求必须进行更进一步的操作';
        } else if (statusCode < 500) {
            errorContent = '请求有语法错误、无法连接服务器或服务器拒绝服务';
        } else {
            errorContent = '服务器端错误，服务器未能实现合法的请求';
        }
        return {
            title: statusCode + '错误',
            content: errorContent
        };
    } else if (status != 1) {
        if (msg) {
            return {
                title: '错误代码：' + code,
                content: msg
            };
        } else {
            return {
                title: '错误代码：' + code,
                content: '服务器未返回错误描述'
            };
        }
    } else { //请求成功
        return {
            title: '' + code,
            content: ''
        };
    }

}

/**
 * @param key
 *       _lv0 ~ _lv5 club stars
 *       lv0 lv1 lv6 member ioc
 *       '' cnd url
 *        score
 *        role
 *
 * @param flag
 *        true : member ioc
 *        false :stars ioc
 *
 * @returns cnd image url
 */
function getClubImg(key, flag) {
    const config = require('./constant');
    let cdnUrl = config.CDN_URL + '/xiaochengxu/image/', starsMap = new Map(), imgUrl = '';
    starsMap.set('_lv0', 'stars.png');
    starsMap.set('lv98', '@2x.png');
    starsMap.set('lv99', '@2x2.png');

    function getMemberRole(key, imgUrl) {
        switch (key) {
            case 1:
                imgUrl = 'lv0' + starsMap.get('lv98');
                break;
            case 2:
            case 3:
                imgUrl = 'lv1' + starsMap.get('lv98');
                break;
            case 4:
                imgUrl = 'lv6' + starsMap.get('lv98');
                break;
        }
        return imgUrl;
    }

    function getClubStars(key, imgUrl) {
        if (!key&&key!=0) {
            return imgUrl;
        }
        if (key < 200) {
            imgUrl += 'stars' + starsMap.get('lv99');
        } else if (key < 600) {
            imgUrl += 'clubstar/lv1' + starsMap.get('lv99');
        } else if (key < 2000) {
            imgUrl += 'clubstar/lv2' + starsMap.get('lv99');
        } else if (key < 5000) {
            imgUrl += 'clubstar/lv3' + starsMap.get('lv99');
        } else if (key < 10000) {
            imgUrl += 'clubstar/lv4' + starsMap.get('lv99');
        } else {
            imgUrl += 'clubstar/lv5' + starsMap.get('lv99');
        }
        return imgUrl;
    }

    if (flag && key) {
        imgUrl = getMemberRole(key, imgUrl);
    } else {
        imgUrl = getClubStars(key, imgUrl);
    }

    return cdnUrl + imgUrl;
}

/**
 * 封装后的toast 
 * @param that 页面tap事件函数中的 this
 * @param txt 你想要提醒的方式
 * @param time  hide 时间
 * 
 */
function showTip(that, txt, time) {
    try {
        time = Number(time) || 3000;
    } catch (e) {
        console.error('NANA');
    }

    if (typeof txt != 'string' || !txt) return;
    that.setData({
        'showTipTxt': txt,
        'tipHidden': 'display:block;'
    })
    setTimeout(function () {
        that.setData({
            'showTipTxt': '',
            'tipHidden': 'display:none;'
        })
    }, time)
}

module.exports = {
    formatTime: formatTime,
    formatTime2: formatTime2,
    getErrorMsg: getErrorMsg,
    compareDate: compareDate,
    formatTime3: formatTime3,
    formatTime4: formatTime4,
    formatTime5: formatTime5,
    formatTime6: formatTime6,
    formatTime7: formatTime7,
    formatMoney: formatMoney,
    getClubImg: getClubImg,
    formatTime8: formatTime8,
    formatTime9: formatTime9,
    showTip: showTip,
    realformatMoney:realformatMoney,
}