const storage = require('./storage')
class Session {
    constructor() {
        //Object.assign(this, {
        //     key,
        //     user,
        //     recentClubIds, //最近访问的俱乐部列表, 装的是俱乐部ID
        //     joinClubs, //我加入的俱乐部列表, 装的是俱乐部ID
        //     cacheClubs, //查看过的俱乐部详情列表， 装的是俱乐部信息对象，用来判断新活动
        //})
    }

    saveSync(key, value) {
        storage.saveSync(this.keyPrefix + key, value)
    }

    getSync(key, defaulValue) {
        let value = storage.getSync(this.keyPrefix + key)
        return value != null ? value : defaulValue
    }

    removeSync(key) {
        storage.removeSync(this.keyPrefix + key)
    }

    /**
     * 区分每个用户的信息，用于多用户登录
     */
    setKeyPrefix(keyPrefix) {
        this.keyPrefix = keyPrefix
    }

    getUserKey() {
        if (this.key) {
            return this.key;
        }
        this.key = this.getSync('key', null)
        return this.key;
    }

    /**
     * userID
     * num,
     * nick,
     * avatar,
     * gender,
     * status,
     * mobile
     */
    getUserInfo() {
        if (this.user) {
            return this.user
        }
        this.user = this.getSync('user', {})
        return this.user
    }

    saveUserInfo(user, key) {
        if (user && key) {
            this.key = key;
            this.user = user;
            this.saveSync("user", user)
            this.saveSync("key", key)
        }
    }

    /**
     * 是否小程序临时用户
     */
    isTempUser() {
        let userInfo = this.getUserInfo()
        if (userInfo.status) {
            return userInfo.status == 6
        }
        return true
    }

    getMyClubInfo() {
        return this.getSync("club", {})
    }

    saveMyClubInfo(club) {
        this.saveSync("club", club)
    }

    removeMyClubInfo() {
        this.removeSync("club")
    }

    //解决多人报名时，在两个页面反复跳转导致数据错乱
    getApplyInfo() {
        return this.getSync("applyInfo", {})
    }

    /**
     *   数据结构applyInfo{current:当前编辑的数据索引,infos:[]//所有数据}
     *  info = {//infos里面的数据
     *   isCost: that.data.isCost,
     *   selectTicketIndex: that.data.selectTicketIndex,
     *   selectTicket: that.data.selectTicket,//已选择的票价
     *   tickets: that.data.tickets,//票价列表
     *   fields: that.data.fields,//需要填写的信息列表 };
     * @param applyInfo
     */
    saveApplyInfo(applyInfo) {
        this.saveSync("applyInfo", applyInfo)
    }

    removeApplyInfo() {
        this.removeSync("applyInfo")
    }

    updateJoinClubs(clubs) {
        if (clubs == null || clubs.length == 0) return
        //检查是否有新的活动数
        this.checkNewActCount(clubs)
        let newClubs = []
        clubs.forEach(e => {
            newClubs.push(e.clubID)
        })
        this.joinClubs = newClubs

        let recents = this.recentClubs()
        let newRecents = []
        recents.forEach(clubId => {
            if (!this.joinClubs.includes(clubId)) {
                newRecents.push(clubId)
            }
        })
        this.recentClubIds = newRecents;
        this.saveSync("recentClubIds", newRecents)
    }

    /**
     * 最近访问的俱乐部列表
     */
    recentClubs() {
        return this.getSync('recentClubIds', [])
    }

    /**
     * 获取所有最近访问的俱乐部,包括之前在访问首页活动的俱乐部
     */
    allRecentClubs() {
        let recentIds = this.recentClubs()
        let clubs = recentIds
        let invisibleClubs = this.getSync('recentInvisibleClubs', [])
        if (invisibleClubs.length > 0) {
            invisibleClubs.forEach(e => {
                if (!this.__exist(e, this.joinClubs, clubs)) {
                    clubs.push(e)
                }
            })
            if (clubs.length > 5) {
                clubs = clubs.slice(0, 5)
            }
            this.saveSync('recentClubIds', clubs)
            this.saveSync('recentInvisibleClubs', [])
        }
        return clubs
    }

    __exist(id, joinClubs, recentClubs) {
        if (joinClubs != null && joinClubs.length > 0) {
            for (let i = 0; i < joinClubs.length; i++) {
                if (id == joinClubs[i]) {
                    return true;
                }
            }
        }
        if (recentClubs != null && recentClubs.length > 0) {
            for (let i = 0; i < recentClubs.length; i++) {
                if (id == recentClubs[i]) {
                    return true;
                }
            }
        }
        return false;
    }

    addAccessClub(clubId, addToRecent = true) {
        if (this.joinClubs && this.joinClubs.length > 0) {
            for (let i = 0; i < this.joinClubs.length; i++) {
                let id = this.joinClubs[i];
                if (id == clubId) {
                    //访问的是我加入的俱乐部，直接返回
                    return
                }
            }
        }
        if (addToRecent) {
            let clubs = this.recentClubs()
            if (clubs.length > 0) {
                for (let i = 0; i < clubs.length; i++) {
                    let id = clubs[i];
                    if (id == clubId) {
                        //最近访问过该俱乐部，移除
                        clubs.splice(i, 1)
                    }
                }
            }
            clubs.unshift(Number.parseInt(clubId))
            if (clubs.length >= 6) {
                //保留最近5个访问过的俱乐部
                clubs.pop()
            }
            this.recentClubIds = clubs;
            this.saveSync("recentClubIds", clubs)
        } else {
            //如果从小程序首页访问的俱乐部, 不直接显示在最近访问的.
            //直到用户加入或者创建了俱乐部后才显示出来
            let recentInVisibleClubs = this.getSync('recentInvisibleClubs', [])
            for (let i = 0; i < recentInVisibleClubs.length; i++) {
                let id = recentInVisibleClubs[i];
                if (id == clubId) {
                    //最近访问过该俱乐部，移除
                    recentInVisibleClubs.splice(i, 1)
                }
            }
            recentInVisibleClubs.unshift(Number.parseInt(clubId))
            this.saveSync("recentInvisibleClubs", recentInVisibleClubs)
        }
    }

    setCode(code, status) {
        this.saveSync("code", code);
        this.saveSync("status", status);
    }

    /**
     * 检查是否有新的活动，红色数字提示
     */
    checkNewActCount(clubs) {
        if (clubs == null || clubs.length == 0) return
        let cacheClubs = this.getSync('cacheClubs', [])
        let newAccessClubs = []
        clubs.forEach(club => {
            let found = false
            club.newActCount = 0
            for (var i = 0; i < cacheClubs.length; i++) {
                let cache = cacheClubs[i]
                if (cache.clubId == club.clubID) {
                    found = true
                    if (club.activityCount > cache.activityCount) {
                        //总的活动数比上次增多了
                        club.newActCount = club.activityCount - cache.activityCount
                    } else {
                        cache.activityCount = club.activityCount
                    }
                }
            }
            if (!found) {
                newAccessClubs.push({
                    clubId: club.clubID,
                    activityCount: club.activityCount,
                })
            }
        })
        if (newAccessClubs.length > 0) {
            cacheClubs = cacheClubs.concat(newAccessClubs)
        }
        this.saveSync('cacheClubs', cacheClubs)
    }

    markClubRead(club) {
        let cacheClubs = this.getSync('cacheClubs', [])
        let found = false
        for (var i = 0; i < cacheClubs.length; i++) {
            let cache = cacheClubs[i]
            if (cache.clubId == club.clubID) {
                found = true
                //更新已经查看的俱乐部活动总数
                cache.activityCount = club.activityCount
                break
            }
        }
        if (found) {
            this.saveSync('cacheClubs', cacheClubs)
        }
    }

    addSystemMessages(msgs) {
        if (msgs == null || msgs.length == 0) return
        let messages = msgs.filter(e => {
            //弹窗类型
            return e.showWindow == 1
        })
        if (messages.length != 0) {
            let dialogMsgs = this.getSync('dialog_messages', [])
            if (dialogMsgs == null) {
                dialogMsgs = []
            }
            dialogMsgs = dialogMsgs.concat(messages)
            this.saveSync('dialog_messages', dialogMsgs)
        }

        let actMsgs = msgs.filter(e => {
            return e.type == 1 //活动类型消息
        })
        if (actMsgs != 0) {
            let cacheMsgs = this.getSync('act_messages', [])
            if (cacheMsgs == null) {
                cacheMsgs = []
            }
            cacheMsgs = cacheMsgs.concat(actMsgs)
            if (cacheMsgs.length > 100) {
                cacheMsgs.slice(0, cacheMsgs.length - 100)
            }
            this.saveSync('act_messages', cacheMsgs)
        }
    }
}
module.exports = Session