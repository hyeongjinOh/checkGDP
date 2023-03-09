/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState, DependencyList } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";
import { langState } from '../../../recoil/langState';
//ex-utils
//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
import "react-datepicker/dist/react-datepicker.css";

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../common/pagination/EhpPagination";

function EhealthCheckList(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const isTreeOpen = props.isTreeOpen;
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const setParentIsMobile = props.setIsMobile;

    //화면 이동
    const navigate = useNavigate();
    //mobile check
    const [ehcList, setEhcList] = useState([]);
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
                //setParentIsMobile(true);
            } else {
                //setParentIsMobile(false);
            }
        }
    }, []);
    // isMobile 여부 랜더링 후 확인
    useDebounceEffect(
        async () => {
            if (mobileRef.current) {
                if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
                    setParentIsMobile(true);
                }
            }
        }, 100, [ehcList],
    )

    //
    const [ehcCount, setEhcCount] = useState(null);
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
    //const [ehcList, setEhcList] = useState([]);
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const dateTypeList = [
        { "id": 0, "dtDisp": "전체", "dtVal": "" },
        { "id": 1, "dtDisp": "요청일자", "dtVal": "requestDate" },
        { "id": 2, "dtDisp": "진행일자", "dtVal": "handlingDate" },
        { "id": 3, "dtDisp": "완료일자", "dtVal": "completionDate" },
    ];
    const [dateType, setDateType] = useState(dateTypeList[0]);
    const [searchDate, setSearchDate] = useState(null);
    //
    const searchFieldList = [
        { "id": 0, "sfDisp": "전체", "sfVal": "" },
        { "id": 1, "sfDisp": "기기명", "sfVal": "" },
        { "id": 2, "sfDisp": "PANEL명", "sfVal": "" },
        { "id": 3, "sfDisp": "담당자", "sfVal": "" },
    ];
    const [searchField, setSearchField] = useState(searchFieldList[0]);
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

    let appPath = "";
    //appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
    // if (selTree.zone.zoneId.length > 0) {
    //     appPath = appPath + `&zoneId=${selTree.zone.zoneId}`
    // }
    // if (selTree.subZone.subZoneId.length > 0) {
    //     appPath = appPath + `&subZoneName=${selTree.subZone.subZoneName}`
    // }
    // if (searchDate && (searchDate.dateType.dtVal.length > 0)) {
    //     clog("TIEM : " + startDate.toISOString());
    //     //clog("TIEM : " + startDate.);

    //     appPath = appPath +
    //         `&dateKind=${searchDate.dateType.dtVal}&startDate=${CUTIL.date2formedstr(searchDate.startDate, "yyyyMMdd")}&endDate=${CUTIL.date2formedstr(searchDate.endDate, "yyyyMMdd")}`
    // }
    //검색 리스트
    let listPath = appPath;
    if (serviceStatus.length > 0) {
        listPath = listPath + `&serviceStatus=${serviceStatus}`;
    }
    // desc 만 정렬 조건으로 ...
    fieldList.map((fd) => {
        //clog("sort check : " + `${fd.fdVal},${fd.sort}`);
    })
    //clog("desc count : " + fieldList.filter(fd=>fd.sort==="desc").length);

    //  if ( fieldList.filter(fd=>fd.sort==="desc").length > 0) {
    //listPath = listPath + "&sort=";
    fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
        //if (fd.sort) {
        listPath = listPath + `&sort=${fd.fdVal},${fd.sort}`
        //}
    })
    //  }

    //&sort=completionDate,
    //clog("IN EHC LIST : APP PATH : " + appPath);
    //clog("IN EHC LIST : LIST PATH: " + listPath);
    const [listReload, setListReload] = useState(false);
    const [errorList, setErrorList] = useState([]);
    //{menuCode, menuName, errList : {}}
    //[{"field":"menuName","msg":"필수 항목입니다."}]
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
                        "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/workorder?page=${pageInfo.number}&size=${pageInfo.size}&${listPath}`,
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
                            setEhcCount(retData.body);
                            setEhcList(data.body);
                            setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10
                        } else { // api if
                            // need error handle -> goto system error page?
                            setErrorList(data.body.errorList);
                            alert(JSON.stringify(data.body.errorList));
                        }
                    }
                })();
            }
        }
    }, [selTree, retData, listPath])

    // option 선택 시  값 변경 액션
    function selectOptionDateType(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        setDateType(JSON.parse(optionData));
    }
    // option 선택 시  값 변경 액션
    function selectOptionSearchField(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        setSearchField(JSON.parse(optionData));
    }
    function onClickSearchTotal(e) {
        if ((dateType.dtVal.length > 0) && CUTIL.isnull(startDate)) {
            alert("시작날짜를 입력하세요.");
            return;
        }
        if ((dateType.dtVal.length > 0) && CUTIL.isnull(endDate)) {
            alert("종료날짜를 입력하세요.");
            return;
        }
        setSearchDate(
            {
                "dateType": dateType,
                "startDate": startDate,
                "endDate": endDate,
            }
        )
    }

    function onClickSortField(fieldVal) {
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
        setParentPopWin("pop-list-ehcdetailview",
            <MobileEhcDetailView
                htmlHeader={<h1>e-HC Work Order 상세정보</h1>}
                ehcInfo={ehc}
            />
        );
    }

    return (
        <>
            {/*<!--//area__left, 왼쪽 영역-->*/}
            <div className="area__right" style={{ "width": `${(isTreeOpen) ? "calc(100% - 320px)" : "calc(100% - 40px)"}` }}>
                <ul className="page-loca">
                    <li>데이타솔루션</li>
                    <li>학동</li>
                </ul>
                {/*<!--검색영역-->*/}
                <div className="area__top">
                    <div className="search">
                        <ul className="form__input">
                            <li>
                                {/*<!--221024, label 클래스 추가및 태그 안 셀렉트로 변경-->*/}
                                <label htmlFor="term" className="mt-0 w96">
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionDateType)}>
                                        <div className="selected">
                                            <div className="selected-value">전체</div>
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
                                        <div className="select term__month" onClick={(e) => CUTIL.onClickSelect(e, selectOptionDateType)}>
                                            <div className="selected">
                                                <div className="selected-value">전체</div>
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
                                        <div className="term__date">
                                            <DatePicker
                                                todayButton="today"
                                                dateFormat="yyyyMMdd"
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                            />
                                            <span className="centerline">~</span>
                                            <DatePicker
                                                todayButton="today"
                                                dateFormat="yyyyMMdd"
                                                selected={endDate}
                                                minDate={startDate}
                                                onChange={(date) => setEndDate(date)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="btn__wrap">
                            <button type="button" data-testid="searchTest" className="btn-search">
                                <span>조회1</span>
                            </button>
                        </div>
                    </div>
                </div>
                <h2 className="mb-24">
                    e-HC Work Order
                    <p className="txt-info fontRegular mt-8">* Work Order는 LS일렉트릭의 Engineer에게 e-HC [Premium] , [Advanced] 점검을 요청한 내역만 표시됩니다.</p>
                </h2>
                {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}

                <div className="area__right_content">
                    {/*<!--선택됐을때 div에 on 클래스 (221024, 액션 end 클래스 삭제,디자인변경됨) -->*/}
                    <ul className="checkstatus-box">
                        {/*"":ALL, Requested, accepted, ing, done */}
                        <li>
                            <div className={(serviceStatus === "") ? "on" : ""}>
                                <a href="#" onClick={(e) => handleServiceStatus("")}>
                                    <p>전체1</p>
                                    <p><strong>8</strong>ea</p>
                                </a>
                            </div>
                        </li>
                        <li>
                            <div className={(serviceStatus === "REQUESTED") ? "on" : ""}>
                                <a href="#" onClick={(e) => handleServiceStatus("REQUESTED")}>
                                    <p>요청</p>
                                    <p><strong>4</strong>ea</p>
                                </a>
                            </div>
                            <div className={(serviceStatus === "ACCEPTED") ? "on" : ""}>
                                <a href="#" onClick={(e) => handleServiceStatus("ACCEPTED")}>
                                    <p>접수</p>
                                    <p><strong>2</strong>ea</p>
                                </a>
                            </div>
                            <div className={(serviceStatus === "ING") ? "on" : ""}>
                                <a href="#" onClick={(e) => handleServiceStatus("ING")}>
                                    <p>진행 중</p>
                                    <p><strong>2</strong>ea</p>
                                </a>
                            </div>
                            <div className={(serviceStatus === "DONE") ? "on" : ""}>
                                <a href="#" onClick={(e) => handleServiceStatus("DONE")}>
                                    <p>완료</p>
                                    <p><strong>0</strong>ea</p>
                                </a>
                            </div>
                        </li>
                    </ul>
                    <div className="tbl__top">
                        <div className="right">
                            <div className="searcharea">
                                <div className="searchinput">
                                    <span>검색</span>
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionSearchField)}>
                                        <div className="selected">
                                            <div className="selected-value">전체</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {searchFieldList.map((sf, idx) => (
                                                <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)}>{sf.sfDisp}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <input type="text" placeholder="검색어를 입력하세요" />
                                </div>
                                <button type="button" className="btn-search js-open-m3" data-pop="pop-search-small"><span>조회</span></button>
                            </div>
                        </div>
                    </div>
                    {/* <!--221026 데이터 없음--> */}
                    <p className="nodata__txt h345">
                        데이터를 찾을 수 없습니다.
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
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "progressStatus").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("progressStatus")}
                                    >
                                        <span>상태</span>
                                    </th>
                                    <th scope="col" className="d-sm-none txt-left">
                                        <span>점검단계</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "requestDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("requestDate")}
                                    >
                                        <span>요청 일자</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "spgName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                        onClick={(e) => onClickSortField("spgName")}
                                    >
                                        <span>기기명</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "panelName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                        onClick={(e) => onClickSortField("panelName")}
                                    >
                                        <span>Panel 명</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "serialNo").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("serialNo")}
                                    >
                                        <span>시리얼 번호</span>
                                    </th>
                                    <th scope="col"
                                        className="d-lm-none d-sm-none txt-left" ref={mobileRef}>
                                        <span>담당자</span>
                                    </th>
                                    <th scope="col" className="d-lm-none d-sm-none">
                                        <span>Report</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "handlingDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("handlingDate")}
                                    >
                                        <span>진행 일자</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "completionDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} d-lm-none d-sm-none txt-left`}
                                        onClick={(e) => onClickSortField("completionDate")}
                                    >
                                        <span>완료 일자</span>
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
                </div>
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


function MobileEhcDetailView(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);

    const ehc = props.ehcInfo;

    // PDF 다운로드
    function onClickReportDownload(ehc) {
        HTTPUTIL.fileDownload_EhcReport(ehc.itemName, ehc.assessment.reportId, userInfo.loginInfo.token);
    }


    function onClickClose(e) {

        CUTIL.jsclose_Popup("pop-list-ehcdetailview");
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
                                <p className="tit">상태</p>
                                <p className="txt">{ehc.progressStatus}</p>
                            </li>
                            <li>
                                <p className="tit">점검단계</p>
                                <p className="txt">
                                    <img src={require(`/static/img/icon_${(ehc.ehcStatus) ? ehc.ehcStatus[0].toLowerCase() : "x"}.png`)}
                                        style={{ "width": "24px", "height": "24px" }} alt={ehc.ehcStatus} />
                                </p>
                            </li>
                            <li>
                                <p className="tit">요청일자</p>
                                <p className="txt">{(ehc.requestDate) ? CUTIL.utc2formedstr(ehc.requestDate, "YYYY-MM-DD") : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">기기명</p>
                                <p className="txt">{ehc.spg.spgName}</p>
                            </li>
                            <li>
                                <p className="tit">Panel 명</p>
                                <p className="txt">{ehc.panel.panelName}</p>
                            </li>
                            <li>
                                <p className="tit">시리얼 번호</p>
                                <p className="txt">{(ehc.serialNo) ? ehc.serialNo : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">담당자</p>
                                <p className="txt">{ehc.responsible}</p>
                            </li>
                            <li>
                                <p className="tit">Report</p>
                                <p className="txt">
                                    <span>PDF</span>
                                    <button type="button" className="btn btn-filedown"
                                        onClick={(e) => onClickReportDownload(ehc)}
                                    >
                                        <span className="hide">삭제</span>
                                    </button>

                                    {/*<ul className="filelist down">
                   <li>
                     <span>Contract.zip</span>
                     <button type="button" className="btn btn-filedown">
                       <span className="hide">삭제</span>
                     </button>
                   </li>
                 </ul>*/}
                                </p>
                            </li>
                            <li>
                                <p className="tit">진행일자</p>
                                <p className="txt">{(ehc.handlingDate) ? CUTIL.utc2formedstr(ehc.handlingDate, "YYYY-MM-DD") : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">완료일자</p>
                                <p className="txt">{(ehc.completionDate) ? CUTIL.utc2formedstr(ehc.completionDate, "YYYY-MM-DD") : "-"}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="btn__wrap">
                        <button type="button" className="js-close"
                            onClick={(e) => onClickClose(e)}
                        >
                            <span>확인</span>
                        </button>
                    </div>
                </div>
            </div>
            {/*<!--//리스트 상세 보기 팝업-->*/}
        </>
    )
}