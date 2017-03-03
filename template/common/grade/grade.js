// template/common/grade/grade.js
const util = require('../../../utils/util')
Page({
  data: {

  },
  onLoad: function (e) {
    const score = e.score;
    const url = util.getClubImg(score);
    let name = '';
    if (score < 200) {
      name = '俱乐部'
    } else if (score < 600) {
      name = '星级俱乐部'
    } else if (score < 2000) {
      name = '二星俱乐部'
    } else if (score < 5000) {
      name = '三星俱乐部'
    } else if (score < 10000) {
      name = '四星俱乐部'
    } else {
      name = '五星俱乐部'
    }
    this.setData({
      score: score,
      name:name,
      url:url
    })
  },
})