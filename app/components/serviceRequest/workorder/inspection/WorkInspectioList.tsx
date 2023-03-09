/*
/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-20
 * @brief EHP WorkOrder - 점검 출동 개발
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
 * @brief EHP WorkOrder - 점검 출동 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function WorkInspectioList(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    /*    const isMobile = props.isMobile;
       const setIsMobile = props.setIsMobile;
    */
    const setParentPopWin = props.setPopWin;
    const setParentNodata = props.setNodata;
    const nodata = props.nodata;
    //화면 이동
    const navigate = useNavigate();
    //mobile check
    const [list, setList] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [isCount, setIsCount] = useState(false)
    const mobileRef = useRef(null); // Mobile Check용
    const counteRef = useRef(null)// CMoile Check용
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

            } else {
                setIsMobile(false);
            }
        }
    });
    // isMobile 여부 랜더링 후 확인 
    useDebounceEffect(
        async () => {
            if (mobileRef.current) {
                if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
                    setIsMobile(true);

                } else {
                    setIsMobile(false);
                }
            }
        }, 100, [list],
    )
    useEffect(() => { // resize handler Count
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
    // isCount 여부 랜더링 후 확인
    useDebounceEffect(
        async () => {
            if (mobileRef.current) {
                if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
                    setIsCount(true);
                }
            }
        }, 100)

    //
    const [requestCount, setRequestCount] = useState(null);
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
        { "id": 1, "dtDisp": t("FIELD.요청일자"), "dtVal": "receptionDate" },
        { "id": 2, "dtDisp": t("FIELD.진행일자"), "dtVal": "handlingDate" },
        { "id": 3, "dtDisp": t("FIELD.완료일자"), "dtVal": "completionDate" },
    ];
    const [dateType, setDateType] = useState(dateTypeList[0]);
    const dateTermList = [
        { "id": 0, "dtDisp": (!isCount) ? "직접입력" : t("LABEL.전체"), "dtVal": 0 },
        { "id": 1, "dtDisp": t("LABEL.T1개월", ["1"]), "dtVal": 30 },
        { "id": 2, "dtDisp": t("LABEL.T1개월", ["3"]), "dtVal": 90 },
        { "id": 3, "dtDisp": t("LABEL.T1개월", ["6"]), "dtVal": 180 },
        { "id": 4, "dtDisp": t("LABEL.T1년", ["1"]), "dtVal": 365 },
    ];
    const [dateTerm, setDateTerm] = useState(dateTermList[4]);
    // board List
    const [dateSel,setDateSel] = useState(null);
    //
    let appPath = "category=HISTORY";
    ///
    const [searchCount, setSearchCount] = useState({
        "dateType": null,
        "dateTerm": null,
        "startDate": null,
        "endDate": null,
    });


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
    }, [dateType])
    // 검색 후 초기화 필요
    /*   function resetSearchCount(isAll) {
          if (isAll) {
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
                    setDateType((searchCount.dateType) && searchCount.dateType );
                   setDateTerm((searchCount.dateTerm)&& searchCount.dateTerm );
                   setStartDate(searchCount.startDate);
                   setEndDate(searchCount.endDate); 
          } else {
              if (!isMobile) { // mobile에서는 엑션이 밣생 안하도록 / term에서 액션이 발생 / dateKind 값 변경 시 select 초기화(전체) 
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
              } else {
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
  
              }
          }
      }
   */

    if (searchCount.dateType && (searchCount.dateType.dtVal.length > 0)) {
        if ((!CUTIL.isnull(searchCount.startDate)) && (!CUTIL.isnull(searchCount.startDate))) {
            appPath = appPath
                + `&dateKind=${searchCount.dateType.dtVal}`
                + `&startDate=${CUTIL.date2formedstr(searchCount.startDate, "YYYYMMDD")}`
                + `&endDate=${CUTIL.date2formedstr(searchCount.endDate, "YYYYMMDD")}`
        }
    }
    /////////////////
    const [serviceStatus, setServiceStatus] = useState("");//"":ALL, Requested, accepted, ing, done


    const searchFieldList = [
        { "id": 0, "sfDisp": t("FIELD.기기명"), "sfVal": "spgName" },
        { "id": 1, "sfDisp": "불량원인", "sfVal": "cause" },
        { "id": 2, "sfDisp": "불량처리", "sfVal": "handling" },
        { "id": 3, "sfDisp": t("FIELD.시리얼번호"), "sfVal": "serialNo" }, ,
        { "id": 4, "sfDisp": t("FIELD.모델명"), "sfVal": "itemName" },
    ];
    const [searchField, setSearchField] = useState(searchFieldList[0]);
    const [searchText, setSearchText] = useState("");
    const [searchData, setSearchData] = useState({
        "searchField": null,
        "searchText": null,
    });

    const [fieldList, setFieldList] = useState([
        { "id": 0, "fdDisp": "상태", "fdVal": "status", "sort": "asc", "click": false },
        { "id": 1, "fdDisp": "요청 일자", "fdVal": "receptionDate", "sort": "asc", "click": false },
        { "id": 2, "fdDisp": "접수번호", "fdVal": "receptionNo", "sort": "asc", "click": false },
        { "id": 3, "fdDisp": "기기명", "fdVal": "spgName", "sort": "asc", "click": false },
        { "id": 4, "fdDisp": "시리얼 번호", "fdVal": "serialNo", "sort": "asc", "click": false },
        { "id": 5, "fdDisp": "모델명", "fdVal": "deviceName", "sort": "asc", "click": false },
        { "id": 6, "fdDisp": "불량원인", "fdVal": "cause", "sort": "asc", "click": false },
        { "id": 7, "fdDisp": "불량처리", "fdVal": "handling", "sort": "asc", "click": false },
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
    if (serviceStatus.length > 0) {
        listPath = listPath + `&status=${serviceStatus}`;
    }
    //text검색
    if (searchData.searchField) {
        if (searchData.searchField.sfVal.length > 0) {
            listPath = listPath + `&stringSearch=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
        }
    }

    //필드 정렬
    fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
        listPath = listPath + `&sort=${fd.fdVal},${fd.sort}`
    })


    // clog("IN EHC LIST : APP PATH : " + appPath);
    //clog("XX : " + JSON.stringify(dateType) + " / " + JSON.stringify(dateTerm) + " / " + startDate);
    // clog("IN EHC LIST : LIST PATH: " + listPath + " : " + JSON.stringify(searchData));
    // clog("IN EHC LIST : SEARCH TEXT : " + searchText);
    const [listReload, setListReload] = useState(false);
    const [errorList, setErrorList] = useState([]);
    //{menuCode, menuName, errList : {}}
    //[{"field":"menuName","msg":"필수 항목입니다."}]
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/customerserviceapply/history/board?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: appPath + listReload
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
                        "appPath": `/api/v2/customerserviceapply/history?page=${pageInfo.number}&size=${pageInfo.size}&${listPath}`,
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
                            setRequestCount(retData.body);
                            // resetSearchCount(true); // reset
                            setList(data.body);
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
    }, [retData, listPath, pageInfo.number])
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
        // clog("MOBILE CHECK : DATE TERM : " + dtDiv.clientHeight + " X " + dtDiv.clientWidth);
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


    function onClickEhcDetailView(e, list) {
        // search 기준으로 모바일 태블릿 check
        var schDiv = document.querySelector("#mcheck_searchinput");

        var isSchMobile = (schDiv.clientHeight <= 0) && (schDiv.clientWidth <= 0) ? true : false;
        if (!isSchMobile) {
            var popupVal = e.target.getAttribute("data-pop");
            if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-list-view");

            popupVal = e.target.getAttribute("data-ds-height");
            if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "496");
        }

        setParentPopWin("pop-list-view",
            <MobileEhcDetailView
                htmlHeader={<h1>점검출동 {t("LABEL.상세정보")}</h1>}
                list={list}
                setPopWin={props.setPopWin}
            />
        );
        CUTIL.jsopen_m2_Popup(e, isMobile);
    }
    ///
    useEffect(() => {
        setParentPopWin("pop-search-small",
            <MobilePopupSearch
                searchFieldList={searchFieldList}
                setSearchField={setSearchField}
                searchText={searchText}
                setSearchText={setSearchText}
                goSearch={goSearch}
            />
        );
    })  //re-rendering을 모바일 화면까지 전달하기 위해...
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
        (isSchMobile) && CUTIL.jsopen_m3_Popup(e, isSchMobile);
        (!isSchMobile) && goSearch(e);
        handleCurPage(0);

    }

    function goSearch(e) {
        clog("goSearch : " + JSON.stringify(searchField));
        setSearchData({
            "searchField": searchField,
            "searchText": searchText,
        });
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
                                {/*<!--221024, label 클래스 추가및 태그 안 셀렉트로 변경-->*/}
                                <label htmlFor="term" className="mt-0 ">
                                    <div className="select noline" onClick={(e) => CUTIL.onClickSelect(e, selectOptionDateType)}>
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
                                                <div className="selected-value">{dateTermList[4].dtDisp}</div>
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
                <h2 className="mb-24">점검출동 Work Order</h2>
                {/*<!--area__right_content, 오른쪽 컨텐츠 영역/-->*/}
                <div className="area__right_content">
                    {/*<!--선택됐을때 div에 on 클래스 / 완료된것 end 넣어서 액션 구현해주세요~ /-->*/}
                    {(requestCount) &&
                        <ul className="checkstatus-box">
                            <li>
                                <div className={(serviceStatus === "") ? "on" : ""}>
                                    <a href="#" onClick={(e) => handleServiceStatus("")}>
                                        <p>{t("LABEL.전체")}</p>
                                        <p><strong>{requestCount.totalCount}</strong>ea</p>
                                    </a>
                                </div>
                            </li>
                            <li>
                                <div className={(serviceStatus === "Receipt") ? "on" : ""}>
                                    <a href="#" onClick={(e) => handleServiceStatus("Receipt")}>
                                        <p>{t("LABEL.요청")}</p>
                                        <p><strong>{requestCount.receiptCount}</strong>ea</p>
                                    </a>
                                </div>
                                <div className={(serviceStatus === "Arrangement") ? "on" : ""}>
                                    <a href="#" onClick={(e) => handleServiceStatus("Arrangement")}>
                                        <p>{t("LABEL.접수")}</p>
                                        <p><strong>{requestCount.arrangementCount}</strong>ea</p>
                                    </a>
                                </div>
                                <div className={(serviceStatus === "Treatment") ? "on" : ""}>
                                    <a href="#" onClick={(e) => handleServiceStatus("Treatment")}>
                                        <p>{t("LABEL.진행중")}</p>
                                        <p><strong>{requestCount.treatmentCount}</strong>ea</p>
                                    </a>
                                </div>
                                <div className={(serviceStatus === "Completion") ? "on" : ""}>
                                    <a href="#" onClick={(e) => handleServiceStatus("Completion")}>
                                        <p>{t("LABEL.완료")}</p>
                                        <p><strong>{requestCount.completionCount}</strong>ea</p>
                                    </a>
                                </div>
                            </li>
                        </ul>
                    }
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
                                    data-pop="pop-search-small"
                                    onClick={(e) => onClickSearch(e)}
                                >
                                    <span>{t("LABEL.조회")}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* <!--221026 데이터 없음--> */}
                    <p className="nodata__txt ">
                        데이터를 찾을 수 없습니다.
                    </p>
                    <div className="tbl-list hcal-vh-560">
                        <table summary="상태,요청 일자,접수번호, SPG 명,시리얼 번호,모델 명,불량원인,불량처리,첨부파일,진행 일자,완료 일자 항목으로 구성된 Basic e-HC List 입니다.">
                            <caption>
                                Basice-HCList
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "status").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("status")}>
                                        <span>{t("FIELD.상태")}</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "receptionDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("receptionDate")}>
                                        <span>{t("FIELD.요청일자")}</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "receptionNo").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                        onClick={(e) => onClickSortField("receptionNo")}>
                                        {/* <span>{t("FIELD.접수번호")}</span> */}
                                        <span>접수번호</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "spgName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("spgName")}>
                                        <span>{t("FIELD.기기명")}</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "serialNo").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")}  d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("serialNo")}>
                                        <span>{t("FIELD.시리얼번호")}</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "deviceName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left `}
                                        onClick={(e) => onClickSortField("deviceName")}>
                                        <span>{t("FIELD.모델명")}</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "cause").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("cause")}>
                                        <span>불량원인</span>
                                    </th>
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "handling").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("handling")}>
                                        <span>불량처리</span>
                                    </th>
                                    {/* <th scope="col" className={`d-lm-none d-sm-none `}><span>첨부파일</span></th> */}
                                    <th scope="col" className={`${fieldList.filter(fd => fd.fdVal === "handlingDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("handlingDate")}>
                                        <span>진행 일자</span>
                                    </th>
                                    <th ref={mobileRef} scope="col" className={`${fieldList.filter(fd => fd.fdVal === "completionDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")}  d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("completionDate")}>
                                        <span>완료 일자</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {lists.map((list, idx) => (
                                    <tr key={"history_" + idx.toString()} className="js-open-m2" data-pop="pop-list-view"
                                        onClick={(e) => onClickEhcDetailView(e, list)}>
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
                                        {/*          <td className="d-lm-none d-sm-none ">
                                             {(list.file) ?
                                                <button type="button" className="btn btn-file"><span className="hide">파일다운로드</span></button>
                                                :
                                                <button type="button" className="btn btn-file" disabled><span className="hide">파일다운로드</span></button>
                                            } 
                                        </td> */}
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
    //props
    const list = (props.list === null) ? null : props.list;
    const setParentPopWin = props.setPopWin;

    function onClickClose(e) {

        CUTIL.jsclose_Popup("pop-list-view");
        setParentPopWin("pop-list-view", null);
    }

    return (
        <>
            {/* <!--리스트 상세 보기 팝업--> */}
            <div className="popup__body">
                <div className="area__right_content workplace__info">
                    <div className="content__info">
                        <h3 className="hide">리스트 상세 정보</h3>
                        <ul>
                            <li>
                                <p className="tit">상태</p>
                                <p className="txt">
                                    {(list.status === "Receipt") ? "요청"
                                        : (list.status === "Arrangement") ? "접수"
                                            : (list.status === "Treatment") ? "진행중"
                                                : (list.status === "Completion") ? "완료" :
                                                    "No Data"}
                                </p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.요청일자")}</p>
                                <p className="txt">{CUTIL.utc2time("YYYY-MM-DD", list.receptionDate)}</p>
                            </li>
                            <li>
                                <p className="tit">접수번호</p>
                                <p className="txt">{list.receptionNo}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.기기명")}</p>
                                <p className="txt">{list.spgName}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.시리얼번호")}</p>
                                <p className="txt">{list.serialNo}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.모델명")}</p>
                                <p className="txt">{list.deviceName}</p>
                            </li>
                            <li>
                                <p className="tit">불량원인</p>
                                <p className="txt">{list.cause}</p>
                            </li>
                            <li>
                                <p className="tit">불량처리</p>
                                <p className="txt">{list.handling}</p>
                            </li>
                            {/*    <li>
                                <p className="tit">{t("FIELD.첨부파일")}</p>
                                <ul className="filelist down">
                                    {(list.file) &&
                                        < li >
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-filedown"><span className="hide">다운로드</span></button>
                                        </li>
                                    }
                                </ul>
                            </li> */}
                            <li>
                                <p className="tit">{t("FIELD.진행일자")}</p>
                                <p className="txt">{CUTIL.utc2time("YYYY-MM-DD", list.handlingDate)}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.완료일자")}</p>
                                <p className="txt">{CUTIL.utc2time("YYYY-MM-DD", list.completionDate)}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="btn__wrap">
                        <button type="button" className="js-close" onClick={(e) => onClickClose(e)}><span>확인</span></button>
                    </div>
                </div>
            </div >
            {/* <!--//리스트 상세 보기 팝업--> */}

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