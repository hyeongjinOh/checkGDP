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
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import EhpPagination from "../../common/pagination/EhpPagination";

/**
 * @brief EHP ManageMent - userManageMent 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function NewSubscriberApprovalManageMnet(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    //props
    const setParentPopWin = props.setPopWin;

    //Approval
    const [toggle, setToggle] = useState(false);
    const [list, setList] = useState("");
    const [approvalNo, setApprovalNo] = useState("");
    const [titiel, setTitle] = useState("");
    const [disPlay, setDisPlay] = useState(false);
    //ApprovalPop
    const [companyItem, setCompanyItem] = useState([]);
    const [zoneItem, setZoneItem] = useState([]);
    const [addListResult, setAddListResult] = useState([]);
    const [userType, serUserType] = useState("");
    const [companionTxt, setCompanionTxt] = useState("")
    const [errorList, setErrorList] = useState([])

    //ApprovalPop - site addPop
    const [companyAdd, setCompanyAdd] = useState([]);
    const [zoneAdd, setZoneAdd] = useState([]);
    const [addList, setAddList] = useState([])

    //
    const defaultPageInfo = { "size": 15, "totalElements": 0, "totalPages": 0, "number": 0 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    let appPath = '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    //
    const [userDto, setUserDto] = useState([]);
    // 신규 가입자 List
    const { data: data } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/users?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });

    useEffect(() => {
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setUserDto(data.body);
                setPageInfo(data.data.page);
                setTitle(data.body.userName);
            }
        }
    }, [data]);

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
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/user/${list.userIdPk}`,
            appQuery: {
                approval: 2,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setList(data.body);
                setApprovalNo(data.body.approval);
                setDisPlay(false);
            }
        }

        CUTIL.jsopen_Popup(e)
    }
    // 승인 API 
    async function approvalChang(userIdPK) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/user/${userIdPK}/approval`,
            appQuery: {
                approval: 2
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                // console.log("data", data)
                setApprovalNo(data.body.approval);
            }
        }
    }

    function onCompanion(e) {
        if (disPlay === false) {

            setDisPlay(true)
        }
    }
    function offCompanion(e) {
        if (disPlay === true) {

            setDisPlay(false)
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
            }
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
            }
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
    function usertypeSelect(type) {
        setErrorList(
            errorList.filter((err) => (err.field !== "role"))
        )
        serUserType(type);
    }

    async function userApprovalDone(list, userType, addListResult) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/auth/user/${list.userIdPk}/role`,
            appQuery: {
                role: userType
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {

                if (addListResult != "") {
                    siteList(addListResult);
                    alert("사용자 승인 요청과 사업장 등록이 완료 되었습니다.");
                } else {
                    alert("사용자 승인 요청이 완료되었습니다.");
                }

                window.location.reload();

            } else {

                setErrorList(data.errorList);
            }
        }


    }


    async function siteList(addListResult) {

        let data: any = [];
        for (let i = 0; i < addListResult.length; i++) {
            data = await HTTPUTIL.PromiseHttp({
                httpMethod: "POST",
                appPath: `/api/v2/product/usertree/user/${addListResult[i].userIdPk}`,//${addLists[0].userIdPk}`,
                appQuery: {
                    product: "zone",
                    productName: addListResult[i].companyName,
                    productParentId: addListResult[i].companyId,
                    approval: 2,
                    isontree: true
                },
                userToken: userInfo.loginInfo.token,
            });
        }



    }



    /*      useEffect(() => {
     
             setParentPopWin("pop-userjoin-ok",
                 <RequestApproval
                     // htmlHeader={props.htmlHeader}
                     list={list}
                     approval={approvalNo}
                     addListResult={addListResult}
                     userType={userType}
                     disPlay={disPlay}
                     companionTxt={companionTxt}
                     setCompanionTxt={setCompanionTxt}
                     errorList={errorList}
                     //
                     companySelect={companySelect}
                     approvalChang={approvalChang}
                     listDelete={listDelete}
                     usertypeSelect={usertypeSelect}
                     userApprovalDone={userApprovalDone}
                     userApprovalDel={userApprovalDel}
                     onCompanion={onCompanion}
                     offCompanion={offCompanion}
                 />
             )
         });*/

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
                alert("반려 요청이 완료되었습니다. 메일을 확인 해주세요");
                window.location.reload();
            }
        }
    }


    const userList = (userDto == null) ? null : userDto
    const approval = (userDto == null) ? null : userDto.filter((data) => (data.approval != 0) && (data.approval != 3)).length

    // 중복제거 이벤트
    const addLists = addList.filter((arr, index, callback) => index === callback.findIndex(t => t.zoneId === arr.zoneId));
    // console.log("addListResult", addLists);

    return (
        <>
            <div className="page-top more__detail" onClick={(e) => toggles(e)}>
                <h2>신규 가입자</h2>
                <p className="user-num">{approval}</p>
            </div>
            <div className={`area__left_content detail__view ${(toggle) ? "on" : ""}`} >
                <div className="tbl-list" >
                    <table summary="회사,이름 항목으로 구성된 신규 가입자 리스트 입니다.">
                        <caption>
                            신규 가입자 리스트
                        </caption>
                        <colgroup>
                            <col style={{ "width": "" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th data-testid="testid_comp" scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col">승인요청</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {(userList) && userList.filter((list) => (list.approval != 0) && (list.approval != 3)).map((list) => ( */}
                            <tr>
                                <td className="txt-left">LS일렉트릭</td>
                                <td className="txt-left">김산전</td>
                                <td>
                                    <button data-testid="ButtonId" type="button" className="bg-blue center js-open" data-pop="pop-userjoin-ok" onClick={(e) => approvalPop(e, list)}><span data-pop="pop-userjoin-ok">확인</span></button>
                                </td>
                            </tr>
                            {/* ))} */}
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
                    componentName={"NewSubscriberApproval"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />}
            </div>
            <li className="inline">
                <p className="tit star">반려 사유 입력</p>
            </li>
            <li>
                <div className="input__area w100p">
                    <textarea placeholder="메모를 입력하세요" value={props.companionTxt} onChange={(e) => props.setCompanionTxt(e.target.value)}></textarea>
                </div>
            </li>
            <div id="pop-userjoin-ok" className="popup-layer js-layer layer-out hidden page-detail userjoin-ok">
                <div className="popup__head">
                    <h1>신규 가입자 _ 김산전</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>

                <div className="popup__body">
                    <div className="left">
                        {/* <!--220902, h2 삭제--> */}
                        <ul className="form__input">
                            <li>
                                <p className="tit">E-mail (아이디)</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" defaultValue={"test@ls-electric.com"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">이름</p>
                                <div className="input__area">
                                    <input type="text" id="inp2" defaultValue={"김산전"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">연락처</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={"01045698745"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">회사</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={"LS일렉트릭"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업장</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={"청주"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">부서</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={"test"} />
                                </div>
                            </li>
                            {/* <!--220902, 승인여부 항목 추가--> */}
                            <li className="mt-45">
                                <p className="tit star mt-8">승인 여부</p>
                                <div className="btn__wrap">
                                    <button type="button" className={(props.disPlay) ? "" : "bg-navy"} ><span>승인1</span></button>
                                    <button type="button" className={(props.disPlay) ? "bg-navy" : ""}><span>반려1</span></button>

                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="right">
                        <ul className="form__input">
                            {/* <!--220902, 반려일 경우 반려사유 입력폼으로 교체 --> */}
                            {(props.disPlay) &&
                                <Companion
                                    companionTxt={props.companionTxt}
                                    setCompanionTxt={props.setCompanionTxt}
                                />
                            }

                            {(props.approval == 2 && !props.disPlay) &&
                                <IsSavedApproval
                                    list={list}
                                    addListResult={props.addListResult}
                                    errorList={props.errorList}
                                    //
                                    companySelect={props.companySelect}
                                    usertypeSelect={props.usertypeSelect}
                                    listDelete={props.listDelete}
                                />
                            }
                        </ul>
                    </div>
                </div>
                <div className="popup__footer">
                    {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                    {(props.disPlay && props.companionTxt) ?
                        <button type="button" onClick={(e) => props.userApprovalDel(list)}><span>완료</span></button>
                        : (!props.disPlay && props.approval == 2) ?
                            <button type="button" onClick={(e) => props.userApprovalDone(list, props.userType, props.addListResult)}><span>완료</span></button>
                            :
                            <button type="button" disabled><span>완료</span></button>

                    }
                </div>
            </div>
            {/* <!-- //신규 가입 요청 팝업 --> */}
            {/* <!-- 신규 가입 요청 팝업 --> */}
            <RequestApproval
                userInfo={userInfo}
                list={list}
                approval={approvalNo}
                addListResult={addListResult}
                userType={userType}
                disPlay={disPlay}
                companionTxt={companionTxt}
                setCompanionTxt={setCompanionTxt}
                errorList={errorList}
                //
                companySelect={companySelect}
                approvalChang={approvalChang}
                listDelete={listDelete}
                usertypeSelect={usertypeSelect}
                userApprovalDone={userApprovalDone}
                userApprovalDel={userApprovalDel}
                onCompanion={onCompanion}
                offCompanion={offCompanion}
            />

            {/* <!-- 신규 가입자 정보 팝업 (웹,탭용 팝업) --> */}
            <SiteCeatePop
                list={list}
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
        </>
    )
}

export default NewSubscriberApprovalManageMnet;



function RequestApproval(props) {
    //props
    const list = (props.list == null) ? null : props.list;


    return (
        <>
            <div id="pop-userjoin-ok" className="popup-layer js-layer layer-out hidden page-detail userjoin-ok">
                <div className="popup__head">
                    <h1>신규 가입자 _ {list.userName}</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>

                <div className="popup__body">
                    <div className="left">
                        {/* <!--220902, h2 삭제--> */}
                        <ul className="form__input">
                            <li>
                                <p className="tit">E-mail (아이디)</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" defaultValue={list.userId} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">이름</p>
                                <div className="input__area">
                                    <input type="text" id="inp2" defaultValue={list.userName} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">연락처</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={list.phoneNumber} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">회사</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={list.companyName} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업장</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={list.zoneName} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">부서</p>
                                <div className="input__area">
                                    <input type="text" id="inp3" defaultValue={list.department} />
                                </div>
                            </li>
                            {/* <!--220902, 승인여부 항목 추가--> */}
                            <li className="mt-45">
                                <p className="tit star mt-8">승인 여부</p>
                                <div className="btn__wrap">
                                    {(props.approval == 2) ?
                                        <button type="button" className={(props.disPlay) ? "" : "bg-navy"} onClick={(e) => props.offCompanion(e)}><span>승인</span></button>
                                        :
                                        <button type="button" onClick={(e) => props.approvalChang(list.userIdPk)}><span>승인</span></button>
                                    }
                                    {
                                        <button type="button" className={(props.disPlay) ? "bg-navy" : ""} onClick={(e) => props.onCompanion(e)}><span>반려</span></button>
                                    }
                                </div>
                            </li>
                            <li className="inline">
                                <p className="tit star">반려 사유 입력</p>
                            </li>
                            <li>
                                <div className="input__area w100p">
                                    <textarea placeholder="메모를 입력하세요" defaultValue={"안녕하세요 반려 테스트입니다. 반려되었습니다."} ></textarea>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="right">
                        <ul className="form__input">
                            {/* <!--220902, 반려일 경우 반려사유 입력폼으로 교체 --> */}
                            {(props.disPlay) &&
                                <Companion
                                    companionTxt={props.companionTxt}
                                    setCompanionTxt={props.setCompanionTxt}
                                />
                            }

                            {(props.approval == 2 && !props.disPlay) &&
                                <IsSavedApproval
                                    list={list}
                                    addListResult={props.addListResult}
                                    errorList={props.errorList}
                                    //
                                    companySelect={props.companySelect}
                                    usertypeSelect={props.usertypeSelect}
                                    listDelete={props.listDelete}
                                />
                            }
                        </ul>
                    </div>
                </div>
                <div className="popup__footer">
                    {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                    {(props.disPlay && props.companionTxt) ?
                        <button type="button" onClick={(e) => props.userApprovalDel(list)}><span>완료</span></button>
                        : (!props.disPlay && props.approval == 2) ?
                            <button type="button" onClick={(e) => props.userApprovalDone(list, props.userType, props.addListResult)}><span>완료</span></button>
                            :
                            <button type="button" disabled><span>완료</span></button>

                    }
                </div>
            </div>
            {/* <!-- //신규 가입 요청 팝업 --> */}

        </>
    );
}

function IsSavedApproval(props) {
    const list = (props.list == null) ? null : props.list
    const addListResult = (props.addListResult == null) ? null : props.addListResult;
    const companySelect = props.companySelect
    const listDelete = props.listDelete;
    const errorList = props.errorList;
    return (
        <>

            <li>
                <p className="tit star question"><span>사용자 타입</span></p>
                <div className="input__area">
                    <div className={(errorList.filter(err => (err.field === "role")).length > 0) ? "radioBox input-error" : "radioBox"}>

                        <label htmlFor="rd1"><input type="radio" id="rd1" name="rd" onChange={(e) => props.usertypeSelect("ROLE_ADMIN")} />Admin</label>
                        <label htmlFor="rd2"><input type="radio" id="rd2" name="rd" onChange={(e) => props.usertypeSelect("ROLE_USER")} />User</label>
                        <label htmlFor="rd3"><input type="radio" id="rd3" name="rd" onChange={(e) => props.usertypeSelect("ROLE_ENGINEER ")} />Engineer</label>
                    </div>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "role")).map((err) => err.msg)}</p>
                </div>
            </li>
            <li className="inline">
                <p className="tit star">Sites</p>
                {/* <!--웹 및 탭용 버튼--> */}
                <button type="button" className="btn-basic js-open d-sm-none" data-pop="pop-userjoin-info" onClick={(e) => { CUTIL.jsopen_Popup(e), companySelect(e) }}><span data-pop="pop-userjoin-info">추가</span></button>
                {/* <!--모바일용 버튼 / (767px 이하에서는 이 버튼이 나와야 함)--> */}
                <button type="button" className="btn-basic js-open d-sm-block" data-pop="pop-userjoin-info-mobile"><span>추가</span></button>
            </li>
            <li>
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

function SiteCeatePop(props) {
    //props
    const list = (props.list == null) ? null : props.list;
    const companyItems = (props.companyItem === null) ? null : props.companyItem;
    const zoneItems = (props.zoneItem === null) ? null : props.zoneItem;
    const addLists = (props.addLists === null) ? null : props.addLists;

    //
    const companyAdd = props.companyAdd;
    const zoneAdd = props.zoneAdd;
    //
    const companyClick = props.companyClick;
    const zoneClick = props.zoneClick;
    const listAdd = props.listAdd;
    const listDelete = props.listDelete;
    const siteAdd = props.siteAdd;

    return (
        <>

            <div id="pop-userjoin-info" className="popup-layer js-layer hidden page-detail userjoin-ok">
                <div className="popup__head">
                    <h1>신규 가입자 정보 _ {list.userName}</h1>
                    <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                </div>
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
                                    <ul>
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
                                    <ul>
                                        {zoneItems.map((list) => (
                                            <li key={list.zoneId} className="option" onClick={(e) => zoneClick(e, list)}>{list.zoneName}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <button type="button" className="btn-basic ml-18" onClick={(e) => listAdd(e, companyAdd, zoneAdd, list)}><span>추가</span></button>
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
                                {addLists.map((list, idx) => (
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
                    <button type="button" className="js-close bg-linegray"><span>취소</span></button>
                    <button type="button" className="js-close" onClick={(e) => siteAdd(addLists)}><span>등록</span></button>
                    {/* <button type="button" disabled><span>등록</span></button> */}

                </div>
            </div>
            {/* <!-- //신규 가입자 정보 팝업 (웹,탭용 팝업) --> */}
        </>
    )
}


