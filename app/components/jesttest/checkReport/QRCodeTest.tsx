/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-07-13
 * @brief EHP 시험성적서 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useCallback, useRef } from "react";
//
import { useAsync } from "react-async";
import axios from 'axios';
// recoli & state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
import { itemReportListState } from "../../../recoil/reportViewState"
import { menuState, urlState } from '../../../recoil/menuState';
import { curSpgTreeState, } from "../../../recoil/assessmentState";
//
import { useTrans } from "../../../utils/langs/useTrans";
//utils
import clog from "../../../utils/logUtils"
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as FILEUTILS from "../../../utils/file/fileUtil";
//
import $, { cleanData } from "jquery";
//components
import Pagination from "../../common/pagination/Pagination"
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactDOM from "react-dom";
//압축 다운로드
import JSZip from "jszip"
import Scan from "../../common/camera/Scan";

/*
import QrLayoutPopup from "./QrLayoutPopup";
import Guid from "./Guid";
import Uuid from "./Uuid";
import axios from "axios";
*/

/**
 * @brief EHP 시험성적서 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */

function ItemReportView(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [itemReportList, setItemReportList] = useRecoilState(itemReportListState);
    //props



    const [zoneList, setZoneList] = useState([]);
    //tab
    const [itemList, setItemList] = useState([]);
    const [pageInfo, setPageInfo] = useState({ "size": 20, "totalElements": 0, "totalPages": 0, "number": 0 });
    const [tabPos, setTabPos] = useState(0);
    const tabRef = useRef(null);
    const listSize = 10;
    const [tabMove, setTabMove] = useState(null);
    // searchCombo
    /* by sjpark 20220929 기기 명 -> 모델 명, 제조번호 -> 시리얼 번호*/
    const searchFieldList = [
        { "id": 0, "dispTxt": t("FIELD.모델명"), "dispVal": "itemName", },
        { "id": 1, "dispTxt": t("FIELD.시리얼번호"), "dispVal": "serialNo", },
        /*
        { "dispTxt": "모델 명", "paramVal": "itemName", "isSelect": true },
        { "dispTxt": "시리얼 번호", "paramVal": "serialNo", "isSelect": false },
        */
    ]
    const [searchField, setSearchField] = useState(searchFieldList[0]);
    // qr hook
    const [video, setVideo] = useState(false);
    const [serialD, setSerialD] = useState("");
    const [reportList, setReportList] = useState([])
    const [qrSerial, setQrSerial] = useState([])
    const [qrTimeOut, setQrTimeOut] = useState(false)

    //mobile
    const mobileRef = useRef(null); // Mobile Check용
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => { // resize handler
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
    }, []);

    ///
    const { data: data, error, isLoading, reload, run } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: "/api/v2/product/zone/company",
        appQuery: {},
        userToken: userInfo.loginInfo.token,
    });


    // option 선택 시  값 변경 액션
    function selectTabOption(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var zoneInfo = optionElement.getAttribute("data-value");
        //selectedElement.setAttribute("data-value", optionElement.getAttribute("data-value"))
        selectedElement.setAttribute("data-value", zoneInfo);
        clog("OPT VAL : " + optionElement.value);

        // setCurZone(JSON.parse(zoneInfo)); // 탭 또는 모바일 경우
        resetSearchParams();
    }
    // option 선택 시  값 변경 액션
    function selectOptionSearchField(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        setSearchField(JSON.parse(optionData));
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

    useEffect(() => {
        setTabMove(tabRef.current);
    });
    // 이전&다음 버튼 이벤트
    function onClickTabNext(idx) {
        setTabPos(idx + 1);
        if ((idx + 1) < zoneList.length) {
            //setCurZone(zoneList[idx + 1]);
            //resetSearchParams();
        }
    }
    function onClickTabPrev(idx) {
        setTabPos(idx - 1);
        if ((idx - 1) >= 0) {
            //setCurZone(zoneList[idx - 1]);
            //resetSearchParams();
        }
    }

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
        setSearchField(searchFieldList[0]);
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
        searchField: null,
        searchText: null,
    });
    //
    function onClickGoSearch(e) {
        setPageInfo({ "size": 20, "totalElements": 0, "totalPages": 0, "number": 0 });
        setSearchTextField({
            searchField: searchField,
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

    function pdfDownloadAll(e, reportList) {
        clog("IN ItemReports : pdfDownloadAll : " + reportList.length);
        let zips = new JSZip();
        let zipCnt = 0;
        const zipFileName = "검사성적서.zip"
        reportList.map((report) => {
            const sPos = (report.PDF_LINK.lastIndexOf('/') < 0) ? 0 : report.PDF_LINK.lastIndexOf('/');
            const ePos = (report.PDF_LINK.lastIndexOf('?') < 0) ? report.PDF_LINK.length : report.PDF_LINK.lastIndexOf('?');
            var fileName = report.PDF_LINK.substring(sPos + 1, ePos);
            clog("IN ItemReports : pdfDownloadAll : " + zipCnt + " : " + fileName + " : " + report.PDF_LINK);

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
                            FILEUTILS.saveToFile_Chrome(zipFileName, blob);
                        }
                    );
                }
            });
        })
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
                                {/*zoneList.filter((tzone, idx)=>(idx >= tabPos) ).map((tzone, idx) => (*/}
                            </div>
                        </div>
                        {(zoneList.length >= 5) &&
                            <div className="swiper-navigation">
                                {/*clog("SWIPPER : CURPOS : " + tabPos + " : " + zoneList.length)*/}
                                {(tabPos > 0)
                                    ? <div className="swiper-button-prev" onClick={(e) => onClickTabPrev(tabPos)}></div>
                                    : <div className="swiper-button-prev  swiper-button-disabled" aria-disabled ></div>
                                }
                                {((tabPos + 1) < zoneList.length)
                                    ? <div className="swiper-button-next" onClick={(e) => onClickTabNext(tabPos)}></div>
                                    : <div className="swiper-button-next swiper-button-disabled" aria-disabled></div>
                                }
                            </div>
                        }
                    </section>
                    {/* <!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출--> */}
                    <div className="d-sm-tab">
                        <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectTabOption)}>
                            <div className="selected">
                                <div className="selected-value">데이타솔루션 학동1</div>
                                <div className="arrow"></div>
                            </div>
                            <ul>
                            </ul>
                        </div>
                    </div>
                    {/* <!--탭별  내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) --> */}
                    {/* <!--220711, 여기서부터 시험 성적서 조회 내용 작업(해당 태그 안 기록된 주석 모두 확인)--> */}
                    <div id="tab-1" className="tabcontent current">
                        {/* <!-- Tab1 내용 --> */}
                        {/* <!--tabcontent__top, p태그(tabcontent__title) 추가--> */}
                        <div className="tabcontent__top">
                            <p className="tabcontent__title">
                                <span>Test Report {t("LABEL.조회")}</span>
                                <button type="button" className="btn btn-qr js-open" data-pop="pop-qr" onClick={(e) => CUTIL.jsopen_Popup(e)}>
                                    <span data-pop="pop-qr">QR</span>
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
                                        <span>{t("LABEL.필터")}</span>
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
                                        <span>{t("LABEL.검색")}</span>
                                    </p>
                                    <div className="search__cont">
                                        <div ref={mobileRef} className="searcharea">
                                            <div className="searchinput">
                                                <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionSearchField)}>
                                                    <div className="selected">
                                                        <div id="search_selected-value" className="selected-value">{searchFieldList[0].dispTxt/*searchField.dispTxt*/}</div>
                                                        <div className="arrow"></div>
                                                    </div>
                                                    <ul>
                                                        {searchFieldList.map((sf, idx) => (
                                                            <li key={`sf_${idx.toString()}`} className="option" data-value={JSON.stringify(sf)} >{sf.dispTxt}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="input__direct">
                                                    <input type="text" placeholder={t("MESSAGE.검색어를입력하세요")/*"검색어를 입력하세요"*/}
                                                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
                                                    />
                                                    {(searchText.length > 0) &&
                                                        <button type="button" className="btn btn-delete" onClick={(e) => searchTextClose(e)}>
                                                            <span className="hide">입력 창 닫기</span>
                                                        </button>
                                                    }
                                                </div>
                                            </div>
                                            <input type="text"
                                                className="d-sm-block-toggle"
                                                placeholder={t("MESSAGE.기기명을입력하세요")}
                                                value={searchText} onChange={(e) => setSearchText(e.target.value)}
                                            />
                                            <button type="button" className="btn btn-delete">
                                                <span className="hide">입력 창 닫기</span>
                                            </button>
                                            <button type="button"
                                                className="btn-search"
                                                onClick={(e) => onClickGoSearch(e)}
                                            >
                                                <span>{t("LABEL.조회")}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* <!--220627 추가--> */}
                                {((filterList.filter((filter) => (filter.checked) && (filter.fname !== "전체")).length > 0) || (searchText.length > 0))
                                    ? <button type="button" className="btn-renew" onClick={resetSearchParams}><span>{t("LABEL.필터초기화")}</span></button>
                                    : <button type="button" className="btn-renew" disabled><span>{t("LABEL.필터초기화")}</span></button>
                                }
                                {/* <!--비활성화일경우 disabled / 활성화일경우 disabled 삭제 --> */}
                                {(itemReportList.length <= 0)
                                    ? <button type="button" className="btn btn-filedown" disabled>
                                        <span className="hide">다운로드</span>
                                    </button>
                                    : <button type="button" className="btn btn-filedown" onClick={(e) => { pdfDownloadAll(e, itemReportList) }}>
                                        <span className="hide">다운로드</span>
                                    </button>
                                }
                                <button type="button" className="btn btn-qr js-open" data-pop="pop-qr-web" onClick={(e) => CUTIL.jsopen_Popup(e)}>
                                    <span data-pop="pop-qr-web">QR</span>
                                </button>
                            </div>{/*.search__inline*/}
                        </div>{/* <!--//tabcontent__top--> */}
                    </div>{/*.tabcontent current*/}
                </div>{/*.box__body*/}<div ref={onloadRef}></div>
            </article>
            <SearchFilterPopup
                goSearch={onClickGoSearch}
                filterList={filterList}
                handleClickSearchFilter={handleClickSearchFilter}
            />
            <SearchTextPopup
                searchFieldList={searchFieldList}
                searchField={searchField}
                setSearchField={setSearchField}
                searchText={searchText}
                setSearchText={setSearchText}
                //handleSelect={onClickSelect}
                handleOption={selectOptionSearchField}
                goSearch={onClickGoSearch}
            />
            {/* qr 선택 팝업 */}
            <QrCodeSearchPop
                serialD={serialD}
                setSerialD={setSerialD}
                video={video}
                setVideo={setVideo}
                reportList={reportList}
                setReportList={setReportList}
                setReportLoading={setReportLoading}

            />
            {/* qr 선택 팝업 */}
            <QrCodeWebPop
                serialD={serialD}
                setSerialD={setSerialD}
                video={video}
                setVideo={setVideo}
                reportList={reportList}
                setReportList={setReportList}
                setReportLoading={setReportLoading}

            />
            {/* qr scan 팝업  */}
            <QrReaderPop
                video={video}
                setVideo={setVideo}
                qrTimeOut={qrTimeOut}
                setQrTimeOut={setQrTimeOut}
                qrSerial={qrSerial}
                setQrSerial={setQrSerial}

            />
            {/* qr scan 결과 팝업 */}
            <QrScanRsultPop
                serialD={serialD}
                setSerialD={setSerialD}
                setReportList={setReportList}
                reportList={reportList}
                qrSerial={qrSerial}
                video={video}
                setVideo={setVideo}
                qrTimeOut={qrTimeOut}
                setQrTimeOut={setQrTimeOut}
                setQrSerial={setQrSerial}
                setReportLoading={setReportLoading}

            />
            {/* qr 결과 팝업 */}
            <QrRsultPop
                serialD={serialD}
                setSerialD={setSerialD}
                setReportList={setReportList}
                reportList={reportList}
                qrSerial={qrSerial}
                setVideo={setVideo}
                setQrSerial={setQrSerial}
                setReportLoading={setReportLoading}
            />
            {/* <!--221103 시험성적서 조회 팝업--> */}
            <div id="pop-qr-web" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1>시험성적서 조회??</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body pb-0">
                    <ul className="form__input mb-0">
                        {/*      <li>
               <p className="tit">QR Code</p>
               <div className="input__area">
                 <button type="button" className="btn-qrscan js-open" data-pop="pop-qr-open" onClick={(e) => qrSanOpen(e)}><span data-pop="pop-qr-open">QR Code Scan</span></button>
               </div>
             </li> */}
                        <li>
                            <p className="tit">직접 입력</p>
                            <div className="input__area">
                                <input type="text" className={"input-error"} data-testid="serialNumberCheck"
                                    defaultValue={serialD} placeholder="기기의 시리얼번호를 직접 입력하세요." />
                                {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "report")).map((err) => err.msg)}</p> */}
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button" data-testid="webCheckSerial" className="js-open " data-pop="pop-qr-result"><span data-pop="pop-qr-result" >확인</span></button>
                </div>
            </div>
            {/* <!--//221103 시험성적서 조회 팝업--> */}
            {/* <!--221103 조회 결과 팝업 / style 부분은 화면확인을 위해서 넣어뒀으니 적용하시고 삭제 해 주세요--> */}
            <div id="pop-qr-result" className="popup-layer js-layer layer-out hidden page-detail page-report" >
                <div className="popup__head">
                    <h1>조회 결과</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className={`popup__body pb-0 nodata`}>
                    <p className="nodata__txt">데이터를 찾을 수 없습니다.</p> {/* nodata */}
                    <div className="tbl-list type2 qr-result">
                        <table summary="파일 명,생성일,첨부 파일 항목으로 구성된 성적서 파일 상세 리스트 입니다.">
                            <caption>
                                파일 상세 리스트
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">파일 명</th>
                                    <th scope="col">생성일</th>
                                    <th scope="col" className="txt-center">첨부 파일</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key={"report_"}>
                                    <td>
                                    </td>
                                    <td className="btn__tdarea">
                                        <button type="button" data-testid="webFileDownload" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="popup__footer">
                    < button type="button" className="bg-gray"><span data-pop="pop-qr-open">다시하기</span></button>
                    <button type="button" className="js-close"><span>확인</span></button>
                </div>
            </div>
            {/* <!--//221103 조회 결과 팝업--> */}
            {/* <!--221103 시험성적서 조회 팝업--> */}
            <div id="pop-qr" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1>시험성적서 조회!!</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body pb-0">
                    <ul className="form__input mb-0">
                        <li>
                            <p className="tit">QR Code</p>
                            <div className="input__area">
                                <button type="button" data-testid="QRScanCheck" className="btn-qrscan js-open" data-pop="pop-qr-open" ><span data-pop="pop-qr-open">QR Code Scan</span></button>
                            </div>
                        </li>
                        <li>
                            <p className="tit">직접 입력</p>
                            <div className="input__area">
                                <input type="text" className={"input-error"}
                                    defaultValue={serialD} placeholder="기기의 시리얼번호를 직접 입력하세요." />
                                {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "report")).map((err) => err.msg)}</p> */}
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button" className="js-open " data-pop="pop-qr-result" ><span data-pop="pop-qr-result" >확인</span></button>
                </div>
            </div>
            {/* <!--//221103 시험성적서 조회 팝업--> */}
        </>
    )
}

export default ItemReportView;

function ItemReportTabCont(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const itemList = props.itemList;
    const setParentItemList = props.setItemList;
    const pageInfo = props.pageInfo;
    const setParentPageInfo = props.setPageInfo;
    const curZone = props.selZone;
    const searchFilter = props.searchFilter;
    const searchTextField = props.searchTextField;
    const setParentReportLoading = props.setReportLoading;
    const setParentSelReports = props.setSelReports;
    ///
    //const [itemList, setItemList] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    ///////////////////////////////////////////
    let appPath = "";
    ////////////////////////////////////////
    //page":{"size":10,"totalElements":65,"totalPages":7,"number":0}
    //appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
    async function handleScroll(e) {
        var actTag = e.target;
        if (actTag.scrollHeight >= (actTag.clientHeight + actTag.scrollTop + 2)) return;
        if (!isLoading) {
            if (pageInfo.totalPages > pageInfo.number + 1) {
                //clog("IN ItemReport : RESIZE : " + appPath + " : " + JSON.stringify(pageInfo));
                let data: any = null;
                data = await HTTPUTIL.PromiseHttp({
                    "httpMethod": "GET",
                    "appPath": `/api/v2/product/company/zone/room/panel/item/testreport?page=${pageInfo.number + 1}&size=${pageInfo.size}&${appPath}`,
                    "appQuery": {},
                    userToken: userInfo.loginInfo.token,
                });
                if (data) {
                    if (data.codeNum === CONST.API_200) {
                        setParentPageInfo(data.data.page);
                        setParentItemList(itemList.concat(data.body));
                        //alert(`ERROR : ${cmsg.language} : ` + JSON.stringify(data.body.errorList));
                    }
                }
            }
        }
    }

    //appPath = appPath + "&zoneId=" + curZone.zoneId;
    appPath = "zoneId=" + curZone.zoneId;
    /*
    useEffect(() => {
      setParentPageInfo({ ...pageInfo, "totalElements": 0, "totalPages": 0, "number": 0 });
      setParentItemList([]);
    }, [curZone])
    */
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

    /*
    if (searchTextField.searchText.length > 0) {
      appPath = appPath + `&${searchTextField.searchField}=` + searchTextField.searchText;
    }
    */
    //text검색
    if (searchTextField.searchField) {
        if (searchTextField.searchField.dispVal.length > 0) {
            //appPath = appPath + `&searchKind=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
            appPath = appPath + `&${searchTextField.searchField.dispVal}=` + searchTextField.searchText;
        }
    }
    /*
      useEffect(() => {
        if ((searchTextField.searchText)&&(searchTextField.searchText.length > 0)) {
          setParentPageInfo({ ...pageInfo, "totalElements": 0, "totalPages": 0, "number": 0 });
          setParentItemList([]);
        }
        //}, [searchTextField.searchText])
      }, [searchTextField])
    */

    ///////////////

    //clog("IN ItemReport : INIT : " + appPath + " : " + JSON.stringify(pageInfo));
    const { data: retInit, error, isLoading, reload, run } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        //appPath: "/api/v2/product/company/zone/room/panel/item/testreport?" + appPath,
        appPath: `/api/v2/product/company/zone/room/panel/item/testreport?page=${pageInfo.number}&size=${pageInfo.size}&${appPath}`,
        appQuery: {},
        watch: appPath,
        userToken: userInfo.loginInfo.token,
    });
    useEffect(() => {
        if (retInit && (retInit.codeNum === CONST.API_200)) {
            //clog("IN ItemReport: APPPATH : RESULT : " + JSON.stringify(retInit.data.page));
            setParentPageInfo(retInit.data.page);
            setParentItemList(retInit.body);
        }
    }, [retInit, appPath])
    //


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
                const reportInfo = await HTTPUTIL.API_reportView(item.serialNo);
                setParentReportLoading(false);
                setParentItemList(
                    itemList.map((it) => (it.itemId === item.itemId)
                        ? {
                            ...it,
                            subObj: <ItemReports
                                item={it}
                                dispOrd={ord}
                                reportInfo={reportInfo}
                                setReportLoading={setParentReportLoading}
                                setSelReports={setParentSelReports}
                            />
                        }
                        : { ...it })
                );
            }
        })();
    }

    return (
        <>
            {/* <!--데이터 없는 경우 노출됨--> */}
            <div className="tbl-list type2" onScroll={(e) => handleScroll(e)}>
                {/* <!--tbl-list 클래스에 type2 추가--> */}
                <table summary="기기 명,기기 유형,제조번호 항목으로 구성된 시험 성적서 리스트 입니다.">
                    <caption>Test Report 리스트</caption>
                    <colgroup><col style={{}} /></colgroup>
                    <thead>
                        <tr>
                            {/* <!--th, td 영역 첫번째 항목에는 span태그 넣기(클릭시 나오는 상세 테이블은 넣지마세요)--> */}
                            {/*             20220810 테이블 컬럼 순서, 이름 변경.    
             <th scope="col"><span>기기 명</span></th>
             <th scope="col" className="d-sm-none">기기 유형</th>
             <th scope="col" className="d-sm-none">제조번호</th>
             */}
                            <th scope="col" className="d-sm-none"><span>{t("FIELD.기기명")}</span></th>
                            <th scope="col" className="d-sm-none">{t("FIELD.시리얼번호")}</th>
                            <th scope="col" className="d-sm-none">{t("FIELD.모델명")}</th>
                            {/* <!--220819, th class="d-sm-block" 추가(모바일용)--> */}
                            <th scope="col" className="d-sm-block">
                                {/*                   <span className="w40p">기기 명</span>
               <span className="w60p">시리얼 번호</span> */}
                                <span className="w25p">{t("FIELD.기기명")}</span>
                                <span className="w85p">{t("FIELD.모델명")}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(itemList.length < 0) &&
                            <tr>
                                <td>
                                    <p className="nodata__txt">{t("MESSAGE.데이터를찾을수없습니다")}</p>
                                </td>
                            </tr>
                        }
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
                                    {/* <!--d-sm-none 은 웹에서만(768이상) 노출 : 기기유형,제조번호 웹용--> */}
                                    {/*<td className="d-sm-none">{item.spgDtoOut.spgName}</td>
                 <td className="d-sm-none">{item.serialNo}</td>*/}
                                    <td className="d-sm-none"><span>{item.spgDtoOut.spgName}</span></td>
                                    <td className="d-sm-none">{item.serialNo}</td>
                                    <td className="d-sm-none">{item.itemName}</td>

                                    {/* <!--d-sm-block 은 모바일에서만(767이하) 노출 : 기기유형,제조번호 모바일용--> */}
                                    <td className="d-sm-block firstline">
                                        {/* 20220829 박지훈 수정 */}
                                        {/*                       <span className="w40p">{item.spgDtoOut.spgName}</span>
                   <p className="w60p">{item.serialNo}</p> */}
                                        <span className="w25p">{item.spgDtoOut.spgName}</span>
                                        <p className="w85p">{item.itemName}</p>
                                    </td>
                                    {/*<!--220819, 기존의 모바일용 td class="d-sm-block" 에서 기기명 삭제하고 모델명만 노출되게 수정-->*/}
                                    <td className="d-sm-block">
                                        {/* <span>{item.itemName}</span> */}
                                        <span>{t("FIELD.시리얼번호")} : {item.serialNo}</span>
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
        </>
    )
}

function ItemReports(props) {
    //trans
    const t = useTrans();
    //recoil
    const [itemReportList, setRecoilItemReportList] = useRecoilState(itemReportListState); // report download
    //
    const item = props.item;
    const dispOrd = props.dispOrd;
    const reportInfo = props.reportInfo;
    const reportList = reportInfo.IF_RES_DATA;
    const setParentReportLoading = props.setReportLoading;

    function downloadReport(report, callbackFunc) {
        const sPos = (report.PDF_LINK.lastIndexOf('/') < 0) ? 0 : report.PDF_LINK.lastIndexOf('/');
        const ePos = (report.PDF_LINK.lastIndexOf('?') < 0) ? report.PDF_LINK.length : report.PDF_LINK.lastIndexOf('?');

        var fileName = report.PDF_LINK.substring(sPos + 1, ePos);
        clog("IN REPORT VIEW : downloadReport : " + fileName + " : " + sPos + " : " + ePos);
        callbackFunc(true); // 다운로드 로딩 중 표시
        HTTPUTIL.fileDownload(fileName, encodeURI(report.PDF_LINK));
        callbackFunc(false);
    }
    function handleSelReports(e, itemReport) {
        var isChecked = e.target.checked;
        //setParentSelReports(isChecked, itemReport);
        clog("IN ITEMREPORT : handleSelReports : " + JSON.stringify(itemReport));
        if (isChecked) {
            setRecoilItemReportList([...itemReportList, itemReport]);
        } else {
            setRecoilItemReportList(itemReportList.filter((sel => sel.itemReportId !== itemReport.itemReportId)))
        }

    }

    function handleAllCheck(e) {
        var isChecked = e.target.checked;
        if (CUTIL.isnull(reportList)) return;
        let exReportList = itemReportList;
        reportList.map((report, ridx) => {
            exReportList = exReportList.filter((crp) => crp.itemReportId !== `${item.itemId}_${report.REPORT_NO}`);
        })

        if (isChecked) {

            reportList.map((report) => {
                exReportList.push({ ...report, "itemReportId": `${item.itemId}_${report.REPORT_NO}` }); // 제외된 항목
            });
        }
        setRecoilItemReportList(exReportList);
    }


    function handleAllCheckOLD(e) {
        var isChecked = e.target.checked;
        if (CUTIL.isnull(reportList)) return;
        if (isChecked) {
            reportList.map((report) => {
                const exList = itemReportList.filter((sel => sel.itemReportId !== `${item.itemId}_${report.REPORT_NO}`));
                setRecoilItemReportList([...exList, { ...report, "itemReportId": `${item.itemId}_${report.REPORT_NO}` }]);
            });
        } else {
            reportList.map((report) => {
                setRecoilItemReportList(itemReportList.filter((sel => sel.itemReportId !== `${item.itemId}_${report.REPORT_NO}`)))
            });
        }
    }

    const isAllCheck = () => {
        //clog("IN ISALLCHECK : " + JSON.stringify(reportList));
        if (CUTIL.isnull(reportList)) return false;
        let cnt = 0;
        reportList.map((report) => {
            cnt = cnt + itemReportList.filter((sel => sel.itemReportId === `${item.itemId}_${report.REPORT_NO}`)).length;
        });

        return (cnt === reportList.length) ? true : false;
    }

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
                                    <th scope="col" className={"w20"}>
                                        <input type="checkbox" id={`chk_${item.itemId}_all`}
                                            onChange={(e) => handleAllCheck(e)}
                                            checked={isAllCheck()}
                                            disabled={(reportList == null) ? true : false}
                                        />
                                        <label htmlFor={`chk_${item.itemId}_all`}>
                                            <span className="hide">선택</span>
                                        </label>
                                    </th>
                                    <th scope="col">{t("FIELD.파일명")}</th>
                                    <th scope="col">{t("FIELD.생성일")}</th>
                                    <th scope="col" className="txt-center">{t("FIELD.첨부파일")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(reportList == null) &&
                                    <tr key={"report_null"}>
                                        <td className={"d-sm-none w20"}>
                                            <p className="icon-no ml-m10"><span className="hide">파일없음</span></p>
                                        </td>
                                        <td className="d-sm-none">{t("MESSAGE.등록된성적서가없습니다")}</td>
                                        <td className="d-sm-none">-</td>
                                        <td className="d-sm-block">
                                            <span>{t("MESSAGE.등록된성적서가없습니다")}</span>
                                            <span>-</span>
                                        </td>
                                        <td className="btn__tdarea">
                                            <p className="icon-no gray"><span className="hide">파일없음</span></p>
                                        </td>
                                    </tr>
                                }
                                {(reportList) && reportList.map((report, idx) => (
                                    <tr key={"report_" + idx}>
                                        <td className={"d-sm-none w20"} >
                                            <input type="checkbox"
                                                id={`chk_${item.itemId}_${idx.toString()}`}
                                                onChange={(e) => handleSelReports(e, { ...report, "itemReportId": `${item.itemId}_${report.REPORT_NO}` })}
                                                checked={(itemReportList.filter((sel) => sel.itemReportId === `${item.itemId}_${report.REPORT_NO}`).length > 0) ? true : false}
                                            />
                                            <label htmlFor={`chk_${item.itemId}_${idx.toString()}`}>
                                                <span className="hide">선택</span>
                                            </label>
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
    //trans
    const t = useTrans();
    //props
    const filterList = props.filterList;
    const handleSearchFilter = props.handleClickSearchFilter;
    const goSearch = props.goSearch;
    return (
        <>
            {/*<!-- filter 팝업, 220711 내용 수정됨(reports 파일과 내용 다름) -->*/}
            <div id="pop-filter" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1 className="icon-filter">{t("LABEL.필터")}</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body">
                    <div className="filter__select">
                        <div className="filter__type">
                            <p className="tit">{t("LABEL.기기유형")}</p>
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
                    <button type="button" className="bg-gray js-close"><span>{t("LABEL.취소")}</span></button>
                    <button type="button" className="js-close" onClick={(e) => goSearch(e)}><span>{t("LABEL.적용")}</span></button>
                </div>
            </div>
            {/*<!-- //filter 팝업 -->*/}
        </>
    )
}


function SearchTextPopup(props) {
    //trans
    const t = useTrans();
    //props
    const searchFieldList = props.searchFieldList;
    const searchField = props.searchField;
    const setParentSearchField = props.setSearchField;

    const searchText = props.searchText;
    const setParentSearchText = props.setSearchText;
    //const handleSelect = props.handleSelect;
    //const handleOption = props.handleOption;
    const goSearch = props.goSearch;

    // option 선택 시  값 변경 액션
    function selectOptionSearchField(optionElement) {
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        clog("selectOptionSearchField : pop-up" + " : " + optionData);
        //selectedElement.setAttribute("data-value", optionElement.getAttribute("data-value"))
        //selectedElement.setAttribute("data-value", optionData);
        setParentSearchField(JSON.parse(optionData));
    }


    return (
        <>
            {/*<!-- search 팝업, 220628 -->*/}
            <div id="pop-search-small" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1 className="icon-search">{t("LABEL.검색")}</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body">
                    <div className="form__input mb-0">
                        <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionSearchField)}>
                            {/*<div className="select" onClick={(e)=>CUTIL.onClickSelect(e, CUTIL.selectOption)}>*/}
                            <div className="selected">
                                <div id="msearch_selected-value"
                                    className="selected-value"
                                    data-value="itemName"
                                >{searchFieldList[0].dispTxt}</div>
                                <div className="arrow"></div>
                            </div>
                            <ul>
                                {searchFieldList.map((sf, idx) => (
                                    <li key={`sf_${idx.toString()}`}
                                        className="option"
                                        data-value={JSON.stringify(sf)} >{sf.dispTxt}</li>
                                ))}
                            </ul>
                        </div>
                        <input type="text"
                            placeholder={t("MESSAGE.검색어를입력하세요")}
                            value={searchText}
                            onChange={(e) => setParentSearchText(e.target.value)} />
                    </div>
                </div>
                <div className="popup__footer">
                    <button type="button" className="bg-gray js-close"><span>{t("LABEL.취소")}</span></button>
                    <button type="button" className="js-close" onClick={(e) => goSearch(e)}><span>{t("LABEL.적용")}</span></button>
                </div>
            </div>
            {/*<!-- //search 팝업 -->*/}
        </>

    )
}

function QrCodeSearchPop(props) {

    //props
    const serialD = props.serialD;
    const setSerialD = props.setSerialD;
    const video = props.video;
    const setVideo = props.setVideo;
    const setReportList = props.setReportList;
    const setReportLoading = props.setReportLoading;

    const [errorList, setErrorList] = useState([]);

    function qrSanOpen(e) {
        CUTIL.jsopen_Popup(e)
        setVideo(true)

    }

    function handleSerialNo(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "report"))
        )
        setSerialD(e.target.value)
    }

    async function resultOpen(e) {

        if (serialD == "") {
            setErrorList([{ field: "report", msg: "시리얼번호를 입력해주세요." }]);
        } else {

            setReportLoading(true);
            var btnCommentOpen = document.getElementById("pop-qr");
            var body = document.body
            var dimm = body.querySelector(".dimm");

            if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
            if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
            if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
            const reportInfo = await HTTPUTIL.API_reportView(serialD);
            setReportLoading(false);
            setReportList(reportInfo)

            CUTIL.jsopen_Popup(e)
        }

    }

    function closePop(e) {
        var btnCommentOpen = document.getElementById("pop-qr");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        setSerialD("")
    }


    return (
        <>
            {/* <!--221103 시험성적서 조회 팝업--> */}
            <div id="pop-qr" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1>시험성적서 조회!!</h1>
                    <button className="btn btn-close js-close" onClick={(e) => closePop(e)}><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body pb-0">
                    <ul className="form__input mb-0">
                        <li>
                            <p className="tit">QR Code</p>
                            <div className="input__area">
                                <button type="button" className="btn-qrscan js-open" data-pop="pop-qr-open" onClick={(e) => qrSanOpen(e)}><span data-pop="pop-qr-open">QR Code Scan</span></button>
                            </div>
                        </li>
                        <li>
                            <p className="tit">직접 입력</p>
                            <div className="input__area">
                                <input type="text" className={(errorList.filter(err => (err.field === "report")).length > 0) ? "input-error" : ""}
                                    value={serialD} placeholder="기기의 시리얼번호를 직접 입력하세요." onChange={(e) => handleSerialNo(e)} />
                                {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "report")).map((err) => err.msg)}</p> */}
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button" className="js-open " data-pop="pop-qr-result" onClick={(e) => resultOpen(e)}><span data-pop="pop-qr-result" >확인</span></button>
                </div>
            </div>
            {/* <!--//221103 시험성적서 조회 팝업--> */}
        </>
    )
}
function QrCodeWebPop(props) {

    //props
    const serialD = props.serialD;
    const setSerialD = props.setSerialD;
    const video = props.video;
    const setVideo = props.setVideo;
    const setReportList = props.setReportList;
    const setReportLoading = props.setReportLoading;

    const [errorList, setErrorList] = useState([]);



    function handleSerialNo(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "report"))
        )
        setSerialD(e.target.value)
    }

    async function resultOpen(e) {

        if (serialD == "") {
            setErrorList([{ field: "report", msg: "시리얼번호를 입력해주세요." }]);
        } else {

            setReportLoading(true);
            var btnCommentOpen = document.getElementById("pop-qr-web");
            var body = document.body
            var dimm = body.querySelector(".dimm");

            if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
            if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
            if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
            const reportInfo = await HTTPUTIL.API_reportView(serialD);
            setReportLoading(false);
            setReportList(reportInfo)

            CUTIL.jsopen_Popup(e)
        }

    }

    function closePop(e) {
        var btnCommentOpen = document.getElementById("pop-qr-web");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        setSerialD("")
    }


    return (
        <>
            {/* <!--221103 시험성적서 조회 팝업--> */}
            <div id="pop-qr-web" className="popup-layer js-layer layer-out hidden page-detail page-report">
                <div className="popup__head">
                    <h1>시험성적서 조회??</h1>
                    <button className="btn btn-close js-close" onClick={(e) => closePop(e)}><span className="hide">닫기</span></button>
                </div>
                <div className="popup__body pb-0">
                    <ul className="form__input mb-0">
                        {/*      <li>
               <p className="tit">QR Code</p>
               <div className="input__area">
                 <button type="button" className="btn-qrscan js-open" data-pop="pop-qr-open" onClick={(e) => qrSanOpen(e)}><span data-pop="pop-qr-open">QR Code Scan</span></button>
               </div>
             </li> */}
                        <li>
                            <p className="tit">직접 입력</p>
                            <div className="input__area">
                                <input type="text" className={(errorList.filter(err => (err.field === "report")).length > 0) ? "input-error" : ""}
                                    value={serialD} placeholder="기기의 시리얼번호를 직접 입력하세요." onChange={(e) => handleSerialNo(e)} />
                                {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "report")).map((err) => err.msg)}</p> */}
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button" className="js-open " data-pop="pop-qr-result" onClick={(e) => resultOpen(e)}><span data-pop="pop-qr-result" >확인</span></button>
                </div>
            </div>
            {/* <!--//221103 시험성적서 조회 팝업--> */}
        </>
    )
}
function QrReaderPop(props) {
    const video = props.video;
    const setVideo = props.setVideo;
    const qrTimeOut = props.qrTimeOut;
    const setQrTimeOut = props.setQrTimeOut;

    const [errText, setErrText] = useState("")

    function qrReaderColes(e) {

        var btnCommentOpen = document.getElementById("pop-qr-open");

        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");

        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
        setVideo(false)
    }

    function qrReaderRuslt(e) {

        var btnCommentOpen = document.getElementById("pop-qr-open");
        var btnCommentClose = document.getElementById("pop-qr-result");
        var btnCommentQr = document.getElementById("pop-qr");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.add("hidden");
        if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");
        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");

        setVideo(false)
    }

    return (
        <>
            {/* <!-- 221103 qr 팝업 --> */}

            < div id="pop-qr-open" className="popup-layer layer-out js-layer hidden page-qropen">
                <div className="popup__body">
                    {/* <img src={require("/static/img/testqr.jpg")} alt="" /> */}
                    {(video && !errText) &&
                        <Scan
                            qrSerial={props.qrSerial}
                            setQrSerial={props.setQrSerial}
                            qrReaderColes={qrReaderRuslt}
                            CUTIL={CUTIL}
                            setVideo={setVideo}
                            setQrTimeOut={setQrTimeOut}
                            errText={errText}
                            setErrText={setErrText}
                        />
                    }

                </div>
                <div className="popup__footer">
                    {(!errText) ?
                        <div className="qr__bottom">
                            <p>화면에 제품 QR코드를 맞춰주세요.</p>
                            <p className="info">제품 정보를 자동으로 스캔합니다.</p>
                        </div>
                        :
                        <div className="qr__bottom" >
                            <p>해당 기기에서는 스캔이 불가능 합니다. </p>
                            <p className="info">모바일 단말기를 이용해주세요.</p>
                        </div>
                    }
                    <button type="button" className="js-close" onClick={(e) => qrReaderColes(e)}><span>나가기</span></button>
                </div>
            </div>
            {/* <!-- //221103 qr 팝업 --> */}
        </>
    )
}

function QrScanRsultPop(props) {

    //props
    const serialD = props.serialD;
    const setSerialD = props.setSerialD;
    const qrSerial = props.qrSerial;
    const qrTimeOut = props.qrTimeOut;
    const setQrTimeOut = props.setQrTimeOut;
    const video = props.video;
    const setReportList = props.setReportList;
    const setReportLoading = props.setReportLoading;
    const setVideo = props.setVideo;

    const [errorList, setErrorList] = useState([]);
    const [serialB, setSerialB] = useState(false)

    // useEffect(() => {
    //   var btnCommentClose = document.getElementById("pop-qr-scan");
    //   btnCommentClose.setAttribute("style", `position: absolute; top:${(window.innerHeight + btnCommentClose.clientHeight) - window.outerHeight + 50 + "px"}; left:${(window.innerWidth - btnCommentClose.clientWidth) * 0.47 + "px"} `)
    // })

    // 시리얼 토글 액션
    function qrClick(item) {

        if (serialD == "") {

            setSerialD(item);
        } else if (serialD != item) {
            setSerialD(item);
        } else {
            console.log("item", item);
            setSerialD("");
        }

    }
    // 오류 확인
    function handleSerialNo(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "report"))
        )
        setSerialD(e.target.value)
    }
    // 스캔 후 결과 확인
    async function resultOpen(e) {

        if (serialD == "") {
            setErrorList([{ field: "report", msg: "시리얼번호를 입력해주세요." }]);
        } else {

            setReportLoading(true);
            var btnCommentQr = document.getElementById("pop-qr-scan");
            if (!CUTIL.isnull(btnCommentQr)) btnCommentQr.classList.add("hidden");

            const reportInfo = await HTTPUTIL.API_reportView(serialD);
            setReportLoading(false);
            setReportList(reportInfo)
            var btnCommentClose = document.getElementById("pop-qr-result");
            var body = document.body
            var dimm = body.querySelector(".dimm");

            if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
            if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
            if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
            setVideo(false);

        }
    }

    // 스캔 다시하기
    function qrSanOpen(e) {
        CUTIL.jsopen_Popup(e)
        setSerialD("");
        setVideo(true)
    }


    // console.log("qrSerial", qrSerial);

    return (
        <>
            {/* <!--221103 조회 결과 팝업 / style 부분은 화면확인을 위해서 넣어뒀으니 적용하시고 삭제 해 주세요--> */}
            <div id="pop-qr-scan" className="popup-layer js-layer layer-out hidden page-detail page-report" >
                <div className="popup__head">
                    <h1>조회 결과 {sessionStorage.getItem("qrCode")}</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                {(qrSerial) &&
                    <div className="popup__body pb-0">
                        <p className="txt">QR Code Scan 결과에서 기기의 시리얼 번호를 선택하세요.</p>
                        {(!qrTimeOut) &&
                            <ul className="select-qr mt-20">
                                {/* <!--선택되었을때 클래스 on 붙여주세요--> */}
                                {qrSerial.filter((txt, idx) => (idx == 0)).map((qrc, idx) => (
                                    <li key={"qr_" + idx.toString()}>
                                        <a className={(serialD === qrc[0]) ? "on" : ""} onClick={(e) => qrClick(qrc)}>{qrc}</a>
                                    </li>
                                ))}
                                {(qrSerial) && qrSerial.filter((ftxt, idx) => (idx == 1)).map((qrc, idx) => (
                                    <li key={"qr__" + idx.toString()}>
                                        <a className={(serialD === qrc[idx] + qrc[idx + 1]) ? "on" : ""} onClick={(e) => qrClick(qrc[0] + qrc[1])}>
                                            {qrc[idx] + " " + qrc[idx + 1]}</a>
                                    </li>
                                ))}
                                {(qrSerial) && qrSerial.filter((ftxt, idx) => (idx == 2) && (ftxt[0])).map((qrc, idx) => (
                                    <li key={"qr__" + idx.toString()}>
                                        <a className={(serialD === qrc[0]) ? "on" : ""} onClick={(e) => qrClick(qrc[0])}>{
                                            qrc[0]
                                        }</a>
                                    </li>
                                ))}
                                {(qrSerial) && qrSerial.filter((ftxt, idx) => (idx == 2) && (ftxt[1])).map((qrc, idx) => (
                                    <li key={"qr__" + idx.toString()}>
                                        <a className={(serialD === qrc[1]) ? "on" : ""} onClick={(e) => qrClick(qrc[1])}>{
                                            qrc[1]
                                        }</a>
                                    </li>
                                ))}
                            </ul>
                        }
                        {/* <!--QR코드 인식에 실패한 경우 */}
                        {(qrTimeOut) &&
                            <p className="info">
                                QR코드 인식에 실패하였습니다.<br />
                                다시 시도해 주세요.
                            </p>
                        }
                        {/* --> */}
                        <ul className="form__input mt-40 mb-0">
                            <li>
                                <p className="tit">직접 입력</p>
                                <div className="input__area">
                                    <input type="text" className={(errorList.filter(err => (err.field === "report")).length > 0) ? "input-error" : ""}
                                        value={serialD} placeholder="기기의 시리얼번호를 직접 입력하세요." onChange={(e) => handleSerialNo(e)} />
                                    {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "report")).map((err) => err.msg)}</p> */}
                                </div>
                            </li>
                        </ul>
                    </div>

                }

                <div className="popup__footer">

                    < button type="button" className="bg-gray js-open" data-pop="pop-qr-open" onClick={(e) => qrSanOpen(e)}  ><span data-pop="pop-qr-open">다시하기</span></button>

                    <button type="button" onClick={(e) => resultOpen(e)}   ><span>확인</span></button>

                </div>
            </div>
            {/* <!--//221103 조회 결과 팝업--> */}
        </>
    )

}

function QrRsultPop(props) {

    //props
    const serialD = props.serialD;
    const setSerialD = props.setSerialD;
    const qrSerial = props.qrSerial;
    const setQrSerial = props.setQrSerial;
    const reportList = props.reportList.IF_RES_DATA;
    const setReportList = props.setReportList;
    const setReportLoading = props.setReportLoading;
    const setVideo = props.setVideo;

    const [errorList, setErrorList] = useState([]);


    function ReflashQrPop(e) {

        var btnCommentOpen = document.getElementById("pop-qr");
        var btnCommentClose = document.getElementById("pop-qr-result");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentOpen)) btnCommentOpen.classList.remove("hidden");
        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "z-index: 30; display: block;");
        setSerialD("");
        setQrSerial([]);
    }

    // 결과 완료 액션
    function doneQrPop(e) {

        var btnCommentClose = document.getElementById("pop-qr-result");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        setSerialD("");
        setQrSerial([]);
    }
    // const qrCur = (qrSerial.serialTxt == null) ? null : qrSerial;
    return (
        <>
            {/* <!--221103 조회 결과 팝업 / style 부분은 화면확인을 위해서 넣어뒀으니 적용하시고 삭제 해 주세요--> */}
            <div id="pop-qr-result" className="popup-layer js-layer layer-out hidden page-detail page-report" >
                <div className="popup__head">
                    <h1>조회 결과 {sessionStorage.getItem("qrCode")}</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
                <div className={`popup__body pb-0 ${(reportList == null) ? "nodata" : ""}`}>
                    <p className="nodata__txt">데이터를 찾을 수 없습니다.</p> {/* nodata */}
                    <div className="tbl-list type2 qr-result">
                        <table summary="파일 명,생성일,첨부 파일 항목으로 구성된 성적서 파일 상세 리스트 입니다.">
                            <caption>
                                파일 상세 리스트
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col">파일 명</th>
                                    <th scope="col">생성일</th>
                                    <th scope="col" className="txt-center">첨부 파일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(reportList) && reportList.map((report, idx) => (
                                    <tr key={"report_" + idx}>
                                        <td>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="popup__footer">
                    < button type="button" className="bg-gray" onClick={(e) => ReflashQrPop(e)}><span data-pop="pop-qr-open">다시하기</span></button>
                    <button type="button" className="js-close" onClick={(e) => doneQrPop(e)} ><span>확인</span></button>
                </div>
            </div>
            {/* <!--//221103 조회 결과 팝업--> */}
        </>
    )

}




