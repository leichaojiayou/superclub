var app = getApp()
const utils = app.util;
import storage from '../../../utils/storage.js'
import pick from '../../../template/organize/picker.js'
var organizeApi = app.api("organizeApi");
var systemApi = app.api("systemApi")
const date = new Date()

Page({
  data: {
    point_color: '#000000',
    color: [
      '#ff3a3a',
      '#ffae3a',
      '#ffde00',
      '#7dcc4d',
      '#36aafb',
      '#c973ff',
      '#000000',
    ],
    contents: [],
    contEditSatus: true,
    actContent: "",
    // back: 's',
    applyFields: [
      { isCheck: true, canEidt: false, text: '昵称', option: "", defaultValue: "请填写昵称", fieldName: "昵称", fieldType: 1 },
      { isCheck: true, canEidt: false, text: '手机', option: "", defaultValue: "请填写手机", fieldName: "手机", fieldType: 1 },
      { isCheck: false, canEidt: false, text: '性别', option: "男，女", defaultValue: "男", fieldName: "性别", fieldType: 2 },
      { isCheck: false, canEidt: false, text: '真实姓名', option: "", defaultValue: "", fieldName: "真实姓名", fieldType: 1 },
      { isCheck: false, canEidt: false, text: '身份证号', option: "", defaultValue: "", fieldName: "身份证号", fieldType: 1 }
    ],
    isPublic: false,
    moreApplyIcon: false,


    // font_weight:'normal',

    windowWidth: "0px",
    //日期控件
    years: [],
    year: date.getFullYear(),
    months: [],
    days: [],
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: [],
    hour: date.getHours(),
    minutes: [],
    minute: '00',
    day28: [],
    day29: [],
    day30: [],
    day31: [],
    value: [],
    starttime: '开始时间',
    modalShowStyle: '',
    zindex: -1,
    scrolly: true,
    timetxt: "",
    deadlineTxt: "",	//	报名截止时间（毫秒时间戳）
    beginTxt: "",	//	活动开始时间（毫秒时间戳）
    endTxt: "",

    actInfo: {},
    actId: '',
    agreeCheck: true,
    /********************************************************************************************************************************* */
    title: "",	//	活动主题（标题）
    //  content: "",	//	活动内容
    max_apply_count: -1,	//	活动最多报名人数, 如果不限制传入-1
    deadline: 0,	//	报名截止时间（毫秒时间戳）
    begin: 0,	//	活动开始时间（毫秒时间戳）
    end: 0,	//	活动截止时间（毫秒时间戳）
    lat: 0,	//	经度
    lng: 0,	//	纬度
    address: "",	//	活动地址
    apply_check: 0,	//	是否开启报名审核 1:是 0:否 默认: 0
    fields: "",	//	非必需字段
    cost: 0,	//	如果是免费就传0 收费就传具体的数字 默认: 免费
    cost_desc: "",	//	活动费用描述
    guide: "",	//	报名须知
    auto_create_group: 0,	//	是否自动创建群 1:创建 0:不创建 默认: 0
    cover: "",	//	显示指定封面 未指定时提取活动内容第一张图
    act_type: 1,	//	活动类型（1：俱乐部公开活动 2：俱乐部内部活动 3：私人活动）
    helper_apply: 1,	//	是否开启帮人报名功能 1:是 2:否 默认: 1
    user_lat: 0,	//	发布活动时，用户所在的纬度, 需要增大一百万倍再传过来
    user_lng: 0,	//	发布活动时，用户所在的经度, 需要增大一百万倍再传过来
    user_location: "",	//	发布活动时，用户所在的一级城市
    act_location: "",	//	活动地址（发布活动时，标记的活动位置，即参数address）所在一级城市
    act_type: 1,	//	活动类型（1：俱乐部公开活动 2：俱乐部内部活动 3：私人活动）
    need_to_pay: 1,	//	是否是收费活动（1：不收费 2：收费）默认 1: 不收费
    how_to_pay: 1,	//	付费方式（1：无(包括该版本前的非在线收费活动) 2：在线付费）默认：1:无
    payee_account: 1,	//	收款账户ID（即收款人用户ID，tips：不是会员号）
    cancel_apply: 1,	//	是否可以取消报名，1是可以，0是不可以
    begin_sms_time: 24 * 3600,//活动开始前短信提醒时间，默认24小时前，单位：秒， 如活动开始一小时前提醒，begin_sms_time=3600. 不发送短信传-1
    // begin_sms_msg	:	"您报名的活动（xxxxxxx）将于1月26日18时49分开始，打开超级俱乐部APP查看详情，或点击 s.iweju.com 下载	",	//	活动开始前的短信内容
    data_type: 0,//	数据类型，0是发布正式活动(默认)，1是保存为草稿
    act_online: 1,//1线上，2线下
    /**********************************************************************************************************************************/
    showPayButton: true,
    tickets: [],
    tickesCount: 0,
    payee: {},
    president: {},
    image: "",
    beginSmsTimes: [],
    cover_img: "",
    haveApplyNum: 0, //已报名人数
    actFeeText: "免费",//费用说明
    smsText: "活动开始前24小时",
    actTypeTxt: "公开活动",
    isPresident: 0,
    clubId: "",
    showInfo: "none",
    isShowTextarea: false
  },
  position: -1,
  input_content: '',

  onLoad: function (e) {
    // storage.saveSync("255c4227fb0b88f6000083e1905b7ebf")

    //var actId = '592336'
    app.globalData.applyFieldsObject = {}
    app.globalData.modelImgSrc = ""
    app.globalData.actFeeObject = {}
    app.globalData.smsTimes = {}
    app.globalData.actType = ""

    var actId = e.actID;
    var that = this;

    organizeApi.checkActDetail({//活动校验
      data: {
        act_type: 1
      }
    },
      function (res) {
        //var payee = res.data.payee
        // var president = res.data.president
        // var isPresident = res.data.isPresident
        // var clubId = res.data.clubID
        that.setData({ payee: res.data.payee, president: res.data.president, isPresident: res.data.isPresident, clubId: res.data.clubID })
      });
    if (!actId || actId == undefined) {
      this.setData({ actId: 0 })
    } else {
      this.setData({ actId: actId })
    }

    if (actId && actId != '') {//编辑活动

      var param = {}
      var data = {}
      param.method = "GET";
      param.activity_id = actId;
      param.load_model = 0;
      organizeApi.getActDetail({
        data: param
      },
        function (res) {
          var actInfo = res.data.activity;
          that.setData({ actInfo: actInfo });
          //初始化标题
          that.initTitle(actInfo);
          //初始化内容
          that.initContent(actInfo);
          //初始化自定义填写项
          that.initApplyItem(actInfo);
          //初始化时间 地址
          that.initOther(actInfo);

          //初始化活动费用说明 金额 费用说明
          that.initPrice(actInfo);

          //初始化发送短信
          that.initSmsTime(actInfo);
          //初始化更多设置
          that.initSetMore(actInfo);

        },
        function (errInfo) {
          let errorMsg = utils.getErrorMsg(errInfo);
          wx.showModal({ title: '报名列表加载失败', content: errorMsg.title + '；' + errorMsg.content })
        }, function (res) {

        })
    } else {//组织活动
      this.initAct()
    }
    this.initDateControl()
  },
  initDateControl: function () {
    // 初始化时间日期
    // var now = new Date()
    // var years = []
    // var months = []
    // var hours = []
    // var minutes = []
    // var day28 = []
    // var day29 = []
    // var day30 = []
    // var day31 = []
    // var nowyear = 0;
    // var j = 0
    // for (var i = 1990; i <= 2050; i++) {
    //   years.push(i)
    //   if (now.getFullYear() == i) {
    //     nowyear = j
    //   }
    //   j++
    // }

    // for (var i = 1; i <= 12; i++) {
    //   months.push(i)
    // }

    // for (var i = 1; i <= 28; i++) {
    //   day28.push(i)
    // }

    // for (var i = 1; i <= 29; i++) {
    //   day29.push(i)
    // }
    // for (var i = 1; i <= 30; i++) {
    //   day30.push(i)
    // }
    // for (var i = 1; i <= 31; i++) {
    //   day31.push(i)
    // }
    // for (var i = 0; i <= 23; i++) {
    //   hours.push(i)
    // }
    // for (var i = 0; i <= 59; i++) {
    //   minutes.push(i)
    // }

    // this.setData({
    //   years: years,
    //   months: months,
    //   days: day31,
    //   hours: hours,
    //   minutes: minutes,
    //   day28: day28,
    //   day29: day29,
    //   day30: day30,
    //   day31: day31,
    //   value: [nowyear, now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes()]
    // })
    var that = this
    pick.initDateControl(that)
  },
  onShow: function (e) {
    var cover_img = app.globalData.modelImgSrc //封面
    var actFeeObject = app.globalData.actFeeObject //活动费用
    var applyFieldsObject = app.globalData.applyFieldsObject //用户报名项
    var actType = app.globalData.actType //活动类型
    var smsTips = app.globalData.smsTimes //短信提醒
    if (cover_img && cover_img != "") {//从封面获取图片
      this.setData({ cover: cover_img });
    }

    //活动费用
    var actFeeO = JSON.stringify(actFeeObject);
    if (actFeeO && actFeeO != "" && actFeeO != "{}") {
      var neetoPay = actFeeObject.neeToPay
      var howtoPay = actFeeObject.howToPay
      var refundTime = actFeeObject.refundTime
      var canRefund = actFeeObject.canRefund
      var tickes = actFeeObject.tickets;
      var tickesCount = 0
      var actFeeText = "";
      if (neetoPay == 2) {
        if (howtoPay == 1) {
          actFeeText = "付费"
        } else if (howtoPay == 2 || howtoPay == 3) {
          actFeeText = "在线付费"
        }
        var isNoLimit = false;
        for (var i = 0; i < tickes.length; i++) {
          if (tickes[i].memberCount == -1) {//费用总人数计算
            isNoLimit = true
            tickesCount = -1
          }
          if (!isNoLimit && tickes[i].memberCount != -1) {
            tickesCount += Number(tickes[i].memberCount)
          }
        }
      } else {
        actFeeText = "免费"
        tickesCount = 0
      }
      this.setData({
        tickets: tickes == null ? [] : tickes,
        need_to_pay: neetoPay,	//	是否是收费活动（1：不收费 2：收费）默认 1: 不收费
        how_to_pay: howtoPay,
        actFeeText: actFeeText,
        cost_desc: actFeeObject.costDesc,
        max_apply_count: actFeeObject.maxApplyCount,
        tickesCount: tickesCount,
        refundTime: refundTime,
        canRefund: canRefund
      })
    }
    //报名项
    var applyFieldsO = JSON.stringify(applyFieldsObject);
    if (applyFieldsO && applyFieldsO != "" && applyFieldsO != "{}") {

      var index = applyFieldsObject.fieldIndex
      var fields = applyFieldsObject.fields
      var applyFields = this.data.applyFields

      if (index > applyFields.length - 1) {//新增报名项
        var applyField = {}
        applyField.isCheck = true
        applyField.canEidt = true
        applyField.text = fields.field_name
        applyField.option = fields.option
        applyField.defaultValue = ""
        applyField.fieldName = fields.field_name
        applyField.fieldType = fields.fieldType
        applyFields[index] = applyField

      } else {
        applyFields[index].fieldType = fields.fieldType
        applyFields[index].option = fields.option
        applyFields[index].fieldName = fields.field_name
      }

      this.setData({
        applyFields: applyFields,
      })
    }

    if (actType && actType != "") {
      var actTypeTxt = "";
      if (actType == 1) {
        actTypeTxt = "公开活动"
      }
      if (actType == 2) {
        actTypeTxt = "俱乐部内活动"
      }
      this.setData({ act_type: actType, actTypeTxt: actTypeTxt });
    }
    //发送短信
    var smsTipo = JSON.stringify(smsTips);
    if (smsTipo && smsTipo != "" && smsTipo != "{}") {
      var time = smsTips.beginSmsTime;
      var times = smsTips.beginSmsTimes
      var smsText = "";
      if (time == -1) {
        smsText = "不发送";
      } else {
        smsText = '活动开始前' + time / 3600 + '小时'
      }
      this.setData({
        smsText: smsText,
        begin_sms_time: time,
        beginSmsTimes: times
      });
    }
    var isPublic = this.data.isPublic;
    if (isPublic) {
      this.setData({ isPublic: false })
      this.initAct();
    }

    var payee = this.data.payee
    var payetxt = JSON.stringify(payee)
    if (payetxt && payetxt != "" && payetxt != "{}") {//检查收款账号
      var that = this;
      organizeApi.checkActDetail({//活动校验
        data: {
          act_type: 1
        }
      },
        function (res) {
          that.setData({ payee: res.data.payee, president: res.data.president, isPresident: res.data.isPresident, clubId: res.data.clubID })
        });
    }


  },
  initAct: function () {


    var beginSmsTimes = [
      {
        "isDefault": 1,
        "text": "24小时前",
        "value": 86400
      },
      {
        "isDefault": 0,
        "text": "12小时前",
        "value": 43200
      },
      {
        "isDefault": 0,
        "text": "6小时前",
        "value": 21600
      },
      {
        "isDefault": 0,
        "text": "3小时前",
        "value": 10800
      },
      {
        "isDefault": 0,
        "text": "1小时前",
        "value": 3600
      },
      {
        "isDefault": 0,
        "text": "不发送",
        "value": -1
      }
    ];
    var actForms = [
      { isCheck: true, canEidt: false, text: '昵称', option: "", defaultValue: "请填写昵称", fieldName: "昵称", fieldType: 1 },
      { isCheck: true, canEidt: false, text: '性别', option: "男，女", defaultValue: "男", fieldName: "性别", fieldType: 2 },
      { isCheck: true, canEidt: false, text: '手机', option: "", defaultValue: "请填写手机", fieldName: "手机", fieldType: 1 },
      { isCheck: false, canEidt: false, text: '真实姓名', option: "", defaultValue: "", fieldName: "真实姓名", fieldType: 1 },
      { isCheck: false, canEidt: false, text: '身份证号', option: "", defaultValue: "", fieldName: "身份证号", fieldType: 1 }
    ];



    this.setData({

      address: "",
      begin_sms_time: 24 * 3600,
      beginSmsTimes: beginSmsTimes,
      applyFields: actForms,
      //  fields: fields,
      cover: "",
      need_to_pay: 1,	//	是否是收费活动（1：不收费 2：收费）默认 1: 不收费
      how_to_pay: 1,
      actFeeText: "免费",
      title: "",
      contents: [],
      act_type: 1,
      actTypeTxt: "公开活动",
      apply_check: 0,
      helper_apply: 1,
      cost: 0,
      cost_desc: "",
      max_apply_count: -1,
      guide: "",
      tickets: [],
      contEditSatus: true
    })
  },
  initTitle: function (actInfo) {
    this.setData({ title: actInfo.title })
  },
  initContent: function (actInfo) {
    var conts = actInfo.content;
    if (conts[0].bold == 5) {//小程序
      var contents = ""
      for (var i = 0; i < conts.length; i++) {
        var num = /(\r\n)|(\n)/g;
        if (num.test(conts[i].value)) {//处理换行
          contents = contents + "\n"
        } else {
          contents = contents + conts[i].value
        }
      }
      this.setData({
        actContent: contents,
        contents: conts,
        contEditSatus: true
      })
    } else {//其他端
      var systemInfo = this.getSystemInfo()

      this.setData({
        contents: conts,
        windowWidth: systemInfo.windowWidth + "px",
        contEditSatus: false
      })
    }


  },
  getSystemInfo: function () {
    var that = this
    var sysInfo = []
    wx.getSystemInfo({
      success: function (res) {
        sysInfo = res
      }
    })
    return sysInfo
  },
  initApplyItem: function (actInfo) {
    var actForms = actInfo.applyFields;
    if (actForms.length > 0) {
      var actForm = new Array();
      for (var i = 0; i < actForms.length; i++) {
        var fieldName = {}
        fieldName = {
          isCheck: true,
          text: actForms[i].fieldName,
          canEidt: (actForms[i].fieldName == "昵称" || actForms[i].fieldName == "性别" || actForms[i].fieldName == "手机") ? false : true,
          option: actForms[i].option,
          defaultValue: actForms[i].defaultValue,
          fieldName: actForms[i].fieldName,
          fieldType: actForms[i].fieldType
        };
        actForm[i] = fieldName;
      }

      this.setData({ applyFields: actForm });
    }
  },
  initOther: function (actInfo) {
    //活动时间
    if (actInfo.begin) {
      var beginTime = this.formatTime(new Date(actInfo.begin));
      this.setData({
        begin: actInfo.begin,
        beginTxt: beginTime
      })

    }
    if (actInfo.end) {
      var endTime = this.formatTime(new Date(actInfo.end));
      this.setData({
        end: actInfo.end,
        endTxt: endTime
      })
    }
    if (actInfo.deadline) {
      this.setData({
        deadline: actInfo.deadline,
        deadlineTxt: this.formatTime(new Date(actInfo.deadline))
      })
    }

    //活动地址
    if (actInfo.address) {
      this.setData({
        address: actInfo.address,
        lat: actInfo.lat,
        lng: actInfo.lng
      })
    } else {
      this.setData({
        address: "",
        lat: 0,
        lng: 0
      })
    }

  },
  initPrice: function (actInfo) {
    this.setData({ haveApplyNum: actInfo.haveApplyNum })
    var flag = true;
    var tickts = []
    if (actInfo.needToPay == 2) {
      var actFeeText = "付费"
      if (actInfo.howToPay == 1) {
        actFeeText = "付费"
      } else if (actInfo.howToPay == 2 || actInfo.howToPay == 3) {
        flag = false
        actFeeText = "在线付费"
      }
      this.setData({
        actFeeText: actFeeText,
        need_to_pay: 2,		//	是否是收费活动（1：不收费 2：收费）默认 1: 不收费
        how_to_pay: actInfo.howToPay,
        cost_desc: actInfo.costDesc
      })
      if (actInfo.maxApplyCount == -1) {
        this.setData({ max_apply_count: "-1" })
      } else {
        this.setData({ max_apply_count: actInfo.maxApplyCount })
      }
      tickts = actInfo.tickets
      for (var i = 0; i < tickts.length; i++) {
        tickts[i].cost = tickts[i].cost / 100
      }

    } else {
      this.setData({ actFeeText: "免费" })
      if (actInfo.maxApplyCount == -1) {
      } else {
        this.setData({
          max_apply_count: actInfo.maxApplyCount,
          how_to_pay: actInfo.howToPay,
          need_to_pay: 1
        })
      }
    }


    this.setData({
      cost_desc: actInfo.costDesc,
      tickets: tickts,
      showPayButton: flag
    });
  },

  initSmsTime: function (actInfo) {
    var time = actInfo.beginSmsTime;
    var smsText = "";
    if (time == -1) {
      smsText = "不发送";
    } else {
      var hour = time / 3600;
      smsText = '活动开始前' + hour + '小时'
    }
    this.setData({
      smsText: smsText,
      begin_sms_time: time,
      beginSmsTimes: actInfo.beginSmsTimes
    });
  },
  initSetMore: function (actInfo) {
    if (actInfo.cover != "") {
      this.setData({ cover: actInfo.cover })
    } else {
      this.setData({ cover: "" })
    }
    var actTypeTxt = "";
    if (actInfo.actType == 1) {
      actTypeTxt = "公开活动"
    }
    if (actInfo.actType == 2) {
      actTypeTxt = "俱乐部内活动"
    }

    this.setData(
      {
        apply_check: actInfo.applyCheck,
        helper_apply: actInfo.helperApply,
        guide: actInfo.guide,
        act_type: actInfo.actType,
        actTypeTxt: actTypeTxt,
        canRefund: actInfo.canRefund,
        refundTime: actInfo.refundTime,
      });

  },
  canApplyCheck: function (e) {
    var check = e.detail.value;
    if (check) {
      //	是否开启报名审核 1:是 0:否 默认: 0
      this.setData({ apply_check: 1 })
    } else {
      this.setData({ apply_check: 0 })
    }
  },
  canHelpApply: function (e) {
    var help = e.detail.value ? 1 : 2;
    this.setData({ helper_apply: help })//	是否开启帮人报名功能 1:是 2:否 默认: 1
    // if (help) {
    //   //	是否开启帮人报名功能 1:是 2:否 默认: 1
    //   this.setData({ helper_apply: 1 })
    // } else {
    //   this.setData({ helper_apply: 2 })
    // }
  },
  addActAddress: function () {
    this.chooseLocation();

  },
  addContent: function (e) {
    var contents = e.detail.value
    var conts = contents.split("\n")
    var contentsList = []
    for (var i = 0; i < conts.length; i++) {
      var content = {}
      content.type = 1
      content.value = conts[i]
      content.bold = 5
      contentsList.push(content)
      if (i < conts.length - 1) {
        var newline = {}
        newline.type = 1
        newline.value = "\n"
        newline.bold = 5
        contentsList.push(newline)
      }
    }
    this.setData({
      contents: contentsList,
      actContent: contents
    })
  },
  setTitle: function (e) {
    var title = e.detail.value
    this.setData({
      title: title
    })
  },
  contentTip: function () {
    app.wxService.showModal({
      title: '提示',
      content: '小程序暂不支持富文本编辑，请在超级俱乐部Web端和App端操作',
      showCancel: false
    })
  },
  chooseLocation: function () {
    // var longitude = this.data.lng / 1000000;
    // var latitude = this.data.lat / 1000000;
    var that = this
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          lat: res.latitude * 1000000,
          lng: res.longitude * 1000000,
          address: res.address,
          act_online: 2
        })
      }
    })
  },

  formatTime: function (date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    var datemap = [year, month, day].map(this.formatNumber);
    return datemap[0] + '年' + datemap[1] + '月' + datemap[2] + '日' + ' ' + [hour, minute].map(this.formatNumber).join(':')
  },
  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  changeActCover: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['拍照', '从手机相册选择', '从模板库选择'],
      success: function (e) {
        var index = e.tapIndex;
        if (index == 0) {
          that.cameraimg();
        } else if (index == 1) {
          that.albumimg();
        } else if (index == 2) {
          that.modelimg();
        }
      }
    })
  },
  cameraimg: function (e) {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let localPath = res.tempFilePaths[0]
        systemApi.uploadImage(localPath, res => {
          var imgPath = res.data.url;
          that.setData({
            cover: imgPath
          })
        }, res => {
          //上传图片失败
          console.log("图片上传失败");
        })
      }
    })
  },
  albumimg: function (e) {
    var that = this
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        let localPath = res.tempFilePaths[0]
        systemApi.uploadImage(localPath, res => {
          var imgPath = res.data.url;
          that.setData({
            cover: imgPath
          })
        }, res => {
          //上传图片失败
          console.log("图片上传失败");
        })
      }
    })
  },
  modelimg: function () {
    app.wxService.navigateTo('organize/act_cover/act_cover')
  },
  addApplyFields: function (e) {
    var fieldNames = this.getApplyFieldNames()
    app.wxService.navigateTo('organize/act_applyfields/act_applyfields', {
      isEidt: false,
      fieldIndex: this.data.applyFields.length,
      fieldNames: JSON.stringify(fieldNames)
    })
  },
  editApplyFields: function (event) {
    var fieldIndex = event.currentTarget.id
    var fieldNames = this.getApplyFieldNames()
    var that = this;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: function (e) {
        var index = e.tapIndex;
        if (index == 0) {
          app.wxService.navigateTo('organize/act_applyfields/act_applyfields',
            {
              isEidt: true,
              fieldIndex: fieldIndex,
              applyField: JSON.stringify(that.data.applyFields[fieldIndex]),
              fieldNames: JSON.stringify(fieldNames)
            })
        } else if (index == 1) {
          var applyFields = that.data.applyFields
          applyFields.splice(fieldIndex, 1)
          that.setData({ applyFields: applyFields })
        }
      }
    })
  },
  getApplyFieldNames: function () {
    var fieldNames = new Array();
    for (var i = 0; i < this.data.applyFields.length; i++) {
      fieldNames.push(this.data.applyFields[i].fieldName)
    }
    return fieldNames;
  },

  setActFee: function () {
    var actInfo = this.data.actInfo
    app.wxService.navigateTo('organize/act_fee/act_fee', {
      actId: this.data.actId,
      tickets: JSON.stringify(this.data.tickets),
      neeToPay: this.data.need_to_pay,
      howToPay: this.data.how_to_pay,
      maxApplyCount: this.data.max_apply_count,
      costDesc: this.data.cost_desc,
      payee: JSON.stringify(this.data.payee),
      president: JSON.stringify(this.data.president),
      isPresident: this.data.isPresident,
      clubId: this.data.clubId,
      showPayButton: this.data.showPayButton,
      actNeedToPay: actInfo.needToPay,
      canRefund: this.data.canRefund,
      refundTime: this.data.refundTime,
      begin: this.data.begin,
      applyCount: actInfo.applyCount
    })
  },
  setActType: function () {
    app.wxService.navigateTo('organize/act_type/act_type', { actType: this.data.act_type })
  },
  setActSMSTips: function () {
    app.wxService.navigateTo('organize/act_smstips/act_smstips', {
      beginSmsTimes: JSON.stringify(this.data.beginSmsTimes),
      beginSmsTime: this.data.begin_sms_time
    })
  },
  choseApplyFields: function (e) {
    var applyFields = this.data.applyFields
    var fieldName = applyFields[e.target.id].fieldName
    if (fieldName != "昵称" && fieldName != "手机" && fieldName != "性别") {
      applyFields[e.target.id].isCheck = !applyFields[e.target.id].isCheck
      this.setData({
        applyFields: applyFields
      })
    }
  },
  uploadImg: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let localPath = res.tempFilePaths[0]
        systemApi.uploadImage(localPath, res => {
          var imgPath = res.data.url;
        }, res => {
          //上传图片失败
          // console.log("图片上传失败");
        })
      }
    });
  },
  addGuide: function (e) {
    this.setData({ guide: e.detail.value })
  },
  saveOrUpdateAct: function () {
    var that = this;
    var checked = this.validatePostInfo()
    if (checked) {
      var canRefund = this.data.canRefund
      var refundTime = this.data.refundTime
      var beginTime = this.data.begin
      if (canRefund != undefined && canRefund == 2) {
        if (refundTime > beginTime) {
          wx.showModal({
            content: "退款截止时间在活动开始时间之后，确定要发布吗？",
            confirmText: "确定",
            showCancel: true,
            success: function (res) {
              var confirm = res.confirm
              if (confirm) {
                that.post(checked)
              }

            }
          })
        } else {
          that.post(checked)
        }
      }

    }
  },
  post: function (checked) {
    //检验不通过不能进行发布操作

    if (checked) {
      var contes = this.data.contents
      var param = {};
      param.activity_id = this.data.actId;

      param.title = this.data.title
      param.content = JSON.stringify(contes)
      param.max_apply_count = this.data.max_apply_count
      param.deadline = this.data.deadline
      param.begin = this.data.begin
      param.end = this.data.end
      param.lat = this.data.lat
      param.lng = this.data.lng
      param.address = this.data.address
      param.apply_check = this.data.apply_check
      param.cost_desc = this.data.cost_desc
      param.guide = this.data.guide
      param.cover = this.data.cover
      param.act_type = this.data.act_type
      param.helper_apply = this.data.helper_apply
      param.need_to_pay = this.data.need_to_pay
      param.how_to_pay = this.data.how_to_pay
      if (this.data.actId == 0 || this.data.actId == "") {//发布活动
        if (!this.data.moreApplyIcon) {//报名截止时间的设置默认是不打开的，那默认是开始时间
          param.deadline = this.data.begin
        }
      }
      if (this.data.need_to_pay == 2 && this.data.how_to_pay == 2) {
        param.payee_account = this.data.payee.userID
      } else {
        param.payee_account = ""
      }
      //退款设置
      if (this.data.need_to_pay == 2) {
        param.canRefund = this.data.canRefund
        param.refundTime = this.data.refundTime
      }

      param.cancel_apply = 1
      param.begin_sms_time = this.data.begin_sms_time
      param.data_type = 0;//发部类型 草稿或者正常活动
      param.group_num = 0
      param.group_max_member_count = 0
      param.group_min_member_count = 0
      var actId = this.data.actId;
      var tickets = this.data.tickets
      var tiks = [];
      if (param.need_to_pay == 2) {
        //{ticketID: 5337, memberCount: 10, name: "是的", cost: 100, applyCount: 0}
        for (var i = 0; i < tickets.length; i++) {
          var tik = {}
          if (actId != undefined && actId != '' && actId != 0) { //修改活动活动
            if (tickets[i].ticketID == '') {
              tik.ticketID = 0
            } else {
              tik.ticketID = tickets[i].ticketID
            }

            tik.applyCount = tickets[i].applyCount
          }
          tik.name = tickets[i].name
          tik.memberCount = Number(tickets[i].memberCount)
          tik.cost = tickets[i].cost == "" ? -1 : Number(tickets[i].cost) * 100

          tiks[i] = tik
        }
      } else {
        param.how_to_pay = 1
      }
      param.tickets = JSON.stringify(tiks)

      var fields = []
      var applyFields = this.data.applyFields
      for (var i = 0; i < applyFields.length; i++) {//处理报名项
        if (applyFields[i].isCheck) {
          var field = {}
          field.field_name = applyFields[i].fieldName
          if (applyFields[i].fieldType == 2) {
            field.option = applyFields[i].option
          }

          fields.push(field)
        }
      }
      param.fields = JSON.stringify(fields)
      var that = this
      if (this.data.actId == "0" || this.data.actId == "" || this.data.actId == 0 || this.data.actId == null || this.data.actId == undefined) {

        for (var i = 0; i < contes.length; i++) {
          contes[i].bold = 5  //小程序
        }
        param.content = JSON.stringify(contes)
        organizeApi.publicAct({
          method: 'POST',
          data: param
        },
          function (res) {

            var result = res
            if (result.statusCode == 200) {//发布成功
              var activityID = result.data.activityId
              that.setData({ isPublic: true })

              let url = "activity/act_detail/act_detail?activityID=" + result.data.activityId + "&backOrTo=1";
              app.wxService.redirectTo(url);


              // app.wxService.navigateTo('activity/act_detail/act_detail', {
              //   activityID: result.data.activityId,
              //   backOrTo: 1
              // })
              var pam = {}
              pam.actId = activityID
              pam.count = 1
              getApp().event.emit(getApp().config.EVENT_ACTIVITY_CHANGE, pam)
            } else {
              wx.showToast({
                title: "活动发布失败",
                icon: "loading",
                duration: 5000
              })
            }

          });

      } else {
        organizeApi.updateAct({
          method: 'POST',
          data: param
        },
          function (res) {
            var result = res
            if (result.statusCode == 200) {//发布成功
              that.setData({ isPublic: true })
              let url = "activity/act_detail/act_detail?activityID=" + result.data.activityId + "&backOrTo=1";
              app.wxService.redirectTo(url);
              // app.wxService.navigateTo('activity/act_detail/act_detail', {
              //   activityID: result.data.activityId,
              //   backOrTo: 1
              // })
            } else {
              wx.showToast({
                title: "活动更新失败",
                icon: "loading",
                duration: 5000
              })
            }
          });
      }
    }

  },
  Iagree: function (e) {
    var agreeCheck = this.data.agreeCheck
    agreeCheck = !agreeCheck
    this.setData({ agreeCheck: agreeCheck })
  },
  showMoreInfo: function () {
    var moreApplyIcon = false
    var showMoreInfo = ""
    var isShowTextarea = false
    if (this.data.showInfo == "none") {
      showMoreInfo = "block"
      moreApplyIcon = true
      isShowTextarea = true
    }
    if (this.data.showInfo == "block") {
      showMoreInfo = "none"
      moreApplyIcon = false
      isShowTextarea = false
    }
    this.setData({ showInfo: showMoreInfo, moreApplyIcon: moreApplyIcon, isShowTextarea: isShowTextarea })
  },
  validatePostInfo: function () {
    var that = this
    var okay = true;
    //校验活动主题方面
    var oTitle = this.data.title;
    if (oTitle && oTitle != '') {
      if (oTitle.length > 30) {
        utils.showTip(that, "活动主题最多30个字");
        // wx.showToast({
        //   title: "活动主题最多30个字"
        // })
        okay = false;
        return;
      }
    } else {
      utils.showTip(that, "请输入活动主题");
      // wx.showToast({
      //   title: "请输入活动主题"
      // })

      okay = false;
      return;
    }
    var applyNum = this.data.max_apply_count
    var tickesCount = this.data.tickesCount
    var needToPay = this.data.need_to_pay
    if (needToPay == 2) {
      var actInfo = this.data.actInfo
      var nTopay = actInfo.needToPay
      var applyCount = actInfo.applyCount
      if (nTopay == 1 && applyCount > 0) {//有人报名后，免费不能变付费

        utils.showTip(that, "有人报名，不能修改付费方式！");
        okay = false;
        return;
      }
      var feeItms = this.getAppSets();
      if (!feeItms) {
        okay = false;
        return okay;
      }
      if (tickesCount != -1 && applyNum != -1 && tickesCount > applyNum) {
        utils.showTip(that, "费用名额已超过活动名额！");
        okay = false;
        return;
      } else {
        if (tickesCount != -1 && applyNum == -1) {//活动总名额为空，总人数以票价为主
          this.setData({ max_apply_count: tickesCount })
        }
        if (tickesCount != -1 && applyNum != -1 && tickesCount < applyNum) {//活动总名额大于票价，总人数以票价为主
          this.setData({ max_apply_count: tickesCount })
        }
      }

    }
    var contents = this.data.contents;
    if (contents.length == 0) {
      utils.showTip(that, "请请输入活动详情");
      // wx.showToast({
      //   title: "请输入活动详情"
      // })
      okay = false;
      return;
    }
    var beginTime = this.data.begin
    var endTime = this.data.end
    var deadlineTime = this.data.deadline
    if (beginTime == null || beginTime == 0) {
      utils.showTip(that, "请填写活动开始时间");
      okay = false;
      return;
    }
    if (endTime == null || endTime == 0) {
      utils.showTip(that, "请填写活动结束时间");
      okay = false;
      return;
    }
    if (beginTime > endTime) {
      utils.showTip(that, "活动开始时间需设置在活动结束之前");
      okay = false;
      return;
    }
    if (deadlineTime > endTime) {
      utils.showTip(that, "截止时间需设置在活动结束之前");
      okay = false;
      return;
    }

    var payee = this.data.payee
    var pay = this.data.president
    if (!this.data.agreeCheck) {
      utils.showTip(that, "请选择超级俱乐部服务协议");
      okay = false;
      return;
    }

    //设置收款账号
    var howToPay = this.data.how_to_pay;
    var that = this
    var payee = JSON.stringify(this.data.payee)
    if (needToPay == 2 && howToPay == 2) {
      if (payee == "null" || payee == "" || payee == "{}") {
        var that = this
        var isPresident = this.data.isPresident
        if (isPresident == 1) {//会长
          wx.showModal({
            content: "尊敬的会长大人：活动已能在线付费，请设置俱乐部收款账户！",
            confirmText: "去设置",
            showCancel: false,
            success: function (res) {
              app.wxService.navigateTo('club/modify/accountGather/accountGather', {
                clubID: that.data.clubId,
                roleType: 2
              })
            }
          })
        } else {//其他
          wx.showModal({
            content: "俱乐部未设置支付收款账户，请联系会长在俱乐部管理者设置",
            confirmText: "打电话",
            cancelText: "稍后联系",
            success: function (res) {

              var confirm = res.confirm
              if (confirm) {
                wx.showModal({
                  content: "确定呼叫：" + that.data.president.nick + " " + that.data.president.mobile + " ？",
                  confirmText: "呼叫",
                  cancelText: "取消",
                  success: function (res) {
                    var cfirm = res.confirm
                    if (cfirm) {
                      wx.makePhoneCall({
                        phoneNumber: president.mobile,
                        success: function () {
                          console.log("成功拨打电话")
                        }
                      })
                    }
                  }
                })
              }
            }
          })
        }
        okay = false;
      }
    }
    return okay;
  },
  getAppSets: function () {
    var ticketChecked = true;
    var tickets = this.data.tickets;
    if (tickets.length > 0 || this.data.need_to_pay == 2) {
      for (var i = 0; i < tickets.length; i++) {
        if (!tickets[i].name || tickets[i].name == "") {
          ticketChecked = false;
          utils.showTip(that, "费用名称不能为空");
          break;
        } else {
          for (var j = i + 1; j < tickets.length; j++) {
            if (tickets[j].name && tickets[j].name != "") {
              if (tickets[i].name == tickets[j].name) {
                ticketChecked = false;
                utils.showTip(that, "费用名称不能重复");
                // wx.showToast({
                //   title: "费用名称不能重复"
                // })
                break;
              }
            }
            if (!ticketChecked) {
              break;
            }
          }
        }
        if (tickets[i].name && tickets[i].name.length > 20) {
          ticketChecked = false;
          utils.showTip(that, "费用名称必须在20字内");
          // wx.showToast({
          //   title: "费用名称必须在20字内"
          // })
          break;
        }

        var costStr = String(tickets[i].cost);
        if ((tickets[i].name != "" && costStr.length == 0) || Number(tickets[i].cost) < 0) {
          ticketChecked = false;
          utils.showTip(that, "费用金额必须大于或者等于0");
          // wx.showToast({
          //   title: "费用金额必须大于或者等于0"
          // })
          break;
        }
      }
      if (!this.data.cost_desc || this.data.cost_desc == "") {
        ticketChecked = false;
        utils.showTip(that, "费用说明不能为空");
        // wx.showToast({
        //   title: "费用说明不能为空"
        // })
        return;
      }
    }
    return ticketChecked;
  },
  showRule: function () {
    app.wxService.showModal({
      title: '提示',
      content: '请用浏览器访问https://im.51julebu.com/resource/pages/protocol_supperClub.html',
      showCancel: false
    })
  },

  //***********************************时间控件************************************************************************
  bindChange: function (e) {
    var that = this
    pick.bindChange(e, that)
    // const val = e.detail.value

    // var y = this.data.years[val[0]];
    // var m = this.data.months[val[1]];
    // var ds = [];
    // if (m == 2) {//2月分
    //   if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) {
    //     ds = this.data.day29
    //   } else {
    //     ds = this.data.day28
    //   }
    // } else {//31天
    //   if (m == 1 || 3 || 5 || 7 || 8 || 10 || 12) {
    //     ds = this.data.day30

    //   } else {//30天
    //     ds = this.data.day31

    //   }
    // }
    // this.setData({
    //   days: ds,
    //   year: this.data.years[val[0]],
    //   month: this.data.months[val[1]],
    //   day: this.data.days[val[2]],
    //   hour: this.data.hours[val[3]],
    //   minute: this.data.minutes[val[4]],
    // })
    // // 小于10的数值补上0
    // if (this.data.months[val[1]] < 10) {
    //   this.setData({
    //     month: '0' + this.data.months[val[1]],
    //   })
    // }
    // if (this.data.days[val[2]] < 10) {
    //   this.setData({
    //     day: '0' + this.data.days[val[2]],
    //   })
    // }
    // if (this.data.hours[val[3]] < 10) {
    //   this.setData({
    //     hour: '0' + this.data.hours[val[3]],
    //   })
    // }
    // if (this.data.minutes[val[4]] < 10) {
    //   this.setData({
    //     minute: '0' + this.data.minutes[val[4]],
    //   })
    // }
  },
  hideModal() {
    this.setData({ modalShowStyle: "" });

  },
  togglePicker: function (event) {
    var that = this
    var flag = event.currentTarget.id
    var indexs = []
    var begin = 0
    var end = 0
    var deadline = 0

    if (this.data.actId == '' || this.data.actId == 0) {//发布活动
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var hour = date.getHours()
      var minute = date.getMinutes()
      var second = date.getSeconds()
      var datemap = [year, month, day].map(this.formatNumber);
      var nowtime = datemap[0] + '/' + datemap[1] + '/' + datemap[2] + ' ' + "09:00"
      var endtime = datemap[0] + '/' + datemap[1] + '/' + datemap[2] + ' ' + "18:00"
      begin = new Date(nowtime).getTime()
      end = new Date(endtime).getTime()
      deadline = new Date(nowtime).getTime()
    } else {//编辑活动
      begin = this.data.begin
      end = this.data.end
      deadline = this.data.deadline
    }

    if (flag == 'begin') {
      indexs = pick.formatTimeIndex(begin, that)
    } else if (flag == 'end') {
      indexs = pick.formatTimeIndex(end, that)
    } else if (flag == 'deadline') {
      indexs = pick.formatTimeIndex(deadline, that)
      this.setData({
        isShowTextarea: false
      })
    }

    this.setData({
      modalShowStyle: 'opacity:1',
      zindex: 102,
      scrolly: false,
      timetxt: event.currentTarget.id,
      year: this.data.years[indexs[0]] < 10 ? "0" + this.data.years[indexs[0]] : this.data.years[indexs[0]],
      month: this.data.months[indexs[1]] < 10 ? "0" + this.data.months[indexs[1]] : this.data.months[indexs[1]],
      day: this.data.day31[indexs[2]] < 10 ? "0" + this.data.day31[indexs[2]] : this.data.day31[indexs[2]],
      hour: this.data.hours[indexs[3]] < 10 ? "0" + this.data.hours[indexs[3]] : this.data.hours[indexs[3]],
      minute: this.data.minutes[indexs[4]] < 10 ? "0" + this.data.minutes[indexs[4]] : this.data.minutes[indexs[4]],
      value: indexs

    })
  },
  touchCancel: function (event) {
    var that = this
    pick.touchCancel(event, that)
    // var timetxt = this.data.timetxt
    // if (timetxt == 'deadline') {
    //   this.setData({ zindex: -1, scrolly: true, isShowTextarea: true })
    // } else {
    //   this.setData({ zindex: -1, scrolly: true })
    // }
    // this.hideModal();
  },
  touchAdd: function (event) {
    var timet = this.data.year + '年' + this.data.month + '月' + this.data.day + '日 ' + this.data.hour + ':' + this.data.minute
    var time = this.data.year + '-' + this.data.month + '-' + this.data.day + ' ' + this.data.hour + ':' + this.data.minute + ':00'

    time = time.replace(/-/g, "/");

    var data = new Date(time).getTime()
    var timetxt = this.data.timetxt

    if (timetxt == 'begin') {
      this.setData({
        begin: data,
        beginTxt: timet
      })
    } else if (timetxt == 'end') {
      this.setData({
        end: data,
        endTxt: timet
      })
    } else if (timetxt == 'deadline') {
      this.setData({
        deadline: data,
        deadlineTxt: timet,
        isShowTextarea: true
      })
    }
    this.hideModal();
    this.setData({
      zindex: -1,
      scrolly: true
    })
  },
  // formatTimeIndex: function (datetime) {
  //   let date = new Date(datetime)
  //   var yearindex = 0
  //   for (var i = 0; i < this.data.years.length; i++) {
  //     if (this.data.years[i] == date.getFullYear()) {
  //       yearindex = i;
  //     }
  //   }
  //   var index = [yearindex, date.getMonth(), date.getDate() - 1, date.getHours(), date.getMinutes()];
  //   return index;
  // }
  //***********************************时间控件************************************************************************
})
