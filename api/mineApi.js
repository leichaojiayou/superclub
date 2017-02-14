const api = require("./request");
class mineApi{
    constructor() {
    }
    /**
     * 用户报名活动列表: http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityApplyByUser
     * 请求参数：user_id;start;count
     */
    userApplyList(param,...fn) {
        api.wxRequest(param, "/ba/activity/applet/apply_by_user",...fn);
    }
    
    /**
     * 我的钱包账户: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyAccount
     * 请求参数：
     */
    moneyAccount(param,...fn) {
        api.wxRequest(param, "/ba/money/account",...fn)
    }

    /**
     * 收款列表: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyOrderProceedsList
     * 请求参数：start;count
     */
    proceedsList(param,...fn) {
        api.wxRequest(param, "/ba/money/order/proceeds/list",...fn)
    }

    /**
     * 收款详情: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyOrderProceedsDetail
     * 请求参数：activity_id
     */
    proceedsDetail(param,...fn) {
        api.wxRequest(param, "/ba/money/order/proceeds/detail",...fn)

    }

    /**
     * 订单详情: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyOrderFormDetail
     * 请求参数：order_id;flag
     */
    orderFormDetail(param,...fn) {
        api.wxRequest(param, "/ba/money/order/form/detail",...fn)

    }

    /**
     * 设置收款账户页列表: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyGatheraccountList
     * 请求参数：
     */
    gatherAccountList(param,...fn) {
        api.wxRequest(param, "/ba/money/gatheraccount/list",...fn)

    }

    /**
     * 设置收款账户: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyGatheraccountSubmit
     * 请求参数：real_name;account_no;account_type;bank_addr;bank_subname
     */
    setGatherAccount(param,...fn) {
        api.wxRequest(param, "/ba/money/gatheraccount/submit",...fn)

    }

    /**
     * 删除收款账户: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyGatheraccountDelete
     * 请求参数：account_id
     */
    deleteGatherAccount(param) {
        api.wxRequest(param, "/ba/money/gatheraccount/delete",...fn)

    }

    /**
     * 提现: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyWithdrawSubmit
     * 请求参数：real_name;idcard_right;idcard_back;idcard_withperson;account_type;account_no;account_id;amount
     */
    moneyWithdraw(param,...fn) {
        api.wxRequest(param, "/ba/money/withdraw/submit",...fn)

    }

    /**
     * 提现记录列表: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyWithdrawList
     * 请求参数：start;count
     */
    moneyWithdrawList(param,...fn) {
        api.wxRequest(param, "/ba/money/withdraw/list",...fn)

    }

    /**
     * 提现明细: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyWithdrawDetail
     * 请求参数：bill_id 
     */
    moneyWithdrawDetail(param,...fn) {
        api.wxRequest(param, "/ba/money/withdraw/detail",...fn)

    }

    /**
     * 身份验证提交: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyIdverifySubmit
     * 请求参数：real_name;idcard_right;idcard_back;idcard_withperson
     */
    idverify(param,...fn) {
        api.wxRequest(param, "/ba/money/idverify/submit",...fn)

    }

    /**
     * 交易记录列表: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyTradeRecordList
     * 请求参数：start;count
     */
    tradeRecordList(param,...fn) {
        api.wxRequest(param, "/ba/money/trade/record/list",...fn)

    }

    /**
     * 交易记录详情: http://doc.iweju.com/FitNesse.WejuBaHttp.MoneyDoc.MoneyTradeRecordDetail
     * 请求参数：trade_id
     */
    tradeRecordDetail(param,...fn) {
        api.wxRequest(param, "/ba/money/trade/record/detail")
    }

}

module.exports = mineApi