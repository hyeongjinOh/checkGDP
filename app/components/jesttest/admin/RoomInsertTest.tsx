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
function RoomInsert(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    //
    const [roomName, setRoomName] = useState("");
    const [managerInfo, setManagerInfo] = useState({ "id": "", "name": "홍길순", "telNo": "000-0000-0000" });
    const [memo, setMemo] = useState("LS일렉 전기실 등록입니다.");

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
                //setParentIsMobile(true);
            } else {
                //setParentIsMobile(false);
            }
        }
    }, []);
    useEffect(() => {
        /* setParentPopWin("pop-area-right-page-info",
            <MobileRoomInsert
                curTree={curTree}
                roomName={roomName}
                setRoomName={setRoomName}
                managerInfo={managerInfo}
                setManagerInfo={setManagerInfo}
                memo={memo}
                setMemo={setMemo}
                onClickRoomSave={onClickRoomSave}
                onClickCancel={onClickCancel}
            />
        ) */
    });

    /* async function onClickRoomSave(e) {
        clog("IN ROOMINSERT : onClickRoomSave : " + JSON.stringify(managerInfo));
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": "/api/v2/product/company/zone/subzone/room",
            appQuery: {
                "subZoneId": curTree.subZone.subZoneId,
                "roomName": roomName,
                "inCharge": managerInfo.name,
                "contact": managerInfo.telNo,
                "memo": memo
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN ROOM-INSERT: onClickRoomSave : " + JSON.stringify(data.body));
                setParentCurTree("ROOM",
                    {
                        ...curTree,
                        room: { "roomId": data.body.roomId, "roomName": data.body.roomName },
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
        setParentCurTree("SUBZONE",
            {
                ...curTree,
                room: { "roomId": "", "roomName": "" },
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
                        <li>메인</li>
                    </ul>
                    <div className="page-top">
                        <h2>전기실 추가</h2>
                    </div>

                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                    <div className="area__right_content workplace__info info__input">
                        <div className="content__info">
                            <h3 className="hide">전기실 추가 정보 입력</h3>
                            <ul className="form__input">
                                <li>
                                    <p className="tit">TREE</p>
                                    {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                                    <p className="txt treeon mt-5"><span className="hide">on</span></p>
                                </li>
                                <li>
                                    <p className="tit star">전기실 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                            value={roomName}
                                            onChange={(e) => { setRoomName(e.target.value) }}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit star">전기실 담당자</p>
                                    <div className="input__area">
                                        <input type="text" placeholder="직접입력"
                                            value={managerInfo.name}
                                            onChange={(e) => setManagerInfo({ ...managerInfo, name: e.target.value })}
                                        />
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
                                    <p className="tit">전기실 도면</p>
                                    <div className="input__area">
                                        <div className="filebox">
                                            <input className="upload-name" value="" placeholder="디자인 도면을 첨부하세요" readOnly />
                                            <label htmlFor="file"><span className="hide">파일찾기</span></label>
                                            <input type="file" id="file" readOnly />
                                        </div>
                                        <ul className="filelist">
                                            <li>
                                                <span>Contract.zip</span>
                                                <button type="button" className="btn btn-delete"><span className="hide">삭제</span></button>
                                            </li>
                                            <li>
                                                <span>Contract.zip</span>
                                                <button type="button" className="btn btn-delete"><span className="hide">삭제</span></button>
                                            </li>
                                            <li>
                                                <span>Contract.zip</span>
                                                <button type="button" className="btn btn-delete"><span className="hide">삭제</span></button>
                                            </li>
                                        </ul>
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
                            <button type="button" /* onClick={(e) => onClickRoomSave(e)} */><span>저장</span></button>
                        </div>
                    </div>
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                </div>
            }
            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default RoomInsert;


function MobileRoomInsert(props) {
    const curTree = props.curTree;
    const roomName = props.roomName;
    const setRoomName = props.setRoomName;
    const managerInfo = props.managerInfo;
    const setManagerInfo = props.setManagerInfo;
    const memo = props.memo;
    const setMemo = props.setMemo;

    const onClickRoomSave = props.onClickRoomSave;
    const onClickCancel = props.onClickCancel;



    return (
        <>
            {/*<div id="pop-area-right" className="popup-layer js-layer layer-out hidden page-detail page-workplace page-info">*/}
            {/*<div className="popup__head">
       <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
   </div>*/}
            <div className="popup__body">
                {/*<!--area__right, 오른쪽 영역-->*/}
                <ul className="page-loca">
                    <li>{curTree.company.companyName}</li>
                    <li>{curTree.zone.zoneName} 사업장</li>
                    <li>{curTree.subZone.subZoneName}</li>
                </ul>
                <div className="page-top">
                    <h2>전기실 추가</h2>
                </div>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                <div className="area__right_content workplace__info info__input">
                    <div className="content__info">
                        <h3 className="hide">전기실 추가 정보 입력</h3>
                        <ul className="form__input">
                            <li>
                                <p className="tit">TREE</p>
                                {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                                <p className="txt treeon mt-5"><span className="hide">on</span></p>
                            </li>
                            <li>
                                <p className="tit star">전기실 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                        value={roomName}
                                        onChange={(e) => { setRoomName(e.target.value) }}
                                    />
                                </div>
                            </li>
                            <li>
                                <p className="tit star">전기실 담당자</p>
                                <div className="input__area">
                                    <input type="text" placeholder="직접입력"
                                        value={managerInfo.name}
                                        onChange={(e) => setManagerInfo({ ...managerInfo, name: e.target.value })}
                                    />
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
                                <p className="tit">전기실 도면</p>
                                <div className="input__area">
                                    <div className="filebox">
                                        <input className="upload-name" value="" placeholder="디자인 도면을 첨부하세요" readOnly />
                                        <label htmlFor="file"><span className="hide">파일찾기</span></label>
                                        <input type="file" id="file" readOnly />
                                    </div>
                                    <ul className="filelist">
                                        <li>
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-delete"><span className="hide">삭제</span></button>
                                        </li>
                                        <li>
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-delete"><span className="hide">삭제</span></button>
                                        </li>
                                        <li>
                                            <span>Contract.zip</span>
                                            <button type="button" className="btn btn-delete"><span className="hide">삭제</span></button>
                                        </li>
                                    </ul>
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
                        <button type="button" onClick={(e) => onClickRoomSave(e)}><span>저장</span></button>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                {/*<!--//area__right, 오른쪽 영역-->*/}
            </div>
            {/*</div>
     <!-- //모바일 오른쪽 영역 area-right 팝업 -->*/}

        </>

    )

}