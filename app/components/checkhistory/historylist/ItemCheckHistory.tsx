/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-07-11
 * @brief EHP 진단점검 Report - List 개발
 *
 ********************************************************************/
import React, { useState, useEffect, useCallback, useRef } from "react";
//
import axios from 'axios';
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
import { loadingBoxState } from "../../../recoil/menuState";
import { langState } from "../../../recoil/langState";
//
import { useTrans } from "../../../utils/langs/useTrans";
//utils
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as FILEUTILS from "../../../utils/file/fileUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";

import clog from "../../../utils/logUtils"

//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
//datepicker 디자인 - 없으면 깨짐
import "react-datepicker/dist/react-datepicker.css";
//datepocker 언어
import { ko, enUS, zhCN, } from "date-fns/esm/locale";

//압축 다운로드
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { useNavigate } from "react-router-dom";
import EhpPagination from "../../common/pagination/EhpPagination";

//var zip = require('jszip')();

/**
 * @brief EHP 진단점검 Report List 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function ItemCheckHistory(props) {
  //trans
  const t = useTrans();
  //recoil
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //화면 이동
  const navigate = useNavigate();
  //props
  const setParentPopWin = props.setPopWin;
  const setParentCurHistoryData = props.setCurHistoryData;
  const setParentCurHistoryInfo = props.setCurHistoryInfo;
  const setResultOpen = props.setResultOpen;
  //tab
  const [tabItem, setTabItem] = useState([])
  const [curTab, setCurTab] = useState(null)
  const [curPos, setCurPos] = useState(0);
  const tabRef = useRef(null);

  const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  function handleCurPage(page) {
    setPageInfo({ ...pageInfo, number: page });
  }
  //세부사업장
  const [subZoneItem, setSubZoneItem] = useState([])
  const [subZoneSel, setSubZoneSel] = useState("");
  const [subZone, setSubZone] = useState("");

  //사이트
  const [roomItem, setRoomItem] = useState([]);
  const [roomSel, setRoomSel] = useState("")
  const [room, setRoom] = useState("")

  //spg
  const [spgItem, setSpgItem] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const mintStartDate = dayjs(endDate).set("year", dayjs(endDate).year() - 1).toDate(); // 종료일 기준 1년
  const maxEndDate = dayjs(startDate).set("year", dayjs(startDate).year() + 1).toDate(); // 시작일 기준 1년

  const [spg, setSpg] = useState([]);
  const [searchFilterList, setSearchFilterList] = useState([])

  const dateTermList = [
    { "id": 0, "dtDisp": "직접입력", "dtVal": 0 },
    { "id": 1, "dtDisp": t("LABEL.T1개월", ["1"]), "dtVal": 30 },
    { "id": 2, "dtDisp": t("LABEL.T1개월", ["3"]), "dtVal": 90 },
    { "id": 3, "dtDisp": t("LABEL.T1개월", ["6"]), "dtVal": 180 },
    { "id": 4, "dtDisp": t("LABEL.T1년", ["1"]), "dtVal": 365 },
  ];
  const [dateTerm, setDateTerm] = useState(dateTermList[0]);
  ///
  const [searchCount, setSearchCount] = useState({
    "startDate": null,
    "endDate": null,
  });
  const searchFieldList = [
    //{"id":0, "sfDisp":"전체", "sfVal":""},
    { "id": 1, "sfDisp": t("FIELD.모델명"), "sfVal": "itemName" },
    { "id": 2, "sfDisp": t("FIELD.시리얼번호"), "sfVal": "serialNo" },
    // { "id": 3, "sfDisp": t("FIELD.Panel명"), "sfVal": "panelName" },

  ];
  const [searchField, setSearchField] = useState(searchFieldList[0]);
  const [searchText, setSearchText] = useState("");
  const [searchData, setSearchData] = useState({
    "searchField": null,
    "searchText": null,
  });

  const [checkItem, setCheckItem] = useState([]);

  const [isMobile, setIsMobile] = useState(false);
  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
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
        if (pageInfo.totalElements <= 0) {
          setIsMobile(false);
        }
      } else {
        setIsMobile(false);
      }
    }
  }, [pageInfo]);


  // tab APi
  const { data: tab, isLoading } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: "/api/v2/product/zone/company",
    appQuery: {},
    userToken: userInfo.loginInfo.token,
  });



  useEffect(() => {
    if (tab) {
      // error page 이동
      const ERR_URL = HTTPUTIL.resultCheck(isLoading, tab);

      if (ERR_URL.length > 0) {
        setRecoilIsLoadingBox(false);
        navigate(ERR_URL);
      }
      if (tab.codeNum == 200) {
        setTabItem(tab.body);
        setCurTab(tab.body[0]);

      }
    }
  }, [tab])

  useEffect(() => {
    if (curTab) {
      let today = new Date();
      const startdate = new Date(new Date().setDate(today.getDate() - 365));
      onClickTab(curTab);
      setSubZoneSel("");
      setSubZone("");
      setRoomSel("");
      setRoom("");
      setSearchCount(
        {
          "startDate": startdate,
          "endDate": today,
        }
      )
    }
  }, [curTab])


  // tab 이동 액션
  function onClickTab(item) {
    setCurTab(item);
    handleCurPage(0)
    setParentCurHistoryData(null);
    setParentCurHistoryInfo(null);
    setSubZoneSel("");
    setSubZone("");
    setRoomSel("");
    setRoom("");
    resetSearchParams();
  }
  // 이전&다음 버튼 이벤트
  function next(idx) {
    setCurPos(idx + 1);
  }
  function prev(idx) {
    setCurPos(idx - 1);
  }
  //subZone 선택 및 Room API
  async function subZoneSle(e, zoneId) {
    CUTIL.onClickSelect(e, CUTIL.selectOption);
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/product/company/zone/${zoneId}`,
      /*     "appQuery": {
               "zoneId ": curTab.zoneId,
           },  */
      userToken: userInfo.loginInfo.token,
    })

    if (data) {
      if (data.codeNum == CONST.API_200) {
        setSubZoneItem(data.body)
      } else {
        alert(data.errorList.map((err) => (err.msg)));
      }
    }
  }

  // 세부사업장 셀텍트
  async function onClickSubZoneSelect(subZoneId) {

    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/product/company/zone/subzone/${subZoneId}`,
      userToken: userInfo.loginInfo.token,
    });
    if (data.codeNum == 200) {
      setRoomItem(data.body);
      setSubZoneSel(subZoneId);
    } else {
      alert(data.errorList.map((err) => (err.msg)))
    }
  }
  const [dateSel, setDateSel] = useState(null);
  // 날짜 기간조회
  function handleDayPop(days) {
    if (days.dtVal > 0) {
      const today = new Date();
      const newDay = new Date()
      //  clog(daySelected);
      setStartDate(newDay.setDate(today.getDate() - days.dtVal));
      setEndDate(today);

    } else {
      setStartDate(null);
      setEndDate(null);
    }
    setDateSel(days.id);
  }

  const { data: device } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: "/api/v2/product/company/zone/subzone/room/spgs",
    appQuery: {},
    userToken: userInfo.loginInfo.token,
  });

  useEffect(() => {
    if (device) {
      if (device.codeNum == CONST.API_200) {
        setSpgItem([
          { fname: t("LABEL.전체"), checked: true, val: "all" },
          { fname: device.body[0].spgName, checked: false, val: device.body[0].spgName },
          { fname: device.body[1].spgName, checked: false, val: device.body[1].spgName },
          { fname: device.body[2].spgName, checked: false, val: device.body[2].spgName },
          { fname: device.body[3].spgName, checked: false, val: device.body[3].spgName },
          { fname: device.body[4].spgName, checked: false, val: device.body[4].spgName },
          { fname: device.body[5].spgName, checked: false, val: device.body[5].spgName },
        ]);

      } else {
        alert(device.errorList.map((err) => (err.msg)));
      }
    }

  }, [device])


  const [filterList, setFilterList] = useState([
    { dname: t("LABEL.전체"), checked: true, val: "all" },
    { dname: "Basic", checked: false, val: "BASIC" },
    { dname: "Premium", checked: false, val: "PREMIUM" },
    { dname: "Advanced", checked: false, val: "ADVANCED" },

  ]);

  // 필터 이벤트
  function filterOpen(e) {
    // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
    var dtDiv = document.querySelector("#mcheck_term__date");
    var isDtMobile = (dtDiv.clientHeight <= 0) && (dtDiv.clientWidth <= 0) ? true : false;
    if (isDtMobile) {
      CUTIL.jsopen_Popup(e);
    } else {
      const targetElement = e.target as unknown as HTMLElement;
      const filterBox = targetElement.closest(".filter");
      if (CUTIL.isnull(filterBox)) return;
      //  clog(flieterLayer);
      // clog("filterOpen : " + filterBox.className);
      if (filterBox.classList.contains("open")) {
        filterBox.classList.remove("open"); // open
        setSpgItem(
          spgItem.map((filter) => (filter.fname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
        );
        setFilterList(
          filterList.map((filter) => (filter.dname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
        );

      } else {
        filterBox.classList.add("open"); // close
        setSearchFilterList([]);
        setSpg([]);
      }
      const changeBoxElements = document.querySelectorAll(".search-small");
      changeBoxElements.forEach((boxElement) => {
        boxElement.classList.remove("open");
        setSearchText("")
        setSearchData({
          "searchField": null,
          "searchText": null,
        })
      });
    }
  }



  //검색 이벤트
  function searchOpen(e) {
    // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
    var dtDiv = document.querySelector("#mcheck_term__date");
    var isDtMobile = (dtDiv.clientHeight <= 0) && (dtDiv.clientWidth <= 0) ? true : false;
    if (isDtMobile) {
      CUTIL.jsopen_Popup(e);

    } else {
      const targetElement = e.target as unknown as HTMLElement;
      const searchBox = targetElement.closest(".search-small");
      if (CUTIL.isnull(searchBox)) return;


      if (searchBox.classList.contains("open")) {
        searchBox.classList.remove("open"); // close
        setSearchText("")
        setSearchData({
          "searchField": null,
          "searchText": null,
        });

      } else {
        searchBox.classList.add("open"); //

      }
      const changeBoxElements = document.querySelectorAll(".filter");
      changeBoxElements.forEach((boxElement) => {
        boxElement.classList.remove("open");

        setSpgItem(
          spgItem.map((filter) => (filter.fname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
        );
        setFilterList(
          filterList.map((filter) => (filter.dname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
        );
      });
    }
  };
  function handleClickSpgFilter(filterVal) {
    if (filterVal === "전체") {
      setSpgItem(
        spgItem.map((filter) => (filter.fname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
      )

    } else { // 개별
      setSpgItem(
        spgItem.map((filter) => (filter.fname === "전체") ? { ...filter, checked: false } : (filter.fname === filterVal) ? { ...filter, checked: !filter.checked } : filter));
    }
  }

  function handleClickSearchFilter(filterVal) {
    if (filterVal === "전체") {
      setFilterList(
        filterList.map((filter) => (filter.dname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
      );

    } else { // 개별
      setFilterList(
        filterList.map((filter) => (filter.dname === "전체") ? { ...filter, checked: false } : (filter.dname === filterVal) ? { ...filter, checked: !filter.checked } : filter));
    }
  }


  function doSearchCount() {
    setSearchCount(
      {
        "startDate": startDate,
        "endDate": endDate,
      }
    )
  }
  function onClickSearchFilter(e) {
    // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
    var dtDiv = document.querySelector("#mcheck_term__date");
    var isDtMobile = (dtDiv.clientHeight <= 0) && (dtDiv.clientWidth <= 0) ? true : false;
    if (startDate == null) {
      alert("시작일자를 입력하세요")
    } else if (endDate == null) {
      alert("종료일자를 입력하세요")
    } else {
      handleCurPage(0);
      setSubZone(subZoneSel);
      setRoom(roomSel);
      // search시 필터 적용
      setSpg(
        spgItem.filter((filter) => filter.checked)
      )
      setSearchFilterList(
        filterList.filter((filter) => filter.checked)
      );
      doSearchCount();
      if (isDtMobile) {
        CUTIL.jsclose_Popup("pop-filter");
        handleCurPage(0)
        setSearchText("");
        setSearchField(searchFieldList[0]);
        setSearchData({
          searchField: "",
          searchText: ""
        });
      }
    }
  }


  function resetSearchParams() {
    handleCurPage(0)
    document.getElementById("subZone").click();
    document.getElementById("subZoneAll").click();
    document.getElementById("room").click();
    document.getElementById("roomAll").click();
    document.getElementById("date").click();
    document.getElementById("date_4").click();
    document.getElementById("subZoneM").click();
    document.getElementById("subZoneAllM").click();
    document.getElementById("roomM").click();
    document.getElementById("roomAllM").click();
    document.getElementById("dateM").click();
    document.getElementById("dateM_4").click();
    setSubZoneSel("");
    setSubZone("");
    setRoomSel("");
    setRoom("");;
    setSearchText("");
    setSearchField(searchFieldList[0]);
    setSearchData({
      searchField: "",
      searchText: ""
    });

    setSearchFilterList([]);
    setSpg([]);
    setSpgItem(
      spgItem.map((filter) => (filter.fname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
    );
    setFilterList(
      filterList.map((filter) => (filter.dname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
    );
  }



  function onClickGoSearch(e) {
    // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
    var dtDiv = document.querySelector("#mcheck_term__date");
    var isDtMobile = (dtDiv.clientHeight <= 0) && (dtDiv.clientWidth <= 0) ? true : false;

    handleCurPage(0)
    setSearchData({
      searchField: searchField,
      searchText: searchText
    });

    if (isDtMobile) {
      CUTIL.jsclose_Popup("pop-search-small");
      handleCurPage(0)
      document.getElementById("subZone").click();
      document.getElementById("subZoneAll").click();
      document.getElementById("room").click();
      document.getElementById("roomAll").click();
      document.getElementById("date").click();
      document.getElementById("date_4").click();
      document.getElementById("subZoneM").click();
      document.getElementById("subZoneAllM").click();
      document.getElementById("roomM").click();
      document.getElementById("roomAllM").click();
      document.getElementById("dateM").click();
      document.getElementById("dateM_4").click();
      setSubZoneSel("");
      setSubZone("");
      setRoomSel("");
      setRoom("");;
      setSearchFilterList([]);
      setSpg([]);
      setSpgItem(
        spgItem.map((filter) => (filter.fname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
      );
      setFilterList(
        filterList.map((filter) => (filter.dname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
      );
    }
  }

  //MobileFliter
  useEffect(() => {
    setParentPopWin("pop-filter",
      <MobileFilter
        curTab={curTab}
        onClickSubZoneSelect={onClickSubZoneSelect}
        subZoneItem={subZoneItem}
        setRoomSel={setRoomSel}
        roomItem={roomItem}
        dateTermList={dateTermList}
        handleDayPop={handleDayPop}
        dateSel={dateSel}
        langs={langs}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        mintStartDate={mintStartDate}
        maxEndDate={maxEndDate}
        spgItem={spgItem}
        filterList={filterList}
        handleClickSpgFilter={handleClickSpgFilter}
        handleClickSearchFilter={handleClickSearchFilter}
        onClickSearchFilter={onClickSearchFilter}
      />
    )
  })
  //MobileSearch
  useEffect(() => {
    setParentPopWin("pop-search-small",
      <MobileSEarch
        t={t}
        searchFieldList={searchFieldList}
        setSearchField={setSearchField}
        searchText={searchText}
        setSearchText={setSearchText}
        onClickGoSearch={onClickGoSearch}
      />
    );
  })




  function handleZipDownload(e) {
    //const [zipList, setZipList] = useState([]);
    let zipList = [];
    let zips = new JSZip();
    let zipCnt = 0;
    const zipFileName = "진단점검리포트.zip"
    checkItem.map(async (list, idx) => {
      //await sleep(5000);
      await getSecondFileUrl(zipList, list).then((val) => {
        //clog("getSecondFileUrl : " + JSON.stringify(val));
        if (val.codeNum === 200) {
          //setZipList([...zipList.concat({"fileName" : `${list.itemReportDtoOut.itemName}_진단점검리포트.PDF`, "fileLink" : data.body.fileLink})]);
          zipList = zipList.concat({ "fileName": `${list.itemReportDtoOut.itemName + "_" + idx}_진단점검리포트.PDF`, "fileLink": val.body.fileLink })
        }
        return { "codeNum": val.codeNum, "fileName": `${list.itemReportDtoOut.itemName + "_" + idx}_진단점검리포트.PDF`, "fileLink": val.body.fileLink };
      }).then((val) => {
        if (val.codeNum === 200) {
          axios({
            method: "GET",
            url: val.fileLink,
            responseType: "blob",
          }).then((resp) => {
            zips.file(val.fileName, resp.data);
            zipCnt++;
            return zipCnt;
          }).then((zipCnt) => {
            if (zipCnt === checkItem.length) {
              //FILEUTILS.saveToFile_Chrome(fileName, response.data);
              zips.generateAsync({ type: "blob" }).then(
                function (blob) {
                  FILEUTILS.saveToFile_Chrome(zipFileName, blob);
                }
              );
            }
          });
        }
      });
    })
  }


  //const [zipList, setZipList] = useState([]);
  async function getSecondFileUrl(zipList, list) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/report/${list.reportId}`,
      "appQuery": {
      },
      userToken: userInfo.loginInfo.token,
    });

    return data;
  }


  //result page
  function getResultBtn(e, list) {
    setParentCurHistoryData(list.assessmentId);
    setParentCurHistoryInfo(list)
    setResultOpen(true);
  }




  return (
    <>
      {/*<!--그리드 영역 -->*/}
      <article className={`box list ${(isLoadingBox) ? "loading__box" : ""} `} >
        {/*<!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 -->*/}
        <div className={`box__body ${(pageInfo.totalElements <= 0) ? "nodata" : ""}`}>
          {/*<!--슬라이드 탭 영역-->*/}
          <section className="swiper-section" style={{ "cursor": "pointer" }}>
            <div className="swiper-container mySwiper">
              <div className="swiper-wrapper">
                {/*<!--선택된 탭에 on 클래스 자동 생성, 첫번째 탭에는 on 넣기(기본 선택 탭)-->*/}
                {(tabItem) && tabItem.filter((tab, idx) => (idx >= curPos) && ((idx < tabItem.length))).map((tab) => (
                  <div ref={tabRef} key={tab.zoneId} data-value={tab.zoneId}
                    className={`swiper-slide tab ${(curTab.zoneId === tab.zoneId) ? "on" : ""}`} data-tab={tab.zoneId}
                    onClick={(e) => onClickTab(tab)}>
                    <p>{tab.company.companyName + " " + tab.zoneName}</p>
                  </div>
                ))}
              </div>
            </div>
            {(tabItem.length >= 5) &&
              <div className="swiper-navigation">
                {(curPos > 0) ?
                  <div className="swiper-button-prev" onClick={(e) => prev(curPos)}></div>
                  :
                  <div className="swiper-button-prev  swiper-button-disabled" aria-disabled ></div>
                }
                {((curPos + 3) < tabItem.length) ?
                  <div className="swiper-button-next" onClick={(e) => next(curPos)}></div>
                  :
                  <div className="swiper-button-next swiper-button-disabled" aria-disabled></div>
                }
              </div>
            }
          </section>

          {/*<!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출-->*/}
          <div className="d-sm-tab">
            <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
              <div className="selected">
                <div className="selected-value">{(curTab) && curTab.company.companyName + " " + curTab.zoneName}</div>
                <div className="arrow"></div>
              </div>
              <ul>
                {(tabItem) && tabItem.map((tab, idx) => (
                  <li key={"tab_" + idx.toString()} className={`option tab tab ${(curTab.zoneId === tab.zoneId) ? "on" : ""} `}
                    data-tab="tab-1" onClick={(e) => onClickTab(tab)}>{tab.company.companyName + " " + tab.zoneName}</li>
                ))}
              </ul>
            </div>
          </div>

          {/*<!--탭별  내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
          <div id="tab-1" className="tabcontent current">
            {/*<!-- Tab1 내용 -->*/}
            {/*<!--tabcontent__top-->*/}
            <div className="tabcontent__top">
              <div className="search">
                {(curTab) &&
                  < SubZoneSearch
                    setSubZoneItem={setSubZoneItem}
                    curTab={curTab}
                    onClickSubZoneSelect={onClickSubZoneSelect}
                    subZoneItem={subZoneItem}
                    setRoomSel={setRoomSel}
                    roomItem={roomItem}
                    dateTermList={dateTermList}
                    handleDayPop={handleDayPop}
                    langs={langs}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    dateSel={dateSel}
                  />
                }
                <div className="btn__wrap">
                  <button type="button" className="btn-search" onClick={(e) => onClickSearchFilter(e)}><span>{t("LABEL.조회")}</span></button>
                </div>
              </div>
              {/*<!--filter-->*/}
              {/*<!--220627, js-open 클래스 추가 및 data-pop추가 -->*/}
              <div className="filter js-open-m" data-pop="pop-filter" >
                <p className="title " data-pop="pop-filter" onClick={(e) => filterOpen(e)}>
                  <span data-pop="pop-filter">Filter</span>
                  <button type="button" className="btn btn-close"><span className="hide">filter 닫기</span></button>
                  <span className="info">* 창을 닫으면 Filter는 초기화 됩니다.</span>
                </p>
                <div className="filter__select">
                  <div className="filter__type">
                    <p className="tit">{t("LABEL.기기유형")}</p>
                    <ul className="type__cont">
                      {/*<!-- 선택시 on 클래스 붙여주세요~ -->*/}
                      {/* <li className={`${((spg) && spg.filter((device) => (device.spgId)).length <= 0) ? "on" : ""}`} onClick={(e) => filterClick("")}><a href="#" href="#">전체</a></li> */}
                      {(spgItem) && spgItem.map((filter, idx) => (
                        <li key={"spg_" + idx.toString()}
                          className={(filter.checked) ? "on" : ""}

                          onClick={(e) => handleClickSpgFilter(filter.fname)}
                        >
                          <a href="#" >{filter.fname}</a>
                        </li>
                      ))}

                    </ul>
                  </div>
                  <div className="filter__type">
                    <p className="tit">{t("FIELD.점검단계")}</p>
                    <ul className="type__cont">
                      {/*<!-- 선택시 on 클래스 붙여주세요~ -->*/}
                      {filterList.map((filter, idx) => (
                        <li key={"chk_" + idx.toString()} className={(filter.checked) ? "on" : ""}
                          data-value={filter.dname}
                          onClick={(e) => handleClickSearchFilter(filter.dname)}
                        >
                          <a href="#" >{filter.dname}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/*<!--search-small-->*/}
              {/*<!--220628, js-open 클래스 추가 및 data-pop추가 -->*/}
              <div className="search-small js-open-m" data-pop="pop-search-small">
                <p className="title" data-pop="pop-search-small" onClick={(e) => searchOpen(e)}>
                  <span data-pop="pop-search-small">{t("LABEL.검색")}</span>
                  <button type="button" className="btn btn-close"><span className="hide">{t("LABEL.검색")} 닫기</span></button>
                </p>
                <div className="search__cont">
                  <div className="searcharea">
                    <div className="searchinput">
                      <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
                        <div className="selected">
                          <div className="selected-value">{searchFieldList[0].sfDisp}</div>
                          <div className="arrow"></div>
                        </div>
                        <ul>
                          {searchFieldList.map((sf, idx) => (
                            <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)}
                              onClick={(e) => setSearchField(sf)}>
                              {sf.sfDisp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <input type="text" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.검색어")])}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                    {/* <input type="text" className="d-sm-block-toggle" placeholder="기기명을 입력하세요." /> */}
                    <button type="button" className="btn btn-delete"><span className="hide">입력 창 닫기</span></button>
                    <button type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>{t("LABEL.조회")}</span></button>
                  </div>
                </div>
              </div>
              {/*<!--220627 추가-->*/}
              {((spgItem.filter((filter) => (filter.checked) && (filter.fname !== "전체")).length > 0) || (filterList.filter((filter) => (filter.checked) && (filter.dname !== "전체")).length > 0) || (searchText.length > 0))
                ? <button type="button" className="btn-renew" onClick={resetSearchParams}><span>{t("LABEL.필터초기화")}</span></button>
                : <button type="button" className="btn-renew" disabled><span>{t("LABEL.필터초기화")}</span></button>
              }
            </div>
            {/*<!--//tabcontent__top-->*/}

            {/*<!-- 리스트 위 항목 -->*/}

            <div className="tbl__top" id="mcheck_term__date">
              {(pageInfo.totalElements > 0) &&
                <div className="right">
                  {(checkItem.length > 0) ?
                    <button type="button" className="btn-basic" onClick={(e) => handleZipDownload(e)}><span>Report Download</span></button>
                    :
                    // 체크 없을 시 disabled 처리
                    <button type="button" className="btn-basic " disabled ><span>Report Download</span></button>
                  }
                </div>
              }
            </div>

            {/*<!--220602, 데이터 없는 경우 아래 p 태그 위치 수정됨 테이블 위로 -->*/}
            {(pageInfo.totalElements <= 0) &&
              <p className="nodata__txt">{t("MESSAGE.데이터를찾을수없습니다")}</p>
            }
            {/*<!-- 기본 리스트 형식 테이블, 기본 중앙정렬, td가 전체적으로 좌측일 경우 tbl-list에 txt-left 클래스 추가, 우측일때 txt-right추가 -->*/}
            {(curTab) &&
              <ItemCheckHistoryView
                curTab={curTab}
                mobileRef={mobileRef}
                isMobile={isMobile}
                setParentPopWin={setParentPopWin}
                pageInfo={pageInfo}
                setPageInfo={setPageInfo}
                getResultBtn={getResultBtn}
                checkItem={checkItem}
                setCheckItem={setCheckItem}
                subZone={subZone}
                room={room}
                spg={spg}
                searchFilter={searchFilterList}
                searchTextField={searchData}
                handleCurPage={handleCurPage}
                searchCount={searchCount}

              />
            }
            {/*<!--220530, 검색결과건수와 페이징 감싸는 tbl__bottom 추가됨 -->*/}
            {(pageInfo) && <EhpPagination
              componentName={"HISTYORY"}
              pageInfo={pageInfo}
              handleFunc={handleCurPage}
            />
            }
          </div>
        </div>
        {/*<!--// .box__body-->*/}
      </article>
      {/*<!-- //search 팝업 -->*/}



    </>
  )
}

export default ItemCheckHistory;

function SubZoneSearch(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const {
    setSubZoneItem,
    curTab,
    onClickSubZoneSelect,
    subZoneItem,
    setRoomSel,
    roomItem,
    dateTermList,
    handleDayPop,
    langs,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    dateSel,
  } = props;


  // tab APi
  const { data: data } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/${curTab.zoneId}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token,
    watch: curTab.zoneId
  })

  useEffect(() => {
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setSubZoneItem(data.body)
      } else {
        alert(data.errorList.map((err) => (err.msg)));
      }
    }

  }, [data])

  return (
    <>
      <ul className="form__input">
        <li>
          <label htmlFor="company">{t("FIELD.상세사업장")}</label>
          <div className="input__area">
            <div id={"subZone"} className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
              {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
              <div className="selected">
                <div className="selected-value">{t("FIELD.전체")}</div>
                <div className="arrow"></div>
              </div>
              <ul>
                <li id="subZoneAll" className="option" onClick={(e) => onClickSubZoneSelect(e)}  >{t("FIELD.전체")}</li>
                {(subZoneItem) && subZoneItem.map((data) => (
                  <li key={data.subZoneId} className="option" onClick={(e) => onClickSubZoneSelect(data.subZoneId)}>{data.subZoneName}</li>
                ))}
              </ul>
            </div>
          </div>
        </li>
        <li>
          <label htmlFor="site">{t("LABEL.전기실")}</label>
          <div className="input__area">
            <div id="room" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
              {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
              <div className="selected">
                <div className="selected-value">{t("FIELD.전체")}</div>
                <div className="arrow"></div>
              </div>
              <ul>
                <li id="roomAll" className="option" onClick={(e) => setRoomSel("")} >{t("FIELD.전체")}</li>
                {(roomItem) && roomItem.map((data) => (
                  <li key={data.roomId} className="option" onClick={(e) => setRoomSel(data.roomId)}>{data.roomName}</li>
                ))}
              </ul>
            </div>
          </div>
        </li>
        <li>
          <label htmlFor="term">{t("LABEL.조회기간")}</label>
          <div className="input__area">
            {/*<!--searchterm 기간조회 클래스-->*/}
            <div className="searchterm">
              <div id="date" className="select term__month" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                <div className="selected">
                  {/*<div className="selected-value">{(dateTerm)?dateTerm.dtDisp:(searchCount.dateTerm)?searchCount.dateTerm.dtDisp:dateTermList[0].dtDisp}</div>*/}
                  <div className="selected-value">{dateTermList[0].dtDisp}</div>
                  <div className="arrow"></div>
                </div>
                <ul>
                  {dateTermList.map((dt, idx) => (
                    <li id={"date_" + dt.id} key={`dt_${idx.toString()}`}
                      className="option"
                      onClick={(e) => handleDayPop(dt)}
                    >{dt.dtDisp}</li>
                  ))}
                </ul>
              </div>
              <div className="term__date">
                <DatePicker
                  id="dp655863510467"
                  // className="calendar w91"
                  locale={(langs === CONST.STR_LANG_CHA) ? zhCN : (langs === CONST.STR_LANG_ENG) ? enUS : ko}
                  todayButton="today"
                  dateFormat="yyyy-MM-dd"
                  selected={startDate}
                  maxDate={endDate}
                  // minDate={mintStartDate}
                  onChange={(date) => setStartDate(date)}
                  // onFocus={(e) => e.target.readOnly = (isMobile) && true} // 모바일 키보드 제거
                  // withPortal={(isMobile) && true}
                  onFocus={(e) => e.target.readOnly = true} //키보드 제거
                  readOnly={(dateSel != 0) ? true : false} //직접 입력 이외 입력 제한

                />

                <span className="centerline">~</span>
                <DatePicker
                  // className="calendar w91"
                  id="dp1655863510468"
                  locale={(langs === CONST.STR_LANG_CHA) ? zhCN : (langs === CONST.STR_LANG_ENG) ? enUS : ko}
                  todayButton="today"
                  dateFormat="yyyy-MM-dd"
                  selected={endDate}
                  minDate={startDate}
                  // maxDate={maxEndDate}
                  onChange={(date) => setEndDate(date)}
                  onFocus={(e) => e.target.readOnly = true} // 키보드 제거
                  readOnly={(dateSel != 0) ? true : false} //직접 입력 이외 입력 제한
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </>
  )
}


function ItemCheckHistoryView(props) {
  //trans
  const t = useTrans();
  //recoil
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //화면 이동
  const navigate = useNavigate();
  //props
  const mobileRef = props.mobileRef;
  const isMobile = props.isMobile;
  const curTab = props.curTab;
  const pageInfo = props.pageInfo;
  const setPageInfo = props.setPageInfo;
  const getResultBtn = props.getResultBtn;
  const checkItem = props.checkItem;
  const setCheckItem = props.setCheckItem;
  const handleCurPage = props.handleCurPage;
  const subZone = props.subZone;
  const room = props.room;
  const searchSpg = props.spg;
  const searchFilter = props.searchFilter;
  const searchTextField = props.searchTextField;
  const searchCount = props.searchCount;
  const setParentPopWin = props.setParentPopWin;

  let appPath = curTab.zoneId
  // device List API
  appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;

  if (!CUTIL.isnull(subZone) && (subZone.length > 0)) {
    appPath = appPath + '&subZoneId=' + subZone;
    // clog("필터 상세사업장 : " + appPath);
  }
  if (!CUTIL.isnull(room) && (room.length > 0)) {
    appPath = appPath + '&roomId=' + room;
    // clog("필터 사이트 : " + appPath);
  }
  if ((!CUTIL.isnull(searchCount.startDate)) && (!CUTIL.isnull(searchCount.startDate))) {
    appPath = appPath
      + `&startDate=${CUTIL.date2formedstr(searchCount.startDate, "yyyyMMdd")}`
      + `&endDate=${CUTIL.date2formedstr(searchCount.endDate, "yyyyMMdd")}`
  }


  //text검색
  if (searchTextField.searchField) {
    if (searchTextField.searchField.sfVal.length > 0) {
      //appPath = appPath + `&searchKind=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
      appPath = appPath + `&${searchTextField.searchField.sfVal}=` + searchTextField.searchText;
    }
  } else {
    let spgFilter = "";
    searchSpg.filter((filter) => (filter.checked === true) /* && (filter.fname !== "전체") */).map((filter, idx) => {
      if (idx > 0) spgFilter = spgFilter + ","
      spgFilter = spgFilter + filter.val;
    })
    if (!CUTIL.isnull(spgFilter) && spgFilter.length > 0 /* && spgFilter != "전체" */) {
      appPath = appPath + "&spgList=" + spgFilter;
    }
    let strFilter = "";
    searchFilter.filter((filter) => (filter.checked === true)/*  && (filter.dname !== "전체") */).map((filter, idx) => {
      if (idx > 0) strFilter = strFilter + ","
      strFilter = strFilter + filter.val;
    })
    if (!CUTIL.isnull(strFilter) && strFilter.length > 0/*  && strFilter != "전체" */) {
      appPath = appPath + "&stepList=" + strFilter;
    }

  }

  //table
  const [historyData, setHistoryData] = useState([]);

  const { data: data, isLoading } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/assessments?page=${pageInfo.number}&size${pageInfo.size}&zoneId=${appPath}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token,
    watch: appPath
  });

  useEffect(() => {
    if (data) {
      const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);

      if (ERR_URL.length > 0) {
        setRecoilIsLoadingBox(false);
        navigate(ERR_URL);
      }
      if (data.codeNum == CONST.API_200) {
        setHistoryData(data.body);
        setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10
      } else {

        alert(data.errorList.map((err) => (err.msg)));
      }
    }

  }, [data])


  //chcek
  const checkedAll = useCallback((checked) => {
    if (checked) {
      const checkedArray = [];

      historyData.forEach((list) => { checkedArray.push(list) });
      setCheckItem(checkedArray);

    } else {
      setCheckItem([]);

    }
  }, [historyData])

  //checkbox
  const checkedList = useCallback((checked, list) => {
    if (checked) {
      setCheckItem([...checkItem, list]);

    } else {
      setCheckItem(checkItem.filter((el) => el !== list));

    }
  }, [checkItem])



  //상세 정보
  function listView(e, list) {
    setParentPopWin("pop-list-view",
      <MobileListView
        htmlHeader={<h1>진단점검 리포트 상세정보</h1>}
        list={list}

      />
    )
    CUTIL.jsopen_m_Popup(e)
  }



  return (
    <>
      <div className="tbl-list">
        <table summary="선택, 점검단계,사업장,사이트,유형,기기명,제조번호,담당자,점검일자,평가점수,Report,Memo,점검 결과 항목으로 구성된 Report-List 입니다.">
          <caption>
            Report-List
          </caption>
          <colgroup>
            <col style={{}} />
          </colgroup>
          {/*<!--220627, 탭 사이즈에서 삭제되는 부분 class="d-lm-none" 추가 (thead, tbody 전체확인)-->*/}
          {/*<!--220628, 1522,탭 사이즈에서 삭제되는 부분 class="d-mm-none", class="d-lm-none" 추가 정리 (thead, tbody 전체확인)-->*/}
          {/*<!--220628, 모바일 사이즈에서 삭제되는 부분 class="d-sm-none" 추가 (thead, tbody 전체확인)-->*/}
          <thead>
            <tr>
              <th scope="col" className="d-mm-none">
                <input type="checkbox" id="t_all" checked={checkItem.length === 0 ? false : checkItem.length === historyData.length ? true : false}
                  onChange={(e) => checkedAll(e.target.checked)} /><label htmlFor="t_all"><span className="hide">선택</span></label>
              </th>
              <th scope="col"><span>{t("FIELD.점검단계")}</span></th>
              <th scope="col" className="txt-left d-sm-none"><span>{t("FIELD.상세사업장")}</span></th>
              <th scope="col" className="txt-left d-sm-none"><span>{t("FIELD.전기실")}</span></th>
              {/* <th scope="col" className="txt-left d-lm-none"><span>유형</span></th> */}
              <th scope="col" className="txt-left d-lm-none"><span>{t("FIELD.기기명")}</span></th>
              {/* <th scope="col" className="txt-left"><span>기기 명</span></th> */}
              <th scope="col" className="txt-left"><span>{t("FIELD.모델명")}</span></th>
              <th scope="col" className="txt-left d-mm-none"><span>{t("FIELD.시리얼번호")}</span></th>
              <th scope="col" className="txt-left d-mm-none"><span>{t("FIELD.담당자")}</span></th>
              <th scope="col" className="txt-left"><span>{t("FIELD.점검일자")}</span></th>
              <th scope="col" className="txt-left d-lm-none"><span>{t("FIELD.평가점수")}</span></th>
              <th ref={mobileRef} scope="col" className="d-mm-none"><span>{t("FIELD.Report")}</span></th>
              <th scope="col" className="d-lm-none"><span>{t("FIELD.Memo")}</span></th>
              <th scope="col" className="txt-left"><span>{t("FIELD.점검결과")}</span></th>
            </tr>
          </thead>
          <tbody>
            {(historyData) && historyData.map((list, idx) => (
              <tr key={"check" + idx}>
                <td className="d-mm-none">
                  <input type="checkbox" id={"t_" + idx} checked={checkItem.includes(list) ? true : false}
                    onChange={(e) => checkedList(e.target.checked, list)} /><label htmlFor={"t_" + idx} ><span className="hide">선택</span></label>
                </td>
                {/* <!--220628, B, P, A 아이콘 ehc-b, ehc-p, ehc-a--> */}
                <td className={`${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>
                  <span className={`checkstep ${(list.checkStepDto.name === "BASIC") ? "ehc-b" : (list.checkStepDto.name === "PREMIUM") ? "ehc-p" : (list.checkStepDto.name === "ADVANCED") ? "ehc-a" : ""}`}>
                    {(list.checkStepDto.name === "BASIC") ? "B" : (list.checkStepDto.name === "PREMIUM") ? "P" : (list.checkStepDto.name === "ADVANCED") ? "A" : ""}
                  </span>
                </td>

                {/* <td className="txt-left d-sm-none">{list.itemReportDtoOut.itemId.split(":")[2]}</td>
                            <td className="txt-left d-sm-none">{list.itemReportDtoOut.itemId.split(":")[3]}</td> */}
                <td className={`txt-left d-sm-none ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>{list.subZoneName}</td>
                <td className={`txt-left d-sm-none ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>{list.roomName}</td>
                <td className={`txt-left d-lm-none ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>{list.spgDto.name}</td>
                <td className={`txt-left ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>{list.itemReportDtoOut.itemName}</td>
                {/* <td className="txt-left d-mm-none"><p className="ellipsis">{list.itemReportDtoOut.serialNo}</p></td> */}
                <td className={`txt-left d-mm-none ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>
                  <p className="ellipsis">
                    <span className="tooltip">
                      {/* <!--기존 내용--> */}
                      {list.itemReportDtoOut.serialNo}
                      {/* <!--툴팁 내용--> */}
                      <span className="tooltip-text">{list.itemReportDtoOut.serialNo}</span>
                    </span>
                  </p>
                </td>
                <td className={`txt-left d-mm-none ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>{list.itemReportDtoOut.responsible}</td>
                {/* <!--220627,checkdate클래스 삭제 --> */}
                <td className={`txt-left  ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>{CUTIL.utc2time("YYYY-MM-DD", list.updatedTime)}</td>
                <td className={`txt-left d-lm-none  ${(isMobile) ? "js-open-m" : ""}`} data-pop="pop-list-view" onClick={(e) => { (isMobile) ? listView(e, list) : "" }}>
                  {/* <!--220628, 점수에 따라 high,middle,low--> */}
                  <p className={`score ${(list.alarmStatus == "WARNING_SCORE") ? "middle" : (list.alarmStatus = "SAFETY") ? "high" : ""}`}>{list.totalScore}</p>
                </td>
                <td className={`d-mm-none`} >
                  {(list.reportId == null)
                    ? <button type="button" className="btn btn-file" disabled>
                      <span className="hide">파일다운로드</span>
                    </button>
                    : <button type="button"
                      className="btn btn-file"
                      onClick={(e) => { HTTPUTIL.fileDownload_WithPdfViewer(list.itemReportDtoOut.serialNo, list.reportId, userInfo.loginInfo.token) }}>
                      {/*<button type="button" className="btn btn-file" onClick={(e) => { onClickReportDownload(e, list) }}>*/}
                      <span className="hide">파일다운로드</span>
                    </button>
                  }
                </td>
                <td className={`d-lm-none`}>
                  {(list.totalComment == "") ?
                    <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                    : <button type="button" className="btn btn-memo" ><span className="hide">메모</span></button>
                  }
                </td>
                <td>
                  <button type="button" className="bg-gray" onClick={(e) => getResultBtn(e, list)} ><span>{t("FIELD.보기")}</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
// 모바일 filter
function MobileFilter(props) {
  const t = useTrans();
  const {
    curTab,
    subZoneSle,
    onClickSubZoneSelect,
    subZoneItem,
    setRoomSel,
    roomItem,
    dateTermList,
    handleDayPop,
    langs,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    mintStartDate,
    maxEndDate,
    spgItem,
    filterList,
    handleClickSpgFilter,
    handleClickSearchFilter,
    onClickSearchFilter,
    dateSel,
  } = props;
  return (
    <>
      <div className="popup__body">
        <ul className="form__input d-sm-block">
          {/* <!-- 220628 ul 영역 전체추가 --> */}
          <li>
            <label htmlFor="company">{t("FIELD.상세사업장")}</label>
            <div className="input__area">
              <div id={"subZoneM"} className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
                {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
                <div className="selected">
                  <div className="selected-value">{t("FIELD.전체")}</div>
                  <div className="arrow"></div>
                </div>
                <ul>
                  <li id="subZoneAllM" className="option" onClick={(e) => onClickSubZoneSelect(e)}  >{t("FIELD.전체")}</li>
                  {(subZoneItem) && subZoneItem.map((data) => (
                    <li key={data.subZoneId} className="option" onClick={(e) => onClickSubZoneSelect(data.subZoneId)}>{data.subZoneName}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
          <li>
            <label htmlFor="site">{t("LABEL.전기실")}</label>
            <div className="input__area">
              <div id="roomM" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
                {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
                <div className="selected">
                  <div className="selected-value">{t("FIELD.전체")}</div>
                  <div className="arrow"></div>
                </div>
                <ul>
                  <li id="roomAllM" className="option" onClick={(e) => setRoomSel("")} >{t("FIELD.전체")}</li>
                  {(roomItem) && roomItem.map((data) => (
                    <li key={data.roomId} className="option" onClick={(e) => setRoomSel(data.roomId)}>{data.roomName}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
          <li>
            <label htmlFor="term">{t("LABEL.조회기간")}</label>
            <div className="input__area">
              {/*<!--searchterm 기간조회 클래스-->*/}
              <div className="searchterm">
                <div id="dateM" className="select term__month" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                  <div className="selected">
                    {/*<div className="selected-value">{(dateTerm)?dateTerm.dtDisp:(searchCount.dateTerm)?searchCount.dateTerm.dtDisp:dateTermList[0].dtDisp}</div>*/}
                    <div className="selected-value">{dateTermList[0].dtDisp}</div>
                    <div className="arrow"></div>
                  </div>
                  <ul>
                    {dateTermList.map((dt, idx) => (
                      <li id={"dateM_" + dt.id} key={`dt_${idx.toString()}`}
                        className="option"
                        onClick={(e) => handleDayPop(dt)}
                      >{dt.dtDisp}</li>
                    ))}
                  </ul>
                </div>
                <div className="term__date">
                  <DatePicker
                    // id="dp655863510467"
                    className="calendar"
                    locale={(langs === CONST.STR_LANG_CHA) ? zhCN : (langs === CONST.STR_LANG_ENG) ? enUS : ko}
                    todayButton="today"
                    dateFormat="yyyy-MM-dd"
                    selected={startDate}
                    maxDate={endDate}
                    minDate={mintStartDate}
                    onChange={(date) => setStartDate(date)}
                    onFocus={(e) => e.target.readOnly = true} // 모바일 키보드 제거
                    withPortal // 전체 적용
                    readOnly={(dateSel != 0) ? true : false} //직접 입력 이외 입력 제한
                  />

                  <span className="centerline">~</span>
                  <DatePicker
                    className="calendar"
                    // id="dp1655863510468"
                    locale={(langs === CONST.STR_LANG_CHA) ? zhCN : (langs === CONST.STR_LANG_ENG) ? enUS : ko}
                    todayButton="today"
                    dateFormat="yyyy-MM-dd"
                    selected={endDate}
                    minDate={startDate}
                    maxDate={maxEndDate}
                    onChange={(date) => setEndDate(date)}
                    onFocus={(e) => e.target.readOnly = true} // 모바일 키보드 제거
                    withPortal
                    readOnly={(dateSel != 0) ? true : false} //직접 입력 이외 입력 제한
                  />
                </div>
              </div>
            </div>
          </li>
        </ul>
        <div className="filter__select">
          <div className="filter__type">
            <p className="tit">{t("LABEL.기기유형")}</p>
            <ul className="type__cont">
              {/* <!-- 선택시 on 클래스 붙여주세요~ --> */}
              {(spgItem) && spgItem.map((filter, idx) => (
                <li key={"spg_" + idx.toString()}
                  className={(filter.checked) ? "on" : ""}

                  onClick={(e) => handleClickSpgFilter(filter.fname)}
                >
                  <a href="#" >{filter.fname}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="filter__type">
            <p className="tit">{t("FIELD.점검단계")}</p>
            <ul className="type__cont">
              {/* <!-- 선택시 on 클래스 붙여주세요~ --> */}
              {filterList.map((filter, idx) => (
                <li key={"chk_" + idx.toString()} className={(filter.checked) ? "on" : ""}
                  data-value={filter.dname}
                  onClick={(e) => handleClickSearchFilter(filter.dname)}
                >
                  <a href="#" >{filter.dname}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close"><span>{t("LABEL.취소")}</span></button>
        <button type="button" onClick={(e) => onClickSearchFilter(e)}><span>{t("LABEL.적용")}</span></button>
      </div>
    </>
  );
}
// 모바일 {t("LABEL.검색")}
function MobileSEarch(props) {
  const {
    t,
    searchFieldList,
    setSearchField,
    searchText,
    setSearchText,
    onClickGoSearch
  } = props;
  return (
    <>
      <div className="popup__body">
        <div className="form__input mb-0">
          <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
            <div className="selected">
              <div className="selected-value">{searchFieldList[0].sfDisp}</div>
              <div className="arrow"></div>
            </div>
            <ul>
              {searchFieldList.map((sf, idx) => (
                <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)}
                  onClick={(e) => setSearchField(sf)}>
                  {sf.sfDisp}
                </li>
              ))}
            </ul>
          </div>
          <input type="text" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.검색어")])}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close"><span>{t("LABEL.취소")}</span></button>
        <button type="button" onClick={(e) => onClickGoSearch(e)}><span>{t("LABEL.적용")}</span></button>
      </div>
    </>
  );
}

function MobileListView(props) {
  //trans
  const t = useTrans();
  //recoil
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  const list = props.list;

  return (
    <>



      {(list) &&
        <div className="popup__body">
          <div className="area__right_content workplace__info">
            <div className="content__info">
              <h3 className="hide">리스트 상세 정보</h3>
              <ul>
                <li>
                  <p className="tit">{t("FIELD.점검단계")}</p>
                  <p className="txt">
                    <img src={require(`/static/img/icon_${(list.checkStepDto.name) ? list.checkStepDto.name[0].toLowerCase() : "x"}.png`)}
                      style={{ "width": "24px", "height": "24px" }} alt={list.checkStepDto.name} />

                  </p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.상세사업장")}</p>
                  <p className="txt">{list.subZoneName}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.전기실")}</p>
                  <p className="txt">{list.roomName}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.기기명")}</p>
                  <p className="txt">{list.spgDto.name}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.모델명")}</p>
                  <p className="txt">{list.itemReportDtoOut.itemName}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.시리얼번호")}</p>
                  <p className="txt">{list.itemReportDtoOut.serialNo}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.담당자")}</p>
                  <p className="txt">{list.itemReportDtoOut.responsible}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.점검일자")}</p>

                  <p className="txt">{CUTIL.utc2time("YYYY-MM-DD", list.updatedTime)}</p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.평가점수")}</p>
                  <p className={`txt `}>
                    <span className={`score ${(list.alarmStatus == "WARNING_SCORE") ? "middle" : (list.alarmStatus = "SAFETY") ? "high" : ""}`}>{list.totalScore}</span>
                  </p>
                </li>
                <li>
                  <p className="tit">{t("FIELD.Report")}</p>
                  {(list.reportId) &&
                    <ul className="filelist">
                      <li>
                        <span>PDF</span>
                        <button type="button" className="btn btn-filedown"
                          onClick={(e) => { HTTPUTIL.fileDownload_EhcReport(list.itemReportDtoOut.itemName, list.reportId, userInfo.loginInfo.token) }}>
                          <span className="hide">다운로드</span>
                        </button>
                      </li>
                    </ul>
                  }
                </li>
                <li>
                  <p className="tit">{t("FIELD.메모")}</p>
                  <p className="txt">{list.totalComment}</p>
                </li>
              </ul>
            </div>
            <div className="btn__wrap">
              <button type="button" className="js-close" onClick={(e) => CUTIL.jsclose_Popup("pop-list-view")}><span>{t("LABEL.확인")}</span></button>
            </div>
          </div>
        </div>
      }

      {/* {/*<!--//리스트 상세 보기 팝업-->*/}
    </>
  )
}