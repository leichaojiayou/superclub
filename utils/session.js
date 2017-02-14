const storage = require('./storage')
class Session {
    constructor(key, user, rencentClubs) {
        Object.assign(this, {
            key,
            user,
            rencentClubs
        })
    }

    getUserKey() {
        if (this.key) {
            return this.key;
        }
        this.key = storage.getSync("key", "")
        return this.key;
    }

    /**
     * userID
     * num, 
     * nick, 
     * avatar,
     * gender,
     * status
     */
    getUserInfo() {
        if (this.user) {
            return this.user
        }
        this.user = storage.getSync("user", {})
        return this.user
    }

    saveUserInfo(user, key) {
        if (user && key) {
            this.key = key;
            this.user = user;
            storage.saveSync("user", user)
            storage.saveSync("key", key)
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

    /**
     * 最近访问的俱乐部列表
     */
    recentClubs() {
        if (!this.recentClubs) {
            this.recentClubs = storage.getSync("recentClubs", [])
        }
        return this.recentClubs;
    }

    addAccessClub(clubId) {
        let clubs = recentClubs()
        if (clubs.length > 0) {
            for (let i = 0; i < clubs.length; i++) {
                let id = clubs[i];
                if (id == clubId) {
                    //最近访问过该俱乐部，移除
                    clubs.splice(i, 1)
                }
            }
        }
        clubs.unshift(clubId)
        if (clubs.length >= 6) {
            //保留最近5个访问过的俱乐部
            clubs.pop()
        }
        this.rencentClubs = rencentClubs;
        storage.saveSync("recentClubs", rencentClubs)
    }

    setCode(code, status) {
        storage.saveSync("code", code);
        storage.saveSync("status", status);
    }

}
module.exports = Session