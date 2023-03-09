/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-08-30
 * @brief EHP ManageMent - SiteManageMent 개발
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//utils
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import EhpPagination from "../../common/pagination/EhpPagination";
//
/**
 * @brief EHP ManageMent - ApprovalManageMent 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function SiteApprovalManageMent(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const setParentPopWin = props.setPopWin;
    //
    const [treeDto, setTreeDto] = useState([]);
    const [toggle, setToggle] = useState(false);
    const [list, setList] = useState(null);
    const [siteZoneName, setSiteZoneName] = useState("");
    const [siteAddress, setSiteAddress] = useState("");
    const [siteMemo, setSiteMemo] = useState("");
    const [companionTxt, setCompanionTxt] = useState("")
    const [sitePutDisplay, setSitePutDisplay] = useState(false);
    const [siteDisplayDone, setSiteDisplayDone] = useState(false);
    const [siteDisplayCompanion, setSiteDisplayCompanion] = useState(false);


    //
    const defaultPageInfo = { "size": 15, "totalElements": 0, "totalPages": 0, "number": 0 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    let appPath = '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    // 사업장 승인 요청 List
    const { data: data } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/usertree/zoneapprovallist?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });

    useEffect(() => {
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setTreeDto(data.body);
                setPageInfo(data.data.page);
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

    //사업장 승인 요청 API - pop List
    async function sitePop(e, list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/product/usertree/${list.id}/detail`,
            appQuery: {},
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {

                setList(data.body);
                setSiteZoneName(data.body.zone.zoneName)
                setSiteAddress(data.body.zone.address);
                setSiteMemo(data.body.zone.memo);
            }
        }
        CUTIL.jsopen_Popup(e)
    }
    // site pop
    useEffect(() => {
        if (CUTIL.isnull(list)) return;
        setParentPopWin("pop-workplace-ok",
            <SiteApprovalPop
                htmlHeader={<h1>사업장 승인 요청</h1>}
                list={list}
                sitePutDisplay={sitePutDisplay}
                siteZoneName={siteZoneName}
                setSiteZoneName={setSiteZoneName}
                siteAddress={siteAddress}
                setSiteAddress={setSiteAddress}
                siteMemo={siteMemo}
                setSiteMemo={setSiteMemo}
                siteDisplayDone={siteDisplayDone}
                siteDisplayCompanion={siteDisplayCompanion}
                companionTxt={companionTxt}
                setCompanionTxt={setCompanionTxt}

                //
                sitePut={sitePut}
                siteUpdate={siteUpdate}
                onDone={onDone}
                onCompanion={onCompanion}
                siteDone={siteDone}
                siteCompanion={siteCompanion}
            />
        )
    });

    function sitePut(e) {
        if (sitePutDisplay === false) {
            setSitePutDisplay(true);

        }
    }
    async function siteUpdate(e, list) {
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/product/company/zone/${list.zone.zoneId}/usertree/${list.id}`,
            appQuery: {
                companyId: list.company.companyId,
                zoneName: siteZoneName,
                address: siteAddress,
                memo: siteMemo
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setSitePutDisplay(false);
            }
        }
    }

    function onCompanion(e) {
        if (siteDisplayCompanion === false) {
            setSiteDisplayCompanion(true);
            setSiteDisplayDone(false);
        }
    }

    function onDone(e) {
        if (siteDisplayDone === false) {
            setSiteDisplayDone(true);
            setSiteDisplayCompanion(false);
            setCompanionTxt("");
        }
    }


    async function siteDone(e, list) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "POST",
            appPath: `/api/v2/product/usertree/user/${list.user.userIdPk}`,
            appQuery: {
                product: "zone",
                productName: list.zone.zoneName,
                productParentId: list.company.companyId,
                approval: 2,
                isontree: true
            },
            userToken: userInfo.loginInfo.token,
        });

        if (data) {
            if (data.codeNum == CONST.API_200) {
                alert("사업장 승인 요청이 완료 되었습니다.");
                window.location.reload();
            }
        }
    }

    async function siteCompanion(e, list) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "POST",
            appPath: `/api/v2/product/usertree/user/${list.user.userIdPk}`,
            appQuery: {
                product: "zone",
                productName: list.zone.zoneName,
                productParentId: list.company.companyId,
                approval: 0,
                deniedReason: companionTxt,
                isontree: true
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





    const treeList = (treeDto === null) ? null : treeDto;
    return (
        <>
            <div className="page-top more__detail" onClick={(e) => toggles(e)}>
                <h2>사업장 승인 요청</h2>
                <p className="user-num">{pageInfo.totalElements}</p>
            </div>
            {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
            <div className={`area__right_content detail__view  ${(toggle) ? "on" : ""}`}>
                <div className="tbl-list">
                    <table summary="사용자 타입,회사, 사업장,이름, 허용 요청 회사,허용 요청 사업장 항목으로 구성된 사업장 승인 요청 리스트 입니다.">
                        <caption>
                            사업장 승인 요청 리스트
                        </caption>
                        <colgroup>
                            {/* <col style="width: " /> */}
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="question txt-left js-open" data-pop="pop-user-type">
                                    <span>사용자 타입test</span>
                                </th>
                                <th scope="col" className="txt-left">회사test</th>
                                <th scope="col" className="txt-left d-sm-none">사업장test</th>
                                <th scope="col" className="txt-left">이름test</th>
                                <th scope="col" className="txt-left d-sm-none">허용 요청 회사test</th>
                                <th scope="col" className="txt-left pl-50 d-sm-none">허용 요청 사업장test</th>
                                <th scope="col">승인요청test</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="txt-left">Admin</td>
                                <td className="txt-left">LS전자</td>
                                <td className="txt-left d-sm-none"><p className="ellipsis">부산</p></td>
                                <td className="txt-left">bsKim</td>
                                <td className="txt-left d-sm-none"><p className="ellipsis">LS일렉트릭</p></td>
                                <td className={`txt-new txt-left pl-50 d-sm-none`}>
                                    <p className="ellipsis"><span>인천</span></p>
                                </td>
                                <td>
                                    <button type="button" className="bg-blue center js-open" data-pop="pop-workplace-ok" /* onClick={(e) => sitePop(e, list)} */><span data-pop="pop-workplace-ok">확인test</span></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {(pageInfo) && <EhpPagination
                    componentName={"StieApproval"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />}
            </div>

            {/* <SiteApprovalPop/> */}
            {/* <!-- 사업장 승인 요청 팝업 --> */}
            <div className="popup__body">
                <div className="tbl-list type2 mt-16">
                    <table summary="사용자 타입,회사,이름,E-mail(ID),연락처 항목으로 구성된 사업장 승인 요청자 정보 목록 입니다.">
                        <caption>
                            사업장 승인 요청자 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead className="d-sm-none">
                            <tr>
                                <th scope="col" className="txt-left">사용자 타입</th>
                                <th scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col" className="txt-left">E-mail(ID)</th>
                                <th scope="col" className="txt-left">연락처</th>
                            </tr>
                        </thead>
                        <tbody className="d-sm-none">
                            <tr>
                                <td className="txt-left">Admin</td>
                                <td className="txt-left">LS전자</td>
                                <td className="txt-left">부산</td>
                                <td className="txt-left">bsKim</td>
                                <td className="txt-left">01012345678</td>
                            </tr>
                        </tbody>
                        <tbody className="d-sm-block">
                            <tr>
                                <th scope="col" className="txt-left">사용자 타입</th>
                                <th scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                            </tr>
                            <tr>
                                <td className="txt-left">Admin</td>
                                <td className="txt-left">LS일렉트릭</td>
                                <td className="txt-left">bsKim</td>
                            </tr>
                            <tr>
                                <th scope="col" colSpan={2} className="txt-left">E-mail(ID)</th>
                                <th scope="col" className="txt-left">연락처</th>
                            </tr>
                            <tr>
                                <td className="txt-left" colSpan={2}>bsKim</td>
                                <td className="txt-left">01012345678</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="workplace__info">
                    <div className="img_workplace"><img src="" alt="" /></div>
                    <div className="txt_workplace">
                        <div className="page-top">
                            <h2>LS일렉트릭 인천 사업장</h2>
                            <div className="top-button">
                                {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}
                                <button type="button" className={`btn-edit  active`} ><span className="hide">수정</span></button>
                            </div>
                        </div>

                        <ul className="form__input" >
                            <li>
                                <p className="tit">회사 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" disabled defaultValue={"LS일렉트릭"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업장 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                        defaultValue={"인천"} />
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업장 주소</p>
                                <div className="input__area">
                                    <textarea className="h40" placeholder="사업장 주소를 입력하세요"
                                        defaultValue={"인천시 연수동 사업장"}
                                    ></textarea>
                                </div>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <div className="input__area">
                                    <textarea className="h66" placeholder="메모를 입력하세요" defaultValue={"인천시 연수동 사업장"}></textarea>
                                </div>
                            </li>
                            <li>
                                <div className="btn__wrap right w100p">
                                    <button type="button"><span>저장1</span></button>
                                </div>
                            </li>
                        </ul>

                        {/* <!--220901 정보영역, 승인여부, 반려사유입력 추가됨--> */}

                        <ul >
                            <li>
                                <p className="tit">회사 명</p>
                                <p className="txt">회사 명 테스트합니다</p>
                            </li>
                            <li>
                                <p className="tit">사업장 명</p>
                                <p className="txt">사업장 명을 테스트합니다</p>
                            </li>
                            <li>
                                <p className="tit">사업장 주소</p>
                                <p className="txt">사업장 주소를 테스트합니다</p>

                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <p className="txt h82">메모를 테스트합니다</p>
                            </li>
                            <li>
                                <p className="tit star mt-8">승인 여부</p>
                                <div className="btn__wrap">
                                    <button type="button" className={"bg-navy"} ><span>승인1</span></button>
                                    <button type="button" className={"bg-navy"}><span>반려1</span></button>
                                </div>
                            </li>
                            {(props.siteDisplayCompanion) &&
                                <li>
                                    <p className="tit star">반려 사유 입력</p>
                                    <div className="input__area">
                                        <textarea data-testid="textareaTest" placeholder="메모를 입력하세요" defaultValue={"요청이 반려되었습니다."}></textarea>
                                    </div>
                                </li>
                            }
                        </ul>

                    </div>
                </div>
            </div>
            <div className="popup__footer">
                {/* <!--비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                <button type="button" disabled><span>완료</span></button>
                <button type="button" ><span>완료1</span></button>
                <button type="button" ><span>완료2</span></button>
            </div>
            {/* </div> */}
            {/* <!-- //사업장 승인 요청 팝업 --> */}
        </>
    )
};


export default SiteApprovalManageMent;

function SiteApprovalPop(props) {
    const list = (props.list == null) ? null : props.list;


    return (
        <>
            {/* <!-- 사업장 승인 요청 팝업 --> */}
            <div className="popup__body">
                <div className="tbl-list type2 mt-16">
                    <table summary="사용자 타입,회사,이름,E-mail(ID),연락처 항목으로 구성된 사업장 승인 요청자 정보 목록 입니다.">
                        <caption>
                            사업장 승인 요청자 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead className="d-sm-none">
                            <tr>
                                <th scope="col" className="txt-left">사용자 타입</th>
                                <th scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col" className="txt-left">E-mail(ID)</th>
                                <th scope="col" className="txt-left">연락처</th>
                            </tr>
                        </thead>
                        <tbody className="d-sm-none">
                            <tr>
                                <td className="txt-left">{(list.user.role === "ROLE_ADMIN") ? "Admin" : (list.user.role === "ROLE_ENGINEER") ? "Engineer" : (list.user.role === "ROLE_USER") ? "User" : ""}</td>
                                <td className="txt-left">{list.user.userCompany}</td>
                                <td className="txt-left">{list.user.userName}</td>
                                <td className="txt-left">{list.user.userId}</td>
                                <td className="txt-left">{list.user.phoneNumber}</td>
                            </tr>
                        </tbody>
                        <tbody className="d-sm-block">
                            <tr>
                                <th scope="col" className="txt-left">사용자 타입</th>
                                <th scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                            </tr>
                            <tr>
                                <td className="txt-left">{(list.user.role === "ROLE_ADMIN") ? "Admin" : (list.user.role === "ROLE_ENGINEER") ? "Engineer" : (list.user.role === "ROLE_USER") ? "User" : ""}</td>
                                <td className="txt-left">{list.user.userCompany}</td>
                                <td className="txt-left">{list.user.userName}</td>
                            </tr>
                            <tr>
                                <th scope="col" colSpan={2} className="txt-left">E-mail(ID)</th>
                                <th scope="col" className="txt-left">연락처</th>
                            </tr>
                            <tr>
                                <td className="txt-left" colSpan={2}>{list.user.userId}</td>
                                <td className="txt-left">{list.user.phoneNumber}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="workplace__info">
                    <div className="img_workplace"><img src="" alt="" /></div>
                    <div className="txt_workplace">
                        <div className="page-top">
                            <h2>{list.company.companyName + " " + list.zone.zoneName} 사업장</h2>
                            <div className="top-button">
                                {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}
                                {(list.zone.approval == 1) &&
                                    <button type="button" className={`btn-edit ${(props.sitePutDisplay) ? "active" : ""}`} onClick={(e) => props.sitePut(e)}><span className="hide">수정</span></button>
                                }
                            </div>
                        </div>
                        {(props.sitePutDisplay) &&
                            <ul className="form__input" >
                                <li>
                                    <p className="tit">회사 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp1" disabled value={list.company.companyName} />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">사업장 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                            value={props.siteZoneName} onChange={(e) => props.setSiteZoneName(e.target.value)} />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">사업장 주소</p>
                                    <div className="input__area">
                                        <textarea className="h40" placeholder="사업장 주소를 입력하세요"
                                            value={props.siteAddress} onChange={(e) => props.setSiteAddress(e.target.value)}
                                        ></textarea>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <div className="input__area">
                                        <textarea className="h66" placeholder="메모를 입력하세요"
                                            value={props.siteMemo} onChange={(e) => props.setSiteMemo(e.target.value)}
                                        ></textarea>
                                    </div>
                                </li>
                                <li>
                                    <div className="btn__wrap right w100p">
                                        <button type="button" onClick={(e) => props.siteUpdate(e, list)}><span>저장</span></button>
                                    </div>
                                </li>
                            </ul>
                        }
                        {/* <!--220901 정보영역, 승인여부, 반려사유입력 추가됨--> */}
                        {(!props.sitePutDisplay) &&
                            <ul >
                                <li>
                                    <p className="tit">회사 명</p>
                                    <p className="txt">{list.company.companyName}</p>
                                </li>
                                <li>
                                    <p className="tit">사업장 명</p>
                                    {(props.siteZoneName) ?
                                        <p className="txt">{props.siteZoneName}</p>
                                        :
                                        <p className="txt">{list.zone.zoneName}</p>
                                    }
                                </li>
                                <li>
                                    <p className="tit">사업장 주소</p>
                                    {(props.siteAddress) ?
                                        <p className="txt">{props.siteAddress}</p>
                                        :
                                        <p className="txt">{list.zone.address}</p>
                                    }
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    {(props.siteMemo) ?
                                        <p className="txt h82">{props.siteMemo}</p>
                                        :
                                        <p className="txt h82">{list.zone.memo}</p>
                                    }
                                </li>
                                <li>
                                    <p className="tit star mt-8">승인 여부</p>
                                    <div className="btn__wrap">
                                        <button type="button" className={(props.siteDisplayDone) ? "bg-navy" : ""} onClick={(e) => props.onDone(e)}><span>승인</span></button>
                                        <button type="button" className={(props.siteDisplayCompanion) ? "bg-navy" : ""} onClick={(e) => props.onCompanion(e)}><span>반려</span></button>
                                    </div>
                                </li>
                                {(props.siteDisplayCompanion) &&
                                    <li>
                                        <p className="tit star">반려 사유 입력</p>
                                        <div className="input__area">
                                            <textarea placeholder="메모를 입력하세요" value={props.companionTxt} onChange={(e) => props.setCompanionTxt(e.target.value)}></textarea>
                                        </div>
                                    </li>
                                }
                            </ul>
                        }
                    </div>
                </div>
            </div>
            <div className="popup__footer">
                {/* <!--비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                {(props.siteDisplayCompanion && !props.companionTxt) &&
                    <button type="button" disabled><span>완료</span></button>
                }
                {(props.companionTxt) &&
                    <button type="button" onClick={(e) => props.siteCompanion(e, list)}><span>완료</span></button>
                }
                {(props.siteDisplayDone) &&
                    <button type="button" onClick={(e) => props.siteDone(e, list)}><span>완료</span></button>
                }
            </div>
            {/* </div> */}
            {/* <!-- //사업장 승인 요청 팝업 --> */}
        </>
    )
}
