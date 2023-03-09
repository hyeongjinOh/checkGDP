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

function SpgCheckNewList(props) {
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
    //const versionList = props.versionList;
    //const spgVersion = props.spgVersion;
    //const setParentSpgVersion = props.setSpgVersion;

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

    //const [versionList, setVersionList] = useState(null);
    const [versionReload, setVersionReload] = useState(false);
    const [spgNewVersion, setSpgNewVersion] = useState(null);

    const [checkList, setCheckList] = useState([]);
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    function handleListReload(val, page) {
        if (page > -1) {
            setPageInfo({ ...pageInfo, number: page, listReload: true });
        } else {
            setPageInfo({ ...pageInfo, listReload: true });
        }
    }
    ///////////
    const [errorList, setErrorList] = useState([]);

    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "POST",
        //appPath: `/api/v2/checksheet/step/spg/${selTree.spg.spgName}/items`,
        // appQuery: {
        //     spgName: selTree.spg.spgName,
        // },
        // userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        // watch: selTree
    });
    /*{"versionNo":"3.0","spgName":"배전반","enabled":false,"completed":false,"editing":true}*/
    useEffect(() => {
        setRecoilIsLoadingBox(true);
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
        if (ERR_URL.length > 0) {
            setRecoilIsLoadingBox(false);
            navigate(ERR_URL);
        }
        if (retData) {
            clog("IN CHECK SHEET LIST : NEW VERSION : RES : " + JSON.stringify(retData.body));
            setRecoilIsLoadingBox(false);
            if (retData.codeNum === CONST.API_200) {
                if (retData.body.editing) {
                    alert(`수정 진행중인 버전이 존재합니다.\n수정 중 버전 ${retData.body.spgName} ${retData.body.versionNo}`);
                } else {
                    alert(`신규 버전을 추가하여 편집화면으로 이동합니다.\n기존 버전 ${retData.body.spgName} ${retData.body.preVersionNo}\n신규 버전 ${retData.body.spgName} ${retData.body.versionNo}`);
                }
                setInsertCount(0);
                setSpgNewVersion(retData.body);
            }
        }
    }, [selTree, retData])

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

    const [insertCount, setInsertCount] = useState(0);

    function onClicInsertSpgCheck(e) {
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-add");
        //CUTIL.jsclose_Popup("pop-spgcheck-detail");    

        //setParentWorkMode("UPDATE");
        setParentPopWin("pop-spgcheck-add",
            <PopupSpgCheckInsert
                htmlHeader={<h1>e-HC Check Sheet 관리</h1>}
                spgInfo={spgNewVersion}
                setListReload={handleListReload} // list reload
                insertCount={insertCount + 1}
                setInsertCount={setInsertCount}
            /*
            spgCheckItem={spgCheckItem}
            listReload={listReload}
            workMode={props.workMode}
            setWorkMode={props.setWorkMode}
            setPopWin={props.setPopWin}
            updateCount={updateCount+1}
            setUpdateCount={setUpdateCount}
            */
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    async function onClickSpgVersionComplete(e) {
        var isOk = confirm(`버전 작업을 완료하시겠습니까?\n버전 작업 완료 시 신규 버전으로 업데이트되며 동일 버전으로\n수정 및 삭제가 불가능합니다.`);
        if (!isOk) return;

        let data: any = null;
        //setRecoilIsLoadingBox(true);
        //CUTIL.sleep(500);
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "PUT",
            "appPath": `/api/v2/checksheet/spg/version/complete?versionNo=${spgNewVersion.versionNo}&spgName=${spgNewVersion.spgName}`,
            appQuery:
            {
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            //setRecoilIsLoadingBox(false);
            if (data.codeNum == CONST.API_200) {
                clog(JSON.stringify(data.body));
                setParentWorkMode("LIST");
                setParentSelTree(adminType, { ...selTree, reload: true });
                alert(JSON.stringify(data.body));
            } else {
                alert(data.body.errorList[0].msg);
            }
        }


    }


    clog("IN CHECK NEW LIST TEMP : INIT : " + workMode);

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
                                <span className="ml-9 fontRegular"><strong>{(spgNewVersion) && spgNewVersion.versionNo}</strong></span>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <button type="button"
                            className="bg-gray"
                            data-pop="pop-spgcheck-add">
                            <span>항목 추가</span>
                        </button>
                        <button type="button" className="bg-blue ml-7 js-open" data-pop="pop-version">
                            <span>작업 완료</span>
                        </button>
                    </div>
                </div>
                {(spgNewVersion) &&/*(checkList.length > 0)&&*/
                    <CheckList
                        adminType={props.adminType}
                        selTree={selTree}
                        selStep={selStep}
                        spgNewVersion={spgNewVersion}
                        checkList={checkList}
                        setCheckList={setCheckList}
                        pageInfo={pageInfo}
                        setPageInfo={setPageInfo}
                        workMode={props.workMode}
                        setWorkMode={props.setWorkMode}
                        setPopWin={props.setPopWin}
                    />
                }
            </div>
            {/*<!--테이블-->*/}
            <div className="tbl-list checksheet-list">
                <table summary="점검단계,코드,그룹,이름,설명,가중치 항목으로 구성된 ACB 리스트 입니다.">
                    <caption>
                        ACB 리스트
                    </caption>
                    <colgroup>
                        <col style={{ "width": "9%" }} />
                        <col style={{ "width": "14%" }} />
                        <col style={{ "width": "12%" }} />
                        <col style={{ "width": "22%" }} />
                        <col style={{ "width": "25%" }} />
                        <col style={{ "width": "8%" }} />
                        <col style={{ "width": "5%" }} />
                        <col style={{ "width": "5%" }} />
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
                            <th scope="col">삭제</th>
                        </tr>
                    </thead>
                    <tbody>

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
                            <td>
                                <button type="button" className="btn btn-delete-gr js-open" data-pop="pop-delete">
                                    <span className="hide">항목 삭제</span>
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
                                <input type="text" value={"BASIC"} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">기기 명</p>
                            <div className="input__area"><input type="text" value={"배전반"} disabled /></div>
                        </li>
                        <li>
                            <p className="tit">그룹 명</p>
                            <div className="input__area"><input type="text" value={"사용연수"} disabled /></div>
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
                                    value={"운용년수"} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">설명</p>
                            <div className="input__area">
                                <input type="text" value={"별도의 측정장비는 필요없음"} disabled />
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
                                <td><p className="txt-left">15년 초과 20년 이하</p></td>
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
export default SpgCheckNewList;


function CheckList(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const selStep = props.selStep;
    const spgNewVersion = props.spgNewVersion;
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
    //const workMode = props.workMode;
    //const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;

    //화면 이동
    const navigate = useNavigate();
    //
    const [workMode, setWorkMode] = useState("LIST");
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
    if (spgNewVersion) {
        appPath = appPath + "&versionNo=" + spgNewVersion.versionNo
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
        watch: selTree + appPath + spgNewVersion + pageInfo.listReload
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
            if (retData.codeNum == CONST.API_200) {
                setParentCheckList(retData.body);
                setParentPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT }); //5, 10
                setWorkMode("LIST");
            }
        }
    }, [selTree, retData])


    async function onClickDeleteSpgCheck(e, checkInfo) {
        var isOk = confirm(`해당 Check Sheet를 삭제하시겠습니까?`);
        if (!isOk) return;
        let data: any = null;
        setRecoilIsLoadingBox(true);
        //CUTIL.sleep(500);
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": `/api/v2/checksheet/step/spg/item`,
            appQuery:
            {
                "code": checkInfo.code,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            setRecoilIsLoadingBox(false);
            if (data.codeNum == CONST.API_200) {
                handleListReload(true, 0);
                //alert(`정상적으로 삭제되었습니다.`);
            } else {
                alert(data.body.errorList[0].msg);
            }
        }
    }

    function onClickViewSpgCheck(e, checkInfo) {
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");

        //setWorkMode("READ");
        setParentPopWin("pop-spgcheck-detail", //pop-spgcheck-detail
            <PopupSpgCheckView
                htmlHeader={<h1>e-HC Check Sheet 관리</h1>}
                checkInfo={checkInfo}
                setListReload={handleListReload} // list reload
                workMode={workMode}
                setWorkMode={setWorkMode}
                setPopWin={props.setPopWin}
            />
        );
        CUTIL.jsopen_Popup(e);

    }
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
                        <col style={{ "width": "14%" }} />
                        <col style={{ "width": "12%" }} />
                        <col style={{ "width": "22%" }} />
                        <col style={{ "width": "25%" }} />
                        <col style={{ "width": "8%" }} />
                        <col style={{ "width": "5%" }} />
                        <col style={{ "width": "5%" }} />
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
                            <th scope="col">삭제</th>
                        </tr>
                    </thead>
                    <tbody>

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
                            <td>
                                <button type="button" className="btn btn-delete-gr js-open" data-pop="pop-delete">
                                    <span className="hide">항목 삭제</span>
                                </button>
                            </td>
                        </tr>

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
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
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
    clog("SPG CHECK VIEW : INIT : " + workMode + " : " + JSON.stringify(checkInfo));
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/checksheet/step/spg/item?code=${checkInfo.code}`,
        appQuery: {
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: checkInfo.code + workMode
    });
    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            setRecoilIsLoadingBox(false);
            clog("IN SPGCHECK VIEW : RES : " + JSON.stringify(retData.body));
            if (retData.codeNum == CONST.API_200) {
                retData.body.map((fcheck) => {
                    if (CUTIL.isnull(fcheck.checkItemRefDtoList)) fcheck.checkItemRefDtoList = defaultRefDtoList;
                })
                setSelLang(CONST.STR_APILANG_KOR);
                setSpgCheckItem(retData.body);
                //setParentWorkMode("READ");
                setUpdateCount(0);
            }
        }
    }, [retData])

    function onClickUpdateSpgCheck(e, check) {
        clog("UPDE : CHEKC : " + JSON.stringify(spgCheckItem));
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-edit");
        CUTIL.jsclose_Popup("pop-spgcheck-detail");

        //setParentWorkMode("UPDATE");
        setParentPopWin("pop-spgcheck-edit",
            <PopupSpgCheckUpdate
                htmlHeader={<h1>e-HC Check Sheet 관리</h1>}
                checkInfo={check}
                spgCheckItem={spgCheckItem}
                setListReload={props.setListReload} // list reload
                workMode={props.workMode}
                setWorkMode={props.setWorkMode}
                setPopWin={props.setPopWin}
                updateCount={updateCount + 1}
                setUpdateCount={setUpdateCount}
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    function onClickCancel(e) {
        //setParentListReload(true);
        setParentWorkMode("LIST");
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
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
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
    clog("SPG CHECK UPDATE : INIT : " + workMode + " : " + updateCount);
    useEffect(() => {
        setSpgCheckItem(props.spgCheckItem);
    }, [updateCount, props.spgCheckItem])

    function onClickCancel(e) {
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");
        CUTIL.jsclose_Popup("pop-spgcheck-edit");
        //setParentWorkMode("READ");
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

                setParentWorkMode("READ");
                setParentPopWin("pop-spgcheck-detail", //pop-spgcheck-detail
                    <PopupSpgCheckView
                        htmlHeader={<h1>다국어 관리</h1>}
                        checkInfo={checkInfo}
                        setListReload={props.setListReload} // list reload
                        workMode={"READ"}
                        setWorkMode={props.setWorkMode}
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
                                        className={(errorList.filter(err => (err.field === "name" + checkItem.language)).length > 0) ? "input-error" : ""}
                                        value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.checkItemName)) ? checkItem.checkItemName : "" : ""}
                                        onChange={(e) => setSpgCheckItemItemName(e)}
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
                                            <textarea
                                                value={citem.reference}
                                                onChange={(e) => setSpgcheckItemRefDtoList(e, ridx)}
                                            />
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

// SPG 체크 항목 등록
function PopupSpgCheckInsert(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const spgInfo = props.spgInfo;
    const setParentListReload = props.setListReload;
    const insertCount = props.insertCount;
    const setParentInsertCount = props.setInsertCount;

    /*
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const updateCount = props.updateCount;
    const setParentUpdateCount = props.setUpdateCount;
    */
    //
    const defaultRefDtoList = [
        { "score": 0, "reference": "" },
        { "score": 1, "reference": "" },
        { "score": 2, "reference": "" },
        { "score": 3, "reference": "" },
        { "score": 4, "reference": "" },
    ];
    //clog("INSERT : SPG INFO : " + JSON.stringify(spgInfo) + " : " + JSON.stringify(langs));
    const stepList = [
        { "stepName": "Basic", "stepVal": "BASIC" },
        { "stepName": "Advanced", "stepVal": "ADVANCED" },
        { "stepName": "Premium", "stepVal": "PREMIUM" },
    ];
    const [selStep, setSelStep] = useState(stepList[0]);
    const [spgCheckGroup, setSpgCheckGroup] = useState(null);
    const [selGroup, setSelGroup] = useState(null);
    const [errorList, setErrorList] = useState([]);
    const defaultCheckItem = {
        "versionNo": spgInfo.versionNo,
        "spgName": spgInfo.spgName,
        "stepName": stepList[0].stepVal,
        "checkGroupName": "",
        "name": "",
        "weight": 0,
        "language": CONST.STR_APILANG_KOR,
        "description": "",
        "checkItemRefDtoList": defaultRefDtoList,
    };
    const [spgCheckItem, setSpgCheckItem] = useState([defaultCheckItem,]);

    useEffect(() => {
        setSpgCheckItem([defaultCheckItem,]);
        setSelStep(stepList[0]);
        setSpgCheckGroup(null);
    }, [insertCount, spgInfo])


    clog("INSER : INIT : SELSTEP : " + JSON.stringify(selStep));
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/checksheet/step/spg/checkgroups?spgName=${spgInfo.spgName}&stepName=${selStep.stepVal}`,
        appQuery: {
            language: CUTIL.apiLangSet(langs)
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: spgInfo + selStep.stepVal + insertCount
    });
    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            setRecoilIsLoadingBox(false);
            clog("IN SPGCHECK INSERT GROUP : RES : " + JSON.stringify(retData.body));
            if (retData.codeNum == CONST.API_200) {
                //setSelGroup(retData.body[0]);
                setSpgCheckItem(spgCheckItem.map((fcheck) => (
                    (fcheck.language === selLang) ? { ...fcheck, "checkGroupName": retData.body[0].groupName } : fcheck)
                ))
                setSpgCheckGroup(retData.body);
            }
        }
    }, [retData])

    /*
    clog("SPG CHECK UPDATE : INIT : " + workMode + " : " + updateCount);
    useEffect(()=>{
      setSpgCheckItem(props.spgCheckItem);
    }, [updateCount, props.spgCheckItem])
    */
    function onClickCancel(e) {
        //var popupVal = e.target.getAttribute("data-pop");
        //if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");  
        CUTIL.jsclose_Popup("pop-spgcheck-add");
        //setParentWorkMode("READ");
        //setParentUpdateCount(updateCount+1);
        //CUTIL.jsopen_Popup(e);
        setParentInsertCount(insertCount + 1);
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


    function selectOptionGroup(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        //
        //setSelGroup(JSON.parse(optionData))
        setSpgCheckItem(spgCheckItem.map((fcheck) => (
            (fcheck.language === selLang) ? { ...fcheck, "checkGroupName": JSON.parse(optionData).groupName } : fcheck)
        ))
        // params init
    }


    function selectOptionStep(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        //
        setSelStep(JSON.parse(optionData))
        /*setSpgCheckItem(spgCheckItem.map((fcheck)=>(
          (fcheck.language===selLang)?{...fcheck, "stepName" : JSON.parse(optionData).groupName}:fcheck)
        ))*/
        // params init
    }

    function onClickLangTab(e) {
        var actTag = (e.target.tagName === "LI") ? e.target : e.currentTarget;
        var tabStrInfo = actTag.getAttribute("data-value");
        var tabInfo = JSON.parse(tabStrInfo)
        setSelLang(tabInfo.tabVal);
    }


    function setSpgCheckItemItemName(e) {
        setSpgCheckItem(spgCheckItem.map((fcheck) => (
            (fcheck.language === selLang) ? { ...fcheck, "name": e.target.value } : fcheck)
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


    async function onClickDoInsertSpgCheck(e) {
        const errList = [];
        var doCnt = 0;
        var doneCnt = 0;
        var succCnt = 0;

        var isOk = confirm(`수정 내용을 저장하시겠습니까?`);
        if (!isOk) return;

        let data: any = null;
        setRecoilIsLoadingBox(true);
        spgCheckItem.filter((fcheck) => fcheck.language === CONST.STR_APILANG_KOR).map(async (fcheck, idx) => {
            //CUTIL.sleep(500);
            clog("InSERT SPG CHECK : " + idx + " : " + JSON.stringify(fcheck));
            doCnt++;
            data = await HTTPUTIL.PromiseHttp({
                "httpMethod": "POST",
                "appPath": `/api/v2/checksheet/step/spg/item`,
                appQuery:
                {
                    "versionNo": fcheck.versionNo,
                    "spgName": fcheck.spgName,
                    "stepName": selStep.stepVal,//fcheck.stepName,
                    "checkGroupName": fcheck.checkGroupName,
                    "name": fcheck.name,
                    "description": fcheck.description,
                    "language": fcheck.language,
                    "weight": fcheck.weight,
                    "checkItemRefDtoList": fcheck.checkItemRefDtoList
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

            if (doneCnt === 1) { // KOR/ENG/CHA
                setErrorList(errList);
                setParentListReload(true, 0); // only list reload & page reset done

                /*setParentWorkMode("READ");
                setParentPopWin("pop-spgcheck-detail", //pop-spgcheck-detail
                  <PopupSpgCheckView
                    htmlHeader={<h1>다국어 관리</h1>}
                    checkInfo={checkInfo}
                    listReload={listReload}
                    setListReload={props.setListReload} // list reload
                    workMode={"READ"}
                    setWorkMode={props.setWorkMode}
                    setPopWin={props.setPopWin}
                  />
                );*/
                if (doCnt === succCnt) {
                    CUTIL.jsclose_Popup("pop-spgcheck-add");
                    /*
                    var popupVal = e.target.getAttribute("data-pop");
                    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-spgcheck-detail");
                    CUTIL.jsopen_Popup(e);             
                    */
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
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionStep)}>
                                        <div className="selected">
                                            <div className="selected-value">{selStep.stepName}</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {stepList.map((step, idx) => (
                                                <li key={`li_${idx.toString()}`}
                                                    className="option"
                                                    data-value={JSON.stringify(step)}>
                                                    {step.stepName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "stepName" + checkItem.language)).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">기기 명</p>
                                <div className="input__area"><input type="text" value={(checkItem.language === selLang) ? checkItem.spgName : ""} disabled /></div>
                            </li>
                            <li>
                                <p className="tit">그룹 명</p>
                                <div className="input__area">
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionGroup)}>
                                        <div className="selected">
                                            <div className="selected-value">{spgCheckGroup && spgCheckGroup[0].groupName}</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {(spgCheckGroup) && spgCheckGroup.map((cgroup, idx) => (
                                                <li key={`li_${idx.toString()}`}
                                                    className="option"
                                                    data-value={JSON.stringify(cgroup)}>
                                                    {cgroup.groupName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "checkGroupName" + checkItem.language)).map((err) => err.msg)}</p>
                                </div>
                            </li>
                        </ul>
                        <ul className="tab__small">
                            {langSet.map((tlang, idx) => (
                                <li key={`tli_${idx.toString()}`} className={(tlang.tabVal === selLang) ? "on" : ""}
                                    onClick={(e) => (tlang.tabVal === CONST.STR_APILANG_KOR) && onClickLangTab(e)}
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
                                        value={(checkItem.language === selLang) ? (!CUTIL.isnull(checkItem.name)) ? checkItem.name : "" : ""}
                                        onChange={(e) => setSpgCheckItemItemName(e)}
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
                                            <textarea
                                                value={citem.reference}
                                                onChange={(e) => setSpgcheckItemRefDtoList(e, ridx)}
                                            />
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
                    data-pop="pop-spgcheck-"
                    onClick={(e) => onClickDoInsertSpgCheck(e)}
                >
                    <span>저장</span>
                </button>
            </div>
            {/*<!-- //다국어 관리 팝업 수정 -->*/}
        </>
    )
}

