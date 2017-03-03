class Event {
    constructor() {
        this.map = new Map();
        this.events = {};
    }

    /**
     * 添加事件监听器
     * @param name 页面数据绑定对象的名字
     * @param that page 对象
     * @param reLoad  通知是否加载页面  {
     *                                  isReloadClub:true,
     *                                  isReloadActivity:true
     *                                  }
     */
    addListener(name, that) {
        let map = this.map, obj = {};
        if (map.has(name)) {
            console.info('the ' + name + ' callback function will be rewrite!');
        }
        let data = that.data;
        if (data)
            for (let i in data) {
                if (typeof data[i] === 'object' && name === i) {
                    obj.prototypeObj = data[i];
                    break;
                }
            }
        if (!obj.prototypeObj) {
            obj.prototypeObj = data
        }
        obj.this = that;
        obj.fn = (e, v) => {
            let param = e;
            param.reLoad = v;
            that.setData(param);
        }
        map.set(name, obj);
        this.map = map;
    }


    /**
     * 触发 监听器
     * @param name 监听器名称
     * @param obj  上一级页面对象的属性 {
     *                                  clubId :100001    
     *                                  }
     * @param reLoad  通知是否加载页面  {
     *                                  isReloadClub:true,
     *                                  isReloadActivity:true
     *                                  }
     * @param isData 
     *              true : 页面没有绑定对象 直接对data设值 
     */
    trigger(name, obj, reLoadObj,isData) {
        if (name) {
            let eventObj = this.map.get(name);
            if (eventObj) {
                let data =  eventObj.prototypeObj;
                if (data && obj&&!isData) {
                    let param = {};
                    for (let key in obj) {
                        param[name + '.' + key] = obj[key];
                    }
                    eventObj['fn'].call(eventObj['this'], param, reLoadObj);
                }else{
                    eventObj['fn'].call(eventObj['this'], obj, reLoadObj);
                }

            }
        } else {
            console.log('Don\'t have ' + name || '' + ' event')
        }
    }

    removeListener(name) {
        if (name) {
            this.map.delete(name);
            console.warn('the '+name+' event listener is distory')
        } else {
            console.debug('Don\'t have ' + name + ' callback ,what could not delete it');
        }

    }

    getEventList() {
        let fn = new Array();
        for (let key of this.map) {
            fn.push(key);
        }
        return fn;

    }

    on(name, self, callback) {
        var tuple = [self, callback];
        var callbacks = this.events[name];
        if (Array.isArray(callbacks)) {
            callbacks.push(tuple);
        }
        else {
            this.events[name] = [tuple];
        }
    }

    remove(name, self) {
        var callbacks = this.events[name];
        if (Array.isArray(callbacks)) {
            this.events[name] = callbacks.filter((tuple) => {
                return tuple[0] != self;
            })
        }
    }
    emit(name, data) {
        var callbacks = this.events[name];
        if (Array.isArray(callbacks)) {
            callbacks.map((tuple) => {
                var self = tuple[0];
                var callback = tuple[1];
                callback.call(self, data);
            })
        }
    }
}



module.exports = Event