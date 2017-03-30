const api = require("./request");
class ClubApi {
    constructor() { }

    /**
     * 审核是否允许加入俱乐部
     * http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubMemeberJoinCheck
     * club_id     俱乐部ID
     * user_id     操作对象的用户ID
     * flag         操作（1：通过 -1：拒绝）
     */
    verfiyClubMemberJoin(param, ...fn) {
        api.wxRequest(param, "/ba/club/memeber/join/check", ...fn)
    }

    /**
     * 俱乐部险情，小程序的管理员查看:http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubDetail
     *
     * club_id或者club_no至少一个
     */
    clubDetailLite(param, ...fn) {
        api.wxRequest(param, "/ba/club/detail/lite", ...fn);
    }

    /**
     * 检查是否有权限创建俱乐部
     * http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubCreateCheckDoc
     */
    createClubCheck(param, ...fn) {
        api.wxRequest(param, "/ba/club/create/check", ...fn)
    }

    /**
     * 创建俱乐部: http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubCreateDoc
     */
    createClub(param, ...fn) {
        api.wxRequest(param, "/ba/club/create", ...fn)
    }

    /**
     * 我加入的俱乐部: http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubHomeListDoc
     */
    myClubs(param, ...fn) {
        api.wxRequest(param, "/ba/club/home/list", ...fn)
    }

    /**
     * 待办事项（小程序）
     * 俱乐部管理消息: http://doc.iweju.com/FitNesse.WejuBaHttp.ClubDoc.ClubMemeberJoinList
     *
     */
    clubMemberJoinMessages(param, ...fn) {
        api.wxRequest(param, "/ba/club/memeber/join/list", ...fn)
    }

    /**
     * 用户管理的俱乐部活动：
     * http://doc.iweju.com/FitNesse.WejuBaHttp.V222Doc.ActTest.ActivityAdminManageByUser222Doc
     */
    clubActs(param, ...fn) {
        api.wxRequest(param, "/ba/club/detail/tab/act/list", ...fn)
    }

    /**
     * 俱乐部详情
     */
    clubIndex(param, ...fn) {
        api.wxRequest(param, "/ba/club/detail/lite", ...fn)
    }

    /**
     * 俱乐部重名检查
     */
    uniquenClubName(param, ...fn) {
        api.wxRequest(param, "/ba/club/title/check", ...fn)
    }

    /**
     * /ba/club/edit
     */
    modifyClub(param, ...fn) {
        api.wxRequest(param, "/ba/club/edit", ...fn)
    }
    /**
     * 删除俱乐部
     */
    clubDeleted(param, ...fn) {
        api.wxRequest(param, "/ba/club/delete", ...fn)
    }

    /**
     * 退出俱乐部
     */
    clubQuited(param, ...fn) {
        api.wxRequest(param, "/ba/club/memeber/quit", ...fn)
    }

    /**
     * 加入俱乐部
     */
    clubJoined(param, ...fn) {
        api.wxRequest(param, "/ba/club/memeber/join", ...fn)
    }

    masterProjects(param, ...fn) {
        api.wxRequest(param, "/ba/club/attr/list", ...fn)
    }

    /**
     * 设置收款账号
     */
    accountPayeeType(param, ...fn) {
        api.wxRequest(param, "/ba/club/payeeType/update", ...fn)
    }

    /**
     * 俱乐部成员列表
     */
    memeberList(param, ...fn) {
        api.wxRequest(param, "/ba/club/memeber/list", ...fn)
    }

    /**
     * 俱乐部成员角色任免
     */
    memeberRole(param, ...fn) {
        api.wxRequest(param, "/ba/club/member/role/change", ...fn)
    }

    /**
     * 	俱乐部管理
     */
    memberRemove(param, ...fn) {
        api.wxRequest(param, "/ba/club/member/remove", ...fn)
    }

    /**
     * 批量查询最近的俱乐部列表
     */
    recentClubs(clubs, ...fn) {
        let club_ids = clubs.join(',')
        let param = {
            method: 'POST',
            loading: true,
            data: {
                club_ids: club_ids
            }
        }
        api.wxRequest(param, "/ba/club/detail/lite/batch", ...fn)
    }
    cityList(param,...fn){
        api.wxRequest(param, "/ba/city/list", ...fn)
    }
}

module.exports = ClubApi