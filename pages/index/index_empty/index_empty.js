// pages/index_empty/index_empty.js
Page({
  data: {
    header_img: '../images/user.png',
    arrowright: '../images/right-errow.png',
    body_img: '../images/empty@2x.png',
    username: '李新华',
    imgUrls: [
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    color: 'rgb(61,209,164)',
    txt_a: '报名中',
    item: [{
      text: '潍坊市马拉松运动协会2017黄河口东营-国际马拉松赛报名潍坊市马拉松运动协会2017黄河口东营潍坊市马拉松运动协会2017黄河口东营',
      time: '2017.12.21 17:30',
      img: '../images/club-avatar@2x.png',
      text_ab: '俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部俱乐部',
      price: '￥230',
      txt_a: '报名中',
      color: 'rgb(61,209,164)'
    }],
    // item1: [
    //   { txt: '报名中', color: 'rgb(61,209,164)' }
    // ]
  },
  nato_create_club: function (e) {
    wx.navigateTo({
      url: '../create_club/create_club'
    })
  }
})