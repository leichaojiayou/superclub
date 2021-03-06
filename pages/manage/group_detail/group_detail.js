Page({
    data: {
        groupID:0,
        groupName:'',
        applys:[],
        activityID:0,
        groupNameArray:[],
        groupIDArray:[],
        showCount:0,

        emailShowStyle:'', //弹窗三剑客
        alertTitle:'',
        placeHolder:'',
        maxLength:20,
        emailNum:'',
        refuseReason:'',
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
    tapEditGroup:function(e){
        var groupID = this.data.groupID
        var groupName = this.data.groupName
        
        this.setData({
            emailShowStyle:"opacity:1;pointer-events:auto;",
            alertTitle:'修改组名',
            placeHolder:'输入分组名称，限20字',
            emailNum:groupName,
        })
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
        console.log('alertTag = ' + this.data.alertTag)
        var reason = this.data.refuseReason
        if(!reason || reason == '' || reason == ' '){
            wx.showToast({
                title: '输入不可为空',
                icon: 'success',
                duration: 2000
            })
            return
        }
        
        this.setData({
            emailShowStyle:'',
        })
        this.requestEdit(this.data.groupID,this.data.refuseReason)
        
    },

    tapDeleteGroup:function(e){
        var that = this
        wx.showModal({
            title: '删除分组？',
            content: '删除后，分组成员不会消失',
            success: function(res) {
                if (res.confirm) {
                that.requestDelete(that.data.groupID)
                console.log('用户点击确定')
                }
            }
        })
    },
    changeBarTitle:function(title){
        this.data.groupName = title 
         wx.setNavigationBarTitle({
          title: title,
        })
    },
    tapApplySmallButton:function(e){
        var index = e.currentTarget.dataset.id
        var tag = e.currentTarget.dataset.tag
        var apply = this.data.applys[index]
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
    },
    tapGroupPickerChanged:function(e){
        console.log(e)
        var index = e.currentTarget.id
        var apply = this.data.applys[index]

        var pickerIndex = e.detail.value
        var targetID = this.data.groupIDArray[pickerIndex]
        this.requestMoveToGroup(this.data.groupID,targetID,apply.applyID)
        
    },

    onLoad:function(options){
  
        var tickets = wx.getStorageSync('manage_group_detail')
        var groupNameArray = wx.getStorageSync('manage_group_names')
        var groupIDArray = wx.getStorageSync('manage_group_ids')

        var groupNames = new Array()
        groupNames.push('未分组')
        for(var i=0;i<groupNameArray.length;i++){
            groupNames.push(groupNameArray[i])
        }
        

        var groupIDS = new Array()
        groupIDS.push('0')
        for(var i=0;i<groupIDArray.length;i++){
            groupIDS.push(groupIDArray[i])
        }


        this.setData({
            groupID:options.groupID,
            groupName:options.groupName,
            tickets:tickets,
            activityID:options.activityID,
            groupIDArray:groupIDS,
            groupNameArray:groupNames,
        })
        this.changeBarTitle(options.groupName)
        console.log('groupDetail on Load')
        this.requestGroupMembers(options.groupID)
    },
    onShow: function () {
        // 页面显示
        if(this.data.showCount == 1){
            this.requestGroupMembers(this.data.groupID)
        }
        this.data.showCount = 1
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
    getPayString:function(apply){

        var payType = apply.payType
        var payStatus = apply.payStatus

        var payString = ''
        if(payStatus == 7){
            payString = '其他支付方式 (未付款)'
        }else if(payStatus == 8){
            payString = '其他支付方式 (已付款)'
        }else if(payStatus == 4 && apply.howToPay == 2 ){
            payString = '已在线退款'
        }else{
            if(payStatus == 1 ||payStatus == 6){
                payString = ''
            }else{
                payStrin = payType
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
     handleUserList:function(userList){

        if(!userList ){
            console.log('不存在'+userList)
            this.setData({
               applys:[],
           })
            return
        }

        for(var i=0;i<userList.length;i++){
            var apply = userList[i];
            apply.fieldString = this.getApplyFieldString(apply.applyFieldTxt)
            var sex = '女'
            if(apply.user.sex == 2){
                sex = '男'
            }
            apply.baseString = sex + ' ' + apply.user.mobile

            if(apply.howToPay > 1){
                apply.price = this.getTicketPrice(apply.ticketID)
                apply.open = false;
                apply.payString = this.getPayString(apply)
            }
        }
        this.setData({
            applys:userList,
        })
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
                that.handleUserList(applys)
            },
            function fail(res){
                console.log(res)
            },
         
        )
    },
    requestMoveToGroup:function(sourceID,targetID,applyIds){

        var activityID = this.data.activityID
        var that = this
        getApp().api('manageApi').moveToGroup({
            data:{
                activity_id:activityID,
                target_groupid:targetID,
                source_groupid:sourceID,
                applyIds:applyIds,
            }},
            function success(res){
                console.log('分组成功');
                that.requestGroupMembers(that.data.groupID)
            },
            function fail(res){

            },
        
        )
     },
     requestDelete:function(groupID){
        var that = this 
        getApp().api('manageApi').deleteGroupName({
            data:{
                group_id:groupID,
            }},
            function success(res){
                console.log('删除本组成功');
                console.log(res);
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
            },
            function fail(res){
                console.log(res)
            },
        )
    },
    requestEdit:function(groupID,groupName){
        var that = this 
        getApp().api('manageApi').editGroupName({
            data:{
                group_id:groupID,
                group_name:groupName
            }},
            function success(res){
                that.changeBarTitle(that.data.refuseReason)
                wx.showToast({
                  title: '修改组名成功',
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



})