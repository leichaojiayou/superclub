// template/common/province/province.js
const App = getApp();
const wxService = App.wxService;
const clubApi = App.api('clubApi');
Page({
  data: {
  },
  onLoad: function (e) {
    this.setData({
      clubID: e.clubID,
      type:e.type || ''
    })
    const that = this;
    clubApi.cityList({},res=>{
      if(res.data.status==1){
        that.setData({
          datas:res.data.datas
        })
         wx.setStorageSync('place', res.data.datas)
      }
    })
  },
  chooseProvince: function (e) {
    var province = e.currentTarget.dataset.province;
    wxService.navigateTo('./city/city', {
      clubID: this.data.clubID,
      id: province,
      type:this.data.type
    });
  },
})