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
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

//component
function ZoneList(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const isMobile = props.isMobile;
    const setParentIsMobile = props.setIsMobile;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentAdminType = props.setAdminType;

    const setParentPopWin = props.setPopWin;
    //
    const companyInfo = props.companyInfo;
    //const zoneList = companyInfo.zone;
    //
    //화면 이동
    const navigate = useNavigate();
    //mobile check
    /*const mobileRef = useRef(null); // Mobile Check용
    useEffect(() => { // resize handler
      function handleResize() {
        if (CUTIL.isnull(mobileRef)) return;
        const mobileTag = mobileRef.current;
        if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
          setParentIsMobile(true);
        } else {
          setParentIsMobile(false);
        }
      }
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      }
    }, []);
    useEffect(() => { // re-rendering mobile check
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if (!CUTIL.isnull(mobileTag)) {
        if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
          setParentIsMobile(true);
        } else {
          setParentIsMobile(false);
        }
      }
    }, []);*/

    ////////////////////////////////////////////////////////////////////////////
    function onClickZoneViewPopup(e, zone) {
        clog("onClickZoneViewPopup : " + JSON.stringify(zone));
        setParentPopWin("pop-listbox-detail",
            <ZoneViewPopup
                htmlHeader={<h1>사업장 상세 정보</h1>}
                zoneInfo={zone}
                companyInfo={companyInfo}
                setSelTree={props.setSelTree}
                setWorkMode={props.setWorkMode}
                setPopWin={props.setPopWin}
            />
        );
        CUTIL.jsopen_Popup(e);
    }
    return (
        <>
            {/*<!--정보하단(라인아래)-->*/}
            <div className="content__info boxlist">
                <div className="column">
                    <div className="listbox__top">
                        <h3>사업장</h3>
                        <button type="button" className="add__item"><span>사업장 추가</span></button>
                    </div>
                    <div className="listbox__area">

                        <div className="listbox">
                            <div className="box__top">
                                <p>안양</p>
                                <button type="button"
                                    className="btn-go js-open"
                                    data-pop="pop-listbox-detail"
                                /* onClick={(e) => onClickZoneViewPopup(e, zone)} */
                                >
                                    <span className="hide">자세히보기</span>
                                </button>
                            </div>
                            <div className="box__bottom">
                                <div className="left img_workplace">


                                </div>
                                <div className="right">
                                    <ul>
                                        <li>
                                            <span>상세사업장</span>
                                            <span><strong>38</strong>개</span>
                                        </li>
                                        <li>
                                            <span>등록 기기</span>
                                            <span><strong>141</strong>개</span>
                                        </li>
                                        <li>
                                            <span>User</span>
                                            <span><strong>10</strong>명</span>
                                        </li>
                                    </ul>
                                    <ul>
                                        <li><p className="tit">진단 점수 기준</p></li>
                                        <li>
                                            <div className="result__score">
                                                <p className="tit caution">Warning</p>
                                                <p className="score">50</p>
                                            </div>
                                        </li>
                                        <li>
                                            <p className="score__info">주의가 필요한 항목들이 존재하여 주기적인 모니터링이 필요한 상태입니다.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*<!-- 사업장 상세 정보 팝업 -->*/}
            <div className="popup__body">
                <div className="workplace__info mt-16">
                    <div className="img_workplace">
                        {/* <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" /> */}
                    </div>
                    <div className="txt_workplace">
                        <div className="page-top">
                            <h2>LS일렉트릭 안양</h2>
                            <div className="top-button">
                                {/*<!--수정버튼 활성화시 active 클래스 추가해주세요~-->*/}
                                <button type="button"
                                    className="btn-edit"
                                    data-pop="pop-listbox-detail-edit"
                                /* onClick={(e) => onClickZoneUpdatePopup(e, zoneInfo)} */
                                >
                                    <span className="hide">수정</span>
                                </button>
                                <button type="button" className="btn-delete"><span className="hide">삭제</span></button>
                            </div>
                        </div>
                        <ul>
                            <li>
                                <p className="tit">회사 명</p>
                                <p className="txt">LS일렉트릭</p>
                            </li>
                            <li>
                                <p className="tit">사업장 명</p>
                                <p className="txt">안양</p>
                            </li>
                            <li>
                                <p className="tit">사업장 주소</p>
                                <p className="txt">안양시 호계</p>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <p className="txt h66">메모메모메모입니다</p>
                            </li>
                        </ul>
                        <ul className="brd-top-1 mt-26 pt-32">
                            <li>
                                <p className="tit">상세사업장</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">38</span>개
                                </p>
                            </li>
                            <li>
                                <p className="tit">등록 기기</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">141</span>개
                                </p>
                            </li>
                            <li>
                                <p className="tit">User</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">10</span>명
                                </p>
                            </li>
                            <li className="mt-30">
                                <p className="tit">진단 점수 기준</p>
                                <div className="txt column">
                                    <div className="result__score">
                                        <p className="tit caution">Warning</p>
                                        <p className="score">50</p>
                                    </div>
                                    <p className="score__info">주의가 필요한 항목들이 존재하여 주기적인 모니터링이 필요한 상태입니다.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="popup__footer">
                <button type="button"
                    className="btn-close"
                >
                    <span>확인</span>
                </button>
            </div>
            {/*<!-- //사업장 상세 정보 팝업 -->*/}
        </>
    )
};
export default ZoneList;



function ZoneViewPopup(props) {
    const setParentPopWin = props.setPopWin;
    const companyInfo = props.companyInfo;
    const zoneInfo = props.zoneInfo;

    function onClickZoneUpdatePopup(e, zone) {
        clog("onClickZoneViewPopup : " + JSON.stringify(zone));
        CUTIL.jsclose_Popup("pop-listbox-detail");

        setParentPopWin("pop-listbox-detail-edit",
            <ZoneUpdatePopup
                htmlHeader={<h1>사업장 상세 정보</h1>}
                zoneInfo={zone}
                companyInfo={companyInfo}
                setSelTree={props.setSelTree}
                setWorkMode={props.setWorkMode}
            />
        );
        CUTIL.jsopen_Popup(e);
    }


    return (
        <>
            {/*<!-- 사업장 상세 정보 팝업 -->*/}
            <div className="popup__body">
                <div className="workplace__info mt-16">
                    <div className="img_workplace">
                        {(zoneInfo.image !== null)
                            ? <img src={zoneInfo.image.url} alt={zoneInfo.image.name} />
                            : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
                        }
                    </div>
                    <div className="txt_workplace">
                        <div className="page-top">
                            <h2>{companyInfo.companyName} {zoneInfo.zoneName}</h2>
                            <div className="top-button">
                                {/*<!--수정버튼 활성화시 active 클래스 추가해주세요~-->*/}
                                <button type="button"
                                    className="btn-edit"
                                    data-pop="pop-listbox-detail-edit"
                                    onClick={(e) => onClickZoneUpdatePopup(e, zoneInfo)}
                                >
                                    <span className="hide">수정</span>
                                </button>
                                <button type="button" className="btn-delete"><span className="hide">삭제</span></button>
                            </div>
                        </div>
                        <ul>
                            <li>
                                <p className="tit">회사 명</p>
                                <p className="txt">{companyInfo.companyName}</p>
                            </li>
                            <li>
                                <p className="tit">사업장 명</p>
                                <p className="txt">{zoneInfo.zoneName}</p>
                            </li>
                            <li>
                                <p className="tit">사업장 주소</p>
                                <p className="txt">{zoneInfo.address}</p>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <p className="txt h66">{zoneInfo.memo}</p>
                            </li>
                        </ul>
                        <ul className="brd-top-1 mt-26 pt-32">
                            <li>
                                <p className="tit">상세사업장</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">{zoneInfo.subZoneCount}</span>개
                                </p>
                            </li>
                            <li>
                                <p className="tit">등록 기기</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">{zoneInfo.itemCount}</span>개
                                </p>
                            </li>
                            <li>
                                <p className="tit">User</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">{zoneInfo.userCount}</span>명
                                </p>
                            </li>
                            <li className="mt-30">
                                <p className="tit">진단 점수 기준</p>
                                <div className="txt column">
                                    <div className="result__score">
                                        <p className="tit caution">Warning</p>
                                        <p className="score">{zoneInfo.assessmentScore}</p>
                                    </div>
                                    <p className="score__info">{zoneInfo.alarmMessage}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="popup__footer">
                <button type="button"
                    className="btn-close"
                >
                    <span>확인</span>
                </button>
            </div>
            {/*<!-- //사업장 상세 정보 팝업 -->*/}
        </>
    )

}



function ZoneUpdatePopup(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //화면 이동
    const navigate = useNavigate();
    //props func
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const setParentWorkMode = props.setWorkMode;
    const companyInfo = props.companyInfo;
    //
    const [zoneInfo, setZoneInfo] = useState(props.zoneInfo);
    function callbackSetZoneInfoMemo(val) {
        setZoneInfo({ ...zoneInfo, memo: val });
    }
    function callbackSetZoneInfoAddress(val) {
        setZoneInfo({ ...zoneInfo, address: val });
    }
    const [errorList, setErrorList] = useState([]);


    async function onClickDoUpdateZone(e) {
        let data: any = null;
        setRecoilIsLoadingBox(true);
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "PUT",
            "appPath": `/api/v2/product/company/zone/${zoneInfo.zoneId}`,
            appQuery: {
                "zoneName": zoneInfo.zoneName,
                "address": zoneInfo.address,
                "memo": zoneInfo.memo,
                "assessmentScore": zoneInfo.assessmentScore
            },
            userToken: userInfo.loginInfo.token,
        });

        if (data) {
            const ERR_URL = HTTPUTIL.resultCheck(false, data);
            if (ERR_URL.length > 0) {
                setRecoilIsLoadingBox(false);
                CUTIL.sleep(500);
                navigate(ERR_URL);
            }

            if (data.codeNum == CONST.API_200) {
                clog("IN ZONE UPDATE : onClickDoUpdateZone : " + JSON.stringify(data.body));
                CUTIL.jsclose_Popup("pop-listbox-detail-edit");

                setParentSelTree("COMPANY",
                    {
                        ...selTree,
                        company: { "companyId": companyInfo.companyId, "companyName": companyInfo.companyName },
                        reload: true,
                    }
                );
                setParentWorkMode("READ");

            } else { // api if
                // need error handle
                setErrorList(data.body.errorList);
            }
        }
        setRecoilIsLoadingBox(false);
    }


    return (
        <>
            {/*<!-- 사업장 상세 정보 수정 팝업 -->*/}
            <div className="popup__body">
                <div className="workplace__info mt-16">
                    <div className="img_workplace">
                        {(zoneInfo.image !== null)
                            ? <img src={zoneInfo.image.url} alt={zoneInfo.image.name} />
                            : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
                        }
                    </div>
                    <div className="txt_workplace">
                        <div className="page-top">
                            <h2>{companyInfo.companyName} {zoneInfo.zoneName}</h2>
                            {/*<div className="top-button">
               <!--수정버튼 활성화시 active 클래스 추가해주세요~-->
               <button type="button" className="btn-edit active"><span className="hide">수정</span></button>
               <button type="button" className="btn-delete"><span className="hide">삭제</span></button>
             </div>*/}
                        </div>
                        <ul className="form__input">
                            <li>
                                <p className="tit">회사 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요" disabled
                                        value={companyInfo.companyName}
                                    />
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업장 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                        value={zoneInfo.zoneName}
                                        className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
                                        onChange={(e) => setZoneInfo({ ...zoneInfo, zoneName: e.target.value })}
                                    />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업장 주소</p>
                                <div className="input__area">
                                    <textarea placeholder="사업장 주소를 입력하세요."
                                        className={`h40 ${(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}`}
                                        value={zoneInfo.address}
                                        onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                                        onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetZoneInfoAddress)}
                                        onChange={(e) => setZoneInfo({ ...zoneInfo, address: e.target.value })}></textarea>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>

                                    {/*<input type="text" id="inp2" placeholder="직접입력"
                     className={(errorList.filter(err=>(err.field==="address")).length>0)?"input-error":""}
                     value={zoneInfo.address}
                     onChange={(e)=>setZoneInfo({...zoneInfo, address:e.target.value})}
                   />
                   <p className="input-errortxt">{errorList.filter(err=>(err.field==="address")).map((err)=>err.msg)}</p>                  
                 */}
                                </div>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <div className="input__area">
                                    <textarea placeholder="메모를 입력하세요."
                                        className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                                        value={zoneInfo.memo}
                                        onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                                        onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetZoneInfoMemo)}
                                        onChange={(e) => setZoneInfo({ ...zoneInfo, memo: e.target.value })}></textarea>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                        </ul>
                        <ul className="brd-top-1 mt-26 pt-32">
                            <li>
                                <p className="tit">상세사업장</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">{zoneInfo.subZoneCount}</span>개
                                </p>
                            </li>
                            <li>
                                <p className="tit">등록 기기</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">{zoneInfo.itemCount}</span>개
                                </p>
                            </li>
                            <li>
                                <p className="tit">User</p>
                                <p className="txt">
                                    <span className="fontMedium mr-4">{zoneInfo.userCount}</span>명
                                </p>
                            </li>
                            <li className="mt-30">
                                <p className="tit mt-8">진단 점수 기준</p>
                                <div className="txt column">
                                    <div className="result__score">
                                        <p className="tit caution">Warning</p>
                                        <div className="score">
                                            <div className="select w64" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                                <div className="selected">
                                                    <div className="selected-value">{zoneInfo.assessmentScore}</div>
                                                    <div className="arrow"></div>
                                                </div>
                                                <ul>
                                                    <li className={`option ${(zoneInfo.assessmentScore === 70) ? "on" : ""}`} data-value="70">70</li>
                                                    <li className={`option ${(zoneInfo.assessmentScore === 75) ? "on" : ""}`} data-value="75">75</li>
                                                    <li className={`option ${(zoneInfo.assessmentScore === 80) ? "on" : ""}`} data-value="80">80</li>
                                                    <li className={`option ${(zoneInfo.assessmentScore === 85) ? "on" : ""}`} data-value="85">85</li>
                                                    <li className={`option ${(zoneInfo.assessmentScore === 90) ? "on" : ""}`} data-value="90">90</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="score__info">{zoneInfo.alarmMessage}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="popup__footer">
                <button type="button"
                    className="bg-gray btn-close"
                >
                    <span>취소</span>
                </button>
                <button type="button"
                    className="btn-close"
                    onClick={(e) => onClickDoUpdateZone(e)}
                >
                    <span>저장</span>
                </button>
            </div>
            {/*<!-- //사업장 상세 정보 팝업 -->*/}
        </>
    )

}