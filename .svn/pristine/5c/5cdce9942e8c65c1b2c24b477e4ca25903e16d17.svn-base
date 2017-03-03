//index.js
//获取应用实例
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService
Page({
  data: {
    items: []
  },
  //copy object
  __copyObj: function (obj) {
    let copy = {}
    if (typeof obj === 'object') {
      copy = JSON.parse(JSON.stringify(obj))
    }
    return copy;
  },

  __judge: function () {
    let items = this.data.items, i = 0, count = 0;
    for (; i < items.length; i++) {
      if (items[i].isOn == true) {
        count++;
      }
    }
    return count;
  },

  onLoad: function (e) {
    const that = this;
    let param = { data: {} };
    param.data.club_id = this.data.clubID;
    clubApi.masterProjects(param, res => {
      let items = res.data.data, i = 0, j = 0, features = e.features.split(',');
      wx.setStorageSync('masterProject', items);
      for (let k = 0; k < items.length; k++) {
        items[k].isOn = false;
      }
      for (; i < features.length; i++) {
        for (; j < items.length; j++) {
          if (features[i] === items[j].name) {
            items[j].isOn = true;
            break;
          }
        }
      }
      this.setData({
        items: items,
        clubID: e.clubID
      })
    })

  },

  selectProject: function (e) {
    let items = this.data.items, i = 0, count = 0, index = e.currentTarget.dataset.index - 1;
    const itemz = this.__copyObj(this.data)
    items[index].isOn = !items[index].isOn
    count = this.__judge();
    if (count > 3) {
      wxService.showToast('最多选择3个主打项目')
      this.setData({
        items: itemz.items
      })
    } else {
      this.setData({
        items: items
      })
    }
  },

  submit: function () {
    let count = this.__judge(), projects = [], items = this.data.items, i = 0, param = { data: {} };
    if (count < 4) {
      for (; i < items.length; i++) {
        if (items[i].isOn == true) {
          projects.push(items[i].id);
        }
      }
      param.data.club_id = this.data.clubID;
      param.data.features = projects.join(',')
      clubApi.modifyClub(param, res => {
        if (res.data.status === 1) {
          wxService.setGlobalTempClub(App, param.data);
          wxService.navigateBack();
        }
      })
    }

  }

})
