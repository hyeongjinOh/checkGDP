/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-10-25
 * @brief EHPworkorder - EhealthCheck 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState, DependencyList } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState } from "../../../../recoil/menuState";
import { langState } from '../../../../recoil/langState';
//ex-utils
//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";
import { ko, enUS, zhCN, } from "date-fns/esm/locale";

// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as CUTIL from "../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../../common/pagination/EhpPagination";
import { useTrans } from "../../../../utils/langs/useTrans";
/**
 * @brief EHP WorkOrder - EhealthCheck 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function EhealthCheckList(props) {
  //trans
  const t = useTrans();
  const navigate = useNavigate();
  const mobileRef = useRef(null); // Mobile Check용
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  //props
  const isTreeOpen = props.isTreeOpen;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  const setParentPopWin = props.setPopWin;
  const isMobile = props.isMobile;
  const setParentIsMobile = props.setIsMobile;
  const setParentNodata = props.setNodata;


  const [isCount, setIsCount] = useState(false)
  const counteRef = useRef(null); // Mobile Check용
  //mobile check
  const [ehcList, setEhcList] = useState([]);
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(counteRef)) return;
      const countTag = counteRef.current;
      if (!CUTIL.isnull(countTag)) {
        if ((countTag.clientHeight <= 0) && (countTag.clientWidth <= 0)) {
          setIsCount(true);
        } else {
          setIsCount(false);
        }
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  });
  // isMobile 여부 랜더링 후 확인
  useDebounceEffect(
    async () => {
      if (mobileRef.current) {
        if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
          setIsCount(true);
        }
      }
    }, 100)

  //
  const [ehcCount, setEhcCount] = useState(null);
  //const [ehcList, setEhcList] = useState([]);
  const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  function handleCurPage(page) {
    setPageInfo({ ...pageInfo, number: page });
  }
  // date List
  // const exceptStartDate = new Date(new Date().setDate(new Date().getDate() - 365));
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const mintStartDate = dayjs(endDate).set("year", dayjs(endDate).year() - 1).toDate(); // 종료일 기준 1년
  const maxEndDate = dayjs(startDate).set("year", dayjs(startDate).year() + 1).toDate(); // 시작일 기준 1년
  const dateTypeList = [
    /*{"id":0, "dtDisp":"전체", "dtVal":""},*/
    { "id": 1, "dtDisp": t("FIELD.요청일자"), "dtVal": "requestDate" },
    { "id": 2, "dtDisp": t("FIELD.진행일자"), "dtVal": "handlingDate" },
    { "id": 3, "dtDisp": t("FIELD.완료일자"), "dtVal": "completionDate" },
  ];
  const [dateType, setDateType] = useState(dateTypeList[0]);
  const dateTermList = [
    { "id": 0, "dtDisp": (!isMobile) ? "직접입력" : t("LABEL.전체"), "dtVal": 0 },
    { "id": 1, "dtDisp": t("LABEL.T1개월", ["1"]), "dtVal": 30 },
    { "id": 2, "dtDisp": t("LABEL.T1개월", ["3"]), "dtVal": 90 },
    { "id": 3, "dtDisp": t("LABEL.T1개월", ["6"]), "dtVal": 180 },
    { "id": 4, "dtDisp": t("LABEL.T1년", ["1"]), "dtVal": 365 },
  ];
  const [dateTerm, setDateTerm] = useState(dateTermList[0]);
  //
  let appPath = "";
  if (selTree.zone.zoneId.length > 0) {
    appPath = appPath + `zoneId=${selTree.zone.zoneId}`
  }
  if (selTree.subZone.subZoneId.length > 0) {
    appPath = appPath + `&subZoneName=${selTree.subZone.subZoneName}`
  }
  ///
  const [searchCount, setSearchCount] = useState({
    "dateType": null,
    "dateTerm": null,
    "startDate": null,
    "endDate": null,
  });

  const [dateSel, setDateSel] = useState(null);


  // 검색 후 초기화 필요
  /*   function resetSearchCount(isAll) {
      clog("resetSearchCount : isMobile : " + isMobile);
      if (isAll) {
        setDateType((searchCount.dateType) ? searchCount.dateType : dateTypeList[0]);
        setDateTerm((searchCount.dateTerm) ? searchCount.dateTerm : dateTermList[0]);
        setStartDate(searchCount.startDate);
        setEndDate(searchCount.endDate);
      } else {
        if (!isMobile) { // mobile에서는 엑션이 밣생 안하도록 / term에서 액션이 발생 / dateKind 값 변경 시 select 초기화(전체) 
          document.getElementById("mcheck_date_1").click();
          document.getElementById("mcheck_date_0").click();
          setDateTerm(dateTermList[0]);
          setStartDate(null);
          setEndDate(null);
        } else {
          document.getElementById("mcheck_date_1").click();
          document.getElementById("mcheck_date_0").click();
          setDateTerm(dateTermList[0]);
          setStartDate(null);
          setEndDate(null);
        }
      }
    } */

  if (searchCount.dateType && (searchCount.dateType.dtVal.length > 0)) {
    if ((!CUTIL.isnull(searchCount.startDate)) && (!CUTIL.isnull(searchCount.startDate))) {
      appPath = appPath
        + `&dateKind=${searchCount.dateType.dtVal}`
        + `&startDate=${CUTIL.date2formedstr(searchCount.startDate, "yyyyMMdd")}`
        + `&endDate=${CUTIL.date2formedstr(searchCount.endDate, "yyyyMMdd")}`
    }
  }
  /////////////////
  const [serviceStatus, setServiceStatus] = useState("");//"":ALL, Requested, accepted, ing, done

  const searchFieldList = [
    //{"id":0, "sfDisp":"전체", "sfVal":""},
    { "id": 1, "sfDisp": t("FIELD.기기명"), "sfVal": "spgName" },
    { "id": 2, "sfDisp": t("FIELD.Panel명"), "sfVal": "panelName" },
    { "id": 3, "sfDisp": t("FIELD.시리얼번호"), "sfVal": "serialNo" },
  ];
  const [searchField, setSearchField] = useState(searchFieldList[0]);
  const [searchText, setSearchText] = useState("");
  const [searchData, setSearchData] = useState({
    "searchField": null,
    "searchText": null,
  });
  const [fieldList, setFieldList] = useState([
    { "id": 0, "fdDisp": "상태", "fdVal": "progressStatus", "sort": "asc", "click": false },
    { "id": 1, "fdDisp": "점검단계", "fdVal": "ehcStatus", "sort": null, "click": false },
    { "id": 2, "fdDisp": "요청 일자", "fdVal": "requestDate", "sort": "asc", "click": false },
    { "id": 3, "fdDisp": "기기명", "fdVal": "spgName", "sort": "asc", "click": false },
    { "id": 4, "fdDisp": "Panel 명", "fdVal": "panelName", "sort": "asc", "click": false },
    { "id": 5, "fdDisp": "시리얼 번호", "fdVal": "serialNo", "sort": "asc", "click": false },
    { "id": 6, "fdDisp": "담당자", "fdVal": "responsible", "sort": null, "click": false },
    { "id": 7, "fdDisp": "Report", "fdVal": "", "sort": null, "click": false },
    { "id": 8, "fdDisp": "진행 일자", "fdVal": "handlingDate", "sort": "asc", "click": false },
    { "id": 9, "fdDisp": "완료 일자", "fdVal": "completionDate", "sort": "asc", "click": false },
  ]);

  function handleServiceStatus(status) {
    if (isMobile) {
      if (serviceStatus === status) {
        setServiceStatus("");
      } else {
        setServiceStatus(status);
      }
    } else {
      setServiceStatus(status);
    }
    handleCurPage(0);
    setSearchText("");
    setSearchData({
      "searchField": null,
      "searchText": null,
    });
  }


  //검색 카운트별 검색 전체/요청/...
  let listPath = appPath;
  listPath = listPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;

  if (serviceStatus.length > 0) {
    listPath = listPath + `&serviceStatus=${serviceStatus}`;
  }
  //text검색
  if (searchData.searchField) {
    if (searchData.searchField.sfVal.length > 0) {
      listPath = listPath + `&searchKind=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
    }
  }
  //필드 정렬
  fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
    listPath = listPath + `&sort=${fd.fdVal},${fd.sort}`
  })


  useEffect(() => {
    // param 초기화
    let today = new Date();
    const startdate = new Date(new Date().setDate(today.getDate() - 365));
    document.getElementById("mcheck_date_1").click();
    document.getElementById("mcheck_date_4").click();
    setSearchCount(
      {
        "dateType": dateType,
        "dateTerm": dateTerm,
        "startDate": startdate,
        "endDate": today,
      }
    )
    setSearchText("");
    setSearchData({
      "searchField": null,
      "searchText": null,
    });
    setServiceStatus("");
    setSearchField(searchFieldList[0]);
    setSearchText("");
    setSearchData({
      "searchField": null,
      "searchText": null,
    });
    //handleCurPage(0);
    setPageInfo(defaultPageInfo);
    /*
      
    */
  }, [selTree])
  // dateKind 선택 시 초기화
  useEffect(() => {
    let today = new Date();
    const startdate = new Date(new Date().setDate(today.getDate() - 365));
    document.getElementById("mcheck_date_1").click();
    document.getElementById("mcheck_date_4").click();
    setSearchCount(
      {
        "dateType": dateType,
        "dateTerm": dateTerm,
        "startDate": startdate,
        "endDate": today,
      }
    )
    handleCurPage(0);
    setSearchText("");
    setSearchData({
      "searchField": null,
      "searchText": null,
    });
  }, [dateType]);


  const [listReload, setListReload] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/subzone/room/panel/item/workorder/count?${appPath}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree + appPath + listReload
    //watch: selTree.company.companyId+selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    if (retData) {
      setRecoilIsLoadingBox(false);
      const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
      if (ERR_URL.length > 0) {
        navigate(ERR_URL);
      }
      //setRecoilIsLoadingBox(false);
      //clog("IN WF EHC COUNT : RES : " + JSON.stringify(retData));
      if (retData.codeNum == CONST.API_200) {
        setEhcCount(retData.body);

        /*
        (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
          let data: any = null;
          //setRecoilIsLoadingBox(true);
          data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            //"appPath": `/api/v2/product/company/zone/subzone/room/panel/item/workorder?page=${pageInfo.number}&size=${pageInfo.size}&${listPath}`,
            "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/workorder?${listPath}`,
            appQuery: {
              //"serviceStatus":serviceStatus,
            },
            userToken: userInfo.loginInfo.token,
            //watch : listPath // useEffect에 조건을 달았음...
          });

          if (data) {
            setRecoilIsLoadingBox(false);
            const ERR_URL = HTTPUTIL.resultCheck(false, data);
            if (ERR_URL.length > 0) {
              CUTIL.sleep(500);
              navigate(ERR_URL);
            }
            if (data.codeNum == CONST.API_200) {
              clog("IN WF EHC LIST : RES : " + JSON.stringify(data.data.page));
              setEhcCount(retData.body);
              resetSearchCount(true); // reset
              setEhcList(data.body);
              setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10
              setParentNodata(data.data.page.totalElements);
            } else { // api if
              // need error handle -> goto system error page?
              setErrorList(data.body.errorList);
              alert(JSON.stringify(data.body.errorList));
            }
          }
        })();
        */
      } else {
        setErrorList(retData.body.errorList);
        alert(JSON.stringify(retData.body.errorList));
      }
    }
    //}, [selTree, retData, listPath])
  }, [retData, listPath])
  //////////////////

  // option 선택 시  값 변경 액션
  function selectOptionDateType(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    setDateType(JSON.parse(optionData));
    // init
    // resetSearchCount(false);
  }
  // option 선택 시  값 변경 액션
  function selectOptionDateTerm(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //
    const dt = JSON.parse(optionData);
    let today = new Date();
    const startdate = new Date(new Date().setDate(today.getDate() - dt.dtVal));
    if (dt.dtVal > 0) {
      setStartDate(startdate);
      setEndDate(today);
    } else {
      setStartDate(null);
      setEndDate(null);
    }
    setDateTerm(dt);
    setDateSel(dt.id);
    // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
    var dtDiv = document.querySelector("#mcheck_term__date");
    clog("MOBILE CHECK : DATE TERM : " + dtDiv.clientHeight + " X " + dtDiv.clientWidth);
    var isDtMobile = (dtDiv.clientHeight <= 0) && (dtDiv.clientWidth <= 0) ? true : false;

    if (isDtMobile) { // 검색이 되도록
      setSearchCount(
        {
          "dateType": dateType,
          "dateTerm": dt,
          "startDate": (dt.dtVal > 0) ? startdate : null,
          "endDate": (dt.dtVal > 0) ? today : null,
        }
      )

    }
  }

  // option 선택 시  값 변경 액션
  function selectOptionSearchField(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //
    var sf = JSON.parse(optionData);
    if (sf.sfVal.length <= 0) setSearchText("");
    setSearchField(JSON.parse(optionData));
    //
  }
  function doSearchCount() {
    setSearchCount(
      {
        /*
        "dateType" : (dateType)?dateType:(searchCount.dateType)?searchCount.dateType:dateTypeList[0],
        "dateTerm" : (dateTerm)?dateTerm:(searchCount.dateTerm)?searchCount.dateTerm:dateTermList[0],
        "startDate" : (startDate)?startDate:searchCount.startDate,
        "endDate" : (endDate)?endDate:searchCount.endDate,
        */
        "dateType": dateType,
        "dateTerm": dateTerm,
        "startDate": startDate,
        "endDate": endDate,
      }
    )
  }
  function onClickSearchCount(e) {
    if (!isCount) {
      if (startDate == null) {
        alert("시작일자를 입력하세요")
      } else if (endDate == null) {
        alert("종료일자를 입력하세요")
      } else {
        doSearchCount();
      }
    } else {
      doSearchCount();
    }
  }

  function onClickSortField(fieldVal) {
    handleCurPage(0);
    setFieldList(
      fieldList.map(fd =>
        (fd.fdVal === fieldVal)
          ? { ...fd, "sort": (fd.sort === "asc") ? "desc" : "asc", "click": true }
          : { ...fd, "sort": "asc", "click": false }) // 단일 필드 정렬만....
    );

  }

  ///
  useEffect(() => {
    setParentPopWin("pop-search-small",
      <MobilePopupSearch
        searchFieldList={searchFieldList}
        searchField={searchField}
        setSearchField={setSearchField}
        searchText={searchText}
        setSearchText={setSearchText}
        goSearch={goSearch}
      />
    );
  }) //re-rendering을 모바일 화면까지 전달하기 위해...
  function onClickSearch(e) {
    // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
    var schDiv = document.querySelector("#mcheck_searchinput");
    clog("MOBILE CHECK : TEXT SEARCH : " + schDiv.clientHeight + " X " + schDiv.clientWidth);
    var isSchMobile = (schDiv.clientHeight <= 0) && (schDiv.clientWidth <= 0) ? true : false;

    (isSchMobile) && setParentPopWin("pop-search-small",
      <MobilePopupSearch
        searchFieldList={searchFieldList}
        searchField={searchField}
        setSearchField={setSearchField}
        searchText={searchText}
        setSearchText={setSearchText}
        goSearch={goSearch}
      />
    );
    (isSchMobile) && CUTIL.jsopen_m3_Popup(e, isSchMobile);
    (!isSchMobile) && goSearch(e);
    handleCurPage(0);

  }

  function goSearch(e) {
    //clog("goSearch : " + JSON.stringify(searchField));
    handleCurPage(0);
    setSearchData({
      "searchField": searchField,
      "searchText": searchText,
    });
  }

  return (
    <>
      {/*<!--//area__left, 왼쪽 영역-->*/}
      <div className="area__right" style={{ "width": `${(isTreeOpen) ? "calc(100% - 320px)" : "calc(100% - 40px)"}` }}>
        <ul className="page-loca">
          <li>{selTree.company.companyName}</li>
          <li>{selTree.zone.zoneName}</li>
          {(selTree.subZone.subZoneId.length > 0) && <li>{selTree.subZone.subZoneName}</li>}
        </ul>
        {/*<!--검색영역-->*/}
        <div className="area__top">
          <div className="search">
            <ul className="form__input">
              <li>
                {/*<!--221024, label 클래스 추가및 태그 안 셀렉트로 변경-->*/}
                <label htmlFor="term" className="mt-0 ">
                  <div className="select noline" onClick={(e) => CUTIL.onClickSelect(e, selectOptionDateType)}>
                    <div className="selected">
                      {/*<div className="selected-value">{dateTypeList[0].dtDisp}</div>*/}
                      <div className="selected-value">{dateType.dtDisp}</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      {dateTypeList.map((dt, idx) => (
                        <li key={`dt_${idx.toString()}`}
                          className="option"
                          data-value={JSON.stringify(dt)}
                        >{dt.dtDisp}</li>
                      ))}
                    </ul>
                  </div>
                </label>
                {/*<!--221024, ml-8 클래스 추가-->*/}
                <div className="input__area ml-8">
                  {/*<!--searchterm 기간조회 클래스-->*/}
                  <div className="searchterm">
                    <div className="select term__month" onClick={(e) => CUTIL.onClickSelect(e, selectOptionDateTerm)}>
                      <div className="selected">
                        {/*<div id="mcheck_date" className="selected-value">{dateTermList[0].dtDisp}</div>*/}
                        <div id="mcheck_date" className="selected-value">{dateTerm.dtDisp}</div>
                        <div className="arrow"></div>
                      </div>
                      <ul>
                        {dateTermList.map((dt, idx) => (
                          <li key={`dt_${idx.toString()}`}
                            id={"mcheck_date_" + dt.id}
                            className="option"
                            data-value={JSON.stringify(dt)}
                          >{dt.dtDisp}</li>
                        ))}
                      </ul>
                    </div>
                    {/*clog("FE LANG : " + langs)*/}
                    <div className="term__date" id="mcheck_term__date">
                      <DatePicker
                        className="calendar w91"
                        locale={(langs === CONST.STR_LANG_CHA) ? zhCN : (langs === CONST.STR_LANG_ENG) ? enUS : ko}
                        todayButton="today"
                        dateFormat="yyyy-MM-dd"
                        selected={startDate}
                        maxDate={endDate}
                        // minDate={mintStartDate} //기간별 날짜 제한
                        onChange={(date) => setStartDate(date)}
                        onFocus={(e) => e.target.readOnly = true} //키보드 제거
                        readOnly={(dateSel != 0) ? true : false} //직접 입력 이외 입력 제한
                      />

                      <span className="centerline">~</span>
                      <DatePicker
                        className="calendar w91"
                        locale={(langs === CONST.STR_LANG_CHA) ? zhCN : (langs === CONST.STR_LANG_ENG) ? enUS : ko}
                        todayButton="today"
                        dateFormat="yyyy-MM-dd"
                        selected={endDate}
                        minDate={startDate}
                        // maxDate={maxEndDate} //기간별 날짜 제한
                        onChange={(date) => setEndDate(date)}
                        onFocus={(e) => e.target.readOnly = true} //키보드 제거
                        readOnly={(dateSel != 0) ? true : false} //직접 입력 이외 입력 제한
                      />
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <div ref={counteRef} className="btn__wrap">
              <button type="button" className="btn-search"
                onClick={(e) => onClickSearchCount(e)}
              >
                <span>{t("LABEL.조회")}</span>
              </button>
            </div>
          </div>
        </div>
        <h2 className="mb-24">
          e-HC Work Order
          <p className="txt-info fontRegular mt-8">* Work Order는 LS일렉트릭의 Engineer에게 e-HC [Premium] , [Advanced] 점검을 요청한 내역만 표시됩니다.</p>
        </h2>
        {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
        {(ehcCount) &&
          <div className="area__right_content">
            {/*<!--선택됐을때 div에 on 클래스 (221024, 액션 end 클래스 삭제,디자인변경됨) -->*/}
            <ul className="checkstatus-box">
              {/*"":ALL, Requested, accepted, ing, done */}
              <li>
                <div className={(serviceStatus === "") ? "on" : ""}>
                  <a href="#" onClick={(e) => handleServiceStatus("")}>
                    <p>{t("LABEL.전체")}</p>
                    <p><strong>{ehcCount.totalCount}</strong>ea</p>
                  </a>
                </div>
              </li>
              <li>
                <div className={(serviceStatus === "REQUESTED") ? "on" : ""}>
                  <a href="#" onClick={(e) => handleServiceStatus("REQUESTED")}>
                    <p>{t("LABEL.요청")}</p>
                    <p><strong>{ehcCount.requestCount}</strong>ea</p>
                  </a>
                </div>
                <div className={(serviceStatus === "ACCEPTED") ? "on" : ""}>
                  <a href="#" onClick={(e) => handleServiceStatus("ACCEPTED")}>
                    <p>{t("LABEL.접수")}</p>
                    <p><strong>{ehcCount.acceptedCount}</strong>ea</p>
                  </a>
                </div>
                <div className={(serviceStatus === "ING") ? "on" : ""}>
                  <a href="#" onClick={(e) => handleServiceStatus("ING")}>
                    <p>{t("LABEL.진행중")}</p>
                    <p><strong>{ehcCount.ingCount}</strong>ea</p>
                  </a>
                </div>
                <div className={(serviceStatus === "DONE") ? "on" : ""}>
                  <a href="#" onClick={(e) => handleServiceStatus("DONE")}>
                    <p>{t("LABEL.완료")}</p>
                    <p><strong>{ehcCount.doneCount}</strong>ea</p>
                  </a>
                </div>
              </li>
            </ul>
            <div className="tbl__top">
              <div className="right">
                <div className="searcharea">
                  <div className="searchinput" id="mcheck_searchinput">
                    <span>{t("LABEL.검색")}</span>
                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionSearchField)}>
                      <div className="selected">
                        {/*<div className="selected-value">{searchFieldList[0].sfDisp}</div>*/}
                        <div className="selected-value">{searchField.sfDisp}</div>
                        <div className="arrow"></div>
                      </div>
                      <ul>
                        {searchFieldList.map((sf, idx) => (
                          <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)}>{sf.sfDisp}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="input__direct">
                      <input type="text" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.검색어")])}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      {(searchText.length > 0) && <button type="button" className="btn btn-delete" onClick={(e) => setSearchText("")} >
                        <span className="hide">입력 창 닫기</span>
                      </button>}
                    </div>
                  </div>
                  <button type="button" className="btn-search js-open-m3"
                    data-pop="pop-search-small"
                    onClick={(e) => onClickSearch(e)}
                  >
                    <span>{t("LABEL.조회")}</span>
                  </button>
                </div>
              </div>
            </div>
            <EhealthCheckDetailList
              isMobile={isMobile}
              setIsMobile={props.setIsMobile}
              appPath={appPath}
              pageInfo={pageInfo}
              setPageInfo={setPageInfo}
              serviceStatus={serviceStatus}
              searchData={searchData}
              setNodata={props.setNodata}
              // resetSearchCount = {resetSearchCount}
              handleCurPage={handleCurPage}
              setPopWin={props.setPopWin}
            />
          </div>}
        <EhpPagination
          componentName={"WORKFLOW-EHC"}
          pageInfo={pageInfo}
          handleFunc={handleCurPage}
        />
        {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
      </div>
    </>
  )
};
export default EhealthCheckList;

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}

function EhealthCheckDetailList(props) {
  //trans
  const t = useTrans();
  const navigate = useNavigate();
  const mobileRef = useRef(null); // Mobile Check용
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props
  const isMobile = props.isMobile;
  const setParentIsMobile = props.setIsMobile;
  const appPath = props.appPath;
  const pageInfo = props.pageInfo;
  const setParentPageInfo = props.setPageInfo;
  const serviceStatus = props.serviceStatus;
  const searchData = props.searchData;
  const setParentNodata = props.setNodata;
  const resetParentSearchCount = props.resetSearchCount;
  const setParentCurPage = props.handleCurPage;
  const setParentPopWin = props.setPopWin;
  //
  const [ehcList, setEhcList] = useState([]);
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if (!CUTIL.isnull(mobileTag)) {
        if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
          setParentIsMobile(true);
        } else {
          setParentIsMobile(false);
        }
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);
  // isMobile 여부 랜더링 후 확인
  useDebounceEffect(
    async () => {
      if (mobileRef.current) {
        if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
          setParentIsMobile(true);
          var schDiv = document.querySelector("#mcheck_searchinput");

          var isSchMobile = (schDiv.clientHeight <= 0) && (schDiv.clientWidth <= 0) ? true : false;
        } else {
          setParentIsMobile(false);
        }
      }
    }, 100, [ehcList],
  )


  const [fieldList, setFieldList] = useState([
    { "id": 0, "fdDisp": "상태", "fdVal": "progressStatus", "sort": "asc", "click": false },
    { "id": 1, "fdDisp": "점검단계", "fdVal": "ehcStatus", "sort": null, "click": false },
    { "id": 2, "fdDisp": "요청 일자", "fdVal": "requestDate", "sort": "asc", "click": false },
    { "id": 3, "fdDisp": "기기명", "fdVal": "spgName", "sort": "asc", "click": false },
    { "id": 4, "fdDisp": "Panel 명", "fdVal": "panelName", "sort": "asc", "click": false },
    { "id": 5, "fdDisp": "시리얼 번호", "fdVal": "serialNo", "sort": "asc", "click": false },
    { "id": 6, "fdDisp": "담당자", "fdVal": "responsible", "sort": null, "click": false },
    { "id": 7, "fdDisp": "Report", "fdVal": "", "sort": null, "click": false },
    { "id": 8, "fdDisp": "진행 일자", "fdVal": "handlingDate", "sort": "asc", "click": false },
    { "id": 9, "fdDisp": "완료 일자", "fdVal": "completionDate", "sort": "asc", "click": false },
  ]);
  const [errorList, setErrorList] = useState([]);


  //검색 카운트별 검색 전체/요청/...
  let listPath = appPath;
  listPath = listPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;

  if (serviceStatus.length > 0) {
    listPath = listPath + `&serviceStatus=${serviceStatus}`;
  }
  //text검색
  if (searchData.searchField) {
    if (searchData.searchField.sfVal.length > 0) {
      listPath = listPath + `&searchKind=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
    }
  }
  //필드 정렬
  fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
    listPath = listPath + `&sort=${fd.fdVal},${fd.sort}`
  })


  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/subzone/room/panel/item/workorder?${listPath}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: listPath// + listReload
  });

  useEffect(() => {
    //setRecoilIsLoadingBox(true);
    if (retData) {
      setRecoilIsLoadingBox(false);
      const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
      if (ERR_URL.length > 0) {
        navigate(ERR_URL);
      }
      if (retData.codeNum == CONST.API_200) {
        clog("IN WF EHC LIST : RES : " + JSON.stringify(retData.data.page));
        //setEhcCount(retData.body);
        // resetParentSearchCount(true); // reset
        setEhcList(retData.body);
        setParentPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10
        setParentNodata(retData.data.page.totalElements);
      } else { // api if
        // need error handle -> goto system error page?
        setErrorList(retData.body.errorList);
        alert(JSON.stringify(retData.body.errorList));
      }
    }
    //}, [selTree, retData, listPath])
  }, [retData])

  function onClickSortField(fieldVal) {
    setParentCurPage(0);
    setFieldList(
      fieldList.map(fd =>
        (fd.fdVal === fieldVal)
          ? { ...fd, "sort": (fd.sort === "asc") ? "desc" : "asc", "click": true }
          : { ...fd, "sort": "asc", "click": false }) // 단일 필드 정렬만....
    );

  }

  // PDF 다운로드
  function onClickReportDownload(ehc) {
    HTTPUTIL.fileDownload_EhcReport(ehc.itemName, ehc.assessment.reportId, userInfo.loginInfo.token);
  }

  function onClickEhcDetailView(e, ehc) {
    // search 기준으로 모바일 태블릿 check
    var schDiv = document.querySelector("#mcheck_searchinput");

    var isSchMobile = (schDiv.clientHeight <= 0) && (schDiv.clientWidth <= 0) ? true : false;
    if (!isSchMobile) {
      var popupVal = e.target.getAttribute("data-pop");
      if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-list-ehcdetailview");

      popupVal = e.target.getAttribute("data-ds-height");
      if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "496");
    }

    setParentPopWin("pop-list-ehcdetailview",
      <MobileEhcDetailView
        htmlHeader={<h1>e-HC Work Order {t("LABEL.상세정보")}</h1>}
        ehcInfo={ehc}
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_m2_Popup(e, isMobile);
  }


  return (
    <>
      {/* <!--221026 데이터 없음--> */}
      <p className="nodata__txt ">
        {t("MESSAGE.데이터를찾을수없습니다")}
      </p>
      <div className="tbl-list hcal-vh-560">
        <table summary="상태,점검단계,요청 일자,접수번호, SPG 명,Panel 명,시리얼 번호,담당자,점검일자,Step,Report,진행 일자,완료 일자 항목으로 구성된 e-HC Work Order List 입니다.">
          <caption>
            e-HC Work Order List
          </caption>
          <colgroup>
            <col style={{}} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "progressStatus").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                onClick={(e) => onClickSortField("progressStatus")}
              >
                <span>{t("FIELD.상태")}</span>
              </th>
              <th scope="col" className="d-sm-none txt-left">
                <span>{t("FIELD.점검단계")}</span>
              </th>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "requestDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                onClick={(e) => onClickSortField("requestDate")}
              >
                <span>{t("FIELD.요청일자")}</span>
              </th>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "spgName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                onClick={(e) => onClickSortField("spgName")}
              >
                <span>{t("FIELD.기기명")}</span>
              </th>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "panelName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                onClick={(e) => onClickSortField("panelName")}
              >
                <span>{t("FIELD.Panel명")}</span>
              </th>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "serialNo").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-sm-none txt-left`}
                onClick={(e) => onClickSortField("serialNo")}
              >
                <span>{t("FIELD.시리얼번호")}</span>
              </th>
              <th scope="col"
                className="d-lm-none d-sm-none txt-left" ref={mobileRef}>
                <span>{t("FIELD.담당자")}</span>
              </th>
              <th scope="col" className="d-lm-none d-sm-none">
                <span>{t("FIELD.Report")}</span>
              </th>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "handlingDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                onClick={(e) => onClickSortField("handlingDate")}
              >
                <span>{t("FIELD.진행일자")}</span>
              </th>
              <th scope="col"
                className={`${fieldList.filter(fd => fd.fdVal === "completionDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                onClick={(e) => onClickSortField("completionDate")}
              >
                <span>{t("FIELD.완료일자")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ehcList.map((ehc, idx) => (
              <tr key={`tr_${idx.toString()}`}
                className="js-open-m2"
                data-pop="pop-list-ehcdetailview"/*pop-list-view*/
                onClick={(e) => onClickEhcDetailView(e, ehc)}
              >
                <td className="txt-left d-sm-none">{ehc.progressStatus}</td>
                <td className="d-sm-none txt-left">
                  {/*clog("XX : " + ehc.ehcStatus)*/}
                  <img src={require(`/static/img/icon_${(ehc.ehcStatus) ? ehc.ehcStatus[0].toLowerCase() : "x"}.png`)} style={{ "width": "24px", "height": "24px" }} alt={ehc.ehcStatus} />
                </td>
                <td className="txt-left d-sm-none">
                  {(ehc.requestDate) ? CUTIL.utc2formedstr(ehc.requestDate, "YYYY-MM-DD") : "-"}
                </td>
                <td className="txt-left">{ehc.spg.spgName}</td>
                <td className="txt-left"><p className="ellipsis">{ehc.panel.panelName}</p></td>
                <td className="d-sm-none txt-left"><p className="ellipsis">{(ehc.serialNo) ? ehc.serialNo : "-"}</p></td>
                <td className="d-lm-none d-sm-none txt-left">{ehc.responsible}</td>
                <td className="d-lm-none d-sm-none">
                  <button type="button" className="btn btn-file"
                    onClick={(e) => onClickReportDownload(ehc)}
                  >
                    <span className="hide">파일다운로드</span>
                  </button>
                </td>
                <td className="d-lm-none d-sm-none txt-left">
                  {(ehc.handlingDate) ? CUTIL.utc2formedstr(ehc.handlingDate, "YYYY-MM-DD") : "-"}
                </td>
                <td className="d-lm-none d-sm-none txt-left">
                  {(ehc.completionDate) ? CUTIL.utc2formedstr(ehc.completionDate, "YYYY-MM-DD") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MobileEhcDetailView(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const ehc = props.ehcInfo;
  const setParentPopWin = props.setPopWin;

  // PDF 다운로드
  function onClickReportDownload(ehc) {
    HTTPUTIL.fileDownload_EhcReport(ehc.itemName, ehc.assessment.reportId, userInfo.loginInfo.token);
  }

  function onClickClose(e) {
    CUTIL.jsclose_Popup("pop-list-ehcdetailview");
    setParentPopWin("pop-list-ehcdetailview", null);
  }

  return (
    <>
      {/*<!--리스트 상세 보기 팝업-->*/}
      <div className="popup__body">
        <div className="area__right_content workplace__info">
          <div className="content__info">
            <h3 className="hide">리스트 상세 정보</h3>
            <ul>
              <li>
                <p className="tit">{t("FIELD.상태")}</p>
                <p className="txt">{ehc.progressStatus}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.점검단계")}</p>
                <p className="txt">
                  <img src={require(`/static/img/icon_${(ehc.ehcStatus) ? ehc.ehcStatus[0].toLowerCase() : "x"}.png`)}
                    style={{ "width": "24px", "height": "24px" }} alt={ehc.ehcStatus} />
                </p>
              </li>
              <li>
                <p className="tit">{t("FIELD.요청일자")}</p>
                <p className="txt">{(ehc.requestDate) ? CUTIL.utc2formedstr(ehc.requestDate, "YYYY-MM-DD") : "-"}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.기기명")}</p>
                <p className="txt">{ehc.spg.spgName}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.Panel명")}</p>
                <p className="txt">{ehc.panel.panelName}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.시리얼번호")}</p>
                <p className="txt">{(ehc.serialNo) ? ehc.serialNo : "-"}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.담당자")}</p>
                <p className="txt">{ehc.responsible}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.Report")}</p>
                <div className="txt">
                  {/*<span>PDF</span>
                <button type="button"
                  className="btn btn-filedown"
                  onClick={(e)=>onClickReportDownload(ehc)}
                >
                  <span className="hide">삭제</span>
                </button>*/}

                  <ul className="filelist">
                    <li>
                      <span>PDF</span>
                      <button type="button" className="btn btn-filedown"
                        onClick={(e) => onClickReportDownload(ehc)}
                      >
                        <span className="hide">삭제</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
              <li>
                <p className="tit">{t("FIELD.진행일자")}</p>
                <p className="txt">{(ehc.handlingDate) ? CUTIL.utc2formedstr(ehc.handlingDate, "YYYY-MM-DD") : "-"}</p>
              </li>
              <li>
                <p className="tit">{t("FIELD.완료일자")}</p>
                <p className="txt">{(ehc.completionDate) ? CUTIL.utc2formedstr(ehc.completionDate, "YYYY-MM-DD") : "-"}</p>
              </li>
            </ul>
          </div>
          <div className="btn__wrap">
            <button type="button" className="js-close"
              onClick={(e) => onClickClose(e)}
            >
              <span>{t("LABEL.확인")}</span>
            </button>
          </div>
        </div>
      </div>
      {/*<!--//리스트 상세 보기 팝업-->*/}
    </>
  )
}


function MobilePopupSearch(props) {
  //trans
  const t = useTrans();
  //props
  const searchFieldList = props.searchFieldList;
  const searchField = props.searchField;
  const setParentSearchField = props.setSearchField;
  const searchText = props.searchText;
  const setParentSearchText = props.setSearchText;
  const goSearch = props.goSearch;

  //const [searchText, setSearchText] = useState("");
  // option 선택 시  값 변경 액션
  function selectOptionSearchField(optionElement) { // 확장 가능

    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //
    var sf = JSON.parse(optionData);
    if (sf.sfVal.length <= 0) setParentSearchText("");
    //if ( sf.sfVal.length <= 0 ) setSearchText("");
    setParentSearchField(sf);
    //
  }


  function onClickCancel(e) {
    CUTIL.jsclose_Popup("pop-search-small");
  }

  function handleGoSearch(e) {
    goSearch(e);
    CUTIL.jsclose_Popup("pop-search-small");
  }

  return (
    <>
      <div className="popup__body">
        <div className="form__input mb-0">
          <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionSearchField)}>
            <div className="selected">
              {/*<div className="selected-value">{searchFieldList[0].sfDisp}</div>*/}
              <div className="selected-value">{searchField.sfDisp}</div>
              <div className="arrow"></div>
            </div>
            <ul>
              {searchFieldList.map((sf, idx) => (
                <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)}>{sf.sfDisp}</li>
              ))}
            </ul>
          </div>
          <div className="input__direct">
            <input type="text" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.검색어")])}
              value={searchText}
              onChange={(e) => setParentSearchText(e.target.value)}
            />
            {(searchText.length > 0) && <button type="button" className="btn btn-delete" onClick={(e) => setParentSearchText("")} >
              <span className="hide">입력 창 닫기</span>
            </button>}
          </div>
        </div>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close"
          onClick={(e) => onClickCancel(e)}
        >
          <span>{t("LABEL.취소")}</span>
        </button>
        <button type="button"
          onClick={(e) => handleGoSearch(e)}
        >
          <span>{t("LABEL.적용")}</span>
        </button>
      </div>
    </>
  )
}