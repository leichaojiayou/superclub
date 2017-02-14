
Page({
  data: {
    point_color: '0,0,0',
    color: [
      '255,58,58',
      '255,174,58',
      '255,222,0',
      '125,204,77',
      '54,170,251',
      '201,115,255',
      '0,0,0',
    ],
    contents: [],
    // back: 's',
    user_choose_list: [
      { isCheck: true, text: '昵称' },
      { isCheck: true, text: '手机' },
      { isCheck: false, text: '性别' },
      { isCheck: false, text: '真实姓名' },
      { isCheck: false, text: '身份证' },
      { isCheck: false, text: '+' }
    ],
    pos: 0,
    input_auto: true,
    font_color: '0,0,0',
    // font_weight:'normal',
    isWeight: false,
    test: '',
    isChange: false,
    isShowColor: true
  },
  position: -1,
  input_content: '',
  onLoad: function () {
    console.log(this.position)
  },
  choose_img: function (e) {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        var n_con = that.data.contents
        for (var i in tempFilePaths) {
          var a = { type: 'img', text: tempFilePaths[i] + '' }
          n_con.push(a)
        }
        that.setData({
          contents: n_con
        })
      }
    })
  },
  choose_voide: function (e) {
    var that = this
    var n_con = this.data.contents
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        var a = { type: 'video', text: res.tempFilePath }
        n_con.push(a)
        that.setData({
          contents: n_con
        })
      }
    })
  }
  ,
  con_tap: function (e) {
    var pos = e.target.id
    var n_con = this.data.contents
    this.setData({
      pos: pos,
      test: n_con[pos].text,
      isChange: true
    })
  },
  ok: function (e) {
    console.log(e.detail.value)
    var that = this
    var n_con = this.data.contents
    if (e.detail.value != '') {
      if (n_con != '') {
        if (that.data.isChange == true) {
          n_con[that.data.pos].text = e.detail.value
        }
        else {
          if (n_con[that.data.pos].color == that.data.font_color && n_con[that.data.pos].weight == that.data.isWeight) {
            n_con[that.data.pos].text += e.detail.value
          }
          else {
            n_con.push({ type: 'text', text: e.detail.value, color: that.data.font_color, weight: that.data.isWeight })
          }
        }
      } else {
        n_con.push({ type: 'text', text: e.detail.value, color: that.data.font_color, weight: that.data.isWeight })
      }
      that.setData({
        contents: n_con,
        test: '',
        pos: 0,
        isChange: false
      })
    }
  },
  con_input: function (e) {
    var that = this
  }
  ,
  reset_pos: function (e) {
    this.position = -1
  },
  choose_color: function (e) {
    console.log(e.target.id)
    this.setData({
      point_color: this.data.color[e.target.id],
      font_color: this.data.color[e.target.id]
    })

  },
  choose_weight: function (e) {
    if (this.data.isChange) {
      var n_con = this.data.contents
      n_con[this.data.pos].weight = !this.data.isWeight
      this.setData({
        contents: n_con,
        isWeight: !this.data.isWeight
      })
    } else {
      this.setData({
        isWeight: !this.data.isWeight
      })
    }
  },
  test: function (e) {
    this.setData({
      test: 'sss'
    })
  },
  delete: function (e) {
    var that = this
    var n_con = this.data.contents
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        n_con.splice(e.target.id, 1)
        that.setData({
          contents: n_con
        })
      }
    })
  },
  show_color: function (e) {
    console.log('?')
    this.setData({
      isShowColor: !this.data.isShowColor
    })
  },
  user_choose: function (e) {
    console.log(e.target.id)
    var user_choose_list = this.data.user_choose_list
    user_choose_list[e.target.id].isCheck = !user_choose_list[e.target.id].isCheck
    this.setData({
      user_choose_list: user_choose_list
    })

  },
  nato_huodongleixing:function(e){
     wx.navigateTo({
        url: '../huodongleixing/huodongleixing'
      })
  },
  nato_duanxintixing:function(e){
     wx.navigateTo({
        url: '../duanxintixing/duanxintixing'
      })
  }
})