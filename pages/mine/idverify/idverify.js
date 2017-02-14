const app = getApp();
const mineApi = app.api("mineApi");
var systemApi = app.api("systemApi")
var idcardRight = '';
var idcardBack = '';
var idcardWithperson = '';

Page({
    data: {
        applySucceed: '',
        realName: '',
        frontImgPath: '',
        backImgPath: '',
        personImgPath: ''
    },
    submitIdverify: function () {
        var that = this;
        mineApi.idverify({
            method: 'POST',
            data: {
                real_name: that.data.realName,
                idcard_right: idcardRight,
                idcard_back: idcardBack,
                idcard_withperson: idcardWithperson
            },
        },
            function (res) {
                wx.showToast({
                    title: "身份认证已提交审核,请耐心等待",
                    icon: "success"
                })
                wx.navigateBack();   //返回上一个页面
            },
            function (res) {
                console.log("fail");
            },
            function (res) {
                app.util.getErrorMsg(res);
            }

        )
    },
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
    btn_done: function () {
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
        this.uploadFrontImage();
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
            this.submitIdverify();
        }, res => {
            //上传图片失败
            console.log("上传第三张图片失败");
        })

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