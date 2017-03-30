//***********************************时间控件************************************************************************
function initDateControl(that) {
  // 初始化时间日期
  var now = new Date()
  var years = []
  var months = []
  var hours = []
  var minutes = []
  var day28 = []
  var day29 = []
  var day30 = []
  var day31 = []
  var nowyear = 0;
  var j = 0
  for (var i = 1990; i <= 2050; i++) {
    years.push(i)
    if (now.getFullYear() == i) {
      nowyear = j
    }
    j++
  }

  for (var i = 1; i <= 12; i++) {
    months.push(i)
  }

  for (var i = 1; i <= 28; i++) {
    day28.push(i)
  }

  for (var i = 1; i <= 29; i++) {
    day29.push(i)
  }
  for (var i = 1; i <= 30; i++) {
    day30.push(i)
  }
  for (var i = 1; i <= 31; i++) {
    day31.push(i)
  }
  for (var i = 0; i <= 23; i++) {
    hours.push(i)
  }
  for (var i = 0; i <= 59; i++) {
    minutes.push(i)
  }

  that.setData({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: '00',
    years: years,
    months: months,
    days: day31,
    hours: hours,
    minutes: minutes,
    day28: day28,
    day29: day29,
    day30: day30,
    day31: day31,
    zindex: -1,
    scrolly: true,
    value: [nowyear, now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes()]
  })
}

function bindChange(e, that) {

  const val = e.detail.value

  var y = that.data.years[val[0]];
  var m = that.data.months[val[1]];
  var ds = [];
  if (m == 2) {//2月分
    if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) {
      ds = that.data.day29
    } else {
      ds = that.data.day28
    }
  } else {//31天
    if (m == 1 || 3 || 5 || 7 || 8 || 10 || 12) {
      ds = that.data.day30

    } else {//30天
      ds = that.data.day31

    }
  }
  that.setData({
    days: ds,
    year: that.data.years[val[0]],
    month: that.data.months[val[1]],
    day: that.data.days[val[2]],
    hour: that.data.hours[val[3]],
    minute: that.data.minutes[val[4]],
  })
  // 小于10的数值补上0
  if (that.data.months[val[1]] < 10) {
    that.setData({
      month: '0' + that.data.months[val[1]],
    })
  }
  if (that.data.days[val[2]] < 10) {
    that.setData({
      day: '0' + that.data.days[val[2]],
    })
  }
  if (that.data.hours[val[3]] < 10) {
    that.setData({
      hour: '0' + that.data.hours[val[3]],
    })
  }
  if (that.data.minutes[val[4]] < 10) {
    that.setData({
      minute: '0' + that.data.minutes[val[4]],
    })
  }
}
function hideModal(that) {
  that.setData({ modalShowStyle: "" });

}
function togglePicker(that) {
  var indexs = []
  var time = that.data.time
  if (time == 0 || time == undefined) {
    indexs = this.formatTimeIndex(new Date().getTime(), that)
  } else {
    indexs = this.formatTimeIndex(time, that)
  }

  // if (that.data.actId == '' || that.data.actId == 0) {//发布活动
  //   var date = new Date()
  //   var year = date.getFullYear()
  //   var month = date.getMonth() + 1
  //   var day = date.getDate()
  //   var hour = date.getHours()
  //   var minute = date.getMinutes()
  //   var second = date.getSeconds()
  //   var datemap = [year, month, day].map(that.formatNumber);
  //   var nowtime = datemap[0] + '/' + datemap[1] + '/' + datemap[2] + ' ' + "09:00"
  //   var endtime = datemap[0] + '/' + datemap[1] + '/' + datemap[2] + ' ' + "18:00"
  //   begin = new Date(nowtime).getTime()
  //   end = new Date(endtime).getTime()
  //   deadline = new Date(nowtime).getTime()
  // } else {//编辑活动
  //   begin = that.data.begin
  //   end = that.data.end
  //   deadline = that.data.deadline
  // }

  // if (flag == 'begin') {
  //   indexs = this.formatTimeIndex(begin)
  // } else if (flag == 'end') {
  //   indexs = this.formatTimeIndex(end)
  // } else if (flag == 'deadline') {
  //   indexs = this.formatTimeIndex(deadline)
  //   that.setData({
  //     isShowTextarea: false
  //   })
  // }

  that.setData({
    modalShowStyle: 'opacity:1',
    zindex: 102,
    scrolly: false,
    year: that.data.years[indexs[0]] < 10 ? "0" + that.data.years[indexs[0]] : that.data.years[indexs[0]],
    month: that.data.months[indexs[1]] < 10 ? "0" + that.data.months[indexs[1]] : that.data.months[indexs[1]],
    day: that.data.day31[indexs[2]] < 10 ? "0" + that.data.day31[indexs[2]] : that.data.day31[indexs[2]],
    hour: that.data.hours[indexs[3]] < 10 ? "0" + that.data.hours[indexs[3]] : that.data.hours[indexs[3]],
    minute: that.data.minutes[indexs[4]] < 10 ? "0" + that.data.minutes[indexs[4]] : that.data.minutes[indexs[4]],
    value: indexs
  })
}

function touchCancel(event, that) {
  var timetxt = that.data.timetxt
  if (timetxt == 'deadline') {
    that.setData({ zindex: -1, scrolly: true, isShowTextarea: true })
  } else {
    that.setData({ zindex: -1, scrolly: true })
  }
  that.setData({ modalShowStyle: "" });
}
function touchAdd(event, that) {
  var timetxt = that.data.year + '年' + that.data.month + '月' + that.data.day + '日 ' + that.data.hour + ':' + that.data.minute
  var time = that.data.year + '-' + that.data.month + '-' + that.data.day + ' ' + that.data.hour + ':' + that.data.minute + ':00'

  time = time.replace(/-/g, "/");

  var data = new Date(time).getTime()
  that.setData({
    time: data,
    timetxt: timetxt,
    modalShowStyle: "",
    zindex: -1,
    scrolly: true
  })
}
function formatTimeIndex(datetime, that) {
  let date = new Date(datetime)
  var yearindex = 0
  for (var i = 0; i < that.data.years.length; i++) {
    if (that.data.years[i] == date.getFullYear()) {
      yearindex = i;
    }
  }
  var index = [yearindex, date.getMonth(), date.getDate() - 1, date.getHours(), date.getMinutes()];
  return index;
}
//***********************************时间控件************************************************************************


module.exports = {
  initDateControl: initDateControl,
  bindChange: bindChange,
  hideModal: hideModal,
  togglePicker: togglePicker,
  touchCancel: touchCancel,
  touchAdd: touchAdd,
  formatTimeIndex: formatTimeIndex
}