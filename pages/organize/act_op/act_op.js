var app = getApp()
const utils = app.util;
import storage from '../../../utils/storage.js'
var organizeApi = app.api("organizeApi");
const date = new Date()
const years = []
const months = []
const hours = []
const minutes = []
const day28 = []
const day29 = []
const day30 = []
const day31 = []

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 28; i++) {
  day28.push(i)
}

for (let i = 1; i <= 29; i++) {
  day29.push(i)
}
for (let i = 1; i <= 30; i++) {
  day30.push(i)
}
for (let i = 1; i <= 31; i++) {
  day31.push(i)
}
for (let i = 0; i <= 23; i++) {
  hours.push(i)
}
for (let i = 0; i <= 59; i++) {
  minutes.push(i)
}

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
    applyFields: [
      { isCheck: true, canEidt: false, text: '昵称', option: "", defaultValue: "请填写昵称", fieldName: "昵称", fieldType: 1 },
      { isCheck: true, canEidt: false, text: '手机', option: "", defaultValue: "请填写手机", fieldName: "手机", fieldType: 1 },
      { isCheck: true, canEidt: false, text: '性别', option: "男，女", defaultValue: "男", fieldName: "性别", fieldType: 2 },
      { isCheck: false, canEidt: true, text: '真实姓名', option: "", defaultValue: "", fieldName: "真实姓名", fieldType: 1 },
      { isCheck: false, canEidt: true, text: '身份证', option: "", defaultValue: "", fieldName: "身份证", fieldType: 1 }
    ],
    pos: 0,
    input_auto: true,
    font_color: '0,0,0',
    // font_weight:'normal',
    isWeight: false,
    test: '',
    isChange: false,
    isShowColor: true,

    //日期控件
    years: years,
    year: date.getFullYear(),
    months: months,
    days: day31,
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: hours,
    hour: date.getHours(),
    minutes: minutes,
    minute: '00',
    value: [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()],
    starttime: '开始时间',
    modalShowStyle: '',


    actInfo: {},
    actId: '',
    title: "",	//	活动主题（标题）
    content: "",	//	活动内容
    max_apply_count: 0,	//	活动最多报名人数, 如果不限制传入-1
    deadline: 0,	//	报名截止时间（毫秒时间戳）
    begin: 0,	//	活动开始时间（毫秒时间戳）
    end: 0,	//	活动截止时间（毫秒时间戳）
    lat: 0,	//	经度
    lng: 0,	//	纬度
    address: "0",	//	活动地址
    apply_check: 0,	//	是否开启报名审核 1:是 0:否 默认: 0
    fields: "0",	//	非必需字段
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
    begin_sms_time: 3600,//活动开始前短信提醒时间，默认24小时前，单位：秒， 如活动开始一小时前提醒，begin_sms_time=3600. 不发送短信传-1
    // begin_sms_msg	:	"您报名的活动（xxxxxxx）将于1月26日18时49分开始，打开超级俱乐部APP查看详情，或点击 s.iweju.com 下载	",	//	活动开始前的短信内容
    data_type: 0,//	数据类型，0是发布正式活动(默认)，1是保存为草稿
    image: "",

    cover_img: "",
    haveApplyNum: 0, //已报名人数
    actFeeText: "免费"//费用说明
  },
  position: -1,
  input_content: '',
  onLoad: function (e) {
    var that = this;
    storage.saveSync("key", "31a7f654b77486ce000083e1905b7ef7")

    //var actId = e.actId;
    var actId = '591725';
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
          console.info("===========");
          console.info(res.data.activity);
          var actInfo = res.data.activity;
          that.setData({ actInfo: actInfo });
          //初始化标题
          that.initTitle(actInfo);
          //初始化内容
          that.initContent(actInfo);
          //初始化自定义填写项
          that.initApplyItem(actInfo);
          //初始化报名人数 时间 地址
          that.initOther(actInfo);

          //初始化活动费用说明 金额 费用说明
          that.initPrice(actInfo);
          //this.initIszxPay(actInfo);        
          //初始化费用
          that.initFee(actInfo);
          //初始化分组
          that.initGroup(actInfo);

          //初始化发送短信
          that.initSmsTime(actInfo);

          //初始化更多设置
          that.initSetMore(actInfo);

        },
        function (errInfo) {
          let errorMsg = utils.getErrorMsg(errInfo);
          wx.showModal({ title: '报名列表加载失败', content: errorMsg.title + '；' + errorMsg.content })
        }, function (res) {
          console.log(res)
        })
    } else {//组织活动

    }
  },
  onShow: function (e) {
    var cover_img = app.globalData.modelImgSrc //封面
    var actFeeObject = app.globalData.actFeeObject //活动费用
    var applyFieldsObject = app.globalData.applyFieldsObject //用户报名项
    var actType = app.globalData.actType //活动类型
    var smsTips = app.globalData.smsTips //短信提醒
    if (cover_img && cover_img != "") {//从封面获取图片
      this.setData({ cover: cover_img });
    }
    if (actFeeObject && actFeeObject != "") {

    }
    if (actType && actType != "") {
      this.setData({ cover: cover_img });
    }
    if (smsTips && smsTips != "") {
      this.setData({ cover: cover_img });
    }
  },
  initTitle: function (actInfo) {
    this.setData({ title: actInfo.title })
  },
  initContent: function (actInfo) {

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
      console.info("xxxxxxxxxxxxxxxxxxxx");
      console.info(this.data.applyFields);
      this.setData({ applyFields: actForm });
      console.info(this.data.applyFields);

    }
  },
  initOther: function (actInfo) {

    //报名人数
    // if(actInfo.apllyNum == -1){//不限

    // }else{

    // }

    //活动时间
    if (actInfo.begin) {
      var beginTime = this.formatTime(new Date(actInfo.begin));
      this.setData({ begin: beginTime })

    }
    if (actInfo.end) {
      var endTime = this.formatTime(new Date(actInfo.end));
      this.setData({ end: endTime })
    }
    if (actInfo.deadline) {
      this.setData({ deadline: this.formatTime(new Date(actInfo.deadline)) })
    }

    //活动地址
    if (actInfo.address) {
      this.setData({
        address: actInfo.address,
        lat: actInfo.lat,
        lng: actInfo.lng
      })
    } else {
      this.setData({ address: "标记活动位置，可不标" })
    }

  },
  initPrice: function (actInfo) {
    this.setData({ haveApplyNum: actInfo.haveApplyNum })

    var flag = false;
    if (actInfo.needToPay == 2) {
      this.setData({
        actFeeText: "付费",
        need_to_pay: 2,		//	是否是收费活动（1：不收费 2：收费）默认 1: 不收费
        cost_desc: actInfo.costDesc
      })
      if (actInfo.apllyNum == -1) {
        this.setData({ max_apply_count: "-1" })
      } else {
        this.setData({ max_apply_count: actInfo.apllyNum })
      }
    } else {
      this.setData({ actFeeText: "免费" })
      if (actInfo.apllyNum == -1) {
      } else {
        this.setData({
          max_apply_count: actInfo.apllyNum,
          need_to_pay: 1
        })
      }
    }
  },
  initIszxPay: function (actInfo) {
    var q = 1;
    if (actInfo.howToPay == 2) {
      _actop._showZOn(q);
    } else {
      _actop._showZOff(q);
    }
  },
  initFee: function (actInfo) {
    if (actInfo.needToPay == 2) {
      //needToPay 
      _actop._needPay = actInfo.needToPay;
      _actop._howToPay = actInfo.howToPay;
      _actop._initfeeItems(actInfo);
      $('.showfee').show();
      $('.showunfee').hide();
      $('#feeDetail').show();
      $('#unfeeDetail').hide();
      var q = 1;
      if (actInfo.howToPay == 2 || actInfo.howToPay == 3) {
        _actop._showZOn(q);
        if (actInfo.howToPay == 3) {
          _actop._showOtherOn();
        }
      } else {
        _actop._showZOff(q);
      }
      _actop._setSubmit();
    }
  },
  initGroup: function (actInfo) {
    if (actInfo.isGroupApply == 1) {//分组
      _actop._showGroupOn();

      if (actInfo.groupNum == -1) {
        $('#groupNum').val('');//默认不限
      } else {
        $('#groupNum').val(actInfo.groupNum);
      }
      if (actInfo.groupMinMemberCount == -1) {
        $('#groupminNum').val('');//默认不限
      } else {
        $('#groupminNum').val(actInfo.groupMinMemberCount);
      }
      if (actInfo.groupMaxMemberCount == -1) {
        $('#groupmaxNum').val('');//默认不限
      } else {
        $('#groupmaxNum').val(actInfo.groupMaxMemberCount);
      }

      /*	$('#groupNum').val(actInfo.groupNum);
        $('#groupminNum').val(actInfo.groupMinMemberCount);
        $('#groupmaxNum').val(actInfo.groupMaxMemberCount);*/

      if (_actop._actDetail != null && _actop._actDetail.haveApplyGroupNum > 0) {
        $('#groupminNum').attr('readonly', 'readonly');
        $('#groupmaxNum').attr('readonly', 'readonly');
      }
    } else {
      _actop._showGroupOff();
    }
  },
  initSmsTime: function (actInfo) {
    var time = actInfo.beginSmsTimeValue;
    _actop._smsTime = time;
    var hour = -1;
    if (time == -1) {
      $('#messageName').html('不发送');
      _actop._messageTime(hour);
    } else {
      hour = time / 3600;
      $('#messageName').html('活动开始前' + hour + '小时');
      _actop._messageTime(hour);
    }
    var smsMsg = actInfo.beginSmsMsg;
    $('#smsMsg').text(smsMsg);

    //设置是否允许取消报名
    //		var isQxApply = actInfo.cancelApply;
    //		if(isQxApply==0){
    //			_actop._showQOn();
    //		}else{
    //			_actop._showQOff();
    //		}
  },
  initSetMore: function (actInfo) {
    if (this.data.cover_img != "") {
      this.setData({ cover: this.data.cover_img })
    } else {
      this.setData({ cover: actInfo.cover })
    }
    // $('.dot').hide();
    // if(actInfo.actType == 3){
    // 	_actop._actType = 3;
    // 	$('#typeName').html('私人活动');
    // 	$('.showOneOn').show();
    // 	$('.showClubOn').hide();
    // 	$('.showOpenOn').hide();
    // }else if(actInfo.actType == 2){
    // 	_actop._actType = 2;
    // 	$('#typeName').html('俱乐部内活动');
    // 	$('.showOneOn').hide();
    // 	$('.showClubOn').show();
    // 	$('.showOpenOn').hide();
    // }else if(actInfo.actType == 1){
    // 	_actop._actType = 1;
    // 	$('#typeName').html('公开活动');
    // 	$('.showOneOn').hide();
    // 	$('.showClubOn').hide();
    // 	$('.showOpenOn').show();
    // }
    // if(actInfo.cover != "" && actInfo.cover != null){
    // 	$('#coverShow').html('<img class="actCover" src="'+actInfo.cover+'" height="30px" width="30px"  /> <img class="more" src="../img/arrow (2).png" height="14px" /> ')

    /*$(".actCover").attr("src",);//设置封面*/
    // }
    //不需要审核
    // if(actInfo.applyCheck == 0){
    // 	$('.son').hide();
    // 	$('.soff').show();
    // 	_actop._ischeck = 0;
    // }else{//需要审核
    // 	$('.soff').hide();
    // 	$('.son').show();
    // 	_actop._ischeck = 1;
    // }

    // //帮报开关
    // if(actInfo.helperApply == 1){
    // 	$('.yoff').hide();
    // 	$('.yon').show();
    // 	_actop._isHelp_apply = 1;
    // }else{//2不允许帮报
    // 	$('.yon').hide();
    // 	$('.yoff').show();
    // 	_actop._isHelp_apply = 2;
    // }



    // if(actInfo.autoCreateGroup == 1){
    // 	$('.off').hide();
    // 	$('.on').show();
    // 	_actop._idAuto = true;
    // }else{
    // 	$('.on').hide();
    // 	$('.off').show();
    // 	_actop._idAuto = false;
    // }
    // if(actInfo.applyCheck == 1){
    // 	$('.soff').hide();
    // 	$('.son').show();
    // }else{
    // 	$('.son').hide();
    // 	$('.soff').show();
    // }
    // $('.enrollNotice').text(actInfo.guide);
  },
  initTime: function () {
    var nextTime2 = new Date((new Date().getTime()) + (86400000 * 7));
    var yy2 = nextTime2.getFullYear()
    var mm2 = (nextTime2.getMonth() + 1 < 10) ? ('0' + (nextTime2.getMonth() + 1)) : (nextTime2.getMonth() + 1);
    var dd2 = (nextTime2.getDate() < 10 ? ('0' + nextTime2.getDate()) : nextTime2.getDate());
    $('#post_begintime').val(yy2 + '-' + mm2 + '-' + dd2 + ' 09:00');
    $('#post_endtime').val(yy2 + '-' + mm2 + '-' + dd2 + ' 18:00');
    /*$('#post_deadlinetime').val(yy2+'-'+mm2+'-'+dd2+' 09:00');*/
    $("#refundTime").val(yy2 + '-' + mm2 + '-' + dd2 + ' 09:00');
    //报名截止时间判断
    _actop._deadlinetime = yy2 + '-' + mm2 + '-' + dd2 + ' 09:00';
  },
  addActAddress: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['标记线下活动地点', '线上活动'],
      success: function (e) {
        var index = e.tapIndex;
        if (index == 0) {
          that.chooseLocation();
        } else if (index == 1) {
          that.setData({ address: "线上活动" });
        }
      }
    })
  },
  chooseLocation: function () {
    var longitude = this.data.lng / 1000000;
    var latitude = this.data.lat / 1000000;
    //  wx.openLocation({
    //   longitude: Number(longitude),
    //   latitude: Number(longitude),
    //   name: "",
    //   address: this.data.address
    // })
    var that = this
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          lat: res.latitude * 1000000,
          lng: res.longitude * 1000000,
          address: res.address
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
        } else {
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
        var tempFilePaths = res.tempFilePaths
        that.setData({
          cover: tempFilePaths[0]
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
        var tempFilePaths = res.tempFilePaths
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          cover: tempFilePaths[0]
        })
      }
    })
  },
  modelimg: function () {
    app.wxService.navigateTo('organize/act_cover/act_cover', { id: 2 }, res => {
      console.info(res)
    })
  },
  addApplyFields: function (e) {
    app.wxService.navigateTo('organize/act_applyfields/act_applyfields', { isEidt: false })
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
              applyField: JSON.stringify(that.data.applyFields[fieldIndex]),
            fieldNames:JSON.stringify(fieldNames)
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
    for (var i=0;i< this.data.applyFields.length;i++) {
      fieldNames.push(this.data.applyFields[i].fieldName)
    }
    console.info(fieldNames)
    return fieldNames;
  },

  setActFee: function () {
    app.wxService.navigateTo('organize/act_fee/act_fee', {
      actId: '11',
      tickets: JSON.stringify(this.data.actInfo.tickets),
      neeToPay: this.data.actInfo.needToPay,
      howToPay: this.data.actInfo.howToPay,
      maxApplyCount: this.data.actInfo.maxApplyCount,
      costDesc: this.data.actInfo.costDesc
    })
  },
  setActType: function () {
    app.wxService.navigateTo('organize/act_type/act_type', { id: 2 }, res => {
      console.info(res)
    })
  },
  setActSMSTips: function () {
    app.wxService.navigateTo('organize/act_smstips/act_smstips', { id: 2 }, res => {
      console.info(res)
    })
  },
  choseApplyFields: function (e) {
    console.log(e.target.id)
    var applyFields = this.data.applyFields
    applyFields[e.target.id].isCheck = !applyFields[e.target.id].isCheck
    this.setData({
      applyFields: applyFields
    })

  },


  //时间控件

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
  bindChange: function (e) {
    const val = e.detail.value
    console.info(val)
    var y = this.data.years[val[0]];
    var m = this.data.months[val[1]];
    var ds = [];
    if (m == 2) {//2月分
      if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) {
        ds = day29
      } else {
        ds = day28

      }
    } else {//31天
      if (m == 1 || 3 || 5 || 7 || 8 || 10 || 12) {
        ds = day30

      } else {//30天
        ds = day31

      }
    }
    this.setData({
      days: ds,
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]],
      hour: this.data.hours[val[3]],
      minute: this.data.minutes[val[4]],
    })
    // 小于10的数值补上0
    if (this.data.months[val[1]] < 10) {
      this.setData({
        month: '0' + this.data.months[val[1]] + "月",
      })
    }
    if (this.data.days[val[2]] < 10) {
      this.setData({
        day: '0' + this.data.days[val[2]] + "日",
      })
    }
    if (this.data.hours[val[3]] < 10) {
      this.setData({
        hour: '0' + this.data.hours[val[3]] + "时",
      })
    }
    if (this.data.minutes[val[4]] < 10) {
      this.setData({
        minute: '0' + this.data.minutes[val[4]],
      })
    }
  },
  hideModal() {
    this.setData({ modalShowStyle: "" });

  },
  togglePicker: function () {
    this.setData({
      modalShowStyle: 'opacity:1;pointer-events:auto;'
    })
  },
  touchCancel: function (event) {
    this.hideModal();
  },
  touchAdd: function (event) {
    this.hideModal();
    this.setData({
      starttime: this.data.year + '年' + this.data.month + '月' + this.data.day + '日' + this.data.hour + ':' + this.data.minute
    })
  },
})