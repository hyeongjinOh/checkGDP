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
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
//component
import EhpPostCode from "../../common/postcode/EhpPostCode";

function SubZoneUpdate(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    //
    const [errorList, setErrorList] = useState([]);
    //const [subZoneName, setSubZoneName] = useState("");
    //const [managerInfo, setManagerInfo] = useState({ "id": "", "name": "", "telNo": "" });
    //const [address, setAddress] = useState("");
    //const [memo, setMemo] = useState("");

    //mobile check
    const mobileRef = useRef(null); // Mobile Check용
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
    // useEffect(() => { // re-rendering mobile check
    //     if (CUTIL.isnull(mobileRef)) return;
    //     const mobileTag = mobileRef.current;
    //     if (!CUTIL.isnull(mobileTag)) {
    //         if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
    //             setParentIsMobile(true);
    //         } else {
    //             setParentIsMobile(false);
    //         }
    //     }
    // }, []);

    const [subZoneInfo, setSubZoneInfo] = useState({
        "isontree": true,
        "sort": 0,
        "approval": 0,
        "subZoneId": "",
        "subZoneName": "", //
        "address": "", //
        "memo": "", //
        "itemCount": 0,
    });
    function callbackSetSubZoneInfoMemo(val) {
        setSubZoneInfo({ ...subZoneInfo, memo: val });
    }
    function callbackSetSubZoneInfoAddress(val) {
        clog("callbackSetSubZoneInfoAddress : " + val);
        setSubZoneInfo({ ...subZoneInfo, address: val });
    }


    const [isPopupPostCode, setIsPopupPostCode] = useState(false);
    // useEffect(() => {
    //     setParentPopWin("pop-postcode",
    //         <EhpPostCode
    //             isPopup={isPopupPostCode}
    //             setIsPopup={setIsPopupPostCode}
    //             setAddress={callbackSetSubZoneInfoAddress}
    //         />
    //     )
    // });
    function onClickPostCode(e) {
        setIsPopupPostCode(true);
        CUTIL.jsopen_Popup(e);
    }
    // useEffect(() => {
    //     setParentPopWin("pop-area-right-page-info",
    //         <MobileSubZoneUpdate
    //             curTree={curTree}
    //             subZoneInfo={subZoneInfo}
    //             setSubZoneInfo={setSubZoneInfo}
    //             callbackSetSubZoneInfoMemo={callbackSetSubZoneInfoMemo}
    //             errorList={errorList}
    //             onClickDoUpdateSubZone={onClickDoUpdateSubZone}
    //             onClickDoCancelSubZone={onClickDoCancelSubZone}
    //             onClickPostCode={onClickPostCode}
    //         />
    //     )
    // });


    const { data: retSubZone, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/detail`,
        // appQuery: { subZoneId: curTree.subZone.subZoneId },
        // userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        // watch: curTree.subZone.subZoneId + curTree.reload
    });

    // useEffect(() => {

    //     if (retSubZone) {
    //         if (retSubZone.codeNum == CONST.API_200) {
    //             clog("IN SUBZONE DETAIL : RES : " + JSON.stringify(retSubZone.body));
    //             <MobileSubZoneUpdate
    //                 curTree={curTree}
    //                 subZoneInfo={retSubZone.body}
    //                 setSubZoneInfo={setSubZoneInfo}
    //                 callbackSetSubZoneInfoMemo={callbackSetSubZoneInfoMemo}
    //                 errorList={errorList}
    //                 onClickDoUpdateSubZone={onClickDoUpdateSubZone}
    //                 onClickDoCancelSubZone={onClickDoCancelSubZone}
    //                 onClickPostCode={onClickPostCode}
    //             />
    //             setSubZoneInfo(retSubZone.body);
    //         }
    //     }
    // }, [curTree, retSubZone])


    async function onClickDoUpdateSubZone(e) {
        //alert("상세사업장 수정 API 대기중.....");    
        //return;
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "PUT",
            "appPath": `/api/v2/product/company/zone/subzone/${subZoneInfo.subZoneId}`,
            appQuery: {
                //"zoneId": curTree.zone.zoneId,
                //"subZoneId": subZoneInfo.subZoneId,
                "subZoneName": subZoneInfo.subZoneName,
                //"inCharge": managerInfo.name,
                //"contact": managerInfo.telNo,
                "address": subZoneInfo.address,
                "memo": subZoneInfo.memo
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN SUBZONE-UPDATE: onClickDoUpdateSubZone : " + JSON.stringify(data.body));
                setParentCurTree("SUBZONE",
                    {
                        ...curTree,
                        subZone: { "subZoneId": data.body.subZoneId, "subZoneName": data.body.subZoneName },
                    }
                );
                setParentWorkMode("READ");

            } else { // api if
                // need error handle
                setErrorList(data.body.errorList);
            }
        }
        //return data;
    }
    function onClickDoCancelSubZone(e, subZone) {
        setParentCurTree("SUBZONE",
            {
                ...curTree,
                subZone: { "subZoneId": subZone.subZoneId, "subZoneName": subZone.subZoneName },
            }
        );
        setParentWorkMode("READ");
    }

    return (
        <>
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
            <div className="area__right" ref={mobileRef}>
                <ul className="page-loca">
                    <li>LS일렉트릭</li>
                    <li>안양</li>
                </ul>
                <div className="page-top">
                    <h2>상세사업장 수정</h2>
                </div>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                <div className="area__right_content workplace__info info__input">
                    <div className="content__info">
                        <h3 className="hide">상세사업장 추가 정보 입력</h3>
                        <ul className="form__input">
                            <li>
                                <p className="tit star">상세사업장 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                        className={"input-error"}
                                        defaultValue={"1공장"}
                                    /* onChange={(e) => setSubZoneInfo({ ...subZoneInfo, subZoneName: e.target.value })} */
                                    />
                                    <p className="input-errortxt"></p>
                                </div>
                            </li>
                            <li>
                                <p className="tit star">상세사업장 주소</p>
                                <div className="input__area">
                                    <div className="box__search">
                                        <input type="text" placeholder="직접입력"
                                            className={"input-error"}
                                            defaultValue={"안양"}
                                            //onChange={(e)=>setSubZoneInfo({...subZoneInfo, address : e.target.value})}
                                            disabled
                                        />
                                        <button type="button"
                                            className="btn btn-search"
                                            data-pop="pop-postcode"
                                            onClick={(e) => onClickPostCode(e)}
                                        >
                                            <span className="hide">조회</span>
                                        </button>
                                    </div>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <div className="input__area">
                                    <textarea placeholder="메모를 입력하세요."
                                        className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                                        value={subZoneInfo.memo}
                                        onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                                        onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetSubZoneInfoMemo)}
                                        onChange={(e) => setSubZoneInfo({ ...subZoneInfo, memo: e.target.value })}></textarea>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="btn__wrap">
                        <button type="button" className="bg-gray" onClick={(e) => onClickDoCancelSubZone(e, subZoneInfo)}><span>취소</span></button>
                        <button type="button" onClick={(e) => onClickDoUpdateSubZone(e)}><span>저장</span></button>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
            </div>
            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default SubZoneUpdate;


function MobileSubZoneUpdate(props) {
    const curTree = props.curTree;
    const subZoneInfo = props.subZoneInfo;
    const setSubZoneInfo = props.setSubZoneInfo;
    const callbackSetSubZoneInfoMemo = props.callbackSetSubZoneInfoMemo;
    const errorList = props.errorList;
    const onClickDoUpdateSubZone = props.onClickDoUpdateSubZone;
    const onClickDoCancelSubZone = props.onClickDoCancelSubZone;
    const onClickPostCode = props.onClickPostCode;


    return (
        <>
            {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->*/}
            <div className="popup__body">
                {/*<!--area__right, 오른쪽 영역-->*/}
                <ul className="page-loca">
                    <li>{curTree.company.companyName}</li>
                    <li>{curTree.zone.zoneName} 사업장</li>
                </ul>
                <div className="page-top">
                    <h2>상세 사업장 추가</h2>
                </div>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                <div className="area__right_content workplace__info info__input">
                    <div className="content__info">
                        <h3 className="hide">상세사업장 추가 정보 입력</h3>
                        <ul className="form__input">
                            <li>
                                <p className="tit star">상세사업장 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                        className={(errorList.filter(err => (err.field === "subZoneName")).length > 0) ? "input-error" : ""}
                                        value={subZoneInfo.subZoneName}
                                        onChange={(e) => setSubZoneInfo({ ...subZoneInfo, subZoneName: e.target.value })}
                                    />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "subZoneName")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit star">상세사업장 주소</p>
                                <div className="input__area">
                                    <div className="box__search">
                                        <input type="text" placeholder="직접입력"
                                            className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                                            value={subZoneInfo.address}
                                            //onChange={(e)=>setSubZoneInfo({...subZoneInfo, address : e.target.value})}
                                            disabled
                                        />
                                        <button type="button"
                                            className="btn btn-search"
                                            data-pop="pop-postcode"
                                            onClick={(e) => onClickPostCode(e)}
                                        >
                                            <span className="hide">조회</span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <div className="input__area">
                                    <textarea placeholder="메모를 입력하세요."
                                        className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                                        value={subZoneInfo.memo}
                                        onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                                        onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetSubZoneInfoMemo)}
                                        onChange={(e) => setSubZoneInfo({ ...subZoneInfo, memo: e.target.value })}></textarea>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="btn__wrap">
                        <button type="button" className="bg-gray btn-cancel" onClick={(e) => onClickDoCancelSubZone(e, subZoneInfo)}>
                            <span>취소</span>
                        </button>
                        <button type="button" onClick={(e) => onClickDoUpdateSubZone(e)}>
                            <span>저장</span>
                        </button>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                {/*<!--//area__right, 오른쪽 영역-->*/}
            </div>
            {/*<!-- //모바일 오른쪽 영역 area-right 팝업 -->*/}
        </>
    )

}