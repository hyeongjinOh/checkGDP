/**
 * @url /introductioninquiry
 * @CONST CONST.URL_INTRODUCTIONINQUIRT
 * @menu 서비스 요청
 * @mapping 이메일 상담 화면
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilState, useSetRecoilState, useResetRecoilState, useRecoilValue } from "recoil";
import { langState } from '../../recoil/langState';
import { urlState, menuState, menuInfoState, menuListState, loadingBoxState } from '../../recoil/menuState';
import { userInfoLoginState } from "../../recoil/userState";

//css
import "/static/css/swiper.css"

//utils
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const";
import * as CUTIL from "../../utils/commUtils";
import * as HTTPUTIL from "../../utils/api/HttpUtil"


//component
import Header from "../header/Header";

import EhpImageCrop from "../common/imagecrop/EhpImageCrop";

import EhpDtlPostCode from "../common/postcode/EhpDtlPostCode";
import IntroductionMain from "../Introduction/IntroductionMain";

function IntroductionLayout(props) {
  //recoil
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuInfo, setRecoilMenuInfo] = useRecoilState(menuInfoState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);

  //props
  const tabId = props.hasOwnProperty("tabId") ? props.tabId : 0;
  //tab init
  clog("IN LAYOUT : INTOODUCTION : INIT : " + urlInfo);

  const [tabMenuList, setTabMenuList] = useState(null);
  const [curTabMenu, setCurTabMenu] = useState(null);
  // 특정 화면에서 url로 menu 정보 추출하기 위함
  useEffect(() => {
    let tmenuList = menuRecoilList;
    if (tmenuList.length <= 0) {
      //tmenuList = JSON.parse(sessionStorage.getItem(CONST.STR_EHP_MENULIST)); 
    }
    //clog("IN LAYOUT : MANAGEMENT : TMENU LIST : " + JSON.stringify(tmenuList));
    let curMenu: any = null;
    tmenuList.filter((smenu) => smenu.url === urlInfo).map((smenu, idx) => {
      if (idx === 0) curMenu = smenu;
    });
    //clog("IN LAYOUT : MANAGEMENT : CUR MENU : " + JSON.stringify(curMenu));

    const tempTab = [];
    tmenuList.filter((smenu) => (curMenu) && (smenu.parentCode === curMenu.parentCode)).map((smenu, idx) => {
      /*
      if (idx===tabId) {
        setCurTabMenu({
          "tabId":idx, 
          "tabName":smenu.menuName, 
          "tabUrl":smenu.url,
          "tabType":(smenu.url===CONST.URL_ADMIN)?"TAB_ZONE":(smenu.url===CONST.URL_ADMIN_ITEM)?"TAB_DEVICE":""
        });
      }*/
      tempTab.push({
        "tabId": idx,
        "tabName": smenu.menuName,
        "tabUrl": smenu.url,
        "tabType": (smenu.url === CONST.URL_DEVICESLIFE) ? "TAB_ZONE" : (smenu.url === CONST.URL_DEVICESLIFEREPORT) ? "TAB_DEVICESLIFEREPORT" : ""
      });
    });
    setTabMenuList(tempTab);
    //clog("IN LAYOUT : MANAGEMENT : TMENU LIST : " + JSON.stringify(tempTab));
    setCurTabMenu(tempTab[tabId]);
  }, [urlInfo, tabId, menuRecoilList])
  //
  const [popUserApprrval, setPopUserApprrval] = useState(<UserApprrvalPop popBody={null} />);
  const [popSiteCeatePop, setPopSiteCeatePop] = useState(<SiteCeatePop popBody={null} />);

  const [popSmall, setPopSmall] = useState(<SmallPop popBody={null} />);
  const [popUserRole, setPopUserRole] = useState(<UserRolePop popBody={null} />);

  // 공통 - crop
  const [popImgCrop, setPopImgCrop] = useState(<EhpImageCrop popBody={null} />);
  // 공통 - postcode
  const [popPostCode, setPopPostCode] = useState(<EhpDtlPostCode popBody={null} />);

  useEffect(() => {
    //setCurTabMenu(tabMenuList[tabId]);
  }, [tabId]);

  useEffect(() => {

    setPopUserApprrval(popUserApprrval);
    setPopSiteCeatePop(popSiteCeatePop);
    setPopSmall(popSmall)
    setPopUserRole(popUserRole)
    // 공통
    setPopImgCrop(popImgCrop);
    setPopPostCode(popPostCode);


  }, [popUserApprrval, popSiteCeatePop,
    popSmall, popUserRole,
    popImgCrop, popPostCode, // 공통
  ])
  function handlePopWin(popType, popObj) {
    if (popType === "pop-userjoin-ok") {
      setPopUserApprrval(<UserApprrvalPop popBody={popObj} />);
    }
    else if (popType === "pop-userjoin-info") {
      setPopSiteCeatePop(<SiteCeatePop popBody={popObj} />);
    }
    else if (popType === "pop-small") {
      setPopSmall(<SmallPop popBody={popObj} />);
    }
    else if (popType === "pop-imgcrop") {//////////////////////////////////////////////////
      setPopImgCrop(<EhpImageCrop popBody={popObj} />);
    }
    else if (popType === "pop-dtlpostcode") {
      setPopPostCode(<EhpDtlPostCode popBody={popObj} />);
    }
    else if (popType === "pop-role") {
      setPopUserRole(<UserRolePop popBody={popObj} />);
    }
    //

  }

  function handleCurTabMenu(tab) {
    // 승인 관리
    setPopUserApprrval(<UserApprrvalPop popBody={null} />);
    setPopSiteCeatePop(<SiteCeatePop popBody={null} />);
    setPopSiteCeatePop(<SiteCeatePop popBody={null} />);
    setPopUserRole(<UserRolePop popBody={null} />);
    // 공통
    setPopImgCrop(<EhpImageCrop popBody={null} />);
    setPopPostCode(<EhpDtlPostCode popBody={null} />);
    //
    setCurTabMenu(tab);
  }

  return (
    <>
      <div id="wrap" className="email">
        {/*<!-- #wrap -->*/}
        {<Header />}
        {(tabMenuList) && (curTabMenu) &&
          <IntroductionMain
            setPopWin={handlePopWin}
            tabMenuList={tabMenuList}
            curTabMenu={curTabMenu}
            setCurTabMenu={handleCurTabMenu}
          />
        }
      </div>
      {/** 서비스 요청 */}
      {popUserApprrval}
      {popSiteCeatePop}
      {popSmall}
      {popUserRole}
      {/** 공통 */}
      {popImgCrop}
      {popPostCode}
    </>
  )
}
export default IntroductionLayout;

// 닫기버튼 추가 팝업
function UserApprrvalPop(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  const htmlHeaderBtn = (!CUTIL.isnull(popBody))
    ? popBody.props.hasOwnProperty("htmlHeaderBtn")
      ? popBody.props.htmlHeaderBtn
      : null
    : null;
  return (
    <>
      <div id="pop-userjoin-ok" className="popup-layer js-layer layer-out hidden page-detail userjoin-ok">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          {(htmlHeaderBtn) && htmlHeaderBtn}
          {/* <button className="btn btn-close js-close" onClick={handelClose}><span className="hide">닫기</span></button> */}
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

// 기본 팝업
function SiteCeatePop(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  return (
    <>
      <div id="pop-userjoin-info" className="popup-layer js-layer hidden page-detail userjoin-ok">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close" ><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}
// 작은 팝업
function SmallPop(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  const htmlHeaderBtn = (!CUTIL.isnull(popBody))
    ? popBody.props.hasOwnProperty("htmlHeaderBtn")
      ? popBody.props.htmlHeaderBtn
      : null
    : null;

  return (
    <>

      <div id="pop-small" className="popup-layer js-layer hidden layer-out popup-basic">
        <div className="page-detail">
          <div className="popup__head">
            {(htmlHeader) && htmlHeader}
            {(htmlHeaderBtn) && htmlHeaderBtn}
            {/*   <h1>사용자 설정</h1>
          <button className="btn btn-close"><span className="hide">닫기</span></button> */}
          </div>
          {(CUTIL.isnull(popBody))
            ? <></>
            : popBody
          }
        </div>
      </div>
    </>
  )
}

// 아주 작은 팝업
function UserRolePop(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  const htmlHeaderBtn = (!CUTIL.isnull(popBody))
    ? popBody.props.hasOwnProperty("htmlHeaderBtn")
      ? popBody.props.htmlHeaderBtn
      : null
    : null;
  return (
    <>
      <div id="pop-role" className="popup-layer popup-basic hidden page-detail w400">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          {(htmlHeaderBtn) && htmlHeaderBtn}
          {/*   <h1>사용자 설정</h1>
          <button className="btn btn-close"><span className="hide">닫기</span></button> */}
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}


function handelClose(e) {
  window.location.reload();
}