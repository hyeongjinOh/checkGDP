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
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState } from "../../../../recoil/menuState";
import { langState } from '../../../../recoil/langState';
// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as CUTIL from "../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../../common/pagination/EhpPagination";

function SpgCheckList(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    //
    //const pageInfo = props.pageInfo;
    //const setParentPageInfo = props.setPageInfo;
    const versionList = props.versionList;
    const spgVersion = props.spgVersion;
    const setParentSpgVersion = props.setSpgVersion;

    //화면 이동
    const navigate = useNavigate();
    //
    const stepList = [
        { "stepName": "전체", "stepVal": "" },
        { "stepName": "Basic", "stepVal": "BASIC" },
        { "stepName": "Advanced", "stepVal": "ADVANCED" },
        { "stepName": "Premium", "stepVal": "PREMIUM" },
    ];
    const [selStep, setSelStep] = useState(stepList[0]);
    useEffect(() => {
        setSelStep(stepList[0]);
        setPageInfo(defaultPageInfo);
    }, [selTree])

    //clog("IN CHECK LIST : INIT : " + JSON.stringify(versionList) + " : version : " + spgVersion);

    //const [versionList, setVersionList] = useState(null);
    const [versionReload, setVersionReload] = useState(false);
    //const [spgVersion, setSpgVersion] = useState(null);

    const [checkList, setCheckList] = useState([]);
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    // option 선택 시  값 변경 액션
    function selectOptionVersion(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        //
        setParentSpgVersion(JSON.parse(optionData))
        // params init
        if (spgVersion.versionNo !== JSON.parse(optionData).versionNo) setPageInfo(defaultPageInfo);
    }

    function selectOptionStep(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        //
        setSelStep(JSON.parse(optionData))
        // params init
        if (selStep.stepVal !== JSON.parse(optionData).stepVal) setPageInfo(defaultPageInfo);
    }

    function onClickSpgVersionChange(e, sver) {
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-version-ok");

        // setParentPopWin("pop-version-ok",
        //     <PopupChangeSpgVersion
        //         htmlHeader={<h1>버전 적용</h1>}
        //         versionList={versionList}
        //         versionInfo={sver}
        //         setSpgVersion={props.setSpgVersion}
        //         setVersionReload={setVersionReload}

        //     //listReload={listReload}
        //     //setListReload={handleListReload} // list reload
        //     //setPopWin={props.setPopWin}
        //     />
        // );
        // CUTIL.jsopen_Popup(e);

    }

    // function onClickSpgVersionAdd(e) {
    //     var isOk = confirm(`Check Sheet 버전을 수정하거나 신규 버전을 추가하시겠습니까?`);
    //     if (!isOk) return;

    //     setParentWorkMode("NLIST");
    // }

    return (
        <>
            {/*<!--오른쪽 영역-->*/}
            <div className="area__right_content workplace__info workplace__main info__input newtype">
                <div className="page-top">
                    <h2>배전반</h2>
                </div>
                <div className="tbl__top mb-16">
                    <div className="left">
                        <div className="searcharea">
                            <div className="searchinput">
                                <span className="mr-16"><strong>점검단계</strong></span>
                                <div className="select w186" onClick={(e) => CUTIL.onClickSelect(e, selectOptionStep)}>
                                    <div className="selected">
                                        <div className="selected-value">{selStep.stepName}</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        {stepList.map((step, idx) => (
                                            <li key={`st_${idx.toString()}`}
                                                className="option"
                                                data-value={JSON.stringify(step)}
                                            >{step.stepName}</li>
                                        ))}
                                    </ul>
                                </div>
                                <span className="mr-16 ml-24"><strong>버전</strong></span>
                                {(!spgVersion) && <div className="select w80" onClick={(e) => CUTIL.onClickSelect(e, selectOptionVersion)}>
                                    <div className="selected">
                                        <div className="selected-value">1.0</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        <li key={`ver_x`}
                                            className="option"
                                            data-value={"1.0"}
                                        >1.0</li>
                                    </ul>
                                </div>}

                                {(spgVersion) && (versionList) && <div className="select w80" onClick={(e) => CUTIL.onClickSelect(e, selectOptionVersion)}>
                                    <div className="selected">
                                        <div className="selected-value">{spgVersion.versionNo}</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        {versionList.filter((sver) => sver.completed).map((sver, idx) => (
                                            <li key={`ver_${idx.toString()}`}
                                                className="option"
                                                data-value={JSON.stringify(sver)}
                                            >{sver.versionNo}</li>
                                        ))}
                                    </ul>
                                </div>}

                            </div>
                        </div>
                        <button type="button"
                            className="bg-gray btn-basic w96 ml-16 js-open"
                            data-pop="pop-version-ok"
                            onClick={(e) => onClickSpgVersionChange(e, spgVersion)}
                        >
                            <span>버전 변경</span>
                        </button>
                    </div>
                    <div className="right">
                        <button type="button" className="bg-gray js-open" data-pop="pop-version">
                            <span>버전 수정/추가</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="tbl-list checksheet-list">
                <table summary="점검단계,코드,그룹,이름,설명,가중치 항목으로 구성된 ACB 리스트 입니다.">
                    <caption>
                        ACB 리스트
                    </caption>
                    <colgroup>
                        <col style={{ "width": "9%" }} />
                        <col style={{ "width": "15%" }} />
                        <col style={{ "width": "13%" }} />
                        <col style={{ "width": "24%" }} />
                        <col style={{ "width": "26%" }} />
                        <col style={{ "width": "10%" }} />
                        <col style={{ "width": "3%" }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th scope="col" className="txt-left">점검단계</th>
                            <th scope="col" className="txt-left">코드</th>
                            <th scope="col" className="txt-left">그룹</th>
                            <th scope="col" className="txt-left">이름</th>
                            <th scope="col" className="txt-left">설명</th>
                            <th scope="col" className="txt-left">가중치</th>
                            <th scope="col"><span className="hide">상세보기</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                                <td colSpan={7} className=""><strong className="txt-purple">Version을 선택하세요.</strong></td>
                            </tr> */}
                        <tr>
                            <td className="txt-left js-open" data-pop="pop-spgcheck-detail">
                                <strong className="txt-purple">BASIC</strong>
                            </td>
                            <td className="txt-left js-open" data-pop="pop-spgcheck-detail">
                                V1SP1CS1CG1I1
                            </td>
                            <td className="txt-left js-open" data-pop="pop-spgcheck-detail">
                                사용연수
                            </td>
                            <td className="txt-left js-open" data-pop="pop-spgcheck-detail">
                                운용년수
                            </td>
                            <td className="txt-left js-open" data-pop="pop-spgcheck-detail">
                                별도의 측정장비는 필요없음
                            </td>
                            <td className="txt-left js-open" data-pop="pop-spgcheck-detail">
                                <strong>3</strong>
                            </td>
                            <td className="js-open" data-pop="pop-spgcheck-detail">
                                <button type="button" className="btn-more">
                                    <span className="hide">상세보기</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/*<!-- 다국어 관리 팝업 -->*/}
            <div className="popup__body">
                <React.Fragment>
                    <ul className="form__input">
                        <li>
                            <p className="tit">점검단계</p>
                            <div className="input__area">
                                <input type="text" defaultValue={"BASIC"} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">기기 명</p>
                            <div className="input__area"><input type="text" defaultValue={"배전반"} disabled /></div>
                        </li>
                        <li>
                            <p className="tit">그룹 명</p>
                            <div className="input__area"><input type="text" defaultValue={"사용연수"} disabled /></div>
                        </li>
                    </ul>
                    <ul className="tab__small">
                        <li>
                            <a>한국어</a>
                        </li>
                    </ul>
                    <ul className="form__input">
                        <li>
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text"
                                    defaultValue={"운용년수"} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">설명</p>
                            <div className="input__area">
                                <input type="text" defaultValue={"별도의 측정장비는 필요없음"} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">가중치</p>
                            <div className="input__area">
                                <input type="text" value={"3"} disabled />
                            </div>
                        </li>
                    </ul>
                </React.Fragment>
                <div className="tbl-list">
                    <table summary="점수, 평가기준 항목으로 구성된 판정 List 입니다.">
                        <caption>
                            판정 List
                        </caption>
                        <colgroup>
                            <col style={{ "width": "16%" }} />
                            <col style={{ "width": "84%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">점수</th>
                                <th scope="col">평가기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><p>1</p></td>
                                <td><p className="txt-left">20년 초과</p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="popup__footer">
                {/*<button type="button" className="bg-gray js-close"><span>취소</span></button>
     <button type="button" className="js-open" data-pop="pop-save"><span>저장</span></button>*/}
                <button type="button"
                    className="bg-gray js-open btn-close"
                    data-pop="pop-spgcheck-edit">
                    <span>수정</span>
                </button>
                <button type="button" className="">
                    <span>확인</span>
                </button>
            </div>
            {/*<!-- //다국어 관리 팝업 조회 -->*/}
        </>
    )
};
export default SpgCheckList;


function CheckList(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const selStep = props.selStep;
    const spgVersion = props.spgVersion;
    const checkList = props.checkList;
    const setParentCheckList = props.setCheckList;
    const pageInfo = props.pageInfo;
    const setParentPageInfo = props.setPageInfo;
    //
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const setParentPopWin = props.setPopWin;

    //화면 이동
    const navigate = useNavigate();
    //
    const [clistMode, setClistMode] = useState("LIST");
    function handleCurPage(page) {
        setParentPageInfo({ ...pageInfo, number: page });
    }
    function handleListReload(val, page) {
        if (page > -1) {
            setParentPageInfo({ ...pageInfo, number: page, listReload: true });
        } else {
            setParentPageInfo({ ...pageInfo, listReload: true });
        }
    }
    //////////////////

    let appPath = "";
    appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;

    appPath = appPath + `&spgName=${selTree.spg.spgName}`;
    if (spgVersion) {
        appPath = appPath + "&versionNo=" + spgVersion.versionNo
    }
    if (selStep.stepVal.length > 0) {
        appPath = appPath + "&stepName=" + selStep.stepVal;
    }
    appPath = appPath + `&language=${CUTIL.apiLangSet(langs)}`

    const [errorList, setErrorList] = useState([]);
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/checksheet/step/spg/items/admin?${appPath}`,
        appQuery: {
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        //watch: selTree + appPath + listReload + spgVersion
        watch: selTree + appPath + spgVersion + pageInfo.listReload
    });
    useEffect(() => {
        setRecoilIsLoadingBox(true);
        /*const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
        if (ERR_URL.length > 0) {
          setRecoilIsLoadingBox(false);
          navigate(ERR_URL);
        }*/
        if (retData) {
            setRecoilIsLoadingBox(false);
            //clog("IN CHECKLIST : RES : " + JSON.stringify(retData.body));
            if (retData.codeNum == CONST.API_200) {
                setParentCheckList(retData.body);
                setParentPageInfo({
                    ...retData.data.page,
                    psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT,
                    listReload: false
                }); //5, 10
                setClistMode("LIST");
            }
        }
    }, [selTree, retData])


    function onClickViewSpgCheck(e, checkInfo) {
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");

        setClistMode("READ");
        setParentPopWin("pop-spgcheck-detail", //pop-spgcheck-detail
            <PopupSpgCheckView
                htmlHeader={<h1>다국어 관리</h1>}
                checkInfo={checkInfo}
                setListReload={handleListReload} // list reload
                clistMode={"READ"}
                setClistMode={setClistMode}
                setPopWin={props.setPopWin}
            />
        );
        CUTIL.jsopen_Popup(e);

    }


    //clog("IN CHECK LIST COMP : INIT : " + workMode);
    clog("SPG CHECK LIST : INIT : " + clistMode);
    return (
        <>
            {/*<!--테이블-->*/}
            <div className="tbl-list checksheet-list">
                <table summary="점검단계,코드,그룹,이름,설명,가중치 항목으로 구성된 ACB 리스트 입니다.">
                    <caption>
                        ACB 리스트
                    </caption>
                    <colgroup>
                        <col style={{ "width": "9%" }} />
                        <col style={{ "width": "15%" }} />
                        <col style={{ "width": "13%" }} />
                        <col style={{ "width": "24%" }} />
                        <col style={{ "width": "26%" }} />
                        <col style={{ "width": "10%" }} />
                        <col style={{ "width": "3%" }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th scope="col" className="txt-left">점검단계</th>
                            <th scope="col" className="txt-left">코드</th>
                            <th scope="col" className="txt-left">그룹</th>
                            <th scope="col" className="txt-left">이름</th>
                            <th scope="col" className="txt-left">설명</th>
                            <th scope="col" className="txt-left">가중치</th>
                            <th scope="col"><span className="hide">상세보기</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!spgVersion) &&
                            <tr>
                                <td colSpan={7} className=""><strong className="txt-purple">Version을 선택하세요.</strong></td>
                            </tr>
                        }
                        {checkList.map((check, idx) => (
                            <tr key={`sh_${idx.toString()}`}>
                                <td className="txt-left js-open" data-pop="pop-spgcheck-detail"
                                    onClick={(e) => onClickViewSpgCheck(e, check)}
                                >
                                    <strong className="txt-purple">{check.checkStepDto.name}</strong>
                                </td>
                                <td className="txt-left js-open" data-pop="pop-spgcheck-detail"
                                    onClick={(e) => onClickViewSpgCheck(e, check)}
                                >
                                    {check.code}
                                </td>
                                <td className="txt-left js-open" data-pop="pop-spgcheck-detail"
                                    onClick={(e) => onClickViewSpgCheck(e, check)}
                                >
                                    {check.checkGroupDto.groupName}
                                </td>
                                <td className="txt-left js-open" data-pop="pop-spgcheck-detail"
                                    onClick={(e) => onClickViewSpgCheck(e, check)}
                                >
                                    {check.name}
                                </td>
                                <td className="txt-left js-open" data-pop="pop-spgcheck-detail"
                                    onClick={(e) => onClickViewSpgCheck(e, check)}
                                >
                                    {check.description}
                                </td>
                                <td className="txt-left js-open" data-pop="pop-spgcheck-detail"
                                    onClick={(e) => onClickViewSpgCheck(e, check)}
                                >
                                    <strong>{check.weight}</strong>
                                </td>
                                <td className="js-open" data-pop="pop-spgcheck-detail">
                                    <button type="button" className="btn-more"
                                        onClick={(e) => onClickViewSpgCheck(e, check)}
                                    >
                                        <span className="hide">상세보기</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <EhpPagination
                componentName={"HTTPMESSAGELIST"}
                pageInfo={pageInfo}
                handleFunc={handleCurPage}
            />
        </>
    )
};


// SPG 체크 항목 조회 
function PopupSpgCheckView(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const checkInfo = props.checkInfo;
    const clistMode = props.clistMode;
    const setParentClistMode = props.setClistMode;
    const setParentPopWin = props.setPopWin;
    const setParentListReload = props.setListReload;
    //
    const [spgCheckItem, setSpgCheckItem] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const defaultRefDtoList = [
        { "score": 0, "reference": "" },
        { "score": 1, "reference": "" },
        { "score": 2, "reference": "" },
        { "score": 3, "reference": "" },
        { "score": 4, "reference": "" },
    ];
    clog("SPG CHECK VIEW : INIT : " + clistMode + " : " + JSON.stringify(checkInfo));
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/checksheet/step/spg/item?code=${checkInfo.code}`,
        appQuery: {
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: checkInfo.code + clistMode
    });
    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            setRecoilIsLoadingBox(false);
            //clog("IN SPGCHECK VIEW : RES : " + JSON.stringify(retData.body));
            if (retData.codeNum == CONST.API_200) {
                retData.body.map((fcheck) => {
                    if (CUTIL.isnull(fcheck.checkItemRefDtoList)) fcheck.checkItemRefDtoList = defaultRefDtoList;
                })
                setSelLang(CONST.STR_APILANG_KOR);
                setSpgCheckItem(retData.body);
                setUpdateCount(0);
            }
        }
    }, [retData])

    function onClickUpdateSpgCheck(e, check) {
        clog("UPDE : CHEKC : " + JSON.stringify(spgCheckItem));
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-edit");
        CUTIL.jsclose_Popup("pop-spgcheck-detail");

        setParentPopWin("pop-spgcheck-edit",
            <PopupSpgCheckUpdate
                htmlHeader={<h1>다국어 관리</h1>}
                checkInfo={check}
                spgCheckItem={spgCheckItem}
                setListReload={props.setListReload} // list reload
                clistMode={props.clistMode}
                setClistMode={props.setClistMode}
                setPopWin={props.setPopWin}
                updateCount={updateCount + 1}
                setUpdateCount={setUpdateCount}
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    function onClickCancel(e) {
        //setParentListReload(true);
        setParentClistMode("LIST");
        CUTIL.jsclose_Popup("pop-spgcheck-detail");
    }

    const [selLang, setSelLang] = useState(CONST.STR_APILANG_KOR);
    const langSet = [
        { "tabId": 0, "tabTxt": "한국어", "tabVal": CONST.STR_APILANG_KOR },
        { "tabId": 1, "tabTxt": "English", "tabVal": CONST.STR_APILANG_ENG },
        { "tabId": 2, "tabTxt": "中文", "tabVal": CONST.STR_APILANG_CHA },
    ];
    useEffect(() => {
        setSelLang(CONST.STR_APILANG_KOR);
    }, [])

    function onClickLangTab(e) {
        var actTag = (e.target.tagName === "LI") ? e.target : e.currentTarget;
        var tabStrInfo = actTag.getAttribute("data-value");
        var tabInfo = JSON.parse(tabStrInfo)
        setSelLang(tabInfo.tabVal);
    }

    return (
        <>
            {/*<!-- 다국어 관리 팝업 -->*/}
            <div className="popup__body">
                {(spgCheckItem) && spgCheckItem.filter(citem => citem.language === selLang).map((checkItem, idx) => (
                    <React.Fragment key={`rfr_${idx.toString()}`}>
                        <ul className="form__input">
                            <li>
                                <p className="tit">점검단계</p>
                                <div className="input__area">
                                    <input type="text" value={(checkItem.language === selLang) ? checkItem.checkStepDto.name : ""} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">기기 명</p>
                                <div className="input__area"><input type="text" value={(checkItem.language === selLang) ? checkItem.spgDto.name : ""} disabled /></div>
                            </li>
                            <li>
                                <p className="tit">그룹 명</p>
                                <div className="input__area"><input type="text" value={(checkItem.language === selLang) ? checkItem.checkGroupDto.groupName : ""} disabled /></div>
                            </li>
                        </ul>
                        <ul className="tab__small">
                            {langSet.map((tlang, idx) => (
                                <li key={`tli_${idx.toString()}`} className={(tlang.tabVal === selLang) ? "on" : ""}
                                    onClick={(e) => onClickLangTab(e)}
                                    data-value={JSON.stringify(tlang)}
                                >
                                    <a>{tlang.tabTxt}</a>
                                </li>
                            ))}
                        </ul>
                        <ul className="form__input">
                            <li>
                                <p className="tit">이름</p>
                                <div className="input__area">
                                    <input type="text"
                                        value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.checkItemName)) ? checkItem.checkItemName : "" : ""} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">설명</p>
                                <div className="input__area">
                                    <input type="text" value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.description)) ? checkItem.description : "" : ""} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">가중치</p>
                                <div className="input__area">
                                    <input type="text" value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.weight)) ? checkItem.weight : "" : ""} disabled />
                                </div>
                            </li>
                        </ul>
                    </React.Fragment>))}
                <div className="tbl-list">
                    <table summary="점수, 평가기준 항목으로 구성된 판정 List 입니다.">
                        <caption>
                            판정 List
                        </caption>
                        <colgroup>
                            <col style={{ "width": "16%" }} />
                            <col style={{ "width": "84%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">점수</th>
                                <th scope="col">평가기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(spgCheckItem) && spgCheckItem.filter(citem => citem.language === selLang).map((checkItem, idx) => (
                                checkItem.checkItemRefDtoList.map((citem, idx) => (
                                    <tr key={`tr_${idx.toString()}`}>
                                        <td><p>{citem.score}</p></td>
                                        <td><p className="txt-left">{citem.reference}</p></td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="popup__footer">
                {/*<button type="button" className="bg-gray js-close"><span>취소</span></button>
     <button type="button" className="js-open" data-pop="pop-save"><span>저장</span></button>*/}
                <button type="button"
                    className="bg-gray js-open btn-close"
                    data-pop="pop-spgcheck-edit"
                    onClick={(e) => onClickUpdateSpgCheck(e, checkInfo)}
                >
                    <span>수정</span>
                </button>
                <button type="button" className="" onClick={(e) => onClickCancel(e)}>
                    <span>확인</span>
                </button>
            </div>
            {/*<!-- //다국어 관리 팝업 조회 -->*/}
        </>
    )
}


// SPG 체크 항목 조회 
function PopupSpgCheckUpdate(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const checkInfo = props.checkInfo;
    const clistMode = props.clistMode;
    const setParentClistMode = props.setClistMode;
    const setParentPopWin = props.setPopWin;
    const setParentListReload = props.setListReload;
    const updateCount = props.updateCount;
    const setParentUpdateCount = props.setUpdateCount;
    //
    const [spgCheckItem, setSpgCheckItem] = useState(null);
    const [errorList, setErrorList] = useState([]);
    //const onClickUpdateCheckMessage = props.onClickUpdateCheckMessage;
    const defaultRefDtoList = [
        { "score": 0, "reference": "" },
        { "score": 1, "reference": "" },
        { "score": 2, "reference": "" },
        { "score": 3, "reference": "" },
        { "score": 4, "reference": "" },
    ];
    clog("SPG CHECK UPDATE : INIT : " + clistMode + " : " + updateCount);
    useEffect(() => {
        setSpgCheckItem(props.spgCheckItem);
    }, [updateCount, props.spgCheckItem])

    function onClickCancel(e) {
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");
        CUTIL.jsclose_Popup("pop-spgcheck-edit");
        setParentUpdateCount(updateCount + 1);
        CUTIL.jsopen_Popup(e);
        setErrorList([]);
    }

    const [selLang, setSelLang] = useState(CONST.STR_APILANG_KOR);
    const langSet = [
        { "tabId": 0, "tabTxt": "한국어", "tabVal": CONST.STR_APILANG_KOR },
        { "tabId": 1, "tabTxt": "English", "tabVal": CONST.STR_APILANG_ENG },
        { "tabId": 2, "tabTxt": "中文", "tabVal": CONST.STR_APILANG_CHA },
    ];
    useEffect(() => {//초기화
        //setSpgCheckItem(null);//null
        setSelLang(CONST.STR_APILANG_KOR);
    }, [])

    function onClickLangTab(e) {
        var actTag = (e.target.tagName === "LI") ? e.target : e.currentTarget;
        var tabStrInfo = actTag.getAttribute("data-value");
        var tabInfo = JSON.parse(tabStrInfo)
        setSelLang(tabInfo.tabVal);
    }


    function setSpgCheckItemItemName(e) {
        setSpgCheckItem(spgCheckItem.map((fcheck) => (
            (fcheck.language === selLang) ? { ...fcheck, "checkItemName": e.target.value } : fcheck)
        ))
    }
    function setSpgCheckItemDescription(e) {
        setSpgCheckItem(spgCheckItem.map((fcheck) => (
            (fcheck.language === selLang) ? { ...fcheck, "description": e.target.value } : fcheck)
        ))
    }
    function setSpgCheckItemWeight(e) {
        setSpgCheckItem(spgCheckItem.map((fcheck) => (
            (fcheck.language === selLang) ? { ...fcheck, "weight": e.target.value } : fcheck)
        ))
    }

    function setSpgcheckItemRefDtoList(e, ridx) {
        setSpgCheckItem(spgCheckItem.map((fcheck) => (
            (fcheck.language === selLang)
                ? { ...fcheck, "checkItemRefDtoList": fcheck.checkItemRefDtoList.map((ref, idx) => ((ridx === idx) ? { ...ref, "reference": e.target.value } : ref)) }
                : fcheck)
        ))
    }


    async function onClickDoUpdateSpgCheck(e) {
        const errList = [];
        var doCnt = 0;
        var doneCnt = 0;
        var succCnt = 0;

        var isOk = confirm(`수정 내용을 저장하시겠습니까?`);
        if (!isOk) return;

        let data: any = null;
        setRecoilIsLoadingBox(true);
        spgCheckItem.map(async (fcheck, idx) => {
            CUTIL.sleep(500);
            //clog("UPDATE SPG CHECK : " + idx + " : " + JSON.stringify(fcheck));
            doCnt++;
            data = await HTTPUTIL.PromiseHttp({
                "httpMethod": "PUT",
                "appPath": `/api/v2/checksheet/step/spg/item`,
                appQuery:
                {
                    "code": fcheck.code,
                    "language": fcheck.language,
                    "name": fcheck.checkItemName,
                    "description": fcheck.description,
                    "weight": fcheck.weight,
                    "checkItemRefDtoList": fcheck.checkItemRefDtoList,
                },
                userToken: userInfo.loginInfo.token,
            });
            if (data) {
                doneCnt++;
                if (data.codeNum == CONST.API_200) {
                    succCnt++;
                } else {
                    data.body.errorList.map((elist) => (
                        errList.push({ "field": elist.field + fcheck.language, "msg": elist.msg })
                    ))
                }
            }

            if (doneCnt === 3) { // KOR/ENG/CHA
                setErrorList(errList);
                setParentListReload(true, -1); // only list reload & page reset done

                setParentClistMode("READ");
                setParentPopWin("pop-spgcheck-detail", //pop-spgcheck-detail
                    <PopupSpgCheckView
                        htmlHeader={<h1>다국어 관리</h1>}
                        checkInfo={checkInfo}
                        setListReload={props.setListReload} // list reload
                        clistMode={"READ"}
                        setClistMode={props.setClistMode}
                        setPopWin={props.setPopWin}
                    />
                );
                if (doCnt === succCnt) {
                    CUTIL.jsclose_Popup("pop-spgcheck-edit");
                    var popupVal = e.target.getAttribute("data-pop");
                    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");
                    CUTIL.jsopen_Popup(e);
                } else {
                }
                doneCnt = 0;
                setRecoilIsLoadingBox(false);
            }
        })
    }

    return (
        <>
            {/*<!-- 다국어 관리 팝업 -->*/}
            <div className="popup__body">
                {(spgCheckItem) && spgCheckItem.filter(citem => citem.language === selLang).map((checkItem, idx) => (
                    <React.Fragment key={`rfr_${idx.toString()}`}>
                        <ul className="form__input">
                            <li>
                                <p className="tit">점검단계</p>
                                <div className="input__area">
                                    <input type="text" value={(checkItem.language === selLang) ? checkItem.checkStepDto.name : ""} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">기기 명</p>
                                <div className="input__area">
                                    <input type="text" value={(checkItem.language === selLang) ? checkItem.spgDto.name : ""} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">그룹 명</p>
                                <div className="input__area">
                                    <input type="text" value={(checkItem.language === selLang) ? checkItem.checkGroupDto.groupName : ""} disabled />
                                </div>
                            </li>
                        </ul>
                        <ul className="tab__small">
                            {langSet.map((tlang, idx) => (
                                <li key={`tli_${idx.toString()}`} className={(tlang.tabVal === selLang) ? "on" : ""}
                                    onClick={(e) => onClickLangTab(e)}
                                    data-value={JSON.stringify(tlang)}
                                >
                                    <a>{tlang.tabTxt}</a>
                                </li>
                            ))}
                        </ul>
                        <ul className="form__input">
                            <li>
                                <p className="tit">이름</p>
                                <div className="input__area">
                                    <input type="text"
                                        className={(errorList.filter(err => (err.field === "name" + checkItem.language)).length > 0) ? "input-error" : ""}
                                        value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.checkItemName)) ? checkItem.checkItemName : "" : ""}
                                        onChange={(e) => setSpgCheckItemItemName(e)}
                                        disabled={(selLang === CONST.STR_APILANG_KOR) ? true : false}
                                    />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "name" + checkItem.language)).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">설명</p>
                                <div className="input__area">
                                    <input type="text"
                                        className={(errorList.filter(err => (err.field === "description" + checkItem.language)).length > 0) ? "input-error" : ""}
                                        value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.description)) ? checkItem.description : "" : ""}
                                        onChange={(e) => setSpgCheckItemDescription(e)}
                                        disabled={(selLang === CONST.STR_APILANG_KOR) ? true : false}
                                    />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "description" + checkItem.language)).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">가중치</p>
                                <div className="input__area">
                                    <input type="text"
                                        className={(errorList.filter(err => (err.field === "weight" + checkItem.language)).length > 0) ? "input-error" : ""}
                                        value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.weight)) ? checkItem.weight : "" : ""}
                                        onChange={(e) => setSpgCheckItemWeight(e)}
                                        disabled={(selLang === CONST.STR_APILANG_KOR) ? true : false}
                                    />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "weight" + checkItem.language)).map((err) => err.msg)}</p>
                                </div>
                            </li>
                        </ul>
                    </React.Fragment>))}
                <div className="tbl-list">
                    <table summary="점수, 평가기준 항목으로 구성된 판정 List 입니다.">
                        <caption>
                            판정 List
                        </caption>
                        <colgroup>
                            <col style={{ "width": "16%" }} />
                            <col style={{ "width": "84%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">점수</th>
                                <th scope="col">평가기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(spgCheckItem) && spgCheckItem.filter(citem => citem.language === selLang).map((checkItem, idx) => (
                                checkItem.checkItemRefDtoList.map((citem, ridx) => (
                                    <tr key={`tr_${ridx.toString()}`}>
                                        <td><p>{citem.score}</p></td>
                                        <td>
                                            {(selLang === CONST.STR_APILANG_KOR)
                                                ? <p className="txt-left">{citem.reference}</p>
                                                : <textarea
                                                    value={citem.reference}
                                                    onChange={(e) => setSpgcheckItemRefDtoList(e, ridx)}
                                                />
                                            }
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="popup__footer">
                <button type="button" className="bg-gray js-close"
                    onClick={(e) => onClickCancel(e)}
                ><span>취소</span></button>
                <button type="button" className="js-open"
                    data-pop="pop-spgcheck-detail"
                    onClick={(e) => onClickDoUpdateSpgCheck(e)}
                >
                    <span>저장</span>
                </button>
            </div>
            {/*<!-- //다국어 관리 팝업 수정 -->*/}
        </>
    )
}



// 버전 변경 팝업 
function PopupChangeSpgVersion(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const versionList = props.versionList;
    const nversion = props.versionInfo;
    const setParentSpgVersion = props.setSpgVersion;
    const setParentVersionReload = props.setVersionReload;

    function onClickCancel(e) {
        //setParentListReload(true, 0);
        CUTIL.jsclose_Popup("pop-version-ok");
    }

    async function onClickDoChangeSpgVersion(e, nver) {
        //return;
        //clog("doUpdateHttpMessage : " + JSON.stringify(cmsg));
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "PUT",
            "appPath": `/api/v2/checksheet/spg/version?versionNo=${nver.versionNo}&spgName=${nver.spgName}`,
            appQuery:
            {/*
         "versionNo": nver.versionNo,
         "spgName": nver.spgName,
       */},
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum === CONST.API_200) {
                setParentSpgVersion(nversion);
                setParentVersionReload(true);
                alert(JSON.stringify(data.body));
            } else {
                alert(JSON.stringify(data.body.errorList));
            }
            CUTIL.jsclose_Popup("pop-version-ok");
        }
    }


    return (
        <>
            {/*<!--버전 변경 팝업 -->*/}
            <div className="popup__body">
                <p>선택한 버전으로 변경하여 적용하시겠습니까?</p>
                <ul className="versioninfo">
                    <li>
                        <span>기존 버전</span>
                        {versionList.filter((sver) => sver.enabled).map((sver, idx) => (
                            (idx === 0) && <strong key={`st_${idx.toString()}`}>{sver.spgName} {sver.versionNo}</strong>
                        ))}
                    </li>
                    <li>
                        <span>신규 버전</span>
                        <strong>{nversion.spgName} {nversion.versionNo}</strong>
                    </li>
                </ul>
            </div>
            <div className="popup__footer">
                <button type="button"
                    className="bg-gray js-close"
                    onClick={(e) => onClickCancel(e)}
                >
                    <span>취소</span>
                </button>
                <button type="button"
                    className="btn-close"
                    onClick={(e) => onClickDoChangeSpgVersion(e, nversion)}
                >
                    <span>확인</span>
                </button>
            </div>
            {/*<!-- // 버전 변경 팝업 -->*/}
        </>
    )

}
