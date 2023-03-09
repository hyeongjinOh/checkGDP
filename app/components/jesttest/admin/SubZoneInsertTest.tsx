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
function SubZoneInsert(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    //
    const [subZoneName, setSubZoneName] = useState("");
    const [managerInfo, setManagerInfo] = useState({ "id": "", "name": "홍길순", "telNo": "000-0000-0000" });
    const [address, setAddress] = useState("LS일렉 상세사업장 주소");
    const [memo, setMemo] = useState("LS일렉 상세사업장 등록입니다.");

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
    useEffect(() => { // re-rendering mobile check
        if (CUTIL.isnull(mobileRef)) return;
        const mobileTag = mobileRef.current;
        if (!CUTIL.isnull(mobileTag)) {
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                // setParentIsMobile(true);
            } else {
                // setParentIsMobile(false);
            }
        }
    }, []);

    useEffect(() => {
        /*  setParentPopWin("pop-area-right-page-info",
             <MobileSubZoneInsert
                 curTree={curTree}
                 subZoneName={subZoneName}
                 setSubZoneName={setSubZoneName}
                 managerInfo={managerInfo}
                 setManagerInfo={setManagerInfo}
                 address={address}
                 setAddress={setAddress}
                 memo={memo}
                 setMemo={setMemo}
                 onClickSubZoneSave={onClickSubZoneSave}
                 onClickCancel={onClickCancel}
             />
         ) */
    });
    /*  async function onClickSubZoneSave(e) {
         clog("IN EHCLAST : onClickSubZoneSave : " + JSON.stringify(managerInfo));
         let data: any = null;
         data = await HTTPUTIL.PromiseHttp({
             "httpMethod": "POST",
             "appPath": "/api/v2/product/company/zone/subzone",
             appQuery: {
                 "zoneId": curTree.zone.zoneId,
                 "subZoneName": subZoneName,
                 "inCharge": managerInfo.name,
                 "contact": managerInfo.telNo,
                 "address": address,
                 "memo": memo
             },
             userToken: userInfo.loginInfo.token,
         });
         if (data) {
             if (data.codeNum == 200) {
                 clog("IN SUBZONE-INSERT: onClickSubZoneSave : " + JSON.stringify(data.body));
                 setParentCurTree("SUBZONE",
                     {
                         ...curTree,
                         subZone: { "subZoneId": data.body.subZoneId, "subZoneName": data.body.subZoneName },
                     }
                 );
                 setParentWorkMode("READ");
 
             } else { // api if
                 // need error handle
             }
         }
         //return data;
     } */
    function onClickCancel(e) {
        setParentCurTree("ZONE",
            {
                ...curTree,
                subZone: { "subZoneId": "", "subZoneName": "" },
            }
        );
        setParentWorkMode("READ");
    }

    return (
        <>
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
            {
                <div className="area__right" ref={mobileRef}>
                    <ul className="page-loca">
                        <li>LS전자</li>
                        <li>부산 사업장</li>
                    </ul>
                    <div className="page-top">
                        <h2>상세사업장 추가</h2>
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
                                            value={subZoneName}
                                            onChange={(e) => { setSubZoneName(e.target.value) }} />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit star">상세사업장 담당자</p>
                                    <div className="input__area">
                                        <div className="box__search">
                                            <input type="text" placeholder="직접입력"
                                                value={managerInfo.name}
                                                onChange={(e) => setManagerInfo({ ...managerInfo, name: e.target.value })}
                                            />
                                            <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit star">연락처</p>
                                    <div className="input__area">
                                        <input type="tel" id="inp2" placeholder="숫자만"
                                            value={managerInfo.telNo}
                                            onChange={(e) => setManagerInfo({ ...managerInfo, telNo: e.target.value })}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit star">상세사업장 주소</p>
                                    <div className="input__area">
                                        <div className="box__search">
                                            <input type="text" placeholder="직접입력"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                            <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <div className="input__area">
                                        <textarea placeholder="메모를 입력하세요"
                                            value={memo}
                                            onChange={(e) => setMemo(e.target.value)}
                                        ></textarea>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="btn__wrap">
                            <button type="button" className="bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
                            <button type="button" /* onClick={(e) => onClickSubZoneSave(e)} */><span>저장</span></button>
                        </div>
                    </div>
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                </div>
            }
            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default SubZoneInsert;


function MobileSubZoneInsert(props) {
    const curTree = props.curTree;
    const subZoneName = props.subZoneName;
    const setSubZoneName = props.setSubZoneName;
    const managerInfo = props.managerInfo;
    const setManagerInfo = props.setManagerInfo;
    const address = props.address;
    const setAddress = props.setAddress;
    const memo = props.memo;
    const setMemo = props.setMemo;

    const onClickSubZoneSave = props.onClickSubZoneSave;
    const onClickCancel = props.onClickCancel;

    return (
        <>
            {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->*/}
            {
                <>
                    {/*<div className="popup__head">
       <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
   </div>*/}
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
                                                value={subZoneName}
                                                onChange={(e) => { setSubZoneName(e.target.value) }} />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit star">상세사업장 담당자</p>
                                        <div className="input__area">
                                            <div className="box__search">
                                                <input type="text" placeholder="직접입력"
                                                    value={managerInfo.name}
                                                    onChange={(e) => setManagerInfo({ ...managerInfo, name: e.target.value })} />
                                                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit star">연락처</p>
                                        <div className="input__area">
                                            <input type="tel" id="inp2" placeholder="숫자만"
                                                value={managerInfo.telNo}
                                                onChange={(e) => setManagerInfo({ ...managerInfo, telNo: e.target.value })} />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit star">상세사업장 주소</p>
                                        <div className="input__area">
                                            <div className="box__search">
                                                <input type="text" placeholder="직접입력"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)} />
                                                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">메모</p>
                                        <div className="input__area">
                                            <textarea placeholder="메모를 입력하세요"
                                                value={memo}
                                                onChange={(e) => setMemo(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="btn__wrap">
                                <button type="button" className="bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
                                <button type="button" onClick={(e) => onClickSubZoneSave(e)}><span>저장</span></button>
                            </div>
                        </div>
                        {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                        {/*<!--//area__right, 오른쪽 영역-->*/}
                    </div>
                </>
            }
            {/*<!-- //모바일 오른쪽 영역 area-right 팝업 -->*/}

        </>

    )

}