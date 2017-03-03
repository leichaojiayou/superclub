// template/common/city/city.js
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService;
Page({
  data: {
  },
  onLoad: function (e) {
    let place = wx.getStorageSync('place');
    this.setData({
      datas: place
    })
    const datas = this.data.datas, length = datas.length;
    this.setData({
      clubID: e.clubID,
      id: e.id,
      type: e.type
    })
    for (let i = 0; i < length; i++) {
      if (datas[i].province == e.id) {
        this.setData({
          cities: datas[i].cities
        })

      }
    }
    // 页面初始化 e为页面跳转所带来的参数
  },
  chooseCity: function (e) {
    let cityId = e.currentTarget.dataset.cityid,
      param = {
        data: {}
      },
      data = this.data,
      cityName = e.currentTarget.dataset.cityname,
      that = this;
    param.data.club_id = data.clubID;
    param.data.city_id = cityId;
    if (!data.type) {
      clubApi.modifyClub(param, res => {
        if (res.data.status == 1) {
          App.event.trigger('club', {
            'city.province': that.data.id,
            'city.cityName': cityName
          })
          App.event.trigger('clubHome', {
            'city.province': that.data.id,
            'city.cityName': cityName
          })
          wxService.navigateBack(2);
        }
      });
    } else { //创建俱乐部时
      App.event.trigger('club_fill', {
        'location': cityName,
        'cityId': param.data.city_id
      },{},true)

      wxService.navigateBack(2);
    }
  }
})