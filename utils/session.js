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
        this.key = storage.getSync(this.keyPrefix + 'key', '')
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
        this.user = storage.getSync(this.keyPrefix + 'user', {})
        return this.user
    }

    saveUserInfo(user, key) {
        if (user && key) {
            this.key = key;
            this.user = user;
            storage.saveSync(this.keyPrefix + "user", user)
            storage.saveSync(this.keyPrefix + "key", key)
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
        return storage.getSync(this.keyPrefix + "club", {})
    }

    saveMyClubInfo(club) {
        storage.saveSync(this.keyPrefix + "club", club)
    }

    removeMyClubInfo() {
        storage.removeSync(this.keyPrefix + "club")
    }

    //解决多人报名时，在两个页面反复跳转导致数据错乱
    getApplyInfo() {
        return storage.getSync(this.keyPrefix + "applyInfo", {})
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
        storage.saveSync(this.keyPrefix + "applyInfo", applyInfo)
    }

    removeApplyInfo() {
        storage.removeSync(this.keyPrefix + "applyInfo")
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
        storage.saveSync(this.keyPrefix + "recentClubIds", newRecents)
    }

    /**
     * 最近访问的俱乐部列表
     */
    recentClubs() {
        if (!this.recentClubIds) {
            this.recentClubIds = storage.getSync(this.keyPrefix + "recentClubIds", [])
        }
        if (this.recentClubIds == null) {
            this.recentClubIds = []
        }
        return this.recentClubIds;
    }

    addAccessClub(clubId) {
        if (this.joinClubs && this.joinClubs.length > 0) {
            for (let i = 0; i < this.joinClubs.length; i++) {
                let id = this.joinClubs[i];
                if (id == clubId) {
                    //访问的是我加入的俱乐部，直接返回
                    return
                }
            }
        }
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
        storage.saveSync(this.keyPrefix + "recentClubIds", clubs)
    }

    setCode(code, status) {
        storage.saveSync(this.keyPrefix + "code", code);
        storage.saveSync(this.keyPrefix + "status", status);
    }

    /**
     * 检查是否有新的活动，红色数字提示
     */
    checkNewActCount(clubs) {
        if (clubs == null || clubs.length == 0) return
        let cacheClubs = storage.getSync(this.keyPrefix + 'cacheClubs', [])
        if (cacheClubs == null) cacheClubs = []
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
        storage.saveSync(this.keyPrefix + 'cacheClubs', cacheClubs)
    }

    markClubRead(club) {
        let cacheClubs = storage.getSync(this.keyPrefix + 'cacheClubs', [])
        if (cacheClubs == null) return
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
            storage.saveSync(this.keyPrefix + 'cacheClubs', cacheClubs)
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
            if(cacheMsgs.length > 100) {
                cacheMsgs.slice(0, cacheMsgs.length - 100)
            }
            this.saveSync('act_messages', cacheMsgs)
        }
    }
}
module.exports = Session