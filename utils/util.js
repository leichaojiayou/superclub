function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 比较2个时间 
 * 
 * @param date t1 开始时间 
 * @param date t2 结束时间
 *         return ture t1>t2 
 * */
function compareDate(t1,t2) {
    let flag = false;
    if(t2){
        if(t1.getTime() > t2.getTime()){
            flag = true;
        }
    }else{
        if(t1.getTime() > new Date().getTime()){
            flag = true;
        }
    }
    return flag;
}

/**
 * 格式化为 yy-dd  MM:ss
 */
function formatTime2(milliseconds) {
    let date = new Date(milliseconds)

    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()

    return [month, day].map(formatNumber).join('-') + ' ' + [hour, minute,].map(formatNumber).join(':')
}

/**
 * 格式化时间为2017.1.1
 * @param milliseconds 毫秒数
 */
function formatTime3(milliseconds) {
    let date = new Date(milliseconds);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('.');
}
/**
 * 格式化时间为2017年9月29日 20:18
 * @param milliseconds 毫秒数
 */
function formatTime4(milliseconds) {
    let date = new Date(milliseconds);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('.') + ' ' + [hour, minute].map(formatNumber).join(':');
}

/**
 * 格式化为 yy月dd日  MM:ss
 */
function formatTime5(milliseconds) {
    let date = new Date(milliseconds)

    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()

    return [month].map(formatNumber) + '月' + [day].map(formatNumber) + '日' + ' ' + [hour, minute].map(formatNumber).join(':')
}

/**
 * 格式化时间为2017-9-29 20:18:20
 * @param milliseconds 毫秒数
 */
function formatTime6(milliseconds) {
    let date = new Date(milliseconds);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute,second].map(formatNumber).join(':');
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
    if(cent == 0) return '免费'
    let yuan = Number.parseInt(cent / 100)
    let jiao = Number.parseInt((cent - yuan * 100) / 10)
    let cen = cent - yuan * 100 - jiao * 10
    return '￥' + yuan + '.' + jiao + cen
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

module.exports = {
    formatTime: formatTime,
    formatTime2: formatTime2,
    getErrorMsg: getErrorMsg,
    compareDate: compareDate,
    formatTime3: formatTime3,
    formatTime4: formatTime4,
    formatTime5: formatTime5,
    formatTime6: formatTime6,
	formatMoney: formatMoney,
}