const api = require("./request");
class ActApi {
    constructor() {
    }
    /**
     * 活动详情-报名列表
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityAdminApplyList
     * @param param  activity_id；start；count
     */
    getActApplyList (param,...fn){
        api.wxRequest(param, "/ba/activity/applet/apply_list",...fn);
    }

    /**
     * 活动详情
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityAdminGetActivity
     * @param param activity_id；club_id
     */
    getActDetail (param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/get_activity',...fn);
    }
    /**
     * 活动评论列表
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityCommentList
     * @param param  activity_id；start；count
     */
    getActComment(param,...fn)  {
        api.wxRequest(param, '/ba/activity/applet/comment_list',...fn);
    }
    /**
     * 创建活动评论
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityCreateComment
     * @param param activity_id；content；refCommentId:评论人ID
     */
    createActComment (param,...fn){
        api.wxRequest(param, '/ba/activity/applet/create_comment',...fn);
    }

    /**
     * 点赞列表
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityLikeList
     * @param param activity_id；start；count
     */
    getLikeList(param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/like_list',...fn);
    }

    /**
     * 点赞or取消点赞操作
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityLikeAndDeleteLike
     * @param param  activity_id：活动ID；type：类型, 0为点赞, 1为取消赞
     */
    likeAction (param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/like',...fn);
    }

    /**
     * 自己报名接口
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplySelf
     * @param param
     * activity_id：活动ID；
     * data：报名数据；
     * ticket_id：票种ID；
     * paid：付款状态, 0为未付款, 1为已付款
     * phone ：当自己报名时, 自己的手机号码
     * authCode ： 验证码
     * applyPlatform： 用户报名所使用的平台, 0为APP(默认), 1为电脑WEB, 2为手机WEB
     * groupNum ：队伍ID
     * groupName  ：队伍名
     * isLeader ： 是否是队长
     * isAuthPhone：是否打开手机验证开关
     */
    actApplySelf (param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/apply_self',...fn);
    }

    /**
     * 帮人报名
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplyHelp
     * @param param 参数同自己报名
     */
    actApplyHelp (param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/apply_help',...fn);
    }

    /**
     * 报名详情
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplyDetail
     * @param param  applyID
     */
    applyDetail  (param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/apply/detail',...fn);
    }

    /**
     * 用户自己修改报名信息
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplyUpdate
     * @param param
     * actID：活动ID；
     * applyID：报名id
     * ticketID：票种ID
     * paid：付款状态, 0为未付款, 1为已付款
     * phone ：当自己报名时, 自己的手机号码
     * authCode ： 验证码
     * groupNum ：队伍ID
     * groupName  ：队伍名
     * isLeader ： 是否是队长
     * isAuthPhone：是否打开手机验证开关
     * data：报名数据
     */
    updateApplyInfoSelf (param,...fn)  {
        api.wxRequest(param, '/ba/activity/applet/apply/update',...fn);
    }

    /**
     * 用户自己取消报名
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplyCancel
     * @param param actID；applyID；reason：取消报名原因
     */
    cancelApplySelf (param,...fn)  {
        api.wxRequest(param, '/ba/activity/applet/apply/cancel',...fn);
    }

    /**
    * 用户管理的活动列表
    * http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityAdminManageByUser
    */
    manageActs(param, ...fn) {
        api.wxRequest(param, '/ba/activity/admin/manage_by_user', ...fn)
    }

    /**
    * 报名活动的人数
    * http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityApplyListAll
    */
    actMembers(param, ...fn) {
        api.wxRequest(param, '/ba/activity/admin/apply/list_all', ...fn)
    }

    /**
     * 活动群发短信
     * http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityAdminSendSms
     * mobile	电话号码
     * apply_ids	报名者的ID列表
     * activity_id	活动ID
     * content 短信内容
     */
    sendActGroupMsg(param, ...fn) {
        api.wxRequest(param, '/ba/activity/admin/send_sms', ...fn)
    }


    /**
     * 热门活动列表
     * http://doc.iweju.com/FitNesse.WejuBaHttp.V190Doc.ActTest.ActivityListSameCity190Doc
     */
    hotActs(param, ...fn) {
        api.wxRequest(param, '/ba/activity/list/hot', ...fn)
    }

    /**
     * 获取活动报名用户填写表单数据信息
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityGetApplyForm
     */
    getApplyInfo(param, ...fn) {
        api.wxRequest(param, "/ba/activity/applet/apply/get_apply_form", ...fn);
    }
}
/**
 * Created by liujinqiang on 2017/2/6.
 */

module.exports = ActApi