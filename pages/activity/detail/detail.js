// pages/detail/detail.js
Page({
  data: {
    item: {
      title: '汕头市马拉松运动协会2017黄河口东营-国际马拉松赛报名',
      name: '用户昵称',
      pudata: '2017.1.28',
      readed: '2.3万',
      like: '2222',
      place: '北京',
      activity_data: '2017.1.1~2017.7.31',
      cost: '$200~$300',
      sponsor: '广州海珠区'
    },
    status: '0',

    detail_msg: {
      content:'大白，卖的一手好萌一波三折，妙趣横生，悬疑和温情，搞笑与动作',
      alreadyregistered: [
        {
          name: '冰冰',
          time: '26分钟以前'
        },
        {
          name: '冰冰',
          time: '26分钟以前'
        },
        {
          name: '冰冰',
          time: '26分钟以前'
        }],
        money:'123',
        remain:'123' 
    },
    comment:[{
      img:'../images/user.png',
      name:'Superman',
      time:'26分钟前',
      content:'最后，‘i will always with you! 没有人能在我的bgm里打赢我 '},{

      img:'../images/user.png',
      name:'Superman',
      time:'26分钟前',
      content:'最后，‘i will always with you! 没有人能在我的bgm里打赢我 '
      }]

  },
  changecolor: function (e) {
    if (e.target.id == '0') {
      this.setData({
        status: '0'
      })
    } else if (e.target.id == '1') {
      this.setData({
        status: '1'
      })
    } else if (e.target.id == '2') {
      this.setData({
        status: '2'
      })
    }
  },
  showmore:function(e){
    console.log(e);
  }

})