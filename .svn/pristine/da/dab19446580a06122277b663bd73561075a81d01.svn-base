const app = getApp();
const mineApi = app.api("mineApi");

Page({
    data: {
        tradeType: 0,
        dataList: [],
        start: '0',
        more: 0,
        listCount: -1,
        loading: false,
    },
    onLoad: function (options) {
        if (options.tradeType) {
            this.setData({
                tradeType: options.tradeType
            })
        }
        this.getTradeRecordList();
    },

    getTradeRecordList: function () {
        if (this.data.loading) {
            return;
        }
        this.data.loading = true;
        var that = this;
        mineApi.tradeRecordList({
            data: {
                start: that.data.start,
                count: 20,
                type: that.data.tradeType
            },
        },
            function (res) {
                var dataArr = res.data.tradeRecords;
                var dataList = that.data.dataList;
                for (var i in dataArr) {
                    dataArr[i].createTimeStr = app.util.formatTime7(dataArr[i].createTime);
                }
                //合并数组，用于上拉加载更多
                var renderArr = that.data.start == '0' ? dataArr : dataList.concat(dataArr);
                that.setData({
                    dataList: renderArr,
                    start: res.data.start,
                    more: res.data.more,
                    listCount: renderArr.length
                })
            },
            function (res) {
                console.log("fail");
            },
            function (res) {
                that.data.loading = false;
            }
        )
    },

    loadMore: function () {
        if (this.data.more == 1) {
            this.getTradeRecordList();
        }
        return false;
    },
    refresh: function () {
        this.setData({
            start: '0'
        })
        this.getTradeRecordList();
    },
    choseTradeType: function (e) {
        var tradeType = e.currentTarget.id;
        this.setData({
            tradeType: tradeType
        })
        this.refresh();
    },

    nato_tradeDetail: function (e) {
        var id = e.currentTarget.id;
        app.wxService.navigateTo('mine/trade_detail/trade_detail', {
            tradeId: id
        })
    },

})