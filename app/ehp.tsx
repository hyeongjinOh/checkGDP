import React, { useState, useEffect, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useSearchParams, useParams, Outlet } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { authState, userInfoState, } from './recoil/userState';
import { urlState, menuInfoState, menuState, } from './recoil/menuState';
import { headerSettingState, headerAlarmState, headerUserInfoState } from './recoil/menuState';
import { langState } from './recoil/langState';
//
import $ from "jquery"
//
//utils
import AutoLoginFn from "./components/AutoLoginFn"
import PreLoginFn from "./components/PreLoginFn"
import clog from "./utils/logUtils";
import * as CUTIL from "./utils/commUtils";
import * as CONST from "./utils/Const";
import * as HttpUtil from "./utils/api/HttpUtil";
import * as USERUTILS from "./utils/user/userUtils"
import EhpPdfViewer from "./components/common/pdfviewer/EhpPdfViewer";
//ex-utils
import * as i18n from './utils/langs/i18nUtils';
//
import Logout from "./components/header/Logout";
import Camera from "./components/common/camera/Camera";
import MyAccount from "./components/header/MyAccount";
//component
import EhpLogin from "./components/login/Login";
import MainLayout from "./components/layout/MainLayout";
import CheckHistoryLayout from "./components/layout/CheckHistoryLayout";
import CheckReportLayout from "./components/layout/CheckReportLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ManagementLayout from "./components/layout/ManagementLayout";
import NotFoundLayout from "./components/layout/NotFoundLayout";
import SystemErrorLayout from "./components/layout/SystemErrorLayout";
import IntroLayout from "./components/layout/IntroLayout";
import EhpCertification from "./components/common/certification/EhpCertification";
import ServiceRequestLayout from "./components/layout/ServiceRequestLayout";
import IntroductionLayout from "./components/layout/IntroductionLayout";
import DeviceStatusLayout from "./components/layout/DeviceStatusLayout";

import Scan from "./components/common/camera/Scan";
import DndDashboardLayout from "./components/layout/DndDashboardLayout";
import EquipmentLifeLayout from "./components/layout/EquipmentLifeLayout";




function Ehp() {
  //recoil
  const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState  
  const goUrl = useRecoilValue(urlState);
  const isAuth = useRecoilValue(authState);
  const [settingPopup, setRecoilSettingPopup] = useRecoilState(headerSettingState);
  const [alarmPopup, setRecoilAlarmPopup] = useRecoilState(headerAlarmState);
  const [userInfoPopup, setRecoilUserInfoPopup] = useRecoilState(headerUserInfoState);

  ////////////////////////////////////////////////////
  //const locationHook = useLocation();
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleOnClickGlobal(e) {
      var modalTag = document.querySelector(".dimm") as unknown as HTMLElement;
      var isModal = (!CUTIL.isnull(modalTag))?(modalTag.style.display==="block")?true:false:false;
      if ( isModal ) return;

      var clickTag = e.target;
      //clog("ON CLICK GLOVAL : " + clickTag.tagName);
      
      var headerBtnArea = clickTag.closest(".header__etc");      
      var headerUserTag = clickTag.closest(".header__userinfo");
      var headerAlarmTag = clickTag.closest(".header__alarm");
      var headerSettingTag = clickTag.closest(".header__setting");
      var isHeaderArea = false;
        
      if ( !CUTIL.isnull(headerBtnArea) ) isHeaderArea = true;
      if ( !CUTIL.isnull(headerUserTag) ) isHeaderArea = true;
      if ( !CUTIL.isnull(headerAlarmTag) ) isHeaderArea = true;
      if ( !CUTIL.isnull(headerSettingTag) ) isHeaderArea = true;
      //clog("ON CLICK GLOVAL : isHeaderArea : " + isHeaderArea);
      if ( !isHeaderArea ) {
        setRecoilSettingPopup(false);
        setRecoilUserInfoPopup(false);
        setRecoilAlarmPopup(false); // toggle
      }
    }
    window.addEventListener("click", handleOnClickGlobal);
    return () => {
      window.removeEventListener('click', handleOnClickGlobal);
    }
  }, []);

  //clog("IN EHP : " + userInfo.userId + " : IS AUTH : " + isAuth);
  clog("WINDOW SIZE : " + window.innerHeight + " X " + window.innerWidth);
  const keepLoginYn = localStorage.getItem(CONST.STR_KEEP_LOGIN_YN);


  useEffect(() => {
    if (!isAuth) {
      //clog("IN EHP : NOT AUTH : " + keepLoginYn);
    }


    if (isAuth && (!userInfo.hasOwnProperty(userInfo.userId) || (userInfo.userId.length <= 0))) {
      // 리프레쉬 등 
      const sesToken = sessionStorage.getItem(CONST.STR_TOKEN);
      const sesTokenExpireTime = sessionStorage.getItem(CONST.STR_TOKEN_EXPIRETIME);
      const userId = localStorage.getItem(CONST.STR_USERID);
      const userRole = localStorage.getItem(CONST.STR_USERROLE);
      const refreshToken = localStorage.getItem(CONST.STR_REFRESHTOKEN);
      const refreshTokenExpireTime = localStorage.getItem(CONST.STR_REFRESHTOKEN_EXPIRETIME);

      const loginInfo = {
        "role": userRole,
        "token": sesToken,
        "tokenExpireTime": sesTokenExpireTime,
        "refreshToken": refreshToken,
        "refreshTokenExpireTime": refreshTokenExpireTime
      };
      (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
        const detailUserInfo = await USERUTILS.getDetailUserInfoR(loginInfo);
        setRecoilUserInfo({
          loginTime: detailUserInfo.loginTime,
          userId: detailUserInfo.userId,
          email: detailUserInfo.email,
          userName: detailUserInfo.userName,
          phoneNumber: detailUserInfo.phoneNumber,
          companyName: detailUserInfo.companyName,
          zoneName: detailUserInfo.zoneName,
          department: detailUserInfo.department,
          role: detailUserInfo.role,
          language: detailUserInfo.language,
          classificationCode: detailUserInfo.classificationCode,
          classification: detailUserInfo.classification,
          //socialDtoOut: detailUserInfo.socialDtoOut,
          agreeMailReceipt: detailUserInfo.agreeMailReceipt,
          agreeTos: detailUserInfo.agreeTos,
          agreePersonalInfo: detailUserInfo.agreePersonalInfo,
          agreeData: detailUserInfo.agreeData,
          loginInfo: loginInfo,
        });
        const frontLang = CUTIL.frontLangSet(detailUserInfo.language);
        await i18n.changeLang(frontLang);
        setRecoilLangs(frontLang);
      })();

    } // isAuth 체크
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/*PreLoginFn()*/}
          {
            (isAuth)
              ? (userInfo.userId.length > 0)
                ? <Route path="/" element={<GoPage isAuth={isAuth} userInfo={userInfo} goPage={goUrl} />} />
                : <Route path="/" element={<EhpLogin />} />
              : <Route path="/" element={<EhpLogin />} />
          }
          <Route path={CONST.URL_LOGIN} element={<EhpLogin />} />
          {/***********/}
          <Route path={CONST.URL_DASHBOARD} element={<WrapLayout runComponent={<DndDashboardLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_MAIN_DASHBOARD} element={<WrapLayout runComponent={<MainLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_CHECKHISTORY} element={<WrapLayout runComponent={<CheckHistoryLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_REPORTVIEW} element={<WrapLayout runComponent={<CheckReportLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_DEVICESTATUS} element={<WrapLayout runComponent={<DeviceStatusLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          {/***********/}
          <Route path={CONST.URL_ADMIN} element={<WrapLayout runComponent={<AdminLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_ADMIN_ITEM} element={<WrapLayout runComponent={<AdminLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />} />
          {/****Management*******/}
          <Route path={CONST.URL_APPROVALMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_USERMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_SITEMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout tabId={2} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_MESSAGEMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout tabId={3} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_MENUMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout tabId={4} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_CHECKSHEETMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout tabId={5} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_ECONSULTMANAGEMENT} element={<WrapLayout runComponent={<ManagementLayout tabId={6} />} userInfo={userInfo} isAuth={isAuth} />} />
          {/****Service Request*******/}
          <Route path={CONST.URL_SERVICEINSPECTION} element={<WrapLayout runComponent={<ServiceRequestLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_SERVICEWORKORDER} element={<WrapLayout runComponent={<ServiceRequestLayout tabId={0} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_REQUESTWORKORDER} element={<WrapLayout runComponent={<ServiceRequestLayout tabId={1} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_HISTORYWORKORDER} element={<WrapLayout runComponent={<ServiceRequestLayout tabId={2} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_DEVICECHANGEWORKORDER} element={<WrapLayout runComponent={<ServiceRequestLayout tabId={3} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />} />
          {/****Equipment  Life*******/}
          <Route path={CONST.URL_DEVICESLIFE} element={<WrapLayout runComponent={<EquipmentLifeLayout tabId={0} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_DEVICESLIFEREPORT} element={<WrapLayout runComponent={<EquipmentLifeLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />} />

          {/***********/}
          <Route path={CONST.URL_INTRODUCTIONINQUIRT} element={<WrapLayout runComponent={<IntroductionLayout tabId={2} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_LANDING} element={<WrapLayout runComponent={<IntroLayout tabId={0} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_EHC_INTRO} element={<WrapLayout runComponent={<IntroLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_HELP} element={<WrapLayout runComponent={<IntroLayout tabId={2} />} userInfo={userInfo} isAuth={isAuth} />} />
          {/***********/}
          <Route path={CONST.URL_COMM_PDFVIEWER} element={<EhpPdfViewer />} />
          <Route path={CONST.URL_VERIFYEMAIL} element={<EhpCertification />} />
          <Route path={CONST.URL_SYSTEM_ERROR} element={<WrapLayout runComponent={<SystemErrorLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={CONST.URL_NOT_FOUND} element={<WrapLayout runComponent={<NotFoundLayout />} userInfo={userInfo} isAuth={isAuth} />} />
          <Route path={"*"} element={<WrapLayout runComponent={<NotFoundLayout />} userInfo={userInfo} isAuth={isAuth} />} />

        </Routes>
        {AutoLoginFn()}
      </BrowserRouter>

    </>
  );

}
export default Ehp;


function WrapLayout(props) {
  const isAuth = props.isAuth;
  const userInfo = props.userInfo;
  const runComponent = props.runComponent;
  const [goUrl, setRecoilUrl] = useRecoilState(urlState);
  const setRecoilMenuInfo = useSetRecoilState(menuInfoState);

  //const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);
  const navigate = useNavigate();
  //clog("IN EHP : TOKEN : WrapLayout : " + isAuth + " : " + userInfo.loginInfo.token);

  useEffect(() => {
    if (!isAuth) {
      //setRecoilUrl(window.location.pathname);
      navigate(CONST.URL_EHP);
    }
  }, [])
  useEffect(() => {
    // non-user로 로그인 시  강제 landing page로 이동 hook
    if (userInfo.loginInfo.role == CONST.USERROLE_NONE) {
      setRecoilUrl(CONST.URL_LANDING);
      navigate(CONST.URL_EHP);
    }
  }, [userInfo.loginInfo.role])
  useEffect(() => {
    if (CONST.URL_EHP !== window.location.pathname) {
      clog("IN EHP : LOCATION : SET RECOIL URL : " + window.location.pathname);
      /*
      const savedMenuList = JSON.parse(sessionStorage.getItem(CONST.STR_EHP_MENULIST)); // 특정 화면에서 url로 menu 정보 추출하기 위함
      savedMenuList.filter((smenu)=>smenu.url===window.location.pathname).map((smenu, idx)=>{
        if (idx===0) setRecoilMenuInfo(smenu);
      });
      */
      setRecoilUrl(window.location.pathname);
    }
  }, [])

  if (goUrl.length <= 0) {
    //return (<>URL을 알수 없습니다.</>);
  }

  return (
    <>
      {runComponent}
      <Logout />
      <MyAccount userInfo={userInfo} />
      <Loading isAuth={isAuth} />
      <Dimm />
    </>
  )
}


function GoPage(props) {
  const url = props.goPage;
  const userInfo = props.userInfo;
  const isAuth = props.isAuth;

  if (url.length <= 0) {
    //return (<>URL을 알수 없습니다.</>);
  }

  if (!isAuth) return <EhpLogin />

  //clog("IN EHP : GO PAGE : " + url + " : " + JSON.stringify(userInfo));

  switch (url) {
    case CONST.URL_VERIFYEMAIL: {
      return (<WrapLayout runComponent={<EhpCertification />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_DASHBOARD: {
      return (<WrapLayout runComponent={<DndDashboardLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_MAIN_DASHBOARD: {
      return (<WrapLayout runComponent={<MainLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_CHECKHISTORY: {
      return (<WrapLayout runComponent={<CheckHistoryLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_REPORTVIEW: {
      return (<WrapLayout runComponent={<CheckReportLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_DEVICESTATUS: {
      return (<WrapLayout runComponent={<DeviceStatusLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_LANDING: {
      return (<WrapLayout runComponent={<IntroLayout tabId={0} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_EHC_INTRO: {
      return (<WrapLayout runComponent={<IntroLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_HELP: {
      return (<WrapLayout runComponent={<IntroLayout tabId={2} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_ADMIN: {
      return (<WrapLayout runComponent={<AdminLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_ADMIN_ITEM: {
      return (<WrapLayout runComponent={<AdminLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_APPROVALMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={0} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_USERMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_SITEMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={2} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_MESSAGEMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={3} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_MENUMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={4} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_CHECKSHEETMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={5} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_ECONSULTMANAGEMENT: {
      return (<WrapLayout runComponent={<ManagementLayout tabId={6} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_SERVICEINSPECTION: {
      return (<WrapLayout runComponent={<ServiceRequestLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_SERVICEWORKORDER: {
      return (<WrapLayout runComponent={<ServiceRequestLayout tabId={0} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_REQUESTWORKORDER: {
      return (<WrapLayout runComponent={<ServiceRequestLayout tabId={1} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_HISTORYWORKORDER: {
      return (<WrapLayout runComponent={<ServiceRequestLayout tabId={2} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_DEVICECHANGEWORKORDER: {
      return (<WrapLayout runComponent={<ServiceRequestLayout tabId={3} tabType={"subMain"} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_INTRODUCTIONINQUIRT: {
      return (<WrapLayout runComponent={<IntroductionLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_DEVICESLIFE: {
      return (<WrapLayout runComponent={<EquipmentLifeLayout tabId={0} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_DEVICESLIFEREPORT: {
      return (<WrapLayout runComponent={<EquipmentLifeLayout tabId={1} />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_NOT_FOUND: {
      return (<WrapLayout runComponent={<NotFoundLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    case CONST.URL_SYSTEM_ERROR: {
      return (<WrapLayout runComponent={<SystemErrorLayout />} userInfo={userInfo} isAuth={isAuth} />)
    }
    default: {
      //return (<NotFound/>)
      return (<EhpLogin />)
    }
  }
}

function Dimm(props) {

  return (
    <div className="dimm"></div>
  )
}

function Loading(props) {
  const isAuth = props.isAuth;
  return (
    <div className={(isAuth) ? "" : "loading"}>
      <span className="hide">로딩중</span>
    </div>
  )
}
