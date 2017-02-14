Page({
    data: {
        search_text: '搜索',
        statu: '1',
        icon_img: '../../../assets/images/right-errow.png',
        list: [
        {
            button_text: "批量分组", 
            group_Status: true, 
            index: 0, 
            text: "未分组", 
            people_num: 2, 
            group_list: [
                {
                    img: '../../../assets/images/user.png', 
                    check_Status: true, 
                    index: 0, 
                    user_name: "用户昵称", 
                    ticket: "成人票", 
                    price: "130.00", 
                    payment: "微信支付", 
                    club_neme: "李慧珍帮报", 
                    user_real_name: "李慧珍 / 女 / 手机 18824148989", 
                    people_id: "身份证 230602199611011109",
                    content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                    button_text1: "分组", 
                    button_text2: "编辑", 
                    button_text3: '电话', 
                    button_text4: "短信"
                }, 
            {
                img: '../../../assets/images/user.png', 
                check_Status: false, 
                index: 1, 
                user_name: "用户昵称", 
                ticket: "成人票", 
                price: "130.00", 
                payment: "微信支付", 
                club_neme: "", 
                user_real_name: "李慧珍 / 女 / 手机 18824148989", 
                people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "分组", 
                button_text2: "编辑", 
                button_text3: '电话',
                button_text4: "短信"
            }]
        },
        {
            button_text: "批量审核",
            group_Status: false, 
            index: 1, text: "待审核", 
            people_num: 1, 
            group_list: [{
                img: '../../../assets/images/user.png', 
                check_Status: false, 
                index: 0, 
                club_neme: "李慧珍帮报", 
                user_name: "用户昵称", 
                ticket: "成人票", 
                price: "130.00", 
                payment: "微信支付", 
                user_real_name: "李慧珍 / 女 / 手机 18824148989", 
                people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "审核", 
                button_text2: "编辑", 
                button_text3: '电话', 
                button_text4: "短信"
            }],
        },
        {
            group_Status: false,
            index: 3,
            text: "待付款",
            people_num: 1, 
            group_list: [{
                img: '../../../assets/images/user.png',
                check_Status: false,
                index: 0, 
                club_neme: "李慧珍帮报", 
                user_name: "用户昵称", 
                ticket: "成人票", 
                price: "130.00", 
                payment: "微信支付", 
                user_real_name: "李慧珍 / 女 / 手机 18824148989", 
                people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "审核", 
                button_text2: "编辑", 
                button_text3: '电话', 
                button_text4: "短信"
            }],
        },
        {
            group_Status: false, 
            index: 6, 
            text: "未付款", 
            people_num: 2, 
            group_list: [{
                img: '../../../assets/images/user.png', 
                check_Status: false, 
                index: 0, 
                club_neme: "", 
                user_name: "用户昵称", 
                ticket: "成人票", 
                price: "130.00", 
                payment: "微信支付", 
                user_real_name: "李慧珍 / 女 / 手机 18824148989", 
                people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "审核", 
                button_text2: "编辑", 
                button_text3: '电话', 
                button_text4: "短信"
            },
            {
                img: '../../../assets/images/user.png', 
                check_Status: false, 
                index: 1, 
                user_name: "用户昵称", 
                ticket: "成人票", 
                price: "130.00", 
                payment: "微信支付", 
                club_neme: "李慧珍帮报", 
                user_real_name: "李慧珍 / 女 / 手机 18824148989", 
                people_id: "身份证 230602199611011109",
                content: "其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/其他用户填写项目展示区域：答案选择/",
                button_text1: "审核", 
                button_text2: "编辑", 
                button_text3: '电话', 
                button_text4: "短信"
            }],
        }
        ],

        groups:[],   //服务器下发的组
        howToPay:0,  //管理活动页面传过来的值
        resultArray:[], //自己从applys中分出来的组
        allApplyCount:0,//总报名人数
        tickets:[], //票价列表
        activityID:0,
    },

    //一组用户的，展开和关闭
    tapOpenOrCloseGroup:function(e){
        
        console.log(e.target);
        var index = e.target.id
        var resultArray = this.data.resultArray
        resultArray[index].open = !resultArray[index].open
        this.setData({
            resultArray:resultArray
        })
    },

    //具体的报名用户，展开和关闭
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
    //按费用查看
    tapChargeButton:function(e){
        console.log('按费用查看')
        var data = this.data
        wx.navigateTo({
          url: '../group_costs/group_costs?activityID='+data.activityID,
        })
    },
    //查看一组的具体信息
    tapDidGrouped:function(e){
        console.log(e.target);
        var index = e.target.id
        var group = this.data.groups[index]
        wx.navigateTo({
          url: '../group_detail/group_detail?groupID='+group.groupID+'&groupName='+group.groupName,
        })
    },
     tapApplySmallButton:function(e){
        var x = e.currentTarget.dataset.x
        var y = e.currentTarget.dataset.y
        var tag = e.currentTarget.dataset.tag
        var resultArray = this.data.resultArray;
        var group = resultArray[x];
        var apply = group.applys[y]
        if(tag == 0){
            if(group.text != '未分组'){
                console.log('没有分组功能')
                return
            }
        }
        console.log('tag = '+tag)
        console.log(e)
        console.log(apply)
    },

    tapSendMsg:function(e){
        console.log('群发短信')
        wx.navigateTo({
          url: '../edit_apply/edit_apply',
        })
    },
    tapAddApply:function(e){
        
        var activityID = this.data.activityID
        console.log('添加报名 '+activityID)
        wx.navigateTo({
          url: '../add_numbers/add_numbers?activityID='+activityID,
        })
    },
    tapGetExcel:function(e){
        console.log('导出表格')
        wx.navigateTo({
          url: '../apply_form/apply_form',
        })
    },
    tapForGroupButton:function(e){
        console.log(e)

        var groupNameArray = new Array()
        var groupIDArray = new Array()
        for(var i=0;i<this.data.groups.length;i++){
            var item = this.data.groups[i]
            groupNameArray.push(item.groupName)
            groupIDArray.push(item.groupID)
        }
        wx.setStorageSync('manage_group_names', groupNameArray)
        wx.setStorageSync('manage_group_ids', groupIDArray)
        var activityID = this.data.activityID
        
        //手动分好的组
        var index = e.currentTarget.id
        var resultArray = this.data.resultArray
        var group = resultArray[index]
        if(group.text == '未分组'){
            wx.setStorageSync('manage_group_batch', group)
            wx.navigateTo({
                url: '../group_batch/group_batch?activityID='+activityID,
           })
        }else if(group.text == '待审核'){
            wx.setStorageSync('manage_group_audit', group)
            wx.navigateTo({
                url: '../group_audit/group_audit',
           })
        }else if(group.text == '申请退款'){
            wx.showModal({
            title: '暂不支持退款处理，请在超级俱乐部App或网页端进行处理',
            showCancel:false,
            content: '',
            success: function(res) {
                if (res.confirm) {
                   console.log('用户点击确定')
                }
            }
            })

        }
    },
    
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            howToPay:options.howToPay,
            activityID:options.activityID
        })
        let activityID = options.activityID
        console.log('管理报名id = '+activityID+" howToPay = "+this.data.howToPay)
        this.requestAllApplyList(activityID)
    },
    onReady: function () {
        // 页面渲染完成

    },
    onShow: function () {
        // 页面显示
        console.log('manage apply on show')
        this.requestAllApplyList(this.data.activityID)
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    },

    
    
    nato_group_cost_page:function(e){
        wx.navigateTo({
            url: '../group_cost_page/group_cost_page'
        })
    },

    handleUserList:function(userList){

        var howToPay = this.data.howToPay
        //申请退款
        var askRefundArray = new Array()
        var list1 = new Array()
        if(howToPay > 1){
            for(var i=0;i<userList.length;i++){
                var apply = userList[i];
                apply.open = false;
                if(apply.refundStatus == 0){
                    askRefundArray.push(apply)
                }else{
                    list1.push(apply)
                }
            }
        }else{
            list1 = userList;
        }

        //已经退款
        var didRefundArray = new Array()
        var list2 = new Array() 
        if(howToPay > 1){
            for(var i=0;i<list1.length;i++){
                var apply = list1[i];
                apply.open = false;
                if(apply.refundStatus == 3){
                    didRefundArray.push(apply)
                }else{
                    list2.push(apply)
                }
            }
        }else{
            list2 = list1
        }

        //付款超时
        var waitForPayArray = new Array();
        var list3 = new Array()
        if(howToPay > 1){
            for(var i =0;i < list2.length;i++){
                var apply = list2[i]
                apply.open = false;
                if(apply.payStatus == 6){
                    waitForPayArray.push(apply)
                }else{
                    list3.push(apply)
                }
            }
        }else{
            list3 = list2
        }

        //拒绝报名
        var cancelApplyArray = new Array()
        var list4 = new Array()
        for(var i =0;i < list3.length;i++){
            var apply = list3[i]
            apply.open = false;
            if(apply.applyStatus == 3){
                cancelApplyArray.push(apply)
            }else{
                list4.push(apply)
            }
        }

        //取消报名
        var list5 = new Array()
        for(var i =0;i < list4.length;i++){
            var apply = list4[i]
            if(apply.applyStatus == 2){
                cancelApplyArray.push(apply)
            }else{
                list5.push(apply)
            }
        }

        //待付款
        var list6 = new Array()
        if(howToPay > 1){
            for(var i =0;i < list5.length;i++){
                var apply = list5[i]
                if(apply.payStatus == 1){
                    waitForPayArray.push(apply)
                }else{
                    list6.push(apply)
                }
            }
        }else{
            list6 = list5
        }

        //待审核
        var waitPassArray = new Array()
        var list7 = new Array()
        for(var i =0;i < list6.length;i++){
            var apply = list6[i]
            if(apply.applyStatus == 0){
                waitPassArray.push(apply)
            }else{
                list7.push(apply)
            }
        }

        //未分组
        var notGroupArray = new Array()
        var list8 = new Array()
        for(var i =0;i < list7.length;i++){
            var apply = list7[i]
            if(apply.applyStatus == 1){
                notGroupArray.push(apply)
            }else{
                list8.push(apply)
            }
        }

        //审核不通过
        var notPassArray = new Array()
        var list9 = new Array()
        for(var i =0;i < list8.length;i++){
            var apply = list8[i]
            if(apply.applyStatus == 4){
                notPassArray.push(apply)
            }else{
                list9.push(apply)
            }
        }

        //未付款
        var list10 = new Array()
        for(var i =0;i < list9.length;i++){
            var apply = list9[i]
            if(apply.applyStatus == 9){
                cancelApplyArray.push(apply)
            }else{
                list10.push(apply)
            }
        }

        //一起构建成一个二维数组
        var resultArray = new Array();

        if(notGroupArray.length > 0){
            var item = {
                text:'未分组',
                small_button_title:'分组',
                open:true,
                button_text:'批量分组',
                count:notGroupArray.length,
                applys:notGroupArray,
            }
            resultArray.push(item)
        }

        if(waitPassArray.length > 0){
            var item = {
                text:'待审核',
                open:false,
                button_text:'批量审核',
                count:waitPassArray.length,
                applys:waitPassArray,
            }
            resultArray.push(item)
        }

        if(askRefundArray.length > 0){
            var item = {
                text:'申请退款',
                open:false,
                button_text:'去处理',
                count:askRefundArray.length,
                applys:askRefundArray,
            }
            resultArray.push(item)
        }

        if(waitForPayArray.length > 0){
            var item = {
                text:'待付款',
                open:false,
                count:waitForPayArray.length,
                applys:waitForPayArray,
            }
            resultArray.push(item)
        }
      
        if(didRefundArray.length > 0){
            var item = {
                text:'已退款',
                open:false,
                count:didRefundArray.length,
                applys:didRefundArray,
            }
            resultArray.push(item)
        }

        if(notPassArray.length > 0){
            var item = {
                text:'审核不同过',
                open:false,
                count:notPassArray.length,
                applys:notPassArray,
            }
            resultArray.push(item)
        }
        //最后一个
        if(cancelApplyArray.length > 0){
            var text = '其他已取消'
            if(howToPay == 1){
                text = '取消报名'
            }
            var item = {
                text:text,
                open:false,
                count:cancelApplyArray.length,
                applys:cancelApplyArray,
            }
            resultArray.push(item)
        }

        var allApplyCount = notGroupArray.length
        for(var i = 0; i<this.data.groups.length;i++){
            var item = this.data.groups[i]
            allApplyCount += item.count;
        }

        console.log('解析result完毕')
        console.log(resultArray);
        this.setData({
            resultArray:resultArray,
            allApplyCount:allApplyCount
        })
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
                console.log('获取报名列表成功');
                console.log(res);
                var data = res.data;
                that.setData({
                    groups:data.groups,
                    tickets:data.tickets,
                    applys:data.applys,
                })
                var userList = data.applys;
                console.log('显示userList');
                console.log(userList);
                console.log('开始解析applys')
                that.handleUserList(userList)

            },
            function fail(res){

            },
        )
    }
})