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
function SubZoneView(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const isMobile = props.isMobile;
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentCurTree = props.setCurTree;
    const setParentAdminType = props.setAdminType;
    const setParentWorkMode = props.setWorkMode;
    const setParentCurTabMenu = props.setCurTabMenu;
    const setParentPopWin = props.setPopWin;

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
    ////////////////////////////////////////////////////////////////////////////
    const [subZoneInfo, setSubZoneInfo] = useState(null);

    const { data: retSubZone, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        //appPath: `/api/v2/product/company/zone/subzone/detail`,
        //appQuery: { subZoneId: curTree.subZone.subZoneId },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        //watch: curTree.subZone.subZoneId
    });

    useEffect(() => {

        if (retSubZone) {
            if (retSubZone.codeNum == CONST.API_200) {
                //clog("IN SUBZONE : RES : " + JSON.stringify(retSubZone.body));        
                setParentPopWin("pop-area-right-page-info",
                    <MobileSubZoneView
                        curTree={curTree}
                        subZoneInfo={retSubZone.body}
                        onClickSubZoneDelete={onClickSubZoneDelete}
                        onClickRoomInsert={onClickRoomInsert}
                        onClickDeviceInsert={onClickDeviceInsert}
                    />
                );
                setSubZoneInfo(retSubZone.body);
            }
        }
    }, [curTree, retSubZone])

    async function onClickSubZoneDelete(e) {
        clog("IN SUBZONEVIEW : onClickSubZoneDelete : " + JSON.stringify(curTree));
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": "/api/v2/product/usertree",
            appQuery: {
                "productId": curTree.subZone.subZoneId,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN SUBZONE-DELETE: ret : " + JSON.stringify(data.body));

                setParentCurTree("ZONE", // 하위 삭제시 상위 호출
                    {
                        ...curTree,
                        subZone: { "subZoneId": "", "subZoneName": "" },
                    }
                );
                setParentWorkMode("READ");

            } else { // api if
                // need error handle
            }
        }
        //return data;
    }

    // 사이트(ROOM) 추가
    function onClickRoomInsert(e) {
        e.stopPropagation();
        setParentWorkMode("CREATE");
        setParentAdminType("ROOM")

        CUTIL.jsopen_s_Popup(e, isMobile);
    }

    // 기기등록 tab 및 목록으로 이동
    function onClickDeviceInsert(e, room) {
        e.stopPropagation();
        //mainlayout tab 데이터 확인 필요
        setParentCurTree("ROOM",
            {
                ...curTree,
                room: { "roomId": room.roomId, "roomName": room.roomName },
                spg: { "spgId": "", "spgName": "" },
            }
        )

        setParentCurTabMenu({ tabId: 1, tabName: "기기 등록 관리", tabType: "TAB_DEVICE" });
        setParentWorkMode("LIST");
        setParentAdminType("ROOM")
        CUTIL.jsopen_s_Popup(e, isMobile);
    }


    return (
        <>
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}

            <div ref={mobileRef} className="area__right">
                <ul className="page-loca">
                    {/* <li>{curTree.company.companyName}</li> */}
                    <li> 사업장</li>
                    <li></li>
                </ul>
                <div className="page-top">
                    <h2>메인</h2>
                    <div className="top-button">
                        <button type="button" className="btn-edit"><span className="hide">수정</span></button>
                        <button type="button" className="btn-delete" onClick={(e) => onClickSubZoneDelete(e)}>
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
                                <p className="tit">상세사업장 담당자</p>
                                <p className="txt"></p>
                            </li>
                            <li>
                                <p className="tit">연락처</p>
                                <p className="txt"></p>
                            </li>
                            <li>
                                <p className="tit">상세사업장 주소</p>
                                <p className="txt"></p>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <p className="txt"></p>
                            </li>
                            <li>
                                <p className="tit">등록 설비 수</p>
                                <p className="txt">2385+</p>
                            </li>
                        </ul>
                    </div>
                    <div className="content__list">
                        <div className="listbox__top">
                            <h3>전기실 목록</h3>
                            <button type="button" className="add__item" onClick={(e) => onClickRoomInsert(e)}><span>전기실 추가</span></button>
                        </div>

                        <div className="listbox__area">
                            {/*  {subZoneInfo.roomDto.map((room, idx) => (
                                <div key={`room_${idx.toString()}`}
                                    className="listbox">
                                    <div className="box__top"><p className="site">{room.roomName}</p></div>
                                    <ul className="box__bottom">
                                        <li>
                                            <div>
                                                <p>
                                                    <span>등록 설비 수</span>
                                                    <strong>451+</strong>
                                                </p>
                                                <p>
                                                    <span>관리자 수</span>
                                                    <strong>4+</strong>
                                                </p>
                                            </div>
                                            <button type="button" className="btn-add"
                                                data-pop="pop-list"
                                                onClick={(e) => onClickDeviceInsert(e, room)}>
                                                <span>기기 등록</span>
                                            </button>
                                        </li>
                                        <li><p className="icon-admin">{room.inCharge}</p></li>
                                        <li><p className="icon-phone">{room.contact}</p></li>
                                    </ul>
                                </div>
                            ))} */}
                        </div>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
            </div>

            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default SubZoneView;


function MobileSubZoneView(props) {
    const curTree = props.curTree;
    const subZoneInfo = props.subZoneInfo;
    const onClickSubZoneDelete = props.onClickSubZoneDelete;
    const onClickRoomInsert = props.onClickRoomInsert;
    const onClickDeviceInsert = props.onClickDeviceInsert;
    return (
        <>
            {(subZoneInfo) && <div className="popup__body">
                {/*<!--area__right, 오른쪽 영역-->*/}
                <ul className="page-loca">
                    <li>{curTree.company.companyName}</li>
                    <li>{curTree.zone.zoneName} 사업장</li>
                    <li>{subZoneInfo.subZoneName}</li>
                </ul>
                <div className="page-top">
                    <h2>{subZoneInfo.subZoneName}</h2>
                    <div className="top-button">
                        <button type="button" className="btn-edit"><span className="hide">수정</span></button>
                        <button type="button" className="btn-delete" onClick={(e) => onClickSubZoneDelete(e)}>
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
                                <p className="tit">상세사업장 담당자</p>
                                <p className="txt">{subZoneInfo.inCharge}</p>
                            </li>
                            <li>
                                <p className="tit">연락처</p>
                                <p className="txt">{subZoneInfo.contact}</p>
                            </li>
                            <li>
                                <p className="tit">상세사업장 주소</p>
                                <p className="txt">{subZoneInfo.address}</p>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <p className="txt">{subZoneInfo.memo}</p>
                            </li>
                            <li>
                                <p className="tit">등록 설비 수</p>
                                <p className="txt">2385+</p>
                            </li>
                        </ul>
                    </div>
                    <div className="content__list">
                        <div className="listbox__top">
                            <h3>전기실 목록</h3>
                            <button type="button" className="add__item" onClick={(e) => onClickRoomInsert(e)}><span>전기실 추가</span></button>
                        </div>

                        <div className="listbox__area">
                            {subZoneInfo.roomDto.map((room, idx) => (
                                <div key={`room_${idx.toString()}`}
                                    className="listbox">
                                    <div className="box__top"><p className="site">{room.roomName}</p></div>
                                    <ul className="box__bottom">
                                        <li>
                                            <div>
                                                <p>
                                                    <span>등록 설비 수</span>
                                                    <strong>451+</strong>
                                                </p>
                                                <p>
                                                    <span>관리자 수</span>
                                                    <strong>4+</strong>
                                                </p>
                                            </div>
                                            <button type="button" className="btn-add"
                                                data-pop="pop-list"
                                                onClick={(e) => onClickDeviceInsert(e, room)}>
                                                <span>기기 등록</span>
                                            </button>
                                        </li>
                                        <li><p className="icon-admin">{room.inCharge}</p></li>
                                        <li><p className="icon-phone">{room.contact}</p></li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            }
            {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
        </>

    )

}