/**
 * Created by liujinqiang on 2017/2/6.
 */
const api = require("./request");
class OriganizeApi {
    constructor() {
    }
    /**
 * 活动详情-报名列表
 * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityAdminApplyList
 * @param param  activity_id；start；count
 */
    getActApplyList(param,...fn) {
        api.wxRequest(param, "/ba/activity/applet/apply_list",...fn);
    }
    /**
     * 活动详情
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityAdminGetActivity
     * @param param activity_id；club_id
     */
    getActDetail(param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/get_activity',...fn);
    }
    /**
     * 活动评论列表
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityCommentList
     * @param param  activity_id；start；count
     */
    getActComment(param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/comment_list',...fn);
    }

    /**
     * 创建活动评论
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityCreateComment
     * @param param activity_id；content；refCommentId:评论人ID
     */
    createActComment(param,...fn) {
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
    likeAction(param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/likeanddeletelike',...fn);
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
    actApplySelf(param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/apply_self',...fn);
    }

    /**
     * 帮人报名
     * 文档：http://doc.iweju.com/FitNesse.WejuBaHttp.ActivityDoc.ActivityApplyHelp
     * @param param 参数同自己报名
     */
    actApplyHelp(param,...fn) {
        api.wxRequest(param, '/ba/activity/applet/apply_help',...fn);
    }

    /**
     * 活动参与人数: http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityAdminListAll
     */
    getActUsers(param,...fn) {
        api.wxRequest(param, "/ba/activity/admin/apply/list_all",...fn)
    }

     /**
     * 编辑活动: http://doc.iweju.com/FitNesse.WejuBaHttp.V221optDoc.ActivityDoc.ActivityDetail1221Doc
     */
    getActDetail(param,...fn) {
        api.wxRequest(param, "/ba/activity/detail",...fn)
    }

}

module.exports = OriganizeApi