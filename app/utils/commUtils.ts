import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userInfoState } from '../recoil/userState';
import * as env from "./envUtils"
import clog from "./logUtils";
import * as CONST from "./Const";
import $ from "jquery"
import { validate } from "schema-utils";

//sleep 기능
export function sleep(ms) {
  const loopTime = Date.now() + ms;
  while (Date.now() < loopTime) {}
}

export function frontLangSet(apiLang) {
  let lang = "";
  switch (apiLang) {
    case CONST.STR_APILANG_KOR : { lang = CONST.STR_LANG_KOR; break; }
    case CONST.STR_APILANG_ENG : { lang = CONST.STR_LANG_ENG; break; }
    case CONST.STR_APILANG_CHA : { lang = CONST.STR_LANG_CHA; break; }
    default : {lang = CONST.STR_LANG_KOR; break; }
  }
  return lang;
}

export function apiLangSet(flang) {
  let lang = "";
  switch (flang) {
    case CONST.STR_LANG_KOR : { lang = CONST.STR_APILANG_KOR; break; }
    case CONST.STR_LANG_ENG : { lang = CONST.STR_APILANG_ENG; break; }
    case CONST.STR_LANG_CHA : { lang = CONST.STR_APILANG_CHA; break; }
    default : {lang = CONST.STR_APILANG_KOR; break; }
  }
  return lang;
}

//수식을 사용하는 이유는 대한민국 서울 시간에 맞추기 위함입니다. (기존 시간은 UTC 기준)
export function curTimeString():string {
    return new Date(+new Date() + 3240 * 10000).toISOString().replace(/\..[0-9]*/, '');
}

// replace : /gi : 대소문자구분 없이 전체 문자열 치환
export function date2formedstr(date, format):string {
  if (isnull(date)) return "";
  if (isnull(format)) return "";
  //var utc = ;
  var yyyyMMddhhmmss = new Date(+date + 3240 * 10000).toISOString();
  return utc2formedstr(yyyyMMddhhmmss, format);
}

export function utc2formedstr(utc, format):string {
  if (isnull(utc)) return "";
  if (isnull(format)) return "";
  //var utc = ;
  var yyyyMMddhhmmss = utc.replace(/\..[0-9]*/, '').replace(/[\-:TZ]/gi, '');
  
  var rstr = "";
  var tp = 0;
  var yearL = 0, monthL = 0, dayL = 0, hourL = 0, minL = 0, secL = 0;

  for (var i = 0; i < format.length; i ++) {
    if ( (format[i] == "Y") || (format[i] == "y") ) yearL ++;
    if ( format[i] == "M" ) {
      if ( yearL < 4 ) {
        tp = 2;
      }
    }
  }

  var timeFormatCha = "YyMDdhms"
  for (var i = 0; i < format.length; i ++) {
    if ( timeFormatCha.includes(format[i]) ) {
      rstr = rstr + yyyyMMddhhmmss[tp++];
    } else {
      rstr = rstr + format[i];
    }
  }
  return rstr;
}


//
//utc2formedstr(utc, tiemformat);
export function utc2time(format, strTime):string {
  return utc2formedstr(strTime, format);
  /*
  //clog(strTime);
  if (strTime == null) return strTime;
  if (format == "YYYY-MM-DD") {
      var val = strTime.split("T");
      return (val.length>0)?val[0]:strTime;
  }
  return strTime;
  */
}

export function curformattime(format) {
  return utc2formedstr(curTimeString(), format);
  //return utc2time(format, curTimeString());
}


export function isnull(val):boolean {
  var ret = false;
  // need object handle
  if ( typeof val == 'undefined') {
    //clog("isnull : " + "undefined");
    ret = true;
  } else if ( val == null) {
    //clog("isnull : " + "null");
    ret = true;
  //} else if ( val&&val.length<=0) {
  } else if ( val.length<=0) {
    //clog("1isnull : " + "zero length");
    ret = true;
  }
  return ret;
}

export function execCeilVal(num) {
  if (isnull(num)) return 10;
  if (typeof num !== "number") return 10;

  var strNum = num.toString();
  //clog("execMaxVal type check : " + strNum);
  //clog("execMaxVal type check : " + Math.pow(10, strNum.length));

  var maxVal = Math.pow(10, strNum.length);
  var ratio = num/maxVal*100;
  var calVal = (ratio>80)?maxVal:(ratio>50)?maxVal*0.7:(ratio>30)?maxVal*0.5:(ratio>20)?maxVal*0.3:maxVal*ratio/100;
  calVal = (strNum.length===1)?10:calVal;

  //return Math.pow(10, strNum.length);
  return calVal;
}



// 한글은 preventDefault롤 방지가 안됨
export function beforeHandleComment(e, chklen) {
  // 키 입력 이전의 길이
  // 8 : backspace
  // 46 : delete
  var curVal = e.target.value;
  if ( (e.keyCode === 8) || ( e.keyCode === 46)  )  {
    return;
  }
  if ( curVal.length >= chklen ) {
    e.preventDefault();
  }
}
// 한글은 preventDefault롤 방지가 안됨
// 제한 크기를 넘어가면, 글자 대치한다.
export function afterHandleComment(e, chkLen, callback) {
  var curVal = e.target.value;
  if ( curVal.length >= chkLen )  {
      callback(curVal.substring(0, chkLen));
  }
}



export function jsopen_Popup(e) {
  var actTag = e.target;
  var activeLayer = actTag.getAttribute("data-pop");
  var userHeight = actTag.getAttribute("data-ds-height");
  if (isnull(activeLayer) ) return;

  // 레이어 팝업 화면 가운데 정렬
  userHeight = (isnull(userHeight))?0:parseInt(userHeight);
  var layerHeight = $("#" + activeLayer).outerHeight();
  clog("jsopen_Popup : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  if ( (layerHeight < 100)&&(userHeight > 0) ) layerHeight = userHeight;
  if ( (userHeight > 0)&&(layerHeight > userHeight) ) layerHeight = userHeight;

  //layerHeight = (layerHeight<100)?700:layerHeight;
  //layerHeight = 700;
  //var lH = ($(window).height() - layerHeight) / 2 + $(window).scrollTop();
  //clog("jsopen_Popup : TOP : " + lH + " : WH : " + $(window).height() + " : LH : " + layerHeight);


  $("#" + activeLayer + ".popup-layer").css("position", "absolute");
  $("#" + activeLayer + ".popup-layer").css("top", ($(window).height() - layerHeight) / 2 + $(window).scrollTop() + "px");
  //$("#" + activeLayer + ".popup-layer").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
  $("#" + activeLayer + ".popup-layer").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

  // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
  $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
  $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
  $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)

  var mql2 = window.matchMedia("screen and (min-width: 501px)");
  if (mql2.matches) {
    $("body").css("overflow-y", "hidden"); //501이상에서 배경고정
  } else {
    $("body").css("overflow-y", "auto"); //501이하에서 배경 스크롤
  }

  //닫기 버튼 , 배경 클릭 시
  $("#" + activeLayer)
    .children()
    .children(".js-close")
    .on("click", function () {
      $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
  });

  //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
  $("#" + activeLayer + ".layer-out")
    .children()
    .children(".js-close")
    .on("click", function () {
      $(".dimm").stop().hide().css("z-index", "11");
  });

    //로그아웃 팝업 닫기 버튼, 220726 추가
    //안내팝업 닫기 버튼, 220826 추가
  $("#" + activeLayer + ".popup-layer.popup-logout, .popup-layer.popup-basic")
    .children()
    .children()
    .children(".js-close, .btn-close")
    .on("click", function () {
      $("#" + activeLayer + ".popup-layer.popup-logout").addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      $(".dimm").stop().hide().css("z-index", "11");
    });
  //20220923 회원탈퇴여부팝업
  $("#" + activeLayer + ".popup-layer.popup-withdrawal, .popup-layer.popup-basic")
    .children()
    .children()
    .children(".js-close, .btn-close")
    .on("click", function () {
      $("#" + activeLayer + ".popup-layer.popup-withdrawal").addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      $(".dimm").stop().hide().css("z-index", "11");
    });
  //20220923 회원탈퇴완료팝업
  $("#" + activeLayer + ".popup-layer.popup-withdrawalcomplete, .popup-layer.popup-basic")
    .children()
    .children()
    .children(".js-close, .btn-close")
    .on("click", function () {
      $("#" + activeLayer + ".popup-layer.popup-withdrawalcomplete").addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      $(".dimm").stop().hide().css("z-index", "11");
    });
  //이미지크롭 팝업 닫기 버튼, 220826 추가
  $("#" + activeLayer + ".popup-layer.popup-basic.imgcrop")
    .children()
    .children(".js-close, .btn-close")
    .on("click", function () {
      $("#" + activeLayer + ".popup-layer.popup-basic.imgcrop").addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      $(".dimm").stop().hide().css("z-index", "11");
  });

    /////////
  //var layerTag = actTag.closest("#"+activeLayer);
  var layerTag = document.querySelector("#"+activeLayer);
  var closeTags = layerTag.querySelectorAll(".btn-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

  closeTags = layerTag.querySelectorAll(".js-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

}


export function jsopen_m_Popup(e) {
  e.preventDefault();
  //var actTag = (e.target.tagName == "DIV") ? e.target : e.currentTarget;
  var actTag = e.target;
  var activeLayer = actTag.getAttribute("data-pop");
  if ( isnull(activeLayer) ) {
    actTag = e.currentTarget;
    activeLayer = actTag.getAttribute("data-pop");
  }
  var userHeight = actTag.getAttribute("data-ds-height");
  if (isnull(activeLayer) ) return;

  // 레이어 팝업 화면 가운데 정렬
  userHeight = (isnull(userHeight))?0:parseInt(userHeight);
  var layerHeight = $("#" + activeLayer).outerHeight();
  clog("jsopen_Popup : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  if ( (layerHeight < 100)&&(userHeight > 0) ) layerHeight = userHeight;
  if ( (userHeight > 0)&&(layerHeight > userHeight) ) layerHeight = userHeight;

  $("#" + activeLayer + ".popup-layer.page-report").css("position", "absolute");
  $("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - layerHeight) / 2 + $(window).scrollTop() + "px");
  //$("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
  $("#" + activeLayer + ".popup-layer.page-report").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

  var mql3 = window.matchMedia("screen and (min-width: 1522px)"); //220628(3) min-width값 변경,
  //if (mql3.matches) {
  //    $(".js-open-m").attr("");
  //} else {
  $(activeLayer).attr("data-pop");  //220628, ".js-open-m" 을 this로 변경
  // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
  $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
  $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
  $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)

  //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
  $("#" + activeLayer + ".layer-out")
    .children()
    .children(".js-close")
    .on("click", function () {
        $(".dimm").stop().hide().css("z-index", "11");
  });
  //}

  //닫기 버튼 , 배경 클릭 시
  $("#" + activeLayer)
    .children()
    .children(".js-close")
    .on("click", function () {
        $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
  });

  /////////
  //var layerTag = actTag.closest("#"+activeLayer);
  var layerTag = document.querySelector("#"+activeLayer);
  var closeTags = layerTag.querySelectorAll(".btn-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

  closeTags = layerTag.querySelectorAll(".js-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }
}  

export function jsopen_m2_Popup(e, isMobile) {
  //221020 추가,
  //$(".js-open-m2").click(function (e) {
  e.preventDefault();
  if (!isMobile) return;
  var actTag = e.target;
  var activeLayer = actTag.getAttribute("data-pop");
  if ( isnull(activeLayer) ) {
    actTag = e.currentTarget;
    activeLayer = actTag.getAttribute("data-pop");
  }
  var userHeight = actTag.getAttribute("data-ds-height");
  if (isnull(activeLayer) ) return;

  var mql3 = window.matchMedia("screen and (min-width: 1377px)"); //220628(3) min-width값 변경,
  //if (mql3.matches) {
    //var activeLayer = $(".js-open-m2").attr("");
  //} else {
    //var activeLayer = $(this).attr("data-pop"); //220628, ".js-open-m2" 을 this로 변경
    // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
    $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
    $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
    $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)

    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + activeLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function () {
        $(".dimm").stop().hide().css("z-index", "11");
    });
  //}

  // 레이어 팝업 화면 가운데 정렬
  userHeight = (isnull(userHeight))?0:parseInt(userHeight);
  var layerHeight = $("#" + activeLayer).outerHeight();
  clog("jsopen_m2_Popup : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  if ( (layerHeight < 100)&&(userHeight > 0) ) layerHeight = userHeight;
  if ( (userHeight > 0)&&(layerHeight > userHeight) ) layerHeight = userHeight;
  //layerHeight = userHeight;  
  clog("jsopen_m2_Popup : RES : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  
  $("#" + activeLayer + ".popup-layer.page-report").css("position", "absolute");
  $("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - layerHeight) / 2 + $(window).scrollTop() + "px");
  //$("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
  $("#" + activeLayer + ".popup-layer.page-report").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

  //닫기 버튼 , 배경 클릭 시
  $("#" + activeLayer)
    .children()
    .children(".js-close")
    .on("click", function () {
      $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
  });
//  });

  /////////
  //var layerTag = actTag.closest("#"+activeLayer);
  var layerTag = document.querySelector("#"+activeLayer);
  var closeTags = layerTag.querySelectorAll(".btn-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

  closeTags = layerTag.querySelectorAll(".js-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }
}

//221020 추가,
export function jsopen_m3_Popup(e, isMobile) {
//  $(".js-open-m3").click(function (e) {
  e.preventDefault();
  if (!isMobile) return;
  var actTag = e.target;
  var activeLayer = actTag.getAttribute("data-pop");
  if ( isnull(activeLayer) ) {
    actTag = e.currentTarget;
    activeLayer = actTag.getAttribute("data-pop");
  }
  var userHeight = actTag.getAttribute("data-ds-height");
  if (isnull(activeLayer) ) return;

  var mql3 = window.matchMedia("screen and (min-width: 768px)"); //220628(3) min-width값 변경,
  
  //if (mql3.matches) {
  //  var activeLayer = $(".js-open-m3").attr("");
  //} else {
  //  var activeLayer = $(this).attr("data-pop"); //220628, ".js-open-m2" 을 this로 변경
    // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
    $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
    $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
    $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)

    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + activeLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function () {
        $(".dimm").stop().hide().css("z-index", "11");
      });
  //}
  // 레이어 팝업 화면 가운데 정렬
  userHeight = (isnull(userHeight))?0:parseInt(userHeight);
  var layerHeight = $("#" + activeLayer).outerHeight();
  clog("jsopen_m3_Popup : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  if ( (layerHeight < 100)&&(userHeight > 0) ) layerHeight = userHeight;
  if ( (userHeight > 0)&&(layerHeight > userHeight) ) layerHeight = userHeight;

  $("#" + activeLayer + ".popup-layer.page-report").css("position", "absolute");
  $("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - layerHeight) / 2 + $(window).scrollTop() + "px");
  //$("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
  $("#" + activeLayer + ".popup-layer.page-report").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

  //닫기 버튼 , 배경 클릭 시
  $("#" + activeLayer)
    .children()
    .children(".js-close")
    .on("click", function () {
      $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
    });
//  });
  /////////
  //var layerTag = actTag.closest("#"+activeLayer);
  var layerTag = document.querySelector("#"+activeLayer);
  var closeTags = layerTag.querySelectorAll(".btn-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

  closeTags = layerTag.querySelectorAll(".js-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }
}


export function jsopen_s_Popup(e, isMobile) {
  e.preventDefault();
  if (!isMobile) return;
  //var actTag = (e.target.tagName == "DIV") ? e.target : e.currentTarget;
  var actTag = e.target;
  var activeLayer = actTag.getAttribute("data-pop");
  if ( isnull(activeLayer) ) {
    actTag = e.currentTarget;
    activeLayer = actTag.getAttribute("data-pop");
  }
  var userHeight = actTag.getAttribute("data-ds-height");
  if (isnull(activeLayer) ) return;

  var mql4 = window.matchMedia("screen and (min-width: 767px)");
  //if (mql4.matches) {
  //  var activeLayer = $(".js-open-s").attr("");
  //} else {
  //var activeLayer = $(this).attr("data-pop"); 아래 구문으로 변경
  $(activeLayer).attr("data-pop");  //220628, ".js-open-m" 을 this로 변경

  // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
  $("#" + activeLayer).removeClass("hidden");
  $(".dimm").stop().show().css("z-index", "30");
  $("body").css("overflow-y", "hidden");

  //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
  $("#" + activeLayer + ".layer-out")
    .children()
    .children(".js-close")
    .on("click", function () {
      $(".dimm").stop().hide().css("z-index", "11");
  });
  //}

  // 레이어 팝업 화면 가운데 정렬
  userHeight = (isnull(userHeight))?0:parseInt(userHeight);
  var layerHeight = $("#" + activeLayer).outerHeight();
  clog("jsopen_s_Popup : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  if ( (layerHeight < 100)&&(userHeight > 0) ) layerHeight = userHeight;
  if ( (userHeight > 0)&&(layerHeight > userHeight) ) layerHeight = userHeight;

  $("#" + activeLayer + ".popup-layer.page-workplace").css("position", "absolute");
  $("#" + activeLayer + ".popup-layer.page-workplace").css("top", ($(window).height() - layerHeight) / 2 + $(window).scrollTop() + "px");
  //$("#" + activeLayer + ".popup-layer.page-workplace").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
  $("#" + activeLayer + ".popup-layer.page-workplace").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

  //닫기 버튼 , 배경 클릭 시
  $("#" + activeLayer)
    .children()
    .children(".js-close")
    .on("click", function () {
      $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
      $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
    });

  /////////
  //var layerTag = actTag.closest("#"+activeLayer);
  var layerTag = document.querySelector("#"+activeLayer);
  var closeTags = layerTag.querySelectorAll(".btn-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

  closeTags = layerTag.querySelectorAll(".js-close");
  for ( var i = 0; i < closeTags.length; i ++) {
    var child = closeTags[i];
    child.addEventListener("click", function (e) {
      jsclose_Popup(activeLayer);
    });
  }

}

export function jsclose_Popup(layerId) {
  //clog("IN JSCLOSE : " + layerId);
  $(".dimm").stop().hide().css("z-index", "11");
  $("#" + layerId).addClass("hidden"); //모든 팝업 감추기
  //layerTag.addClass("hidden"); //모든 팝업 감추기
  $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
}


export function jsopen_s_in_Popup(e, isMobile) {
///////////////////////////////////////////////
  e.preventDefault();
  if (!isMobile) return;
  //var actTag = (e.target.tagName == "DIV") ? e.target : e.currentTarget;
  var actTag = e.target;
  var activeLayer = actTag.getAttribute("data-pop");
  if ( isnull(activeLayer) ) {
    actTag = e.currentTarget;
    activeLayer = actTag.getAttribute("data-pop");
  }
  var userHeight = actTag.getAttribute("data-ds-height");
  if (isnull(activeLayer) ) return;

  var mql4 = window.matchMedia("screen and (min-width: 767px)");
  $(activeLayer).attr("data-pop");  //220628, ".js-open-m" 을 this로 변경
  $("#" + activeLayer).removeClass("hidden");
  $(".dimm").stop().show().css("z-index", "30");
  $("body").css("overflow-y", "hidden");

  //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
  $("#" + activeLayer + ".layer-out")
    .children()
    .children(".js-close")
    .on("click", function () {
      $(".dimm").stop().hide().css("z-index", "11");
    });
  //  }
////////////////////////////////////////////////
  // 레이어 팝업 화면 가운데 정렬
  userHeight = (isnull(userHeight))?0:parseInt(userHeight);
  var layerHeight = $("#" + activeLayer).outerHeight();
  //clog("jsopen_Popup : WH : " + $(window).height() + " : LH : " + layerHeight + " UH : " + userHeight);
  if ( (layerHeight < 100)&&(userHeight > 0) ) layerHeight = userHeight;
  if ( (userHeight > 0)&&(layerHeight > userHeight) ) layerHeight = userHeight;

  $("#" + activeLayer + ".popup-layer.page-workplace").css("position", "absolute");
  $("#" + activeLayer + ".popup-layer.page-workplace").css("top", ($(window).height() - layerHeight) / 2 + $(window).scrollTop() + "px");
  //$("#" + activeLayer + ".popup-layer.page-workplace").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
  $("#" + activeLayer + ".popup-layer.page-workplace").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

  //닫기 버튼 , 배경 클릭 시
  $("#" + activeLayer)
    .children()
    .children(".js-close")
    .on("click", function () {
      $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
    });
//});
}




/// default select box handler
// option 선택 시  값 변경 액션
/// default select box handler
export function selectOption(optionElement) { // 확장 가능
  const selectBox = optionElement.closest(".select");
  const selectedElement = selectBox.querySelector(".selected-value ");
  selectedElement.textContent = optionElement.textContent;
  var optionData = optionElement.getAttribute("data-value");
  selectedElement.setAttribute("data-value", optionData);
}

export function onClickSelect(e, handleSelect) {
  const selectBoxElement = e.currentTarget;
  const targetElement = e.target;
  const isOptionElement = targetElement.classList.contains("option");
  if (isOptionElement) {
    if (isnull(handleSelect)) {
      selectOption(targetElement)
    } else {
      handleSelect(targetElement);
    }
  }
  toggleSelectBox(selectBoxElement);
}
// select active 액션
export function toggleSelectBox(selectBox) {
  selectBox.classList.toggle("active");
}
