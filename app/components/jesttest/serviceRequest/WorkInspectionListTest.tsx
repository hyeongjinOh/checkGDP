/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-24
 * @brief EHP Service - workorder 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import { useNavigate } from "react-router-dom";
//
import EhpDtlPostCode from "../../common/postcode/EhpDtlPostCode";
//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
//datepicker 디자인 - 없으면 깨짐
import "react-datepicker/dist/react-datepicker.css";
//datepocker 언어
import EhpPagination from "../../common/pagination/EhpPagination";
/**
/**
 * @brief EHP Service - workorder 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function WorkInspectioList(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //화면 이동
    const navigate = useNavigate();
    //props
    const setParentPopWin = props.setPopWin;
    const setNodata = props.setNodata;
    const nodata = props.nodata;
    //
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    // board List
    const [inspectionList] = useState([
        { "id": 0, "fnName": "전체", "value": "" },
        { "id": 1, "fnName": "요청", "value": "Receipt" },
        { "id": 2, "fnName": "접수", "value": "Arrangement" },
        { "id": 3, "fnName": "진행중", "value": "Treatment" },
        { "id": 4, "fnName": "완료", "value": "Completion" },
    ]);
    // dataKind List
    const [dateKindList] = useState([
        { "id": 0, "fnName": "요청일자", "value": "receptionDate" },
        { "id": 1, "fnName": "진행일자", "value": "handlingDate" },
        { "id": 2, "fnName": "완료일자", "value": "completionDate" },
    ]);
    // date List
    const [dateSearchList] = useState([
        { "id": 0, "fnName": "1개월", "value": "30" },
        { "id": 1, "fnName": "3개월", "value": "60" },
        { "id": 2, "fnName": "6개월", "value": "180" },
        { "id": 3, "fnName": "1년", "value": "365" },
    ]);
    //search List
    const [listSearchList] = useState([
        { "id": 0, "fnName": "불량원인", "value": "cause" },
        { "id": 1, "fnName": "불량처리", "value": "handling" },
        { "id": 2, "fnName": "SPG 명", "value": "spgName" },
        { "id": 3, "fnName": "시리얼번호", "value": "serialNo" },
        { "id": 4, "fnName": "모델 명", "value": "deviceName" },
    ]);
    //
    const [dateKindItem, setDateKindItem] = useState("");
    const [dateKind, setDateKind] = useState("");
    const [inspectionAll, setInspectionAll] = useState(true);
    const [arrangement, setArrangement] = useState(false);
    const [receipt, setReceipt] = useState(false);
    const [treatment, setTreatment] = useState(false);
    const [completion, setCompletion] = useState(false);
    const [status, setStatus] = useState("")
    const [requestBoard, setRequestBoard] = useState(null);
    const [list, setList] = useState([])
    const [sortData, setSortData] = useState({ "sortField": "status", "sort": "ASC" });
    // 달력
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDates, setStartDates] = useState(null);
    const [endDates, setEndDates] = useState(null);


    //mobile
    const [isMobile, setIsMobile] = useState(false);
    //
    const [mobileTag, setMobileTag] = useState(null);
    const mobileRef = useRef(null); // Mobile Check용
    //mobile - table
    const [isMobileTb, setIsMobileTb] = useState(false);
    //
    const [mobileTbTag, setMobileTbTag] = useState(null);
    const mobileTbRef = useRef(null); // Mobile - table Check용
    //mobile - 셀렉트
    const [isMobileSel, setIsMobileSel] = useState(false);
    //
    const [mobileSelTag, setMobileSelTag] = useState(null);
    const mobileSelRef = useRef(null); // Mobile - table Check용
    //검색
    const [searchVal, setSearchVal] = useState("");
    const [searchType, setSearchType] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchRText, setSearchRText] = useState("");
    const [searchClose, setSerchClose] = useState(false);
    const [errorList, setErrorList] = useState([])
    // mobile check용 
    useEffect(() => {
        setMobileTag(mobileRef.current);
    }, [mobileRef]);
    // Mobile 체크
    function handleResize() {
        if (CUTIL.isnull(mobileTag)) return;
        // clog("handleResizeM : " + mobileTag.clientHeight + " X " + mobileTag.clientWidth);
        if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
            // 모바일 셋팅
            if (!isMobile) setIsMobile(true);
        } else {

            if (isMobile) setIsMobile(false);
        }
    }
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [mobileTag, isMobile]);

    //Mobile- table check용 
    useEffect(() => {
        setMobileTbTag(mobileTbRef.current);
    }, [mobileTbRef]);
    //Mobile- table 체크
    function handleResizeTb() {
        if (CUTIL.isnull(mobileTbTag)) return;
        // clog("handleResizeTb : " + mobileTbTag.clientHeight + " X " + mobileTbTag.clientWidth);
        if ((mobileTbTag.clientHeight <= 0) && (mobileTbTag.clientWidth <= 0)) {
            // 모바일 - table셋팅
            if (!isMobileTb) setIsMobileTb(true);
        } else {

            if (isMobileTb) setIsMobileTb(false);
        }
    }
    useEffect(() => {
        window.addEventListener("resize", handleResizeTb);
        return () => {
            window.removeEventListener('resize', handleResizeTb);
        }
    }, [mobileTbTag, isMobileTb]);
    //Mobile- select check용 
    useEffect(() => {
        setMobileSelTag(mobileSelRef.current);
    }, [mobileSelRef]);
    //Mobile- select 체크
    function handleResizeSel() {
        if (CUTIL.isnull(mobileSelTag)) return;
        // clog("handleResizeSle : " + mobileSelTag.clientHeight + " X " + mobileSelTag.clientWidth);
        if ((mobileSelTag.clientHeight <= 0) && (mobileSelTag.clientWidth <= 0)) {
            // 모바일 - select 셋팅
            if (!isMobileSel) setIsMobileSel(true);
        } else {

            if (isMobileSel) setIsMobileSel(false);
        }
    }
    useEffect(() => {
        window.addEventListener("resize", handleResizeSel);
        return () => {
            window.removeEventListener('resize', handleResizeSel);
        }
    }, [mobileSelTag, isMobileSel]);


    let appPath = "?category=REQUEST";
    // 상태 값
    if (!CUTIL.isnull(status) && (status.length > 0)) {
        appPath = appPath + '&status=' + status;
    }
    // 요일형식
    if (!CUTIL.isnull(dateKind) && (dateKind.length > 0)) {
        appPath = appPath + '&dateKind=' + dateKind;
    }
    // 시작일자
    if (!CUTIL.isnull(startDates) && (dayjs(startDates).format().length > 0)) {
        appPath = appPath + '&startDate=' + dayjs(startDates).format("YYYYMMDD");
        // clog("필터 시작일자 : " + appPath);
    }
    // 종료일자
    if (!CUTIL.isnull(endDates) && (dayjs(endDates).format().length > 0)) {
        appPath = appPath + '&endDate=' + dayjs(endDates).format("YYYYMMDD");
        // clog("필터 종료일자 : " + appPath);
    }
    const { data: data, error, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: '/api/v2/customerserviceapply/history/board' + appPath,//${appPath}`
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });

    useEffect(() => {

        if (data) {
            if (data.codeNum == CONST.API_200) {
                setRequestBoard(data.body);
            } else {
                alert(data.errorList.map((err) => (err.msg)))
            }
        }
    }, [data]);
    //  appPath =  '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;
    // 검색 
    if (!CUTIL.isnull(searchType) && (searchType.length > 0) && (searchRText.length > 0)) {
        appPath = appPath + '&stringSearch=' + searchType + '&searchLike=' + searchRText;
        // clog("검색 액션 : " + appPath);
    }
    const { data: item, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: '/api/v2/customerserviceapply/history' + appPath,//${appPath}`
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });
    useEffect(() => {
        // error page 이동
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, item);

        if (ERR_URL.length > 0) navigate(ERR_URL);
        if (item) {
            if (item.codeNum == CONST.API_200) {
                clog("IN WORKORDERINSPECTION : LIST : " + JSON.stringify(item.data.page));
                setList(item.body)
                setPageInfo({ ...item.data.page, psize: (isMobileSel) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT }); //5, 10
            } else {
                alert(item.errorList.map((err) => (err.msg)))
            }
        }
    }, [item]);
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }

    // 시작시 초기값
    useEffect(() => {
        setDateKindItem("receptionDate");
        if (isMobileSel || (mobileSelTag == null) || (mobileSelTag.clientHeight <= 0) && (mobileSelTag.clientWidth <= 0)) {
            setDateKind("receptionDate");
        }
        setSearchVal("spgName");
    }, []);

    function dateKindSel(val) {
        if (isMobileSel || (mobileSelTag == null) || (mobileSelTag.clientHeight <= 0) && (mobileSelTag.clientWidth <= 0)) {
            setDateKind(val.value);
        } else {
            setDateKindItem(val.value);
        }
    }
    // search pop
    useEffect(() => {
        //setParentPopWin("pop-search-small")
        //setNodata(pageInfo.totalElements);
    })

    // 날짜 연산 함수 - data-value에 따라 값 변화
    const handleDay = (val) => {
        const today = new Date();
        const newDay = new Date()
        if (isMobileSel || (mobileSelTag == null) || (mobileSelTag.clientHeight <= 0) && (mobileSelTag.clientWidth <= 0)) {
            // 모바일 
            setStartDates(newDay.setDate(today.getDate() - val));
            setEndDates(today);
        } else {
            setStartDate(newDay.setDate(today.getDate() - val));
            setEndDate(today);
        }

    }

    // 전체 시 초기화
    const handleDayAll = (e) => {
        if (isMobileSel || (mobileSelTag == null) || (mobileSelTag.clientHeight <= 0) && (mobileSelTag.clientWidth <= 0)) {
            //모바일
            setStartDates("");
            setEndDates("");
        } else {
            setStartDate(null);
            setEndDate(null);
        }

    }
    // 점검 출동 버튼 
    function inspectionSel(sel) {
        if (sel.id === 0) { // 전체
            setInspectionAll(true);
            setReceipt(false);
            setArrangement(false);
            setTreatment(false);
            setCompletion(false);
            setStatus(sel.value);
        }
        else if (sel.id === 1) { // 요청
            setInspectionAll(false);
            setReceipt(true);
            setArrangement(false);
            setTreatment(false);
            setCompletion(false);
            setStatus(sel.value);
            if (isMobile || (mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                if (receipt === true) {
                    setReceipt(false);
                    setStatus("");
                }
            }
        }
        else if (sel.id === 2) { // 접수
            setInspectionAll(false);
            setReceipt(false);
            setArrangement(true);
            setTreatment(false);
            setCompletion(false);
            setStatus(sel.value);
            if (isMobile || (mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                if (arrangement === true) {
                    setArrangement(false);
                    setStatus("");
                }
            }
        }
        else if (sel.id === 3) { // 진행중
            setInspectionAll(false);
            setReceipt(false);
            setArrangement(false);
            setTreatment(true);
            setCompletion(false);
            setStatus(sel.value);
            if (isMobile || (mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                if (treatment === true) {
                    setTreatment(false);
                    setStatus("");
                }
            }

        }
        else if (sel.id === 4) { // 완료
            setInspectionAll(false);
            setReceipt(false);
            setArrangement(false);
            setTreatment(false);
            setCompletion(false)
            setCompletion(true);
            setStatus(sel.value);
            if (isMobile || (mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                if (completion === true) {
                    setCompletion(false);
                    setStatus("");
                }
            }
        }
        handleCurPage(0)
    }

    //  날짜 조회
    function dateSearch(e) {
        handleCurPage(0)
        setDateKind(dateKindItem);
        setStartDates(startDate);
        setEndDates(endDate);

    }
    // sort 
    function onClickSort(e) {
        var actTag = (e.target.tagName == "TH") ? e.target : e.currentTarget;
        var selSortField = actTag.getAttribute("data-value");
        var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
        if (selSortField !== sortData.sortField) { // 정렬필드가 변경된 경우
            selSort = "DESC";
        }
        setSortData({
            "sortField": selSortField,
            "sort": selSort
        });
    }
    // table 검색
    function tableSearch(e) {
        setSearchType(searchVal);
        setSearchRText(searchText);
    }

    function searchClosed(e) {
        if (searchClose === true) {
            setSerchClose(false)
        }
        setSearchText("");
    }


    const lists = (list === null) ? null : list;

    return (
        <>
            <div className="area__right w100p d-sm-block">
                {/*<!--검색영역/-->*/}
                <div className="area__top">
                    <div className="search">
                        <ul className="form__input">
                            <li>
                                {/* <!--221024, label 클래스 추가및 태그 안 셀렉트로 변경--> */}
                                <label htmlFor="term" className="mt-0">
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected">
                                            <div className="selected-value">요청일자</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {dateKindList.map((list, idx) => (
                                                <li key={"kind_" + idx.toString()} className="option" onClick={(e) => dateKindSel(list)}>{list.fnName}</li>
                                            ))}

                                        </ul>
                                    </div>
                                </label>
                                {/* <!--221024, ml-8 클래스 추가--> */}
                                {/* <label htmlFor="term">조회기간</label> */}
                                <div className="input__area  ml-8">
                                    {/*<!--searchterm 기간조회 클래스/-->*/}
                                    <div className="searchterm">
                                        <div className="select term__month" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                            <div className="selected">
                                                <div className="selected-value">전체</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                <li id="date__selectedAll-value" className="option" data-value="" onClick={(e) => handleDayAll(e)} >전체</li>
                                                {dateSearchList.map((list) => (
                                                    <li key={"date_" + list.id} className="option" onClick={(e) => handleDay(list.value)}>최근 {list.fnName}</li>
                                                ))}

                                            </ul>
                                        </div>
                                        <div ref={mobileSelRef} className="term__date">
                                            <DatePicker
                                                className="calendar w91"
                                                // autoComplete="off"                                                
                                                todayButton="today"
                                                dateFormat="yyyy-MM-dd"
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                            />

                                            <span className="centerline">~</span>
                                            <DatePicker
                                                className="calendar w91"
                                                // autoComplete="off"
                                                todayButton="today"
                                                dateFormat="yyyy-MM-dd"
                                                selected={endDate}
                                                //  startDate={startDate}
                                                //  endDate={endDate}
                                                minDate={startDate}
                                                onChange={(date) => setEndDate(date)}
                                            // includeDates={[new Date()]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="btn__wrap">
                            <button id="date__selectedM-value" type="button" className="btn-search" onClick={(e) => dateSearch(e)}><span>조회1</span></button>
                        </div>
                    </div>
                </div>
                <h2 className="mb-24">점검출동</h2>
                {/*<!--area__right_content, 오른쪽 컨텐츠 영역/-->*/}
                <div className="area__right_content">
                    {/*<!--선택됐을때 div에 on 클래스 / 완료된것 end 넣어서 액션 구현해주세요~ /-->*/}
                    <ul className="checkstatus-box">

                        <li>
                            <div>
                                <a>
                                    <p>전체1</p>
                                    <p><strong>14</strong>ea</p>
                                </a>
                            </div>
                        </li>
                        <li>

                            <div>
                                <a >
                                    <p>요청</p>
                                    <p><strong>4</strong>ea</p>
                                </a>
                            </div>

                            <div>
                                <a>
                                    <p>접수</p>
                                    <p><strong>4</strong>ea</p>
                                </a>
                            </div>



                            <div>
                                <a>
                                    <p>진행중</p>
                                    <p><strong>3</strong>ea</p>
                                </a>
                            </div>


                            <div>
                                <a>
                                    <p>완료</p>
                                    <p><strong>3</strong>ea</p>
                                </a>
                            </div>


                        </li>
                    </ul>
                    <div className="tbl__top">
                        <div className="right">
                            <div className="searcharea">
                                <div className="searchinput">
                                    <span>검색</span>
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected">
                                            <div className="selected-value">SPG명</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {listSearchList.map((search, idx) => (
                                                <li key={"search_" + idx.toString()} className="option" onClick={(e) => setSearchVal(search.value)}>{search.fnName}</li>
                                            ))}

                                        </ul>
                                    </div>
                                    <div className="input__direct">
                                        {(!searchText || !searchClose) &&
                                            <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                        }
                                        {(searchText || searchClose) &&
                                            <button type="button" className="btn btn-delete" onClick={(e) => searchClosed(e)} ><span className="hide">입력 창 닫기</span></button>
                                        }
                                    </div>
                                </div>
                                <button type="button" className="btn-search js-open-m3" data-pop="pop-search-small">
                                    <span>조회</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <!--221026 데이터 없음--> */}
                    <p className="nodata__txt h345">
                        데이터를 찾을 수 없습니다.
                    </p>
                    <div className="tbl-list">
                        <table summary="상태,요청 일자,접수번호, SPG 명,시리얼 번호,모델 명,불량원인,불량처리,첨부파일,진행 일자,완료 일자 항목으로 구성된 Basic e-HC List 입니다.">
                            <caption>
                                Basice-HCList
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className={`sort ${(sortData.sortField === "status") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-sm-none`}
                                        onClick={(e) => onClickSort(e)} data-value={"status"}>
                                        <span>상태</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "receptionDate") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-sm-none`}
                                        onClick={(e) => onClickSort(e)} data-value={"receptionDate"}>
                                        <span>요청 일자</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "receptionNo") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"receptionNo"}>
                                        <span>접수번호</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "spgName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-sm-none`}
                                        onClick={(e) => onClickSort(e)} data-value={"spgName"}>
                                        <span>SPG 명</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "serialNo") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"serialNo"}>
                                        <span>시리얼 번호</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "deviceName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"deviceName"}>
                                        <span>모델 명</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "cause") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"cause"}>
                                        <span>불량원인</span>
                                    </th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "handling") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"handling"}>
                                        <span>불량처리</span>
                                    </th>
                                    <th scope="col" className={`d-lm-none d-sm-none`}><span>첨부파일</span></th>
                                    <th scope="col" className={`sort ${(sortData.sortField === "handlingDate") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"handlingDate"}>
                                        <span>진행 일자</span>
                                    </th>
                                    <th ref={mobileTbRef} scope="col" className={`sort ${(sortData.sortField === "completionDate") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSort(e)} data-value={"completionDate"}>
                                        <span>완료 일자</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.map((list, idx) => (
                                    <tr key={"history_" + idx.toString()} className="js-open-m2" data-pop="pop-list-view"
                                        onClick={(isMobileTb || (mobileTbTag.clientHeight <= 0) && (mobileTbTag.clientWidth <= 0))
                                            ? null : null}>
                                        <td className="txt-left d-sm-none">
                                            {(list.status === "Receipt") ? "요청"
                                                : (list.status === "Arrangement") ? "접수"
                                                    : (list.status === "Treatment") ? "진행중"
                                                        : (list.status === "Completion") ? "완료" :
                                                            "No Data"}
                                        </td>
                                        <td className="txt-left d-sm-none">{CUTIL.utc2time("YYYY-MM-DD", list.receptionDate)}</td>
                                        <td className="txt-left">{list.receptionNo}</td>
                                        <td className="txt-left d-sm-none">{list.spgName}</td>
                                        <td className="d-lm-none d-sm-none txt-left"><p className="ellipsis">{list.serialNo}</p></td>
                                        <td className="txt-left"><p className="ellipsis">{list.deviceName}</p></td>
                                        <td className="d-lm-none d-sm-none txt-left"><p className="ellipsis">{list.cause}</p></td>
                                        <td className="d-lm-none d-sm-none txt-left"><p className="ellipsis">{list.handling}</p></td>
                                        <td className="d-lm-none d-sm-none">
                                            {(list.file) ?
                                                <button type="button" className="btn btn-file"><span className="hide">파일다운로드</span></button>
                                                :
                                                <button type="button" className="btn btn-file" disabled><span className="hide">파일다운로드</span></button>
                                            }
                                        </td>
                                        <td className="d-lm-none d-sm-none txt-left">{CUTIL.utc2time("YYYY-MM-DD", list.handlingDate)}</td>
                                        <td className="d-lm-none d-sm-none txt-left">{CUTIL.utc2time("YYYY-MM-DD", list.completionDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {(pageInfo) && <EhpPagination
                    componentName={"WorkOrderInspection"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />}
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역/-->*/}
            </div>
            {/*<!--//area__right, 오른쪽 영역/-->*/}

        </>
    )
}

export default WorkInspectioList;