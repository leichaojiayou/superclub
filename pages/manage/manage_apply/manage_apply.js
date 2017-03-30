var app = getApp()
Page({
    data: {
        tabIndex:0, //0:详细信息 1:报名管理
        activityID:0,
        activityId:0,

        //--------------------------------------------------------tabIndex==0 所绑定的数据
        clubID:0,
        activity:{},
        titleNames:[
        '报名','点赞','评论','分享'
        ],
        titleDatas:[
        '0','0','0','0'
        ],
        imageAndTitles:[
        { img: 'https://cdn.51julebu.com/xiaochengxu/image/edit.png', content: '编辑活动' },
        { img: 'https://cdn.51julebu.com/xiaochengxu/image/msg.png', content: '免费短信' },
        { img: 'https://cdn.51julebu.com/xiaochengxu/image/qrcode.png', content: '活动二维码' },
        { img: 'https://cdn.51julebu.com/xiaochengxu/image/active.png', content: '查看活动' },
        { img: 'https://cdn.51julebu.com/xiaochengxu/image/onemore.png', content: '再发一个' },
        ],
        lastIcon:{
             img:"https://cdn.51julebu.com/xiaochengxu/image/close.png",
             content:"关闭报名",
        },
       
        activityCode:"", //活动二维码控制样式
        qrcodeUrl:'',
         
        //--------------------------------------------------------tabIndex==1 所绑定的数据
        icon_img: 'https://cdn.51julebu.com/xiaochengxu/image/black-errow@2x.png',
        groups:[],   //服务器下发的组
        howToPay:0,  //管理活动页面传过来的值
        resultArray:[], //自己从applys中分出来的组
        allApplyCount:0,//总报名人数
        tickets:[], //票价列表
        isPayeeAccount:0, //是否是收款账户
        groupNameArray:[],
        groupIDArray:[],
        auditApplyID:0,
        refuseReason:'',
        showCount:0,

        emailShowStyle:'', //弹窗三剑客
        alertTitle:'',
        placeHolder:'',
        alertTag:0, //1:审核相关弹窗 2:普通分组  3:费用分组 4:保险模板

        currentState:1, //1:普通分组 2:费用分组
        costsArray:[],
        formId:0,
        applyCheckStyle:0,
        shenheApply:{},
    },

    onLoad: function (options) {

        let activityID = options.actId
       
        this.setData({
            howToPay:options.howToPay,
            activityID:activityID,
            activityId:activityID,
            clubID:options.clubID,
        })

         console.log('howToPay = ',this.data.howToPay)
        
        this.requestMangeActivity(activityID)
        this.requestAllApplyList(activityID)
        
    },

    onShow: function () {
        // 页面显示
        if(this.data.showCount > 0 && this.data.tabIndex == 1){
            this.requestAllApplyList(this.data.activityID)
        }
        this.data.showCount = 1
        app.event.remove(app.config.EVENT_APPLY_CHANGE, this)
    },
    onHide: function() {
        //报名人数发生更改
        app.event.on(app.config.EVENT_APPLY_CHANGE, this, info => {
            let count = info.count ? info.count : 0
         
            let titleDatas  = this.data.titleDatas
            titleDatas[0] = titleDatas[0] + count
            this.setData({
                titleDatas: titleDatas
                //列表刷新
            })
            this.requestAllApplyList(this.data.activityID)
        })
    },
    tapTabButton:function(e){
        console.log(e)
        var tabIndex = e.currentTarget.id
        console.log('tabIndex = '+tabIndex)
        this.setData({
            tabIndex:tabIndex,
        });
    },
    tapCostGroup:function(e){
        this.setData({
            currentState:2
        })
    },
    tapCommomGroup:function(e){
        this.setData({
            currentState:1
        })
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

    //查看一组的具体信息
    tapDidGrouped:function(e){
        console.log(e.target);
        var index = e.target.id
        var group = this.data.groups[index]
        var activityID = this.data.activityID
        wx.setStorageSync('manage_group_detail', this.data.tickets)

        var groupNameArray = new Array()
        var groupIDArray = new Array()
        for(var i=0;i<this.data.groups.length;i++){
            var item = this.data.groups[i]
            groupNameArray.push(item.groupName)
            groupIDArray.push(item.groupID)
        }
        wx.setStorageSync('manage_group_names', groupNameArray)
        wx.setStorageSync('manage_group_ids', groupIDArray)
        
        wx.navigateTo({
          url: '../group_detail/group_detail?groupID='+group.groupID+'&groupName='+group.groupName+'&activityID='+activityID,
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
            if(group.text == '未分组' ){
               //分组 弹窗
                wx.showModal({
                    title: '请先在"批量分组"中创建分组',
                    content: '',
                    showCancel:false,
                    success: function(res) {
                    }
                })
            }
            if(group.text == '待审核'){
                //审核弹窗
                var that = this 
                wx.showActionSheet({
                    itemList: ['通过', '不通过'],
                    success: function(res) {
                        console.log(res.tapIndex)
                        if(res.tapIndex == 0){
                            //通过
                            that.data.shenheApply = apply
                            that.setData({
                                applyCheckStyle:1,
                                applyTitle:'确定通过"'+apply.user.nick+'"的报名吗?',
                            })
                        }else if(res.tapIndex == 1){
                            var text = '确定不通过"'+apply.user.nick+'"的报名吗?'
                            if(apply.howToPay == 2){
                                text += '系统将退回'+apply.cost+'元报名费给:'+apply.user.nick
                            }

                            //不通过
                            that.setData({
                                emailShowStyle:"opacity:1;pointer-events:auto;",
                                auditApplyID:apply.applyID,
                                alertTitle:text,
                                placeHolder:'输入不通过的原因，30字以内',
                                alertTag:1,
                            })
                        }
                    },
                    fail: function(res) {
                      
                        console.log(res.errMsg)
                    }
                })
            }

        }else if(tag == 1){
            //编辑
            var activityID = this.data.activityID
            var nick = apply.user.nick
            var howToPay = this.data.howToPay
            wx.navigateTo({
              url: '../edit_apply/edit_apply?activityID='+activityID+'&applyID='+apply.applyID+'&nick='+nick+'&howToPay='+howToPay,
            })

        }else if(tag == 2){
            //电话
            var phone = apply.user.mobile
            wx.makePhoneCall({
                phoneNumber: phone, //此号码并非真实电话号码，仅用于测试
                success:function(){
                    console.log("拨打电话成功！")
                },
                fail:function(){
                    console.log("拨打电话失败！")
                }
            })

        }
    },
    tapCancel:function(e){
        this.setData({
            applyCheckStyle:0,
        })
    },
    tapSure:function(e){
        var formId = e.detail.formId
        this.data.formId = formId
        console.log('formId = '+formId)

        this.setData({
            applyCheckStyle:0,
        })
        this.requestAudit(1,this.data.shenheApply.applyID,'')

    },

    tapGroupPickerChanged:function(e){
        var x = e.currentTarget.dataset.x
        var y = e.currentTarget.dataset.y
        var resultArray = this.data.resultArray;
        var group = resultArray[x];
        var apply = group.applys[y]

        var index = e.detail.value
        var groupID = this.data.groupIDArray[index]
        this.requestMoveToGroup(groupID,apply.applyID)
        console.log(e)
    },
    titleInput:function(event){
        this.data.refuseReason = event.detail.value
    },
    touchCancel:function(e){
        this.setData({
            emailShowStyle:'',
        })
    },
    touchAddNew:function(e){

        let formId = e.detail.formId
        this.data.formId = formId
        console.log('fromId = '+formId)

        console.log('alertTag = ' + this.data.alertTag)
        var reason = this.data.refuseReason
        if(!reason || reason == '' || reason == ' '){
            wx.showToast({
                title: '输入内容为空',
                icon: 'success',
                duration: 2000
            })
            return
        }
        if(reason.indexOf('@') <= 0 || reason.indexOf('.') <= 0){

            if(this.data.alertTag == 1){

            }else{
                wx.showToast({
                    title: '请输入正确的邮箱地址',
                    icon: 'success',
                    duration: 2000
                })
                return
            }
        }
        
        this.setData({
            emailShowStyle:'',
        })
   
         switch (this.data.alertTag) {
            case  1:
                //审核不同过
                this.requestAudit(4,this.data.auditApplyID,this.data.refuseReason)
                break;
            case 2:
                
                console.log('普通分组')
                this.requestSendEmail(this.data.refuseReason,1)
                break;
            case 3:
             
                console.log('费用分组')
                this.requestSendEmail(this.data.refuseReason,3)
                break;
            case 4:
             
                console.log('保险模板')
                this.requestSendEmail(this.data.refuseReason,2)
                break;
            default:
                console.log('default no match')
                break;
         }
    },
    tapAddApply:function(e){
        
        var activityID = this.data.activityID
        var howToPay = this.data.howToPay
        console.log('添加报名 '+activityID)
        wx.navigateTo({
          url: '../add_numbers/add_numbers?activityID='+activityID+'&howToPay='+howToPay,
        })
    },
    tapGetExcel:function(e){
        var that = this
        var howToPay = this.data.howToPay
        var itemitemList = ['导出表格(普通分组)', '导出表格(保险模板)']
        if(howToPay > 1){
            itemitemList = ['导出表格(普通分组)', '导出表格(费用分组)', '导出表格(保险模板)']
        }
        wx.showActionSheet({
            itemList: itemitemList,
            success: function(res) {

               console.log('tapIndex : '+res.tapIndex)
                var alertTag = ''
                if(res.tapIndex == 0){
                    alertTag = 2
                }else if(res.tapIndex == 1){
                    alertTag = (howToPay > 1)?3:4
                }else if(res.tapIndex == 2){
                    alertTag = 4
                }

                if(res.tapIndex ==0 || res.tapIndex == 1 || res.tapIndex ==2){
                    that.setData({
                        emailShowStyle:"opacity:1;pointer-events:auto;",
                        alertTitle:'输入邮箱地址',
                        placeHolder:'输入邮箱地址',
                        alertTag:alertTag,
                    })
            
                }

                
            
                
            },
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
            title: '',
            content: '暂不支持退款处理，请在超级俱乐部App或网页端进行处理',
            showCancel:false,
            success: function(res) {
                if (res.confirm) {
                console.log('用户点击确定')
                }
            }
        })

        }
    },

    //组：展开 关闭
    tapCostGroupForDisplay:function(e){
        console.log(e)
        var index = e.currentTarget.id
        var costsArray = this.data.costsArray
        costsArray[index].open = !costsArray[index].open
        this.setData({
            costsArray:costsArray
        })
    },
    //单元格：展开 关闭
    tapCostRowForDisplay:function(e){
        var x = e.currentTarget.dataset.x
        var y = e.currentTarget.dataset.y
        var resultArray = this.data.costsArray;

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
            costsArray:resultArray
        })
        console.log(e)
    },
    
    //费用分组
    tapCostSmallButton:function(e){
        var x = e.currentTarget.dataset.x
        var y = e.currentTarget.dataset.y
        var tag = e.currentTarget.dataset.tag
        var resultArray = this.data.costsArray;
        var group = resultArray[x];
        var apply = group.applys[y]

        if(tag == 1){
            //编辑
            var activityID = this.data.activityID
            var nick = apply.user.nick
            var howToPay = apply.howToPay
            wx.navigateTo({
              url: '../edit_apply/edit_apply?activityID='+activityID+'&applyID='+apply.applyID+'&nick='+nick+'&howToPay='+howToPay,
            })

        }else if(tag == 2){
            //电话
            var phone = apply.user.mobile
            wx.makePhoneCall({
                phoneNumber: phone, //此号码并非真实电话号码，仅用于测试
                success:function(){
                    console.log("拨打电话成功！")
                },
                fail:function(){
                    console.log("拨打电话失败！")
                }
            })

        }
        
        console.log('tag = '+tag)
        console.log(apply)
    },
    


    handleUserList:function(data){

        var userList = data.applys

        for(var i=0;i<userList.length;i++){
            var apply = userList[i];
            apply.fieldString = this.getApplyFieldString(apply.applyFieldTxt)
            var sex = '女'
            if(apply.user.sex == 2){
                sex = '男'
            }
            apply.baseString = sex + ' ' + apply.user.mobile
        }

        var howToPay = this.data.howToPay
        //申请退款
        var askRefundArray = new Array()
        var list1 = new Array()
        if(howToPay > 1){
            for(var i=0;i<userList.length;i++){
                var apply = userList[i];
                apply.price = this.getTicketPrice(apply.ticketID)
                apply.open = false;
                apply.payString = ''
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
                haveButton:true,
                button_text:'批量分组',
                count:notGroupArray.length,
                applys:notGroupArray,
            }
            resultArray.push(item)
        }

        if(waitPassArray.length > 0){
            var item = {
                text:'待审核',
                small_button_title:'审核',
                open:false,
                haveButton:true,
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
                haveButton:(this.data.isPayeeAccount == 1),
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
                text:'审核不通过',
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

        this.handleCostData(data,notGroupArray)


    },
    getTicketPrice:function(ticketID){
        var price = 0
        var tickets = this.data.tickets
        for(var i=0;i<tickets.length;i++){
            var ticket = tickets[i]
            if(ticket.ticketID == ticketID){
                price = ticket.cost/100.0;
                break
            }
        }
        return price
    },
    getPayString:function(payStatus,payType){
        var payString = ''
        if(payStatus == 7){
            payString = '其他支付方式 (未付款)'
        }else if(payStatus == 8){
            payString = '其他支付方式 (已付款)'
        }else if(payStatus == 4 && this.data.howToPay == 2){
            payString = '已在线退款'
        }else{
            if(payStatus == 1 ||payStatus == 6){
                payString = ''
            }else{
                payString = payType
            }
        }
        return payString
    },
    getApplyFieldString:function(fieldJson){
        var fieldString = ''
        var obj = JSON.parse(fieldJson)
        for(var key in obj){
            if(fieldString == ''){
                fieldString = key+': '+obj[key]
            }else{
                fieldString = fieldString + ' / '+key+': '+obj[key]
            }
        }
        return fieldString
    },



    //处理费用分组
    handleCostData:function(options,notGroupArray){
        var tickets = options.tickets
        var applys = notGroupArray
        var groups = options.groups

        this.data.tickets = tickets

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

       //
       for(var i=0;i<allApplyArray.length;i++){
            var apply = allApplyArray[i];
            apply.fieldString = this.getApplyFieldString(apply.applyFieldTxt)
            var sex = '女'
            if(apply.user.sex == 2){
                sex = '男'
            }
            apply.baseString = sex + ' ' + apply.user.mobile

            if(apply.howToPay > 1){
                // apply.price = this.getTicketPrice(apply.ticketID)
                apply.open = false;
                apply.payString = this.getPayString(apply.payStatus,apply.payType)
                if(apply.payString == '已在线退款'){
                    apply.payString = ''
                }
            }
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
            costsArray:resultArray
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
                    isPayeeAccount:data.isPayeeAccount,
                })
              
                that.handleUserList(data)

                var groupNameArray = new Array()
                var groupIDArray = new Array()
                for(var i=0;i<data.groups.length;i++){
                    var item = data.groups[i]
                    groupNameArray.push(item.groupName)
                    groupIDArray.push(item.groupID)
                }
                that.setData({
                    groupNameArray:groupNameArray,
                    groupIDArray:groupIDArray,
                })

            },
            function fail(res){
                
            },
        )
    },

    
    requestSendEmail:function(email,groupType){
        var that = this 
        var activityID = this.data.activityID
        getApp().api('manageApi').sendEmail({
            data:{
                activity_id:activityID,
                email:email,
                type:groupType,
            }},
            function success(res){
                console.log(res);
                wx.showToast({
                  title: '发送邮件成功',
                  duration: 2000
                })
            },
            function fail(res){
                console.log(res)
                wx.showToast({
                  title: res.data.msg,
                  duration: 2000
                })
            },
    
        )
    },

    requestMoveToGroup:function(groupID,applyIds){

        var activityID = this.data.activityID
        var that = this
        getApp().api('manageApi').moveToGroup({
            data:{
                activity_id:activityID,
                target_groupid:groupID,
                source_groupid:0,
                applyIds:applyIds,
            }},
            function success(res){
                console.log('分组成功');
                that.requestAllApplyList(activityID)
            },
            function fail(res){
                wx.showModal({
                    title: '请求失败',
                    content: res.data.msg,
                    showCancel:false,
                    success: function(res) {}
                })
            },
        
        )
     },
     //
     requestAddShareCount:function(groupID,applyIds){

        var activityID = this.data.activityID
        getApp().api('manageApi').caculateShareCount({
            data:{
                activity_id:activityID,
                type:2,
            }},
            function success(res){
                console.log('分组成功');
            },
        )
     },

     requestAudit:function(action,applyIds,refuseReason){
        var that = this
        var formId = this.data.formId
        var activityID = this.data.activityID
        getApp().api('manageApi').auditApplys({
            data:{
                refuseReason:refuseReason,
                action:action,
                apply_ids:applyIds,
                formId:formId,
            }},
            function success(res){
                that.showMessage('操作成功')
                that.requestAllApplyList(activityID)
                console.log('审核操作成功');
                
            },
            function fail(res){
                wx.showModal({
                    title: '请求失败',
                    content: res.data.msg,
                    showCancel:false,
                    success: function(res) {}
                })
            },
        )
    },

    showMessage:function(msg){
        getApp().util.showTip(this, msg)
    },

    /*****************详细信息******************/
    skip: function (e) {
    var activityId = this.data.activityId
    var clubID = this.data.clubID
    switch (e.target.id) {
      case '0':
         //报名管理

         if(this.data.howToPay == 3){
             wx.showModal({
                title: '暂不支持其它支付方式',
                content: '',
                showCancel:false,
                success: function(res) {
                }
            })
             return
         }

          wx.navigateTo({
            url: '../../organize/act_op/act_op?actID='+activityId,
            })
        break;
      case '1':
        getApp().wxService.navigateTo('index/group_page/group_page', {activityId: this.data.activityId})
        break;
      case '2':
        //活动二维码
        this.showQrCode()
        break;
      case '3':
        //查看活动
        wx.navigateTo({
          url: '../../activity/act_detail/act_detail?backOrTo=1&activityID='+activityId+'&clubID='+clubID
        })
        break;
      case '4':
       //再发一个
       wx.navigateTo({
          url: '../../organize/act_op/act_op',
        })
        break;
      case '5':
      //代理活动判读
        var that = this 
        if(this.data.activity.activityStatus == 0){
            wx.showModal({
              title: '关闭报名？',
              content: '报名页面仍可看到，只是不能继续报名',
              success: function(res) {
                if (res.confirm) {
                  that.requestCloseApply(that.data.activity.activityID)
                  console.log('用户点击确定')
                }
              }
            })
        }else{
            wx.showModal({
              title: '打开报名？',
              content: '确定打开报名？',
              success: function(res) {
                if (res.confirm) {
                  that.requestOpenApply(that.data.activity.activityID)
                  console.log('用户点击确定')
                }
              }
            })
        }
        break;
    }
  },
  

  //1:显示打开打开 0:显示关闭报名
  changeApplyStatus:function(status){
    var applyContent = '关闭报名'
    var applyImg = 'https://cdn.51julebu.com/xiaochengxu/image/close.png'
    if(status == 1){
      applyContent = '打开报名'
      applyImg = 'https://cdn.51julebu.com/xiaochengxu/image/openApply@2x.png'
    }
    console.log(status)
    this.setData({    
      lastIcon:{
        img: applyImg, 
        content:applyContent
      },
    })
  },

  tapShowQRCode:function(e){
    //显示二维码
    console.log('显示二维码')
  },


  requestMangeActivity:function(activityID){
    var that = this
    getApp().api('manageApi').getManageActivity({
      data:{
        activity_id:activityID
      }},
      function success(res) {
        console.log(res);
        let activity = res.data.activity;

        that.changeApplyStatus(activity.activityStatus)
        that.setData({
          titleDatas:[
            activity.applyCount,
            activity.likeCount,
            activity.commentCount,
            activity.shareCount
          ],
          activity:activity,
          howToPay:activity.howToPay,
        })
        
      },
      function fail(res){
        var msg = res.data.msg
        wx.showModal({
          title: '请求失败',
          content: msg,
          showCancel:false,
          success: function(res) {}
        })
        console.log(res);
      },
     )
  },
  requestCloseApply:function(activityID){
    var that = this
    getApp().api('manageApi').closeApply({
      data:{
        activity_id:activityID
      }},
      function success(res){
        console.log('关闭成功');
        console.log(res);
        that.data.activity.activityStatus = 1
        that.changeApplyStatus(1)

      },
      function fail(res){
        var msg = res.data.msg
        wx.showModal({
          title: '请求失败',
          content: msg,
          showCancel:false,
          success: function(res) {}
        })
        console.log('close failed')
        console.log(res)
      },
   
    )
  },
  requestOpenApply:function(activityID){
    var that = this
    getApp().api('manageApi').openApply({
      data:{
        activity_id:activityID
      }},
      function success(res){
        
        that.data.activity.activityStatus = 0
        that.changeApplyStatus(0)
        console.log('打开成功');
        console.log(res);
      },
      function fail(res){
        console.log('open failed')
        console.log(res)
        var msg = res.data.msg
        wx.showModal({
          title: '请求失败',
          content: msg,
          showCancel:false,
          success: function(res) {}
        })
      },
 
    )
  }, 

  showQrCode() {
    let that = this
    let qrcodeUrl = that.data.qrcodeUrl
    if (qrcodeUrl) {
        var activity = that.data.activity
        activity.qrcode = qrcodeUrl
        that.setData({
            activityCode: 'opacity:1;pointer-events:auto;',
            activity:activity,
        })
        return
    }
    //生成俱乐部二维码
    let path = 'pages/activity/act_detail/act_detail?activityID='+that.data.activityID+'&clubID='+that.data.clubID;   
    app.api("systemApi").createQrCode(path, res => {
      let qrcode = res.data.result;
      that.setData({
        qrcodeUrl:qrcode,
      })
      that.showQrCode()
    }, res => {
      app.util.showTip(this, '生成二维码失败')
    })
  },

  closeCode:function() {
    //关闭活动二维码弹窗
    this.setData({
      activityCode: ''
    })
  }, 

  onShareAppMessage: function () {
    let that = this
    this.requestAddShareCount()
    return {
      title: this.data.activity.title,
      path: '/pages/activity/act_detail/act_detail?activityID=' + that.data.activity.activityID
    }
  }


})