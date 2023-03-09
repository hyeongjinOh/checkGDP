/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-08-30
 * @brief EHP ManageMent - userManageMent 개발
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
import { useTrans } from "../../../utils/langs/useTrans";
/**
 * @brief EHP ManageMent - userManageMent 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function UserApproval(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //화면 이동
    const navigate = useNavigate();
    const t = useTrans();
    //props
    const setParentPopWin = props.setPopWin;
    const roleDto = [
        { id: "0", value: "", fname: "전체", /* active: false */ },
        { id: "1", value: CONST.USERROLE_ADMIN, fname: "Admin", /* active: false */ },
        { id: "2", value: CONST.USERROLE_ENGINEER, fname: "Engineer", /* active: false */ },
        { id: "3", value: CONST.USERROLE_USER, fname: "User", /* active: false */ },
        { id: "4", value: CONST.USERROLE_NONE, fname: "Non-User", /* active: false */ },
    ];
    //Approval
    const [toggle, setToggle] = useState(false);
    const [load, setload] = useState(false);
    const [item, setitem] = useState(null);
    const [approvalNo, setApprovalNo] = useState("");
    const [reload, setReload] = useState(false);
    const [userDisplayDone, setUserDisplayDone] = useState(false);
    const [userDisplayCompanion, setUserDisplayCompanion] = useState(false);
    const [userLoad, setUserLoad] = useState(false);
    //ApprovalPop
    const [companyItem, setCompanyItem] = useState([]);
    const [zoneItem, setZoneItem] = useState([]);
    const [addListResult, setAddListResult] = useState([]);
    const [checked, setChecked] = useState(false);
    const [userType, setUserType] = useState("");
    const [companionTxt, setCompanionTxt] = useState("")
    const [errorList, setErrorList] = useState([])

    //ApprovalPop - site addPop
    const [companyAdd, setCompanyAdd] = useState([]);
    const [zoneAdd, setZoneAdd] = useState([]);
    const [addList, setAddList] = useState([])
    //
    const [totalCount, setTotalCount] = useState([])

    //
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    let appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
    let appPath2 = 'page=' + 0 + '&size=' + pageInfo.totalElements;
    //
    const [userDto, setUserDto] = useState([]);
    // 신규 가입자 List
    const { data: data, error, isLoading, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/users/approval?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath + reload + userLoad + load
    });

    useEffect(() => {
        // error page 이동
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);

        if (ERR_URL.length > 0) navigate(ERR_URL);

        if (data) {
            if (data.codeNum == CONST.API_200) {


                setUserDto(data.body);
                setPageInfo(data.data.page);
            }
        }
    }, [data]);


    const { data: totaldata, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/users/approval?${appPath2}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath2 + reload + userLoad + load
    });

    useEffect(() => {
        // error page 이동
        if (totaldata) {
            if (totaldata.codeNum == CONST.API_200) {
                setTotalCount(totaldata.body)
            }
        }
    }, [totaldata]);


    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }

    function toggles(e) {
        if (toggle === false) {
            setToggle(true);
        } else {
            setToggle(false);
        }
    }

    // 신규 가입자 승인 요청 API
    async function approvalPop(e, list) {
        CUTIL.jsopen_Popup(e);
        setitem(list)
        if (list.approval == 2) {
            setUserDisplayCompanion(false);
            setUserDisplayDone(true);
        } else {
            setUserDisplayCompanion(false);
        }
    }
    // <!-- 신규 가입 요청 팝업 --> 
    useEffect(() => {
        if (CUTIL.isnull(item)) return;
        setParentPopWin("pop-userjoin-ok",
            <RequestApproval
                htmlHeader={(item) && <h1>{(item.enabled == true) ? "신규 가입자 _ " + item.userName : "신규 가입자 _ " + item.userName + "(미인증)"}</h1>}
                htmlHeaderBtn={(item) && <button className="btn btn-close js-close" onClick={(e) => close(e)} ><span className="hide">닫기</span></button>}
                userInfo={userInfo}
                item={item}
                approvalNo={approvalNo}
                addListResult={addListResult}
                checked={checked}
                setChecked={setChecked}
                userType={userType}
                companionTxt={companionTxt}
                setCompanionTxt={setCompanionTxt}
                errorList={errorList}
                reload={reload}
                setReload={setReload}
                setload={setload}
                userDisplayDone={userDisplayDone}
                setUserDisplayDone={setUserDisplayDone}
                userDisplayCompanion={userDisplayCompanion}
                setUserDisplayCompanion={setUserDisplayCompanion}

                roleDto={roleDto}
                //
                companySelect={companySelect}
                approvalChang={approvalChang}
                listDelete={listDelete}
                usertypeSelect={usertypeSelect}
                userApprovalDone={userApprovalDone}
                onCompanion={onCompanion}
                onDone={onDone}

            />
        )

    });
    // <!-- 신규 가입자 정보 팝업 (웹,탭용 팝업) --> 
    useEffect(() => {
        setParentPopWin("pop-userjoin-info",
            <SiteCeatePop
                htmlHeader={(item) && <h1>신규 가입자 _ {item.userName}</h1>}
                item={item}
                companyItem={companyItem}
                zoneItem={zoneItem}
                companyAdd={companyAdd}
                zoneAdd={zoneAdd}
                addLists={addLists}
                //
                companyClick={companyClick}
                zoneClick={zoneClick}
                listAdd={listAdd}
                listDelete={listDelete}
                siteAdd={siteAdd}
            //
            />
        )

    });


    // 승인 API 
    async function approvalChang(list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/user/${list.userIdPk}/approval`,
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
    function onCompanion(e) {
        if (userDisplayCompanion === false) {
            setUserDisplayCompanion(true);
            setUserDisplayDone(false);

        } else if (item.enabled === false) {
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
                var company = document.getElementById("company");
                var companyhange = document.getElementById("company_change");
                var zone = document.getElementById("zone");
                var zoneChange = document.getElementById("zone_change");
                company.click();
                companyhange.classList.remove("hide");
                companyhange.click();
                companyhange.classList.add("hide");
                zone.click();
                zoneChange.classList.remove("hide");
                zoneChange.click();
                zoneChange.classList.add("hide");
            }
        }
    }
    //회사 선택 시 사업장 API 연계까지
    async function companyClick(e, company) {
        if (company) {
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
                    var zone = document.getElementById("zone");
                    var zoneChange = document.getElementById("zone_change");
                    zone.click();
                    zoneChange.classList.remove("hide");
                    zoneChange.click();
                    zoneChange.classList.add("hide");
                }
            }
        }
    }

    // 사업장 이벤트
    function zoneClick(e, zone) {
        setZoneAdd(zone)
    }
    //ApprovalPop - site addPop ListAdd
    function listAdd(e, companyAdd, zoneAdd, list) {
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
            setAddList([...addList, listVal]);
        }
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
        if (e.target.value !== CONST.USERROLE_USER) {
            addListResult.length
            setAddList([]);
            setAddListResult([]);
        }
    }


    // 승인 완료 
    async function userApprovalDone(list, userType, addListResult) {
        let data: any = []
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/auth/user/${list.userIdPk}/roleusertree`,
            appQuery: {
                role: userType,

                usertree:
                    addListResult.map((el) => (
                        {
                            product: "zone",
                            productName: el.zoneName,
                            productParentId: el.companyId,
                            approval: 2,
                            isontree: true
                        }
                    ))
            },
            userToken: userInfo.loginInfo.token,
        })
        if (data) {
            if (data.codeNum == CONST.API_200) {
                alert("사용자 승인 요청이 완료되었습니다.")
                setUserLoad(true);
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

    function close(e) {
        var btnCommentClose = document.getElementById("pop-userjoin-ok");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        /* 
                var radioCheck = document.getElementById("rd0");
                radioCheck.click() */
        setUserType((item.role == 0) ? "" : item.role);
        setChecked(false);
        setErrorList([]);
        setAddList([]);
        setAddListResult([]);
    }

    const userList = (userDto == null) ? null : userDto
    const approval = (totalCount == null) ? null : totalCount.filter((data) => (data.approval != 0) && (data.approval != 3)).length
    // 중복제거 이벤트
    const addLists = addList.filter((arr, index, callback) => index === callback.findIndex(t => t.zoneId === arr.zoneId));



    return (
        <>
            <div className="page-top more__detail" onClick={(e) => toggles(e)}>
                <h2>신규 가입자</h2>
                <p className="user-num">{approval}</p>
            </div>
            <div className={`area__left_content detail__view ${(toggle) ? "on" : ""}`} >
                <div className="tbl-list user-list hcal-vh-315" >
                    <table summary="회사,이름 항목으로 구성된 신규 가입자 리스트 입니다.">
                        <caption>
                            신규 가입자 리스트
                        </caption>
                        <colgroup>
                            <col style={{ "width": "" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left"><span>회사</span></th>
                                <th scope="col" className="txt-left"><span>이름</span></th>
                                <th scope="col"><span> 승인요청</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(userList) && userList.filter((list) => (list.approval != 0) && (list.approval != 3)).map((list) => (
                                <tr key={list.userIdPk}>
                                    <td className={`txt-left ${(list.enabled == false) && "icon-dot"} ${((list.enabled == false)) && "disabled"} `}>
                                        {list.companyName}
                                    </td>
                                    <td className={`txt-left ${(list.enabled == false) && "icon-dot"} ${((list.enabled == false)) && "disabled"} pl-22`}>
                                        <span>{list.userName}</span></td>
                                    <td>
                                        <button type="button" className="bg-blue center js-open" data-pop="pop-userjoin-ok" onClick={(e) => approvalPop(e, list)}><span data-pop="pop-userjoin-ok">확인</span></button>
                                    </td>
                                </tr>
                            ))}
                            {(userList) && userList.filter((list) => (list.approval != 0) && (list.approval == 3)).map((list) => (
                                <tr key={list.userIdPk}>
                                    <td className="txt-left">{list.companyName}</td>
                                    <td className="txt-left">{list.userName}</td>
                                    <td>
                                        <button type="button" className="bg-lightmoregray center" ><span>승인 완료</span></button>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(pageInfo) && <EhpPagination
                    componentName={"UserApproval"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                    dispLabel={t("LABEL.최근90일")}
                />}
            </div>

        </>
    )
}

export default UserApproval;

//신규 가입자요청 팝업
function RequestApproval(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const item = (props.item == null) ? null : props.item;
    const addListResultData = props.addListResultData;
    const companionTxt = props.companionTxt
    const userType = props.userType;
    const addListResult = props.addListResult;
    const setUserDel = props.setUserDel;
    const reload = props.reload;
    const userApprovalDone = props.userApprovalDone;
    const setUserType = props.setUserType;
    const checked = props.checked
    const setChecked = props.setChecked
    const setUserTypeItme = props.setUserTypeItme;
    const userDisplayDone = props.userDisplayDone;
    const userDisplayCompanion = props.userDisplayCompanion;
    const onDone = props.onDone;
    const approvalChang = props.approvalChang;
    const onCompanion = props.onCompanion;
    const setload = props.setload;
    //
    const [list, setList] = useState(null)
    // user item API
    const { data: data, isLoading } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/user/${item.userIdPk}`,
        userToken: userInfo.loginInfo.token,
        watch: item.userIdPk + reload
    });
    useEffect(() => {

        if (data) {
            if (data.codeNum == CONST.API_200) {
                setList(data.body);
            }
        }
    }, [data]);

    //


    // 반려 완료
    async function userApprovalDel(list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/user/${list.userIdPk}/approval`,
            appQuery: {
                approval: 0,
                deniedReason: companionTxt

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                alert("메일 전송이 완료되었습니다.");
                setload(true);
                var btnCommentClose_mng = document.getElementById("pop-userjoin-ok");
                var body = document.body
                var dimm = body.querySelector(".dimm");

                if (!CUTIL.isnull(btnCommentClose_mng)) btnCommentClose_mng.classList.add("hidden");
                if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
            }
        }
    }


    return (
        <>
            {(list) &&
                <div className={`popup__body ${(item.enabled === false) ? "alldisabled" : ""}`}>
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
                            <li>
                                <p className="tit">업종</p>
                                <div className="input__area">
                                    <input type="text" id="inp7" value={list.classification} disabled />
                                </div>
                            </li>
                            {/* <!--220902, 승인여부 항목 추가--> */}
                            <li className="mt-45">
                                <p className="tit star mt-8">승인 여부</p>
                                <div className="btn__wrap">
                                    {(list.approval == 2) && (item.enabled == true) &&
                                        <button type="button" className={(userDisplayDone) ? "bg-navy" : ""} onClick={(e) => onDone(e)}><span>승인</span></button>
                                    }
                                    {(list.approval == 1) && (item.enabled == true) &&
                                        <button type="button" onClick={(e) => approvalChang(list)}><span>승인</span></button>
                                    }
                                    <button type="button" className={(userDisplayCompanion) ? "bg-navy" : ""} onClick={(e) => onCompanion(e)}><span>반려</span></button>
                                </div>
                            </li>

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

                            {(list.approval != 1 && userDisplayDone && item.enabled == true) &&
                                <IsSavedApproval
                                    list={list}
                                    addListResult={props.addListResult}
                                    errorList={props.errorList}
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
            }
            {(list) &&
                < div className="popup__footer">
                    {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                    {(userDisplayCompanion && props.companionTxt) ?
                        <button type="button" onClick={(e) => userApprovalDel(list)}><span>완료</span></button>
                        : (userDisplayDone && list.approval == 2) ?
                            <button type="button" onClick={(e) => userApprovalDone(list, userType, addListResult)}><span>완료</span></button>
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
    const checked = props.checked;
    const listDelete = props.listDelete;
    const roleDto = props.roleDto;
    const errorList = props.errorList;
    const userType = props.userType;
    //


    return (
        <>

            <li>
                <p className="tit star question"><span>사용자 타입</span></p>
                <div className="input__area">
                    <div className={(errorList.filter(err => (err.field === "role")).length > 0) ? "radioBox input-error" : "radioBox"}>
                        <label id={"rd_" + roleDto[0].id} className="hide">
                            <input type="radio" id={"rd_" + roleDto[0].id} name="rd" value={roleDto[0].value} checked={!checked} onChange={(e) => props.usertypeSelect(e)} />
                        </label>
                        {roleDto.filter((type) => (type.id != 4) && (type.id != 0)).map((type) => (
                            <label id={"rd_" + type.id} key={type.id}>
                                {(list.enabled == false) ?
                                    <input type="radio" disabled id={"rd_" + type.id} name="rd" />
                                    :
                                    <input type="radio" id={"rd_" + type.id} name="rd" value={(type.value === userType) ? type.value : type.value} checked={(userType === type.value) ? true : false} onChange={(e) => props.usertypeSelect(e)} />
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
                {(userType == roleDto[3].value) ?
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
                            {(addListResult) && addListResult.map((list, idx) => (
                                <tr key={list.zoneId}>
                                    <td className="txt-left">{++idx}</td>
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
                            <div id="company" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected">
                                    <div className="selected-value">클릭하여 선택해주세요</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul className="hmax-385">
                                    {/* 초기화용 */}
                                    <li id="company_change" className="option hide" onClick={(e) => companyClick(e, "")}>클릭하여 선택해주세요</li>
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
                            <div id="zone" className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                <div className="selected">
                                    <div className="selected-value">클릭하여 선택해주세요</div>
                                    <div className="arrow"></div>
                                </div>
                                <ul className="hmax-385">
                                    {/* 초기화용 */}
                                    <li id="zone_change" className="option hide" onClick={(e) => zoneClick(e, "")}>클릭하여 선택해주세요</li>

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

function closeBtn(type) {
    var btnCommentClose = document.getElementById(type);
    var body = document.body
    var dimm = body.querySelector(".dimm");

    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: hidden;");
    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: block; z-index: 30;");

}