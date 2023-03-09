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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//
import styled from "styled-components";
//import "/static/css/style.css"
import $ from "jquery"
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { langState } from '../../recoil/langState';
import { menuState, urlState } from '../../recoil/menuState';
//
import { userInfoState, authState } from "../../recoil/userState";
//
import * as i18n from '../../utils/langs/i18nUtils';
import { useTrans } from '../../utils/langs/useTrans'
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"
import * as CONST from "../../utils/Const"
import * as HttpUtil from "../../utils/api/HttpUtil";
//
import Nav from "../leftnav/Nav";

/**
 * @brief EHP 헤더 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function HeaderTest() {
  const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);
  const setRecoilUrl = useSetRecoilState(urlState);
  //

  const [hbMenuToggle, setRecoilHbMenuToggle] = useRecoilState(menuState);
  //  console.log("in EHP>Header : " + hbMenuToggle);

  // useTrans 기능 축약
  const t = useTrans();
  const [settingPopup, setSettingPopup] = useState(false);
  const [userInfoPopup, setUserInfoPopup] = useState(false);
  const [alarmPopup, setAlarmPopup] = useState(false);

  function showRightSideBar() {
    $(".navbar__menu li.active").removeClass("active");
    $(".navbar").addClass("active");
  }
  function hideRightSideBar() {
    $(".navbar").removeClass("active");
  }

  function handleHamBtnClick(e) {
    console.log("토글 사이드바 버튼클릭");
    //      if (active) {
    if (hbMenuToggle) {
      console.log("토글 사이드바 버튼클릭 - active");
      hideRightSideBar();
    } else {
      console.log("토글 사이드바 버튼클릭 - not active");
      showRightSideBar();
    }
    //setActive(active?false:true);
    setRecoilHbMenuToggle(hbMenuToggle ? false : true);
  }

  function onClickFuncBtn(e) {
    var actTag = (e.target.tagName == 'SPAN') ? e.currentTarget : e.target as unknown as HTMLElement;
    var funcLi = actTag.parentElement as unknown as HTMLElement;
    var funcUl = actTag.closest(".header__etc");
    clog("IN HEADER : TAG NAME : " + actTag.tagName + " : " + actTag.className + " : " + funcUl);

    if (CUTIL.isnull(funcUl)) return;

    //var actTag = (curTag.tagName=='UL')?e.target:e.currentTarget;
    for (var i = 0; i < funcUl.children.length; i++) {
      var childLi = funcUl.children[i];
      if (childLi.children.length != 1) continue; // 'A' tag
      var btnTag = childLi.children[0]; // 'A' tag
      if (actTag.className != btnTag.className) {
        childLi.classList.remove("active");
      }
    }
    //actTag : btn-set, btn-admin, btn-alarm
    if (actTag.classList.contains("btn-set")) {
      /* toggle
      if ( funcLi.classList.contains("active") ) {
 
      } else {
        funcLi.classList.add("active");
      }
      */
      setSettingPopup(!settingPopup); // toggle
      setUserInfoPopup(false);
      setAlarmPopup(false);
    }
    if (actTag.classList.contains("btn-admin")) {
      setSettingPopup(false);
      setUserInfoPopup(!userInfoPopup); // toggle
      setAlarmPopup(false);
    }
    if (actTag.classList.contains("btn-alarm")) {
      setSettingPopup(false);
      setUserInfoPopup(false);
      setAlarmPopup(!alarmPopup); // toggle
    }
    funcLi.classList.toggle("active");

  }
  const navigate = useNavigate();

  function onClickGoPage(url) {
    // 페이지 이동
    setRecoilUrl(url);
    navigate(CONST.URL_EHP);
    setRecoilHbMenuToggle(false);
  }

  return (
    <>
      <header>
        <div className="header__left">
          <a href="#" className={!hbMenuToggle ? "navbar__toggleBtn" : "navbar__toggleBtn active"} onClick={(e) => { handleHamBtnClick(e) }}>
            <span className="hide">전체메뉴</span>
          </a>
          {/*  20220711 hjo - 문구수정 및 번역 제거 요청 */}
          <h1 style={{ "cursor": "pointer" }} className="header__title">
            <a onClick={(e) => { onClickGoPage(CONST.URL_MAIN_DASHBOARD) }}>e-Health Portal</a>
          </h1>
        </div>
        <div className="header__right">
          {/*          <!--time 삭제-->*/}
          <ul className="header__etc">
            {/*<!--선택됐을 때 active 클래스 (버튼에 배경 생김)-->*/}
            <li className={""/*active*/}>
              <a className="btn btn-set" onClick={(e) => { onClickFuncBtn(e) }}>
                <span className="hide">환경설정</span>
              </a>
              {/*<!--새로고침버튼 삭제후 설정버튼으로 변경됨-->*/}
            </li>
            <li className={""/*active*/}>
              <a className="btn btn-alarm" onClick={(e) => { onClickFuncBtn(e) }}>
                <span className="hide">새알림</span>
                <p>2</p>
              </a>
            </li>
            <li className={""/*active*/}>
              <a className="btn btn-admin" onClick={(e) => { onClickFuncBtn(e) }}>
                <span>{userInfo.userName}</span>
              </a>
              {/*<Link to="/login" className="btn btn-admin"><span>Dodam</span></Link>*/}
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
          alarmPopup={alarmPopup} />
      </header>
      {/*<!-- //header, 헤더 -->*/}
      <Nav handleClick={handleHamBtnClick} />
    </>
  )

}
export default HeaderTest;

function Setting(props) {
  // use recoil
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  //
  const isOpen = props.settingPopup;

  // 다국어 설정 변경 및 recoil 상태 변경
  /* async function exchgLanguage(e, lang: string) {
    var curTag = (e.target.tagName == "SAPN") ? e.currentTarget : e.target; // button 
    var sttBtnDiv = curTag.closest(".setting__btn");

    for (var i = 0; i < sttBtnDiv.children.length; i++) {
      var childBtn = sttBtnDiv.children[i];
      childBtn.classList.remove("on");
    }

    curTag.classList.add("on");

    await i18n.changeLang(lang);
    setRecoilLangs(lang);
  } */

  return (
    <>
      {/*<!--환경설정 팝업, 개발하시고 style="display:none; 는 빼셔도 됩니다.-->*/}
      <ul className="header__setting" style={{ display: (isOpen) ? "" : "none" }}>
        <li>
          <p>언어</p>
          <div className="setting__btn">
            {/*<!--선택되어있는 상태, class="on"-->*/}
            <button type="button" className={(langs == CONST.STR_LANG_KOR) ? "on" : ""} /* onClick={(e) =>  { exchgLanguage(e, CONST.STR_LANG_KOR) } */>
              <span>한국어</span>
            </button>
            <button type="button" data-testid="English" className={(langs == CONST.STR_LANG_ENG) ? "on" : ""} /* onClick={(e) => { exchgLanguage(e, CONST.STR_LANG_ENG) }} */>
              <span>English</span>
            </button>
            <button type="button" className={(langs == CONST.STR_LANG_CHA) ? "on" : ""}>
              <span>中文</span>
            </button>
          </div>
        </li>
        <li>
          <p>테마</p>
          <div className="setting__btn">
            <button type="button" className="on"><span>White</span></button>
            <button type="button"><span>Dark</span></button>
          </div>
        </li>
      </ul>
      {/*<!--//환경설정 팝업-->*/}
    </>
  )
}

function UserInfo(props) {
  const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);
  const resetRecoilUserInfo = useResetRecoilState(userInfoState);
  const setRecoilUrl = useSetRecoilState(urlState);

  const isOpen = props.userInfoPopup;
  //
  const navigate = useNavigate();
  //
  async function onClickLogout(e) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
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
      <ul className="header__userinfo" style={{ display: (isOpen) ? "" : "none" }}>
        <li><a href="#">My Account</a></li>
        <li><a className="js-open" data-pop="pop-logout" onClick={(e) => onClickLogout(e)}>Logout</a></li>
      </ul>
      {/*<!--//사용자 정보 팝업-->*/}
    </>
  )
}

function Alarm(props) {
  const isOpen = props.alarmPopup;
  return (
    <>
      {/*<!--알람 팝업-->*/}
      <div className="header__alarm" style={{ display: (isOpen) ? "" : "none" }}>
        <div className="alarm__top">
          <p className="title">Alarm<span className="num">14 건</span></p>
          <button type="button"><span>View More</span></button>
        </div>
        <ul className="alarm__list">
          <li>
            <a href="#">
              <div className="list__name">
                <button type="button"><span className="hide">삭제</span></button>
                <p>Alarm Title</p>
                <p className="num">4건</p>
              </div>
              <div className="list__info">
                <p className="list__txt">
                  <span>TEXT_TEXT_TEXT_TEXT_TEXT_TEXT_TEXTTEXT_TEXT</span>
                  <span>TEXT_TEXT_TEXT_TEXT_TEXT_TEXT_TEXTTEXT_TEXT</span>
                </p>
                <p className="time">20-01-27  12:34</p>
              </div>
            </a>
          </li>
          <li>
            <a href="#">
              <div className="list__name">
                <button type="button"><span className="hide">삭제</span></button>
                <p>새로운 기기가 추가되었습니다.</p>
                <p className="num">4건</p>
              </div>
              <div className="list__info">
                <p className="list__txt">
                  <span>TEXT_TEXT_TEXT_TEXT_TEXT_TEXT_TEXTTEXT_TEXT</span>
                  <span>TEXT_TEXT_TEXT_TEXT_TEXT_TEXT_TEXTTEXT_TEXT</span>
                </p>
                <p className="time">20-01-27  12:34</p>
              </div>
            </a>
          </li>
          <li>
            <a href="#">
              <div className="list__name">
                <button type="button"><span className="hide">삭제</span></button>
                <p>새로운 기기가 추가되었습니다.</p>
                <p className="num">4건</p>
              </div>
              <div className="list__info">
                <p className="list__txt">
                  <span>TEXT_TEXT_TEXT_TEXT_TEXT_TEXT_TEXT</span>
                  <span>TEXT_TEXT_TEXT_TEXT_TEXT_TEXT_TEXT</span>
                </p>
                <p className="time">20-01-27  12:34</p>
              </div>
            </a>
          </li>
        </ul>
      </div>
      {/*<!--//알람 팝업-->*/}
    </>
  )
}
