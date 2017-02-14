const api = require("./request");
class Manage{
    constructor(){
    }
    /*
     *管理活动之基本信息 http://doc.iweju.com/FitNesse.WejuBaHttp.V15Doc.ActivityAdminDetail
     *请求参数:activity_id
     */
    getManageActivity(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/detail',...fn)
    }

    //打开报名
    openApply(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/open',...fn)
    }

    //关闭报名
    closeApply(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/close',...fn)
    }

    //所有报名成员,请求参数 activity_id,start,count
    getAllApplyList(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/apply/list_all',...fn)
    }

    //一组的成员，参数：group_id  start ,count
    getGroupMembers(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/apply_by_groupid/list',...fn)
    }

    //编辑分组的名字 group_name group_id
    editGroupName(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/group/rename',...fn)
    }

    //删除分组 group_id
    deleteGroupName(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/group/delete',...fn)
    }
}
module.exports = Manage