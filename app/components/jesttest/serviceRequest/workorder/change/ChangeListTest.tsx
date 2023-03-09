/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP workorder - 노후 교체 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useRef, useState, DependencyList } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../../recoil/userState";
import { loadingBoxState } from "../../../../../recoil/menuState";
import { langState } from '../../../../../recoil/langState';
//ex-utils
//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";

// utils
import clog from "../../../../../utils/logUtils";
import * as CONST from "../../../../../utils/Const"
import * as CUTIL from "../../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../../../common/pagination/EhpPagination";
import { useTrans } from "../../../../../utils/langs/useTrans";
/**
* @brief EHP Service - workorder 개발 컴포넌트, 반응형 동작
* @param param0 width:<number>: 화면(브라우저) 가로 사이즈
* @param param1 height:<number>: 화면(브라우저) 세로 사이즈
* @returns react components
*/


function ChangeList(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const isTreeOpen = props.isTreeOpen;
    const isMobile = props.isMobile;
    const nodata = props.nodata;
    const setParentAdminType = props.setAdminType;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const setParentIsMobile = props.setIsMobile;
    const setParentNodata = props.setNodata;

    //화면 이동
    const navigate = useNavigate();
    //mobile check
    const [changeList, setChangeList] = useState([]);
    const mobileRef = useRef(null); // Mobile Check용
    useEffect(() => { // resize handler
        // Mobile 체크
        function handleResize() {
            if (CUTIL.isnull(mobileRef)) return;
            const mobileTag = mobileRef.current;
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                setParentIsMobile(true);
            } else {
                setParentIsMobile(false);
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
                setParentIsMobile(true);
            } else {
                setParentIsMobile(false);
            }
        }
    }, []);
    // isMobile 여부 랜더링 후 확인
    useDebounceEffect(
        async () => {
            if (mobileRef.current) {
                if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
                    setParentIsMobile(true);
                    if (nodata <= 0) {
                        setParentIsMobile(false);
                    }
                }
            }
        }, 100, [changeList, nodata],
    )
    //
    const [changeCount, setChangeCount] = useState(null);
    //const [changeList, setChangeList] = useState([]);
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }
    // date List
    const exceptStartDate = new Date(new Date().setDate(new Date().getDate() - 365));
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const dateTypeList = [
        /*{"id":0, "dtDisp":"전체", "dtVal":""},*/
        { "id": 1, "dtDisp": t("FIELD.요청일자"), "dtVal": "requestDate" },
        { "id": 2, "dtDisp": t("FIELD.진행일자"), "dtVal": "handlingDate" },
        { "id": 3, "dtDisp": t("FIELD.완료일자"), "dtVal": "completionDate" },
    ];
    const [dateType, setDateType] = useState(dateTypeList[0]);
    const dateTermList = [
        { "id": 0, "dtDisp": t("LABEL.전체"), "dtVal": 0 },
        { "id": 1, "dtDisp": t("LABEL.T1개월", ["1"]), "dtVal": 30 },
        { "id": 2, "dtDisp": t("LABEL.T1개월", ["3"]), "dtVal": 90 },
        { "id": 3, "dtDisp": t("LABEL.T1개월", ["6"]), "dtVal": 180 },
        { "id": 4, "dtDisp": t("LABEL.T1년", ["1"]), "dtVal": 365 },
    ];
    const [dateTerm, setDateTerm] = useState(dateTermList[0]);
    //
    let appPath = "";

    const [searchCount, setSearchCount] = useState({
        "dateType": null,
        "dateTerm": null,
        "startDate": null,
        "endDate": null,
    });
    // 검색 후 초기화 필요
    function resetSearchCount(isAll) {
        clog("resetSearchCount : isMobile : " + isMobile);
        if (isAll) {
            setDateType((searchCount.dateType) ? searchCount.dateType : dateTypeList[0]);
            setDateTerm((searchCount.dateTerm) ? searchCount.dateTerm : dateTermList[0]);
            setStartDate(searchCount.startDate);
            setEndDate(searchCount.endDate);
        } else {
            if (!isMobile) { // mobile에서는 엑션이 밣생 안하도록 / term에서 액션이 발생
                setDateTerm(dateTermList[0]);
                setStartDate(null);
                setEndDate(null);
            }
        }
    }
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
    }

    const searchFieldList = [
        //{"id":0, "sfDisp":"전체", "sfVal":""},
        { "id": 1, "sfDisp": t("FIELD.기기명"), "sfVal": "spgName" },
        { "id": 2, "sfDisp": t("FIELD.Panel명"), "sfVal": "panelName" },
        { "id": 3, "sfDisp": t("FIELD.시리얼번호"), "sfVal": "serialNo" },
        { "id": 3, "sfDisp": t("FIELD.모델명"), "sfVal": "itemName" },
    ];
    const [searchField, setSearchField] = useState(searchFieldList[0]);
    const [searchText, setSearchText] = useState("");
    const [searchData, setSearchData] = useState({
        "searchField": null,
        "searchText": null,
    });
    const [fieldList, setFieldList] = useState([
        { "id": 0, "fdDisp": "상태", "fdVal": "progressStatus", "sort": "asc", "click": false },
        { "id": 1, "fdDisp": "요청 일자", "fdVal": "requestDate", "sort": "asc", "click": false },
        { "id": 2, "fdDisp": "기기명", "fdVal": "spgName", "sort": "asc", "click": false },
        { "id": 3, "fdDisp": "Panel 명", "fdVal": "panelName", "sort": "asc", "click": false },
        { "id": 4, "fdDisp": "모델 명", "fdVal": "itemName", "sort": "asc", "click": false },
        { "id": 5, "fdDisp": "시리얼 번호", "fdVal": "serialNo", "sort": "asc", "click": false },
        { "id": 6, "fdDisp": "진행 일자", "fdVal": "handlingDate", "sort": "asc", "click": false },
        { "id": 7, "fdDisp": "완료 일자", "fdVal": "completionDate", "sort": "asc", "click": false },
    ]);

    //검색 카운트별 검색 전체/요청/...
    let listPath = appPath;
    if (serviceStatus.length > 0) {
        listPath = listPath + `&serviceStatus=${serviceStatus}`;
    }
    //text검색
    if (searchData.searchField) {
        if (searchData.searchField.sfVal.length > 0) {
            listPath = listPath + `&searchKind=${searchData.searchField.sfVal}&stringLike=${searchData.searchText}`;
        }
    }
    //필드 정렬
    fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
        listPath = listPath + `&sort=${fd.fdVal},${fd.sort}`
    })


    clog("IN EHC LIST : APP PATH : " + appPath);
    //clog("XX : " + JSON.stringify(dateType) + " / " + JSON.stringify(dateTerm) + " / " + startDate);
    clog("IN EHC LIST : LIST PATH: " + listPath + " : " + JSON.stringify(searchData));
    clog("IN EHC LIST : SEARCH TEXT : " + searchText);
    const [listReload, setListReload] = useState(false);
    const [errorList, setErrorList] = useState([]);
    //{menuCode, menuName, errList : {}}
    //[{"field":"menuName","msg":"필수 항목입니다."}]
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/panel/item/devicechangecount?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: selTree + appPath + listReload
        //watch: selTree.company.companyId+selTree.reload
    });

    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
            if (ERR_URL.length > 0) {
                setRecoilIsLoadingBox(false);
                navigate(ERR_URL);
            }
            //setRecoilIsLoadingBox(false);
            clog("IN WF EHC COUNT : RES : " + JSON.stringify(retData));
            if (retData.codeNum == CONST.API_200) {
                (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
                    let data: any = null;
                    //setRecoilIsLoadingBox(true);
                    data = await HTTPUTIL.PromiseHttp({
                        "httpMethod": "GET",
                        "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/devicechange?page=${pageInfo.number}&size=${pageInfo.size}&${listPath}`, //pageInfo.number 로 페이지 이동
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
                            //clog("IN WF EHC LIST : RES : " + JSON.stringify(data.body));
                            console.log("list", data);

                            setChangeCount(retData.body);
                            resetSearchCount(true); // reset
                            setChangeList(data.body);
                            setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10
                            setParentNodata(data.data.page.totalElements);
                        } else { // api if
                            // need error handle -> goto system error page?
                            setErrorList(data.body.errorList);
                            alert(JSON.stringify(data.body.errorList));
                        }
                    }
                })();
            }
        }
    }, [selTree, retData, listPath, pageInfo.number])
    //////////////////

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
        resetSearchCount(false);
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
                "dateType": dateType,
                "dateTerm": dateTerm,
                "startDate": startDate,
                "endDate": endDate,
            }
        )
    }
    function onClickSearchCount(e) {
        doSearchCount();
    }

    function onClickSortField(fieldVal) {
        setFieldList(
            fieldList.map(fd =>
                (fd.fdVal === fieldVal)
                    ? { ...fd, "sort": (fd.sort === "asc") ? "desc" : "asc", "click": true }
                    : { ...fd, "sort": "asc", "click": false }) // 단일 필드 정렬만....
        );

    }


    function onClickEhcDetailView(e, list) {
        setParentPopWin("pop-list-view",
            <MobileEhcDetailView
                htmlHeader={<h1>노후교체 컨설팅 {t("LABEL.상세정보")}</h1>}
                list={list}
            />
        );

    }
    ///
    useEffect(() => {
        /*  setParentPopWin("pop-search-small",
             <MobilePopupSearch
                 searchFieldList={searchFieldList}
                 setSearchField={setSearchField}
                 searchText={searchText}
                 setSearchText={setSearchText}
                 goSearch={goSearch}
             />
         ); */
    }) //re-rendering을 모바일 화면까지 전달하기 위해...
    function onClickSearch(e) {
        // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
        var schDiv = document.querySelector("#mcheck_searchinput");
        clog("MOBILE CHECK : TEXT SEARCH : " + schDiv.clientHeight + " X " + schDiv.clientWidth);
        var isSchMobile = (schDiv.clientHeight <= 0) && (schDiv.clientWidth <= 0) ? true : false;

        (isSchMobile) && setParentPopWin("pop-search-small",
            <MobilePopupSearch
                searchFieldList={searchFieldList}
                setSearchField={setSearchField}
                searchText={searchText}
                setSearchText={setSearchText}
                goSearch={goSearch}
            />
        );

    }

    function goSearch(e) {
        clog("goSearch : " + JSON.stringify(searchField));
        setSearchData({
            "searchField": searchField,
            "searchText": searchText,
        });
    }




    return (
        <>
            <div className="area__right" style={{ "width": `${(isTreeOpen) ? "calc(100% - 320px)" : "calc(100% - 40px)"}` }}>
                {/*<!--검색영역-->*/}
                <div className="area__top">
                    <div className="search">
                        <ul className="form__input">
                            <li>
                                {/*<!--221024, label 클래스 추가및 태그 안 셀렉트로 변경-->*/}
                                <label htmlFor="term" className="mt-0 w96">
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionDateType)}>
                                        <div className="selected">
                                            {/*<div className="selected-value">{(dateType)?dateType.dtDisp:(searchCount.dateType)?searchCount.dateType.dtDisp:dateTypeList[0].dtDisp}</div>*/}
                                            <div className="selected-value">{dateTypeList[0].dtDisp}</div>
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
                                                {/*<div className="selected-value">{(dateTerm)?dateTerm.dtDisp:(searchCount.dateTerm)?searchCount.dateTerm.dtDisp:dateTermList[0].dtDisp}</div>*/}
                                                <div className="selected-value">{dateTermList[0].dtDisp}</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {dateTermList.map((dt, idx) => (
                                                    <li key={`dt_${idx.toString()}`}
                                                        className="option"
                                                        data-value={JSON.stringify(dt)}
                                                    >{dt.dtDisp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/*clog("FE LANG : " + langs)*/}
                                        <div className="term__date" id="mcheck_term__date">
                                            <DatePicker
                                                todayButton="today"
                                                dateFormat="yyyyMMdd"
                                                selected={startDate}
                                                maxDate={endDate}
                                                minDate={exceptStartDate}
                                                onChange={(date) => setStartDate(date)}
                                            />
                                            <span className="centerline">~</span>
                                            <DatePicker
                                                todayButton="today"
                                                dateFormat="yyyyMMdd"
                                                selected={endDate}
                                                minDate={(startDate) ? startDate : exceptStartDate}
                                                onChange={(date) => setEndDate(date)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="btn__wrap">
                            <button type="button" className="btn-search"
                                data-testid="search1"
                            >
                                <span>조회1</span>
                            </button>
                        </div>
                    </div>
                </div>
                <h2 className="mb-24">노후교체 요청  Work Order </h2>
                {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}

                <div className="area__right_content">
                    {/*<!--선택됐을때 div에 on 클래스 (221024, 액션 end 클래스 삭제,디자인변경됨) -->*/}
                    <ul className="checkstatus-box">
                        {/*"":ALL, Requested, accepted, ing, done */}
                        <li>
                            <div className={"on"}>
                                <a href="#">
                                    <p>전체</p>
                                    <p><strong>11</strong>ea</p>
                                </a>
                            </div>
                        </li>
                        <li>
                            <div className={"on"}>
                                <a href="#">
                                    <p>요청</p>
                                    <p><strong>2</strong>ea</p>
                                </a>
                            </div>
                            <div className={"on"}>
                                <a href="#">
                                    <p>접수</p>
                                    <p><strong>9</strong>ea</p>
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
                                            <div className="selected-value">{searchFieldList[0].sfDisp}</div>
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
                                    data-testid="search2"
                                    data-pop="pop-search-small"
                                >
                                    <span>조회2</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <!--221026 데이터 없음--> */}
                    <p className="nodata__txt h345">
                        {t("MESSAGE.데이터를찾을수없습니다")}
                    </p>
                    <div className="tbl-list">
                        <table summary="상태,점검단계,요청 일자,접수번호, SPG 명,Panel 명,시리얼 번호,담당자,점검일자,Step,Report,진행 일자,완료 일자 항목으로 구성된 e-HC Work Order List 입니다.">
                            <caption>
                                e-HC Work Order List
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <span>상태</span>
                                    </th>
                                    <th scope="col">
                                        <span>요청 일자</span>
                                    </th>
                                    <th scope="col">
                                        <span>기기 명</span>
                                    </th>
                                    <th scope="col">
                                        <span>Panel 명</span>
                                    </th>
                                    <th scope="col">
                                        <span>모델 명</span>
                                    </th>

                                    <th scope="col">
                                        <span>시리얼 번호</span>
                                    </th>
                                    <th scope="col">
                                        <span>진행 일자</span>
                                    </th>
                                    <th scope="col">
                                        <span>완료 일자</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="txt-left d-sm-none">요청</td>
                                    <td className="txt-left d-sm-none">	2022-11-16</td>
                                    <td className="txt-left">GIS</td>
                                    <td className="txt-left"><p className="ellipsis">NO_PANEL</p></td>
                                    <td className="txt-left d-sm-none"><p className="ellipsis">dddd_00099911</p></td>
                                    <td className="txt-left d-lm-none d-sm-none"><p className="ellipsis">1005-88885</p></td>
                                    <td className="txt-left d-lm-none d-sm-none">-</td>
                                    <td className="txt-left d-lm-none d-sm-none">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <EhpPagination
                    componentName={"WORKFLOW-CHANGE"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
            </div>
            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default ChangeList;


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




function MobileEhcDetailView(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);

    const list = props.list;

    // PDF 다운로드
    function onClickReportDownload(ehc) {
        HTTPUTIL.fileDownload_EhcReport(ehc.itemName, ehc.assessment.reportId, userInfo.loginInfo.token);
    }


    function onClickClose(e) {

        CUTIL.jsclose_Popup("pop-list-view");
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
                                <p className="txt">{list.progressStatus}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.요청일자")}</p>
                                <p className="txt">{(list.requestDate) ? CUTIL.utc2formedstr(list.requestDate, "YYYY-MM-DD") : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.기기명")}</p>
                                <p className="txt">{list.spg.spgName}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.Panel명")}</p>
                                <p className="txt">{list.panel.panelName}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.모델명")}</p>
                                <p className="txt">{list.modelName}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.시리얼번호")}</p>
                                <p className="txt">{(list.serialNo) ? list.serialNo : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.진행일자")}</p>
                                <p className="txt">{(list.handlingDate) ? CUTIL.utc2formedstr(list.handlingDate, "YYYY-MM-DD") : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.완료일자")}</p>
                                <p className="txt">{(list.completionDate) ? CUTIL.utc2formedstr(list.completionDate, "YYYY-MM-DD") : "-"}</p>
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
                            <div className="selected-value">{searchFieldList[0].sfDisp}</div>
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