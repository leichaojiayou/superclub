// pages/edit/edit.js
Page({
  data: {
    status:2,
    // array index bindPickerChange是支付状态选择相关数据
    array: ['待付款，设为已付款', '已付款'],
     index: 0,
    //  array1 index1 bindPickerChange1是骑行服选择相关数据
    array1: ['选手骑行服xs', '选手骑行服s','选手骑行服m'],
    index1: 0,
    //  array2 index2 bindPickerChange2是分组选择相关数据
    array2: ['未分组', '第一组','第二组'],
    index2: 0,

    rightarrow:'../images/right-errow.png',
    item:
    { t1: '票价', price: '￥270', t2: '潜水22人组票价的名字可以有这么' }
  },
  // 支付方式选择
   bindPickerChange: function(a) {
    console.log('picker发送选择改变，携带值为', a.detail.value)
    this.setData({
      index: a.detail.value
    })
  },
  // 选择衣服码数
  bindPickerChange1: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index1: e.detail.value
    })
  },
  // 选择分组
  bindPickerChange2: function(e) {
    console.log(e)
    this.setData({
      index2: e.detail.value
    })
  },
})