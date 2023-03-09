/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-09
 * @brief EHP Header 컴포넌트
 *
 ********************************************************************/

import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate } from "react-router-dom";
//
import styled from "styled-components";
//import "/static/css/style.css"
import $ from "jquery"
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { langState } from '../../recoil/langState';
import { urlState, menuState, headerSettingState, headerAlarmState, headerUserInfoState, treeMenuState, loadingBoxState } from '../../recoil/menuState';

//
import { userInfoLoginState, userInfoState } from "../../recoil/userState";

//utils
import * as i18n from '../../utils/langs/i18nUtils';
import { useTrans } from '../../utils/langs/useTrans'
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"
import * as CONST from "../../utils/Const"
import * as HTTPUTIL from "../../utils/api/HttpUtil";
import * as USERUTIL from "../../utils/user/userUtils"
//
import LocalTimer from "./LocalTimer";
import AlarmCount from "./AlarmCount";
import Nav from "../leftnav/Nav";

/**
 * @brief EHP 헤더 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function Header(props) {
  //trans, navgate, ref
  const navigate = useNavigate();
  const mobileRef = useRef(null); // Mobile Check용
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const setRecoilUrl = useSetRecoilState(urlState);
  const [hbMenuToggle, setRecoilHbMenuToggle] = useRecoilState(menuState);
  const [settingPopup, setRecoilSettingPopup] = useRecoilState(headerSettingState);
  const [alarmPopup, setRecoilAlarmPopup] = useRecoilState(headerAlarmState);
  const [userInfoPopup, setRecoilUserInfoPopup] = useRecoilState(headerUserInfoState);
  const [treeOpen, setRecoilTreeOpen] = useRecoilState(treeMenuState);
  
  const [alarmCount, setAlarmCount] = useState(0); // 읽지 않은 alarm
  const [alarmCountReload, setAlarmCountReload] = useState(false);

  const [isWindow, setIsWindow] = useState(true);
  const [isPFMobile, setIsPFMobile] = useState(false);
  useEffect(() => { // resize handler  // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if (!CUTIL.isnull(mobileTag)) {
        //clog("WIDTH : " + mobileTag.clientWidth);
        if (mobileTag.clientWidth <= 1500) {
          setIsWindow(false);
        } else {
          setIsWindow(true);
        }
        if (mobileTag.clientWidth <= 758) {
          setIsPFMobile(true);
        } else {
          setIsPFMobile(false);
          setRecoilTreeOpen(true);
        }
      }
    }
    handleResize(); // init ismobile check
    window.addEventListener("resize", handleResize); // resize ismobile check
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  function showRightSideBar() {
    $(".navbar__menu li.active").removeClass("active");
    $(".navbar").addClass("active");
  }
  function hideRightSideBar() {
    $(".navbar").removeClass("active");
  }

  function handleHamBtnClick(e) {
    clog("토글 사이드바 버튼클릭");
    //      if (active) {
    if (hbMenuToggle) {
      clog("토글 사이드바 버튼클릭 - active");
      hideRightSideBar();
    } else {
      clog("토글 사이드바 버튼클릭 - not active");
      showRightSideBar();
    }
    //setActive(active?false:true);
    setRecoilHbMenuToggle(hbMenuToggle ? false : true);
    //
    setRecoilSettingPopup(false);
    setRecoilUserInfoPopup(false);
    setRecoilAlarmPopup(false);
  }


  function onClickFuncBtn(e, type) {
    setRecoilHbMenuToggle(false);
    if (isPFMobile) {
      setRecoilTreeOpen(false);
    }
    if (type === "SETTING") {
      setRecoilSettingPopup(!settingPopup); // toggle
      setRecoilUserInfoPopup(false);
      setRecoilAlarmPopup(false);
    } else if (type === "USER") {
      setRecoilSettingPopup(false);
      setRecoilUserInfoPopup(!userInfoPopup); // toggle
      setRecoilAlarmPopup(false);
    } else if (type === "ALARM") {
      setRecoilSettingPopup(false);
      setRecoilUserInfoPopup(false);
      setRecoilAlarmPopup(!alarmPopup); // toggle
    }
  }

  function onClickGoPage(url) {
    // 페이지 이동
    //setRecoilUrl(url);
    //navigate(CONST.URL_EHP);
    navigate(url);
    setRecoilHbMenuToggle(false);
  }
  //clog("PERFECT MOBILE : " + isPFMobile);
  return (
    <>
      <header ref={mobileRef}>
        <div className="header__left">
          <a href="#" className={!hbMenuToggle ? "navbar__toggleBtn" : "navbar__toggleBtn active"}
            onClick={(e) => { handleHamBtnClick(e) }}>
            <span className="hide">전체메뉴</span>
          </a>
          {/*  20220711 hjo - 문구수정 및 번역 제거 요청 */}
          <h1 style={{ "cursor": "pointer" }} className="header__title">
            <a onClick={(e) => (userInfo.loginInfo.role !== CONST.USERROLE_NONE) && onClickGoPage(CONST.URL_DASHBOARD)}>
              {/* <!--221214, h1 영역 수정(이미지로) 공통--> */}
              <h1 className="header__title">
                <img src={require("/static/img/logo_login_title.png")} alt="e-Health Portal" />
              </h1>
            </a>
          </h1>
        </div>
        <div className="header__right" >
          {/*          <!--time 삭제-->*/}
          <ul className="header__etc" style={{ "cursor": "default" }}>
            {/*<!--선택됐을 때 active 클래스 (버튼에 배경 생김)-->*/}
            <li className={(settingPopup)?"active":""}>
              <a className="btn btn-set" onClick={(e) => { onClickFuncBtn(e, "SETTING") }}>
                <span className="hide">환경설정</span>
              </a>
              {/*<!--새로고침버튼 삭제후 설정버튼으로 변경됨-->*/}
            </li>
            <li className={(alarmPopup)?"active":""}>
              <a className="btn btn-alarm" onClick={(e) => { onClickFuncBtn(e, "ALARM") }}>
                <span className="hide">새알림</span>
                {/*<p>2</p>*/}
                {
                  <AlarmCount
                    alarmCountReload={alarmCountReload}
                    setAlarmCountReload={setAlarmCountReload}
                    setAlarmCount={setAlarmCount}
                  />
                }
              </a>
            </li>
            <li className={(userInfoPopup)?"active":""} >
              <a className="btn btn-admin" onClick={(e) => { onClickFuncBtn(e, "USER") }}>
                <span >{userInfo.userName}</span>
              </a>
            </li>
          </ul>
          <div className="header__logo">
            <span className="hide">LS</span>
          </div>
        </div>
        <Setting
          settingPopup={settingPopup} />
        <UserInfo
          userInfoPopup={userInfoPopup} />
        <Alarm
          alarmPopup={alarmPopup}
          alarmCount={alarmCount}
          setAlarmCountReload={setAlarmCountReload}
        />
      </header>
      {/*<!-- //header, 헤더 -->*/}
      <Nav
        handleClick={handleHamBtnClick}
        isWindow={isWindow}
      />
    </>
  )

}
export default Header;

function Setting(props) {
  // use recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  //
  const isOpen = props.settingPopup;


  // 다국어 설정 변경 및 recoil 상태 변경
  async function exchgLanguage(e, selLang: string) {
    /*var curTag = (e.target.tagName == "SAPN")?e.currentTarget:e.target; // button 
    var sttBtnDiv = curTag.closest(".setting__btn");

    for ( var i = 0; i < sttBtnDiv.children.length; i ++) {
      var childBtn = sttBtnDiv.children[i];
      childBtn.classList.remove("on");
    }

    curTag.classList.add("on");
    */
    saveUserLangs(selLang);
  }

  async function saveUserLangs(frontLang) {
    const apiLang = CUTIL.apiLangSet(frontLang);
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/user/setting/language",
      appQuery: {
        "language": apiLang,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        const nUserInfo = USERUTIL.getDetailUserInfoR(userInfo.loginInfo);
        clog("IN HEADER : CHANGELANGS : " + JSON.stringify(nUserInfo));
        await i18n.changeLang(frontLang);
        setRecoilLangs(frontLang);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }


  return (
    <>
      {/*<!--환경설정 팝업, 개발하시고 style="display:none; 는 빼셔도 됩니다.-->*/}
      <ul className="header__setting" style={{ display: (isOpen) ? "" : "none", "cursor": "default" }}>
        <li>
          <p>언어</p>
          <div className="setting__btn">
            {/*<!--선택되어있는 상태, class="on"-->*/}
            <button type="button" className={(langs == CONST.STR_LANG_KOR) ? "on" : ""}
              onClick={(e) => (langs !== CONST.STR_LANG_KOR) && exchgLanguage(e, CONST.STR_LANG_KOR)}
            >
              <span>한국어</span>
            </button>
            <button type="button" className={(langs == CONST.STR_LANG_ENG) ? "on" : ""}
              onClick={(e) => (langs !== CONST.STR_LANG_ENG) && exchgLanguage(e, CONST.STR_LANG_ENG)}
            >
              <span>English</span>
            </button>
            <button type="button" className={(langs == CONST.STR_LANG_CHA) ? "on" : ""}
              onClick={(e) => (langs !== CONST.STR_LANG_CHA) && exchgLanguage(e, CONST.STR_LANG_CHA)}
            >
              <span>中文</span>
            </button>
          </div>
        </li>
        {/*<li>
        <p>테마</p>
        <div className="setting__btn">
          <button type="button" className="on"><span>White</span></button>
          <button type="button"><span>Dark</span></button>
        </div>
  </li>*/}
      </ul>
      {/*<!--//환경설정 팝업-->*/}
    </>
  )
}

function UserInfo(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoState);
  const resetRecoilUserInfo = useResetRecoilState(userInfoState);
  const setRecoilUrl = useSetRecoilState(urlState);

  const isOpen = props.userInfoPopup;
  //
  const navigate = useNavigate();
  //
  async function onClickLogout(e) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "POST",
      appPath: `/api/v2/auth/logout?userId=${userInfo.userId}`,
      appQuery: {
        userId: userInfo.userId,
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      if (data.codeNum == 200) {
        // Y/N 체크 필요?
        sessionStorage.removeItem(CONST.STR_TOKEN);
        sessionStorage.removeItem(CONST.STR_TOKEN_EXPIRETIME);
        localStorage.removeItem(CONST.STR_USERID);
        localStorage.removeItem(CONST.STR_USERROLE);
        localStorage.removeItem(CONST.STR_REFRESHTOKEN);
        localStorage.removeItem(CONST.STR_REFRESHTOKEN_EXPIRETIME);
        //
        resetRecoilUserInfo();
        //
        setRecoilUrl(CONST.URL_LOGIN);
        navigate(CONST.URL_EHP);
      } else {
      }
    }
  }

  return (
    <>
      {/*<!--사용자 정보 팝업-->*/}
      <ul className="header__userinfo" style={{ display: (isOpen) ? "" : "none", "cursor": "default" }}>
        <li><a style={{ "cursor": "pointer" }} className="js-open" data-pop="pop-myaccount" onClick={(e) => CUTIL.jsopen_Popup(e)}>My Account</a></li>
        {/*<li><a className="js-open" data-pop="pop-logout" onClick={(e)=>onClickLogout(e)}>Logout</a></li>*/}
        <li><a style={{ "cursor": "pointer" }} className="js-open" data-pop="pop-logout" onClick={(e) => CUTIL.jsopen_Popup(e)}>Logout</a></li>
      </ul>
      {/*<!--//사용자 정보 팝업-->*/}
    </>
  )
}

function Alarm(props) {
  //trans, navigate
  const navigate = useNavigate();
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);

  //props
  const isOpen = props.alarmPopup;
  const alarmCount = props.alarmCount;
  const setParentAlarmCountReload = props.setAlarmCountReload;


  const [onlyUnread, setOnlyUnread] = useState(false);
  let appPath = "";
  if (onlyUnread) {
    appPath = "?status=unread";
  }
  const [alarmList, setAlarmList] = useState([]);
  const [listReload, setListReload] = useState(false);

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/notice/messages${appPath}`,
    appQuery: {
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: isOpen + listReload + appPath
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    /*
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) {
      setRecoilIsLoadingBox(false);
      navigate(ERR_URL);
    }
    */
    if (retData) {
      setRecoilIsLoadingBox(false);
      if (retData.codeNum == CONST.API_200) {
        //clog("IN HEADER POPUP : ALARM-RES : " + JSON.stringify(retData.body));
        setListReload(false);
        setAlarmList(retData.body);
      }
    }
  }, [retData])

  async function onClickDoToggleReadYn(e, alarm) {
    e.preventDefault();
    e.stopPropagation();

    clog("onClickDoToggleReadYn : " + alarm.readYN);
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "PUT",
      appPath: `/api/v2/notice/isread`,
      appQuery: {
        "noticeId": alarm.noticeId,
        "readYN": (alarm.readYN) ? false : true,
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      if (data.codeNum == CONST.API_200) {
        setParentAlarmCountReload(true);
        setListReload(true);
      } else {
      }
    }
  }
  async function onClickDoToggleGotonReadYn(e, alarm) {
    e.preventDefault();
    e.stopPropagation();

    clog("onClickDoToggleGotonReadYn : " + alarm.readYN);
    let data: any = null;
    if (!alarm.readYN) {
      data = await HTTPUTIL.PromiseHttp({
        httpMethod: "PUT",
        appPath: `/api/v2/notice/isread`,
        appQuery: {
          "noticeId": alarm.noticeId,
          "readYN": (alarm.readYN) ? false : true,
        },
        userToken: userInfo.loginInfo.token,
      });

      if (data) {
        if (data.codeNum == CONST.API_200) {
          setParentAlarmCountReload(true);
        } else {
          setListReload(true);
        }
      }
    }
    setRecoilUrlInfo(alarm.link);
    navigate(alarm.link);

  }

  async function onClickDoAllRead(e) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "PUT",
      appPath: `/api/v2/notice/allread`,
      appQuery: {
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      if (data.codeNum == 200) {
        setParentAlarmCountReload(true);
        setListReload(true);
      } else {
      }
    }
  }

  return (
    <>
      {/*<!--알람 팝업-->*/}
      <div className="header__alarm" style={{ display: (isOpen) ? "" : "none", "cursor": "default" }}>
        <div className="alarm__top">
          <p className="title">Alarm<span className="num">{alarmList.length} 건</span></p>
          <button type="button"
            onClick={(e) => setOnlyUnread(!onlyUnread)}
          >
            <span>{(onlyUnread) ? "전체알림 표시" : "읽지 않은 항목만 표시"}</span>
          </button>
        </div>
        {(alarmList.length <= 0)
          ? <p className="nodata__txt">지난 30일 동안 받은 알림이 없습니다.</p>
          : <div className="alarm__notice">
            <p>최신</p>
            <button type="button"
              className={`btn-alarmread ${(alarmCount <= 0) ? "hidden" : ""}`}
              onClick={(e) => onClickDoAllRead(e)}
            >
              <span>모두 읽음</span>
            </button>
          </div>
        }
        {(alarmList.length > 0) &&
          <ul className="alarm__list">
            {alarmList.map((alarm, idx) => (
              <li key={`li_${idx.toString()}`}>
                <a onClick={(e) => onClickDoToggleGotonReadYn(e, alarm)}>
                  <div className="list__name">
                    <p>{alarm.message}</p>
                    <button type="button"
                      className={(alarm.readYN) ? "readend" : ""}
                      onClick={(e) => onClickDoToggleReadYn(e, alarm)}>
                      <span className="hide">새알람</span>
                    </button>
                  </div>
                  <div className="list__info">
                    <p className="list__txt">
                      <span className="tooltip">{alarm.subMessage}
                        <span className="tooltip-text">{alarm.subMessage}</span>
                      </span>
                    </p>
                    <p className="time">{CUTIL.utc2formedstr(alarm.createdTime, "yy-MM-DD hh:mm:ss")}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        }
        {(alarmList.length > 0) &&
          <p className="alarm__end">지난 30일 동안 받은 모든 알람은 여기까지입니다.</p>
        }
      </div>
      {/*<!--//알람 팝업-->*/}
    </>
  )
}
