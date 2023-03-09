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
    const [roleDto] = useState([
        { id: 0, value: "ROLE_ADMIN", fname: "Admin", /* active: false */ },
        { id: 1, value: "ROLE_ENGINEER", fname: "Engineer", /* active: false */ },
        { id: 2, value: "ROLE_USER", fname: "User", /* active: false */ },
        { id: 3, value: "ROLE_NONE", fname: "None", /* active: false */ },
    ]);
    const [role, setRole] = useState('');
    //
    const [users, setUsers] = useState([]);
    //
    // 승인 요청 
    const [list, setList] = useState("");
    const [userDto, setUserDto] = useState(null);
    const [approvalNo, setApprovalNo] = useState("");
    const [disPlay, setDisPlay] = useState(false);
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



    // 페이징
    // function handleCurPage(page) {
    //     setPageInfo({ ...pageInfo, number: page });
    // }
    // // 사업장 선택 API
    // const { data: zone, } = useAsync({
    //     promiseFn: HTTPUTIL.PromiseHttp,
    //     httpMethod: "GET",
    //     appPath: `/api/v2/user/zones`,
    //     appQuery: {
    //         companyName: selTree.company.companyName
    //     },
    //     userToken: userInfo.loginInfo.token,
    //     watch: selTree.company.companyName + selTree.reload
    // });

    // useEffect(() => {
    //     if (zone) {
    //         if (zone.codeNum == CONST.API_200) {
    //             setZoneSel(zone.body);
    //         }
    //     }
    // }, [zone]);


    // let appPath = "?companyName=" + selTree.company.companyId + '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    // // 사업장 조회
    // if (!CUTIL.isnull(zoneName) && (zoneName.length > 0)) {
    //     appPath = appPath + '&zoneName=' + zoneName;
    //     // clog("사업장 조회 : " + appPath);
    // }
    // // 사용자 Type 조회
    // if (!CUTIL.isnull(role) && (role.length > 0)) {
    //     appPath = appPath + '&role=' + role;
    //     // clog("사용자 Type 조회 : " + appPath);
    // }
    // const { data: data, isLoading } = useAsync({
    //     promiseFn: HTTPUTIL.PromiseHttp,
    //     httpMethod: "GET",
    //     appPath: `/api/v2/users${appPath}`,
    //     /*     appQuery: {
    //          companyName: appPath
    //        },  */
    //     userToken: userInfo.loginInfo.token,
    //     watch: appPath + selTree.reload
    // });

    // useEffect(() => {
    //     const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);

    //     if (ERR_URL.length > 0) navigate(ERR_URL);

    //     if (data) {
    //         if (data.codeNum == CONST.API_200) {
    //             setUsers(data.body);
    //             setPageInfo(data.data.page);

    //         }
    //     }
    // }, [data]);
    //


    // 신규 가입자 승인 요청 API
    async function approvalPop(e, list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/user/${list.userIdPk}`,
            appQuery: {
                approval: list.approval,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setList(data.body);
                setApprovalNo(data.body.approval);
                setDisPlay(false);
                CUTIL.jsopen_Popup(e);

            }
        }
        setUserDto(list);

    }
    // // <!-- 신규 가입 요청 팝업 --> 
    // useEffect(() => {
    //     setParentPopWin("pop-userjoin-ok",
    //         <RequestApproval
    //             htmlHeader={(userDto) && <h1>신규 가입자 _ {userDto.userName}</h1>}
    //             userInfo={userInfo}
    //             list={list}
    //             userDto={userDto}
    //             approval={approvalNo}
    //             addListResult={addListResult}
    //             checked={checked}
    //             setChecked={setChecked}
    //             userType={userType}
    //             disPlay={disPlay}
    //             companionTxt={companionTxt}
    //             setCompanionTxt={setCompanionTxt}
    //             roleDto={roleDto}
    //             errorList={errorList}
    //             //
    //             companySelect={companySelect}
    //             approvalChang={approvalChang}
    //             listDelete={listDelete}
    //             usertypeSelect={usertypeSelect}
    //             userApprovalDone={userApprovalDone}
    //             userApprovalDel={userApprovalDel}
    //             onCompanion={onCompanion}
    //             offCompanion={offCompanion}

    //         />
    //     )

    // });
    // <!-- 신규 가입자 정보 팝업 (웹,탭용 팝업) --> 
    // useEffect(() => {
    //     setParentPopWin("pop-userjoin-info",
    //         <SiteCeatePop
    //             htmlHeader={(userDto) && <h1>신규 가입자 _ {userDto.userName}</h1>}
    //             list={list}
    //             userDto={userDto}
    //             companyItem={companyItem}
    //             zoneItem={zoneItem}
    //             companyAdd={companyAdd}
    //             zoneAdd={zoneAdd}
    //             addLists={addLists}
    //             //
    //             companyClick={companyClick}
    //             zoneClick={zoneClick}
    //             listAdd={listAdd}
    //             listDelete={listDelete}
    //             siteAdd={siteAdd}
    //         //
    //         />
    //     )

    // });

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
    // 반려 display
    function onCompanion(e) {
        if (disPlay === false) {
            setDisPlay(true)
        }
    }
    // 승인 && approval=2 display
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
    function usertypeSelect(e, type) {
        setErrorList(
            errorList.filter((err) => (err.field !== "role"))
        )
        setUserType(type);

    }
    // 승인 완료 
    async function userApprovalDone(list, userType, addListResult) {
        let data: any = []
        for (let i = 0; i < addListResult.length; i++) {
            ;
            data = await HTTPUTIL.PromiseHttp({
                httpMethod: "PUT",
                appPath: `/api/v2/auth/user/${list.userIdPk}/roleusertree`,
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

                window.location.reload();

            } else {

                setErrorList(data.errorList);
            }
        }


    }
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
                window.location.reload();
            }
        }
    }
    /*   useEffect(() => {
        setParentPopWin("pop-userjoin-info",
          <SiteCeatePop
            htmlHeader={<h1>신규 가입자</h1>}
    
          //
          />
        )
    
      }); */

    //

    //
    const usersList = (users === null) ? null : users;
    // 중복제거 이벤트
    const addLists = addList.filter((arr, index, callback) => index === callback.findIndex(t => t.zoneId === arr.zoneId));
    return (
        <>
            {/* <!--area__right, 오른쪽 영역--> */}
            <div className="area__right_content workplace__info workplace__main info__input newtype">
                <div className="page-top">
                    <h2>마시는오트밀</h2>
                </div>
                <div className="tbl__top mb-16">
                    <div className="left">
                        <div className="searcharea">
                            <div className="searchinput">
                                <span className="mr-16"><strong>사업장</strong></span>
                                <div className="select w186" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
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
                                        <div className="selected-value" onClick={(e) => setRole("")}>전체</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        <li className="option">Admin</li>
                                        <li className="option">Engineer</li>
                                        <li className="option">User</li>
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
                                <th scope="col" className="sort asc txt-left"><span>등록 순</span></th>
                                {/* <!-- pl-22 클래스 : 레드 점 표시때문에 사용자타입 항목에만 들어감 (th, td 공통사항)--> */}
                                <th scope="col" className="sort asc txt-left pl-22"><span>사용자 타입</span></th>
                                <th scope="col" className="sort asc txt-left"><span>회사</span></th>
                                <th scope="col" className="sort asc txt-left d-sm-none"><span>사업장</span></th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col" className="txt-left d-lm-none">E-mail(ID)</th>
                                <th scope="col" className="txt-left d-lm-none">연락처</th>
                                <th scope="col" className="sort asc txt-left d-sm-none"><span>담당 사업장</span></th>
                                <th scope="col" className="sort asc txt-left d-lm-none"><span>마지막 로그인</span></th>
                                <th scope="col" className="sort asc txt-left"><span>승인상태</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((list, idx) => (
                                <tr key={"userMng_" + idx} className="js-open" data-pop={"pop-userjoin-ok"} onClick={(e) => approvalPop(e, list)}>
                                    <td className="txt-left" data-pop={"pop-userjoin-ok"} >{list.rowNumber}</td>
                                    {/* <!--(승인포함) 비활성화일경우 disabled 클래스 추가 --> */}
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""}  pl-22`} data-pop={"pop-userjoin-ok"}><span>{list.role}</span></td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""}`} data-pop={"pop-userjoin-ok"}>{list.companyName}</td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""} d-sm-none`}  >{list.zoneName}</td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""}`} data-pop={"pop-userjoin-ok"}>{list.userName}</td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""} d-lm-none`} data-pop={"pop-userjoin-ok"} ><p className="ellipsis" data-pop={"pop-userjoin-ok"} >{list.userId}</p></td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""} d-lm-none`} data-pop={"pop-userjoin-ok"} >{list.phoneNumber}</td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""} d-sm-none`} data-pop={"pop-userjoin-ok"} >{list.zoneCount}</td>
                                    <td className={`txt-left ${(list.enable == false && list.approval == 3) ? "icon-dot" : (list.enable == false) ? "disabled" : ""} d-lm-none`} data-pop={"pop-userjoin-ok"} ><p className="ellipsis" data-pop={"pop-userjoin-ok"} >{CUTIL.utc2time("YYYY-MM-DD", list.loginTime)}</p></td>
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

                />}
            </div>
            {/* <!--//area__right, 오른쪽 영역--> */}



            <div className={`popup__body alldisabled`}>
                <div className="left">
                    {/* <!--220902, h2 삭제--> */}
                    <ul className="form__input">
                        <li>
                            <p className="tit">E-mail (아이디)</p>
                            <div className="input__area">
                                <input type="text" id="inp1" defaultValue={"kor2@test.com"} />
                            </div>
                        </li>
                        <li>
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text" id="inp2" defaultValue={"박진이"} />
                            </div>
                        </li>
                        <li>
                            <p className="tit">연락처</p>
                            <div className="input__area">
                                <input type="text" id="inp3" defaultValue={"01055667788"} />
                            </div>
                        </li>
                        <li>
                            <p className="tit">회사</p>
                            <div className="input__area">
                                <input type="text" id="inp3" defaultValue={"마시는오트밀"} />
                            </div>
                        </li>
                        <li>
                            <p className="tit">사업장</p>
                            <div className="input__area">
                                <input type="text" id="inp3" defaultValue={"시베리아1사업장"} />
                            </div>
                        </li>
                        <li>
                            <p className="tit">부서</p>
                            <div className="input__area">
                                <input type="text" id="inp3" defaultValue={"엔지니어사업장"} />
                            </div>
                        </li>
                        {/* <!--220902, 승인여부 항목 추가--> */}

                        <li className="mt-45">
                            <p className="tit star mt-8">승인 여부</p>
                            <div className="btn__wrap">
                                <button type="button" className={"bg-navy"} /* onClick={(e) => props.offCompanion(e)} */><span>승인</span></button>
                                <button type="button" /* onClick={(e) => props.approvalChang(list.userIdPk)} */><span>승인</span></button>
                                <button type="button" className={"bg-navy"} /* onClick={(e) => props.onCompanion(e)} */><span>반려</span></button>
                            </div>
                        </li>
                        <li className="mt-45">
                            <p className="tit mt-8 txt-black">사용자 설정1</p>
                            <div className="btn__wrap left-right">
                                <button type="button" className={"btn-on"}>비활성화</button>
                                <button type="button" className={"btn-on"}>활성화</button>
                                <button type="button" className="btn txtline">패스워드 초기화</button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="right">
                    <ul className="form__input">
                        {/* <!--220902, 반려일 경우 반려사유 입력폼으로 교체 --> */}

                    </ul>
                </div>
            </div>

            <div className="popup__footer">
                {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                <button type="button"><span>완료</span></button>
            </div>
            {/* </div> */}
            {/* <!-- //신규 가입 요청 팝업 --> */}


            <div className="popup__body">
                <p className="fontMedium">해당 사용자 패스워드가 초기화 되었습니다.</p>
                <p>초기화 비밀번호 : <b>akklx(DaKPn</b></p>
            </div>

            <div className="popup__footer">
                <button type="button" className="bg-gray" /* onClick={(e) => closeBtn("pop-password")} */><span>취소</span></button>
                <button type="button" className="close" /* onClick={(e) => onClickDone(e)} */><span>확인</span></button>
            </div>
            <li>
                <p className="tit star question"><span>사용자 타입</span></p>
                <div className="input__area">
                    <div className={"radioBox input-error radioBox"}>

                        <label >
                            <input type="radio" name="rd" checked={props.checked} /* onChange={(e) => props.usertypeSelect(e, type.value)} */ />
                            Admin1
                        </label>
                        <label >
                            <input type="radio" name="rd" checked={props.checked} /* onChange={(e) => props.usertypeSelect(e, type.value)} */ />
                            Engineer
                        </label>
                        <label >
                            <input type="radio" name="rd" checked={props.checked} /* onChange={(e) => props.usertypeSelect(e, type.value)} */ />
                            User
                        </label>

                    </div>
                    <p className="input-errortxt"></p>
                </div>
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
                        {/*   <thead>
                            <tr>
                                <th scope="col" className="txt-left">No.</th>
                                <th scope="col" className="txt-left">회사 명</th>
                                <th scope="col" className="txt-left">사업장 명</th>
                                <th scope="col" className="hide">항목 삭제</th>
                            </tr>
                        </thead> */}
                        {/* <tbody>
                            
                                <tr key={list.zoneId}>
                                    <td className="txt-left">{++idx}</td>
                                    <td className="txt-left">{list.companyName}</td>
                                    <td className="txt-left"><span className="icon-navi">{list.zoneName}</span></td>
                                    <td>
                                        <button type="button" className="btn-delete-g" onClick={(e) => listDelete(list)}><span className="hide">항목 삭제</span></button>
                                    </td>
                                </tr>
                            
                        </tbody> */}
                    </table>
                </div>
            </li>

        </>
    );
}

//
//신규 가입자요청 팝업
function RequestApproval(props) {
    //props
    const list = (props.list == null) ? null : props.list;
    const userDto = (props.userDto == null) ? null : props.userDto;

    console.log("userDto", userDto);
    return (
        <>
            {(userDto) &&
                <div className={`popup__body ${(userDto.enable === true) ? "alldisabled" : ""}`}>
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
                                    <button type="button" className={"bg-navy"} /* onClick={(e) => props.offCompanion(e)} */><span>승인</span></button>
                                    <button type="button" /* onClick={(e) => props.approvalChang(list.userIdPk)} */><span>승인</span></button>
                                    <button type="button" className={"bg-navy"} /* onClick={(e) => props.onCompanion(e)} */><span>반려</span></button>
                                </div>
                            </li>
                            <li className="mt-45">
                                <p className="tit mt-8 txt-black">사용자 설정</p>
                                <div className="btn__wrap left-right">
                                    <button type="button" className={"btn-on"}><span className="hide">활성화</span></button>
                                    <button type="button" className="btn txtline"><span>패스워드 초기화1</span></button>
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

                            <li>
                                <p className="tit star question"><span>사용자 타입</span></p>
                                <div className="input__area">
                                    <div className={"radioBox input-error radioBox"}>
                                        <label >
                                            <input data-testid="radioAdmin" type="radio" defaultValue={"Admin"} />
                                            <input type="radio" defaultValue={"Engineer"} />
                                            <input type="radio" defaultValue={"User"} />
                                        </label>
                                    </div>
                                    <p className="input-errortxt"></p>
                                </div>
                            </li>
                            <li className="inline">
                                <p className="tit ">회사_사업장 목록</p>
                                {/* <!--웹 및 탭용 버튼--> */}
                                {(props.userType == "ROLE_USER") ?
                                    <button type="button" className="btn-basic js-open d-sm-none" data-pop="pop-userjoin-info"
                                        onClick={(e) => { CUTIL.jsopen_Popup(e), props.companySelect(e) }}>
                                        <span data-pop="pop-userjoin-info">추가</span>
                                    </button>
                                    :
                                    <button type="button" className="btn-basic" disabled><span>추가</span></button>
                                }
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

                                            <tr key={list.zoneId}>
                                                <td className="txt-left">1</td>
                                                <td className="txt-left">LS일렉트릭</td>
                                                <td className="txt-left"><span className="icon-navi">안양</span></td>
                                                <td>
                                                    <button type="button" className="btn-delete-g"/*  onClick={(e) => listDelete(list)} */><span className="hide">항목 삭제</span></button>
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            }
            <div className="popup__footer">
                {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                <button type="button"><span>완료</span></button>
            </div>
            {/* </div> */}
            {/* <!-- //신규 가입 요청 팝업 --> */}

        </>
    );
}
//신규 가입자 승인 
function IsSavedApproval(props) {
    const list = (props.list == null) ? null : props.list
    const addListResult = (props.addListResult == null) ? null : props.addListResult;
    const companySelect = props.companySelect
    const listDelete = props.listDelete;
    const roleDto = props.roleDto;
    const errorList = props.errorList;
    return (
        <>

            <li>
                <p className="tit star question"><span>사용자 타입</span></p>
                <div className="input__area">
                    <div className={(errorList.filter(err => (err.field === "role")).length > 0) ? "radioBox input-error" : "radioBox"}>
                        {roleDto.map((type) => (
                            <label id={"rd" + type.id} key={type.id}>
                                <input type="radio" id={"rd" + type.id} name="rd" checked={props.checked} onChange={(e) => props.usertypeSelect(e, type.value)} />
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
                {(props.userType == "ROLE_USER") ?
                    <button type="button" className="btn-basic js-open d-sm-none" data-pop="pop-userjoin-info"
                        onClick={(e) => { CUTIL.jsopen_Popup(e), props.companySelect(e) }}>
                        <span data-pop="pop-userjoin-info">추가</span>
                    </button>
                    :
                    <button type="button" className="btn-basic" disabled><span>추가</span></button>
                }
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

            {/* <div id="pop-userjoin-info" className="popup-layer js-layer hidden page-detail userjoin-ok">
               <div className="popup__head">
                   <h1>신규 가입자 정보 _ {list.userName}</h1>
                   <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
               </div> */}
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
            {/* </div> */}
            {/* <!-- //신규 가입자 정보 팝업 (웹,탭용 팝업) --> */}
        </>
    )
}