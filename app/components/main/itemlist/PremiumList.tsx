/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-27
 * @brief EHP List 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
import {
  itemType,
  itemState,
  nextItemState,
  beforeItemState,
  checkStep,
  curCheckValueDto,
  getTempSave,
  tempCheckValue,
  getStepDone
} from '../../../recoil/assessmentState';

//
import { useTrans } from "../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils"
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";
//
import $ from "jquery";
//components
import Pagination from "../../common/pagination/Pagination"
import EhpPagination from "../../common/pagination/EhpPagination";
/**
 * @brief EHP List 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */
function PremiumList(props) {
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const curItem = useRecoilValue(itemState);
  const nextItem = useRecoilValue(nextItemState);
  const beforeItem = useRecoilValue(beforeItemState);
  const setRecoilCurItem = useSetRecoilState(itemState); // recoil userState
  const setRecoilBeforeItem = useSetRecoilState(beforeItemState); // recoil userState
  const setRecoilNextItem = useSetRecoilState(nextItemState); // recoil userState
  const setRecoilCurCheckStep = useSetRecoilState(checkStep);
  const resetRecoilTsCheckVal = useResetRecoilState(curCheckValueDto);
  //const setRecoilCurItem = useSetRecoilState(setItemSelectState);
  const isTempSave = useRecoilValue(getTempSave);
  const tempCheckVal = useRecoilValue(tempCheckValue);
  const stepDone = useRecoilValue(getStepDone);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  //props
  const reportLoading = props.reportLoading;
  const setParentReportLoading = props.setReportLoading;
  const curEhcType = props.curEhcType;
  const { company, zone, subZone, room, spg } = props.curTreeData;
  const setParentItemDetail = props.setItemDetail;
  const setParentReportInfo = props.setReportInfo;
  const statusReload = props.statusReload;
  const setParentPopWin = props.setPopWin;
  const setStatusReload = props.setStatusReload;
  //const setParentCurItem = props.setCurItem;
  //const setParentInitCheckItem = props.setInitCheckItem;
  //
  const [itemCheckList, setItemCheckList] = useState([]);
  //page
  const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10 };
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  function handleCurPage(page) {
    setPageInfo({ ...pageInfo, number: page });
  }
  let appPath = "";
  appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
  //const [sortData, setSortData] = useState({ "sortField": "itemName", "sort": "ASC" });
  const [sortData, setSortData] = useState({ "sortField": "panelName", "sort": "ASC" });
  const [searchType, setSearchType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchRText, setSearchRText] = useState("");

  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState("검색결과가 없습니다.");
  //
  // by - hjo 20220713 input 으로 돌아오는 기능  추가
  const [searchClose, setSerchClose] = useState(false);
  //검색설정 초기화
  useEffect(() => {
    handleCurPage(0);
    setSearchText("");
    setSearchRText("");
  }, [company, zone, subZone, room, spg, curEhcType]);
  //mobile check
  const [isMobile, setIsMobile] = useState(false);
  const mobileRef = useRef(null); // Mobile Check용
  const searchRef = useRef(null); // searchBox pop Check용
  const [isSearch, setIsSearch] = useState(false);
  function resetSearchForm() {
    var searchArea = document.querySelector(".searcharea");
    var btnSearch = "" as unknown as Element;
    var dsmBlockToggle = "" as unknown as Element;
    var btnDelete = "" as unknown as Element;
    for (var i = 0; i < searchArea.children.length; i++) {
      var child = searchArea.children[i];
      if (child.classList.contains("btn-search")) btnSearch = child;
      if (child.classList.contains("d-sm-block-toggle")) dsmBlockToggle = child;
      if (child.classList.contains("btn-delete")) btnDelete = child;
    }
    if (CUTIL.isnull(btnSearch)) return;

    if (btnSearch.classList.contains("active")) { // 검색버트 처리
      btnSearch.classList.remove("active");
    }
    if (btnSearch.classList.contains("on")) { // 검색버트 처리
      btnSearch.classList.remove("on");
    }
    if (dsmBlockToggle.classList.contains("on")) { // 모바일 input 처리
      dsmBlockToggle.classList.remove("on");
    }
    if (btnDelete.classList.contains("on")) { // 모바일 삭제 버튼 처리
      btnDelete.classList.remove("active");
    }
  }
  useEffect(() => { // resize handler
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setIsMobile(true);

      } else {
        setIsMobile(false);
        resetSearchForm();
      }
      // search popup check......
      if (CUTIL.isnull(searchRef)) return;
      const searchTag = searchRef.current;
      // clog("handleResize : " + searchTag.clientHeight + " X " + searchTag.clientWidth);
      if (!CUTIL.isnull(searchTag)) {
        if ((searchTag.clientHeight <= 0) && (searchTag.clientWidth <= 0)) {
          setIsSearch(true);
        } else {
          setIsSearch(false);
        }
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);
  useEffect(() => { // re-rendering mobile check
    if (CUTIL.isnull(mobileRef)) return;
    const mobileTag = mobileRef.current;
    if (!CUTIL.isnull(mobileTag)) {
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setIsMobile(true);
        if (pageInfo.totalElements == 0) {
          // 데이터 없는 화면 있는경우 모바일모드가 true가 되는 이슈 
          setIsMobile(false);
        }
      } else {
        setIsMobile(false);
        resetSearchForm();
      }
    }
    if (CUTIL.isnull(searchRef)) return;
    const searchTag = searchRef.current;
    if (!CUTIL.isnull(searchTag)) {
      if ((searchTag.clientHeight <= 0) && (searchTag.clientWidth <= 0)) {
        setIsSearch(true);
      } else {
        setIsSearch(false);
      }
    }
  }, [pageInfo]);


  //
  //let appPath = 'page=' + curPage + '&size=' + listSize;
  // 20220705
  //appPath = appPath + '&companyId=' + company.companyId + '&zoneId=' + zone.zoneId + '&roomId=' + room.roomId + '&spgId=' + spg.spgId;
  appPath = appPath + '&roomId=' + room.roomId + '&spgId=' + spg.spgId;
  appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;

  if (!CUTIL.isnull(searchType) && (searchType.length > 0) && (searchRText.length > 0)) {
    appPath = appPath + '&' + searchType + '=' + searchRText;
  }

  const [listMode, setListMode] = useState("INIT"); // INIT, LIST
  const { data: data, error, isLoading, reload, run } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    //appPath: "/api/v2/item/premium?" + appPath,
    appPath: "/api/v2/product/company/zone/subzone/room/panel/item/step/premium?" + appPath,
    appQuery: {
    },
    userToken: userInfo.loginInfo.token,
    //watch: appPath+listMode
    watch: appPath + listMode + curItem.assessment.assessmentId + isMobile + statusReload
    //watch: curPage+pageSize+company.companyId+zone.zoneId+room.roomId+spg.spgId,
  });

  useEffect(() => {
    let errList = "";
    if (data) {
      if (data.codeNum == 200) {
        setItemCheckList(data.body); // list
        //setRetPageInfo(data.data.page);
        setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT }); //5, 10
        setListMode("LIST");
      } else {
        setResErrorCode(data.codeNum);
        data.errorList.map((errMsg, idx) => (
          errList = errList + errMsg
        ));
        setResErrorMsg(errList);
      }
    }
  }, [data]);

  const t = useTrans();
  //
  /*
  // EhcCheck에서 assessmentId 없을 경우, curItem 갱신을 함.
  // 이때, 리스트 항목 업데이트 진행
  useEffect(() => {
    //if ( (curItem.itemId == nextItem.itemId) && (curItem.assessment.assessmentId != nextItem.assessment.assessmentId ) ) {
    setItemCheckList(
      itemCheckList.map(item => (item.itemId === curItem.itemId) ? {
        ...item,
        itemStep: curItem.itemStep,
        assessment: curItem.assessment
      } : item)
    );
    //}
  }, [curItem]);
  useEffect(() => {
    setItemCheckList(
      itemCheckList.map(item => (item.itemId === beforeItem.itemId) ? {
        ...item,
        itemStep: beforeItem.itemStep,
        assessment: beforeItem.assessment
      } : item)
    );
  }, [beforeItem]);
  */
  function onClickGoSearch(e) {
    if (parseInt(tempCheckVal.checkVal.value) > -1) {
      clog("임시저장 상태여서 검색이 안됩니다. ..........................");
      return;
    }
    var searchArea = document.querySelector(".searcharea");
    var btnSearch = "" as unknown as Element;
    var dsmBlockToggle = "" as unknown as Element;
    var btnDelete = "" as unknown as Element;
    for (var i = 0; i < searchArea.children.length; i++) {
      var child = searchArea.children[i];
      if (child.classList.contains("btn-search")) btnSearch = child;
      if (child.classList.contains("d-sm-block-toggle")) dsmBlockToggle = child;
      if (child.classList.contains("btn-delete")) btnDelete = child;
    }
    if (CUTIL.isnull(btnSearch)) return;
    var selSearchType = $("#search_selected-value").attr("data-value");
    if (isSearch) {
      //setSearchText(""); // 검색어 초기화
      //selSearchType = "itemName";
      selSearchType = "panelName";
      if (!btnSearch.classList.contains("on")) { // 검색버트 처리
        btnSearch.classList.add("on");
        btnSearch.addEventListener("click", function () { // mobile search go
          btnSearch.classList.add("active");
          // 검색 후에..
          //btnSearch.classList.remove("active");
        });
      }
      if (!dsmBlockToggle.classList.contains("on")) { // 모바일 input 처리
        dsmBlockToggle.classList.add("on");
      }
      if (!btnDelete.classList.contains("on")) { // 모바일 삭제 버튼 처리
        btnDelete.classList.add("active");
        btnDelete.addEventListener("click", function () {
          if (!btnDelete.classList.contains("active")) return;
          dsmBlockToggle.classList.remove("on");
          btnSearch.classList.remove("on");
          btnSearch.classList.remove("active");
          btnDelete.classList.remove("active");
        });
      }
    }
    handleCurPage(0); // 페이지 초기화
    setSearchType(selSearchType);
    setSearchRText(searchText);
    btnSearch.classList.remove("active");
  }

  // select active 액션
  function toggleSelectBox(selectBox) {
    selectBox.classList.toggle("active");
  }

  // option 선택 시  값 변경 액션
  function selectOption(optionElement) {
    const selectBox = optionElement.closest(".select");
    //option 값 selected-value 로 변경
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    // by sjpark
    //selectedElement.textContent = optionElement.textContent;
    clog("OPT VAL : " + optionElement.value);
    clog("OPT VAL : " + optionElement.getAttribute("data-value"));
    selectedElement.setAttribute("data-value", optionElement.getAttribute("data-value"))
  }

  function onClickSelect(e) {
    const selectBoxElement = e.currentTarget;
    const targetElement = e.target;
    const isOptionElement = targetElement.classList.contains("option");
    if (isOptionElement) {
      selectOption(targetElement);
    }
    toggleSelectBox(selectBoxElement);
  }

  function onClickSort(e) {
    var actTag = (e.target.tagName == "TH") ? e.target : e.currentTarget;
    var selSortField = actTag.getAttribute("data-value");
    var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
    if (selSortField !== sortData.sortField) { // 정렬필드가 변경된 경우
      selSort = "DESC";
    }
    handleCurPage(0); // 페이지 초기화
    setSortData({
      "sortField": selSortField,
      "sort": selSort
    });
  }

  ////////////////////////////////////////////////////////
  // popup open
  //const [reportLoading, setReportLoading] = useState(false);
  function onClickReportView(e, ehcType, item) {
    item.ehcType = ehcType;
    item.ehcPos = room.roomName + "/" + spg.spgName;
    if (!CUTIL.isnull(setParentItemDetail)) setParentItemDetail(item); // 데이터 전달을 위해
    //
    setParentReportInfo(null);

    (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
      setParentReportLoading(true);
      const resp = await HttpUtil.API_reportView(item.serialNo);
      setParentReportInfo(resp);
      setParentReportLoading(false);
      CUTIL.jsclose_Popup("pop-view-list")
      CUTIL.jsopen_Popup(e);
    })();
  }

  function onClickListDetailOpen(e, ehcType, item) {
    clog("IN PREMIUM : onClickListDetailOpen : " + e);

    //e.preventDefault();
    item.ehcType = ehcType;
    item.ehcPos = room.roomName + "/" + spg.spgName;
    if (!CUTIL.isnull(setParentItemDetail)) setParentItemDetail(item);
    CUTIL.jsopen_Popup(e);
  }

  function handleCurItemOLD(item) {
    if (userInfo.loginInfo.role === CONST.USERROLE_USER) {
      itemCheckRequested(item);
    } else if (userInfo.loginInfo.role === CONST.USERROLE_ADMIN) {
      itemCheckAccepted(item);
    } else if (userInfo.loginInfo.role === CONST.USERROLE_ENGINEER) {
      itemCheck(item);
    } else {
      clog("Unknown user role : " + userInfo.loginInfo.role);
    }
  }

  function handleCurItem(item) {

    if ((item.itemStatus == "NEEDED") && (item.itemStep == "BASIC_DONE")) {
      if ((userInfo.loginInfo.role === CONST.USERROLE_ADMIN) || (userInfo.loginInfo.role === CONST.USERROLE_USER)) {
        itemCheckRequested(item);
      }
    } else if ((item.itemStatus == "REQUESTED") && (item.itemStep == "BASIC_DONE")) {
      if ((userInfo.loginInfo.role === CONST.USERROLE_ADMIN)) {
        itemCheckAccepted(item);
      }
    } else {//if ( (item.itemStatus == "ACCEPTED") && (item.itemStep == "BASIC_DONE") ) {
      if ((userInfo.loginInfo.role === CONST.USERROLE_ADMIN) || (userInfo.loginInfo.role === CONST.USERROLE_ENGINEER)) {
        itemCheck(item);
      }
    }
    if (true) {

    }
    /*
    if ( userInfo.loginInfo.role === CONST.USERROLE_USER) {
      itemCheckRequested(item);
    } else if (userInfo.loginInfo.role === CONST.USERROLE_ADMIN) {
      itemCheckAccepted(item);
    } else if (userInfo.loginInfo.role === CONST.USERROLE_ENGINEER) {
      itemCheck(item);
    } else {
      clog("Unknown user role : " + userInfo.loginInfo.role);
    }
    */
  }





  //ROLE_USER
  async function itemCheckRequested(item) {
    var isOk = confirm("Premium 진단요청\nLS ELECTRIC 전문가가 활선/정전 상태에서 전력설비의 전기적 기계적 성능 점검 및 시험을 진행하고 설비의 정확한 상태를 제공합니다.\n(출장 및 현장 정밀 진단 서비스 비용 발생)");
    if (!isOk) return;

    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/product/company/zone/subzone/room/panel/item/itemstatus/REQUESTED",
      appQuery: {
        itemId: item.itemId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN PREMIUM : itemCheckRequested : " + JSON.stringify(data.body));
        setListMode("INIT");
        setStatusReload(true)
        //setSavedFiles(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  //ROLE_ADMIN
  async function itemCheckAccepted(item) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/product/company/zone/subzone/room/panel/item/itemstatus/ACCEPTED",
      appQuery: {
        itemId: item.itemId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN PREMIUM : itemCheckAccepted : " + JSON.stringify(data.body));
        setListMode("INIT");
        //setSavedFiles(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }
  // ROLE_ENGINEER
  function itemCheck(item) {
    if (curItem.itemId === item.itemId) return;
    // parent call but reload list
    const clickItem: itemType = {
      spgTree: {
        company: company,
        zone: zone,
        subZone: subZone,
        room: room,
        spg: spg
      },

      ehcType: curEhcType,
      itemId: item.itemId,
      itemName: item.itemName,
      serialNo: item.serialNo,
      itemStatus: item.itemStatus,
      itemStep: item.itemStep,
      responsible: item.responsible,

      assessment: {
        preAssessmentId: item.assessment.preAssessmentId,
        assessmentId: item.assessment.assessmentId,
        totalComment: item.assessment.totalComment,
        reportId: item.assessment.reportId,
        updatedTime: item.assessment.updatedTime,
        isTempSave: item.assessment.isTempSave
      }
    };
    // set next item
    const tsItem = tempCheckVal.item;
    const tsVal = tempCheckVal.checkVal;
    const tsValue = (tempCheckVal.checkVal.value.length > 0) ? parseInt(tempCheckVal.checkVal.value) : -1;

    setRecoilNextItem(clickItem);

    if (curItem.itemId.length <= 0) { // 현재 아이템이 체크되어 있지 않으면...클릭한 아이템을 현재 아이템으로 함
      clog("IN PREMIUM : " + clickItem.itemId + " : " + "현재 아이템이 체크되어 있지 않으면...클릭한 아이템을 현재 아이템으로 함/단계도 처음으로");
      setRecoilCurItem(clickItem);
    } else if (tsValue < 0) {
      setRecoilCurItem(clickItem);
    }
    if (stepDone) resetRecoilTempCheckVal();
    //포커스 화면 이동
    location.href = "#focustop"
  }

  // by hjo - 20220713 웹사이즈 닫기버튼 이벤트 추가
  function searchClosed(e) {
    if (searchClose === true) {
      setSerchClose(false)
    }
    setSearchText("");
  }

  /// by 20221115 - Engineer,Admin 계정 팝업 변경
  async function listView(e, item) {

    let data: any = [];
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/user/${item.requestUserIdPk}`,
      userToken: userInfo.loginInfo.token,
      watch: appPath
    });

    if (data) {
      setParentPopWin("pop-userinfo",
        <MobileListView
          htmlHeader={<h1>요청자 정보</h1>}
          item={item}
          list={data.body}
          setParentReportInfo={setParentReportInfo}
          setParentReportLoading={setParentReportLoading}

        />
      )
    }
    CUTIL.jsopen_m_Popup(e)
  }
  // 모바일 사이즈 
  async function listDetailView(e, item) {
    let data: any = [];
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/user/${item.requestUserIdPk}`,
      userToken: userInfo.loginInfo.token,
      watch: appPath
    });

    if (data) {
      setParentPopWin("pop-list-view",
        <MobileListDetailView
          htmlHeader={<h1>상세정보</h1>}
          item={item}
          list={data.body}
          setParentReportInfo={setParentReportInfo}
          setParentReportLoading={setParentReportLoading}

        />
      )
    }
    CUTIL.jsopen_m_Popup(e)
  }

  return (
    <>
      <article className={`box list ${(isLoading || (reportLoading)) ? "loading__box" : ""}`}>
        {/* // <!--220525, 그리드 영역 --> */}
        <div className="box__header">
          <p className="box__title"><span className="txt-green">Premium</span> e-HC List</p>
          {/* <!--220530 설정버튼 삭제됨. box__etc 태그 전체 삭제--> */}
        </div>
        <div className={`box__body ${((resErrorCode != 200) || (pageInfo.totalElements <= 0)) ? "nodata" : ""}`}>
          {/* <!-- 리스트 위 항목 --> */}
          <div className="tbl__top">
            <div className="left">
              <span>{t("LABEL.등록항목")}</span>
            </div>
            <div className="right">
              <div className="searcharea">
                {/* <!--220530, div class="searchinput" 추가 : 모바일에서 숨기기 위해서 생성--> */}
                <div className="searchinput" >
                  <span>{t("LABEL.검색")}</span>
                  {/*<div className="select">*/}
                  <div ref={searchRef} id="search_select" className="select" onClick={(e) => onClickSelect(e)}>
                    <div className="selected">
                      <div id="search_selected-value" className="selected-value" data-value="panelName">{t("FIELD.Panel명")}</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      <li className="option" value="0" data-value="panelName">{t("FIELD.Panel명")}</li>
                      <li className="option" value="1" data-value="serialNo">{t("FIELD.시리얼번호")}</li>
                      <li className="option" value="2" data-value="responsible">{t("FIELD.담당자")}</li>
                    </ul>
                  </div>&nbsp;
                  <div className="input__direct">
                    {(!searchText || !searchClose) &&
                      <input type="text" placeholder={t("MESSAGE.검색어를입력하세요")} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    }
                    {(searchText || searchClose) &&
                      <button type="button" className="btn btn-delete" onClick={(e) => searchClosed(e)}><span className="hide">입력 창 닫기</span></button>
                    }
                  </div>
                </div>
                <input type="text" placeholder="Panel명을입력하세요" className="d-sm-block-toggle" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                <button type="button" className="btn btn-delete"><span className="hide">입력 창 닫기</span></button>
                <button type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>{t("LABEL.조회")}</span></button>
              </div>
            </div>
          </div>
          {((resErrorCode != 200) || (pageInfo.totalElements <= 0)) &&
            <p className="nodata__txt">{t("MESSAGE.데이터를찾을수없습니다")}</p>
          }
          {/* <!-- 기본 리스트 형식 테이블, 기본 중앙정렬, td가 전체적으로 좌측일 경우 tbl-list에 txt-left 클래스 추가, 우측일때 txt-right추가 --> */}
          <div className="tbl-list">
            <table summary="기기 명, 제조번호, 담당자, 최근점검일, Step, Report, Memo, 성적서, 임시저장, 점검 진행 항목으로 구성된 Basic e-HC List 입니다.">
              <caption>
                Premium-HCList
              </caption>
              <colgroup>
                <col />
              </colgroup>
              <thead>
                <tr>
                  {/*<!--sort 오름차순-->*/}
                  <th scope="col"
                    className={`sort ${(sortData.sortField === "panelName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                    onClick={(e) => onClickSort(e)} data-value="panelName"><span>{t("FIELD.Panel명")}</span></th>
                  {/*<!--sort 내림차순-->*/}
                  {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                  <th scope="col" ref={mobileRef}
                    className={`sort ${(sortData.sortField === "serialNo") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none txt-left`}
                    onClick={(e) => onClickSort(e)} data-value="serialNo"><span>{t("FIELD.시리얼번호")}</span></th>
                  {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                  <th scope="col"
                    className={`sort ${(sortData.sortField === "responsible") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none txt-left`}
                    // by 20221115 - hjo engineer,admin 계정 필드 변경
                    onClick={(e) => onClickSort(e)} data-value="responsible">
                    <span>{(userInfo.role == CONST.USERROLE_USER) ? t("FIELD.담당자") : "요청자"}</span>
                  </th>
                  <th scope="col"
                    className={`sort ${(sortData.sortField === "updatedTime") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                    onClick={(e) => onClickSort(e)} data-value="updatedTime"><span>{t("FIELD.최근점검일")}</span></th>
                  {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                  <th scope="col" className="d-sm-none"><span>{t("FIELD.Step")}</span></th>
                  {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                  <th scope="col" className="d-sm-none"><span>{t("FIELD.Report")}</span></th>
                  {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                  <th scope="col" className="d-sm-none"><span>{t("FIELD.Memo")}</span></th>
                  {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                  <th scope="col" className="d-sm-none"><span>{t("FIELD.성적서")}</span></th>
                  {/*<!--비활성화일경우 클래스에 disabled -->*/}
                  {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                  {(itemCheckList == null)
                    ? <th className="sort asc d-lm-none disabled"><span className="center">{t("FIELD.임시저장")}</span></th>
                    : <th className={`sort ${(sortData.sortField === "isTempSave") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none`}
                      onClick={(e) => onClickSort(e)} data-value="isTempSave"><span className="center">{t("FIELD.임시저장")}</span></th>
                  }
                  <th scope="col" className="txt-left"><span>{t("FIELD.점검진행")}</span></th>
                </tr>
              </thead>
              <tbody>
                {itemCheckList.map((item, idx) => (
                  <tr key={item.itemId + "_premium_" + idx} className={(item.itemId === curItem.itemId) ? "focused" : ""}>
                    {clog("IN PREMIUM : ITEM : " + JSON.stringify(item))}
                    {/* <!--기본 중앙 정렬 / td 개별적으로 좌측정렬일경우 txt-left , 우측 txt-right, 중앙 txt-center --> */}
                    {/* <td className="txt-left" title={item.itemName}>{item.itemName}</td> */}
                    <td className="txt-left">
                      <span className="tooltip">
                        {/* <!--기존 내용--> */}
                        {item.panel.panelName}
                        {/* <!--툴팁 내용--> */}
                        <span className="tooltip-text">{item.panel.panelName}</span>
                      </span>
                    </td>
                    {/* <!--말줄임들어갈 경우 p class="ellipsis" 태그로 감쌈 --> */}
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    {/* <td className="txt-left d-lm-none" title={item.serialNo}><p className="ellipsis">{item.serialNo}</p></td> */}
                    <td className="txt-left d-lm-none">
                      <p className="ellipsis">
                        <span className="tooltip">
                          {/* <!--기존 내용--> */}
                          {item.serialNo}
                          {/* <!--툴팁 내용--> */}
                          <span className="tooltip-text">{item.serialNo}</span>
                        </span>
                      </p>
                    </td>
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    {(userInfo.role == CONST.USERROLE_USER) ?
                      <td className="txt-left d-lm-none" >{item.responsible}</td>
                      :// by 20221115 - hjo engineer,admin 계정 필드 추가
                      <td className="txt-left d-lm-none js-open" data-pop="pop-userinfo" onClick={(e) => listView(e, item)} >
                        {(item.requestUser) ? item.requestUser : "-"}
                      </td>

                    }
                    {/* || ((searchInput.clientHeight <= 0) && (searchInput.clientWidth <= 0)))*/
                      /* (userInfo.role == CONST.USERROLE_USER) ? // || ((searchInput.clientHeight <= 0) && (searchInput.clientWidth <= 0)))// by 20221115 - hjo engineer,admin 계정 팝업 변겯  
                        <td className="checkdate js-open txt-left" data-pop={"data-detail"} onClick={(e) => onClickListDetailOpen(e, "PREMIUM", item)}>
                          {(CUTIL.isnull(item.assessment.updatedTime)) ? t("MESSAGE.기록없음") : CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}
                        </td> */
                      (isMobile) ?
                        <td className="checkdate js-open txt-left" data-pop={"pop-list-view"} onClick={(e) => listDetailView(e, item)}>
                          {(CUTIL.isnull(item.assessment.updatedTime)) ? t("MESSAGE.기록없음") : CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}
                        </td>
                        : <td className="checkdate txt-left" data-pop={"data-detail"} >
                          {(CUTIL.isnull(item.assessment.updatedTime)) ? t("MESSAGE.기록없음") : CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}
                        </td>
                    }
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    <td className="d-sm-none">
                      {/* <!--기본:모든단계안된경우 icon-step 만 / 전단계모두완료 all 추가 / 1단계만 one 추가 / 2단계만 two 추가--> */}
                      <ul className={(item.checkStep.name === "ADVANCED")
                        ? "icon-step all"
                        : (item.checkStep.name === "PREMIUM")
                          ? "icon-step two"
                          : (item.checkStep.name === "BASIC")
                            ? "icon-step one"
                            : "icon-step"
                      }>
                        <li><span className="hide">1단계</span></li>
                        <li><span className="hide">2단계</span></li>
                        <li><span className="hide">3단계</span></li>
                      </ul>
                    </td>
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    <td className="d-sm-none">
                      {(item.assessment.reportId != null)
                        ? <button type="button"
                          className="btn btn-file"
                          onClick={(e) => { HttpUtil.fileDownload_WithPdfViewer(item.serialNo, item.assessment.reportId, userInfo.loginInfo.token) }}>
                          <span className="hide">파일다운로드</span>
                        </button>
                        : <button type="button" className="btn btn-file" disabled>
                          <span className="hide">파일다운로드</span>
                        </button>
                      }
                    </td>
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    <td className="d-sm-none">
                      {(!item.assessment.totalComment)
                        ? <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                        : <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                      }
                    </td>
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    <td className="d-sm-none">
                      {/* {(item.serialNo) && (item.serialNo.length <= 0) */}
                      {(!item.serialNo)
                        ? <button type="button" className="btn btn-file" disabled>
                          <span className="hide">성적서</span>
                        </button>
                        : <button type="button"
                          className="btn btn-file js-open"
                          data-pop="pop-downtest"
                          onClick={(e) => onClickReportView(e, "BASIC", item)}>
                          <span className="hide">성적서</span>
                        </button>
                      }

                      {/*<button type="button" className="btn btn-file" disabled><span className="hide">성적서</span></button>*/}
                    </td>
                    {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                    <td className="d-lm-none">
                      {/*(!item.assessment.isTempSave)
                        ? <button type="button" className="btn btn-down" disabled><span className="hide">임시저장</span></button>
                        : <button type="button" className="btn btn-down" onClick={(e) => handleCurItem(item)}><span className="hide">임시저장</span>
                        </button>
                      */}
                      {(item.itemStep === "PREMIUM_ING")
                        ? <button type="button" className="btn btn-down" onClick={(e) => handleCurItem(item)}>
                          <span className="hide">임시저장</span>
                        </button>
                        : <button type="button" className="btn btn-down" disabled>
                          <span className="hide">임시저장</span>
                        </button>
                      }
                    </td>
                    <td>
                      {/*PREMIUM_ING : 진행중 */}
                      {(item.itemStatus == "NEEDED") && (item.itemStep == "BASIC_DONE")
                        ? <button type="button" className="bg-green"
                          //onClick={(e)=>((userInfo.loginInfo.role===CONST.USERROLE_USER))&&handleCurItem(item)}>
                          onClick={(e) => handleCurItem(item)}
                        >
                          <span>{t("LABEL.요청")}</span>{/**Premium에서는 ROLE_USER만이  Premium 진단점검을 요청할수 있음*/}
                        </button>
                        : (item.itemStatus == "REQUESTED") && (item.itemStep == "BASIC_DONE")
                          ? <button type="button" className="bg-lightgreen"
                            onClick={(e) => handleCurItem(item)}
                          >
                            <span>{t("LABEL.요청완료")}</span>
                          </button>
                          : (item.itemStatus == "ACCEPTED") && (item.itemStep == "BASIC_DONE")
                            ? <button type="button"
                              //className={(userInfo.loginInfo.role===CONST.USERROLE_ENGINEER)?"bg-darkgreen":"bg-lightgreen"}
                              className={(userInfo.loginInfo.role === CONST.USERROLE_USER) ? "bg-lightgreen" : "bg-darkgreen"}
                              //onClick={(e)=>((userInfo.loginInfo.role===CONST.USERROLE_ENGINEER))&&handleCurItem(item)}
                              onClick={(e) => handleCurItem(item)}
                            >
                              <span>{t("LABEL.접수완료")}</span>{/**Premium에서는 ROLE_ENGINEER만이  Premium 진단점검을 할수 있음*/}
                            </button>
                            : <button type="button"
                              className="bg-navy"
                              //onClick={(e)=>((userInfo.loginInfo.role===CONST.USERROLE_ENGINEER))&&handleCurItem(item)}
                              onClick={(e) => handleCurItem(item)}
                            >
                              <span>{t("LABEL.진행중")}</span>{/**Premium에서는 ROLE_ENGINEER만이  Premium 진단점검을 할수 있음*/}
                            </button>
                      }
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
          <EhpPagination
            componentName={"NORMAL"}
            pageInfo={pageInfo}
            handleFunc={handleCurPage}
          />
        </div>
      </article>
    </>
  )
}

export default PremiumList;


function MobileListView(props) {
  //trans
  const t = useTrans();
  //recoil
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  const item = props.item;
  const list = props.list

  function listClose(e) {

    CUTIL.jsclose_Popup("pop-userinfo")
  }

  return (
    <>
      <div className="popup__body">
        <div className="tbl-list mt-13">
          <table className="pd-13" summary="사용자 타입,회사,이름,E-mail(ID),연락처 항목으로 구성된 담당자 정보 리스트 입니다.">
            <caption>
              담당자 정보 리스트
            </caption>
            <colgroup>
              <col style={{ "width": "15%" }} />
              <col style={{ "width": "20%" }} />
              <col style={{ "width": "15%" }} />
              <col style={{ "width": "30%" }} />
              <col style={{ "width": "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="txt-left">사용자 타입</th>
                <th scope="col" className="txt-left">회사</th>
                <th scope="col" className="txt-left">이름</th>
                <th scope="col" className="txt-left">E-mail(ID)</th>
                <th scope="col" className="txt-left">연락처</th>
              </tr>
            </thead>
            <tbody>
              {(list) &&
                <tr>
                  <td className="txt-left">
                    {(list.role == CONST.USERROLE_ADMIN) ?
                      "Admin"
                      : (list.role == CONST.USERROLE_ENGINEER) ?
                        "Engineer"
                        : (list.role == CONST.USERROLE_USER) ?
                          "User"
                          : "-"
                    }
                  </td>
                  <td className="txt-left">{(list.companyName) ? list.companyName : "-"}</td>
                  <td className="txt-left">{(list.userName) ? list.userName : "-"}</td>
                  <td className="txt-left">{(list.userId) ? list.userId : "-"}</td>
                  <td className="txt-left">{(list.phoneNumber) ? list.phoneNumber : "-"}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      <div className="popup__footer brd-0">
        <button type="button" className="js-close mb-10" onClick={(e) => listClose(e)}><span>확인</span></button>
      </div>
      {/* <!--//리스트 상세 보기 팝업--> */}
    </>
  )
}
// 상세정보 Pop
function MobileListDetailView(props) {
  //trans
  const t = useTrans();
  //recoil
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const item = (props.item === null) ? null : props.item;
  const list = (props.list === null) ? null : props.list;
  const setParentReportInfo = props.setParentReportInfo;
  const setParentReportLoading = props.setParentReportLoading;

  function onClickReportView(e, item) {
    setParentReportInfo(null);

    (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
      CUTIL.jsclose_Popup("pop-list-view");
      setParentReportLoading(true);
      const resp = await HttpUtil.API_reportView(item.serialNo);
      setParentReportInfo(resp);
      setParentReportLoading(false);
      CUTIL.jsopen_Popup(e);
    })();
  }


  function onClickClose(e) {

    CUTIL.jsclose_Popup("pop-list-view");
  }

  return (
    <>
      <div className="popup__body">
        <div className="area__right_content workplace__info">

          <div className="content__info">
            <h3 className="hide">리스트 상세 정보</h3>
            <ul >
              {/*      <li>
                  <p className="tit">사용자타입</p>
                  <p className="txt">
                    {(list.role == CONST.USERROLE_ADMIN) ?
                      "Admin"
                      : (list.role == CONST.USERROLE_ENGINEER) ?
                        "Engineer"
                        : (list.role == CONST.USERROLE_USER) ?
                          "User"
                          : "nodata"
                    }
                  </p>
                </li> */}
              {(list) &&
                <li>
                  <p className="tit">요청자 회사</p>
                  <p className="txt">{(!list.companyName) ? "-" : list.companyName}</p>
                </li>
              }
              {(list) &&
                <li>
                  <p className="tit">요청자 이름</p>
                  <p className="txt">{(!list.userName) ? "-" : list.userName}</p>
                </li>
              }
              {(list) &&
                <li>
                  <p className="tit">요청자 E-mail(ID)</p>
                  <p className="txt">{(!list.userId) ? "-" : list.userId}</p>
                </li>
              }
              {(list) &&
                <li>
                  <p className="tit">요청자 연락처</p>
                  <p className="txt">{(!list.phoneNumber) ? "-" : list.phoneNumber}</p>
                </li>
              }
              <li>
                <p className="tit" >{t("FIELD.시리얼번호")}</p>
                <p className="txt" >{(!item.serialNo) ? "-" : item.serialNo}</p>
              </li>

              <li>
                <p className="tit">{t("FIELD.최근점검일")}</p>
                <p className="txt">{(!item.assessment.updatedTime) ? "-" :
                  CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}</p>
                {/* <span className="hide">Step</span>
                  <ul className={(item.checkStep.name === "ADVANCED")
                    ? "icon-step all"
                    : (item.checkStep.name === "PREMIUM")
                      ? "icon-step two"
                      : (item.checkStep.name === "BASIC")
                        ? "icon-step one"
                        : "icon-step"
                  }>
                    <li><span className="hide">1단계</span></li>
                    <li><span className="hide">2단계</span></li>
                    <li><span className="hide">3단계</span></li>
                  </ul> */}
              </li>
              <li>
                <p className="tit" >{t("FIELD.담당자")}</p>
                <p className="txt" >{(!item.responsible) ? "-" : item.responsible}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.Report")}</p>
                <div className="txt">
                  <ul className="filelist">
                    <li>
                      <span>PDF</span>
                      <button type="button" className="btn btn-filedown"
                        onClick={(e) => { HttpUtil.fileDownload_EhcReport(item.itemName, item.assessment.reportId, userInfo.loginInfo.token) }}
                      >
                        <span className="hide">삭제</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
              <li>
                <p className="tit">{t("FIELD.메모")}</p>
                <div className="txt">
                  <span></span>
                  {(item.assessment.totalComment == null)
                    ? <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                    : <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                  }

                </div>
              </li>
              <li>
                <p className="tit">{t("FIELD.성적서")}</p>
                <div className="txt">
                  <span></span>
                  {/* {(item.serialNo) && (item.serialNo.length <= 0) */}
                  {(!item.serialNo)
                    ? <button type="button" className="btn btn-file" disabled>
                      <span className="hide">성적서</span>
                    </button>
                    : <button type="button"
                      className="btn btn-file js-open"
                      data-pop="pop-downtest-mobile"
                      onClick={(e) => onClickReportView(e, item)}
                    >
                      <span className="hide">파일다운로드</span>
                    </button>
                  }

                  {/*<button type="button" className="btn btn-file" disabled><span className="hide">파일다운로드</span></button>
                <p>성적서</p>*/}
                </div>
              </li>
            </ul>
          </div>

          <div className="btn__wrap">
            <button type="button" className="js-close" onClick={(e) => onClickClose(e)}><span>확인</span></button>
          </div>
        </div>
      </div>
      {/* <!--//리스트 상세 보기 팝업--> */}
    </>
  )
}
