const app = getApp();
const mineApi = app.api("mineApi");

Page({
  data: {
    datas: [],
    accountName: '',
    accountType: 0,
    realName: '',
    accountNo: '',
    bankAddr: '',
    bankSubname: '',

    province: [],
    provinceIndex: -1,
    cities: [],
    cityIndex: -1,
  },
  onLoad: function (e) {
    if (app.globalData.selectAccount) {
      this.setData({
        accountName: app.globalData.selectAccount.accountName,
        accountType: app.globalData.selectAccount.accountType,
        realName: app.globalData.selectAccount.realName
      })
      app.globalData.selectAccount = {};
    } else {
      wx.navigateBack();
    }
    this.getCityList();
  },
  getCityList: function () {
    var that = this;
    mineApi.cityList({
      data: {
      },
    },
      function (res) {
        const provinceList = res.data.datas;
        let province = [];
        for (let i = 0; i < provinceList.length; i++) {
          province.push(provinceList[i].province)
        }
        // const cityList = res.data.datas[0].cities;
        // let cities = [];
        // for (let i = 0; i < cityList.length; i++) {
        //   cities.push(cityList[i].cityName)
        // }

        that.setData({
          datas: res.data.datas,
          province: province,
          // provinceIndex: 0,
          // cities: cities,
          // cityIndex: 0
        });
        // that.data.bankAddr = that.data.cities[that.data.cityIndex];
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

  submitSetGatherAccount: function () {
    var that = this;
    mineApi.setGatherAccount({
      method: 'POST',
      data: {
        real_name: that.data.realName,
        account_no: that.data.accountNo,
        account_type: that.data.accountType,
        bank_addr: that.data.bankAddr,
        bank_subname: that.data.bankSubname
      },
    },
      function (res) {
        app.globalData.withdrawAccount = res.data.accountInfo;
        app.wxService.navigateBack(2);
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
  btn_submit() {
    // if (this.data.realName == '') {
    //   app.util.showTip(this, "请填写开户名");
    //   return;
    // }
    if (this.data.accountNo == '') {
      app.util.showTip(this, "请填写卡号");
      return;
    }
    if (this.data.bankAddr == '') {
      app.util.showTip(this, "请填写开户所在地");
      return;
    }
    if (this.data.bankSubname == '') {
      app.util.showTip(this, "请填写开户支行");
      return;
    }
    this.submitSetGatherAccount();

  },

  // inputRealName(e) {
  //   this.data.realName = e.detail.value
  // },

  inputAccountNo(e) {
    this.data.accountNo = e.detail.value
  },

  inputBankSubname(e) {
    this.data.bankSubname = e.detail.value
  },


  selectProvince: function (e) {
    const datas = this.data.datas[e.detail.value].cities;
    let cities = [];
    for (let i = 0; i < datas.length; i++) {
      cities.push(datas[i].cityName)
    }
    this.setData({
      provinceIndex: e.detail.value,
      cities: cities,
      cityIndex: 0
    })
    this.data.bankAddr = this.data.cities[this.data.cityIndex];
  },
  selectCity: function (e) {
    this.setData({
      cityIndex: e.detail.value,
    })
    this.data.bankAddr = this.data.cities[this.data.cityIndex];
  },
  clickCity: function (e) {
    if(this.data.provinceIndex < 0){
      app.util.showTip(this, "请先选择省份");
    }
  },

})