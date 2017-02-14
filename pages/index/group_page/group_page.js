var app = getApp()
const actApi = app.api("actApi")

Page({
    data: {
        checkbox_allStatus: false,
        list: [{
                group: 1,
                group_text: '分组ONE',
                group_Status: false,
                group_list: [{
                        check_Status: false,
                        user_name: "用户昵称1",
                        user_text: '李慧珍帮报1',
                        img: 'https://cdn.51julebu.com/xiaochengxu/image/user.png'
                    },
                    {
                        check_Status: false,
                        user_name: "用户昵称1",
                        user_text: '',
                        img: 'https://cdn.51julebu.com/xiaochengxu/image/user.png'
                    }
                ]
            },
            {
                group: 2,
                group_text: '分组TWO',
                group_Status: false,
                group_list: [{
                        check_Status: false,
                        user_name: "用户昵称2",
                        user_text: '李慧珍帮报2',
                        img: 'https://cdn.51julebu.com/xiaochengxu/image/user.png'
                    },
                    {
                        check_Status: false,
                        user_name: "用户昵称2",
                        user_text: '',
                        img: 'https://cdn.51julebu.com/xiaochengxu/image/user.png'
                    }
                ]
            }
        ],
        Select_number: 0,
        Total_SMS: 2,
        page: {
            top_next_text: '使用期限已过，不再提供免费短信服务。',
            top_text1: '向',
            top_text2: '人发送免费短信，发送后剩余',
            top_text3: '条。',
            checkbox_all_name: 'all',
            checkbox_all_text: '全选',
        },
        statu: 1, //状态1 选择成员   状态2  选择成员的下一步
        Setting: false,
        activityId: 0,
        groups: [], //分组的报名成员
        canSendSms: 1, //能否发动短信 1:可以
        delta: 0, //发送完短信后，重定向的层次
    },

    onLoad(params) {
        let activityId = params.activityId
        this.data.activityId = activityId
        if (params.delta) {
            this.data.delta = params.delta
        }
        let that = this
        actApi.actMembers({
            data: {
                activity_id: activityId,
                start: 0,
                count: 1000
            }
        }, (res) => {
            let data = res.data
            that.setData({
                Total_SMS: data.freeSmsCount,
                canSendSms: data.canSendSms,
            })
            that.parseGroup(data)
        })
    },

    //解析分组数据
    parseGroup(data) {
        let groupArray = data.groups;

        if (data.applys.length > 0) {
            let unGroupData = data.applys.filter(e => {
                let payStatus = e.payStatus
                if (payStatus == 6 || payStatus == 5 || payStatus == 1) {
                    //6: 付款超时的不显示(5: 强行提上去的现在也不显示) // 1: 待付款item
                    return false
                }
                let applyStatus = e.applyStatus
                return applyStatus == 1; //输入未分组
            })

            if (unGroupData.length > 0) {
                //添加未分组数据
                groupArray.push({
                    applys: unGroupData,
                    "groupName": "未分组",
                    "groupID": 0,
                    "count": unGroupData.length
                })
            }
        }

        //遍历列表，加入是否选中的标志
        groupArray.forEach(e => {
            e.group_Status = false
            e.applys.forEach(child => {
                child.check_Status = false
            })
        })

        this.setData({
            groups: groupArray
        })
    },

    //点击全选
    clickAll() {
        const selected = !this.data.checkbox_allStatus;
        let groups = this.data.groups;
        //遍历列表，更改是否选中
        if (!selected) { //反选
            groups.forEach(e => {
                e.group_Status = false
                e.applys.forEach(child => {
                    child.check_Status = false
                })
            })
        } else {
            //全选，需要判断可发条数是否少于所有人
            let canSendSms = this.data.canSendSms;
            if (canSendSms <= 0) {
                return
            }
            canSendSms = this.data.Total_SMS;
            groups.forEach(e => {
                //先重置当前组的选择
                e.applys.forEach(child => {
                    child.check_Status = false
                })
            })
            groups.forEach(e => {
                let groupCount = 0; //当前组选中多少人
                e.applys.forEach(child => {
                    if (--canSendSms >= 0) {
                        child.check_Status = true
                        groupCount++
                    }
                })
                e.group_Status = groupCount == e.applys.length
            })
        }
        this.setData({
            groups: groups,
        })
        this.validateCheck()
    },

    //点击组全选
    clickGroup(e) {
        let groupIndex = e.currentTarget.dataset.id
        let groups = this.data.groups
        let targetGroup = groups[groupIndex]
        let selected = !targetGroup.group_Status;
        if (!selected) {
            //反选
            targetGroup.applys.forEach(e => {
                e.check_Status = false
            })
            targetGroup.group_Status = false
        } else {
            //全选
            let groupCount = 0; //当前组选中多少人
            let canSendSms = this.data.Total_SMS - this.data.Select_number; //剩余条数
            targetGroup.applys.forEach(child => {
                //先重置当前组的选择
                if (child.check_Status) {
                    child.check_Status = false
                    canSendSms++
                }
            })
            targetGroup.applys.forEach(child => {
                if (--canSendSms >= 0) {
                    child.check_Status = true
                    groupCount++
                } else {
                    child.check_Status = false
                }
            })
            targetGroup.group_Status = groupCount == targetGroup.applys.length
        }
        this.setData({
            groups: groups,
        })
        this.validateCheck()
    },

    //点击单个item
    clickChild(e) {
        const groupIndex = e.currentTarget.dataset.group
        const childIndex = e.currentTarget.dataset.id
        const groups = this.data.groups
        const targetGroup = groups[groupIndex]
        const targetChild = targetGroup.applys[childIndex]
        let selected = !targetChild.check_Status
        targetChild.check_Status = selected
        if (!selected) {
            //反选
            targetGroup.group_Status = false
            targetChild.check_Status = false
        } else {
            //判断能否再选
            let Select_number = this.data.Select_number
            let Total_SMS = this.data.Total_SMS
            if (Select_number >= Total_SMS) {
                //todo toast
                return
            }
            targetChild.check_Status = true
            let groupCount = 0; //当前组选中多少人
            targetGroup.applys.forEach(child => {
                if (child.check_Status) {
                    groupCount++
                }
            })
            targetGroup.group_Status = groupCount == targetGroup.applys.length
        }
        this.setData({
            groups: groups
        })
        this.validateCheck()
    },

    //点击下一步
    clickNext() {
        if (this.data.canSendSms != 1) {
            return
        }
        let selectIds = ""
        this.data.groups.forEach(group => {
            group.applys.forEach(child => {
                if (child.check_Status) {
                    if (selectIds == '') {
                        selectIds += child.applyID
                    } else {
                        selectIds += ',' + child.applyID
                    }
                }
            })
        })
        if (selectIds == "") {
            //todo 没有选中
            return
        }
        app.wxService.navigateTo('index/send_msg/send_msg', {
            selectIds: selectIds,
            activityId: this.data.activityId,
            delta: this.data.delta
        })
    },

    //校验是否全选和能否点击下一步
    validateCheck() {
        let groups = this.data.groups
        let selectCount = 0
        let totalCount = 0;
        groups.forEach(group => {
            totalCount += group.applys.length
            group.applys.forEach(child => {
                if (child.check_Status) {
                    selectCount++;
                }
            })
        })
        this.setData({
            Setting: selectCount > 0,
            Select_number: selectCount,
            checkbox_allStatus: selectCount == totalCount,
        })
    },

    //单个按钮事件
    bind_Select(e) {
        if (this.data.statu == 1) {
            const obj = e.currentTarget.dataset;
            const id = obj.id;
            const item = obj.item;
            const Status = this.data.list[id].group_list[item].check_Status;
            const List = this.data.list;
            const item_list = this.data.list[id].group_list[item];
            if (Status) {
                List[id].group_Status = false;
                item_list.check_Status = false;
                List[id].group_list[item] = item_list;
                this.setData({
                    list: List,
                });
            } else {
                item_list.check_Status = true;
                List[id].group_list[item] = item_list;
                this.setData({
                    list: List,
                });
            }
            this.check();
        }
    },
    //分组按钮
    bindgroup_Select(e) {
        if (this.data.statu == 1) {
            const obj = e.currentTarget.dataset;
            const id = obj.id
            const Status = this.data.list[id].group_Status;
            const List = this.data.list;
            const Listid = this.data.list[id];
            if (Status) {
                for (const item_index in List[id].group_list) {
                    List[id].group_list[item_index].check_Status = false;
                }
                Listid.group_Status = false;
                List[id] = Listid;
                this.setData({
                    list: List,
                });
            } else {
                for (const item_index in List[id].group_list) {
                    List[id].group_list[item_index].check_Status = true;
                }
                Listid.group_Status = true;
                List[id] = Listid;
                this.setData({
                    list: List,
                });
            }
            this.check();
        }
    },
    //全部选择按钮
    bindSelectAll() {
        if (this.data.statu == 1) {
            const selectedAllStatus = this.data.checkbox_allStatus;
            const List = this.data.list;
            if (selectedAllStatus) {
                for (const index in List) {
                    List[index].group_Status = false;
                    for (const item_index in List[index].group_list) {
                        List[index].group_list[item_index].check_Status = false;
                    }
                }
                this.setData({
                    checkbox_allStatus: false,
                    list: List,
                });
            } else {
                for (const index in List) {
                    List[index].group_Status = true;
                    for (const item_index in List[index].group_list) {
                        List[index].group_list[item_index].check_Status = true;
                    }
                }
                this.setData({
                    checkbox_allStatus: true,
                    list: List,
                });
            }
            this.check();
        }
    },

    check() {
        const List = this.data.list;
        var check = false;
        var num = 0;
        for (const index in List) {
            for (const item_index in List[index].group_list) {
                if (List[index].group_list[item_index].check_Status == true) {
                    check = true;
                    num += 1;
                }
            }
        }
        this.setData({
            Setting: check,
            Select_number: num,
        });
    },
})