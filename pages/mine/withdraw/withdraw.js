const app = getApp();
const mineApi = app.api("mineApi");
var systemApi = app.api("systemApi")
var idcardRight = '';
var idcardBack = '';
var idcardWithperson = '';

Page({
    data: {
        data: {},
        idverify: 0,
        withdrawAccount: {},
        canGetMoney: '0.00',
        withdrawMoney: '',
        realName: '',
        frontImgPath: '',
        backImgPath: '',
        personImgPath: '',
        applySucceed: '',
    },
    onLoad: function () {
        this.getGatherAccountList();
    },
    onShow: function () {
        if (app.globalData.withdrawAccount) {
            this.setData({
                withdrawAccount: app.globalData.withdrawAccount
            })
            // app.globalData.withdrawAccount = {};
        }
    },
    getGatherAccountList() {
        var that = this;
        mineApi.gatherAccountList({
            data: {
            },
        },
            function (res) {
                that.setData({
                    data: res.data,
                    idverify: res.data.idverify,
                    canGetMoney: res.data.canGetMoney,
                })
            },
            function (res) {
                console.log("fail");
            },
            function (res) {
                app.util.getErrorMsg(res);
            }
        )
    },

    submitMoneyWithdraw: function () {
        var that = this;
        mineApi.moneyWithdraw({
            method: 'POST',
            data: {
                real_name: that.data.realName,
                idcard_right: idcardRight,
                idcard_back: idcardBack,
                idcard_withperson: idcardWithperson,
                account_type: that.data.withdrawAccount.accountType,
                account_no: that.data.withdrawAccount.accountNo,
                account_id: that.data.withdrawAccount.accountID,
                amount: that.data.withdrawMoney
            },
        },
            function (res) {
                app.globalData.withdrawSuccess = res.data;
                app.wxService.redirectTo('mine/withdraw_success/withdraw_success')
            },
            function (res) {
                console.log("fail");
                wx.hideToast();
                if (res.data.msg) {
                    wx.showToast({
                        title: res.data.msg,
                        icon: "success"
                    })
                }
            },
            function (res) {
                app.util.getErrorMsg(res);
            }

        )
    },

    inputWithdrawMoney(e) {
        this.data.withdrawMoney = e.detail.value
    },

    btn_done: function () {
        if (this.data.withdrawAccount == null || this.data.withdrawAccount.accountID == null || this.data.withdrawAccount.accountID == '') {
            wx.showToast({
                title: "请设置提现账号",
                icon: "success"
            })
            return;
        }
        if (this.data.withdrawMoney == null || this.data.withdrawMoney == '') {
            wx.showToast({
                title: "请输入提现金额",
                icon: "success"
            })
            return;
        }
        if (this.data.withdrawMoney==0) {
            wx.showToast({
                title: "提现金额不可为0",
                icon: "success"
            })
            return;
        }
        if (this.data.withdrawMoney > this.data.canGetMoney) {
            wx.showToast({
                title: "输入金额大于可提现金额",
                icon: "success"
            })
            return;
        }
        if (this.data.idverify != 2 && this.data.idverify != 3) {
            this.uploadFrontImage();
        } else {
            this.submitMoneyWithdraw();
        }

    },

    nato_setWithdrawAccount: function () {
        if (this.data.idverify != 2 && this.data.idverify != 3) {
            if (this.data.realName == '') {
                wx.showToast({
                    title: "请输入真实姓名",
                    icon: "success"
                })
                return;
            }
            if (this.data.frontImgPath == '' || this.data.backImgPath == '' || this.data.personImgPath == '') {
                wx.showToast({
                    title: "请选择图片",
                    icon: "success"
                })
                return;
            }
        }
        app.wxService.navigateTo('mine/set_withdraw_account/set_withdraw_account')
    },
    nato_withdrawRecord: function (e) {
        app.wxService.navigateTo('mine/withdraw_record/withdraw_record')
    },
    

    //********************身份认证*************************

    inputRealName(e) {
        this.data.realName = e.detail.value
    },

    take_front_img: function () {
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    frontImgPath: res.tempFilePaths[0]
                })
                idcardRight = '';
            }
        });

    },
    take_back_img: function () {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                that.setData({
                    backImgPath: res.tempFilePaths[0]
                })
                idcardBack = '';
            }
        });
    },
    take_person_img: function () {
        this.showCheck();
    },



    uploadFrontImage() {
        if (idcardRight != '') {
            this.uploadBackImage();
            return;
        }

        let localPath = this.data.frontImgPath
        systemApi.uploadImage(localPath, res => {
            console.log(res);
            idcardRight = res.data.url;
            this.uploadBackImage();
        }, res => {
            //上传图片失败
            console.log("上传第一张图片失败");
        })

    },
    uploadBackImage() {
        if (idcardBack != '') {
            this.uploadBackImage();
            return;
        }
        let localPath = this.data.backImgPath
        systemApi.uploadImage(localPath, res => {
            console.log(res);
            idcardBack = res.data.url;
            this.uploadPersonImage();
        }, res => {
            //上传图片失败
            console.log("上传第二张图片失败");
        })

    },
    uploadPersonImage() {
        if (idcardWithperson != '') {
            this.uploadBackImage();
            return;
        }
        let localPath = this.data.personImgPath
        systemApi.uploadImage(localPath, res => {
            console.log(res);
            idcardWithperson = res.data.url;
            this.submitMoneyWithdraw();
        }, res => {
            //上传图片失败
            console.log("上传第三张图片失败");
        })

    },

    hideModal() {
        this.setData({ applySucceed: '' });
    },
    showCheck: function (event) {
        this.setData({ applySucceed: 'opacity:1;pointer-events:auto;' })
    },
    closeCheck: function (event) {
        this.hideModal();
    },

    toast_btn_upload() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success: function (res) {
                that.setData({
                    personImgPath: res.tempFilePaths[0]
                })
                idcardWithperson = '';
            }
        });
        this.closeCheck();

    },
    toast_btn_camera() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success: function (res) {
                that.setData({
                    personImgPath: res.tempFilePaths[0]
                })
                idcardWithperson = '';
            }
        });
        this.closeCheck();
    }
})