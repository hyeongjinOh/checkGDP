/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-08-30
 * @brief EHP ManageMent - CheckManageMent 개발
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

function CheckItemApproval(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const setParentPopWin = props.setPopWin;
    // /api/v2/users/role/engineer

    //
    const [toggle, setToggle] = useState(false);
    const [checkDto, setCheckDto] = useState([]);
    const [engineerList, setEngineerList] = useState([]);
    const [errorList, setErrorList] = useState([]);
    //
    const defaultPageInfo = { "size": 15, "totalElements": 0, "totalPages": 0, "number": 0 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

    let appPath = '&page=' + pageInfo.number + '&size=' + pageInfo.size;
    // 진단점검 요청  List
    const { data: data } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/panel/item/approvallist?${appPath}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
        watch: appPath
    });
    useEffect(() => {
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setCheckDto(data.body);
                setPageInfo(data.data.page);
            } else {
                setErrorList(data.body.errorList);
            }
        }
    })
    // Engineer List
    const { data: retData } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/users/role/engineer`,
        appQuery: {},
        userToken: userInfo.loginInfo.token,
    });
    useEffect(() => {
        if (retData) {
            if (retData.codeNum == CONST.API_200) {
                clog("IN ENGINEERLIST : RES : " + JSON.stringify(retData.body))
                setEngineerList(retData.body);
            } else {
                setErrorList([...errorList, retData.body.errorList]);
            }
        }
    });

    // 요청 완료 팝업
    function checkPop(e, list) {
        clog("IN CHECKPOP : FUNC : " + JSON.stringify(list));
        setParentPopWin("pop-casecheck-ok",
            <CheckApprovalPop
                htmlHeader={<h1>진단점검 요청</h1>}
                itemInfo={list}
                engineerList={engineerList}
            />
        )
        CUTIL.jsopen_Popup(e)
    }


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


    const checkList = (checkDto === null) ? null : checkDto;

    return (
        <>
            {/* <!--area__right-end, 제일 오른쪽 영역, 220902(2) 진단점검 승인 요청 작업--> */}
            <div className="page-top more__detail" onClick={(e) => toggles(e)}>
                <h2>진단점검 승인 요청</h2>
                <p className="user-num">{pageInfo.totalElements}</p>
            </div>
            {/* <!--area__right_content, 오른쪽 컨텐츠 영역--> */}
            <div className={`area__right_content detail__view  ${(toggle) ? "on" : ""}`}>
                <div className="tbl-list">
                    <table summary="기기 명, 모델 명, 담당자, 승인요청 항목으로 구성된 진단점검 승인 요청 리스트 입니다.">
                        <caption>
                            진단점검 승인 요청 리스트
                        </caption>
                        <colgroup>
                            <col style={{ "width": "" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col" className="txt-left">기기 명</th>
                                <th scope="col" className="txt-left">모델 명</th>
                                <th scope="col" className="txt-left">담당자</th>
                                <th scope="col">승인요청</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr key={"CHECK_"}>
                                {/* <!--이미지 이름이 각 상태 첫글자로 될 예정(디자인아직없음)// 기존 ehp-a,b,p 적용--> */}
                                <td className="txt-left"><span className={`checkstep   ehc-p `}></span></td>
                                <td className="txt-left">MoldTR</td>
                                <td className="txt-left"><p className="ellipsis">item275</p></td>
                                <td className="txt-left">bsKim</td>
                                <td>
                                    <button type="button" className="bg-blue center js-open" data-pop="pop-casecheck-ok" /* onClick={(e) => checkPop(e)} */><span data-pop="pop-casecheck-ok">요청 완료</span></button>
                                </td>
                            </tr>
                            <tr key={"CHECK"}>
                                {/* <!--이미지 이름이 각 상태 첫글자로 될 예정(디자인아직없음)// 기존 ehp-a,b,p 적용--> */}
                                <td className="txt-left"><span className={`checkstep   ehc-p `}></span></td>
                                <td className="txt-left">VCB</td>
                                <td className="txt-left"><p className="ellipsis">ITEM6</p></td>
                                <td className="txt-left">bsKimA</td>
                                <td>
                                    <button type="button" className="bg-navy center"><span>접수 완료</span></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {(pageInfo) && <EhpPagination
                    componentName={"CheckApproval"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />}
            </div>
            {/* <!--//area__right_content, 오른쪽 컨텐츠 영역--> */}
            {/* <!-- 220902(2) 진단점검 요청 팝업 (웹,탭용 팝업) --> */}
            <div className="popup__body layout-vertical">
                <h2><span className="checkstep ehc-p">P</span><span>LS일렉트릭 안양 사업장</span></h2>
                <div className="inline mb-16">
                    <p className="tit">사업장 주소</p>
                    <p>안양시</p>
                </div>
                <div className="tbl-list type2">
                    <table summary="상세사업장,전기실,기기 명,모델 명,시리얼 번호,담당자,점검 일자,평가점수,Report,Memo 항목으로 구성된 사업장 정보 목록 입니다.">
                        <caption>
                            사업장 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left">상세사업장</th>
                                <th scope="col" className="txt-left">전기실</th>
                                <th scope="col" className="txt-left">기기 명</th>
                                <th scope="col" className="txt-left">모델 명</th>
                                <th scope="col" className="txt-left">시리얼 번호</th>
                                <th scope="col" className="txt-left">담당자</th>
                                <th scope="col" className="txt-left">점검 일자</th>
                                <th scope="col" className="txt-left">평가점수</th>
                                <th scope="col">Report</th>
                                <th scope="col">Memo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="txt-left">1공장</td>
                                <td className="txt-left">전기실1</td>
                                <td className="txt-left">MoldTR</td>
                                <td className="txt-left"><p className="ellipsis">item275</p></td>
                                <td className="txt-left">773.3809523809524</td>
                                <td className="txt-left">bsKim</td>
                                <td className="txt-left">2022-09-08</td>
                                <td className="txt-left">
                                    <p>19</p>
                                    {/* <!--점수에 따라 high,middle,low--> */}
                                </td>
                                <td>
                                    <button type="button" className="btn btn-file"
                                    /* onClick={(e) => (itemDetailInfo.reportId !== null) && onClickReportDownload(e, itemDetailInfo)} */
                                    /* disabled={(itemDetailInfo.reportId !== null) ? false : true} */
                                    >
                                        <span className="hide" >파일다운로드</span>
                                    </button>
                                </td>
                                <td>
                                    <button type="button" className="btn btn-memo"
                                    /* disabled={(itemDetailInfo.memo !== null) ? false : true} */
                                    >
                                        <span className="hide">메모</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ul className="form__input inline mb-16 mt-40">
                    <li>
                        <label htmlFor="company">Engineer 검색</label>
                        <div className="input__area ml-0">
                            <div className="box__search">
                                <input type="text" placeholder="직접입력" />
                                <button type="button">
                                    <span className="hide">조회</span>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
                <div className="tbl-list type2">
                    <table summary="사용자 타입, 회사, 이름, E-mail(ID), 연락처 항목으로 구성된 Engineer 정보 목록 입니다.">
                        <caption>
                            Engineer 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left">사용자 타입</th>
                                <th scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col" className="txt-left">E-mail(ID)</th>
                                <th scope="col" className="txt-left">연락처</th>
                                <th scope="col" className="txt-left">배정 기기 수</th>
                                <th scope="col" className="hide">버튼</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="txt-left fontMedium">Engineer</td>
                                <td className="txt-left">LS일렉트릭	</td>
                                <td className="txt-left">bsKimH</td>
                                <td className="txt-left">barsk@hanmail.net</td>
                                <td className="txt-left">01012345678</td>
                                <td className="txt-left">7</td>
                                <td>
                                    <button type="button" className={"btn-basic btn-basic bg-navy"} ><span>선택</span></button>
                                    <button type="button" className="btn-basic bg-navy" /* onClick={(e) => engineerSelect(e, eng)} */ ><span>배정</span></button>
                                </td>
                            </tr>
                            <tr>
                                <td className="txt-left">검색된 Engineer가 없습니다.</td>
                                <td className="txt-left ">{""}</td>
                                <td className="txt-left">{""}</td>
                                <td className="txt-left">{""}</td>
                                <td className="txt-left ">
                                    <p className="icon-no gray"><span className="hide">파일없음</span></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="popup__footer">
                {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                <button type="button" disabled><span>확인</span></button>
            </div>
        </>
    )
};
export default CheckItemApproval;

//진단점검 요청 팝업
function CheckApprovalPop(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const itemInfo = props.itemInfo;
    const engineerList = props.engineerList;
    //
    const [itemDetailInfo, setItemDetailInfo] = useState(null);
    const [checkChange, setCheckChange] = useState(null);
    const [errorList, setErrorList] = useState([]);
    const [dispName, setDispName] = useState("");
    const [engName, setEngName] = useState("");

    // checkItem detail info
    const { data: retData } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/panel/item/detail`,
        appQuery: { "itemId": itemInfo.itemId },
        userToken: userInfo.loginInfo.token,
        watch: itemInfo.itemId
    });
    useEffect(() => {
        if (retData) {
            if (retData.codeNum == CONST.API_200) {
                clog("IN CHECKPOP : RES : " + JSON.stringify(retData.body))
                setItemDetailInfo(retData.body);
            } else {
                setErrorList(retData.body.errorList);
            }
        }
    })

    // PDF 다운로드
    async function onClickReportDownload(e, ckeckItem) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            "appPath": `/api/v2/report/${ckeckItem.reportId}`,
            "appQuery": {
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                // clog("IN COMUTILS : GET FILEDOWNLOAD : " + JSON.stringify(data));
                HTTPUTIL.fileDownload(`${ckeckItem.itemName}_진단점검리포트.PDF`, data.body.fileLink);
            } else {

            }
        }
    }

    // engineer 배정 on/off
    function engineerSelect(e, eng) {
        console.log(eng)
        if (checkChange != eng.userIdPk) {
            setCheckChange(eng.userIdPk)
        } else if (checkChange == eng.userIdPk) {
            setCheckChange(0)
        }

    }
    // 배정 완료 시 API
    async function engineerDone(itemId, userIdPk) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/engineer`,
            "appQuery": {
                "userIdPk": userIdPk,
                "itemId": itemId
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {

            if (data.codeNum == CONST.API_200) {
                console.log("IN COMUTILS : POST ENGINEERDONE : ", data);
                alert("담당자 배정 접수가 되었습니다.");
                window.location.reload();
            } else {
                alert(data.data.errorList[0].msg);
            }
        }
    }


    return (
        <>
            {/* <!-- 220902(2) 진단점검 요청 팝업 (웹,탭용 팝업) --> */}
            <div className="popup__body layout-vertical">
                <h2><span className="checkstep ehc-p">P</span><span>{itemDetailInfo.companyName + " " + itemDetailInfo.zoneName} 사업장</span></h2>
                <div className="inline mb-16">
                    <p className="tit">사업장 주소</p>
                    <p>{itemDetailInfo.zoneAddress}</p>
                </div>
                <div className="tbl-list type2">
                    <table summary="상세사업장,전기실,기기 명,모델 명,시리얼 번호,담당자,점검 일자,평가점수,Report,Memo 항목으로 구성된 사업장 정보 목록 입니다.">
                        <caption>
                            사업장 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left">상세사업장</th>
                                <th scope="col" className="txt-left">전기실</th>
                                <th scope="col" className="txt-left">기기 명</th>
                                <th scope="col" className="txt-left">모델 명</th>
                                <th scope="col" className="txt-left">시리얼 번호</th>
                                <th scope="col" className="txt-left">담당자</th>
                                <th scope="col" className="txt-left">점검 일자</th>
                                <th scope="col" className="txt-left">평가점수</th>
                                <th scope="col">Report</th>
                                <th scope="col">Memo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="txt-left">1공장</td>
                                <td className="txt-left">전기실1</td>
                                <td className="txt-left">MoldTR</td>
                                <td className="txt-left"><p className="ellipsis">item275</p></td>
                                <td className="txt-left">773.3809523809524</td>
                                <td className="txt-left">bsKim</td>
                                <td className="txt-left">2022-09-08</td>
                                <td className="txt-left">
                                    <p
                                        className={(itemDetailInfo.totalScore > 70)
                                            ? "score high" : (itemDetailInfo.totalScore <= 70) ? "score middle" : ""}
                                    >
                                        {itemDetailInfo.totalScore}
                                    </p>
                                    {/* <!--점수에 따라 high,middle,low--> */}
                                </td>
                                <td>
                                    <button type="button" className="btn btn-file"
                                    /* onClick={(e) => (itemDetailInfo.reportId !== null) && onClickReportDownload(e, itemDetailInfo)} */
                                    /* disabled={(itemDetailInfo.reportId !== null) ? false : true} */
                                    >
                                        <span className="hide" >파일다운로드</span>
                                    </button>
                                </td>
                                <td>
                                    <button type="button" className="btn btn-memo"
                                    /* disabled={(itemDetailInfo.memo !== null) ? false : true} */
                                    >
                                        <span className="hide">메모</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ul className="form__input inline mb-16 mt-40">
                    <li>
                        <label htmlFor="company">Engineer 검색</label>
                        <div className="input__area ml-0">
                            <div className="box__search">
                                <input type="text" placeholder="직접입력"
                                    value={dispName}
                                    onChange={(e) => setDispName(e.target.value)}
                                />
                                <button type="button"
                                    className="btn btn-search"
                                    onClick={(e) => setEngName(dispName)}
                                >
                                    <span className="hide">조회</span>
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
                <div className="tbl-list type2">
                    <table summary="사용자 타입, 회사, 이름, E-mail(ID), 연락처 항목으로 구성된 Engineer 정보 목록 입니다.">
                        <caption>
                            Engineer 정보 목록
                        </caption>
                        <colgroup>
                            <col style={{}} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col" className="txt-left">사용자 타입</th>
                                <th scope="col" className="txt-left">회사</th>
                                <th scope="col" className="txt-left">이름</th>
                                <th scope="col" className="txt-left">E-mail(ID)</th>
                                <th scope="col" className="txt-left">연락처</th>
                                <th scope="col" className="txt-left">배정 기기 수</th>
                                <th scope="col" className="hide">버튼</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="txt-left fontMedium">Engineer</td>
                                <td className="txt-left">LS일렉트릭	</td>
                                <td className="txt-left">bsKimH</td>
                                <td className="txt-left">barsk@hanmail.net</td>
                                <td className="txt-left">01012345678</td>
                                <td className="txt-left">7</td>
                                <td>
                                    <button type="button" className={"btn-basic btn-basic bg-navy"} ><span>선택</span></button>
                                    <button type="button" className="btn-basic bg-navy" /* onClick={(e) => engineerSelect(e, eng)} */ ><span>배정</span></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="popup__footer">
                {/* <!--220902 비활성화시 disabled 적용해서 쓰심됩니다.--> */}
                <button type="button" disabled><span>확인</span></button>
            </div>

        </>
    )
}


