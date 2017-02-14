Page({
    data: {
        statu: '1',
        list: [{
            button_text: "批量分组", group_Status: true, index: 0, people_num: 3, price: "130.00", text: "成人票", group_list: [{
                img: '../images/user.png', check_Status: true, index: 0, user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "已付费 (微信支付)", club_neme: "李慧珍帮报", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "分组", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
            }, {
                img: '../images/user.png', check_Status: false, index: 1, user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "已付费 (微信支付)", club_neme: "", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "分组", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
            }, {
                img: '../images/user.png', check_Status: false, index: 2, user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "未付费 (其他支付)", club_neme: "李慧珍帮报", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "分组", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
            }]
        },
        {
            price: "130.00", text: "儿童票", button_text: "批量审核", group_Status: false, index: 1, people_num: 1, group_list: [{
                img: '../images/user.png', check_Status: false, index: 0, club_neme: "李慧珍帮报", user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "未付费 (其他支付)", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "审核", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
            }],
        }],
        resultArray:[],
    }
    ,
    btn(e) {
        wx.showActionSheet({
            itemList: ['查看报名表格', '发送到邮箱', '复制下载链接'],
            success: function (res) {
                console.log(res.tapIndex)
                switch (res.tapIndex) {
                    case 0:
                        wx.navigateTo({
                            url: '../baomingbiaoge/baomingbiaoge'
                        })
                        break;
                }
            },
            fail: function (res) {
                console.log(res.errMsg)
            }
        })
    }
    ,
    bind_Select(e) {
        const List = this.data.list;
        const obj = e.currentTarget.dataset

        console.log(e.currentTarget.id);
        List[obj.id].group_list[obj.item].check_Status = !List[obj.id].group_list[obj.item].check_Status;
        this.setData({
            list: List
        });
    }
    ,
    //组按钮
    bindgroup_button(e) {
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
            Listid.group_Status = true;
            List[id] = Listid;
            this.setData({
                list: List,
            });
        }
    },
    //组：展开 关闭
    tapGroupForDisplay:function(e){
        console.log(e)
        var index = e.currentTarget.id
        var resultArray = this.data.resultArray
        resultArray[index].open = !resultArray[index].open
        this.setData({
            resultArray:resultArray
        })
    },
    //单元格：展开 关闭
    tapRowForDisplay:function(e){
        var x = e.currentTarget.dataset.x
        var y = e.currentTarget.dataset.y
        var resultArray = this.data.resultArray;

       for(var i=0;i<resultArray.length;i++){
           var item = resultArray[i]
           for(var j=0;j<item.applys.length;j++){
               var apply = item.applys[j]

               if(i == x && j == y){
                 apply.open = !apply.open
               }else{
                 apply.open = false;
               }
           }
       }
        this.setData({
            resultArray:resultArray
        })
        console.log(e)
    },
    tapApplySmallButton:function(e){
        var x = e.currentTarget.dataset.x
        var y = e.currentTarget.dataset.y
        var tag = e.currentTarget.dataset.tag
        var resultArray = this.data.resultArray;
        var group = resultArray[x];
        var apply = group.applys[y]
        
        console.log('tag = '+tag)
        console.log(apply)
    },

    onLoad: function (options) {
        console.log('查看费用id = ',options.activityID);
        this.requestAllApplyList(options.activityID);
        // 页面初始化 options为页面跳转所带来的参数
    },
    onReady: function () {
        // 页面渲染完成

    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },

    requestAllApplyList:function(activityID){
        var that = this 
        getApp().api('manageApi').getAllApplyList({
            data:{
                activity_id:activityID,
                start:0,
                count:90000
            }},
            function success(res){
                console.log(res);
                console.log('获取费用列表');
                var data = res.data
                that.handleData(data)

            },
            function fail(res){

            },
    
        )
    },
    handleData:function(options){
        var tickets = options.tickets
        var applys = options.applys
        var groups = options.groups

        var allApplyArray = new Array()
 
        for(var i=0;i<groups.length;i++){
            var item = groups[i]
            for(var j=0;j<item.applys.length;j++){
                var apply = item.applys[j]
                allApplyArray.push(apply)
            }
        }
        for(var i=0;i<applys.length;i++){
            var apply = applys[i]
            allApplyArray.push(apply)
        }


        var resultArray = new Array()
        for(var i=0;i<tickets.length;i++){
            var ticket = tickets[i]
            var tempArray = new Array()
            for(var j=0;j<allApplyArray.length;j++){
                var apply = allApplyArray[j]
                apply.open = false
                if(ticket.name == apply.ticketName){
                    tempArray.push(apply)
                }
            }
            var open = (i==0)?true:false
            if(tempArray.length > 0){
                var item = {
                    open:open,
                    ticket:ticket,
                    count:tempArray.length,
                    applys:tempArray
                }
                resultArray.push(item)
            }
        }
        console.log(resultArray)
        this.setData({
            resultArray:resultArray
        })
    }
})