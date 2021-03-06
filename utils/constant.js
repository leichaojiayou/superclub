/**
 * Created by liujinqiang on 2017/2/6.
 * 常量
 */
const BASE_URL = "https://tapi.51julebu.com";
const LOGIN_URL = 'https://tapi.51julebu.com/ba/user/wxlogin?api_version=15&platform=3';
const UPLOAD_URL = 'https://api.51julebu.com/upload';
const CDN_URL = 'https://cdn.51julebu.com';

const MSG_AUTH_FAIL = '[拒绝微信授权]将无法正常使用超级俱乐部，可尝试从您的小程序列表中删除超级俱乐部，重新搜索进去并授权'
const MSG_PROXY_NOT_SUPPORT = '暂不支持代理活动管理，请在超级俱乐部App或网页端进行管理'
const MSG_GROUP_NOT_SUPPORT = '暂不支持组队活动管理，请在超级俱乐部App或网页端进行管理'

/**
 * 编辑俱乐部信息 更改信息包括: title, logo, slogan, features
 */
const EVENT_CLUB_MODIFY = 'club_modify'

/**
 * 加入或者退出俱乐部
 */
const EVENT_CLUB_CHANGE = 'club_change'

/**
 * 发布或者删除活动, {actId, count}
 */
const EVENT_ACTIVITY_CHANGE = 'activity_change'

/**
 * 报名人数有更改, {actId, count}
 * count:负数则是取消多少人报名，正数则是帮多少人报名。0则是修改了报名信息
 */
const EVENT_APPLY_CHANGE = 'apply_change'

module.exports = {
  BASE_URL: BASE_URL,
  LOGIN_URL: LOGIN_URL,
  UPLOAD_URL: UPLOAD_URL,
  CDN_URL: CDN_URL,
  MSG_AUTH_FAIL: MSG_AUTH_FAIL,
  MSG_PROXY_NOT_SUPPORT: MSG_PROXY_NOT_SUPPORT,
  MSG_GROUP_NOT_SUPPORT: MSG_GROUP_NOT_SUPPORT,
  EVENT_CLUB_MODIFY: EVENT_CLUB_MODIFY,
  EVENT_ACTIVITY_CHANGE: EVENT_ACTIVITY_CHANGE,
  EVENT_APPLY_CHANGE: EVENT_APPLY_CHANGE,
  EVENT_CLUB_CHANGE:EVENT_CLUB_CHANGE,
}