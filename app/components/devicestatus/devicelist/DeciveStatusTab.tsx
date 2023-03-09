/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP 기기등록 현황 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useCallback, useRef } from "react";
//
import axios from 'axios';
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
//
import { useTrans } from "../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as FILEUTILS from "../../../utils/file/fileUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";

import clog from "../../../utils/logUtils"
//
//components
import Pagination from "../../common/pagination/Pagination"

//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
//datepicker 디자인 - 없으면 깨짐
import "react-datepicker/dist/react-datepicker.css";
//datepocker 언어
import { ko } from "date-fns/esm/locale";
import { itemState } from "../../../recoil/assessmentState";
//압축 다운로드
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { useNavigate } from "react-router-dom";
import DeciveStatusView from "./DeciveStatusView";

 /**
 * @brief EHP 기기등록현황 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function DeciveStatusTab(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //화면 이동
    const navigate = useNavigate();
    // props
    const setPopWin = props.setPopWin;
    //
    const [errorList, setErrorList] = useState([]);
    const [tabItem, setTabItem] = useState([]);
    const [curTab, setCurTab] = useState(null);// tag 설정 값
    const [subZoneId, setSubZoneId] = useState("");
    const [roomId, setRoomId] = useState("");
    const [spgList, setSpgList] = useState("");

    const [searchText, setSearchText] = useState("");
    const [searchData, setSearchData] = useState({
        "searchField": null,
        "searchText": null,
    });

    //다음 이전 버튼
    const [curPos, setCurPos] = useState(0);
    const tabRef = useRef(null);
    const [tabMove, setTabMove] = useState(null);
    //페이지
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    const [nodata, setNodata] = useState<number>();

    //mobile
    const [isMobile, setIsMobile] = useState(false);

    // Tab API
    const { data: tab, isLoading } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: "/api/v2/product/zone/company",
        appQuery: {},
        userToken: userInfo.loginInfo.token,
    });
    // appPath = appPath + "?zoneId=" + zoneId;
    useEffect(() => {
        // tab API
        if (tab) {
            // error page 이동
            const ERR_URL = HttpUtil.resultCheck(isLoading, tab);

            if (ERR_URL.length > 0) navigate(ERR_URL);
            if (tab.codeNum == CONST.API_200) {


                setTabItem(tab.body);
                setCurTab(tab.body[0])
            } else {
                alert(tab.errorList);

            }
        }

    }, [tab]);

    useEffect(() => {
        setTabMove(tabRef.current);
    });
    // 이전&다음 버튼 이벤트
    function next(idx) {
        setCurPos(idx + 1);
    }
    function prev(idx) {
        setCurPos(idx - 1);
    }
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }

    // 탭 또는 상단 콤보 박스 선택
    function clickTab(tab) {
        var zonesel = document.getElementById("zone");
        var zoneReset = document.getElementById("zone_all");
        var roomsel = document.getElementById("room");
        var roomReset = document.getElementById("room_all");
        var spgsel = document.getElementById("spg");
        var spgReset = document.getElementById("spg_all");
        var zoneselM = document.getElementById("mzone");
        var zoneResetM = document.getElementById("mzone_all");
        var roomselM = document.getElementById("mroom");
        var roomResetM = document.getElementById("mroom_all");
        var spgselM = document.getElementById("mspg");
        var spgResetM = document.getElementById("mspg_all");
        zonesel.click();
        zoneReset.click();
        roomsel.click();
        roomReset.click();
        spgsel.click();
        spgReset.click();
        zoneselM.click();
        zoneResetM.click();
        roomselM.click();
        roomResetM.click();
        spgselM.click();
        spgResetM.click();
        setSubZoneId("");
        setRoomId("");
        setSpgList("");
        setCurTab(tab);
        handleCurPage(0)
        setSearchText("");
        setSearchData({
            "searchField": "",
            "searchText": "",
        });
        setPopWin("pop-list-ehcdetailview", null);
    }

    return (
        <>
            <div className={`box__body ${(nodata <= 0) ? "nodata" : ""} `}>{/* nodata */}
                {/*<!--슬라이드 탭 영역-->*/}
                <section className="swiper-section" style={{ "cursor": "pointer" }}>
                    <div className="swiper-container mySwiper">
                        <div className="swiper-wrapper">
                            {(tabItem) && tabItem.filter((tab, idx) => (idx >= curPos) && ((idx < tabItem.length))).map((tab, idx) => (
                                <div ref={tabRef} key={"tab_" + idx.toString()} className={`swiper-slide tab ${(curTab.zoneId === tab.zoneId) ? "on" : ""}`} data-tab="tab-1" onClick={(e) => clickTab(tab)}><p>{tab.company.companyName + " " + tab.zoneName}</p></div>
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
                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                        <div className="selected">
                            <div className="selected-value">{(curTab) && curTab.company.companyName + " " + curTab.zoneName}</div>
                            <div className="arrow"></div>
                        </div>
                        <ul>
                            {(tabItem) && tabItem.map((tab, idx) => (
                                <li key={"tab_" + idx.toString()} className={`option tab tab ${(curTab.zoneId === tab.zoneId) ? "on" : ""} `} data-tab="tab-1" onClick={(e) => clickTab(tab)}>{tab.company.companyName + " " + tab.zoneName}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/*<!-- Tab1 -->*/}
                {(curTab) &&
                    <DeciveStatusView
                        setPopWin={setPopWin}
                        curTab={curTab}
                        setCurTab={setCurTab}
                        pageInfo={pageInfo}
                        setPageInfo={setPageInfo}
                        isMobile={isMobile}
                        setIsMobile={setIsMobile}
                        nodata={nodata}
                        setNodata={setNodata}
                        handleCurPage={handleCurPage}
                        subZoneId={subZoneId}
                        setSubZoneId={setSubZoneId}
                        roomId={roomId}
                        setRoomId={setRoomId}
                        spgList={spgList}
                        setSpgList={setSpgList}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        searchData={searchData}
                        setSearchData={setSearchData}
                    />
                }
                {/*<!-- Tab2 -->*/}
                {/* <div id="tab-2" className="tabcontent">tab 2:기기 등록 관리</div> */}

                {/*<!-- Tab3 -->*/}
                {/* <div id="tab-3" className="tabcontent">tab 3:사용자 관리</div> */}
                {/*<!--//탭별  내용 영역-->*/}
            </div>
        </>
    );
}

export default DeciveStatusTab;