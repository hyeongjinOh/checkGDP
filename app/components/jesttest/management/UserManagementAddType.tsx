/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-09-22
 * @brief EHP UserManageMent   개발
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import { useNavigate } from "react-router-dom";
import EhpPagination from "../../common/pagination/EhpPagination";
import { type } from "os";
import UserTree from "../../jesttest/management/UserTreeTest";


/**
 * @brief EHP UserManageMent  개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

export default function UserView(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //화면 이동
    const navigate = useNavigate();
    //props
    const setParentPopWin = props.setPopWin;
    const selTree = props.selTree;
    const setSelTree = props.setSelTree;
    //페이징
    const defaultPageInfo = { "size": 15, "totalElements": 0, "totalPages": 0, "number": 0 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    //사업장 선택
    const [zoneSel, setZoneSel] = useState([]);
    const [zoneName, setZoneName] = useState('');
    const roleDto = [
        { id: "0", value: "", fname: "전체", /* active: false */ },
        { id: "1", value: "ROLE_ADMIN", fname: "Admin", /* active: false */ },
        { id: "2", value: "ROLE_ENGINEER", fname: "Engineer", /* active: false */ },
        { id: "3", value: "ROLE_USER", fname: "User", /* active: false */ },
        { id: "4", value: "ROLE_NONE", fname: "Non-User", /* active: false */ },
    ];
    const [role, setRole] = useState('');
    //
    const [users, setUsers] = useState(null);
    //
    // 승인 요청 
    const [item, setItem] = useState(null);
    const [approvalNo, setApprovalNo] = useState("");
    const [userDisplayDone, setUserDisplayDone] = useState(false);
    const [userDisplayCompanion, setUserDisplayCompanion] = useState(false);

    //ApprovalPop
    const [companyItem, setCompanyItem] = useState([]);
    const [zoneItem, setZoneItem] = useState([]);
    const [addListResult, setAddListResult] = useState([]);
    const [addListResultData, setAddListResultData] = useState([]);
    const [checked, setChecked] = useState(false);
    const [userType, setUserType] = useState("");
    const [companionTxt, setCompanionTxt] = useState("")
    const [errorList, setErrorList] = useState([])
    const [userTypeItme, setUserTypeItme] = useState("");

    //ApprovalPop - site addPop
    const [companyAdd, setCompanyAdd] = useState([]);
    const [zoneAdd, setZoneAdd] = useState([]);
    const [addList, setAddList] = useState([])
    // 
    const [load, setload] = useState(false);
    const [reload, setReload] = useState(false);
    const [enableItem, setEnableItem] = useState(false);
    const [enableType, setEnableIType] = useState(false);
    const [userLoad, setUserLoad] = useState(false);
    const [password, setPassword] = useState("")
    const [userDel, setUserDel] = useState(null);
    const [sortData, setSortData] = useState({ "sortField": "rownumber", "sort": "ASC" });
    //

    // 페이징
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }

    function onClickSort(e) {
        var actTag = (e.target.tagName == "TH") ? e.target : e.currentTarget;
        var selSortField = actTag.getAttribute("data-value");
        var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
        if (selSortField !== sortData.sortField) { // 정렬필드가 변경된 경우
            selSort = "DESC";
        }
        //setCurPage(0); // 페이지 초기화
        handleCurPage(0);
        setSortData({
            "sortField": selSortField,
            "sort": selSort
        });
    }
    //
    // 사업장 선택 API
    async function zoneOnSel(e) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            promiseFn: HTTPUTIL.PromiseHttp,
            httpMethod: "GET",
            appPath: `/api/v2/user/zones?companyName=${selTree.company.companyName}`,
            // appQuery: {
            //   companyName: 
            // },
            userToken: userInfo.loginInfo.token,
            watch: selTree.company.companyName + selTree.rolad
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setZoneSel(data.body)
            }
        }

    }



    // 신규 가입자 승인 요청 API
    function approvalPop(e, list) {
        CUTIL.jsopen_Popup(e);
        setItem(list)
        if (list.approval == 2) {
            setUserDisplayCompanion(false);
            setUserDisplayDone(true);
        } else if (list.approval == 3) {
            setUserDisplayDone(true);
        } else {
            setUserDisplayCompanion(false);
        }
        setUserLoad(false)

    }

    useEffect(() => {
        if (errorList.length > 0) {
            alert(errorList.map((err) => (err.msg)))
            var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
            var body = document.body
            var dimm = body.querySelector(".dimm");

            if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
            if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
            if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        }
    }, [errorList]);

    // <!-- 신규 가입 요청 팝업 --> 
    useEffect(() => {
        if (CUTIL.isnull(item)) return;
        setParentPopWin("pop-userjoin-ok",
            <RequestApproval
                htmlHeader={(item) && (<h1>{(item.approval == 3 || item.enable == true) ? item.userName : item.userName + "(미인증)"}</h1>)}
                htmlHeaderBtn={(item) && <button className="btn btn-close js-close" onClick={(e) => close(e)} ><span className="hide">닫기</span></button>}

                userInfo={userInfo}
                item={item}
                setload={setload}
                approvalNo={approvalNo}
                addListResult={addListResult}
                setAddListResult={setAddListResult}
                addListResultData={addListResultData}
                setAddListResultData={setAddListResultData}
                setPassword={setPassword}
                checked={checked}
                setChecked={setChecked}
                userType={userType}
                setUserType={setUserType}
                userDisplayDone={userDisplayDone}
                setUserDisplayDone={setUserDisplayDone}
                userDisplayCompanion={userDisplayCompanion}
                setUserDisplayCompanion={setUserDisplayCompanion}
                companionTxt={companionTxt}
                setCompanionTxt={setCompanionTxt}
                roleDto={roleDto}
                errorList={errorList}
                setErrorList={setErrorList}
                setEnableIType={setEnableIType}
                setAddList={setAddList}
                //
                reload={reload}
                setReload={setReload}
                setEnableItem={setEnableItem}
                setUserDel={setUserDel}
                enableItem={enableItem}
                setUserTypeItme={setUserTypeItme}
                userLoad={userLoad}
                setUserLoad={setUserLoad}

                //
                companySelect={companySelect}
                approvalChang={approvalChang}
                listDelete={listDelete}
                usertypeSelect={usertypeSelect}

                onCompanion={onCompanion}
                onDone={onDone}
                //
                userApprovalDone={userApprovalDone}

            />
        )

    });

    // 승인 API 
    async function approvalChang(list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/user/${list.id}/approval`,
            appQuery: {
                approval: 2
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setApprovalNo(data.body.approval);
                setReload(true);
                setUserDisplayCompanion(false);
                setUserDisplayDone(true);
            }
        }
    }

    // 반려 display
    function onCompanion(e, list) {
        if (userDisplayCompanion === false) {
            setUserDisplayCompanion(true);
            setUserDisplayDone(false);

        } else if (list.enabled == false) {
            setUserDisplayCompanion(false);
        }
    }
    // 승인 선택
    function onDone(e) {
        if (userDisplayDone === false) {
            setUserDisplayDone(true);
            setUserDisplayCompanion(false);
            setCompanionTxt("");
        }
    }

    // 회사 API
    async function companySelect(e) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: "/api/v2/product/companies",
            appQuery: {
                // language: apiLang,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setCompanyItem(data.body);
            }
        }

    }
    //회사 선택 시 사업장 API 연계까지
    async function companyClick(e, company) {
        // 셀렉트 선택 시 data
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: "/api/v2/product/company/zones?companyId=" + company.companyId,
            appQuery: {
                // language: apiLang,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setZoneItem(data.body);
                setCompanyAdd(company)
            }
        }
    }
    // 사업장 이벤트
    function zoneClick(e, zone) {
        setZoneAdd(zone)
    }
    //ApprovalPop - site addPop ListAdd
    function listAdd(e, companyAdd, zoneAdd, list) {
        const productId = addListResultData.map((val) => (val.productId))

        var listVal = {
            userIdPk: list.userIdPk,
            companyId: companyAdd.companyId,
            companyName: companyAdd.companyName,
            zoneId: zoneAdd.zoneId,
            zoneName: zoneAdd.zoneName,
            address: zoneAdd.address,
            // url: URL.createObjectURL(file),
        }

        if (zoneAdd != "") {
            if (productId.includes(listVal.zoneId)) {
                alert("회사_사업장 목록에 존재하여 등록이 불가능 합니다.")
            } else {
                setAddList([...addList, listVal]);
            }
        }
        // if()
    }
    //ApprovalPop - site addPop ListDelete
    function listDelete(list) {
        setAddList(addList.filter(delList => delList.zoneId !== list.zoneId));
        setAddListResult(addListResult.filter(delList => delList.zoneId !== list.zoneId));
    }
    // siet 등록 이벤트
    async function siteAdd(addLists) {

        setAddListResult(addLists);
        const popcloes = document.getElementsByClassName("js-close");
        popcloes

    }

    // 사용자 타입
    function usertypeSelect(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "role"))
        )
        setUserType(e.target.value);
        setChecked(true)

    }
    // 승인 완료 
    async function userApprovalDone(list, userType, addListResult) {
        if (addListResult == '') {
            var zoneName = []
            var companyId = []
            let data: any = []
            data = await HTTPUTIL.PromiseHttp({
                httpMethod: "PUT",
                appPath: `/api/v2/auth/user/${list.id}/roleusertree`,
                appQuery: {
                    role: userType,
                    usertree: []
                },
                userToken: userInfo.loginInfo.token,
            });
            if (data) {
                if (data.codeNum == CONST.API_200) {

                    alert("사용자 승인 요청이 완료되었습니다.")
                    setReload(true);
                    var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
                    var body = document.body
                    var dimm = body.querySelector(".dimm");

                    if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
                    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");

                } else {

                    setErrorList(data.body.errorList);
                }
            }
        } else {
            let data: any = []
            for (let i = 0; i < addListResult.length; i++) {

                data = await HTTPUTIL.PromiseHttp({
                    httpMethod: "PUT",
                    appPath: `/api/v2/auth/user/${list.id}/roleusertree`,
                    appQuery: {
                        role: userType,
                        usertree: [
                            {
                                product: "zone",
                                productName: addListResult[i].zoneName,
                                productParentId: addListResult[i].companyId,
                                approval: 2,
                                isontree: true
                            }
                        ]
                    },
                    userToken: userInfo.loginInfo.token,
                });
            }
            if (data) {
                if (data.codeNum == CONST.API_200) {
                    alert("사용자 승인 요청이 완료되었습니다.");
                    setReload(true);
                    var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
                    var body = document.body
                    var dimm = body.querySelector(".dimm");

                    if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
                    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
                } else {

                    setErrorList(data.errorList);
                }
            }
        }
    }

    //
    function close(e) {
        var btnCommentClose = document.getElementById("pop-userjoin-ok");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");

        var radioCheck = document.getElementById("rd_" + roleDto[0].id);
        setUserType((item.role == roleDto[4].value) ? "" : item.role);
        setChecked(false);
        setErrorList([]);
        setAddList([]);
        setAddListResult([]);
        setUserDisplayCompanion(false);
    }
    //


    //

    // 중복제거 이벤트
    const addLists = addList.filter((arr, index, callback) => index === callback.findIndex(t => t.zoneId === arr.zoneId));

    return (
        <>
            {/* <!--area__right, 오른쪽 영역--> */}
            <div className="area__right_content workplace__info workplace__main info__input newtype">
                <div className="page-top">
                    <h2></h2>
                </div>
                <div className="tbl__top mb-16">
                    <div className="left">
                        <div className="searcharea">
                            <div className="searchinput">
                                <span className="mr-16"><strong>사업장</strong></span>
                                <div className="select w186" onClick={(e) => { CUTIL.onClickSelect(e, CUTIL.selectOption), zoneOnSel(e) }}>
                                    <div className="selected">
                                        <div className="selected-value" onClick={(e) => setZoneName("")}>전체</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        <li className="option" onClick={(e) => setZoneName("")} >전체</li>
                                        {zoneSel.map((zone, idx) => (
                                            <li key={"zone_" + idx} className="option" onClick={(e) => setZoneName(zone.zoneName)}>{zone.zoneName}</li>
                                        ))}
                                    </ul>
                                </div>
                                <span className="ml-76 mr-16"><strong>사용자 타입</strong></span>
                                <div className="select w186" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                    <div className="selected">
                                        <div className="selected-value" onClick={(e) => setRole("")}>{roleDto[0].fname}</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        {roleDto.map((role) => (
                                            <li key={"role_" + role.id} className="option" onClick={(e) => setRole(role.value)}>{role.fname}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!--테이블--> */}
                <div className="tbl-list user-list">
                    <table summary="등록 순,사용자 타입,회사,사업장,이름,E-mail(ID),연락처,담당 사업장,마지막 로그인,승인상태 항목으로 구성된 사용자 리스트 입니다.">
                        <caption>
                            사용자 리스트
                        </caption>
                        <colgroup className="d-lm-none">
                            <col style={{ "width": "90px" }} />
                            <col style={{ "width": "140px" }} />
                            <col style={{ "width": "" }} />
                            <col style={{ "width": "" }} />
                            <col style={{ "width": "90px" }} />
                            <col style={{ "width": "" }} />
                            <col style={{ "width": "145px" }} />
                            <col style={{ "width": "145px" }} />
                            <col style={{ "width": "" }} />
                            <col style={{ "width": "100px" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className={`sort ${(sortData.sortField === "rownumber") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                                    onClick={(e) => onClickSort(e)} data-value="rownumber">
                                    <span>등록 순</span>
                                </th>
                                {/* <!-- pl-22 클래스 : 레드 점 표시때문에 사용자타입 항목에만 들어감 (th, td 공통사항)--> */}
                                <th scope="col" className={`sort ${(sortData.sortField === "role") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left  pl-22`}
                                    onClick={(e) => onClickSort(e)} data-value="role">
                                    <span>사용자 타입</span>
                                </th>
                                <th scope="col" className={`sort ${(sortData.sortField === "companyName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                                    onClick={(e) => onClickSort(e)} data-value="companyName">
                                    <span>회사</span>
                                </th>
                                <th scope="col" className={`sort ${(sortData.sortField === "zoneName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left  d-sm-none`}
                                    onClick={(e) => onClickSort(e)} data-value="zoneName">
                                    <span>사업장</span>
                                </th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col" className="txt-left d-lm-none">E-mail(ID)</th>
                                <th scope="col" className="txt-left d-lm-none">연락처</th>
                                <th scope="col" className={`sort ${(sortData.sortField === "zoneCount") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left  d-sm-none`}
                                    onClick={(e) => onClickSort(e)} data-value="zoneCount">
                                    <span>담당 사업장</span>
                                </th>
                                <th scope="col" className={`sort ${(sortData.sortField === "loginTime") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left  d-sm-none`}
                                    onClick={(e) => onClickSort(e)} data-value="loginTime">
                                    <span>마지막 로그인</span>
                                </th>
                                <th scope="col" className={`sort ${(sortData.sortField === "approval") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left `}
                                    onClick={(e) => onClickSort(e)} data-value="approval">
                                    <span>승인상태</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(users) && users.map((list, idx) => (
                                <tr key={"userMng_" + idx} className="js-open" data-pop={"pop-userjoin-ok"} onClick={(e) => approvalPop(e, list)}>
                                    <td className="txt-left" data-pop={"pop-userjoin-ok"} >{list.rowNumber}</td>
                                    {/* <!--(승인포함) 비활성화일경우 disabled 클래스 추가 --> */}
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"}  pl-22`} data-pop={"pop-userjoin-ok"}>
                                        <span data-pop={"pop-userjoin-ok"}>
                                            {(roleDto.filter((rd) => (rd.value === list.role)).length > 0) ? roleDto.filter((rd) => (rd.value === list.role)).map((rd) => rd.fname) : roleDto[1].fname}
                                        </span></td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"}`} data-pop={"pop-userjoin-ok"}>{list.companyName}</td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"} d-sm-none`} data-pop={"pop-userjoin-ok"}  >{list.zoneName}</td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"}`} data-pop={"pop-userjoin-ok"}>{list.userName}</td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"} d-lm-none`} data-pop={"pop-userjoin-ok"} ><p className="ellipsis" data-pop={"pop-userjoin-ok"} >{list.userId}</p></td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"} d-lm-none`} data-pop={"pop-userjoin-ok"} >{list.phoneNumber}</td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"} d-sm-none`} data-pop={"pop-userjoin-ok"} >{list.zoneCount}</td>
                                    <td className={`txt-left ${(list.enable == false) && "icon-dot"} ${(list.role === roleDto[4].value || (list.enable == false)) && "disabled"} d-sm-none`} data-pop={"pop-userjoin-ok"} ><p className="ellipsis" data-pop={"pop-userjoin-ok"} >{CUTIL.utc2time("YYYY-MM-DD", list.loginTime)}</p></td>
                                    <td>
                                        {(list.approval == 1) ?
                                            <button type="button" className="bg-blue js-open" data-pop={"pop-userjoin-ok"}  ><span data-pop={"pop-userjoin-ok"} >승인 요청</span></button>
                                            : (list.approval == 2) ?
                                                <button type="button" className="bg-navy js-open" data-pop={"pop-userjoin-ok"} ><span data-pop={"pop-userjoin-ok"} >승인 중</span></button>
                                                :
                                                ""
                                        }
                                    </td>
                                </tr>
                            ))}


                        </tbody>
                    </table>
                </div>
                {(pageInfo) && <EhpPagination
                    componentName={"User"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />}
            </div>
            {/* <!--//area__right, 오른쪽 영역--> */}
            <div>
                <div className="left">
                    {/* <!--220902, h2 삭제--> */}
                    <ul className="form__input">
                        <li>
                            <p className="tit">E-mail (아이디)</p>
                            <div className="input__area">
                                <input type="text" id="inp1" disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text" id="inp2" disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">연락처</p>
                            <div className="input__area">
                                <input type="text" id="inp3" disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">회사</p>
                            <div className="input__area">
                                <input type="text" id="inp4" disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">사업장</p>
                            <div className="input__area">
                                <input type="text" id="inp5" disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">부서</p>
                            <div className="input__area">
                                <input type="text" id="inp6" disabled />
                            </div>
                        </li>
                        {/* <!--221028 업종 추가 (모든 사용자정보 팝업에 동일하게 적용)--> */}
                        <li>
                            <p className="tit">업종</p>
                            <div className="input__area">
                                <input type="text" id="inp7" disabled />
                            </div>
                        </li>
                        {/* <!--220902, 승인여부 항목 추가--> */}

                        <li className="mt-45">
                            <p className="tit star mt-8">승인 여부</p>
                            <div className="btn__wrap">

                                <button type="button" className={(userDisplayDone) ? "bg-navy" : ""} onClick={(e) => onDone(e)}><span>승인</span></button>


                                <button type="button"><span>승인</span></button>

                                <button type="button" className={(userDisplayCompanion) ? "bg-navy" : ""} ><span>반려</span></button>
                            </div>
                        </li>
                        :
                        <li className="mt-45">
                            <p className="tit mt-8 txt-black">사용자 설정</p>
                            <div className="btn__wrap left-right">
                                <button type="button" className="btn-off js-open" data-pop={"pop-enabled"}>
                                    <span className="hide js-open" data-pop={"pop-enabled"}>비활성화</span></button>
                                <button type="button" className="btn-on js-open" data-pop={"pop-enabled"}><span className="hide">활성화</span></button>
                                {/* pop-password */}
                                <button type="button" className="btn txtline js-open" data-pop={"pop-password"}>
                                    <span data-pop={"pop-password"}>패스워드 초기화</span>
                                </button>
                            </div>
                        </li>

                    </ul>
                </div>

            </div>
        </>
    );
}

//
//신규 가입자요청 팝업
function RequestApproval(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const item = (props.item == null) ? null : props.item;
    const listItem = (props.list == null) ? null : props.list;
    const setReload = props.setReload;
    const setEnableItem = props.setEnableItem;
    const addListResultData = props.addListResultData;
    const setPassword = props.setPassword;
    const companionTxt = props.companionTxt
    const setErrorList = props.setErrorList;
    const userType = props.userType;
    const addListResult = props.addListResult;
    const setAddListResult = props.setAddListResult;
    const setUserDel = props.setUserDel;
    const enableItem = props.enableItem;
    const reload = props.reload;
    const userApprovalDone = props.userApprovalDone;
    const setUserType = props.setUserType;
    const checked = props.checked
    const setChecked = props.setChecked
    const setUserTypeItme = props.setUserTypeItme;
    const userLoad = props.userLoad;
    const setUserLoad = props.setUserLoad;
    const approvalNo = props.approvalNo;
    const setEnableIType = props.setEnableIType;
    const errorList = props.errorList;
    const setAddList = props.setAddList;

    const userDisplayDone = props.userDisplayDone;
    const setUserDisplayDone = props.setUserDisplayDone;
    const userDisplayCompanion = props.userDisplayCompanion;
    const setUserDisplayCompanion = props.setUserDisplayCompanion;
    const onDone = props.onDone;
    const approvalChang = props.approvalChang;
    const onCompanion = props.onCompanion;
    const setload = props.setload;
    const setAddListResultData = props.setAddListResultData
    //
    //

    const [list, setList] = useState(null)
    // user item API
    const { data: data, isLoading } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/user/${item.userIdPk}/detail`,
        userToken: userInfo.loginInfo.token,
        watch: item.userIdPk + reload + enableItem + userLoad
    });
    useEffect(() => {

        if (data) {
            if (data.codeNum == CONST.API_200) {

                setList(data.body);
                setAddListResultData(data.body.userTreeList)
                setUserType(data.body.role);

            } else {

                setErrorList(data.errorList);
            }
        }
    }, [data]);


    //

    // 반려 완료
    async function userApprovalDel(list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/user/${list.id}/approval`,
            appQuery: {
                approval: 0,
                deniedReason: companionTxt

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                alert("메일 전송이 완료되었습니다.");
                setReload(true);
                var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
                var body = document.body
                var dimm = body.querySelector(".dimm");
                setload(true);
                if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
                if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
            }
        }
    }
    // 승인 수정 
    async function userApprovalUpdate(list, userType, addListResult) {
        if (addListResult == '') {
            let data: any = []
            data = await HTTPUTIL.PromiseHttp({
                httpMethod: "PUT",
                appPath: `/api/v2/auth/user/${list.id}/roleusertree`,
                appQuery: {
                    role: userType,
                    usertree: []
                },
                userToken: userInfo.loginInfo.token,
            });
            if (data) {
                if (data.codeNum == CONST.API_200) {

                    alert("사용자 승인 요청이 수정되었습니다.");
                    setReload(true);
                    setUserLoad(true);
                    var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
                    var body = document.body
                    var dimm = body.querySelector(".dimm");

                    if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
                    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");

                } else {

                    setErrorList(data.body.errorList);
                }
            }
        } else {
            let data: any = []
            for (let i = 0; i < addListResult.length; i++) {
                data = await HTTPUTIL.PromiseHttp({
                    httpMethod: "PUT",
                    appPath: `/api/v2/auth/user/${list.id}/roleusertree`,
                    appQuery: {
                        role: userType,
                        usertree: [
                            {
                                product: "zone",
                                productName: addListResult[i].zoneName,
                                productParentId: addListResult[i].companyId,
                                approval: 2,
                                isontree: true
                            }
                        ]
                    },
                    userToken: userInfo.loginInfo.token,
                });
            }
            if (data) {
                if (data.codeNum == CONST.API_200) {

                    alert("사용자 승인 요청이 수정되었습니다.");
                    setReload(true);
                    setUserLoad(true);
                    var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
                    var body = document.body
                    var dimm = body.querySelector(".dimm");

                    if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
                    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
                    setAddListResult([])
                    setAddList([])
                } else {

                    setErrorList(data.errorList);
                }
            }
        }
    }
    //


    function userOnOff(e, type) {
        CUTIL.jsopen_Popup(e)
        setEnableIType(type)
        // console.log("type",type)
    }
    async function userPwd(e, type) {

        CUTIL.jsopen_Popup(e)
        setPassword(type)

    }
    return (
        <>

            <div className={`popup__body ${(list.enabled === false) ? "alldisabled" : ""}`}>
                <div className="left">
                    {/* <!--220902, h2 삭제--> */}
                    <ul className="form__input">
                        <li>
                            <p className="tit">E-mail (아이디)</p>
                            <div className="input__area">
                                <input type="text" id="inp1" value={list.userId} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text" id="inp2" value={list.userName} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">연락처</p>
                            <div className="input__area">
                                <input type="text" id="inp3" value={list.phoneNumber} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">회사</p>
                            <div className="input__area">
                                <input type="text" id="inp4" value={list.companyName} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">사업장</p>
                            <div className="input__area">
                                <input type="text" id="inp5" value={list.zoneName} disabled />
                            </div>
                        </li>
                        <li>
                            <p className="tit">부서</p>
                            <div className="input__area">
                                <input type="text" id="inp6" value={list.department} disabled />
                            </div>
                        </li>
                        {/* <!--221028 업종 추가 (모든 사용자정보 팝업에 동일하게 적용)--> */}
                        <li>
                            <p className="tit">업종</p>
                            <div className="input__area">
                                <input type="text" id="inp7" value={list.classification} disabled />
                            </div>
                        </li>
                        {/* <!--220902, 승인여부 항목 추가--> */}
                        {(list.approval != 3) ?
                            <li className="mt-45">
                                <p className="tit star mt-8">승인 여부</p>
                                <div className="btn__wrap">
                                    {(list.approval == 2 && list.enabled == true) &&
                                        <button type="button" className={(userDisplayDone) ? "bg-navy" : ""} onClick={(e) => onDone(e)}><span>승인</span></button>
                                    }
                                    {(list.approval == 1 && list.enabled == true) &&
                                        <button type="button" onClick={(e) => approvalChang(list)}><span>승인</span></button>
                                    }
                                    <button type="button" className={(userDisplayCompanion) ? "bg-navy" : ""} onClick={(e) => onCompanion(e, list)}><span>반려</span></button>
                                </div>
                            </li>
                            :
                            <li className="mt-45">
                                <p className="tit mt-8 txt-black">사용자 설정</p>
                                <div className="btn__wrap left-right">
                                    {(list.enabled == false) &&
                                        <button type="button" className="btn-off js-open" data-pop={"pop-enabled"}
                                            onClick={(e) => userOnOff(e, list.enabled)}>
                                            <span className="hide js-open" data-pop={"pop-enabled"}>비활성화</span></button>
                                    }
                                    {(list.enabled == true) &&
                                        <button type="button" className="btn-on js-open" data-pop={"pop-enabled"}
                                            onClick={(e) => userOnOff(e, list.enabled)}><span className="hide">활성화</span></button>
                                    }
                                    {/* pop-password */}
                                    <button type="button" className="btn txtline js-open" data-pop={"pop-password"} onClick={(e) => userPwd(e, list)}>
                                        <span data-pop={"pop-password"}>패스워드 초기화</span>
                                    </button>
                                </div>
                            </li>
                        }
                    </ul>
                </div>
                <div className="right">
                    <ul className="form__input">
                        {/* <!--220902, 반려일 경우 반려사유 입력폼으로 교체 --> */}
                        {(userDisplayCompanion) &&
                            <Companion
                                companionTxt={props.companionTxt}
                                setCompanionTxt={props.setCompanionTxt}
                            />
                        }

                        {(list.approval != 1 && userDisplayDone && list.enabled == true) &&
                            <IsSavedApproval
                                list={list}
                                addListResult={props.addListResult}
                                errorList={errorList}
                                //
                                companySelect={props.companySelect}
                                userType={props.userType}
                                setUserType={setUserType}
                                checked={checked}
                                setChecked={setChecked}
                                usertypeSelect={props.usertypeSelect}
                                roleDto={props.roleDto}
                                listDelete={props.listDelete}
                                reload={props.reload}
                                addListResultData={addListResultData}
                                setUserDel={setUserDel}

                                setUserTypeItme={setUserTypeItme}
                            />
                        }

                    </ul>
                </div>
            </div>

            {(list) &&
                < div className="popup__footer">
                    {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                    {(userDisplayCompanion && props.companionTxt) ?
                        <button type="button" onClick={(e) => userApprovalDel(list)}><span>완료</span></button>
                        : (userDisplayDone && list.approval == 2 && (list.enabled === true)) ?
                            <button type="button" onClick={(e) => userApprovalDone(list, userType, addListResult)}><span>완료</span></button>
                            : (list.approval == 3 && (list.enabled === true)) ?
                                <button type="button" onClick={(e) => userApprovalUpdate(list, userType, addListResult)}><span>완료</span></button>
                                : (list.enabled === false) ?
                                    <button type="button" disabled><span>완료</span></button>
                                    :
                                    <button type="button" disabled><span>완료</span></button>

                    }
                </div>
            }

            {/* <!-- //신규 가입 요청 팝업 --> */}

        </>
    );
}

//신규 가입자 승인 
function IsSavedApproval(props) {
    const list = (props.list == null) ? null : props.list
    const addListResult = (props.addListResult == null) ? null : props.addListResult;
    const companySelect = props.companySelect
    const checked = props.checked;
    const setChecked = props.setChecked;
    const listDelete = props.listDelete;
    const roleDto = props.roleDto;
    const errorList = props.errorList;
    const addListResultData = props.addListResultData;
    const userType = props.userType;
    const setUserDel = props.setUserDel;
    const setUserTypeItme = props.setUserTypeItme;
    //
    const [userTree, setUserTree] = useState([])
    useEffect(() => {
        setUserTree(addListResultData)
    }, [addListResultData])

    function listItemDelete(e, list) {
        CUTIL.jsopen_Popup(e)
        setUserDel(list)
    }
    function usertypePop(e) {
        CUTIL.jsopen_Popup(e)
        setUserTypeItme(e.target.value);
        setChecked(true)
    }
    return (
        <>

            <li>
                <p className="tit star question"><span>사용자 타입</span></p>
                <div className="input__area">
                    <div className={(errorList.filter(err => (err.field === "role")).length > 0) ? "radioBox input-error" : "radioBox"}>
                        <label id={"rd_" + roleDto[0].id} className="hide">
                            <input type="radio" id={"rd_" + roleDto[0].id} name="rd" value={roleDto[0].value} checked={!checked} onChange={(e) => props.usertypeSelect(e)} />
                        </label>
                        {(list.approval === 2) && roleDto.filter((type) => (type.id != 4) && (type.id != 0)).map((type) => (
                            <label id={"rd_" + type.id} key={type.id}>
                                {(list.enabled == false) ?
                                    <input type="radio" disabled id={"rd_" + type.id} name="rd" />
                                    :
                                    <input type="radio" id={"rd_" + type.id} name="rd" value={(type.value === userType) ? type.value : type.value} checked={(userType === type.value) ? true : false} onChange={(e) => props.usertypeSelect(e)} />
                                }
                                {type.fname}
                            </label>
                        ))}
                        {(list.approval == 3) && roleDto.filter((type) => (type.id != 4) && (type.id != 0)).map((type) => (
                            <label id={"rd_" + type.id} key={type.id} >
                                {(list.enabled == false) ?
                                    <input type="radio" disabled id={"rd_" + type.id} name="rd" checked={(list.role == type.value) && true} />
                                    :
                                    <input type="radio" id={"rd_" + type.id} name="rd" value={(type.value === list.role) ? type.value : type.value}
                                        // checked={(list.role === type.value) ? type.value : (userType === type.value) ? !checked : checked} onChange={(e) => usertypePop(e)} />
                                        checked={(userType === type.value) ? true : false} onChange={(e) => usertypePop(e)}
                                        className="js-open" data-pop={"pop-role"}
                                    />
                                }
                                {type.fname}
                            </label>
                        ))}

                    </div>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "role")).map((err) => err.msg)}</p>
                </div>
            </li>
            <li className="inline">
                <p className="tit ">회사_사업장 목록</p>
                {/* <!--웹 및 탭용 버튼--> */}
                {(userType == roleDto[3].value) && (list.enabled == true) ?
                    <button type="button" className="btn-basic js-open d-sm-none" data-pop="pop-userjoin-info"
                        onClick={(e) => { CUTIL.jsopen_Popup(e), props.companySelect(e) }}>
                        <span data-pop="pop-userjoin-info">추가</span>
                    </button>
                    :
                    <button type="button" className="btn-basic" disabled><span>추가</span></button>
                }
            </li>
            <li className="mb-0">
                <div className="tbl-list type2 mt-m10">
                    <table summary="No.,회사 명,사업장 명 항목으로 구성된 Sites 추가 정보 목록 입니다.">
                        <caption>
                            사업장 승인 요청자 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left">No.</th>
                                <th scope="col" className="txt-left">회사 명</th>
                                <th scope="col" className="txt-left">사업장 명</th>
                                <th scope="col" className="hide">항목 삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(userTree) && userTree.map((treeList, idx) => (
                                <tr key={treeList.id}>
                                    <td className="txt-left">{++idx}</td>
                                    <td className="txt-left">{treeList.productParentId}</td>
                                    <td className="txt-left"><span className="icon-navi">{treeList.productName}</span></td>
                                    <td>
                                        {(list.enabled == true) ?
                                            <button type="button" className="bg-gray js-open" data-pop="pop-delete" onClick={(e) => listItemDelete(e, treeList)} ><span data-pop="pop-delete" >삭제</span></button>
                                            :
                                            <button type="button" className="bg-gray" disabled ><span >삭제</span></button>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {(addListResult) && addListResult.map((list, idx) => (
                                <tr key={list.zoneId}>
                                    <td className="txt-left">{(userTree.length + ++idx)}</td>
                                    <td className="txt-left">{list.companyName}</td>
                                    <td className="txt-left"><span className="icon-navi">{list.zoneName}</span></td>
                                    <td>
                                        <button type="button" className="btn-delete-g" onClick={(e) => listDelete(list)}><span className="hide">항목 삭제</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </li>
            <li className="mt-8">
                <p className="txt-info">* 사용자 타입 변경 시 User로 등록된 회사_사업장은 초기화 됩니다.</p>
            </li>
        </>
    );
}
// 신규가입자- 반려
function Companion(props) {

    return (
        <>
            <li className="inline">
                <p className="tit star">반려 사유 입력</p>
            </li>
            <li>
                <div className="input__area w100p">
                    <textarea placeholder="메모를 입력하세요" value={props.companionTxt} onChange={(e) => props.setCompanionTxt(e.target.value)}></textarea>
                </div>
            </li>
        </>
    )

}
//신규 가입자 - site 등록
function SiteCeatePop(props) {
    //props
    const item = (props.item == null) ? null : props.item;
    const companyItems = (props.companyItem === null) ? null : props.companyItem;
    const zoneItems = (props.zoneItem === null) ? null : props.zoneItem;
    const addLists = (props.addLists === null) ? null : props.addLists;
    const addListResultData = props.addListResultData;

    //
    const companyAdd = props.companyAdd;
    const zoneAdd = props.zoneAdd;
    const addList = props.addList;
    const setAddList = props.setAddList;

    //
    const companyClick = props.companyClick;
    const zoneClick = props.zoneClick;
    const listAdd = props.listAdd;
    const listDelete = props.listDelete;
    const siteAdd = props.siteAdd;



    return (
        <>
            <div className="popup__body layout-vertical">
                <ul className="form__input inline mb-24">
                    <li>
                        <label htmlFor="company"><span className="star">회사</span></label>
                        <div className="input__area">
                            <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected">
                                    <div className="selected-value">클릭하여 선택해주세요</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul className="hmax-385">
                                    {companyItems.map((list) => (
                                        <li key={list.companyId} className="option" onClick={(e) => companyClick(e, list)} >{list.companyName}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </li>
                    <li>
                        <label htmlFor="company"><span className="star">사업장</span></label>
                        <div className="input__area">
                            <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected">
                                    <div className="selected-value">클릭하여 선택해주세요</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul className="hmax-385">
                                    {zoneItems.map((list) => (
                                        <li key={list.zoneId} className="option" onClick={(e) => zoneClick(e, list)}>{list.zoneName}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <button type="button" className="btn-basic ml-18" onClick={(e) => listAdd(e, companyAdd, zoneAdd, item)}><span>추가</span></button>
                    </li>
                </ul>
                <div className="tbl-list type2">
                    <table summary="No.,회사 명,사업장명, 사업장 주소, 항목삭제 항목으로 구성된 신규 가입자 정보 목록 입니다.">
                        <caption>
                            신규 가입자 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left">No.</th>
                                <th scope="col" className="txt-left">회사 명</th>
                                <th scope="col" className="txt-left">사업장 명</th>
                                <th scope="col" className="txt-left">사업장 주소</th>
                                <th scope="col" className="hide">항목 삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(addLists) && addLists.map((list, idx) => (
                                <tr key={list.zoneId}>
                                    <td className="txt-left">{++idx}</td>
                                    <td className="txt-left">{list.companyName}</td>
                                    <td className="txt-left"><span className="icon-navi">{list.zoneName}</span></td>
                                    <td className="txt-left"><p className="ellipsis">{list.address}</p></td>
                                    <td>
                                        <button type="button" className="btn-delete-g" onClick={(e) => listDelete(list)}><span className="hide">항목 삭제</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="popup__footer right">
                <button type="button" className="js-close bg-linegray" onClick={(e) => closeBtn("pop-userjoin-info")}><span>취소</span></button>
                <button type="button" className="js-close" onClick={(e) => siteAdd(addLists)}><span>등록</span></button>
                {/* <button type="button" disabled><span>등록</span></button> */}

            </div>

            {/* <!-- //신규 가입자 정보 팝업 (웹,탭용 팝업) --> */}
        </>
    )
}


function EnabledPop(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const item = props.item;
    const enableType = props.enableType;
    const setReload = props.setReload;
    const setEnableItem = props.setEnableItem;

    async function onClickEnalbe(enableItem) {
        let data: any = null
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/user/${enableItem.userIdPk}/enable`,
            appQuery: {
                enabled: !enableItem.enabled
            },
            userToken: userInfo.loginInfo.token,

        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setReload(true);
                // console.log("data",data.body.enabled)
                setEnableItem(data.body.enabled);
                var btnCommentClose = document.getElementById("pop-enabled");
                var body = document.body
                var dimm = body.querySelector(".dimm");

                if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
                if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

                if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden")

            }
        }
    }

    return (
        <>
            {(item) &&
                <div className="popup__body">
                    <p className="fontMedium">해당 사용자를 {(enableType == true) ? "비활성화" : "활성화"}하시겠습니까?</p>
                    <p>{(enableType == true) ? "비활성화" : "활성화"} 시 사용자의 e-Health- Portal 사용이 {(enableType == true) ? "정지" : "승인"}  됩니다.</p>
                </div>
            }
            <div className="popup__footer">
                <button type="button" className="bg-gray" onClick={(e) => closeBtn("pop-enabled")}><span>취소</span></button>
                <button type="button" className="close" onClick={(e) => onClickEnalbe(item)}><span>확인</span></button>
            </div>

        </>
    )
}

function PassswordPop(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const item = props.item;
    const setReload = props.setReload;
    const password = props.password;

    const [passwordItem, setPaaswordItem] = useState(null)

    async function onClickDone(type) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/auth/user/${type.id}/password/init`,
            /*    appQuery: {
               }, */
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setPaaswordItem(data.body)
            }
        }


    }

    function onClickPwdDone(e) {
        var btnCommentClose = document.getElementById("pop-password");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");

        setPaaswordItem(null);
    }

    return (
        <>
            {(item) &&
                <div className="popup__body">
                    <p className="fontMedium">해당 사용자 패스워드가 초기화 {(!passwordItem) ? "하시겠습니까?" : "되었습니다."}</p>
                    {(passwordItem) && <p>초기화 비밀번호 : <b>{passwordItem.passwordInit}</b></p>}
                </div>
            }
            <div className="popup__footer">
                {(!passwordItem) &&
                    <button type="button" className="bg-gray" onClick={(e) => closeBtn("pop-password")}><span>취소</span></button>
                }
                {(!passwordItem) ?
                    <button type="button" className="close" onClick={(e) => onClickDone(password)}><span>확인</span></button>
                    :
                    <button type="button" className="close" onClick={(e) => onClickPwdDone(e)}><span>완료</span></button>
                }
            </div>

        </>
    )
}
function DeletePop(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const item = props.item;
    const setReload = props.setReload;
    const userDel = props.userDel;
    const addListResultData = props.addListResultData;
    const setAddListResultData = props.setAddListResultData;

    async function onClickDone(e, userDel) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "DELETE",
            appPath: `/api/v2/product/usertree/user/${item.userIdPk}`,
            appQuery: {
                productId: userDel.productId
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {

                alert("데이터가 삭제되었습니다.");
                setAddListResultData(addListResultData.filter(delList => delList.productId !== userDel.productId));
                var btnCommentClose = document.getElementById("pop-delete");
                var body = document.body
                var dimm = body.querySelector(".dimm");

                if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
                if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

                if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
            } else {
                // 기존 기기 존재 시
                if (data.codeNum == 9999) {
                    alert(data.body.errorList[0].msg);
                    var btnCommentClose = document.getElementById("pop-delete");
                    var body = document.body
                    var dimm = body.querySelector(".dimm");

                    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
                    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

                    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
                }
            }
        }
        /* 
        
         */
    }

    return (
        <>
            {(item) &&
                <div className="popup__body">
                    <p className="fontMedium">등록한 회사_사업장을 삭제하시겠습니까?</p>
                    {/* <p>초기화 비밀번호 : <b>{password.passwordInit}</b></p> */}
                </div>
            }
            <div className="popup__footer">
                <button type="button" className="bg-gray" onClick={(e) => closeBtn("pop-delete")}><span>취소</span></button>
                <button type="button" className="close" onClick={(e) => onClickDone(e, userDel)}><span>확인</span></button>
            </div>

        </>
    )
}
function RolePop(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const item = props.item;
    const setReload = props.setReload;
    const userTypeItme = props.userTypeItme;
    const addListResultData = props.addListResultData;
    const setAddListResultData = props.setAddListResultData;
    const setUserType = props.setUserType;
    const checked = props.checked;
    const setChecked = props.setChecked;
    const setUserLoad = props.setUserLoad;

    async function onClickDone(e, userTypeItme) {
        setUserType(userTypeItme);
        setChecked(checked)
        setAddListResultData([]);
        var btnCommentClose = document.getElementById("pop-role");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");

    }

    return (
        <>
            {(item) &&
                <div className="popup__body">
                    <p className="fontMedium">해당 사용자 타입을 변경하시겠습니끼?</p>
                    <p>변경 시 사용자에게 등록된  회사_사업장 목록이 초기화 됩니다.</p>
                </div>
            }
            <div className="popup__footer">
                <button type="button" className="bg-gray" onClick={(e) => closeBtn("pop-role")}><span>취소</span></button>
                <button type="button" className="close" onClick={(e) => onClickDone(e, userTypeItme)}><span>확인</span></button>
            </div>

        </>
    )
}


function closeBtn(type) {
    var btnCommentClose = document.getElementById(type);
    var body = document.body
    var dimm = body.querySelector(".dimm");

    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

}