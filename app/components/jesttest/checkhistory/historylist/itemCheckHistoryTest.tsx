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
import React, { useState, useEffect, useCallback, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState, } from '../../../../recoil/userState';
//
import { useTrans } from "../../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
import clog from "../../../../utils/logUtils"
//
import $ from "jquery";
//components
import Pagination from "../../../common/pagination/Pagination"

//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
//datepicker 디자인 - 없으면 깨짐
import "react-datepicker/dist/react-datepicker.css";
//datepocker 언어

import { itemState } from "../../../../recoil/assessmentState";
//
import JSZip from "jszip"
import FileSaver from "file-saver"
import ItemCheckResultTest from "./itemCheckResultTest";



/**
 * @brief EHP List 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */
function ItemCheckHistoryTest(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoState);
    const setRecoilCurItem = useSetRecoilState(itemState); // recoil userState
    const curItem = useRecoilValue(itemState);

    const setParentCurHistoryData = props.setCurHistoryData;
    const setParentCurHistoryInfo = props.setCurHistoryInfo;
    // history props
    //  const [curHistoryData, setCurHistoryData] = useState({});
    //tab
    const [tabItem, setTabItem] = useState([]);
    // 세부사업장
    const [subZoneItem, setSubZoneItem] = useState([])
    const [selectAll, setSelectAll] = useState("전체")
    //사이트
    const [roomItem, setRoomItem] = useState([]);

    // 달력

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDates, setStartDates] = useState(null);
    const [endDates, setEndDates] = useState(null);


    // filter
    const [filterAll, setFilterAll] = useState(true);
    const [filterVcb, setFilterVcb] = useState(false);
    const [filterAcb, setFilterAcb] = useState(false);
    const [filterSwitchboardTr, setFilterSwitchboardTr] = useState(false);
    const [filterMoldTr, setFilterMoldTr] = useState(false);
    const [filterHydraulicTr, setFilterHydraulicTr] = useState(false);
    const [filterGis, setFilterGis] = useState(false);
    const [stepAll, setStepAll] = useState(true);
    const [stepBasic, setStepBasic] = useState(false);
    const [stepPremium, setStepPremium] = useState(false);
    const [stepAdvanced, setStepAdvanced] = useState(false);
    //search
    const [searchType, setSearchType] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchRText, setSearchRText] = useState("");
    // data
    const [resErrorCode, setResErrorCode] = useState(200);
    const [curHistoryData, setCurHistoryData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [pageMove, setPageMove] = useState(null)
    // checkBox
    const [checkItem, setCheckItem] = useState([]);

    //페이징
    const [curPage, setCurPage] = useState(0);
    const pageSize = 10;
    const listSize = 10;
    const [retPageInfo, setRetPageInfo] = useState({
        "size": 0,
        "totalElements": 0,
        "totalPages": 0,
        "number": 0
    });
    //다음 이전 버튼
    const [curPos, setCurPos] = useState(0);
    const [tabSize, setTabSize] = useState(3);
    const tabRef = useRef(null);
    const [tabMove, setTabMovej] = useState(null);
    // const [tabData, setTabData] = useState({ "tabField": "tab-" + zone.zoneId, "className": "on" });


    //조회 
    const [subZoneInfo, setSubZoneInfo] = useState("");
    const [roomInfo, setRoomInfo] = useState("");

    const [allFilter, setAllFilter] = useState("");
    const [vcb, setVcb] = useState("");
    const [acb, setAcb] = useState("");
    const [SwitchboardTr, setSwitchboardTr] = useState("");
    const [moldTr, setMoldTr] = useState("");
    const [HydraulicTr, setHydraulicTr] = useState("");
    const [gis, setGis] = useState("");
    const [allStep, setAllStep] = useState("");
    const [basic, setBasic] = useState("");
    const [premium, setPremium] = useState("");
    const [advanced, setAdvanced] = useState("");
    //pdf
    const [pdfZip, setPdfZip] = useState([]);

    //mobile
    const [isMobile, setIsMobile] = useState(false);
    //
    const [mobileSize, setMobileSize] = useState(null);
    const mobileRef = useRef(null); // Mobile Check용
    // 
    // mobile check용 
    useEffect(() => {
        setMobileSize(mobileRef.current);

    }, [mobileRef]);
    // Mobile 체크
    function handleResize() {
        //   clog("IN BASIC : MOBILE CHECK : RESIZE : clientHeight :" + mobileSize.clientHeight);
        //   clog("IN BASIC : MOBILE CHECK : RESIZE : clientWidth :" + mobileSize.clientWidth);
        clog("IN BASIC : MOBILE CHECK : RESIZE :" + mobileSize);
        if (CUTIL.isnull(mobileSize)) return;
        if ((mobileSize.clientHeight <= 0) && (mobileSize.clientWidth <= 0)) {
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
    }, [mobileSize, isMobile]);
    // clog("IN BASIC : curPage : " + curPage);


    // tab APi
    const { data: tab } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: "/api/v2/product/zone/company",
        appQuery: {},
        // userToken: userInfo.userInfo.token,
    });

    useEffect(() => {
        setTabMovej(tabRef.current);
    });
    // 이전&다음 버튼 이벤트
    function next(idx) {
        setCurPos(idx + 1);
    }
    function prev(idx) {
        setCurPos(idx - 1);
    }

    // select active 액션
    function toggleSelectBox(selectBox) {
        selectBox.classList.toggle("active");
    }

    // option 선택 시  값 변경 액션
    function selectOption(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        // clog("OPT VAL : " + optionElement.value);
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
    // 세부사업장 셀텍트
    async function onClickSubZoneSelect(e) {
        var zoneTag = (e.target.tagName == "LI") ? e.target.getAttribute("data-value") : "";

        var subZoneId = zoneTag
        //  clog(zoneTag)
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            "httpMethod": "GET",
            "appPath": `/api/v2/product/company/zone/${subZoneId}`,
            // userToken: userInfo.userInfo.token,
        });
        if (data.codeNum == 200) {
            setRoomItem(data.body);
        }
    }
    // 사이트 셀렉트
    function onClickRoomSelect(e) {
        var zoneTag = (e.target.tagName == "LI") ? e.target : e.currentTarget;

        var roomId = zoneTag.getAttribute("data-value");
    }


    // 날짜 연산 함수 - data-value에 따라 값 변화
    const handleDay = (e) => {
        const today = new Date();
        const newDay = new Date()
        var dayTag = (e.target.tagName == "DIV") ? e.target : e.currentTarget;
        var daySelected = dayTag.getAttribute("data-value");
        //  clog(daySelected);
        setStartDate(newDay.setDate(today.getDate() - daySelected));
        setEndDate(today);


    }


    //필터 이벤트 

    function layerOpen(e) {
        var actTag = (e.target.tagName == "DIV") ? e.target : e.currentTarget;
        var activeLayer = actTag.getAttribute("data-pop");

        // 레이어 팝업 화면 가운데 정렬
        $("#" + activeLayer + ".popup-layer.page-report").css("position", "absolute");
        $("#" + activeLayer + ".popup-layer.page-report").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
        $("#" + activeLayer + ".popup-layer.page-report").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

        var mql3 = window.matchMedia("screen and (min-width: 1522px)"); //220628(3) min-width값 변경,
        if (mql3.matches) {
            $(".js-open-m").attr("");
        } else {
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
        }

        //닫기 버튼 , 배경 클릭 시
        $("#" + activeLayer)
            .children()
            .children(".js-close")
            .on("click", function () {
                $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
                $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
            });

    }
    // 필터 이벤트
    function filterOpen(e) {
        const targetElement = e.target as unknown as HTMLElement;
        const filterBox = targetElement.closest(".filter");
        if (CUTIL.isnull(filterBox)) return;
        //  clog(flieterLayer);
        // clog("filterOpen : " + filterBox.className);
        if (filterBox.classList.contains("open")) {
            filterBox.classList.remove("open"); // open
            setFilterAll(true);

            // 점검 단계 초기화
            setStepAll(true);

            //
            // 페이지 초기화
            // setCurPage(0);
            setSubZoneInfo("");
            setRoomInfo("");
            setAllFilter("all");
            setVcb("");
            setAcb("");
            setSwitchboardTr("");
            setMoldTr("");
            setHydraulicTr("");
            setGis("");
            setAllStep("all");
            setBasic("");
            setPremium("");
            setAdvanced("");
        } else {
            filterBox.classList.add("open"); // close

        }

        const changeBoxElements = document.querySelectorAll(".search-small");
        changeBoxElements.forEach((boxElement) => {
            boxElement.classList.remove("open");
        });
    }

    //필터 초기화 버튼 이벤트
    function resetBtn(e) {
        setFilterAll(true);
        setFilterVcb(false);
        setFilterAcb(false);
        setFilterSwitchboardTr(false);
        setFilterMoldTr(false);
        setFilterHydraulicTr(false);
        setFilterGis(false);
        // 점검 단계 초기화
        setStepAll(true);
        setStepBasic(false);
        setStepPremium(false);
        setStepAdvanced(false);
        //
        // 페이지 초기화
        setCurPage(0);
        setSubZoneInfo("");
        setRoomInfo("");
        setStartDates("");
        setEndDates("");
        setAllFilter("all");
        setVcb("");
        setAcb("");
        setSwitchboardTr("");
        setMoldTr("");
        setHydraulicTr("");
        setGis("");
        setAllStep("all");
        setBasic("");
        setPremium("");
        setAdvanced("");
        //
        setSearchType("");
        setSearchRText("");

    }

    // 전체 이벤트
    function deviceTypeAll(e) {
        if (filterAll === false) {
            setFilterAll(true);
            setFilterVcb(false);
            setFilterAcb(false);
            setFilterSwitchboardTr(false);
            setFilterMoldTr(false);
            setFilterHydraulicTr(false);
            setFilterGis(false);
        }
    }
    // vcb
    function deviceTypeVcb(e) {
        if (filterVcb === false) {
            setFilterVcb(true);
            setFilterAll(false);
        } else {
            setFilterVcb(false);
        }
    }
    //ACB
    function deviceTypeAcb(e) {

        if (filterAcb === false) {
            setFilterAcb(true);
            setFilterAll(false);
        } else {
            setFilterAcb(false);
        }

    }
    // 배전반Tr
    function deviceTypeSwitchboardTr(e) {

        if (filterSwitchboardTr === false) {
            setFilterSwitchboardTr(true);
            setFilterAll(false);
        } else {
            setFilterSwitchboardTr(false);
        }
    }
    //moldTR
    function deviceTypeMoldTr(e) {

        if (filterMoldTr === false) {
            setFilterMoldTr(true);
            setFilterAll(false);
        } else {
            setFilterMoldTr(false);
        }

    }
    // 유입식Tr
    function deviceTypeHydraulicTr(e) {

        if (filterHydraulicTr === false) {
            setFilterHydraulicTr(true);
            setFilterAll(false);
        } else {
            setFilterHydraulicTr(false);
        }

    }
    //GIS
    function deviceTypeGis(e) {

        if (filterGis === false) {
            setFilterGis(true);
            setFilterAll(false);
        } else {
            setFilterGis(false);
        }
    }

    // 점검단계 전체
    function checkStepAll(e) {
        if (stepAll === false) {
            setStepAll(true);
            setStepBasic(false);
            setStepPremium(false);
            setStepAdvanced(false);
        }

    }
    // Basic
    function checkStepBasic(e) {
        if (stepBasic === false) {
            setStepBasic(true);
            setStepAll(false);
        } else {
            setStepBasic(false);
        }
    }
    //Premium
    function checkStepPremium(e) {

        if (stepPremium === false) {
            setStepPremium(true);
            setStepAll(false);
            ;

        } else {
            setStepPremium(false);
        }

    }
    //Advanced
    function checkStepAdvanced(e) {

        if (stepAdvanced === false) {
            setStepAdvanced(true);
            setStepAll(false);

        } else {
            setStepAdvanced(false);
        }
    }

    function filterSearch(e) {
        var subZone = $("#subZone_selected-value").attr("data-value"); // 상세사업장
        var room = $("#room_selected-value").attr("data-value"); // 사이트

        //기기유형 전체 
        if (filterAll == false) {
            setAllFilter("");
            // vcb
            if (filterVcb === true) {
                setVcb("VCB");
            } else {
                setVcb("");
            }

            //ACB
            if (filterAcb === true) {
                setAcb("ACB");
            } else {
                setAcb("");
            }

            // 배전반Tr
            if (filterSwitchboardTr === true) {
                setSwitchboardTr("배전반");
            } else {
                setSwitchboardTr("");
            }

            //moldTR
            if (filterMoldTr === true) {
                setMoldTr("MoldTR");
            } else {
                setMoldTr("");
            }

            // 유입식Tr
            if (filterHydraulicTr === true) {
                setHydraulicTr("유입식TR");
            } else {
                setHydraulicTr("");
            }

            //GIS

            if (filterGis === true) {
                setGis("GIS");
            } else {
                setGis("");
            }

        } else if (filterAll == true) {
            setAllFilter("all");
            setVcb("");
            setAcb("");
            setSwitchboardTr("");
            setMoldTr("");
            setHydraulicTr("");
            setGis("");
        }

        // step 전체
        if (stepAll == false) {
            setAllStep("")
            // Basic
            if (stepBasic === true) {
                //
                setBasic("BASIC");
            } else {
                //
                setBasic("");
            }

            //Premium
            if (stepPremium === true) {
                //
                setPremium("PREMIUM");

            } else {
                //
                setPremium("");
            }

            //Advanced
            if (stepAdvanced === true) {
                //
                setAdvanced("ADVANCED");
            } else {
                //
                setAdvanced("");
            }

        } else if (stepAll == true) {
            setAllStep("all")
            // Basic
            setBasic("");
            //Premium
            setPremium("");
            //Advanced
            setAdvanced("");
        }

        //
        setSubZoneInfo(subZone)
        setRoomInfo(room)
        setStartDates(startDate);
        setEndDates(endDate);
        // 검색 초기화
        setSearchType("");
        setSearchRText("");

    }



    //검색 이벤트
    function searchOpen(e) {
        const targetElement = e.target as unknown as HTMLElement;
        const searchBox = targetElement.closest(".search-small");
        if (CUTIL.isnull(searchBox)) return;


        // clog("searcOpen : " + searchBox.className);
        if (searchBox.classList.contains("open")) {
            searchBox.classList.remove("open"); // open

        } else {
            searchBox.classList.add("open"); // close
        }
        const changeBoxElements = document.querySelectorAll(".filter");
        changeBoxElements.forEach((boxElement) => {
            boxElement.classList.remove("open");


        });
    };
    //검색 버튼
    function onClickGoSearch(e) {

        var selSearchType = $("#search_selected-value").attr("data-value");
        // 페이지 초기화
        setCurPage(0);
        setSubZoneInfo("");
        setRoomInfo("");
        setStartDates("");
        setEndDates("");
        setAllFilter("");
        setVcb("");
        setAcb("");
        setSwitchboardTr("");
        setMoldTr("");
        setHydraulicTr("");
        setGis("");
        setAllStep("");
        setBasic("");
        setPremium("");
        setAdvanced("");
        //  
        setSearchType(selSearchType);
        setSearchRText(searchText);
    }


    //chcek
    const checkedAll = useCallback((checked) => {
        if (checked) {
            const checkedArray = [];
            const pdfArray = [];
            historyData.forEach((list) => { checkedArray.push(list), pdfArray.push(list.reportId) });
            setCheckItem(checkedArray);
            setPdfZip(pdfArray)
        } else {
            setCheckItem([]);
            setPdfZip([])
        }
    }, [historyData])

    const checkedList = useCallback((checked, list) => {
        if (checked) {
            setCheckItem([...checkItem, list]);
            setPdfZip([...pdfZip, list.reportId]);
        } else {
            setCheckItem(checkItem.filter((el) => el !== list));
            setPdfZip(pdfZip.filter((el) => el !== list.reportId));
        }
    }, [checkItem, pdfZip])
    //단일 PDF 다운로드
    async function onClickReportDownload(e, list) {
        //alert("selected-data : " + selectedPeriod);
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            "httpMethod": "GET",
            "appPath": `/api/v2/report/${list.reportId}`,
            "appQuery": {
            },
            // userToken: userInfo.userInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN COMUTILS : GET FILEDOWNLOAD : " + JSON.stringify(data));
                HttpUtil.fileDownload(`${list.itemReportDtoOut.itemName}_진단점검리포트.PDF`, data.body.fileLink);
            } else {

            }
        }
    }
    //zlp 다운로드
    async function onClickZip(e, reportId, checkItem) {


        if (reportId.length == 1) {
            let data: any = null;
            data = await HttpUtil.PromiseHttp({
                "httpMethod": "GET",
                "appPath": `/api/v2/report/${reportId}`,
                "appQuery": {
                },
                // userToken: userInfo.userInfo.token,
            });
            if (data) {
                if (data.codeNum == 200) {
                    // clog("IN COMUTILS : GET FILEDOWNLOAD : " + JSON.stringify(data));
                    HttpUtil.fileDownload(`${reportId}_진단점검리포트.PDF`, data.body.fileLink);
                } else {

                }
            }

        } else if (reportId.length > 1) {
            for (var i = 0; i < reportId.length; i++) {
                clog(reportId[i])

                let data: any = null;
                data = await HttpUtil.PromiseHttp({
                    "httpMethod": "GET",
                    "appPath": `/api/v2/report/${reportId[i]}`,
                    "appQuery": {
                    },
                    // userToken: userInfo.userInfo.token,
                    watch: reportId[i]
                });
                if (data) {
                    if (data.codeNum == 200) {
                        // clog("IN COMUTILS : GET FILEDOWNLOAD : " + JSON.stringify(data));
                        var resZip = HttpUtil.fileDownload(`${reportId[i]}_진단점검리포트.PDF`, data.body.fileLink);
                        const zip = new JSZip(); // ZIP 객체 생성

                        // zip.file(`${reportId[i]}_진단점검리포트.PDF`, data.body.fileLink[i]); //HelloZip 폴더에 꾸생.txt 생성

                        //  zip.generateAsync({type:"blob"}) //압축파일 생성
                        //  .then((resZip) => {

                        //  FileSaver.saveAs(resZip, `${CUTIL.utc2time("YYYY-MM-DD",data.body.updatedTime)}.zip`); //file-saver 라이브러리 사용

                        //  });
                    } else {

                    }
                }
            }
        }

        // const zip = new JSZip(); // ZIP 객체 생성

        // zip.file(`${CUTIL.utc2time("YYYY-MM-DD", data.body.updatedTime)}.pdf`, data.body.fileLink); //HelloZip 폴더에 꾸생.txt 생성

        /* zip.generateAsync({type:"blob"}) //압축파일 생성
         .then((resZip) => {
             
             FileSaver(resZip, "꾸생.zip"); //file-saver 라이브러리 사용
     
         }); */
    }

    async function getResultBtn(e, list) {
        setParentCurHistoryData(list.assessmentId);
        setParentCurHistoryInfo(list)
    }

    const tabList = (tabItem == null) ? null : tabItem; // 탭 
    const subZoneList = (subZoneItem == null) ? null : subZoneItem; // 세부사업장
    //  clog("sub:"+ JSON.stringify(subZoneList)) ;
    const roomList = (roomItem == null) ? null : roomItem; // 사이트
    //  clog(roomList) ;
    const dataList = (historyData == null) ? null : historyData; // ListAPI
    // clog("list")
    // clog(dataList);


    return (
        <>
            {/*<!--그리드 영역 -->*/}
            <article className="box list">
                {/*<!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 -->*/}
                {/* <div className={`box__body ${((resErrorCode != 200) || (retPageInfo.totalElements <= 0)) ? "nodata" : ""}`}> */}
                <div className={`box__body ${((resErrorCode != 200) || (retPageInfo.totalElements <= 0)) ? "nodata" : ""}`}>
                    {/* <div className="box__body nodata" > */}
                    {/*<!--슬라이드 탭 영역-->*/}
                    <section className="swiper-section">
                        <div className="swiper-container mySwiper">
                            <div style={{ "cursor": "pointer" }} className="swiper-wrapper">
                                {/*<!--선택된 탭에 on 클래스 자동 생성, 첫번째 탭에는 on 넣기(기본 선택 탭)-->*/}
                                {/* <div className="swiper-slide tab " data-tab="tab-2"><p>LS일렉트릭 청주사업장</p></div>  */}
                            </div>
                        </div>
                        <div className="swiper-navigation">
                            {(curPos > 0) ?
                                <div className="swiper-button-prev" onClick={(e) => prev(curPos)}></div>
                                :
                                <div className="swiper-button-prev  swiper-button-disabled" aria-disabled ></div>
                            }
                            {((curPos + listSize) < tabList.length) ?
                                <div className="swiper-button-next" onClick={(e) => next(curPos)}></div>
                                :
                                <div className="swiper-button-next swiper-button-disabled" aria-disabled></div>
                            }
                        </div>
                    </section>
                    {/* <!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출--> */}
                    <div className="d-sm-tab">
                        <div className="select" onClick={(e) => onClickSelect(e)}>
                            <div className="selected">
                                <div className="selected-value">LS일렉트릭 안양</div>
                                <div className="arrow"></div>
                            </div>
                            <ul>


                            </ul>
                        </div>
                    </div>
                    {/* <!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출--> */}
                    {/*<!--탭별  내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
                    <div id="tab-1" className="tabcontent current">
                        {/*<!-- Tab1 내용 -->*/}
                        {/*<!--tabcontent__top-->*/}
                        <div className="tabcontent__top">
                            <div className="search">
                                <ul className="form__input">
                                    <li>
                                        <label htmlFor="company">상세 사업장</label>
                                        <div className="input__area">
                                            <div className="select" onClick={(e) => onClickSelect(e)}>
                                                {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
                                                <div className="selected">
                                                    <div id="subZone_selected-value" className="selected-value" >{selectAll}</div>
                                                    <div className="arrow"></div>
                                                </div>
                                                <ul>
                                                    {subZoneList.map((data) => (
                                                        <li key={data.subZoneId} data-value={data.subZoneId} className="option" onClick={(e) => onClickSubZoneSelect(e)}>{data.subZoneName}</li>
                                                    ))}

                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <label htmlFor="site">전기실</label>
                                        <div className="input__area">
                                            <div className="select" onClick={(e) => onClickSelect(e)}>
                                                {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
                                                <div className="selected">
                                                    <div id="room_selected-value" className="selected-value">{selectAll}</div>
                                                    <div className="arrow"></div>
                                                </div>
                                                <ul>
                                                    {roomList.map((data) => (
                                                        <li key={data.roomId} data-value={data.roomId} className="option" onClick={(e) => onClickRoomSelect(e)}>{data.roomName}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <label htmlFor="term">조회기간</label>
                                        <div className="input__area">
                                            {/*<!--searchterm 기간조회 클래스-->*/}
                                            <div className="searchterm">
                                                <div className="select term__month" onClick={(e) => onClickSelect(e)}>
                                                    <div className="selected">
                                                        <div id="date_selected-value" className="selected-value">날짜 선택</div>
                                                        <div className="arrow"></div>
                                                    </div>
                                                    <ul>
                                                        {/* <li className="option" data-value="0" onClick={(e) => handleDay(e)}>날짜 선택</li> */}
                                                        <li className="option" data-value="30" onClick={(e) => handleDay(e)}>최근 1개월</li>
                                                        <li className="option" data-value="90" onClick={(e) => handleDay(e)}>최근 3개월</li>
                                                        <li className="option" data-value="180" onClick={(e) => handleDay(e)}>최근 6개월</li>
                                                        <li className="option" data-value="365" onClick={(e) => handleDay(e)}>최근 1년</li>
                                                    </ul>
                                                </div>
                                                <div className="term__date">
                                                    {/* <input className="calendar" type="text" id="dp655863510467" name="" autoComplete="off" readOnly /> */}
                                                    <DatePicker
                                                        id="dp655863510467"
                                                        // className="calendar"
                                                        // autoComplete="off"
                                                        // locale={ko}
                                                        todayButton="today"
                                                        dateFormat="yyyy-MM-dd"
                                                        selected={startDate}
                                                        onChange={(date) => setStartDate(date)}
                                                    />
                                                    <span className="centerline">~</span>
                                                    {/* <input type="text" id="dp1655863510468" name="" className="calendar" autoComplete="off" readOnly /> */}
                                                    <DatePicker
                                                        id="dp1655863510468"
                                                        // className="calendar"
                                                        // autoComplete="off"
                                                        //locale={ko}
                                                        todayButton="today"
                                                        dateFormat="yyyy-MM-dd"
                                                        selected={endDate}
                                                        onChange={(date) => setEndDate(date)}
                                                    // includeDates={[new Date()]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                <div className="btn__wrap">
                                    <button type="button" data-testid="searchClick" className="btn-search" onClick={(e) => filterSearch(e)}><span>조회</span></button>
                                </div>
                            </div>
                            {/*<!--filter-->*/}
                            {/* <!--220627, js-open 클래스 추가 및 data-pop추가 --> */}
                            {(isMobile) &&
                                //모바일용--
                                <div className="filter js-open-m" data-pop="pop-filter" onClick={(e) => layerOpen(e)}>
                                    <p className="title"   >
                                        <span>Filter</span>
                                    </p>
                                </div>
                            }
                            {(!isMobile) &&
                                // 웹 용
                                <div className="filter" >
                                    <p className="title" onClick={(e) => filterOpen(e)}  >
                                        <span>Filter</span>
                                        <button type="button" className="btn btn-close"><span className="hide">filter 닫기</span></button>
                                        <span className="info">* 창을 닫으면 Filter는 초기화 됩니다.</span>
                                    </p>
                                    <div className="filter__select">
                                        <div className="filter__type">
                                            <p className="tit">기기 유형</p>
                                            <ul className="type__cont">
                                                {/*<!-- 선택시 on 클래스 붙여주세요~ -->*/}
                                                <li className={(filterAll) ? "on" : ""} onClick={(e) => deviceTypeAll(e)}><a >전체</a></li>
                                                <li className={(filterVcb) ? "on" : ""} onClick={(e) => deviceTypeVcb(e)}><a >VCB</a></li>
                                                <li className={(filterAcb) ? "on" : ""} onClick={(e) => deviceTypeAcb(e)}><a >ACB</a></li>
                                                <li className={(filterSwitchboardTr) ? "on" : ""} onClick={(e) => deviceTypeSwitchboardTr(e)}><a >배전반 Tr</a></li>
                                                <li className={(filterMoldTr) ? "on" : ""} onClick={(e) => deviceTypeMoldTr(e)}><a >Mold Tr</a></li>
                                                <li className={(filterHydraulicTr) ? "on" : ""} onClick={(e) => deviceTypeHydraulicTr(e)}><a >유압식 Tr</a></li>
                                                <li className={(filterGis) ? "on" : ""} onClick={(e) => deviceTypeGis(e)}><a >GIS</a></li>
                                            </ul>
                                        </div>
                                        <div className="filter__type">
                                            <p className="tit">점검 단계</p>
                                            <ul className="type__cont">
                                                {/*<!-- 선택시 on 클래스 붙여주세요~ -->*/}
                                                <li className={(stepAll) ? "on" : ""} onClick={(e) => checkStepAll(e)}><a >전체</a></li>
                                                <li className={(stepBasic) ? "on" : ""} onClick={(e) => checkStepBasic(e)}><a >Basic</a></li>
                                                <li className={(stepPremium) ? "on" : ""} onClick={(e) => checkStepPremium(e)}><a >Premium</a></li>
                                                <li className={(stepAdvanced) ? "on" : ""} onClick={(e) => checkStepAdvanced(e)}><a >Advanced</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            }
                            {/*<!--search-small-->*/}
                            {/* <!--search-small--> <!--220628, js-open 클래스 추가 및 data-pop추가 --> */}
                            {(isMobile) &&
                                // 모바일용
                                <div className="search-small js-open-m" data-pop="pop-search-small" onClick={(e) => layerOpen(e)}>
                                    <p className="title" >
                                        <span>검색</span>
                                    </p>
                                </div>
                            }
                            {(!isMobile) &&
                                //웹 용
                                <div className="search-small">
                                    <p className="title" onClick={(e) => searchOpen(e)}>
                                        <span>검색</span>
                                        <button type="button" className="btn btn-close"><span className="hide">검색 닫기</span></button>
                                    </p>
                                    <div className="search__cont">
                                        <div className="searcharea">
                                            <div className="filterPop">
                                                <div className="select" onClick={(e) => onClickSelect(e)}>
                                                    <div className="selected">
                                                        <div id="search_selected-value" className="selected-value" data-value="itemName">기기 명</div>
                                                        <div className="arrow"></div>
                                                    </div>
                                                    <ul>
                                                        <li className="option" value="0" data-value="itemName">기기 명</li>
                                                        <li className="option" value="1" data-value="serialNo" >제조번호</li>
                                                        <li className="option" value="2" data-value="responsible" >담당자</li>
                                                    </ul>
                                                </div>
                                                <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                            </div>

                                            {/* <input type="text" className="d-sm-block-deviceType" placeholder="기기명을 입력하세요." readOnly /> */}
                                            <button type="button" className="btn btn-delete"><span className="hide">입력 창 닫기</span></button>
                                            <button type="button" data-testid="searchinsearch" className="btn-search" onClick={(e) => onClickGoSearch(e)} ><span>조회</span></button>
                                        </div>
                                    </div>
                                </div>
                            }
                            {/* <!--220627 추가--> */}
                            {(filterAll) && (stepAll) ?
                                <button type="button" className="btn-renew" disabled><span>필터 초기화</span></button> :
                                <button type="button" className="btn-renew" onClick={(e) => resetBtn(e)}><span>필터 초기화</span></button>
                            }
                        </div>
                        {/*<!--//tabcontent__top-->*/}

                        {/*<!-- 리스트 위 항목 -->*/}

                        <div className="tbl__top">
                            <div className="right">
                                <button type="button" className="btn-basic" onClick={(e) => onClickZip(e, pdfZip, checkItem)}><span>Report Download</span></button>
                            </div>
                        </div>
                        {/*<!--220602, 데이터 없는 경우 아래 p 태그 위치 수정됨 테이블 위로 -->*/}
                        {/* {((resErrorCode != 200) || (retPageInfo.totalElements <= 0)) && */}

                        {((resErrorCode != 200) || (retPageInfo.totalElements <= 0) || (dataList == null)) &&
                            <p className="nodata__txt">데이터를 찾을 수 없습니다.</p>
                        }

                        {/*<!-- 기본 리스트 형식 테이블, 기본 중앙정렬, td가 전체적으로 좌측일 경우 tbl-list에 txt-left 클래스 추가, 우측일때 txt-right추가 -->*/}
                        <div className="tbl-list">
                            <table summary="선택, 점검단계,사업장,전기실,유형,기기명,제조번호,담당자,점검일자,평가점수,Report,Memo,점검 결과 항목으로 구성된 Report-List 입니다.">
                                <caption>
                                    Report-List
                                </caption>
                                <colgroup>
                                    <col style={{}} />
                                </colgroup>
                                {/* <!--220627, 탭 사이즈에서 삭제되는 부분 class="d-lm-none" 추가 (thead, tbody 전체확인)-->
                             <!--220628, 1522,탭 사이즈에서 삭제되는 부분 class="d-mm-none", class="d-lm-none" 추가 정리 (thead, tbody 전체확인)-->
                             <!--220628, 모바일 사이즈에서 삭제되는 부분 class="d-sm-none" 추가 (thead, tbody 전체확인)--> */}
                                <thead>
                                    <tr>
                                        <th scope="col" className="d-mm-none">
                                            <input data-testid="checkAll" type="checkbox" id="t_all" checked={checkItem.length === 0 ? false : checkItem.length === dataList.length ? true : false}
                                                onChange={(e) => checkedAll(e.target.checked)} /><label htmlFor="t_all"><span className="hide">선택</span></label>
                                        </th>
                                        <th scope="col"><span>점검 단계</span></th>
                                        <th scope="col" className="txt-left d-sm-none"><span>상세사업장</span></th>
                                        <th scope="col" className="txt-left d-sm-none"><span>전기실</span></th>
                                        <th scope="col" className="txt-left d-lm-none"><span>유형</span></th>
                                        <th scope="col" className="txt-left"><span>기기 명</span></th>
                                        <th scope="col" className="txt-left d-mm-none"><span>제조번호</span></th>
                                        <th scope="col" className="txt-left d-mm-none"><span>담당자</span></th>
                                        <th scope="col" className="txt-left"><span>점검 일자</span></th>
                                        <th scope="col" className="txt-left d-lm-none"><span>평가점수</span></th>
                                        <th scope="col" className="d-mm-none"><span>Report</span></th>
                                        <th scope="col" className="d-lm-none"><span>Memo</span></th>
                                        <th scope="col" className="txt-left"><span>점검 결과</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {(dataList !== null) && dataList.map((list, idx) => ( */}
                                    <tr key="1">
                                        <td className="d-mm-none">
                                            <input data-testid="check1" type="checkbox" id={"t_" + 1} checked /><label htmlFor={"t_" + 1}><span className="hide">선택</span></label>
                                        </td>
                                        {/* <!--220628, B, P, A 아이콘 ehc-b, ehc-p, ehc-a--> */}
                                        {/*   <td>
                                                <span className={`checkstep ${(list.checkStepDto.name === "BASIC") ? "ehc-b" : (list.checkStepDto.name === "PREMIUM") ? "ehc-p" : (list.checkStepDto.name === "ADVANCED") ? "ehc-a" : ""}`}>
                                                    {(list.checkStepDto.name === "BASIC") ? "B" : (list.checkStepDto.name === "PREMIUM") ? "P" : (list.checkStepDto.name === "ADVANCED") ? "A" : ""}
                                                </span>
                                            </td> */}

                                        {/* <td className="txt-left d-sm-none">{list.itemReportDtoOut.itemId.split(":")[2]}</td>
                         <td className="txt-left d-sm-none">{list.itemReportDtoOut.itemId.split(":")[3]}</td> */}
                                        <td className="txt-left d-sm-none">	1공장</td>
                                        <td className="txt-left d-sm-none">	전기실1</td>
                                        <td className="txt-left d-lm-none">VCB</td>
                                        <td className="txt-left">ITEM1</td>
                                        <td className="txt-left d-mm-none"><p className="ellipsis">123412341</p></td>
                                        <td className="txt-left d-mm-none">bsKim</td>
                                        {/* <!--220627,checkdate클래스 삭제 --> */}
                                        <td className="txt-left">2022-07-06</td>
                                        <td className="d-lm-none">
                                            {/* <!--220628, 점수에 따라 high,middle,low--> */}
                                            <p className="score high" >73</p>
                                        </td>
                                        <td className="d-mm-none">
                                            {/*                                                 {(list.reportId != null)
                                                    ? <button type="button" className="btn btn-file" onClick={(e) => { onClickReportDownload(e, list) }}>
                                                        <span className="hide">파일다운로드</span>
                                                    </button>
                                                    : <button type="button" className="btn btn-file" disabled>
                                                        <span className="hide">파일다운로드</span>
                                                    </button>
                                                } */}
                                        </td>
                                        <td className="d-lm-none">
                                            <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                                        </td>
                                        <td>
                                            <button type="button" data-testid="checkEHC" className="bg-gray"  ><span>보기</span></button>
                                        </td>
                                    </tr>


                                </tbody>
                            </table>
                        </div>
                        {/*<!--220530, 검색결과건수와 페이징 감싸는 tbl__bottom 추가됨 -->*/}

                        <Pagination
                            componentName={"HISTORY"}
                            pageSize={pageSize}
                            totalCount={retPageInfo.totalElements}
                            curPage={curPage}
                            listSize={listSize}
                            handleFunc={setCurPage}
                        />
                    </div>
                    {/*<!--//탭별  내용 영역-->*/}
                    {/*===============================================================  */}
                    {/*      {(tabData.tabField !== "tab-0") && <div id="tab-1" className={(tabData.tabField !== "tab-0") ? "box__body nodata" : ""}>
                      <div></div>
                     <p className="nodata__txt">데이터를 찾을 수 없습니다.{tabData.tabField}</p>
                     </div>}*/}
                </div>
                {/*<!--// .box__body-->*/}
                {/* <!-- filter 팝업 --> */}

                <div id="pop-filter" className="popup-layer js-layer layer-out hidden page-detail page-report">
                    <div className="popup__head">
                        <h1 className="icon-filter">Filter</h1>
                        <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                    </div>
                    <div className="popup__body">
                        <ul className="form__input d-sm-block">
                            {/* <!-- 220628 ul 영역 전체추가 --> */}
                            <li>
                                <label htmlFor="company">상세 사업장</label>
                                <div className="input__area">
                                    <div className="select" onClick={(e) => onClickSelect(e)}>
                                        {/* <!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. --> */}
                                        <div className="selected">
                                            <div id="subZone_selected-value" className="selected-value">전체</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {subZoneList.map((data) => (
                                                <li key={data.subZoneId} data-value={data.subZoneId} className="option" onClick={(e) => onClickSubZoneSelect(e)}>{data.subZoneName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <label htmlFor="site">전기실</label>
                                <div className="input__area">
                                    <div className="select" onClick={(e) => onClickSelect(e)}>
                                        {/* <!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. --> */}
                                        <div className="selected">
                                            <div id="room_selected-value" className="selected-value">전체</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {roomList.map((data) => (
                                                <li key={data.roomId} data-value={data.roomId} className="option" >{data.roomName}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <label htmlFor="term">조회기간</label>
                                <div className="input__area">
                                    {/* <!--searchterm 기간조회 클래스--> */}
                                    <div className="searchterm">
                                        <div className="select term__month" onClick={(e) => onClickSelect(e)}>
                                            <div className="selected">
                                                <div id="date_selected-value" className="selected-value">날짜 선택</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {/* <li className="option" data-value="0" onClick={(e) => handleDay(e)}>날짜 선택</li> */}
                                                <li className="option" data-value="30" onClick={(e) => handleDay(e)}>최근 1개월</li>
                                                <li className="option" data-value="90" onClick={(e) => handleDay(e)}>최근 3개월</li>
                                                <li className="option" data-value="180" onClick={(e) => handleDay(e)}>최근 6개월</li>
                                                <li className="option" data-value="365" onClick={(e) => handleDay(e)}>최근 1년</li>
                                            </ul>
                                        </div>
                                        <div className="term__date">
                                            {/* <input className="calendar" type="text" id="dp655863510467" name="" autoComplete="off" readOnly /> */}
                                            <DatePicker
                                                // id="dp655863510467"
                                                // className="calendar"
                                                // autoComplete="off"
                                                // locale={ko}
                                                todayButton="today"
                                                dateFormat="yyyy-MM-dd"
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                            />
                                            <span className="centerline">~</span>
                                            {/* <input type="text" id="dp1655863510468" name="" className="calendar" autoComplete="off" readOnly /> */}
                                            <DatePicker
                                                // id="dp1655863510468"
                                                // className="calendar"
                                                // autoComplete="off"
                                                // locale={ko}
                                                todayButton="today"
                                                dateFormat="yyyy-MM-dd"
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                            // includeDates={[new Date()]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        <div className="filter__select">
                            <div className="filter__type">
                                <p className="tit">기기 유형</p>
                                <ul className="type__cont">
                                    {/* <!-- 선택시 on 클래스 붙여주세요~ --> */}
                                    <li className={(filterAll) ? "on" : ""} onClick={(e) => deviceTypeAll(e)}><a >전체</a></li>
                                    <li className={(filterVcb) ? "on" : ""} onClick={(e) => deviceTypeVcb(e)}><a >VCB</a></li>
                                    <li className={(filterAcb) ? "on" : ""} onClick={(e) => deviceTypeAcb(e)}><a >ACB</a></li>
                                    <li className={(filterSwitchboardTr) ? "on" : ""} onClick={(e) => deviceTypeSwitchboardTr(e)}><a >배전반 Tr</a></li>
                                    <li className={(filterMoldTr) ? "on" : ""} onClick={(e) => deviceTypeMoldTr(e)}><a >Mold Tr</a></li>
                                    <li className={(filterHydraulicTr) ? "on" : ""} onClick={(e) => deviceTypeHydraulicTr(e)}><a>유압식 Tr</a></li>
                                    <li className={(filterGis) ? "on" : ""} onClick={(e) => deviceTypeGis(e)}><a >GIS</a></li>
                                </ul>
                            </div>
                            <div className="filter__type">
                                <p className="tit">점검 단계</p>
                                <ul className="type__cont">
                                    {/* <!-- 선택시 on 클래스 붙여주세요~ --> */}
                                    <li className={(stepAll) ? "on" : ""} onClick={(e) => checkStepAll(e)}><a >전체</a></li>
                                    <li className={(stepBasic) ? "on" : ""} onClick={(e) => checkStepBasic(e)}><a >Basic</a></li>
                                    <li className={(stepPremium) ? "on" : ""} onClick={(e) => checkStepPremium(e)}><a >Premium</a></li>
                                    <li className={(stepAdvanced) ? "on" : ""} onClick={(e) => checkStepAdvanced(e)}><a >Advanced</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="popup__footer">
                        <button type="button" className="bg-gray js-close"><span>취소</span></button>
                        <button type="button" className="js-close" onClick={(e) => filterSearch(e)} ><span>적용</span></button>
                    </div>
                </div>
                {/* <!-- //filter 팝업 --> */}

                {/* <!-- search 팝업, 220628 --> */}
                <div id="pop-search-small" className="popup-layer js-layer layer-out hidden page-detail page-report">
                    <div className="popup__head">
                        <h1 className="icon-search">검색</h1>
                        <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                    </div>
                    <div className="popup__body">
                        <div className="form__input mb-0">
                            <div className="select" onClick={(e) => onClickSelect(e)}>
                                <div className="selected">
                                    <div id="search_selected-value" className="selected-value" data-value="itemName">기기 명</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul>
                                    <li className="option" value="0" data-value="itemName">기기 명</li>
                                    <li className="option" value="1" data-value="serialNo" >제조번호</li>
                                </ul>
                            </div>
                            <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                        </div>
                    </div>
                    <div className="popup__footer">
                        <button type="button" className="bg-gray js-close"><span>취소</span></button>
                        <button type="button" className=" js-close" onClick={(e) => onClickGoSearch(e)} ><span>적용</span></button>
                    </div>
                </div>
                {/* <!-- //search 팝업 --> */}
            </article>

        </>
    )
}

export default ItemCheckHistoryTest;