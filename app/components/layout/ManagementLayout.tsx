/**
 * @url /approvalmanagement, /usermanagement, /sitemanagement, /messagemanagement, /menumanagement, /checksheetmanagement, /econsultmanagement
 * @CONST CONST.URL_APPROVALMANAGEMENT, CONST.URL_USERMANAGEMENT, CONST.URL_SITEMANAGEMENT, CONST.URL_MESSAGEMANAGEMENT, CONST.URL_MENUMANAGEMENT,CONST.URL_CHECKSHEETMANAGEMENT, CONST.URL_ECONSULTMANAGEMENT
 * @menu Managemnet
 * @mapping 승인 관리 화면, 사용자 관리 화면, 사업장 관리 화면, 메시지 관리 화면, 메뉴 관리 화면, Check Sheet 관리 화면, 이메일 상담 관리 화면
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
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
import ManagementMain from "../management/ManagementMain";
import EhpImageCrop from "../common/imagecrop/EhpImageCrop";
import EhpPostCode from "../common/postcode/EhpPostCode";

function ManagementLayout(props) {
  //trans, navigate, ref 
  const navigate = useNavigate();

  //recoil
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuInfo, setRecoilMenuInfo] = useRecoilState(menuInfoState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);

  //props
  const tabId = props.hasOwnProperty("tabId") ? props.tabId : 0;
  //tab init
  //clog("IN LAYOUT : MANAGEMENT : INIT : " + urlInfo);
  const tabMenuList1 = [/*
    { tabId: 0, tabName: "승인 관리", tabUrl:CONST.URL_APPROVALMANAGEMENT, tabType: "TAB_APPROVAL" },
    { tabId: 1, tabName: "사용자 관리", tabUrl:CONST.URL_USERMANAGEMENT, tabType: "TAB_USER" },
    { tabId: 2, tabName: "사업장 관리", tabUrl:CONST.URL_SITEMANAGEMENT, tabType: "TAB_SITE" },
    { tabId: 3, tabName: "메세지 관리", tabUrl:CONST.URL_MESSAGEMANAGEMENT, tabType: "TAB_MESSAGE" },
    { tabId: 4, tabName: "메뉴 관리", tabUrl:CONST.URL_MENUMANAGEMENT, tabType: "TAB_MENU" },
    { tabId: 5, tabName: "Check Sheet 관리", tabUrl:CONST.URL_CHECKSHEETMANAGEMENT, tabType: "TAB_CHECK" },
  */];
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
      //if (idx===tabId) setCurTabMenu({"tabId":idx, "tabName":smenu.menuName, "tabUrl":smenu.url});
      tempTab.push({ "tabId": idx, "tabName": smenu.menuName, "tabUrl": smenu.url });
    });
    setTabMenuList(tempTab);
    //clog("IN LAYOUT : MANAGEMENT : TMENU LIST : " + JSON.stringify(tempTab));
    setCurTabMenu(tempTab[tabId]);
  }, [urlInfo, tabId, menuRecoilList])

  //승인관리 - 신규가입자 팝업
  const [popUserApprrval, setPopUserApprrval] = useState(<UserApprrvalPop popBody={null} />);
  const [popSiteCeatePop, setPopSiteCeatePop] = useState(<SiteCeatePop popBody={null} />);
  // 사업장 승인 요청
  const [popSiteApprovalPop, setPopSiteApprovalPop] = useState(<SiteApprovalPop popBody={null} />);
  // 진단점검 승인 요청
  const [popCheckApprovalPop, setPopCheckApprovalPop] = useState(<CheckApprovalPop popBody={null} />);
  // 사업장 관리 ZoneView Popup 조회
  const [popZoneView, setPopZoneView] = useState(<ZoneViewPopup popBody={null} />);
  const [popZoneUpdate, setPopZoneUpdate] = useState(<ZoneUpdatePopup popBody={null} />);
  // 메세지 관리
  const [popMessageInsert, setPopMessageInsert] = useState(<MessageInsertPopup popBody={null} />);
  const [popMessageView, setPopMessageView] = useState(<MessageViewPopup popBody={null} />);
  const [popMessageUpdate, setPopMessageUpdate] = useState(<MessageUpdatePopup popBody={null} />);
  const [popMessageDelete, setPopMessageDelete] = useState(<MessageDeletePopup popBody={null} />);
  // SpgCheckSheet 버전 관리
  const [popSpgVersionChange, setPopSpgVersionChange] = useState(<SpgVersionChangePopup popBody={null} />);
  const [popSpgCheckView, setPopSpgCheckView] = useState(<SpgCheckViewPopup popBody={null} />);
  const [popSpgCheckUpdate, setPopSpgCheckUpdate] = useState(<SpgCheckUpdatePopup popBody={null} />);
  const [popSpgCheckInsert, setPopSpgCheckInsert] = useState(<SpgCheckInsertPopup popBody={null} />);
  // Email Consult 답변 관리
  const [popEmailConsultAnswerOk, setPopEmailConsultAnswerOk] = useState(<EamilConsultAnswerOkPopup popBody={null} />);
  const [popEmailConsultAnswer, setPopEmailConsultAnswer] = useState(<EamilConsultAnswerPopup popBody={null} />);


  //사용자 관리
  const [popUserEnabled, setPopUserEnabled] = useState(<UserEnabledPop popBody={null} />);
  const [popUserPassword, setPopUserPassword] = useState(<UserPasswordPop popBody={null} />);
  const [popUserDelete, setPopUserDelete] = useState(<UserDeletePop popBody={null} />);
  const [popUserRole, setPopUserRole] = useState(<UserRolePop popBody={null} />);

  // 공통 - crop
  const [popImgCrop, setPopImgCrop] = useState(<EhpImageCrop popBody={null} />);
  // 공통 - postcode
  const [popPostCode, setPopPostCode] = useState(<EhpPostCode popBody={null} />);

  useEffect(() => {
    //setCurTabMenu(tabMenuList[tabId]);
  }, [tabId]);

  useEffect(() => {
    // 승인 관리
    setPopUserApprrval(popUserApprrval);
    setPopSiteCeatePop(popSiteCeatePop);
    setPopSiteApprovalPop(popSiteApprovalPop);
    setPopCheckApprovalPop(popCheckApprovalPop);
    // 사업장 관리
    setPopZoneView(popZoneView);
    setPopZoneUpdate(popZoneUpdate);
    // 메시지 관리
    setPopMessageInsert(popMessageInsert);
    setPopMessageView(popMessageView);
    setPopMessageUpdate(popMessageUpdate);
    setPopMessageDelete(popMessageDelete);
    // SpgCheckSheet 버전 관리
    setPopSpgVersionChange(popSpgVersionChange);
    setPopSpgCheckView(popSpgCheckView);
    setPopSpgCheckUpdate(popSpgCheckUpdate);
    setPopSpgCheckInsert(popSpgCheckInsert);
    // Email Consult 답변 관리
    setPopEmailConsultAnswerOk(popEmailConsultAnswerOk);
    setPopEmailConsultAnswer(popEmailConsultAnswer);
    // 사용자 관리
    setPopUserEnabled(popUserEnabled);
    setPopUserPassword(popUserPassword);
    setPopUserDelete(popUserDelete)
    setPopUserRole(popUserRole)
    // 공통
    setPopImgCrop(popImgCrop);
    setPopPostCode(popPostCode);


  }, [popUserApprrval, popSiteCeatePop,
    popSiteApprovalPop, popSiteApprovalPop, popCheckApprovalPop,
    popZoneView, popZoneUpdate, // 사업장 관리
    popMessageInsert, popMessageView, popMessageUpdate, popMessageDelete, // 메시지 관리
    popSpgVersionChange, popSpgCheckView, popSpgCheckUpdate, popSpgCheckInsert,// SpgCheckSheet 버전 관리
    popEmailConsultAnswerOk, popEmailConsultAnswer, // Email Consult 답변 관리

    popUserEnabled, popUserPassword, popUserDelete, popUserRole, // 사용자 관리
    popImgCrop, popPostCode, // 공통
  ])
  function handlePopWin(popType, popObj) {
    if (popType === "pop-userjoin-ok") {
      setPopUserApprrval(<UserApprrvalPop popBody={popObj} />);
    } else if (popType === "pop-userjoin-info") {
      setPopSiteCeatePop(<SiteCeatePop popBody={popObj} />);
    } else if (popType === "pop-workplace-ok") {
      setPopSiteApprovalPop(<SiteApprovalPop popBody={popObj} />);
    } else if (popType === "pop-casecheck-ok") {
      setPopCheckApprovalPop(<CheckApprovalPop popBody={popObj} />);
    } else if (popType === "pop-listbox-detail") {
      setPopZoneView(<ZoneViewPopup popBody={popObj} />);
    } else if (popType === "pop-listbox-detail-edit") {
      setPopZoneUpdate(<ZoneUpdatePopup popBody={popObj} />);
    } else if (popType === "pop-message-add") {
      setPopMessageInsert(<MessageInsertPopup popBody={popObj} />);
    } else if (popType === "pop-message") {
      setPopMessageView(<MessageViewPopup popBody={popObj} />);
    } else if (popType === "pop-message-edit") {
      setPopMessageUpdate(<MessageUpdatePopup popBody={popObj} />);
    } else if (popType === "pop-delete") {
      setPopMessageDelete(<MessageDeletePopup popBody={popObj} />);
    } else if (popType === "pop-version-ok") {
      setPopSpgVersionChange(<SpgVersionChangePopup popBody={popObj} />);
    } else if (popType === "pop-spgcheck-detail") {
      setPopSpgCheckView(<SpgCheckViewPopup popBody={popObj} />);
    } else if (popType === "pop-spgcheck-edit") {
      setPopSpgCheckUpdate(<SpgCheckUpdatePopup popBody={popObj} />);
    } else if (popType === "pop-spgcheck-add") {
      setPopSpgCheckInsert(<SpgCheckInsertPopup popBody={popObj} />);
    } else if (popType === "pop-answer-ok") {
      setPopEmailConsultAnswerOk(<EamilConsultAnswerOkPopup popBody={popObj} />);
    } else if (popType === "pop-answer") {
      setPopEmailConsultAnswer(<EamilConsultAnswerPopup popBody={popObj} />);
    } else if (popType === "pop-imgcrop") {//////////////////////////////////////////////////
      setPopImgCrop(<EhpImageCrop popBody={popObj} />);
    } else if (popType === "pop-postcode") {
      setPopPostCode(<EhpPostCode popBody={popObj} />);
    } else if (popType === "pop-enabled") {
      setPopUserEnabled(<UserEnabledPop popBody={popObj} />);
    } else if (popType === "pop-password") {
      setPopUserPassword(<UserPasswordPop popBody={popObj} />);
    } else if (popType === "pop-delete") {
      setPopUserDelete(<UserDeletePop popBody={popObj} />);
    } else if (popType === "pop-role") {
      setPopUserRole(<UserRolePop popBody={popObj} />);
    }
    //

  }

  function handleCurTabMenu(tab) {
    // 승인 관리
    setPopUserApprrval(<UserApprrvalPop popBody={null} />);
    setPopSiteCeatePop(<SiteCeatePop popBody={null} />);
    setPopSiteApprovalPop(<SiteApprovalPop popBody={null} />);
    setPopCheckApprovalPop(<CheckApprovalPop popBody={null} />);
    // 사업장 관리
    setPopZoneView(<ZoneViewPopup popBody={null} />);
    setPopZoneUpdate(<ZoneUpdatePopup popBody={null} />);
    // 메시지 관리
    setPopMessageInsert(<MessageInsertPopup popBody={null} />);
    setPopMessageView(<MessageViewPopup popBody={null} />);
    setPopMessageUpdate(<MessageUpdatePopup popBody={null} />);
    setPopMessageDelete(<MessageDeletePopup popBody={null} />);
    // SpgCheckSheet 버전 관리
    setPopSpgVersionChange(<SpgVersionChangePopup popBody={null} />);
    setPopSpgCheckView(<SpgCheckViewPopup popBody={null} />);
    setPopSpgCheckUpdate(<SpgCheckUpdatePopup popBody={null} />);
    setPopSpgCheckInsert(<SpgCheckInsertPopup popBody={null} />);
    // Email Consult 답변 관리
    setPopEmailConsultAnswerOk(<EamilConsultAnswerOkPopup popBody={null} />);
    setPopEmailConsultAnswer(<EamilConsultAnswerPopup popBody={null} />);
    // 사용자 관리
    setPopUserEnabled(<UserEnabledPop popBody={null} />);
    setPopUserPassword(<UserPasswordPop popBody={null} />);
    setPopUserDelete(<UserDeletePop popBody={null} />);
    setPopUserRole(<UserRolePop popBody={null} />);
    // 공통
    setPopImgCrop(<EhpImageCrop popBody={null} />);
    setPopPostCode(<EhpPostCode popBody={null} />);
    //
    setCurTabMenu(tab);
    //
    navigate(tab.tabUrl);
    setRecoilUrlInfo(tab.tabUrl);
  }

  return (
    <>
      <div id="wrap">
        {/*<!-- #wrap -->*/}
        {<Header />}
        {(tabMenuList) && (curTabMenu) && <ManagementMain
          setPopWin={handlePopWin}
          tabMenuList={tabMenuList}
          curTabMenu={curTabMenu}
          setCurTabMenu={handleCurTabMenu}
        />}
      </div>
      {/** 승인 관리 */}
      {popUserApprrval}
      {popSiteCeatePop}
      {popSiteApprovalPop}
      {popCheckApprovalPop}
      {/** 사업장 관리 */}
      {popZoneView}
      {popZoneUpdate}
      {/** 메시지 관리 */}
      {popMessageInsert}
      {popMessageView}
      {popMessageUpdate}
      {popMessageDelete}
      {/* SpgCheckSheet 버전 관리*/}
      {popSpgVersionChange}
      {popSpgCheckView}
      {popSpgCheckUpdate}
      {popSpgCheckInsert}
      {/* Email Consult 답변 관리*/}
      {popEmailConsultAnswerOk}
      {popEmailConsultAnswer}
      {/** 사용자 관리 */}
      {popUserEnabled}
      {popUserPassword}
      {popUserDelete}
      {popUserRole}
      {/** 공통 */}
      {popImgCrop}
      {popPostCode}
    </>
  )
}
export default ManagementLayout;

// 승인관리 신규기입자
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

// userApproval-site
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

// 사업장 승인 요청
function SiteApprovalPop(props) {
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
      <div id="pop-workplace-ok" className="popup-layer js-layer layer-out hidden page-detail workplace-ok">
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
// 진단점검요청 승인 
function CheckApprovalPop(props) {
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
      <div id="pop-casecheck-ok" className="popup-layer js-layer layer-out hidden page-detail userjoin-ok casecheck-ok">
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

// Zone 팝업 조회 화면 
function ZoneViewPopup(props) {
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
      <div id="pop-listbox-detail" className="popup-layer js-layer layer-out hidden page-detail workplace-ok">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close">
            <span className="hide">닫기</span>
          </button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

// Zone 팝업 수정 화면 
function ZoneUpdatePopup(props) {
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
      <div id="pop-listbox-detail-edit" className="popup-layer js-layer layer-out hidden page-detail workplace-ok">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close">
            <span className="hide">닫기</span>
          </button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

// check message 등록 팝업
function MessageInsertPopup(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;

  const setListReload = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("setListReload")
        ? popBody.props.setListReload
        : null
      : null
    : null;

  return (
    <>
      {/*<!-- 에러 메세지 추가 팝업 / 추가 수정팝업의 차이  layer-out 클래스 유무  -->*/}
      <div id="pop-message-add" className="popup-layer js-layer layer-out hidden page-detail checker-message">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"
            onClick={(e) => (setListReload) && setListReload(true)}
          >
            <span className="hide">닫기</span>
          </button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

// check message 조회 팝업
function MessageViewPopup(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  const setListReload = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("setListReload")
        ? null//popBody.props.setListReload
        : null
      : null
    : null;

  return (
    <>
      {/*<!-- 에러 메세지 추가 팝업 / 추가 수정팝업의 차이  layer-out 클래스 유무  -->*/}
      <div id="pop-message" className="popup-layer js-layer layer-out hidden page-detail checker-message">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"
            onClick={(e) => (setListReload) && setListReload(true)}
          >
            <span className="hide">닫기</span>
          </button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}


// check message 수정 팝업
function MessageUpdatePopup(props) {
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
      {/*<!-- 에러 메세지 추가 팝업 / 추가 수정팝업의 차이  layer-out 클래스 유무  -->*/}
      <div id="pop-message-edit" className="popup-layer js-layer hidden page-detail checker-message">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close">
            <span className="hide">닫기</span>
          </button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

// check message 삭제 팝업
function MessageDeletePopup(props) {
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
      {/*<!-- 에러 메세지 추가 팝업 / 추가 수정팝업의 차이  layer-out 클래스 유무  -->*/}
      <div id="pop-delete" className="popup-layer js-layer layer-out hidden popup-basic">
        <div className="page-detail">
          <div className="popup__head">
            {(htmlHeader) && htmlHeader}
            <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
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


// spg version 변경 팝업
function SpgVersionChangePopup(props) {
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
      {/*<!--버전 변경 팝업 -->*/}
      <div id="pop-version-ok" className="popup-layer js-layer layer-out hidden popup-basic">
        <div className="page-detail">
          <div className="popup__head">
            {(htmlHeader) && htmlHeader}
            <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
          </div>
          {(CUTIL.isnull(popBody))
            ? <></>
            : popBody
          }
        </div>
      </div>
      {/*<!-- // 버전 변경 팝업 -->*/}
    </>
  )
}

// spg check 항목 조회 팝업
function SpgCheckViewPopup(props) {
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
      {/*<!-- 다국어 관리 팝업 --> */}
      <div id="pop-spgcheck-detail" className="popup-layer js-layer layer-out hidden page-detail checker-sheet">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
      {/*<!-- 다국어 관리 팝업 -->*/}
    </>
  )
}

// spg check 항목 수정 팝업
function SpgCheckUpdatePopup(props) {
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
      {/*<!-- 다국어 관리 팝업 --> */}
      <div id="pop-spgcheck-edit" className="popup-layer js-layer layer-out hidden page-detail checker-sheet">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
      {/*<!-- 다국어 관리 팝업 -->*/}
    </>
  )
}

// spg check 항목 등록 팝업
function SpgCheckInsertPopup(props) {
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
      {/*<!-- 다국어 관리 팝업 --> */}
      <div id="pop-spgcheck-add" className="popup-layer js-layer layer-out hidden page-detail checker-sheet">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
      {/*<!-- 다국어 관리 팝업 -->*/}
    </>
  )
}

// Email Consult Answer OK 조회 팝업
function EamilConsultAnswerOkPopup(props) {
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
      {/*<!--  답변완료 팝업 --> */}
      <div id="pop-answer-ok" className="popup-layer js-layer layer-out hidden page-detail checker-message">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
      {/*<!--  답변완료 팝업 --> */}
    </>
  )
}
// Email Consult Answer 등록 팝업
function EamilConsultAnswerPopup(props) {
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
      {/*<!--  답변하기 팝업 --> */}
      <div id="pop-answer" className="popup-layer js-layer layer-out hidden page-detail checker-message">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
      {/*<!--  답변하기 팝업 --> */}
    </>
  )
}


//사용자 관리 - 활성화 팝업
function UserEnabledPop(props) {
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
      <div id="pop-enabled" className="popup-layer js-layer hidden layer-out popup-basic">
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

// 사용자 관리  - password초기화 팝업
function UserPasswordPop(props) {
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
      <div id="pop-password" className="popup-layer js-layer hidden layer-out popup-basic">
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
// 사용자 관리  - 리스트삭제 팝업
function UserDeletePop(props) {
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
      <div id="pop-delete" className="popup-layer js-layer hidden layer-out popup-basic">
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
// 사용자 관리  - userType 팝업
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
      <div id="pop-role" className="popup-layer js-layer hidden layer-out popup-basic">
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


function handelClose(e) {
  window.location.reload();
}