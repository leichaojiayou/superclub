//index.js
//获取应用实例
const App = getApp();
const clubApi = App.api('clubApi');
const wxService = App.wxService
Page({
  data: {
    items: [
      {
        "name": "徒步",
        "id": 1
      },
      {
        "name": "跑步",
        "id": 2
      },
      {
        "name": "骑行",
        "id": 3
      },
      {
        "name": "登山",
        "id": 4
      },
      {
        "name": "野营",
        "id": 5
      },
      {
        "name": "钓鱼",
        "id": 6
      },
      {
        "name": "球类",
        "id": 7
      },
      {
        "name": "摄影",
        "id": 8
      },
      {
        "name": "潜水",
        "id": 9
      },
      {
        "name": "自驾",
        "id": 10
      }
    ]
  },


  onLoad: function (e) {
    if (!e.type) {
      const that = this;
      let param = { data: {} };
      param.data.club_id = this.data.clubID;
      clubApi.masterProjects(param, res => {
        console.log(res);
        let items = res.data.data,
          features = e.features.split(','), ids = e.ids.split(','), preItems = [];
        for (let k = 0; k < items.length; k++) {
          items[k].isOn = false;
        }
        //封装对象
        for (let i = 0;features!=''&& i < features.length; i++) {
          // preItems.push({
          //   name: features[i],
          //   id: ids[i]
          // })
          if(features[i]!=''){
	preItems.push({
            name: features[i],
            id: ids[i]
          })
}
        }


        for (let i = 0; i < preItems.length; i++) {
          for (let j = 0; j < items.length; j++) {
            if (preItems[i].name === items[j].name) {
              items[j].isOn = true;
              preItems[i].isOn = true;
              break;
            }
          }
          if (!preItems[i].isOn) {
            preItems[i].isOn = true;
            items.splice(0, 0, preItems[i]);
          }
        }

        this.setData({
          items: items,
          clubID: e.clubID,
          type: e.type
        })
      })
    } else {
      let ids = e.features.split(',');
      let features = this.data.items
      for (var i = 0; i < ids.length; i++) {
        for (var j = 0; j < features.length; j++) {
          if (ids[i] == features[j].id) {
            features[j].isOn = true
          }
        }
      }
      this.setData({
        type: e.type,
        items: features
      })
    }
  },

  selectProject: function (e) {
    let items = this.data.items, i = 0, count = 0, index = e.currentTarget.dataset.index ;
    const itemz = this.__copyObj(this.data)
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == index) {
        items[i].isOn = !items[i].isOn;
        break;
      }
    }
    count = this.__judge();
    if (count > 3) {
      App.util.showTip(this, '最多选择3个主打项目!')
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
    let param = this.__spellFeatures().get('param'), tempFeatures = this.__spellFeatures().get('tempFeatures');
    if (!this.data.type) {
      clubApi.modifyClub(param, res => {
        if (res.data.status === 1) {
          App.event.trigger('club', {
            features: tempFeatures
          })
          App.event.trigger('clubHome', {
            features: tempFeatures
          })
          wxService.navigateBack();
        }
      })
    }
  },

  onUnload: function () {
    let tempFeatures = this.__spellFeatures().get('tempFeatures');
    App.event.trigger('club_fill', {
      features: tempFeatures
    }, {}, true);
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

  __spellFeatures: function () {
    let count = this.__judge(), projects = [], items = this.data.items, i = 0, param = { data: {} }, map = new Map(),
      tempFeatures = [];
    if (count < 4) {
      for (; i < items.length; i++) {
        if (items[i].isOn == true) {
          projects.push(items[i].id);
          tempFeatures.push({
            id: items[i].id,
            name: items[i].name
          })
        }
      }
    }
    param.data.club_id = this.data.clubID;
    param.data.features = projects.join(',') || '0,0,0'
    map.set('param', param);
    map.set('tempFeatures', tempFeatures);
    return map
  }



})
