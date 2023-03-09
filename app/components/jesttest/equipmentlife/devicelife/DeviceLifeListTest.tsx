/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 수명인자 개발
 *
 ********************************************************************/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";


// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"
// component
import EhpPagination from "../../../common/pagination/EhpPagination";

//
import * as XLSX from 'xlsx';
import * as FileSaver from "file-saver";
import { loadingBoxState } from "../../../../recoil/menuState";
import { spawn } from "child_process";
import { useTrans } from "../../../../utils/langs/useTrans";
import { useNavigate } from "react-router-dom";



//component
function DeviceLifeListTest(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //화면 이동
    const navigate = useNavigate();
    //props
    const isMobile = props.isMobile;
    const selTree = props.selTree;
    const workMode = props.workMode;
    const setParentIsMobile = props.setIsMobile;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const reWork = props.reWork;
    const setReWork = props.setReWork;
    // by hjo - 20220920 - 추가 hook
    const setListWork = props.setListWork;
    const setNodata = props.setNodata;
    const setListItem = props.setListItem;
    const restart = props.restart;
    const setRestart = props.setRestart;


    const [list, setList] = useState([]);
    //페이지
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }
    const searchFieldList = [
        //{"id":0, "sfDisp":"전체", "sfVal":""},
        { "id": 1, "sfDisp": t("FIELD.기기명"), "sfVal": "spgName" },
        { "id": 2, "sfDisp": t("FIELD.Panel명"), "sfVal": "panelName" },
        { "id": 3, "sfDisp": t("FIELD.시리얼번호"), "sfVal": "serialNo" },
        { "id": 3, "sfDisp": t("FIELD.모델명"), "sfVal": "modelName" },
    ];
    const [searchField, setSearchField] = useState(searchFieldList[0]);
    const [searchText, setSearchText] = useState("");
    const [searchData, setSearchData] = useState({
        "searchField": null,
        "searchText": null,
    });
    const [fieldList, setFieldList] = useState([
        { "id": 0, "fdDisp": "상태", "fdVal": "deviceLifeSet", "sort": "asc", "click": false },
        { "id": 1, "fdDisp": "등록순", "fdVal": "rowNumber", "sort": "asc", "click": false },
        { "id": 2, "fdDisp": "기기명", "fdVal": "spgName", "sort": "asc", "click": false },
        { "id": 3, "fdDisp": "Panel 명", "fdVal": "panelName", "sort": "asc", "click": false },
        { "id": 4, "fdDisp": "모델 명", "fdVal": "itemName", "sort": "asc", "click": false },
        { "id": 5, "fdDisp": "시리얼 번호", "fdVal": "serialNo", "sort": "asc", "click": false },
        { "id": 6, "fdDisp": "정격전압", "fdVal": "ratingVoltage", "sort": "asc", "click": false },
        { "id": 7, "fdDisp": "Basic", "fdVal": "basicScore", "sort": "asc", "click": false },
        { "id": 8, "fdDisp": "Premium", "fdVal": "premiumScore", "sort": "asc", "click": false },
        { "id": 9, "fdDisp": "Advanced", "fdVal": "advancedScore", "sort": "asc", "click": false },

    ]);


    let appPath = "LS일렉트릭:안양:1공장:전기실1";

    // device List API
    appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    // // sort
    // appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;
    //text검색
    if (searchData.searchField) {
        if (searchData.searchField.sfVal.length > 0) {
            appPath = appPath + `&searchKind=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
        }
    }
    //필드 정렬
    fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
        appPath = appPath + `&sort=${fd.fdVal},${fd.sort}`
    })
    const { data: resInfo, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/devicelifelist?roomId=${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: appPath/*  + selTree.reload */
    });

    useEffect(() => {
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, resInfo);
        //clog("IN TREE : RESLT CHECK : " + ERR_URL + " : " + isLoading + " : " + JSON.stringify(resInfo));

        if (ERR_URL.length > 0) navigate(ERR_URL);

        if (resInfo/* !isLoading */) {
            if (resInfo.codeNum == CONST.API_200) {
                console.log("resInfo", resInfo);

                setList(resInfo.body);
                setPageInfo({ ...resInfo.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT }); //5, 10
                // setUserTree(resInfo.body);

            } else {
                alert(resInfo.errorList.map((err) => (err.msg)))
            }
        }
    }, [resInfo]);

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
    function onClickSearch(e) {
        // mobile 동작 여부 체크 // isMobile 이외의 mobile 여부 체크
        setSearchData({
            "searchField": searchField,
            "searchText": searchText,
        });
        handleCurPage(0);

    }

    function onClickSortField(fieldVal) {
        setFieldList(
            fieldList.map(fd =>
                (fd.fdVal === fieldVal)
                    ? { ...fd, "sort": (fd.sort === "asc") ? "desc" : "asc", "click": true }
                    : { ...fd, "sort": "asc", "click": false }) // 단일 필드 정렬만....
        );

    }
 /*    useEffect(() => {
        // setNodata(pageInfo.totalElements)
        if (reWork.room.roomId != selTree.room.roomId) {
            setSearchText("");
            setSearchData({
                searchField: "",
                searchText: ""
            });
            setFieldList(
                fieldList.map(fd =>
                    (fd.fdVal === fieldList[1].fdVal)
                        ? { ...fd, "sort": (fd.sort === "desc") ? "desc" : "asc", "click": true }
                        : { ...fd, "sort": "asc", "click": false }) // 단일 필드 정렬만....
            );

            handleCurPage(0);
        }
    }, [pageInfo.totalElements]) */

    function updataClick(e, list) {

        setListItem(list);
        setParentWorkMode("UPDATE");
    }

    // 
    return (
        <>
            <div className="area__right">
                <ul className="page-loca">
                    <li>LS일렉트릭 </li>
                    <li>안양</li>
                    <li>1공장</li>
                    <li>전기실1</li>
                </ul>
                <h2>전기실1</h2>
                <div className="inline mb-18">
                    {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
                    <a href="#" className="move-list active">Device List</a>
                    <a href="#" className="move-list" >수명인자 설정</a>
                </div>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
                <div className="area__right_content">
                    {/*<!--검색영역-->*/}
                    <div className="inline right search-small mb-16 p-0">
                        <p className="title">
                            <span className="txt-black">{t("LABEL.검색")}</span>
                        </p>
                        <div className="searcharea">
                            <div className="searchinput">
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
                                        value={searchText} className="w274"
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    {(searchText.length > 0) && <button type="button" className="btn btn-delete" onClick={(e) => setSearchText("")} >
                                        <span className="hide">입력 창 닫기</span>
                                    </button>}
                                </div>
                                <button type="button" className="btn-search" onClick={(e) => onClickSearch(e)}>
                                    <span>{t("LABEL.조회")}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="nodata__txt h345">
                        {t("MESSAGE.데이터를찾을수없습니다")}
                    </p>
                    <div className="tbl-list td-h26 h650">
                        <table summary="상태,등록 순,설비 명,Panel 명,모델 명,시리얼 번호,정격전압,Basic,Premium,Advanced 항목으로 구성된 설비수명 인자목록 입니다.">
                            <caption>
                                설비수명 인자목록
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "deviceLifeSet").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("deviceLifeSet")}
                                    >
                                        <span>{t("FIELD.상태")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "rowNumber").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("rowNumber")}
                                    >
                                        <span>{t("등록순")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "spgName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("spgName")}
                                    >
                                        <span>{t("FIELD.기기명")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "panelName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("panelName")}
                                    >
                                        <span>{t("FIELD.Panel명")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "itemName").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("itemName")}
                                    >
                                        <span>{t("FIELD.모델명")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "serialNo").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("serialNo")}
                                    >
                                        <span>{t("FIELD.시리얼번호")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "ratingVoltage").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("ratingVoltage")}
                                    >
                                        <span>{t("정격전압")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "basicScore").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("basicScore")}
                                    >
                                        <span>{t("Basic")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "premiumScore").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("premiumScore")}
                                    >
                                        <span>{t("Premium")}</span>
                                    </th>
                                    <th scope="col"
                                        className={`${fieldList.filter(fd => fd.fdVal === "advancedScore").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left d-sm-none`}
                                        onClick={(e) => onClickSortField("advancedScore")}
                                    >
                                        <span>{t("Advanced")}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(list) && list.map((list, idx) => (
                                    <tr key={"life_" + idx.toString()} onClick={(e) => updataClick(e, list)}>
                                        <td className="txt-left"><p className={`font-12 fontMedium ${(list.deviceLifeSet) ? "txt-blue" : "txt-gray"}`}>{(list.deviceLifeSet) ? "설정완료" : "미설정"}</p></td>
                                        <td className="txt-left">{(list.rowNumber ? list.rowNumber : "-")}</td>
                                        <td className="txt-left">{(list.spg.spgName) ? list.spg.spgName : "-"}</td>
                                        <td className="txt-left"><p className="ellipsis w100p">{(list.panel.panelName) ? list.panel.panelName : ""}</p></td>
                                        <td className="txt-left"><p className="ellipsis w100p">{(list.modelName) ? list.modelName : ""}</p></td>
                                        <td className="txt-left"><p className="ellipsis w100p">{(list.serialNo) ? list.serialNo : "-"}</p></td>
                                        <td className="txt-left">{(list.ratingVoltage) ? list.ratingVoltage : "-"}</td>
                                        <td className="txt-left">{(list.basicAssess.totalScore) ? list.basicAssess.totalScore : "-"}</td>
                                        <td className="txt-left">{(list.premiumAssess.totalScore) ? list.basicAssess.totalScore : "-"}</td>
                                        <td className="txt-left">{(list.advancedAssess.totalScore) ? list.basicAssess.totalScore : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {(pageInfo) && <EhpPagination
                        componentName={"WorkOrderInspection"}
                        pageInfo={pageInfo}
                        handleFunc={handleCurPage}
                    />
                    }
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
            </div>
        </>
    )

}
export default DeviceLifeListTest;









