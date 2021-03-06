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
        formId: ''
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
                    realName: res.data.realName,
                })
            },
            function (res) {
                if (app.util.getErrorMsg(res).content) {
                    app.util.showTip(that, app.util.getErrorMsg(res).content);
                }
            },
            function (res) {
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
                amount: that.data.withdrawMoney,
                formId: that.data.formId
            },
        },
            function (res) {
                if (that.data.idverify != 2 && that.data.idverify != 3) {
                    app.globalData.realName = null;
                }
                app.globalData.submitIdverify = true;
                app.globalData.withdrawSuccess = res.data;
                app.wxService.redirectTo('mine/withdraw_success/withdraw_success')
            },
            function (res) {
                if (res.data.msg) {
                    app.util.showTip(that, res.data.msg);
                }
            },
            function (res) {
            }

        )
    },

    inputWithdrawMoney(e) {
        this.data.withdrawMoney = e.detail.value
    },

    formSubmit: function (e) {
        if (this.data.idverify != 2 && this.data.idverify != 3) {
            if (this.data.realName == '' || this.data.frontImgPath == '' || this.data.backImgPath == '' || this.data.personImgPath == '') {
                app.util.showTip(this, "请先上传完整身份认证资料");
                return;
            }
        }
        if (this.data.withdrawAccount == null || this.data.withdrawAccount.accountID == null || this.data.withdrawAccount.accountID == '') {
            app.util.showTip(this, "请设置提现账户");
            return;
        }
        if (this.data.withdrawMoney == '' || this.data.withdrawMoney == 0) {
            app.util.showTip(this, "请输入提现金额");
            return;
        }
        this.data.formId = e.detail.formId;
        if (this.data.idverify != 2 && this.data.idverify != 3) {
            this.uploadFrontImage();
        } else {
            this.submitMoneyWithdraw();
        }

    },

    nato_setWithdrawAccount: function () {
        if (this.data.idverify != 2 && this.data.idverify != 3) {
            if (this.data.realName == '' || this.data.frontImgPath == '' || this.data.backImgPath == '' || this.data.personImgPath == '') {
                app.util.showTip(this, "请先上传完整身份认证资料");
                return;
            } else {
                app.globalData.realName = this.data.realName;
            }
        }
        app.wxService.navigateTo('mine/set_withdraw_account/set_withdraw_account')
    },
    nato_withdrawRecord: function (e) {
        app.wxService.navigateTo('mine/trade_record/trade_record', {
            tradeType: 5
        })
    },
    nato_withdrawRule: function (e) {
        app.wxService.navigateTo('mine/withdraw_rule/withdraw_rule')
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
            app.util.showTip(this, "上传身份证正面照片失败");
        })

    },
    uploadBackImage() {
        if (idcardBack != '') {
            this.uploadPersonImage();
            return;
        }
        let localPath = this.data.backImgPath
        systemApi.uploadImage(localPath, res => {
            console.log(res);
            idcardBack = res.data.url;
            this.uploadPersonImage();
        }, res => {
            //上传图片失败
            app.util.showTip(this, "上传身份证反面照片失败");
        })

    },
    uploadPersonImage() {
        if (idcardWithperson != '') {
            this.submitMoneyWithdraw();
            return;
        }
        let localPath = this.data.personImgPath
        systemApi.uploadImage(localPath, res => {
            console.log(res);
            idcardWithperson = res.data.url;
            this.submitMoneyWithdraw();
        }, res => {
            //上传图片失败
            app.util.showTip(this, "上传手持本人身份证照片失败");
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