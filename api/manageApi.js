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

    //移到到分组 target_groupid source_groupid activity_id applyIds
    moveToGroup(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/group/move',...fn)
    }

    //创建并移动到新分组 activity_id source_groupid new_group_name applyIds
    createGroup(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/group/move/create',...fn)
    }
    //审核通过，不通过 apply_ids action(1.审核通过 3.拒绝 4.审核不通过 5.取消) refuseReason
    auditApplys(param,...fn){
        api.wxRequest(param,'/ba/activity/apply/check',...fn)
    }

    //获取报名选项 activity_id
    getApplyFields(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/apply/base/detail',...fn)
    }

    //添加报名成员 activity_id data ticket_id paid (isLeader group_num group_name)
    addNewApply(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/apply/add',...fn)
    }

    //获取编辑资料  apply_id activity_id 
    getEditApplyInfo(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/apply/detail',...fn)
    }

    //拒绝报名 apply_id reason
    refusedApply(param,...fn){
        api.wxRequest(param,'/ba/activity/apply/admin/cancel',...fn)
    }

    //编辑报名信息 apply_id activity_id  data paid
    editApplyInfo(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/apply/modify',...fn)
    }
    //表格预览 activity_id type (1:报名表格 3:费用查看表格)
    applyFormPreview(param,...fn){
        api.wxRequest(param,'/ba/activity/applet/apply/export_preview',...fn)
    }

    //发送到邮箱 email type(1报名信息，2保险表格 3:费用) activity_id
    sendEmail(param,...fn){
        api.wxRequest(param,'/ba/activity/admin/send_email',...fn)
    }

    //生成二维码、 path
    getQrcode(param,...fn){
        api.wxRequest(param,'/ba/sys/wxapp/qrcode',...fn)
    }

    //保险模块 activity_id
    insuranceForPreview(param,...fn){
        api.wxRequest(param,'/ba/activity/applet/apply/insure/export_preview',...fn)
    }

    //activity_id type
    caculateShareCount(param,...fn){
        api.wxRequest(param,'/ba/activity/share',...fn)
    }
}
module.exports = Manage