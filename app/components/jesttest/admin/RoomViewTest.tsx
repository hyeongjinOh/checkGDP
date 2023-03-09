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
function RoomView(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const isMobile = props.isMobile;
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    const setParentCurTabMenu = props.setCurTabMenu;


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

    ////////////////////////////////////////////////////////////////////////////
    const [roomInfo, setRoomInfo] = useState(null);
    clog("IN ROOMVIEW : INIT : curTree : " + JSON.stringify(curTree));
    const { data: retRoom, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        //appPath: `/api/v2/product/company/zone/subzone/room/detail`,
        //appQuery: { roomId: curTree.room.roomId },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        //watch: curTree.room.roomId
    });

    useEffect(() => {
        if (retRoom) {
            if (retRoom.codeNum == CONST.API_200) {
                //clog("IN SUBZONE : RES : " + JSON.stringify(retSubZone));        
                setParentPopWin("pop-area-right-page-info",
                    <MobileRoomView
                        curTree={curTree}
                        roomInfo={retRoom.body}
                        onClickRoomDelete={onClickRoomDelete}
                        onClickDeviceInsert={onClickDeviceInsert}
                    />
                );
                setRoomInfo(retRoom.body);
            }
        }
    }, [curTree, retRoom]);
    //////////////////////////////////////////////////////////////////////////

    //(roomInfo)
    //?clog("IN ROOMVIEW : INIT : roomInfo : " + JSON.stringify(roomInfo))
    //:clog("IN ROOMVIEW : INIT : roomInfo : " + "null");
    //clog("IN SITEIVEW : INIT : zoneInfo : " + (roomInfo)?JSON.stringify(roomInfo.zone):"null");

    async function onClickRoomDelete(e) {
        clog("IN ROOMVIEW : onClickRoomDelete : " + JSON.stringify(curTree));
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": "/api/v2/product/usertree",
            appQuery: {
                "productId": curTree.room.roomId,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN ROOM-DELETE: ret : " + JSON.stringify(data.body));

                setParentCurTree("SUBZONE", // 하위 삭제시 상위 호출
                    {
                        ...curTree,
                        room: { "roomId": "", "roomName": "" },
                    }
                );
                setParentWorkMode("READ");

            } else { // api if
                // need error handle
            }
        }
        //return data;
    }

    // 기기등록 tab 및 목록으로 이동
    function onClickDeviceInsert(e) {
        e.stopPropagation();
        //mainlayout tab 데이터 확인 필요
        setParentCurTabMenu({ tabId: 1, tabName: "기기 등록 관리", tabType: "TAB_DEVICE" });
        setParentWorkMode("LIST");
        //setParentAdminType("ROOM")
        CUTIL.jsopen_s_Popup(e, isMobile);
    }


    return (
        <>
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
            <div className="area__right" ref={mobileRef} >
                <ul className="page-loca">
                    <li>LS전자</li>
                    <li>부산 사업장</li>
                    <li>메인</li>
                    <li>1전기실</li>
                </ul>
                <div className="page-top">
                    <h2>1전기실</h2>
                    <div className="top-button">
                        <button type="button" className="btn-edit"><span className="hide">수정</span></button>
                        <button type="button" className="btn-delete">
                            <span className="hide">삭제</span>
                        </button>
                    </div>
                </div>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지 workplace__info 클래스 추가 -->*/}
                <div className="area__right_content workplace__info">
                    <div className="content__info">
                        <h3 className="hide">상세사업장 정보</h3>
                        <ul>
                            <li>
                                <p className="tit">TREE</p>
                                {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                                <p className="txt treeon"><span className="hide">on</span></p>
                            </li>
                            <li>
                                <p className="tit">전기실 담당자</p>
                                <p className="txt">tester</p>
                            </li>
                            <li>
                                <p className="tit">연락처</p>
                                <p className="txt">01022223333</p>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <p className="txt">RoomViewTest 테스트 메모 입니다</p>
                            </li>
                            <li>
                                <p className="tit">전기실 도면</p>
                                <ul className="filelist">
                                    <li>
                                        <span>Contract.zip+</span>
                                    </li>
                                    <li>
                                        <span>Contract.zip+</span>
                                    </li>
                                    <li>
                                        <span>Contract.zip+</span>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <p className="tit">등록 설비 수</p>
                                <p className="txt">
                                    <button type="button" className="btn-add"
                                        data-pop="pop-list"
                                        onClick={(e) => onClickDeviceInsert(e)}>
                                        <span>기기 등록</span>
                                    </button>
                                </p>
                            </li>
                        </ul>
                    </div>
                    <div className="content__list">
                        <div className="listbox__top">
                            <h3>사용자 목록</h3>
                        </div>
                        <div className="tbl-list">
                            <table summary="번호,사용자 타입,이름,회사,연락처,마지막 로그인 항목으로 구성된 사용자 목록 입니다.">
                                <caption>
                                    사용자 목록
                                </caption>
                                <colgroup>
                                    <col style={{}} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th scope="col" className="txt-center">번호</th>
                                        <th scope="col">사용자 타입</th>
                                        <th scope="col">이름</th>
                                        <th scope="col">회사</th>
                                        <th scope="col">연락처</th>
                                        <th scope="col">마지막 로그인</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/*    {roomInfo.userList.map((user, idx) => (
                                        <tr key={`room_user_${idx.toString()}`}>
                                            <td className="txt-center">1</td>
                                            <td><span className="siteadmin">{user.role}</span></td>
                                            <td className="d-sm-none">{user.userName}</td>
                                            <td className="d-sm-none">{user.companyName}</td>
                                            <td className="d-sm-none">{user.phoneNumber}</td>
                                            <td className="d-sm-none">{user.updatedTime}</td>
                                            <td className="d-lm-none">
                                                <p>{user.userName}</p>
                                                <p>{user.phoneNumber}</p>
                                            </td>
                                            <td className="d-lm-none">
                                                <p>{user.companyName}</p>
                                                <p>{user.updatedTime}</p>
                                            </td>
                                        </tr>
                                    ))} */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
            </div>

            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default RoomView;


function MobileRoomView(props) {
    const curTree = props.curTree;
    const roomInfo = props.roomInfo;
    const onClickRoomDelete = props.onClickRoomDelete;
    const onClickDeviceInsert = props.onClickDeviceInsert;
    return (
        <>
            {(roomInfo) &&
                <div className="popup__body">
                    {/*<!--area__right, 오른쪽 영역-->*/}
                    <ul className="page-loca">
                        <li>{curTree.company.companyName}</li>
                        <li>{curTree.zone.zoneName} 사업장</li>
                        <li>{curTree.subZone.subZoneName}</li>
                        <li>{roomInfo.roomName}</li>
                    </ul>
                    <div className="page-top">
                        <h2>{roomInfo.roomName}</h2>
                        <div className="top-button">
                            <button type="button" className="btn-edit"><span className="hide">수정</span></button>
                            <button type="button" className="btn-delete" onClick={(e) => onClickRoomDelete(e)}>
                                <span className="hide">삭제</span>
                            </button>
                        </div>
                    </div>
                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지 workplace__info 클래스 추가 -->*/}
                    <div className="area__right_content workplace__info">
                        <div className="content__info">
                            <h3 className="hide">상세사업장 정보</h3>
                            <ul>
                                <li>
                                    <p className="tit">TREE</p>
                                    {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                                    <p className="txt treeon"><span className="hide">on</span></p>
                                </li>
                                <li>
                                    <p className="tit">전기실 담당자</p>
                                    <p className="txt">{roomInfo.inCharge}</p>
                                </li>
                                <li>
                                    <p className="tit">연락처</p>
                                    <p className="txt">{roomInfo.contact}</p>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <p className="txt">{roomInfo.memo}</p>
                                </li>
                                <li>
                                    <p className="tit">전기실 도면</p>
                                    <ul className="filelist">
                                        <li>
                                            <span>Contract.zip+</span>
                                        </li>
                                        <li>
                                            <span>Contract.zip+</span>
                                        </li>
                                        <li>
                                            <span>Contract.zip+</span>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <p className="tit">등록 설비 수</p>
                                    <p className="txt">
                                        <button type="button" className="btn-add"
                                            data-pop="pop-list"
                                            onClick={(e) => onClickDeviceInsert(e)}>
                                            <span>기기 등록</span>
                                        </button>
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="content__list">
                            <div className="listbox__top">
                                <h3>사용자 목록</h3>
                            </div>
                            <div className="tbl-list">
                                <table summary="번호,사용자 타입,이름,회사,연락처,마지막 로그인 항목으로 구성된 사용자 목록 입니다.">
                                    <caption>
                                        사용자 목록
                                    </caption>
                                    <colgroup>
                                        <col style={{}} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th scope="col" className="txt-center">번호</th>
                                            <th scope="col">사용자 타입</th>
                                            <th scope="col">이름</th>
                                            <th scope="col">회사</th>
                                            <th scope="col">연락처</th>
                                            <th scope="col">마지막 로그인</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roomInfo.userList.map((user, idx) => (
                                            <tr key={`room_user_${idx.toString()}`}>
                                                <td className="txt-center">1</td>
                                                <td><span className="siteadmin">{user.role}</span></td>
                                                <td className="d-sm-none">{user.userName}</td>
                                                <td className="d-sm-none">{user.companyName}</td>
                                                <td className="d-sm-none">{user.phoneNumber}</td>
                                                <td className="d-sm-none">{user.updatedTime}</td>
                                                <td className="d-lm-none">
                                                    <p>{user.userName}</p>
                                                    <p>{user.phoneNumber}</p>
                                                </td>
                                                <td className="d-lm-none">
                                                    <p>{user.companyName}</p>
                                                    <p>{user.updatedTime}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
        </>

    )

}