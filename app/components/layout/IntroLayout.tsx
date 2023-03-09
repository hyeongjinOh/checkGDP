/**
 * @url /landing, /ehcintro, /help
 * @CONST CONST.URL_LANDING, CONST.URL_EHC_INTRO, CONST.URL_HELP
 * @menu 서비스 소개
 * @mapping 서비스 둘러보 화면, 서비스 소개 화면, 도움말 화면
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
import axios from "axios";
import JSZip from "jszip";
import EquipmentLifeMain from "../equipmentlife/EquipmentLifeMain";
import IntroMain from "../intro/IntroMain";

function IntroLayout(props) {
  //recoil
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuInfo, setRecoilMenuInfo] = useRecoilState(menuInfoState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);

  //props
  const tabId = props.hasOwnProperty("tabId") ? props.tabId : 0;
  const tabType = props.hasOwnProperty("tabType") ? props.tabType : "main"; //main, subMain
  //tab init
  clog("IN LAYOUT : SERVICE : INIT : " + urlInfo);

  const [tabMenuList, setTabMenuList] = useState(null);
  const [curTabMenu, setCurTabMenu] = useState(null);
  const [itemDetail, setItemDetail] = useState({
    "ehcType": "BASIC",
    "ehcPos": "",
    "itemId": "",
    "itemName": "",
    "serialNo": "",
    "itemStatus": "",
    "itemStep": null,
    "responsible": null,
    "assessment": {
      "assessmentId": null,
      "totalComment": null,
      "reportId": null,
      "updatedTime": null,
      "isTempSave": null
    },
    "checkStep": { "checkStepId": null, "name": null }
  });


  const [reportInfo, setReportInfo] = useState(null);
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
  const [popSearch, setPopSearch] = useState(<SearchPopup popBody={null} />);
  const [popFilter, setPopFilter] = useState(<FilterPopup popBody={null} />);
  const [popChange, setPopChange] = useState(<ChangePopup popBody={null} />);
  const [popListView, setPopListView] = useState(<ListViewPopup popBody={null} />);
  // 성적서 pop
  const [popTestView, setPopTestView] = useState(<PopupReportView popBody={null} />);
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
    setPopSmall(popSmall);
    setPopUserRole(popUserRole);
    setPopSearch(popSearch);
    setPopFilter(popFilter);
    setPopChange(popChange);
    setPopListView(popListView);
    //
    setPopTestView(popTestView)
    //ehc-workorder
    setPopEhcDetailView(popEhcDetailView);
    // 공통
    setPopImgCrop(popImgCrop);
    setPopPostCode(popPostCode);


  }, [popUserApprrval, popSiteCeatePop,
    popSmall, popUserRole, popSearch, popListView,
    popEhcDetailView, popFilter, popTestView,
    popChange, //ehc-workorder
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
    else if (popType === "pop-role") {
      setPopUserRole(<UserRolePop popBody={popObj} />);
    }
    else if (popType === "pop-search-small") {
      setPopSearch(<SearchPopup popBody={popObj} />);
    }
    else if (popType === "pop-filter") {
      setPopFilter(<FilterPopup popBody={popObj} />);
    }
    else if (popType === "pop-change") {
      setPopChange(<ChangePopup popBody={popObj} />);
    }
    else if (popType === "pop-list-view") {
      setPopListView(<ListViewPopup popBody={popObj} />);
    }
    else if (popType === "pop-downtest") {
      setPopTestView(<PopupReportView popBody={popObj} />);
    }
    else if (popType === "pop-list-ehcdetailview") { // ehc-workorder
      setPopEhcDetailView(<EhcDetailViewPopup popBody={popObj} />);
    }
    else if (popType === "pop-imgcrop") {//////////////////////////////////////////////////
      setPopImgCrop(<EhpImageCrop popBody={popObj} />);
    }
    else if (popType === "pop-dtlpostcode") {
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
    setPopFilter(<FilterPopup popBody={null} />);
    setPopChange(<ChangePopup popBody={null} />);
    setPopListView(<ListViewPopup popBody={null} />);
    //
    setPopTestView(<PopupReportView popBody={null} />);
    //ehc-workorder
    setPopEhcDetailView(<EhcDetailViewPopup popBody={null} />);
    // 공통
    setPopImgCrop(<EhpImageCrop popBody={null} />);
    setPopPostCode(<EhpDtlPostCode popBody={null} />);
    //
    setCurTabMenu(tab);
  }

  function scrollToTop(e) {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {/* <!-- 221124, 도움말 화면 클래스 help 추가 --> 
      <!-- 221206, 랜딩 화면 클래스 randing ,intro 추가 -->
      */}
      <div id="wrap" className={`${(tabMenuList) && tabMenuList.filter(fd => fd.tabUrl === curTabMenu.tabUrl).map((tb) => ((tb.tabUrl == CONST.URL_EHC_INTRO) ? "intro" //소개
        : (tb.tabUrl == CONST.URL_LANDING) ? "randing" // 랜딩
          : (tb.tabUrl == CONST.URL_HELP) && "help " // 도움말
      ))}`}  >
        {/*<!-- #wrap -->*/}
        {<Header />}
        {(tabMenuList) && (curTabMenu) && <IntroMain
          setPopWin={handlePopWin}
          tabMenuList={tabMenuList}
          curTabMenu={curTabMenu}
          tabType={tabType} // 
          setCurTabMenu={handleCurTabMenu}
        />}
      </div>
      {/* <!--221212, 상단이동 버튼 추가--> */}
      {(tabMenuList) && tabMenuList.filter(fd => fd.tabUrl === curTabMenu.tabUrl).map((tb, idx) => ((tb.tabUrl == CONST.URL_EHC_INTRO) || (tb.tabUrl == CONST.URL_LANDING) ? //소개 랜딩
        <div key={"topBtn_" + idx.toString()} className="moveTopBtn" onClick={(e) => scrollToTop(e)}>
          <span className="hide">맨 위로</span>
        </div>

        : (tb.tabUrl == CONST.URL_HELP) && " " // 도움말
      ))}


      {/** 서비스 요청 */}
      {popUserApprrval}
      {popSiteCeatePop}
      {popSmall}
      {popUserRole}
      {popSearch}
      {popFilter}
      {popChange}
      {popListView}
      {popTestView}
      {/** ehc-workorder */}
      {popEhcDetailView}
      {/** 공통 */}
      {popImgCrop}
      {popPostCode}

    </>
  )
}
export default IntroLayout;

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



function FilterPopup(props) {
  const popBody = props.popBody;

  return (
    <>
      {/* <!-- filter 팝업 --> */}
      <div id="pop-filter" className="popup-layer js-layer layer-out hidden page-detail page-workplace page-report">
        <div className="popup__head">
          <h1 className="icon-filter">Filter</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(popBody === null)
          ? <></>
          : popBody
        }
      </div>
      {/* <!-- //filter 팝업 --> */}
    </>
  )
}
function ChangePopup(props) {
  const popBody = props.popBody;
  const htmlHeaderBtn = (!CUTIL.isnull(popBody))
    ? popBody.props.hasOwnProperty("htmlHeaderBtn")
      ? popBody.props.htmlHeaderBtn
      : null
    : null;
  return (
    <>
      <div id="pop-change" className="popup-layer js-layer hidden layer-out popup-basic">
        <div className="page-detail">
          <div className="popup__head">
            <h1>노후교체 요청</h1>
            {(htmlHeaderBtn) && htmlHeaderBtn}
            {/* <button className="btn btn-close js-close"><span className="hide">닫기</span></button> */}
          </div>
          {(popBody === null)
            ? <></>
            : popBody
          }
        </div>
      </div>
    </>

  )
}


function PopupReportView(props) {
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
      {/*<!-- 시험성적서 다운로드 팝업 - 웹용, 220802 추가-->*/}
      <div id="pop-downtest" className="popup-layer js-layer layer-out hidden w720">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(popBody === null)
          ? <></>
          : popBody
        }
      </div>
      {/*<!-- //시험성적서 다운로드 팝업 - 웹용 -->*/}
    </>

  )


}

function handelClose(e) {
  window.location.reload();
}