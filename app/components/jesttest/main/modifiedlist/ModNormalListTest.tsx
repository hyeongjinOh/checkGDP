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
import { useRecoilValue } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../../recoil/userState';
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
} from '../../../../recoil/assessmentState';
//
import { useTrans } from "../../../../utils/langs/useTrans";
//utils
import * as HTTPUTIL from "../../../../utils/api/HttpUtil";
import clog from "../../../../utils/logUtils"
import * as CUTIL from "../../../../utils/commUtils";
import * as CONST from "../../../../utils/Const";
//
import $ from "jquery";
//components
import Pagination from "../../../common/pagination/Pagination"
import EhpPagination from "../../../common/pagination/EhpPagination";
/**
 * @brief EHP List 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */
function NormalList(props) {
    //const userInfo = useRecoilValue(userInfoState);
    const userInfo = useRecoilValue(userInfoLoginState);
    const curItem = useRecoilValue(itemState);
    //props
    const reportLoading = props.reportLoading;
    const setParentReportLoading = props.setReportLoading;
    const curEhcType = props.curEhcType;
    const { company, zone, subZone, room, spg } = props.curTreeData;
    const setParentItemDetail = props.setItemDetail;
    const setParentReportInfo = props.setReportInfo;
    const setParentStatusReload = props.setStatusReload;
    //
    const [itemCheckList, setItemCheckList] = useState([]);
    //page
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, listReload: false };
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
            } else {
                setIsMobile(false);
                resetSearchForm();
            }
        }
    }, []);
    //
    //let appPath = 'page=' + curPage + '&size=' + listSize;
    // 20220705
    //appPath = appPath + '&companyId=' + company.companyId + '&zoneId=' + zone.zoneId + '&roomId=' + room.roomId + '&spgId=' + spg.spgId;
    appPath = appPath + '&roomId=' + room.roomId + '&spgId=' + spg.spgId;
    appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;

    if (!CUTIL.isnull(searchType) && (searchType.length > 0) && (searchRText.length > 0)) {
        appPath = appPath + '&' + searchType + '=' + searchRText;
    }

    const { data: data, error, isLoading, reload, run } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        //appPath: "/api/v2/item/normal?" + appPath,
        appPath: "/api/v2/product/company/zone/subzone/room/panel/item/step/normal?" + appPath,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath + isMobile + pageInfo.listReload
        //watch: curPage+pageSize+company.companyId+zone.zoneId+room.roomId+spg.spgId,
    });

    useEffect(() => {
        let errList = "";
        if (data) {
            if (data.codeNum == 200) {
                setItemCheckList(data.body); // list
                //setRetPageInfo(data.data.page);
                setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, listReload: false }); //5, 10
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
    function onClickGoSearch(e) {
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
        if (isMobile) {
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
            const resp = await HTTPUTIL.API_reportView(item.serialNo);
            setParentReportInfo(resp);
            setParentReportLoading(false);
            CUTIL.jsopen_Popup(e);
        })();
    }

    function onClickListDetailOpen(e, ehcType, item) {
        clog("IN NORMAL : onClickListDetailOpen : " + e);

        //e.preventDefault();
        item.ehcType = ehcType;
        item.ehcPos = room.roomName + "/" + spg.spgName;
        if (!CUTIL.isnull(setParentItemDetail)) setParentItemDetail(item);
        CUTIL.jsopen_Popup(e);
    }

    // by hjo - 20220713 웹사이즈 닫기버튼 이벤트 추가
    function searchClosed(e) {
        if (searchClose === true) {
            setSerchClose(false)
        }
        setSearchText("");
    }


    async function onClickReCheck(e, item) {
        clog("IN NORMAL : RECHECK : " + JSON.stringify(item));

        setPageInfo({ ...pageInfo, listReload: true });

        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "PUT",
            "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/step/init`,
            appQuery: {
                "itemId": item.itemId
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum === CONST.API_200) {
                setParentStatusReload(true);
                setPageInfo({ ...pageInfo, listReload: true });
            } else {
                alert(`ERROR : ` + JSON.stringify(data.body.errorList));
            }
        }
    }


    return (
        <>
            <article className={`box list ${(isLoading || (reportLoading)) ? "loading__box" : ""}`}>
                <div className="box__header">
                    {/*<!--220613(2), normal의 경우 클래스 txt-lightgreen-->*/}
                    <p className="box__title"><span className="txt-lightgreen">Normal</span> e-HC List</p>
                    {/* <!--220530 설정버튼 삭제됨. box__etc 태그 전체 삭제--> */}
                </div>
                <div className={`box__body ${((resErrorCode != 200) || (pageInfo.totalElements <= 0)) ? "nodata" : ""}`}>
                    {/* <!-- 리스트 위 항목 --> */}
                    <div className="tbl__top">
                        <div className="left">
                            <span>등록 항목</span>
                            {/*
               <ul className="checkBox">
                 <li>
                   <input type="checkbox" id="chk1" name="chklist" readOnly />
                   <label htmlFor="chk1">새 등록</label>
                 </li>
                 <li>
                   <input type="checkbox" id="chk2" name="chklist" readOnly />
                   <label htmlFor="chk2">기 등록</label>
                 </li>
               </ul>
               */}
                        </div>
                        <div className="right">
                            <div className="searcharea">
                                {/* <!--220530, div class="searchinput" 추가 : 모바일에서 숨기기 위해서 생성--> */}
                                <div className="searchinput" >
                                    <span>검색</span>
                                    <div id="search_select" className="select" onClick={(e) => onClickSelect(e)}>
                                        <div className="selected">
                                            {/* <div id="search_selected-value" className="selected-value" data-value="itemName"> */}{/* {t("MAIN_LIST.기기명")} */}{/* Panel 명</div> */}
                                            <div id="search_selected-value" className="selected-value" data-value="panelName">{/* {t("MAIN_LIST.기기명")} */}Panel 명</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {/* <li className="option" value="0" data-value="itemName"> */}{/* {t("MAIN_LIST.기기명")} */}{/* Panel 명</li> */}
                                            <li className="option" value="0" data-value="panelName">{/* {t("MAIN_LIST.기기명")} */}Panel 명</li>
                                            <li className="option" value="1" data-value="serialNo">시리얼 번호</li>
                                            <li className="option" value="2" data-value="responsible">담당자</li>
                                        </ul>
                                    </div>&nbsp;
                                    <div className="input__direct">
                                        {(!searchText || !searchClose) &&
                                            <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                        }
                                        {(searchText || searchClose) &&
                                            <button type="button" className="btn btn-delete" onClick={(e) => searchClosed(e)}><span className="hide">입력 창 닫기</span></button>
                                        }
                                    </div>
                                </div>
                                <input type="text" placeholder="기기명을 입력하세요." className="d-sm-block-toggle" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                <button type="button" className="btn btn-delete"><span className="hide">입력 창 닫기</span></button>
                                <button type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
                            </div>
                        </div>
                    </div>
                    {((resErrorCode != 200) || (pageInfo.totalElements <= 0)) &&
                        <p className="nodata__txt">데이터를 찾을 수 없습니다.</p>
                    }
                    {/* <!-- 기본 리스트 형식 테이블, 기본 중앙정렬, td가 전체적으로 좌측일 경우 tbl-list에 txt-left 클래스 추가, 우측일때 txt-right추가 --> */}
                    <div className="tbl-list">
                        <table summary="기기 명, 제조번호, 담당자, 최근점검일, Step, Report, Memo, 성적서, 임시저장, 점검 진행 항목으로 구성된 Basic e-HC List 입니다.">
                            <caption>
                                Normal-HCList
                            </caption>
                            <colgroup>
                                <col />
                            </colgroup>
                            <thead>
                                <tr>
                                    {/*<!--sort 오름차순-->*/}
                                    <th scope="col"
                                        className={`sort ${(sortData.sortField === "panelName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value="panelName"><span>{/* {t("MAIN_LIST.기기명")} */}Panel 명</span></th>
                                    {/*<!--sort 내림차순-->*/}
                                    {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                                    <th scope="col" ref={mobileRef}
                                        className={`sort ${(sortData.sortField === "serialNo") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value="serialNo"><span>시리얼 번호</span></th>
                                    {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                                    <th scope="col"
                                        className={`sort ${(sortData.sortField === "responsible") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value="responsible"><span>담당자</span></th>
                                    <th scope="col"
                                        className={`sort ${(sortData.sortField === "updatedTime") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value="updatedTime"><span>최근 점검일</span></th>
                                    {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                                    <th scope="col" className="d-sm-none"><span>Step</span></th>
                                    {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                                    <th scope="col" className="d-sm-none"><span>Report</span></th>
                                    {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                                    <th scope="col" className="d-sm-none"><span>Memo</span></th>
                                    {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                                    {/*<th scope="col" className="d-sm-none w200"><span className="mr-150">성적서</span></th>*/}
                                    <th scope="col" className="d-sm-none">
                                        <span>성적서</span>
                                    </th>
                                    {/*<!--비활성화일경우 클래스에 disabled -->*/}
                                    {/*<!--221012, 점검진행 노출-->*/}
                                    <th scope="col">
                                        <span>점검 진행</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemCheckList.map((item, idx) => (
                                    <tr key={item.itemId + "_" + idx} className={(item.itemId === curItem.itemId) ? "focused" : ""}>
                                        {/*clog("IN NORMAL : ASSESSMENT ID : " + JSON.stringify(item))*/}
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
                                        <td className="txt-left d-lm-none">{item.responsible}</td>
                                        {(isMobile)/* || ((searchInput.clientHeight <= 0) && (searchInput.clientWidth <= 0)))*/
                                            ? <td className="checkdate js-open txt-left" data-pop={"data-detail"} onClick={(e) => onClickListDetailOpen(e, "NORMAL", item)}>
                                                {(CUTIL.isnull(item.assessment.updatedTime)) ? "기록없음" : CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}
                                            </td>
                                            : <td className="checkdate txt-left d-sm-none" data-pop={"data-detail"} >
                                                {(CUTIL.isnull(item.assessment.updatedTime)) ? "기록없음" : CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}
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
                                            {(item.assessment.reportId !== null)
                                                ? <button type="button"
                                                    className="btn btn-file"
                                                    onClick={(e) => { HTTPUTIL.fileDownload_WithPdfViewer(item.itemName, item.assessment.reportId, userInfo.loginInfo.token) }}>
                                                    <span className="hide">파일다운로드</span>
                                                </button>
                                                : <button type="button" className="btn btn-file" disabled>
                                                    <span className="hide">파일다운로드</span>
                                                </button>
                                            }
                                        </td>
                                        {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                                        <td className="d-sm-none">
                                            {(item.assessment.totalComment == null)
                                                ? <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                                                : <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                                            }
                                        </td>
                                        {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                                        <td className="d-sm-none">
                                            {(item.serialNo) && (item.serialNo.length <= 0)
                                                ? <button type="button" className="btn btn-file" disabled>
                                                    <span className="hide">성적서</span>
                                                </button>
                                                : <button type="button"
                                                    className="btn btn-file js-open"
                                                    data-pop="pop-downtest"
                                                    onClick={(e) => onClickReportView(e, "NORMAL", item)}>
                                                    <span className="hide">성적서</span>
                                                </button>
                                            }
                                        </td>
                                        {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                                        {/*<!--221012, 점검진행 재진행버튼 노출-->*/}
                                        <td>
                                            <button type="button" className="btn-renew"
                                                onClick={(e) => onClickReCheck(e, item)}
                                            >
                                                <span>재진행</span>
                                            </button>
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

export default NormalList;