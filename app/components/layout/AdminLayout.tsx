
/**
 * @url /admin , /adminitem
 * @CONST CONST.URL_ADMIN , CONST.URL_ADMIN_ITEM
 * @mapping 운영관리 > 사업장 전기실 관리 화면 , 기기등록 관리 화면
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
// recoil
import { useRecoilState, useSetRecoilState, useResetRecoilState, useRecoilValue } from "recoil";
import { langState } from '../../recoil/langState';
import { urlState, menuState, menuInfoState, menuListState, loadingBoxState } from '../../recoil/menuState';
import { userInfoLoginState } from "../../recoil/userState";

//css
import "/static/css/swiper.css"

//utils
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const"
import * as CUTIL from "../../utils/commUtils";

//component
import Header from "../header/Header";
import AdminMain from "../admin/AdminMain";
import EhpImageCrop from "../common/imagecrop/EhpImageCrop";
import EhpPostCode from "../common/postcode/EhpPostCode";

function AdminLayout(props) {
  
  //recoil
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuInfo, setRecoilMenuInfo] = useRecoilState(menuInfoState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);

  const tabId = props.hasOwnProperty("tabId") ? props.tabId : 0;
  //tab init
  const tabMenuList1 = [
    { tabId: 0, tabName: "사업장 전기실 관리", tabUrl: CONST.URL_ADMIN, tabType: "TAB_ZONE" },
    { tabId: 1, tabName: "기기 등록 관리", tabUrl: CONST.URL_ADMIN_ITEM, tabType: "TAB_DEVICE" },
  ];

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
        "tabType": (smenu.url === CONST.URL_ADMIN) ? "TAB_ZONE" : (smenu.url === CONST.URL_ADMIN_ITEM) ? "TAB_DEVICE" : ""
      });
    });
    setTabMenuList(tempTab);
    //clog("IN LAYOUT : MANAGEMENT : TMENU LIST : " + JSON.stringify(tempTab));
    setCurTabMenu(tempTab[tabId]);
  }, [urlInfo, tabId, menuRecoilList])


  //pop-up
  const [popAreaRight, setPopAreaRight] = useState(<AreaRightPopup popBody={null} />);
  const [popAreaRightPageInfo, setPopAreaRightPageInfo] = useState(<AreaRightPageInfoPopup popBody={null} />);
  const [popList, setPopList] = useState(<ListPopup popBody={null} />);
  const [popListView, setPopListView] = useState(<ListViewPopup popBody={null} />);
  const [popDeviceAdd, setPopDeviceAdd] = useState(<DeviceAddPopup popBody={null} />);
  const [popDeviceAllAdd, setPopDeviceAllAdd] = useState(<DeviceAllAddPopup popBody={null} />);
  const [popFinishOk, setPopFinishOk] = useState(<FinishOkPopup popBody={null} />);
  const [popFinishOkWeb, setPopFinishOkWeb] = useState(<FinishOkWebPopup popBody={null} />);
  // by hjo - 20220919 이미지 삭제 팝업 추가
  const [popDelete, setPopDelete] = useState(<DeletePopup popBody={null} />);
  const [popImageDel, setPopImageDel] = useState(<ImageDeletePopup popBody={null} />);

  // pop-workplace
  const [popWorkPlace, setPopWorkPlace] = useState(<WorkPlacePopup popBody={null} />);
  const [popReason, setPopReason] = useState(<ReasonPopup popBody={null} />);
  // search
  const [popSearch, setPopSearch] = useState(<SearchPopup popBody={null} />);
  // crop
  const [popImgCrop, setPopImgCrop] = useState(<EhpImageCrop popBody={null} />);
  const [popPostCode, setPopPostCode] = useState(<EhpPostCode popBody={null} />);
  //


  useEffect(() => {
    setPopAreaRight(popAreaRight);
    setPopAreaRightPageInfo(popAreaRightPageInfo);
    setPopList(popList);
    setPopDeviceAdd(popDeviceAdd);
    setPopDeviceAllAdd(popDeviceAllAdd);
    setPopFinishOk(popFinishOk);
    setPopFinishOkWeb(popFinishOkWeb);
    setPopWorkPlace(popWorkPlace);
    setPopReason(popReason);
    setPopSearch(popSearch);
    // crop components
    setPopImgCrop(popImgCrop);
    setPopPostCode(popPostCode);
    // by hjo - 20220919 이미지 삭제 팝업 추가
    setPopDelete(popDelete)
    setPopImageDel(popImageDel)
  }, [popAreaRight, popAreaRightPageInfo,
    popList, popDeviceAdd,
    popDeviceAllAdd, popFinishOk,
    popFinishOkWeb, popWorkPlace,
    popReason,
    popSearch, popImgCrop, popPostCode,
    // by hjo - 20220919 이미지 삭제 팝업 추가
    popDelete, popImageDel,
  ])

  function handlePopWin(popType, popObj) {
    if (popType === "pop-area-right") {
      setPopAreaRight(<AreaRightPopup popBody={popObj} />);
    } else if (popType === "pop-area-right-page-info") {
      setPopAreaRightPageInfo(<AreaRightPageInfoPopup popBody={popObj} />);
    } else if (popType === "pop-list") {
      setPopList(<ListPopup popBody={popObj} />);
    } else if (popType === "pop-list-view") {
      setPopListView(<ListViewPopup popBody={popObj} />);
    } else if (popType === "pop-deviceadd") {
      setPopDeviceAdd(<DeviceAddPopup popBody={popObj} />);
    } else if (popType === "pop-devicealladd") {
      setPopDeviceAllAdd(<DeviceAllAddPopup popBody={popObj} />);
    } else if (popType === "pop-finish-ok") {
      setPopFinishOk(<FinishOkPopup popBody={popObj} />);
    } else if (popType === "pop-finish-ok-web") {
      setPopFinishOkWeb(<FinishOkWebPopup popBody={popObj} />);
    } else if (popType === "pop-workplace") {
      setPopWorkPlace(<WorkPlacePopup popBody={popObj} />);
    } else if (popType === "pop-reason") {
      setPopReason(<ReasonPopup popBody={popObj} />);
    } else if (popType === "pop-search-small") {
      setPopSearch(<SearchPopup popBody={popObj} />);
    } else if (popType === "pop-imgcrop") {
      setPopImgCrop(<EhpImageCrop popBody={popObj} />);
    } else if (popType === "pop-postcode") {
      setPopPostCode(<EhpPostCode popBody={popObj} />);
    } else if (popType === "pop-delete") { // by hjo -20220919 삭제 팝업 추가
      setPopDelete(<DeletePopup popBody={popObj} />);
    } else if (popType === "pop-imgdelete") { // by hjo -20220919 이미지 삭제 팝업 추가
      setPopImageDel(<ImageDeletePopup popBody={popObj} />);
    } else {
      setPopAreaRight(<AreaRightPopup popBody={popObj} />);
    }
  }

  function handleCurTabMenu(tab) {
    setPopAreaRight(<AreaRightPopup popBody={null} />);
    setPopAreaRightPageInfo(<AreaRightPageInfoPopup popBody={null} />);
    setPopList(<ListPopup popBody={null} />);
    setPopListView(<ListViewPopup popBody={null} />);
    setPopDeviceAdd(<DeviceAddPopup popBody={null} />);
    setPopDeviceAllAdd(<DeviceAllAddPopup popBody={null} />);
    setPopFinishOk(<FinishOkPopup popBody={null} />);
    setPopFinishOkWeb(<FinishOkWebPopup popBody={null} />);
    setPopWorkPlace(<WorkPlacePopup popBody={null} />);
    setPopReason(<ReasonPopup popBody={null} />);
    //
    setPopSearch(<SearchPopup popBody={null} />);
    //crop components
    setPopImgCrop(<EhpImageCrop popBody={null} />);
    setPopPostCode(<EhpPostCode popBody={null} />);
    // by hjo - 20220919 이미지 삭제 팝업 추가
    setPopDelete(<DeletePopup popBody={null} />)
    setPopImageDel(<ImageDeletePopup popBody={null} />)
    //
    setCurTabMenu(tab);
  }

  return (
    <>
      <div id="wrap">
        {/*<!-- #wrap -->*/}
        {<Header />}
        {(menuRecoilList) && (curTabMenu) && <AdminMain
          setPopWin={handlePopWin}
          tabMenuList={tabMenuList}
          curTabMenu={curTabMenu}
          setCurTabMenu={handleCurTabMenu}
        />}
      </div>
      {popAreaRight}
      {popAreaRightPageInfo}
      {popList}
      {popListView}
      {popDeviceAdd}
      {popDeviceAllAdd}
      {popFinishOk}
      {popFinishOkWeb}
      {popWorkPlace}
      {popReason}
      {popSearch}
      {popImgCrop}
      {popPostCode}
      {popDelete}
      {popImageDel}
    </>
  )
}
export default AdminLayout;

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


function AreaRightPopup(props) {
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
      <div id="pop-area-right" className="popup-layer js-layer layer-out hidden page-detail page-workplace">
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

function AreaRightPageInfoPopup(props) {
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
      <div id="pop-area-right-page-info" className="popup-layer js-layer layer-out hidden page-detail page-workplace page-info">
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

function ListPopup(props) {
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
      <div id="pop-list"
        className="popup-layer js-layer layer-out hidden page-detail page-workplace page-info page-list">
        <div className="popup__head">
          {(htmlHeader) && htmlHeader}
          {(htmlHeaderBtn) && htmlHeaderBtn}

        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

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



function DeviceAllAddPopup(props) {
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
      <div id="pop-devicealladd" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
        <div className="popup__head pb-20">
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

function DeviceAddPopup(props) {
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
      <div id="pop-deviceadd" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
        <div className="popup__head pb-20">
          {(htmlHeader) && htmlHeader}
          {(htmlHeaderBtn) && htmlHeaderBtn}

        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}


function FinishOkPopup(props) {
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
      <div id="pop-finish-ok" className="popup-layer js-layer layer-out hidden page-detail page-workplace page-list-in">
        <div className="popup__head pb-20">
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

function FinishOkWebPopup(props) {
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
      <div id="pop-finish-ok-web" className="popup-layer js-layer layer-out layer-out hidden page-list-in h80vh">
        <div className="popup__head pb-20">
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


function WorkPlacePopup(props) {
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
      <div id="pop-workplace" className="popup-layer js-layer layer-out hidden popup-basic popup-logout">
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


function ReasonPopup(props) {
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
      {/*<!-- 220826, 사유확인 팝업 -->*/}
      {/* <div id="pop-reason" className="popup-layer js-layer layer-out hidden popup-basic reason"> */}
      <div id="pop-reason" className="popup-layer popup-basic hidden page-detail w400">

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
      {/*<!-- //사유확인 팝업 -->*/}
    </>
  )
}
// by hjo -20220919 이미지삭제 팝업 추가
function DeletePopup(props) {
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
    : null
  return (
    <>

      <div id="pop-delete" className="popup-layer js-layer hidden layer-out popup-basic">
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

function ImageDeletePopup(props) {
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

      <div id="pop-imgdelete" className="popup-layer js-layer hidden layer-out popup-basic">
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
