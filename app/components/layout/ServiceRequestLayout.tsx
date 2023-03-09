/**
 * @url /serviceinspection
 * @CONST CONST.URL_SERVICEINSPECTION
 * @menu 서비스 요청
 * @mapping (구) 점검 출동 요청 -> LS ELECTRIC 온라인 서비스 신청 링크로 교체 되어 사용 x
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
//import ManagementMain from "../management/ManagementMain";
import EhpImageCrop from "../common/imagecrop/EhpImageCrop";
//import EhpPostCode from "../common/postcode/EhpPostCode";
import ServiceRequestMain from "../serviceRequest/ServiceReqeustMain";
import ServiceRequestSubMain from "../serviceRequest/ServiceReqeustSubMain"
import EhpDtlPostCode from "../common/postcode/EhpDtlPostCode";
//import EhpChatbot from "../common/link/EhpChatbot";

function ServiceRequestLayout(props) {
  //recoil
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuInfo, setRecoilMenuInfo] = useRecoilState(menuInfoState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);

  //props
  const tabId = props.hasOwnProperty("tabId") ? props.tabId : 0;
  const tabType = props.hasOwnProperty("tabType") ? props.tabType : "main"; //main, subMain
  //tab init
  clog("IN LAYOUT : SERVICE REQ : INIT : " + urlInfo);

  const [tabMenuList, setTabMenuList] = useState(null);
  const [curTabMenu, setCurTabMenu] = useState(null);

  // 특정 화면에서 url로 menu 정보 추출하기 위함
  useEffect(() => {
    let tmenuList = menuRecoilList;
    if (tmenuList.length <= 0) {
      //tmenuList = JSON.parse(sessionStorage.getItem(CONST.STR_EHP_MENULIST)); 
    }
    //clog("IN LAYOUT : SREQUEST : URLINFO : " + urlInfo);
    let curMenu: any = null;
    let parentUrl = urlInfo;
    if (tabType === "subMain") parentUrl = CONST.URL_SERVICEWORKORDER;
    tmenuList.filter((smenu) => smenu.url === parentUrl).map((smenu, idx) => {
      if (idx === 0) curMenu = smenu;
    });
    //clog("IN LAYOUT : SREQUEST : CUR MENU : " + JSON.stringify(curMenu));

    const tempTab = [];
    if (tabType === "subMain") {
      tmenuList.filter((smenu) => (curMenu) && (smenu.parentCode === curMenu.menuCode)).map((smenu, idx) => {
        tempTab.push({ "tabId": idx, "tabName": smenu.menuName, "tabUrl": smenu.url });
      });
    } else { // tabType === main
      tmenuList.filter((smenu) => (curMenu) && (smenu.parentCode === curMenu.parentCode)).map((smenu, idx) => {
        tempTab.push({ "tabId": idx, "tabName": smenu.menuName, "tabUrl": smenu.url });
      });
    }
    setTabMenuList(tempTab);
    setCurTabMenu(tempTab[tabId]);
    //clog("IN LAYOUT : SREQUEST : TMENU LIST : " + JSON.stringify(tempTab));
  }, [urlInfo, tabId, menuRecoilList])
  //let menuItem = menuRecoilList.filter((menu) => ((menu.parentCode == "MENU7")))
  //
  const [popUserApprrval, setPopUserApprrval] = useState(<UserApprrvalPop popBody={null} />);
  const [popSiteCeatePop, setPopSiteCeatePop] = useState(<SiteCeatePop popBody={null} />);

  const [popSmall, setPopSmall] = useState(<SmallPop popBody={null} />);
  const [popUserRole, setPopUserRole] = useState(<UserRolePop popBody={null} />);
  const [popSearch, setPopSearch] = useState(<SearchPopup popBody={null} />);
  const [popListView, setPopListView] = useState(<ListViewPopup popBody={null} />);
  //ehc-workorder
  const [popEhcDetailView, setPopEhcDetailView] = useState(<EhcDetailViewPopup popBody={null} />);

  

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
    setPopSearch(popSearch)
    setPopListView(popListView);
    //ehc-workorder
    setPopEhcDetailView(popEhcDetailView);
    // 공통
    setPopImgCrop(popImgCrop);
    setPopPostCode(popPostCode);


  }, [popUserApprrval, popSiteCeatePop,
    popSmall, popUserRole, popSearch, popListView,
    popEhcDetailView, //ehc-workorder
    popImgCrop, popPostCode, // 공통
  ])
  function handlePopWin(popType, popObj) {
    if (popType === "pop-userjoin-ok") {
      setPopUserApprrval(<UserApprrvalPop popBody={popObj} />);
    } else if (popType === "pop-userjoin-info") {
      setPopSiteCeatePop(<SiteCeatePop popBody={popObj} />);
    } else if (popType === "pop-small") {
      setPopSmall(<SmallPop popBody={popObj} />);
    } else if (popType === "pop-role") {
      setPopUserRole(<UserRolePop popBody={popObj} />);
    } else if (popType === "pop-search-small") {
      setPopSearch(<SearchPopup popBody={popObj} />);
    } else if (popType === "pop-list-view") {
      setPopListView(<ListViewPopup popBody={popObj} />);
    } else if (popType === "pop-list-ehcdetailview") { // ehc-workorder
      setPopEhcDetailView(<EhcDetailViewPopup popBody={popObj} />);
    } else if (popType === "pop-imgcrop") {//////////////////////////////////////////////////
      setPopImgCrop(<EhpImageCrop popBody={popObj} />);
    } else if (popType === "pop-dtlpostcode") {
      setPopPostCode(<EhpDtlPostCode popBody={popObj} />);
    }

    //

  }

  function handleCurTabMenu(tab) {
    // 승인 관리
    setPopUserApprrval(<UserApprrvalPop popBody={null} />);
    setPopSiteCeatePop(<SiteCeatePop popBody={null} />);
    setPopSiteCeatePop(<SiteCeatePop popBody={null} />);
    setPopUserRole(<UserRolePop popBody={null} />);
    setPopSearch(<SearchPopup popBody={null} />);
    setPopListView(<ListViewPopup popBody={null} />);
    //ehc-workorder
    setPopEhcDetailView(<EhcDetailViewPopup popBody={null} />);
    // 공통
    setPopImgCrop(<EhpImageCrop popBody={null} />);
    setPopPostCode(<EhpDtlPostCode popBody={null} />);
    //
    setCurTabMenu(tab);
  }

  return (
    <>
      <div id="wrap">
        {/*<!-- #wrap -->*/}
        {<Header />}
        { (tabType==="main")&&<ServiceRequestMain
          setPopWin={handlePopWin}
          tabMenuList={tabMenuList}
          curTabMenu={curTabMenu}
          tabType={tabType} // 
          setCurTabMenu={handleCurTabMenu}
        />}
        { (tabType==="subMain")&&(tabMenuList)&&(curTabMenu)&&<ServiceRequestSubMain
          setPopWin={handlePopWin}
          tabMenuList={tabMenuList}
          curTabMenu={curTabMenu}
          tabType={tabType} // 
          setCurTabMenu={handleCurTabMenu}
        />}
      </div>
      {/** 서비스 요청 */}
      {popUserApprrval}
      {popSiteCeatePop}
      {popSmall}
      {popUserRole}
      {popSearch}
      {popListView}
      {/** ehc-workorder */}
      {popEhcDetailView}
      {/** 공통 */}
      {popImgCrop}
      {popPostCode}
    </>
  )
}
export default ServiceRequestLayout;

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
// 검색 팝업
function SearchPopup(props) {
  const popBody = props.popBody;

  return (
    <>
      <div id="pop-search-small" className="popup-layer layer-out js-layer hidden page-detail page-report page-list-in">
        <div className="popup__head">
          <h1 className="icon-search">검색</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(popBody === null)
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}
// 모바일 상세 팝업
function ListViewPopup(props) {
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
      <div id="pop-list-view" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
        <div className="popup__head">
          {/* <h1>점검출동 상세정보</h1> */}
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

/////////////////////////////////////////////
// ehc-workorder popup
// check message 조회 팝업
function EhcDetailViewPopup(props) {
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
  <div id="pop-list-ehcdetailview" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
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



function handelClose(e) {
  window.location.reload();
}