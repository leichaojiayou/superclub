var app = getApp()
const clubApi = app.api('clubApi')

Page({
    data: {
        clubId: 0,
        item: [{
            funs: '申请加入俱乐部',
            time: '01-21 13:00',
            img: 'https://cdn.51julebu.com/xiaochengxu/image/user@2x.png',
            username: '用户昵称',
            txt: '我是奔跑的小马申请加入俱乐部。'
        }],
        messages: []
    },

    onLoad(params) {
        let clubId = params.clubId;
        this.data.clubId = clubId;

        let that = this
        clubApi.clubMemberJoinMessages({
            data: {
                club_id: clubId
            }
        }, (res) => {
            let data = res.data
            let messages = data.joins;
            messages.forEach((element) => {
                element.formatTime = app.util.formatTime2(element.createTime)
            })
            that.setData({
                messages: messages
            })
        }, res => {

        })
    },

    bindApprove(e) {
        const info = e.currentTarget.dataset.info
        this.handleJoin(info, true)
    },

    bindRefuse(e) {
        let info = e.currentTarget.dataset.info
        this.handleJoin(info, false)
    },

    handleJoin(info, approve) {
        let that = this
        clubApi.verfiyClubMemberJoin({
                data: {
                    club_id: info.club.clubID,
                    user_id: info.user.userID,
                    flag: approve ? 1 : -1
                }
            }, (res) => {
                //操作成功，将消息移除
                let messages = that.data.messages
                for (var i = 0; i < messages.length; i++) {
                    let msg = messages[i];
                    if (msg.createTime == info.createTime) {
                        //如果请求时间相同，我们就当做同一条消息
                        messages.splice(i, 1)
                        break
                    }
                }
                that.setData({
                    messages: messages
                })
            },
            (res) => {
                console.log(res)
            }
        )
    }
})