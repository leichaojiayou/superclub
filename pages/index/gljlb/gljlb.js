var app = getApp()
const clubApi = app.api("clubApi")

Page({
    data: {
        clubId: 0,
        threelabel: [{
                txt: '会员',
                amount: '--'
            },
            {
                txt: '本月活动',
                amount: '--'
            },
            {
                txt: '本月报名',
                amount: '--'
            },
        ],
        item: [{
                img: 'https://cdn.51julebu.com/xiaochengxu/image/active.png',
                content: '发布活动'
            },
            {
                img: 'https://cdn.51julebu.com/xiaochengxu/image/member+.png',
                content: '招募会员'
            },
            {
                img: 'https://cdn.51julebu.com/xiaochengxu/image/msg.png',
                content: '免费信息'
            },
            {
                img: 'https://cdn.51julebu.com/xiaochengxu/image/list.png',
                content: '待办事项'
            }
        ],
        //第二个模板
        acts: [],
        club: {
            joinUnCheckNum: 0,
        },
        codeHehe: '',
        hideQrCode: true,
        item3: [{
            img: '',
            name: '潍坊市马拉松运动协会2017黄河口东营-国际马拉松赛报名啊啊啊啊啊啊啊啊啊啊啊啊',
            time: '2017.12.21 17:30',
            club_name: '俱乐部俱乐部名称',
            money: '￥230.00',
            freemsg: '0',
            enlistnumber: '3'
        }],
    },

    onLoad(params) {
        let clubId = params.clubId;
        this.data.clubId = clubId
        this.loadDatas(clubId)
    },

    //请求数据
    loadDatas(clubId) {
        let that = this
        //获取俱乐部管理活动列表
        clubApi.clubActs({
                data: {
                    user_id: app.session.getUserInfo().userID,
                    start: 0,
                    count: 50
                }
            },
            (res) => {
                let data = res.data;
                that.setData({
                    acts: data.activities
                })
            }
        )

        //获取俱乐部详情
        clubApi.clubDetailLite({
            loading: true,
            data: {
                club_id: clubId
            }
        }, (res) => {
            let clubInfo = res.data.club;
            that.setData({
                club: clubInfo,
                threelabel: [{
                        txt: '会员',
                        amount: clubInfo.memberCount
                    },
                    {
                        txt: '本月活动',
                        amount: clubInfo.monthActCount
                    },
                    {
                        txt: '本月报名',
                        amount: clubInfo.monthApplyCount
                    },
                ]
            })
        })
    },

    nato: function (e) {
        var that = this
        switch (e.currentTarget.id) {
            case '0': //发布活动
                app.wxService.navigateTo("organize/huodongfabu/huodongfabu")
                break;
            case '1': //招募会员
                that.setData({
                    codeHehe: 'opacity:1;pointer-events:auto;'
                })
                break;
            case '2': //免费短信
                app.wxService.navigateTo("index/mfdx/mfdx")
                break;
            case '3': //待办事项
                app.wxService.navigateTo("index/dbsx/dbsx", {
                    clubId: that.data.clubId
                })
                break;
        }
    },

    viewActDetail: function (e) {
        let activityId = e.currentTarget.dataset.id;
        app.wxService.navigateTo("../../manage/manage_activity/manage_activity", {
            actId: activityId
        })
    },

    closeCode: function () {
        that.setData({
            codeHehe: ''
        })
    },

    shareClub: function () {

    },
})