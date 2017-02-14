Page({
    data: {
        statu: '1',
        group_list: [{
            img: '../images/user.png', check_Status: true, index: 0, user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "微信支付", club_neme: "李慧珍帮报", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
            content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
            button_text1: "分组", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
        }, {
            img: '../images/user.png', check_Status: false, index: 1, user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "微信支付", club_neme: "", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
            content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
            button_text1: "分组", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
        }, {
            img: '../images/user.png', check_Status: false, index: 2, user_name: "用户昵称", ticket: "成人票", price: "130.00", payment: "微信支付", club_neme: "李慧珍帮报", user_real_name: "李慧珍 / 女 / 手机 18824148989", people_id: "身份证 230602199611011109",
            content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
            button_text1: "分组", button_text2: "编辑", button_text3: '电话', button_text4: "短信"
        }],
        groupID:0,
        groupName:'',
        applys:[],
    },
    bind_Select(e) {
        const Group_list = this.data.group_list;
        const obj = e.currentTarget.dataset

        console.log(e.currentTarget.id);
        Group_list[obj.item].check_Status = !Group_list[obj.item].check_Status;
        this.setData({
            group_list: Group_list
        });
    },

    tapRowForDisplay:function(e){
        console.log(e)
        var index = e.currentTarget.id
        var applys = this.data.applys
        for(var i=0;i<applys.length;i++){
            var apply = applys[i] 
            if(i == index){
                apply.open = !apply.open 
            }else{
                apply.open = false
            }
        }
    
        this.setData({
            applys:applys 
        })
    },
    tapEditGroupName:function(e){
        var groupID = this.data.groupID
        var groupName = this.data.groupName
        wx.navigateTo({
          url: '../group_modify/group_modify?groupID='+groupID+'&groupName='+groupName,
        })
    },
    changeBarTitle:function(title){
        this.groupName = title 
         wx.setNavigationBarTitle({
          title: title,
        })
    },

    onLoad:function(options){
  
        this.setData({
            groupID:options.groupID,
            groupName:options.groupName,
        })
        this.changeBarTitle(options.groupName)
        this.requestGroupMembers(options.groupID)
    },
    
    requestGroupMembers:function(groupID){
        console.log('requestGroupMembers 掉用了')
        var that = this 
        getApp().api('manageApi').getGroupMembers({
            data:{
                group_id:groupID,
                start:0,
                count:90000
            }},
            function success(res){
                console.log('获取组成员OK');
                console.log(res);
                var applys = res.data.applys
                that.setData({
                    applys:applys,
                })
            },
            function fail(res){
                console.log(res)
            },
         
        )
    }


})