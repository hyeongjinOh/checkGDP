/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP 기기등록현황 - List 개발
 *
 ********************************************************************/
import React, { useState, useEffect, useCallback, useRef, DependencyList } from "react";
//
import axios from 'axios';
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState, useRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
import { loadingBoxState, urlState } from "../../../recoil/menuState";

//utils
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as FILEUTILS from "../../../utils/file/fileUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";
import * as FILEUTIL from "../../../utils/file/fileUtil"


import clog from "../../../utils/logUtils"

import { itemState } from "../../../recoil/assessmentState";
//압축 다운로드
import JSZip from "jszip"
import { saveAs } from "file-saver"
import * as XLSX from 'xlsx';
import * as FileSaver from "file-saver";
import { useNavigate } from "react-router-dom";
import EhpPagination from "../../common/pagination/EhpPagination";
import { useTrans } from "../../../utils/langs/useTrans";

 /**
 * @brief EHP 기기등록현황 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function DeciveStatusView(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);

    //화면 이동
    const navigate = useNavigate();
    // props
    const setParentPopWin = props.setPopWin;
    const curTab = props.curTab;
    const pageInfo = props.pageInfo;
    const setPageInfo = props.setPageInfo;
    const isMobile = props.isMobile;
    const setParentIsMobile = props.setIsMobile;
    const nodata = props.nodata;
    const setNodata = props.setNodata;
    const handleCurPage = props.handleCurPage;
    const subZoneId = props.subZoneId;
    const setSubZoneId = props.setSubZoneId;
    const roomId = props.roomId;
    const setRoomId = props.setRoomId;
    const spgList = props.spgList;
    const setSpgList = props.setSpgList;
    const searchText = props.searchText;
    const setSearchText = props.setSearchText;
    const searchData = props.searchData;
    const setSearchData = props.setSearchData;

    const searchFieldList = [
        //{"id":0, "sfDisp":"전체", "sfVal":""},
        { "id": 1, "sfDisp": t("FIELD.모델명"), "sfVal": "modelName" },
        { "id": 2, "sfDisp": t("FIELD.Panel명"), "sfVal": "panelName" },
        { "id": 3, "sfDisp": t("FIELD.시리얼번호"), "sfVal": "serialNo" },
    ];
    const [searchField, setSearchField] = useState(searchFieldList[0]);

    //
    const [errorList, setErrorList] = useState([]);

    const [subZoneItem, setSubZoneItem] = useState([]);
    const [roomItem, setRoomItem] = useState([]);
    const [spgItem, setSpgItem] = useState([]);
    const [countItem, setCountItem] = useState(null);
    const [listItem, setListItem] = useState([]);
    const [curSubZone, setCurSubZone] = useState("");// 
    const [CurRoom, setCurRoom] = useState("");// 
    const [curSpg, setCurSpg] = useState("");// 
    //검색
    const [listReload, setListReload] = useState(false);
    const [sortData, setSortData] = useState({ "sortField": "spgName", "sort": "ASC" });
    const [checkItem, setCheckItem] = useState([]);
    const [reportList, setReportList] = useState([]);
    const [item, setItem] = useState(null);
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
    });
    // isMobile 여부 랜더링 후 확인
    useDebounceEffect(
        async () => {
            if (mobileRef.current) {
                if ((mobileRef.current.clientHeight <= 0) && (mobileRef.current.clientWidth <= 0)) {
                    setParentIsMobile(true);

                } else {
                    setParentIsMobile(false);
                }

            }
        }, 100, [listItem],
    )
    var zoneId = curTab.zoneId
    let appPath = zoneId;


    //세부사업장API
    const { data: sub, } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });
    const { data: spg, } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: "/api/v2/product/company/zone/subzone/room/spgs",
        appQuery: {},
        userToken: userInfo.loginInfo.token,
    });
    useEffect(() => {
        // tab API
        if (sub) {
            // error page 이동
            if (sub.codeNum == CONST.API_200) {

                setSubZoneItem(sub.body);
            } else {
                alert(sub.errorList.map((err) => (err.msg)));
            }
        }
        if (spg) {
            if (spg.codeNum == CONST.API_200) {
                setSpgItem(spg.body);
            } else {
                alert(spg.errorList.map((err) => (err.msg)));
            }
        }
    }, [sub, spg]);
    // device count API
    appPath = "zoneId=" + appPath;
    // subZone {t("LABEL.검색")}
    if (!CUTIL.isnull(subZoneId) && (subZoneId.length > 0)) {
        appPath = appPath + "&subZoneId=" + subZoneId;
    }
    //
    if (!CUTIL.isnull(roomId) && (roomId.length > 0)) {
        appPath = appPath + "&roomId=" + roomId;
    }
    if (!CUTIL.isnull(spgList) && (spgList.length > 0)) {
        appPath = appPath + "&spgList=" + spgList;
    }

    const { data: count } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/panel/item/devicelistcount?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });
    useEffect(() => {
        // tab API
        if (count) {
            // error page 이동
            if (count.codeNum == CONST.API_200) {
                setCountItem(count.body)
            } else {

                alert(count.errorList.map((err) => (err.msg)));
            }
        }

    }, [count]);
    // device List API
    appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    // sort
    appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;
    // {t("LABEL.검색")} 
    //text검색
    if (searchData.searchField) {
        if (searchData.searchField.sfVal.length > 0) {
            appPath = appPath + `&searchKind=${searchData.searchField.sfVal}&stringLike=${searchData.searchText}`;
        }
    }
    const { data: data, isLoading } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/panel/item/devicelist?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath + listReload
    });
    useEffect(() => {
        // tab API
        if (data) {
            // error page 이동
            const ERR_URL = HttpUtil.resultCheck(isLoading, data);

            if (ERR_URL.length > 0) navigate(ERR_URL);
            if (data.codeNum == CONST.API_200) {
                setListItem(data.body)
                setPageInfo({ ...data.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10; //5, 10
            } else {
                alert(data.errorList.map((err) => (err.msg)));
            }
        }

    }, [data]);
    // subZone선택 및 room  API 초기화
    async function selectSubZone(subZoneId) {
        setCurSubZone(subZoneId);
        if (CurRoom) {
            var roomsel = document.getElementById("room");
            var roomReset = document.getElementById("room_all");
            var roomselM = document.getElementById("mroom");
            var roomResetM = document.getElementById("mroom_all");
            roomselM.click();
            roomResetM.click();
            roomsel.click();
            roomReset.click();
            setRoomItem([]);
            setRoomId("");
        } else {
            let data: any = null;
            data = await HttpUtil.PromiseHttp({
                "httpMethod": "GET",
                "appPath": `/api/v2/product/company/zone/subzone/${subZoneId}`,
                userToken: userInfo.loginInfo.token,
            });
            if (data.codeNum == 200) {
                setRoomItem(data.body);
            } else {

            }
        }
    }

    //fliter 조회
    function searchDevice(e) {
        setSubZoneId(curSubZone);
        setRoomId(CurRoom);
        setSpgList(curSpg);
        handleCurPage(0);
    }
    // Fliterpop
    useEffect(() => {

        setParentPopWin("pop-filter",
            <MobileFilterPopup

                subZoneItem={subZoneItem}
                roomItem={roomItem}
                spgItem={spgItem}
                selectSubZone={selectSubZone}

                curSubZone={curSubZone}
                setCurSubZone={setCurSubZone}
                CurRoom={CurRoom}
                setCurRoom={setCurRoom}
                curSpg={curSpg}
                setCurSpg={setCurSpg}

                searchDevice={searchDevice}

            />
        )

    });

    function testViewPop(e, item) {
        setItem(item);
        (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
            setRecoilIsLoadingBox(true);
            const resp = await HttpUtil.API_reportView(item.serialNo);
            setReportList(resp);
            setRecoilIsLoadingBox(false);
            CUTIL.jsopen_Popup(e);
        })();




    }
    useEffect(() => {

        setParentPopWin("pop-downtest",
            <PopupReportView
                htmlHeader={(item) && <h1>{item.modelName + "_검사 성적서"}</h1>}
                item={item}
                reportInfo={reportList}

            />

        )
        setNodata(pageInfo.totalElements);
    });

    function PopClose(id) {
        var btnCommentClose = document.getElementById(id);
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "itmeTxt: none; z-index: 11; ");


    }
    // change pop
    useEffect(() => {

        setParentPopWin("pop-change",
            <ChanagePop
                htmlHeaderBtn={<button className="btn btn-close js-close" onClick={(e) => PopClose("pop-change")}><span className="hide">닫기</span></button>}
                setRecoilIsLoadingBox={setRecoilIsLoadingBox}
                checkItem={checkItem}
                setCheckItem={setCheckItem}

            />
        )

    });
    // mobile search pop
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
        (isSchMobile) && CUTIL.jsopen_m3_Popup(e, isSchMobile);
        (!isSchMobile) && goSearch(e);
        handleCurPage(0);

    }
    // table search 
    function goSearch(e) {
        //clog("goSearch : " + JSON.stringify(searchField));
        handleCurPage(0);
        setSearchData({
            "searchField": searchField,
            "searchText": searchText,
        });
    }


    // sort 
    function onClickSort(selSortField) {
        var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
        if (selSortField !== sortData.sortField) { // 정렬필드가 변경된 경우
            selSort = "DESC";
        }
        setSortData({
            "sortField": selSortField,
            "sort": selSort
        });
        handleCurPage(0);
    }

    //chcek All
    const checkedAll = useCallback((checked) => {
        if (checked) {
            const checkedArray = [];
            listItem.forEach((list) => { checkedArray.push(list) });
            setCheckItem(checkedArray);
        } else {
            setCheckItem([]);
        }
    }, [listItem])
    // check singe
    const checkedList = useCallback((checked, list) => {
        if (checked) {
            setCheckItem([...checkItem, list]);
        } else {
            setCheckItem(checkItem.filter((el) => el !== list));
        }
    }, [checkItem])
    // 엑셀 API
    async function exeelList(e) {
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            "httpMethod": "GET",
            "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/excellist?zoneId=${curTab.zoneId}`,
            /*     "appQuery": {
                   "zoneId ": curTab.zoneId,
               },  */
            userToken: userInfo.loginInfo.token,
        })

        if (data) {
            if (data.codeNum == CONST.API_200) {

                excelDownloadSaved(data.body);
            } else {
                alert(data.errorList.map((err) => (err.msg)));
            }
        }
    }
    // List Download 
    function excelDownloadSaved(excelData: any) {

        const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'; // 파일 타입 및 유니코드
        // const book = XLSX.utils.book_new();
        const excelFileExtension = '.xlsx'; // 확장자 명
        const excelFileName = curTab.company.companyName + "_" + curTab.zoneName + "_eHC_" + "DeviceList" // 파일명
        const excelSheet = XLSX.utils.aoa_to_sheet([
            [
                'no', '기기유형', 'Panel명', "정격전압(kV)", "2차전압(kV)", "정격전류(A)", "차단전류(kA)", "정격용량(kVA)", "모델명", "시리얼번호", "제조사", "메모",
                "점검일자", "B전체점수", "P전체점수", "A전체점수", "B01이름", "B01선택", "B01점수", "B02이름", "B02선택", "B02점수", "B03이름", "B03선택", "B03점수",
                "B04이름", "B04선택", "B04점수", "B05이름", "B05선택", "B05점수", "B06이름", "B06선택", "B06점수", "B07이름", "B07선택", "B07점수", "B08이름", "B08선택",
                "B08점수", "B09이름", "B09선택", "B09점수", "B10이름", "B10선택", "B10점수", "B11이름", "B11선택", "B11점수", "B12이름", "B12선택", "B12점수", "B13이름",
                "B13선택", "B13점수", "B14이름", "B14선택", "B14점수", "B15이름", "B15선택", "B15점수", "P01이름", "P01선택", "P01점수", "P02이름", "P02선택", "P02점수	",
                "P03이름", "P03선택", "P03점수", "P04이름", "P04선택", "P04점수", "P05이름", "P05선택", "P05점수", "P06이름", "P06선택", "P06점수", "P07이름", "P07선택",
                "P07점수", "P08이름", "P08선택", "P08점수", "P09이름", "P09선택", "P09점수", "P10이름", "P10선택", "P10점수", "P11이름", "P11선택", "P11점수", "P12이름",
                "P12선택", "P12점수", "P13이름", "P13선택", "P13점수", "P14이름", "P14선택", "P14점수", "P15이름", "P15선택", "P15점수", "P16이름", "P16선택", "P16점수",
                "A01이름", "A01선택", "A01점수", "A02이름", "A02선택", "A02점수", "A03이름", "A03선택", "A03점수", "A04이름", "A04선택", "A04점수", "A05이름", "A05선택",
                "A05점수", "A06이름", "A06선택", "A06점수", "A07이름", "A07선택", "A07점수",
            ]
        ]
        );

        excelData.map((sheet: any, idx) => {
            XLSX.utils.sheet_add_aoa(
                excelSheet,
                [
                    [
                        idx + 1, // 순서
                        sheet.spg.spgName, // 기기유형
                        sheet.panel.panelName, //판넬
                        sheet.ratingVoltage, // 정격전압
                        sheet.secondaryVoltage,// 2차전압
                        sheet.ratingCurrent, //정격전류
                        sheet.cutoffCurrent, // 차단전류
                        sheet.ratedCapacity,// 정격용량
                        sheet.modelName, // 모델명
                        sheet.serialNo, // 시리얼 번호
                        sheet.manufacturer,// 제조사
                        sheet.memo,//메모
                        CUTIL.utc2time("YYYY-MM-DD", sheet.updatedTime), //점검일자
                        // B,P,A 종합점수
                        sheet.basicAssess.totalScore,
                        sheet.premiumAssess.totalScore,
                        sheet.advancedAssess.totalScore,
                        // B - 이름,선택,점수
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 7)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 7)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 7)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 8)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 8)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 8)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 9)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 9)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 9)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 10)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 10)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 10)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 11)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 11)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 11)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 12)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 12)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 12)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 13)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 13)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 13)).map((s, idx) => (s.value))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 14)).map((s, idx) => (s.name))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 14)).map((s, idx) => (s.answer))),
                        ((sheet.basicAssess.assessment) && sheet.basicAssess.assessment.filter((f, idx) => (idx == 14)).map((s, idx) => (s.value))),
                        // p - 이름,선택,점수
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 7)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 7)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 7)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 8)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 8)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 8)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 9)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 9)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 9)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 10)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 10)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 10)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 11)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 11)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 11)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 12)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 12)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 12)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 13)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 13)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 13)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 14)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 14)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 14)).map((s, idx) => (s.value))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 15)).map((s, idx) => (s.name))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 15)).map((s, idx) => (s.answer))),
                        ((sheet.premiumAssess.assessment) && sheet.premiumAssess.assessment.filter((f, idx) => (idx == 15)).map((s, idx) => (s.value))),
                        // A - 이름,선택,점수
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 0)).map((s, idx) => (s.value))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 1)).map((s, idx) => (s.value))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 2)).map((s, idx) => (s.value))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 3)).map((s, idx) => (s.value))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 4)).map((s, idx) => (s.value))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 5)).map((s, idx) => (s.value))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.name))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.answer))),
                        ((sheet.advancedAssess.assessment) && sheet.advancedAssess.assessment.filter((f, idx) => (idx == 6)).map((s, idx) => (s.value))),
                    ]
                ],
                { origin: -1 }
            );
            excelSheet['!cols'] = [ //< --행 사이즈
                { width: 8, },  //순서
                { width: 10, },  //기기유형
                { width: 20, },  //판넬
                { width: 13, },  //정격전압
                { width: 13, },  //2차전압
                { width: 13, },  //정격전류
                { width: 13, },  //차단전류
                { width: 13, },  // 정격용량
                { width: 30, },  //모델명
                { width: 30, },  // 시리얼
                { width: 30, }, // 제조사
                { width: 30, }, //메모

            ]
            return false;
        });
        // wb == workBook 약자
        const wb: any = { Sheets: { Sheet: excelSheet }, SheetNames: ["Sheet"] };
        const excelButter = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelFile = new Blob([excelButter], { type: excelFileType });
        FileSaver.saveAs(excelFile, excelFileName + excelFileExtension);
        // XLSX.utils.book_append_sheet(book, excelSheet, "Sheet"); 
        // XLSX.writeFile(book, excelFileName + excelFileExtension);
    }
    // mobile List Popup
    function listPop(e, list) {

        if (isMobile) {
            // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
            var schDiv = document.querySelector("#mcheck_searchinput");

            var isSchMobile = (schDiv.clientHeight <= 0) && (schDiv.clientWidth <= 0) ? true : false;
            if (!isSchMobile) {
                var popupVal = e.target.getAttribute("data-pop");
                if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-list-view");

                popupVal = e.target.getAttribute("data-ds-height");
                if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "496");
            }
            setParentPopWin("pop-list-view",
                <MobileListPop
                    htmlHeader={<h1>{list.modelName} 상세정보</h1>}
                    list={list}
                />
            )
            CUTIL.jsopen_m_Popup(e)
        }
    }
    // 운용관리 - 기기등록관리 Link
    function linkClick(e) {
        setRecoilUrlInfo(CONST.URL_ADMIN_ITEM);
        navigate(CONST.URL_ADMIN_ITEM);
    }


    return (
        <>

            {/*<!-- Tab1 -->*/}
            <div id="tab-1" className="tabcontent current">
                {/*<!--노후교체 changeold 추가-->*/}
                <div className="area__right w100p d-sm-block changeold ">
                    {/*<!--검색영역-->*/}
                    <h2 className="mb-0">{t("LABEL.기기등록현황")}</h2>
                    <div className="search">
                        <ul className="form__input">
                            <li>
                                <label htmlFor="f1">{t("LABEL.상세사업장")}</label>
                                <div className="input__area">
                                    <div className="select w186" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected">
                                            <div id="zone" className="selected-value">{t("FIELD.전체")}</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            <li id="zone_all" className="option" onClick={(e) => selectSubZone("")}>{t("FIELD.전체")}</li>
                                            {subZoneItem.map((sub, idx) => (
                                                <li key={"zone_" + idx.toString()} className="option"
                                                    onClick={(e) => selectSubZone(sub.subZoneId)}>{sub.subZoneName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <label htmlFor="f2">{t("LABEL.전기실")}</label>
                                <div className="input__area">
                                    <div className="select w186" onClick={(e) => (curSubZone) && CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected">
                                            <div id="room" className="selected-value">{t("FIELD.전체")}</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            <li id="room_all" className="option" onClick={(e) => setCurRoom("")} >{t("FIELD.전체")}</li>
                                            {(roomItem) && roomItem.map((room, idx) => (
                                                <li key={"room_" + idx.toString()} className="option" onClick={(e) => setCurRoom(room.roomId)} >{room.roomName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <label htmlFor="f3">{t("FIELD.기기명")}</label>
                                <div className="input__area">
                                    <div className="select w186" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected">
                                            <div id="spg" className="selected-value">{t("FIELD.전체")}</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            <li id="spg_all" className="option" onClick={(e) => setCurSpg("")}>{t("FIELD.전체")}</li>
                                            {spgItem.map((spg, idx) => (
                                                <li key={"zone_" + idx.toString()} className="option" onClick={(e) => setCurSpg(spg.spgName)} >{spg.spgName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="btn__wrap">
                            <button type="button" className="btn-search" onClick={(e) => searchDevice(e)}><span>{t("LABEL.조회")}</span></button>
                        </div>
                    </div>

                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
                    <div className="area__right_content  hcal-176">
                        <div className="tbl__top d-lm-block mt-36">
                            <div className="left">
                                <a className="devicenum" onClick={(e) => linkClick(e)}>
                                    <p>Device</p>
                                    <p className="num">{(countItem) ? countItem.totalCount : "-"}</p>
                                </a>
                                <ul className="devicenum-detail">
                                    {(countItem) && spgItem.map((spg, idx) => (
                                        <li ref={mobileRef} key={"zone_" + idx.toString()}  >{spg.spgName}
                                            <span>{(spg.spgName == "ACB") ?
                                                countItem.acbCount
                                                : (spg.spgName == "VCB") ?
                                                    countItem.vcbCount
                                                    : (spg.spgName == "배전반") ? countItem.switchboardCount
                                                        : (spg.spgName == "MoldTR") ? countItem.moldTrCount
                                                            : (spg.spgName == "유압식TR") ? countItem.oilTrCount
                                                                : (spg.spgName == "GIS") && countItem.gisCount
                                            }</span>
                                        </li>
                                    ))}
                                </ul>
                                {/*    <a href="#" className="devicenum d-lm-block ml-48">
                                    <p>Work Order</p>
                                    <p className="num">21</p>
                                </a> */}
                                <div className="filter js-open-s" data-pop="pop-filter" onClick={(e) => CUTIL.jsopen_m_Popup(e)}>
                                    <p className="title">
                                        <span>Filter</span>
                                    </p>
                                </div>
                            </div>

                            <div className="right">
                                <div className="searcharea">
                                    <div className="searchinput" id="mcheck_searchinput">
                                        <span>{t("LABEL.검색")}</span>
                                        <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                            <div className="selected">
                                                <div className="selected-value">{searchFieldList[0].sfDisp}</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {searchFieldList.map((sf, idx) => (
                                                    <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)}
                                                        onClick={(e) => setSearchField(sf)}>
                                                        {sf.sfDisp}</li>
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
                                    <button type="button" className="btn-search js-open-m4" data-pop="pop-search-small" onClick={(e) => onClickSearch(e)}><span>{t("LABEL.조회")}</span></button>
                                    <button type="button" className="btn-basic ml-8 js-open" data-pop="pop-change" onClick={(e) => CUTIL.jsopen_Popup(e)}><span data-pop="pop-change">{t("LABEL.노후교체요청")}</span></button>
                                    {(userInfo.role == CONST.USERROLE_USER) ?
                                        <button type="button" className="btn-basic down ml-8" disabled><span>List Download</span></button>
                                        :
                                        <button type="button" className="btn-basic down ml-8" onClick={(e) => exeelList(zoneId)}><span>List Download</span></button>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* <!--221026 데이터 없음--> */}
                        <p className="nodata__txt h345">
                            {t("MESSAGE.데이터를찾을수없습니다")}
                        </p>

                        <div className="tbl-list hcal-vh-415">
                            <table summary="등록 순,기기 명,Panel 명,모델 명,시리얼 번호,정격전압,정격전류,차단전류,정격용량,계통전압,첨부파일,메모 항목으로 구성된 site목록 입니다.">
                                <caption>
                                    Basice-HCList
                                </caption>
                                <colgroup>
                                    <col style={{}} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th scope="col" className="wmax-10">
                                            <input readOnly type="checkbox" id="t_all"
                                                checked={checkItem.length === 0 ? false : checkItem.length === listItem.length ? true : false}
                                                onChange={(e) => checkedAll(e.target.checked)}
                                            />
                                            <label htmlFor="t_all">
                                                <span className="hide">선택</span>
                                            </label>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "spgName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left `}
                                            onClick={(e) => onClickSort("spgName")}>
                                            <span>{t("FIELD.기기명")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "panelName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left`}
                                            onClick={(e) => onClickSort("panelName")}>
                                            <span>{t("FIELD.Panel명")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "itemName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-sm-none`}
                                            onClick={(e) => onClickSort("itemName")}>
                                            <span>{t("FIELD.모델명")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "serialNo") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-lm-none d-sm-none`}
                                            onClick={(e) => onClickSort("serialNo")}>
                                            <span>{t("FIELD.시리얼번호")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "ratingVoltage") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-lm-none d-sm-none`}
                                            onClick={(e) => onClickSort("ratingVoltage")}>
                                            <span>{t("FIELD.정격전압")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "secondaryVoltage") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-lm-none d-sm-none`}
                                            onClick={(e) => onClickSort("secondaryVoltage")}>
                                            <span>{t("FIELD.2차전압")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "ratingCurrent") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-lm-none d-sm-none`}
                                            onClick={(e) => onClickSort("ratingCurrent")}>
                                            <span>{t("FIELD.정격전류")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "cutoffCurrent") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-lm-none d-sm-none`}
                                            onClick={(e) => onClickSort("cutoffCurrent")}>
                                            <span>{t("FIELD.차단전류")}</span>
                                        </th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "ratedCapacity") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-lm-none d-sm-none`}
                                            onClick={(e) => onClickSort("ratedCapacity")}>
                                            <span>{t("FIELD.정격용량")}</span>
                                        </th>
                                        <th scope="col" className="txt-left d-sm-none"><span>Basic</span></th>
                                        <th scope="col" className="txt-left d-sm-none"><span>Premium</span></th>
                                        <th scope="col" className="txt-left d-sm-none"><span>Advanced</span></th>
                                        <th scope="col" className={`sort ${(sortData.sortField === "updatedTime") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} asc txt-left d-sm-none`}
                                            onClick={(e) => onClickSort("updatedTime")}>
                                            <span>{t("FIELD.점검일자")}</span>
                                        </th>
                                        {/* <th  scope="col" className="d-lm-none d-sm-none"><span>{t("FIELD.성적서")}</span></th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(listItem) && listItem.map((list, idx) => (
                                        <tr key={"status_" + idx.toString()} className="js-open-m2" data-pop="pop-list-view">
                                            <td className="wmax-10">
                                                <input type="checkbox" id={"t_" + idx.toString()}
                                                    checked={checkItem.includes(list) ? true : false}
                                                    onChange={(e) => checkedList(e.target.checked, list)}
                                                />
                                                <label htmlFor={"t_" + idx.toString()}>
                                                    <span className="hide">선택</span>
                                                </label>
                                            </td>
                                            <td className="txt-left js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)}>{(list.spg.spgName) ? list.spg.spgName : "-"}</td>
                                            <td className="txt-left js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)}><p className="ellipsis">{(list.panel.panelName) ? list.panel.panelName : "-"}</p></td>
                                            <td className="txt-left d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)}><p className="ellipsis">{(list.modelName) ? list.modelName : "-"}</p></td>
                                            <td className="txt-left d-lm-none d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} ><p className="ellipsis">{(list.serialNo) ? list.serialNo : "-"}</p></td>
                                            <td className="txt-left d-lm-none d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.ratingVoltage) ? list.ratingVoltage : "-"}</td>
                                            <td className="txt-left d-lm-none d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.secondaryVoltage) ? list.secondaryVoltage : "-"}</td>
                                            <td className="txt-left d-lm-none d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.ratingCurrent) ? list.ratingCurrent : "-"}</td>
                                            <td className="txt-left d-lm-none d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.cutoffCurrent) ? list.cutoffCurrent : "-"}</td>
                                            <td className="txt-left d-lm-none d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.ratedCapacity) ? list.ratedCapacity : "-"}</td>
                                            <td className="txt-left d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.basicScore.totalScore) ? list.basicScore.totalScore : "-"}</td>
                                            <td className="txt-left d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.premiumScore.totalScore) ? list.premiumScore.totalScore : "-"}</td>
                                            <td className="txt-left d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.advancedScore.totalScore) ? list.advancedScore.totalScore : "-"}</td>
                                            <td className="txt-left d-sm-none js-open-m2" data-pop="pop-list-view" onClick={(e) => listPop(e, list)} >{(list.updatedTime) ? CUTIL.utc2time("YYYY-MM-DD", list.updatedTime) : "-"}</td>
                                            {/* <td className="d-lm-none d-sm-none">
                                                {(list.serialNo) ?
                                                    <button type="button" className="btn btn-file js-opne" data-pop="pop-downtest" onClick={(e) => testViewPop(e, list)}><span className="hide" data-pop="pop-downtest">파일다운로드</span></button>
                                                    :
                                                    <button type="button" className="btn btn-file" disabled><span className="hide">파일다운로드</span></button>
                                                }
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div >
                    {(pageInfo) && <EhpPagination
                        componentName={"WorkOrderInspection"}
                        pageInfo={pageInfo}
                        handleFunc={handleCurPage}
                    />
                    }
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                </div >
                {/*<!--//area__right, 오른쪽 영역-->*/}
            </div >

        </>
    );
}

export default DeciveStatusView;

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

function MobileFilterPopup(props) {
    const t = useTrans();
    //props
    const subZoneItem = props.subZoneItem;
    const roomItem = props.roomItem;
    const spgItem = props.spgItem;
    const curSubZone = props.curSubZone;
    const setCurRoom = props.setCurRoom;
    const setCurSpg = props.setCurSpg;
    const selectSubZone = props.selectSubZone;
    const searchDevice = props.searchDevice;


    return (
        <>
            <div className="popup__body minhcal-210 maxhcal-210 scrollH">
                <ul className="form__input mt-0">
                    <li className="mt-0">
                        <label htmlFor="company">{t("LABEL.상세사업장")}</label>
                        <div className="input__area">
                            <div id="mzone" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected">
                                    <div className="selected-value">{t("FIELD.전체")}</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul>
                                    <li id="mzone_all" className="option" onClick={(e) => selectSubZone("")}>{t("FIELD.전체")}</li>
                                    {subZoneItem.map((sub, idx) => (
                                        <li key={"zone_" + idx.toString()} className="option"
                                            onClick={(e) => selectSubZone(sub.subZoneId)}>{sub.subZoneName}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </li>
                    <li>
                        <label htmlFor="site">{t("LABEL.전기실")}</label>
                        <div className="input__area">
                            <div id="mroom" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected"  >
                                    <div className="selected-value">{t("FIELD.전체")}</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul>
                                    <li id="mroom_all" className="option" onClick={(e) => (curSubZone) && setCurRoom("")} >{t("FIELD.전체")}</li>
                                    {(roomItem) && roomItem.map((room, idx) => (
                                        <li key={"room_" + idx.toString()} className="option" onClick={(e) => setCurRoom(room.roomId)} >{room.roomName}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </li>
                    <li>
                        <label htmlFor="dd">{t("LABEL.기기명")}</label>
                        <div className="input__area">
                            <div id="mspg" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected">
                                    <div className="selected-value">{t("FIELD.전체")}</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul>
                                    <li id="mspg_all" className="option" onClick={(e) => setCurSpg("")}>{t("FIELD.전체")}</li>
                                    {spgItem.map((spg, idx) => (
                                        <li key={"zone_" + idx.toString()} className="option" onClick={(e) => setCurSpg(spg.spgName)} >{spg.spgName}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="popup__footer">
                <button type="button" className="bg-gray js-close"><span>{t("LABEL.취소")}</span></button>
                <button type="button" className="js-close" onClick={(e) => searchDevice(e)}><span>{t("LABEL.적용")}</span></button>
            </div>
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
function ChanagePop(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const setRecoilIsLoadingBox = props.setRecoilIsLoadingBox;
    //props
    const checkItem = props.checkItem;
    const setCheckItem = props.setCheckItem;
    const [changeSuccess, setChangeSuccess] = useState([]);
    const [changeFail, setChangeFail] = useState([]);
    //노후 교체 요청  API
    async function changeDone(checkItem) {
        setRecoilIsLoadingBox(true);
        var btnCommentClose = document.getElementById("pop-change");
        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");

        var itemId = []

        for (let i = 0; i < checkItem.length; i++) {
            itemId.push(checkItem[i].itemId)
        }
        let data: any = [];
        var success = []
        var fail = []

        for (let j = 0; j < checkItem.length; j++) {
            data = await HttpUtil.PromiseHttp({
                "httpMethod": "POST",
                "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/deviceconsult`,
                "appQuery": {
                    "itemId": itemId[j]
                },
                userToken: userInfo.loginInfo.token,
            });
            if (data) {

                if (data.codeNum == CONST.API_200) {
                    success.push(data.body)
                    // alert("담당자 배정 접수가 되었습니다.");
                } else {
                    // alert(data.data.errorList[0].msg);
                    fail.push(data.errorList)
                }
            }
        }

        if (data) {

            setChangeSuccess(success)
            // alert("담당자 배정 접수가 되었습니다.");
            // alert(data.data.errorList[0].msg);
            setChangeFail(fail)

            var btnCommentClose = document.getElementById("pop-change");
            var body = document.body
            var dimm = body.querySelector(".dimm");

            if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
            if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
            if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
            setRecoilIsLoadingBox(false);
        }

    }
    //팝업 닫기 , 요청 완료 후 확인 버튼 
    function PopCloses(id) {
        var btnCommentClose = document.getElementById(id);
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "itmeTxt: none; z-index: 11; ");

        setCheckItem([]);
        setChangeFail([]);
        setChangeSuccess([]);

    }


    return (
        <>
            <div className="popup__body">
                <p>
                    {(changeFail.length > 0 || changeSuccess.length > 0) ?
                        " 노후교체 요청이 완료되었습니다."
                        : (checkItem.length > 0) ?
                            "해당 기기를 노후교체 요청하시겠습니까?"
                            : "기기를 먼저 선택해주세요."
                    }
                </p>
                {(changeFail.length > 0 || changeSuccess.length > 0) &&
                    <p>
                        <span> - {t("LABEL.성공")} : {changeSuccess.length} {t("LABEL.건")}</span><br />
                        <span> - {t("LABEL.실패")} : {changeFail.length} {t("LABEL.T1이미신청한기기", [t("LABEL.건")])}</span>
                    </p>
                }
            </div>
            <div className="popup__footer">
                {(checkItem.length > 0) && (changeFail.length <= 0 && changeSuccess.length <= 0) &&
                    <button type="button" className="bg-gray js-close" onClick={(e) => PopCloses("pop-change")}><span>{t("LABEL.취소")}</span></button>
                }
                {(checkItem.length <= 0) || (changeFail.length > 0 || changeSuccess.length > 0) ?
                    <button type="button" className="js-close" onClick={(e) => PopCloses("pop-change")}><span>{t("LABEL.확인")}</span></button>
                    :
                    <button type="button" onClick={(e) => changeDone(checkItem)}><span>{t("LABEL.확인")}</span></button>
                }
            </div>
        </>
    )
}

function PopupReportView(props) {
    //trans
    const t = useTrans();
    //porps
    const item = props.itemDetail;
    const reportInfo = props.reportInfo;
    //const reportList = (reportInfo != null ) ? reportInfo.IF_RES_DATA : null;
    const [reportList, setReportList] = useState(null);
    const [checkAll, setCheckAll] = useState(false);

    const [checkReports, setCheckReports] = useState([]);
    useEffect(() => {
        //if ( reportInfo == null ) {

        //}
        setReportList((reportInfo != null) ? reportInfo.IF_RES_DATA : null);
        setCheckAll(false);
        //setCheckReports([]);
    }, [reportInfo])

    function handleAllCheck(e) {
        var isChecked = e.target.checked;
        setCheckAll(isChecked);
        setReportList(
            reportList.map((report) => ({ ...report, "checked": isChecked }))
        )
    }

    function handleCheckReports(e, check) {
        const isChecked = e.target.checked;
        const tmpReports = reportList.map((report) => (report.REPORT_NO === check.REPORT_NO) && { ...report, "checked": isChecked })
        const tmpChecks = tmpReports.filter((report) => (report.checked));
        if (tmpChecks.length === tmpReports.length) {
            setCheckAll(true);
        } else {
            setCheckAll(false);
        }
        setReportList(tmpReports);
    }


    function pdfDownloadAll(e) {
        reportList.filter((report) => report.checked).map((report) => {
            clog("IN pdfDownloadAll : " + JSON.stringify(report));
        })
        let zips = new JSZip();
        let zipCnt = 0;
        //const zipFileName = `${item.itemName}_검사성적서.zip` 최효일PM님 지시로 문구 변경 by jhpark-20221219
        const zipFileName = `TestReport.zip`;
        reportList.filter((report) => report.checked).map((report) => {
            const sPos = (report.PDF_LINK.lastIndexOf('/') < 0) ? 0 : report.PDF_LINK.lastIndexOf('/');
            const ePos = (report.PDF_LINK.lastIndexOf('?') < 0) ? report.PDF_LINK.length : report.PDF_LINK.lastIndexOf('?');
            var fileName = report.PDF_LINK.substring(sPos + 1, ePos);

            axios({
                method: "GET",
                url: report.PDF_LINK,
                responseType: "blob",
            }).then((resp) => {
                zips.file(fileName, resp.data);
                zipCnt++;
                return zipCnt;
            }).then((zipCnt) => {
                if (zipCnt === reportList.length) {
                    //FILEUTILS.saveToFile_Chrome(fileName, response.data);
                    zips.generateAsync({ type: "blob" }).then(
                        function (blob) {
                            FILEUTIL.saveToFile_Chrome(zipFileName, blob);
                        }
                    );
                }
            });
        })

    }

    return (
        <>
            {/*<!-- 시험성적서 다운로드 팝업 - 웹용, 220802 추가-->*/}
            <div className="popup__body">
                <div className="tbl-list type5">
                    <table summary="선택,파일 명, 생성일, 첨부 파일 항목으로 구성된 시험성적서 다운로드 목록 입니다.">
                        <caption>
                            시험성적서 다운로드 목록
                        </caption>
                        <colgroup>
                            <col style={{ "width": "20px" }} />
                            <col style={{ "width": "auto" }} />
                            <col style={{ "width": "17%" }} />
                            <col style={{ "width": "15%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="w20">
                                    {/*        <input type="checkbox"
                                        value=""
                                        id="t_all"
                                        onChange={(e) => handleAllCheck(e)}
                                        checked={checkAll}
                                        disabled={(reportList) ? false : true}
                                    />
                                    <label htmlFor="t_all"><span className="hide">선택</span>
                                    </label> */}
                                </th>
                                <th scope="col">{t("FIELD.파일명")}</th>
                                <th scope="col">{t("FIELD.생성일")}</th>
                                <th scope="col" className="txt-center">{t("FIELD.첨부파일")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(reportList == null)
                                ? <tr key={"report_null"}>
                                    <td className={"d-sm-none w20"}>
                                        <p className="icon-no ml-m10"><span className="hide">파일없음</span></p>
                                    </td>
                                    <td className="d-sm-none">{t("MESSAGE.등록된성적서가없습니다")}</td>
                                    <td className="d-sm-none">-</td>
                                    <td className="btn__tdarea">
                                        <p className="icon-no gray"><span className="hide">파일없음</span></p>
                                    </td>
                                </tr>

                                : (reportList) && reportList.map((report, idx) => (
                                    <tr key={"report_" + idx}>
                                        <td scope="col" className="w20" >
                                            {/*      <input type="checkbox"
                                                id={`chk_${idx.toString()}`}
                                                onChange={(e) => handleCheckReports(e, report)}
                                                checked={(report.hasOwnProperty("checked")) ? report.checked : false}
                                            />
                                            <label htmlFor={`chk_${idx.toString()}`}>
                                                <span className="hide">선택</span>
                                            </label> */}
                                        </td>
                                        <td><p className="ellipsis">{report.PDF_LINK.substring(report.PDF_LINK.lastIndexOf('/') + 1, report.PDF_LINK.lastIndexOf('.'))}</p></td>
                                        <td>{report.CREATION_DATE.substring(0, 4) + "-" + report.CREATION_DATE.substring(4, 6) + "-" + report.CREATION_DATE.substring(6, 8)}</td>
                                        <td>
                                            {
                                                (report.PDF_LINK == null)
                                                    ? <button type="button" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                                                    : <a href={report.PDF_LINK} target="_blank" rel='noreferrer'>
                                                        <button type="button" className="btn btn-file">
                                                            <span className="hide">첨부 파일</span>
                                                        </button>
                                                    </a>
                                            }
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="popup__footer brd-0 mb-10">
                <button type="button" className="bg-gray js-close"><span>Cancel</span></button>
                {/*    {(reportList.filter((report) => report.checked).length <= 0)
                        ? <button type="button" className="bg-gray">
                            <span>Download</span>
                        </button>
                        : <button type="button" className="js-close" onClick={(e) => pdfDownloadAll(e)}>
                            <span>Download</span>
                        </button>
                    } */}
            </div>
        </>

    )


}


function MobileListPop(props) {
    //trans
    const t = useTrans();
    //
    const list = (props.list === null) ? null : props.list;

    function listDone(e) {
        var btnCommentClose = document.getElementById("pop-list-view");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
    }

    return (
        <>
            {/* <!--리스트 상세 보기 팝업--> */}
            <div className="popup__body">
                <div className="area__right_content workplace__info">
                    <div className="content__info">
                        <h3 className="hide">{t("LABEL.T1상세정보", [t("LABEL.기기등록현황")])} </h3>
                        <ul>
                            <li>
                                <p className="tit">{t("FIELD.기기명")}</p>
                                <p className="txt">{(list.spg.spgName) ? list.spg.spgName : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.Panel명")}</p>
                                <p className="txt">{(list.panel.panelName) ? list.panel.panelName : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.모델명")}</p>
                                <p className="txt">{(list.modelName) ? list.modelName : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.시리얼번호")}</p>
                                <p className="txt">{(list.serialNo) ? list.serialNo : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.정격전압")}</p>
                                <p className="txt">{(list.ratingVoltage) ? list.ratingVoltage : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.2차전압")}</p>
                                <p className="txt">{(list.secondaryVoltage) ? list.secondaryVoltage : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.정격전류")}</p>
                                <p className="txt">{(list.ratingCurrent) ? list.ratingCurrent : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.차단전류")}</p>
                                <p className="txt">{(list.cutoffCurrent) ? list.cutoffCurrent : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.정격용량")}</p>
                                <p className="txt">{(list.ratedCapacity) ? list.ratedCapacity : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">Basic</p>
                                <p className="txt">{(list.basicScore.totalScore) ? list.basicScore.totalScore : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">Premium</p>
                                <p className="txt">{(list.premiumScore.totalScore) ? list.premiumScore.totalScore : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">Advanced</p>
                                <p className="txt">{(list.advancedScore.totalScore) ? list.advancedScore.totalScore : "-"}</p>
                            </li>
                            <li>
                                <p className="tit">{t("FIELD.점검일자")}</p>
                                <p className="txt">{(list.updatedTime) ? CUTIL.utc2time("YYYY-MM-DD", list.updatedTime) : "-"}</p>
                            </li>
                            {/*      <li>
                                <p className="tit">첨부파일</p>
                                <p className="txt">
                                    <ul className="filelist">
                                        <li>
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-filedown"><span className="hide">삭제</span></button>
                                        </li>
                                        <li>
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-filedown"><span className="hide">삭제</span></button>
                                        </li>
                                        <li>
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-filedown"><span className="hide">삭제</span></button>
                                        </li>
                                    </ul>
                                </p>
                            </li> */}
                        </ul>
                    </div>
                    <div className="btn__wrap">
                        <button type="button" className="js-close" onClick={(e) => listDone(e)}><span>{t("LABEL.확인")}</span></button>
                    </div>
                </div>
            </div>
            {/* <!--//리스트 상세 보기 팝업--> */}

        </>
    )

}
