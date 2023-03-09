/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-07-13
 * @brief EHP 검사성적서 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useCallback, useRef } from "react";
//
import { useAsync } from "react-async";
import axios from 'axios';
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState, } from '../../../recoil/userState';
import { menuState, urlState } from '../../../recoil/menuState';
import { curSpgTreeState, } from "../../../recoil/assessmentState";
//
import { useTrans } from "../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as FILEUTILS from "../../../utils/file/fileUtil";
import clog from "../../../utils/logUtils"
//
import $, { cleanData } from "jquery";
//components
import Pagination from "../../common/pagination/Pagination"
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { filter } from "jszip";
/*
import QrLayoutPopup from "./QrLayoutPopup";
import Guid from "./Guid";
import Uuid from "./Uuid";
import axios from "axios";
*/

/**
 * @brief EHP 검사성적서 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */
function ItemReportViewTest(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoState);
    //const curTreeData = useRecoilValue(curSpgTreeState);  
    //const { company, zone, subZone, room, spg } = props.curTreeData;
    //
    /*  const [curZone, setCurZone] = useState({
         zoneId: (company.companyId < 0) ? null : company.companyName + ":" + zone.zoneName, //"LS일렉트릭:안양", // 변경 예정
         zoneName: zone.zoneName,
         company: {
             companyId: company.companyId,
             companyName: company.companyName
         }
     }); */
    //sclog("IN REPORTVIEW : INIT : " + JSON.stringify(curZone));
    const [zoneList, setZoneList] = useState([]);
    //tab
    //mobile
    const [isMobile, setIsMobile] = useState(false);
    //
    const [mobileTag, setMobileTag] = useState(null);
    const mobileRef = useRef(null); // Mobile Check용
    //
    const [itemList, setItemList] = useState([]);
    const [pageInfo, setPageInfo] = useState({ "size": 20, "totalElements": 0, "totalPages": 0, "number": 0 });

    // mobile check용 
    useEffect(() => {
        setMobileTag(mobileRef.current);
        if (!CUTIL.isnull(mobileTag)) {
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        }

        //  }, [mobileRef, mobileTag]);
    }, [mobileTag]);
    // Mobile 체크
    function handleResize() {
        if (CUTIL.isnull(mobileTag)) return;
        if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
    }
    useEffect(() => {

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [mobileTag, isMobile]);
    ///
    const { data: data, error, isLoading, reload, run } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: "/api/v2/product/zone/company",
        appQuery: {},
        userToken: userInfo.loginInfo.token,
    });
    /* useEffect(() => {
        if (data && (data.codeNum == 200)) {
            if (curZone.zoneId == null) {
                setCurZone(data.body[0]);
            }
            setZoneList(data.body);
        }
    }, [data]) */

    // option 선택 시  값 변경 액션
    function selectTabOption(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var zoneInfo = optionElement.getAttribute("data-value");
        //selectedElement.setAttribute("data-value", optionElement.getAttribute("data-value"))
        selectedElement.setAttribute("data-value", zoneInfo);
        clog("OPT VAL : " + optionElement.value);

        //setCurZone(JSON.parse(zoneInfo)); // 탭 또는 모바일 경우
        resetSearchParams();
    }
    // option 선택 시  값 변경 액션
    function selectOption(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var zoneInfo = optionElement.getAttribute("data-value");
        //selectedElement.setAttribute("data-value", optionElement.getAttribute("data-value"))
        selectedElement.setAttribute("data-value", zoneInfo);
    }

    function onClickSelect(e, handleSelect) {
        const selectBoxElement = e.currentTarget;
        const targetElement = e.target;
        const isOptionElement = targetElement.classList.contains("option");
        if (isOptionElement) {
            handleSelect(targetElement);
        }
        toggleSelectBox(selectBoxElement);
    }
    // select active 액션
    function toggleSelectBox(selectBox) {
        selectBox.classList.toggle("active");
    }
    //
    function onClickTab(e) {
        var actTag = (e.target.tagName === "DIV") ? e.target : e.currentTarget;
        var zoneInfo = actTag.getAttribute("data-value");
        //setCurZone(JSON.parse(zoneInfo));
        resetSearchParams();
    }
    const [reportLoading, setReportLoading] = useState(false);

    // innerHTML 사용시 re-rendering에 문제가 발생함. 강제 처리 -_-;
    const onloadRef = useRef(null); // Mobile Check용
    useEffect(() => {
        if (onloadRef) {
            var trClicks = document.querySelectorAll(".tr__click");
            for (var i = 0; i < trClicks.length; i++) {
                var clickTag = trClicks[i];
                clickTag.classList.remove("open");
            }
            var trDetails = document.querySelectorAll(".tr__detail");
            for (var i = 0; i < trDetails.length; i++) {
                var detailTag = trDetails[i];
                //detailTag.style.setProperty("display", "table-row");        
                detailTag.innerHTML = "";
            }
        }
    }, [onloadRef, /* curZone */]);
    //
    const [winFilter, setWinFilter] = useState(false);
    const [searchFilterList, setSearchFilterList] = useState([])
    const [filterList, setFilterList] = useState([
        { fname: "전체", checked: true },
        { fname: "배전반", checked: false },
        { fname: "유입식TR", checked: false },
        { fname: "ACB", checked: false },
        { fname: "GIS", checked: false },
        { fname: "MoldTR", checked: false },
        { fname: "VCB", checked: false },
    ]);

    function searchFileter(e) {
        var curTag = e.target;
        if ((curTag.tagName === "A") || (curTag.tagName === "LI")) return;
        setWinFilter(!winFilter);
        /*
        var curTag = e.target;
        var filterDiv = curTag.closest(".filter");
        if ( CUTIL.isnull(filterDiv) ) return;
        //toggle
        filterDiv.classList.toggle("open");
        */
    }

    function resetSearchParams() {
        setPageInfo({ "size": 20, "totalElements": 0, "totalPages": 0, "number": 0 });
        setItemList([]);

        setSearchText("");
        setSearchTextField({
            searchField: "",
            searchText: ""
        });

        setSearchFilterList([]);
        setFilterList(
            filterList.map((filter) => (filter.fname === "전체") ? { ...filter, checked: true } : { ...filter, checked: false })
        );
    }

    function handleClickSearchFilter(e) {
        e.preventDefault();
        var curTag = (e.target.tagName === "A") ? e.currentTarget : e.target;
        var filterVal = curTag.getAttribute("data-value");
        if (filterVal === "전체") {
            setFilterList(
                filterList.map((filter) => (filter.fname === "전체") ? { ...filter, checked: !filter.checked } : { ...filter, checked: false })
            );
        } else { // 개별
            setFilterList(
                filterList.map((filter) => (filter.fname === "전체") ? { ...filter, checked: false } : (filter.fname === filterVal) ? { ...filter, checked: !filter.checked } : filter)
            );
        }
    }

    const [searchText, setSearchText] = useState("");
    const [searchTextField, setSearchTextField] = useState({
        searchField: "",
        searchText: ""
    });
    function onClickGoSearch(e) {
        setSearchTextField({
            searchField: "",
            searchText: ""
        });

        //if (searchText.length <= 0) return;
        //var selSearchType = $("#search_selected-value").attr("data-value");
        var searchTypeDiv = document.querySelector("#search_selected-value");
        if (CUTIL.isnull(searchTypeDiv)) return;
        var selSearchType = searchTypeDiv.getAttribute("data-value");
        //clog("IN GOSSEARCH : " + selSearchType );
        setSearchTextField({
            searchField: selSearchType,
            searchText: searchText
        });
        // search시 필터 적용
        setSearchFilterList(
            filterList.filter((filter) => filter.checked)
        );
    }

    function searchTextClose(e) {
        setSearchText("");
    }
    //
    function mobilePopup(e) {
        /*   var actTag = (e.target.tagName == "DIV") ? e.target : e.currentTarget;
          var activeLayer = actTag.getAttribute("data-pop");
  
          // 레이어 팝업 화면 가운데 정렬
          $("#" + activeLayer + ".popup-layer.page-report").css("position", "absolute");
          $("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
          $("#" + activeLayer + ".popup-layer.page-report").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");
  
          var mql3 = window.matchMedia("screen and (min-width: 1522px)"); //220628(3) min-width값 변경,
          //if (mql3.matches) {
          //    $(".js-open-m").attr("");
          //} else {
          $(activeLayer).attr("data-pop");  //220628, ".js-open-m" 을 this로 변경
          // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
          $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
          $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
          $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)
  
          //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
          $("#" + activeLayer + ".layer-out")
              .children()
              .children(".js-close")
              .on("click", function () {
                  $(".dimm").stop().hide().css("z-index", "11");
              });
          //}
  
          //닫기 버튼 , 배경 클릭 시
          $("#" + activeLayer)
              .children()
              .children(".js-close")
              .on("click", function () {
                  $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
                  $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
              }); */

    }

    //
    return (
        <>
            <article className={`box list ${(isLoading || reportLoading) ? "loading__box" : ""}`}>
                {/* <!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 --> */}
                {/*<div className={`box__body ${((resErrorCode != 200) || (retPageInfo.totalElements <= 0)) ? "nodata" : ""}`}>*/}
                <div className="box__body">
                    {/*<!--슬라이드 탭 영역-->*/}
                    <section className="swiper-section">
                        <div className="swiper-container mySwiper">
                            <div style={{ "cursor": "pointer" }} className="swiper-wrapper">
                                {/*<!--선택된 탭에 on 클래스 자동 생성, 첫번째 탭에는 on 넣기(기본 선택 탭)-->*/}
                                {/*                                 {zoneList.map((tzone, idx) => (
                                    <div
                                        key={tzone.zoneid + "_" + idx}
                                        className={`swiper-slide tab ${(tzone.zoneId == curZone.zoneId) ? "on" : ""}`}
                                        data-value={JSON.stringify(tzone)}
                                        onClick={(e) => onClickTab(e)}>
                                        <p>{tzone.company.companyName + " " + tzone.zoneName}</p>
                                    </div>
                                ))} */}
                                <div onClick={(e) => onClickTab(e)}><p>LS일렉트릭 안양</p></div>
                                <div onClick={(e) => onClickTab(e)}><p>LS일렉트릭 대전</p></div>
                                <div onClick={(e) => onClickTab(e)}><p>LS전자 부산</p></div>
                            </div>
                        </div>
                        <div className="swiper-navigation">
                            {(true)
                                ? <div className="swiper-button-prev"></div>
                                : <div className="swiper-button-prev  swiper-button-disabled" aria-disabled ></div>
                            }
                            {(true)
                                ? <div className="swiper-button-next"></div>
                                : <div className="swiper-button-next swiper-button-disabled" aria-disabled></div>
                            }
                        </div>
                    </section>
                    {/* <!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출--> */}
                    <div className="d-sm-tab">
                        <div className="select" onClick={(e) => onClickSelect(e, selectTabOption)}>
                            <div className="selected">
                                {/* <div className="selected-value">{curZone.company.companyName + " " + curZone.zoneName}</div> */}
                                <div className="arrow"></div>
                            </div>
                            <ul>
                                {zoneList.map((tzone, idx) => (
                                    <li
                                        key={tzone.zoneid + "_m_" + idx}
                                        /* className={`option tab ${(curZone.zoneId === tzone.zoneId) ? "on" : ""}`} */
                                        data-value={JSON.stringify(tzone)}
                                    >{tzone.company.companyName + " " + tzone.zoneName}
                                    </li>
                                ))}

                            </ul>
                        </div>
                    </div>
                    {/* <!--탭별  내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) --> */}
                    {/* <!--220711, 여기서부터 검사 성적서 조회 내용 작업(해당 태그 안 기록된 주석 모두 확인)--> */}
                    <div id="tab-1" className="tabcontent current">
                        {/* <!-- Tab1 내용 --> */}
                        {/* <!--tabcontent__top, p태그(tabcontent__title) 추가--> */}
                        <div className="tabcontent__top">
                            <p className="tabcontent__title">
                                <span>검사 성적서 조회</span>
                                <button type="button" className="btn btn-qr js-open-m" data-pop="pop-qr">
                                    <span>QR</span>
                                </button>
                            </p>
                            {/* <!--filter, search-small, 버튼들 감싸는 태그(search__inline) 추가됨--> */}
                            <div className="search__inline">
                                {/* <!--filter--> */}
                                <div id="win_filter"
                                    className={`filter js-open-m ${(winFilter) ? "open" : ""}`}
                                    data-pop="pop-filter"
                                    onClick={(e) => { (isMobile) ? CUTIL.jsopen_m_Popup(e)/*mobilePopup(e)*/ : searchFileter(e) }}>
                                    <p className="title">
                                        <span>Filter</span>
                                    </p>
                                    <div className="filter__select">
                                        <div className="filter__type">
                                            <ul className="type__cont">
                                                {filterList.map((filter, idx) => (
                                                    <li key={"filter_" + idx}
                                                        className={(filter.checked) ? "on" : ""}
                                                        data-value={filter.fname}
                                                        onClick={(e) => handleClickSearchFilter(e)}>
                                                        <a>{filter.fname}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>{/*.filter*/}
                                {/* <!--search-small--> */}
                                <div className={"search-small js-open-m"}
                                    data-pop="pop-search-small"
                                    onClick={(e) => { (isMobile) ? CUTIL.jsopen_m_Popup(e)/*mobilePopup(e)*/ : "" }}>
                                    <p className="title">
                                        <span>검색</span>
                                    </p>
                                    <div className="search__cont">
                                        <div ref={mobileRef} className="searcharea">
                                            <div className="searchinput">
                                                <div className="select" onClick={(e) => onClickSelect(e, selectOption)}>
                                                    <div className="selected">
                                                        <div id="search_selected-value" className="selected-value" data-value="itemName">기기 명</div>
                                                        <div className="arrow"></div>
                                                    </div>
                                                    <ul>
                                                        <li className="option" value="0" data-value="itemName">기기 명</li>
                                                        <li className="option" value="1" data-value="serialNo" >제조번호</li>
                                                    </ul>
                                                </div>
                                                <div className="input__direct">
                                                    <input type="text" placeholder="검색어를 입력하세요" value="ITEM1" onChange={(e) => setSearchText(e.target.value)} />
                                                    {(searchText.length > 0) &&
                                                        <button type="button" className="btn btn-delete" onClick={(e) => searchTextClose(e)}><span className="hide">입력 창 닫기</span></button>
                                                    }
                                                </div>
                                            </div>
                                            <input type="text" className="d-sm-block-toggle" placeholder="기기명을 입력하세요." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                            <button type="button" data-testid="searchinsearch" className="btn btn-delete"><span className="hide">입력 창 닫기</span></button>
                                            <button type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
                                        </div>
                                    </div>
                                </div>
                                {/* <!--220627 추가--> */}
                                {((filterList.filter((filter) => (filter.checked) && (filter.fname !== "전체")).length > 0) || (searchText.length > 0))
                                    ? <button type="button" className="btn-renew" onClick={resetSearchParams}><span>필터 초기화</span></button>
                                    : <button type="button" className="btn-renew" disabled><span>필터 초기화</span></button>
                                }
                                {/* <!--비활성화일경우 disabled / 활성화일경우 disabled 삭제 --> */}
                                <button type="button" className="btn btn-filedown" data-testid="downloadFile" ><span className="hide">다운로드</span></button>
                            </div>{/*.search__inline*/}
                        </div>{/* <!--//tabcontent__top--> */}
                        {/*                         {(curZone.zoneId != null) && <ItemReportTabCont
                            itemList={itemList}
                            setItemList={setItemList}
                            pageInfo={pageInfo}
                            setPageInfo={setPageInfo}
                            selZone={curZone}
                            searchFilter={searchFilterList}
                            searchTextField={searchTextField}
                            setReportLoading={setReportLoading}
                        />} */}
                    </div>{/*.tabcontent current*/}
                </div>{/*.box__body*/}<div ref={onloadRef}></div>
            </article>
            <SearchFilterPopup
                goSearch={onClickGoSearch}
                filterList={filterList}
                handleClickSearchFilter={handleClickSearchFilter}
            />
            <SearchTextPopup
                goSearch={onClickGoSearch}
                searchText={searchText}
                setSearchText={setSearchText}
                handleSelect={onClickSelect}
                handleOption={selectOption}
            />
        </>
    )
}

export default ItemReportViewTest;

/*"page":{"size":10,"totalElements":65,"totalPages":7,"number":0}}*/
function ItemReportTabCont(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoState);
    //
    const itemList = props.itemList;
    const setParentItemList = props.setItemList;
    const pageInfo = props.pageInfo;
    const setParentPageInfo = props.setPageInfo;
    const curZone = props.selZone;
    const searchFilter = props.searchFilter;
    const searchTextField = props.searchTextField;
    const setParentReportLoading = props.setReportLoading;
    ///
    //const [itemList, setItemList] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    ///////////////////////////////////////////
    let appPath = "";
    ////////////////////////////////////////
    //page":{"size":10,"totalElements":65,"totalPages":7,"number":0}
    appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
    function handleScroll(e) {
        var actTag = e.target;
        if (actTag.scrollHeight >= (actTag.clientHeight + actTag.scrollTop + 2)) return;
        if (!isLoading) {
            if (pageInfo.totalPages > pageInfo.number + 1) {
                setParentPageInfo({ ...pageInfo, "number": pageInfo.number + 1 });
            }
        }
    }

    appPath = appPath + "&zoneId=" + curZone.zoneId;
    useEffect(() => {
        setParentPageInfo({ ...pageInfo, "totalElements": 0, "totalPages": 0, "number": 0 });
        setParentItemList([]);
    }, [curZone])

    let strFilter = "";
    searchFilter.filter((filter) => (filter.checked === true) && (filter.fname !== "전체")).map((filter, idx) => {
        if (idx > 0) strFilter = strFilter + ","
        strFilter = strFilter + filter.fname;
    })
    if (strFilter.length > 0) {
        appPath = appPath + "&spgList=" + strFilter;
    }
    useEffect(() => {
        setParentPageInfo({ ...pageInfo, "totalElements": 0, "totalPages": 0, "number": 0 });
        setParentItemList([]);
    }, [strFilter])


    if (searchTextField.searchText.length > 0) {
        appPath = appPath + `&${searchTextField.searchField}=` + searchTextField.searchText;
    }

    useEffect(() => {
        setParentPageInfo({ ...pageInfo, "totalElements": 0, "totalPages": 0, "number": 0 });
        setParentItemList([]);
    }, [searchTextField.searchText])


    //clog("IN ItemReportTabCont : search FILTER : " + appPath);
    const { data: data, error, isLoading, reload, run } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        httpMethod: "GET",
        appPath: "/api/v2/product/company/zone/room/panel/item/testreport?" + appPath,
        appQuery: {},
        watch: appPath,
        //appQuery: {zoneId : curZone.zoneId},
        //watch: curZone.zoneId,
        //appQuery : searchParams,
        //watch:searchParams,
        userToken: userInfo.loginInfo.token,
    });

    useEffect(() => {
        if (data && (data.codeNum == 200)) {
            //clog("IN ItemReportTabCont : RESULT : " + JSON.stringify(data.data.page));
            setParentPageInfo(data.data.page);
            setParentItemList(itemList.concat(data.body));
        }
    }, [data])

    function onClickItemTr(e, ord, item) {
        //setSelItem(item);
        var curTag = e.target;
        var clickTag = curTag.closest(".tr__click");
        if (CUTIL.isnull(clickTag)) return;
        var detailTag = clickTag.nextSibling;
        if (!detailTag.classList.contains("tr__detail")) return;

        if (clickTag.classList.contains("open")) { // cloase
            detailTag.style.setProperty("display", "none");
            clickTag.classList.remove("open");
        } else { // open
            //clog("INNER HTML : " + getInnerHtml(item, detailTag.id));
            detailTag.style.setProperty("display", "table-row");
            clickTag.classList.add("open");
        }

        (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
            if (detailTag.innerHTML.length <= 0) {
                setParentReportLoading(true);
                const resp = await API_reportView(item.serialNo);
                setParentReportLoading(false);
                setParentItemList(
                    itemList.map((it) => (it.itemId === item.itemId)
                        ? {
                            ...it,
                            subObj: <ItemReports
                                dispOrd={ord}
                                reportInfo={resp}
                                setReportLoading={setParentReportLoading}>
                            </ItemReports>
                        }
                        : { ...it })
                );
            }
        })();
    }

    return (
        <>
            {/* <!--데이터 없는 경우 노출됨--> */}
            {(itemList.length <= 0)
                ? <p className="nodata__txt">데이터를 찾을 수 없습니다.</p>
                : <div className="tbl-list type2" onScroll={(e) => handleScroll(e)}>
                    {/* <!--tbl-list 클래스에 type2 추가--> */}
                    <table summary="기기 명,기기 유형,제조번호 항목으로 구성된 검사 성적서 리스트 입니다.">
                        <caption>검사 성적서 리스트</caption>
                        <colgroup><col style={{}} /></colgroup>
                        <thead>
                            <tr>
                                {/* <!--th, td 영역 첫번째 항목에는 span태그 넣기(클릭시 나오는 상세 테이블은 넣지마세요)--> */}
                                <th scope="col"><span>기기 명</span></th>
                                <th scope="col" className="d-sm-none">기기 유형</th>
                                <th scope="col" className="d-sm-none">제조번호</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemList.map((item, idx) => (
                                <React.Fragment key={"frm_" + idx}>
                                    {/*clog("ITEM : INFO : " + JSON.stringify(item))*/}
                                    {/* <!--클릭되는 tr에 tr__click 클래스-->*/}
                                    {/*<!--tr__click 클래스 중 짝수에 해당되는 tr에 bg-darkwhite 추가--> */}
                                    <tr key={"tr_" + idx}
                                        id={"tr__click" + item.serialNo}
                                        //className={`tr__click ${(idx % 2 === 0) ? "" : "bg-darkwhite"} ${(selItem)?(selItem.itemId===item.itemId)?"open":"":""}`}
                                        className={`tr__click ${(idx % 2 === 0) ? "" : "bg-darkwhite"}`}
                                        onClick={(e) => onClickItemTr(e, idx, item)}>
                                        {/* <td><span>{item.itemName}</span></td> */}
                                        <td><span>동서울 170kV</span></td>
                                        {/* <!--d-sm-none 은 웹에서만(768이상) 노출 : 기기유형,제조번호 웹용--> */}
                                        {/* <td className="d-sm-none">{item.spgDtoOut.spgName}</td> */}
                                        <td className="d-sm-none">GIS</td>
                                        <td className="d-sm-none">제조번호</td>
                                        {/* <!--d-sm-block 은 모바일에서만(767이하) 노출 : 기기유형,제조번호 모바일용--> */}
                                        <td className="d-sm-block">
                                            <span>GIS</span>
                                            <span>제조번호</span>
                                        </td>
                                    </tr>
                                    {/*<!--행 클릭시 나오는 상세 테이블 영역-->*/}
                                    <tr key={"tr_detail_" + idx}
                                        id={"tr__detail" + item.serialNo}
                                        className="tr__detail" >
                                        {(item.hasOwnProperty("subObj")) && item.subObj}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </>
    )
}

function genGUUID() {
    let s0 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s1 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s2 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s3 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s4 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s5 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s6 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s7 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    return (s0 + s1 + '-' + s2 + '-' + s3 + '-' + s4 + '-' + s5 + '-' + s6 + s7);
}

function genUUID() {
    let s0 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s1 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s2 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s3 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s4 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s5 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s6 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    let s7 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    return (s0 + s1 + '-' + s2 + '-' + s3 + '-' + s4 + '-' + s5 + '-' + s6 + s7);
}

/*
*/
async function API_reportView(serialNo) {
    let ret = null;

    try {
        await axios.post('https://eaiprod.ls-electric.com/service/rest', {
            request: {
                header: {
                    "IF_ID": "IF_SRD_EHEALTH_TRM_0001",
                    "IF_GUUID": genGUUID(),
                    "IF_UUID": genUUID(),
                    "IF_DATETIME": Date.now()
                },
                body: {
                    "IF_TOTAL_CNT": "0",
                    "IF_SPLIT_CNT": "0",
                    "IF_SPLIT_SEQ": "0",
                    "IF_REQ_DATA": { "SERIAL": serialNo }
                }
            },
        }).then((resp) => {
            //clog("HEADER : " + JSON.stringify(resp.data.response.header));
            //clog("BODY : " + JSON.stringify(resp.data.response.body));
            //clog("STATUS : " + JSON.stringify(resp.status));
            if (resp.status == 200) {
                ret = resp.data.response.body;
            }
        })
    } catch (err) {
    }
    return ret;
}

function downloadReport(report, callbackFunc) {
    var fileName = report.PDF_LINK.substring(report.PDF_LINK.lastIndexOf('/') + 1, report.PDF_LINK.lastIndexOf('.'));
    callbackFunc(true);
    HttpUtil.fileDownload(fileName, encodeURI(report.PDF_LINK));
    callbackFunc(false);
}


function ItemReports(props) {
    const dispOrd = props.dispOrd;
    const reportInfo = props.reportInfo;
    const reportList = reportInfo.IF_RES_DATA;
    const setParentReportLoading = props.setReportLoading;
    return (
        <>
            <React.Fragment>
                <td colSpan={3}>
                    <div className="tbl-list type2">
                        <table summary="파일 명,생성일,첨부 파일 항목으로 구성된 성적서 파일 상세 리스트 입니다." >
                            <caption>성적서 파일 상세 리스트</caption>
                            <colgroup><col style={{}} /></colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className={((dispOrd % 2) === 0) ? "" : "w20"}>
                                        <input type="checkbox" data-testid="t_250" id="t_all" />
                                        <label htmlFor="t_all"><span className="hide">선택</span></label>
                                    </th>
                                    <th scope="col">파일 명</th>
                                    <th scope="col">생성일</th>
                                    <th scope="col" className="txt-center">첨부 파일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(reportList == null) &&
                                    <tr key={"report_null"}>
                                        <td className={`d-sm-none ${((dispOrd % 2) === 0) ? "" : "w20"}`}>
                                            <p className="icon-no ml-m10"><span className="hide">파일없음</span></p>
                                        </td>
                                        <td className="d-sm-none">등록된 성적서가 없습니다.</td>
                                        <td className="d-sm-none">-</td>
                                        <td className="d-sm-block">
                                            <span>등록된 성적서가 없습니다.</span>
                                            <span>-</span>
                                        </td>
                                        <td className="btn__tdarea">
                                            <p className="icon-no gray"><span className="hide">파일없음</span></p>
                                        </td>
                                    </tr>
                                }
                                {(reportList) && reportList.map((report, idx) => (
                                    <tr key={"report_" + idx}>
                                        <td className={`d-sm-none ${((dispOrd % 2) === 0) ? "" : "w20"}`} >
                                            <input readOnly data-testid="check1" type="checkbox" id="t_1" /><label htmlFor="t_1"><span className="hide">선택</span></label>
                                        </td>
                                        <td className="d-sm-none">{report.PDF_LINK.substring(report.PDF_LINK.lastIndexOf('/') + 1, report.PDF_LINK.lastIndexOf('.'))} </td>
                                        <td className="d-sm-none">{report.CREATION_DATE.substring(0, 4) + "-" + report.CREATION_DATE.substring(4, 6) + "-" + report.CREATION_DATE.substring(6, 8)}</td>
                                        <td className="d-sm-block">
                                            <span>{report.PDF_LINK.substring(report.PDF_LINK.lastIndexOf('/') + 1, report.PDF_LINK.lastIndexOf('.'))}</span>
                                            <span>{report.CREATION_DATE.substring(0, 4) + "-" + report.CREATION_DATE.substring(4, 6) + "-" + report.CREATION_DATE.substring(6, 8)}</span>
                                        </td>
                                        <td className="btn__tdarea">
                                            {
                                                (report.PDF_LINK == null)
                                                    ? <button type="button" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                                                    : <a href={report.PDF_LINK} target="_blank" rel='noreferrer'>
                                                        <button type="button" className="btn btn-file">
                                                            <span className="hide">첨부 파일</span>
                                                        </button>
                                                    </a>
                                            }
                                            {/*
                 (report.PDF_LINK == null)
                 ?<button type="button" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                 :<button type="button" className="btn btn-file" onClick={(e)=>downloadReport(report, setParentReportLoading)}><span className="hide">첨부 파일</span></button>
                 */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </td>
            </React.Fragment>
        </>
    )

}



///////////////////pop-up
function SearchFilterPopup(props) {
    const filterList = props.filterList;
    const handleSearchFilter = props.handleClickSearchFilter;
    const goSearch = props.goSearch;
    return (
        <>
            {/*<!-- filter 팝업, 220711 내용 수정됨(reports 파일과 내용 다름) -->*/}
            <div id="pop-filter" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1 className="icon-filter">Filter</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body">
                    <div className="filter__select">
                        <div className="filter__type">
                            <p className="tit">기기 유형</p>
                            <ul className="type__cont">
                                {filterList.map((filter, idx) => (
                                    <li key={"mfilter_" + idx}
                                        className={(filter.checked) ? "on" : ""}
                                        data-value={filter.fname}
                                        onClick={(e) => handleSearchFilter(e)}
                                    >
                                        <a>{filter.fname}</a>
                                    </li>
                                ))}

                            </ul>
                        </div>
                    </div>
                </div>
                <div className="popup__footer">
                    <button type="button" className="bg-gray js-close"><span>취소</span></button>
                    <button type="button" className="js-close" onClick={(e) => goSearch(e)}><span>적용</span></button>
                </div>
            </div>
            {/*<!-- //filter 팝업 -->*/}
        </>
    )
}


function SearchTextPopup(props) {
    const goSearch = props.goSearch;
    const searchText = props.searchText;
    const setSearchText = props.setSearchText;
    const handleSelect = props.handleSelect;
    const handleOption = props.handleOption;

    return (
        <>
            {/*<!-- search 팝업, 220628 -->*/}
            <div id="pop-search-small" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1 className="icon-search">검색</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body">
                    <div className="form__input mb-0">
                        <div className="select" onClick={(e) => handleSelect(e, handleOption)}>
                            <div className="selected">
                                <div className="selected-value">기기 명</div>
                                <div className="arrow"></div>
                            </div>
                            <ul>
                                <li className="option">기기 명</li>
                                <li className="option">제조번호</li>
                            </ul>
                        </div>
                        <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    </div>
                </div>
                <div className="popup__footer">
                    <button type="button" className="bg-gray js-close"><span>취소</span></button>
                    <button type="button" className="js-close" onClick={(e) => goSearch(e)}><span>적용</span></button>
                </div>
            </div>
            {/*<!-- //search 팝업 -->*/}
        </>

    )
}