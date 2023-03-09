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

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"


function AdminTree(props) {
    //recoil
    //const userInfo = useRecoilValue(userInfoLoginState);
    // props
    const isMobile = props.isMobile;
    const curTree = props.curTree;
    const setParentCurTree = props.setCurTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const setParentWorkMode = props.setWorkMode;
    const workMode = props.workMode;
    const tabType = props.tabType;
    const setParentPopWin = props.setPopWin;
    //
    //clog("IN ADMIN TREE : ADMINTREE : " + adminType + " : " + tabType);
    //화면 이동
    const navigate = useNavigate();
    //
    const [userTree, setUserTree] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [treeSearchText, setTreeSearchText] = useState("");

    useEffect(() => {
        setSearchText("");
        setTreeSearchText("");
    }, [tabType])

    const { data: resInfo, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/usertree?search=${treeSearchText}`,
        appQuery: {},
        //userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        //watch: adminType + workMode + curTree.reload + treeSearchText
    });

    function onClickSearch(e) {
        setTreeSearchText(searchText);
    }

    return (
        <>
            {/*<!--area__left, 왼쪽 영역-->*/}
            <div className="area__left">
                <div className="lnb__top">
                    {/*<!--221018, 트리검색영역 box__search 추가-->*/}
                    <div className="box__search">
                        <input type="text" placeholder="Search..."
                            data-testid="treemodInput"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button type="button" className="btn btn-search"
                            data-testid="treemodButton"
                            onClick={(e) => onClickSearch(e)}
                        >
                            <span className="hide">조회</span>
                        </button>
                    </div>
                </div>

                {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
                {(userTree.length > 0)
                    ? <div className="lnb">
                        {/*<!--공통사항 : 트리에 포험안되는 경우는 해당 메뉴(a태그)에 클래스 tree-off 로 표시 / 트리에 포함되는 경우는 따로 표시 안함 -->*/}
                        <ul className="lnb-depth1">
                            {/*<!-- 페이지 이동 후 열려 있으려면 li에 on 클래스 삽입 -->*/}
                            {userTree.map((company, idx) => (
                                <ZoneTree
                                    key={`comp_${idx.toString()}`}
                                    tabType={props.tabType}
                                    company={company}
                                    zone={company.zone}
                                    curTree={props.curTree}
                                    setCurTree={props.setCurTree}
                                    isMobile={props.isMobile}
                                    adminType={props.adminType}
                                    workMode={props.workMode}
                                    setWorkMode={props.setWorkMode}
                                    setAdminType={props.setAdminType}
                                    setCurTabMenu={props.setCurTabMenu}
                                    setPopWin={props.setPopWin}
                                />
                            ))}
                            {/*<!--등록 요청중 메뉴-->*/}
                            {/**
            * approval  : 승인상태 (0:거절, 1:요청, 2:수락) 
            */}
                        </ul>
                    </div>
                    : <div className="lnb nodata">
                        <div className="nodata_txt">검색결과가 없습니다.</div>
                    </div>
                }
                {/*<!--//왼쪽 사업장 관리 메뉴 영역-->*/}
            </div>
            {/*<!--//area__left, 왼쪽 영역-->*/}
        </>
    )
};
export default AdminTree;


function ZoneTree(props) {
    //const company = props.company;
    //const zoneTree = (props.company.hasOwnProperty("zone"))?props.company.zone:[];
    const zoneTree = props.zone;
    const curTree = props.curTree;
    const setParentCurTree = props.setCurTree;
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentAdminType = props.setAdminType;
    const tabType = props.tabType;
    const setParentPopWin = props.setPopWin;


    //clog("IN ADMIN TREE : ZONE : " + props.setAdminType);

    //clog("IN ZONETREE : INIT : " + JSON.stringify(curTree));

    function onClickZone(e, zone) {
        e.stopPropagation();
        clog("onClickZone : " + e.target.tagName + " : " + e.target.getAttribute("data-val"));
        setParentCurTree("ZONE",
            {
                ...curTree,
                company: { "companyId": props.company.companyId, "companyName": props.company.companyName, },
                zone: { "zoneId": zone.zoneId, "zoneName": zone.zoneName },
            }
        )

        setParentWorkMode("READ");
    }
    // 상세사업장 추가 - subZone 항목이 없을 경우
    function onClickSubZoneInsert(e) {
        e.stopPropagation();
        clog("IN SUBZONETREE : onClickSubZoneInsert : " + e.target.tagName);

        setParentAdminType("SUBZONE")
        setParentWorkMode("CREATE");

        CUTIL.jsopen_s_Popup(e, isMobile);
    }


    function handleOnClickRequest(e, zone) {
        //clog("handleOnClickRequest : " + JSON.stringify(zone));
        setParentPopWin("pop-reason",
            <RequestPopup
                htmlHeader={<h1>사업장 요청 취소</h1>}
                zoneInfo={zone}
                setCurTree={props.setCurTree}
                setWorkMode={props.setWorkMode}
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    function handleOnClickReason(e, zone) {
        //clog("handleOnClickReason : " + JSON.stringify(zone));
        setParentPopWin("pop-reason",
            <ReasonPopup
                htmlHeader={<h1>사업장 추가 요청</h1>}
                zoneInfo={zone}
                setCurTree={props.setCurTree}
                setWorkMode={props.setWorkMode}
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    return (
        <>
            {(zoneTree) && zoneTree.map((zone, idx) => (
                (zone.approval === 2)
                    ? <li key={`zone_${idx.toString()}`}
                        className={`${((curTree) && ((curTree.zone.zoneId === zone.zoneId))) ? "active" : ""}`}
                        onClick={(e) => { onClickZone(e, zone) }}
                        data-val="ZONE"
                    >
                        {/*clog("IN TREE : ZONEINFO : " + JSON.stringify(zone))*/}
                        <p>
                            {/*<!-- js-open-s 클래스와 data-pop="pop-area-right"는 767 이하 화면에서 팝업으로 노출될때 호출하기 위한 것-->*/}
                            <a
                                className={`js-open-s ${(zone.isontree) ? "" : "tree-off"}`}
                                data-pop={(tabType === "TAB_ZONE") ? "pop-area-right-page-info" : ""}
                                onClick={(e) => (tabType === "TAB_ZONE") && CUTIL.jsopen_s_Popup(e, isMobile)}
                            >
                                <span>{props.company.companyName}</span>
                                <span>{zone.zoneName}</span>
                            </a>
                        </p>
                        {/*clog("IN TREE : ZONE TREE INFO : " + JSON.stringify(zone))*/}
                        <ul className="lnb-depth2">
                            {(!zone.hasOwnProperty("subZone")) &&   // 상세사업장 추가 - subZone 항목이 없을 경우
                                <li key={`no_szone`} className={""}>
                                    {(tabType === "TAB_ZONE") &&/*(adminType==="ZONE")&&*/
                                        <button type="button"
                                            className={`add__item js-open-s ${((adminType === "SUBZONE") && (workMode === "CREATE")) ? "active" : ""}`}
                                            data-pop="pop-area-right-page-info"
                                            onClick={(e) => onClickSubZoneInsert(e)}
                                        >
                                            <span>상세사업장 추가</span>
                                        </button>}
                                </li>
                            }
                            {(zone.hasOwnProperty("subZone")) &&
                                <SubZoneTree
                                    key={`zone_${idx.toString()}`}
                                    tabType={props.tabType}
                                    company={props.company}
                                    zone={zone}
                                    subZone={zone.subZone}
                                    curTree={props.curTree}
                                    setCurTree={props.setCurTree}
                                    isMobile={props.isMobile}
                                    adminType={props.adminType}
                                    workMode={props.workMode}
                                    setWorkMode={props.setWorkMode}
                                    setAdminType={props.setAdminType}
                                    setCurTabMenu={props.setCurTabMenu}
                                />}
                        </ul>
                    </li>
                    : (zone.approval === 1)
                        ? <li key={`zone_${idx.toString()}`} className="add__wait">
                            <span className="name">
                                <span>{props.company.companyName}</span>
                                <span>{zone.zoneName}</span>
                            </span>
                            <span className="add__step">
                                <span className="txt">추가 요청 중</span>
                                <button type="button" className="js-open"
                                    data-pop="pop-reason"
                                    onClick={(e) => handleOnClickRequest(e, zone)}
                                >
                                    <span data-pop="pop-reason">취소</span>
                                </button>
                            </span>
                        </li>
                        : <li key={`zone_${idx.toString()}`} className="add__wait">
                            <span className="name">
                                <span>{props.company.companyName}</span>
                                <span>{zone.zoneName}</span>
                            </span>
                            <span className="add__step fail">
                                <span className="txt">요청 반려</span>
                                <button type="button" className="js-open"
                                    data-pop="pop-reason"
                                    onClick={(e) => handleOnClickReason(e, zone)}
                                >
                                    <span data-pop="pop-reason">사유 확인</span>
                                </button>
                            </span>
                        </li>
            ))}

        </>

    )
}


function SubZoneTree(props) {
    const subZoneTree = props.subZone;
    const curTree = props.curTree;
    const setParentCurTree = props.setCurTree;
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentAdminType = props.setAdminType;
    const tabType = props.tabType;

    //
    function onClickSubZone(e, subZone) {
        e.stopPropagation();
        var actTag = (e.target.tagName === "A") ? e.currentTarget : e.target;
        clog("onClickSubZone : " + actTag.tagName + " : " + actTag.getAttribute("data-val"));
        setParentCurTree("SUBZONE",
            {
                ...curTree,
                subZone: { "subZoneId": subZone.subZoneId, "subZoneName": subZone.subZoneName },
            }
        )
        setParentWorkMode("READ");
    }
    // 상세사업장 추가
    function onClickSubZoneInsert(e) {
        e.stopPropagation();
        clog("IN SUBZONETREE : onClickSubZoneInsert : " + e.target.tagName);

        setParentAdminType("SUBZONE")
        setParentWorkMode("CREATE");

        CUTIL.jsopen_s_Popup(e, isMobile);
    }
    // Room 항목이 없을 경우
    function onClickRoomInsert(e) {
        e.stopPropagation();
        clog("IN ROOMTREE : onClickRoomInsert : " + e.target.tagName);
        setParentWorkMode("CREATE");
        setParentAdminType("ROOM")

        CUTIL.jsopen_s_Popup(e, isMobile);
    }

    return (
        <>
            {(subZoneTree) && subZoneTree.map((subZone, idx) => (
                <li
                    key={`szone_${idx.toString()}`}
                    className={`${((curTree) && (curTree.subZone.subZoneId === subZone.subZoneId)) ? ((adminType === "SUBZONE") && (workMode !== "CREATE")) ? "active" : "" : ""}`}
                    onClick={(e) => { onClickSubZone(e, subZone) }}
                    data-val="SUBZONE"
                >
                    {(idx === 0) && (tabType === "TAB_ZONE") && <button type="button"
                        className={`add__item js-open-s ${((adminType === "SUBZONE") && (workMode === "CREATE")) ? "active" : ""}`}
                        data-pop="pop-area-right-page-info"
                        onClick={(e) => onClickSubZoneInsert(e)}
                    >
                        <span>상세사업장 추가</span>
                    </button>}
                    <a
                        className={`js-open-s ${(subZone.isontree) ? "" : "tree-off"}`}
                        data-pop={(tabType === "TAB_ZONE") ? "pop-area-right-page-info" : ""}
                        onClick={(e) => (tabType === "TAB_ZONE") && CUTIL.jsopen_s_Popup(e, isMobile)}
                    >{subZone.subZoneName}</a>
                    <ul className="lnb-depth3"
                        style={{ "display": `${((curTree) && (curTree.subZone.subZoneId === subZone.subZoneId)) ? "" : "none"}` }}
                    >
                        {/*<!-- depth3 현재 활성화 페이지 : li에 on 클래스 삽입 -->*/}
                        {(!subZone.hasOwnProperty("room") && (tabType === "TAB_ZONE")) &&/*(adminType === "SUBZONE") &&*/ // ROOM이 없을 경우
                            <li key={`noroom_`} className={""} >
                                <button type="button"
                                    className={`add__item js-open-s ${((adminType === "ROOM") && (workMode === "CREATE")) ? "active" : ""}`}
                                    onClick={(e) => onClickRoomInsert(e)}
                                    data-pop="pop-area-right-page-info"
                                >
                                    <span>전기실 추가</span>
                                </button>
                            </li>
                        }
                        {(subZone.hasOwnProperty("room")) &&
                            <RoomTree
                                key={`szone_${idx.toString()}`}
                                tabType={props.tabType}
                                company={props.company}
                                zone={props.zone}
                                subZone={props.subZone}
                                room={subZone.room}
                                curTree={props.curTree}
                                setCurTree={props.setCurTree}
                                isMobile={props.isMobile}
                                adminType={props.adminType}
                                workMode={props.workMode}
                                setWorkMode={props.setWorkMode}
                                setAdminType={props.setAdminType}
                                setCurTabMenu={props.setCurTabMenu}
                            />}
                    </ul>
                </li>
            ))}
        </>
    )
}

function RoomTree(props) {
    const roomTree = props.room;
    const curTree = props.curTree
    const setParentCurTree = props.setCurTree;
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentAdminType = props.setAdminType;
    const tabType = props.tabType;
    const setParentCurTabMenu = props.setCurTabMenu;


    function onClickRoom(e, room, tabType) {
        e.stopPropagation();
        var actTag = (e.target.tagName === "A") ? e.currentTarget : e.target;
        setParentCurTree("ROOM",
            {
                ...curTree,
                room: { "roomId": room.roomId, "roomName": room.roomName },
                spg: { "spgId": "", "spgName": "" },
            }
        )

        if (tabType === "TAB_DEVICE") {
            setParentWorkMode("LIST");
        } else {
            setParentWorkMode("READ");
        }
    }
    // 사이트(ROOM) 추가
    function onClickRoomInsert(e) {
        e.stopPropagation();
        clog("IN ROOMTREE : onClickRoomInsert : " + e.target.tagName);
        setParentWorkMode("CREATE");
        setParentAdminType("ROOM")

        CUTIL.jsopen_s_Popup(e, isMobile);
    }

    // 기기등록 tab 및 목록으로 이동
    function onClickDeviceInsert(e) {
        e.stopPropagation();
        //mainlayout tab 데이터 확인 필요
        setParentCurTabMenu({ tabId: 1, tabName: "기기 등록 관리", tabType: "TAB_DEVICE" });
        setParentWorkMode("LIST");
        setParentAdminType("ROOM")
        CUTIL.jsopen_s_Popup(e, isMobile);
    }


    return (
        <>
            {(roomTree) && roomTree.map((room, idx) => (
                <li
                    key={`room_${idx.toString()}`}
                    className={`${((curTree) && (curTree.room.roomId === room.roomId)) ? ((adminType === "ROOM") && (workMode !== "CREATE")) ? "active" : "" : ""}`}
                    onClick={(e) => { onClickRoom(e, room, tabType) }}
                    data-val="ROOM"
                >
                    {(idx === 0) && (tabType === "TAB_ZONE") &&
                        <button type="button"
                            className={`add__item js-open-s ${((adminType === "ROOM") && (workMode === "CREATE")) ? "active" : ""}`}
                            onClick={(e) => onClickRoomInsert(e)}
                            data-pop="pop-area-right-page-info"
                        >
                            <span>전기실 추가</span>
                        </button>
                    }
                    <a
                        className={`js-open-s ${(room.isontree) ? "" : "tree-off"}`}
                        data-pop={(tabType === "TAB_DEVICE") ? "pop-list" : "pop-area-right-page-info"}
                        onClick={(e) => CUTIL.jsopen_s_Popup(e, isMobile)}
                    ><span>{room.roomName}</span>
                    </a>
                    {(tabType === "TAB_ZONE") &&
                        <ul className="lnb-depth4" style={{ "display": `${((curTree) && (curTree.room.roomId === room.roomId)) ? "block" : "none"}` }}>
                            {/*<!-- depth4 현재 활성화 페이지 : li에 on 클래스 삽입 -->*/}
                            <li className="">
                                <a
                                    data-pop="pop-list"
                                    onClick={(e) => onClickDeviceInsert(e)}>기기 등록</a>
                            </li>
                        </ul>
                    }
                </li>
            ))}
        </>
    )

}



function RequestPopup(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const zoneInfo = props.zoneInfo;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    //
    const [errorList, setErrorList] = useState([]);

    async function onClickRequestCancel(e, zone) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": "/api/v2/product/usertree",
            appQuery: {
                "productId": zone.zoneId,
            },
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                //clog("IN TREE : ZONE-DELETE: ret : " + JSON.stringify(data.body));
                setParentCurTree("ZONE", // 하위 삭제시 상위 호출
                    {
                        company: { "companyId": "", "companyName": "" },
                        zone: { "zoneId": "", "zoneName": "" },
                        subZone: { "subZoneId": "", "subZoneName": "" },
                        room: { "roomId": "", "roomName": "" },

                        reload: true
                    },
                );
                setParentWorkMode("READ");
            } else { // api if
                // need error handle
                alert(JSON.stringify(data.body.errorList[0].msg));
                setErrorList(data.body.errorList);
            }
            CUTIL.jsclose_Popup("pop-reason");
        }
        //return data;
    }

    function onClickCancel(e) {
        CUTIL.jsclose_Popup("pop-reason");
    }

    return (
        <>
            <div className="popup__body">
                <p>
                    <span className="font-16">사업장 추가 요청을 취소하시겠습니까?</span><br />
                    <span className="fontRegular"></span>
                </p>
                <dl>
                    <dt></dt>
                    <dd></dd>
                </dl>
            </div>
            <div className="popup__footer">
                <button type="button"
                    className="bg-gray btn-close"
                    onClick={(e) => onClickCancel(e)}
                >
                    <span>취소</span>
                </button>
                <button type="button" className="btn-close"
                    onClick={(e) => onClickRequestCancel(e, zoneInfo)}
                >
                    <span>확인</span>
                </button>
            </div>
        </>
    )
}

function ReasonPopup(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const zoneInfo = props.zoneInfo;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    //
    const [errorList, setErrorList] = useState([]);

    async function onClickRequestCancel(e, zone) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": "/api/v2/product/usertree",
            appQuery: {
                "productId": zone.zoneId,
            },
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                //clog("IN TREE : ZONE-DELETE: ret : " + JSON.stringify(data.body));

                setParentCurTree("ZONE", // 하위 삭제시 상위 호출
                    {
                        company: { "companyId": "", "companyName": "" },
                        zone: { "zoneId": "", "zoneName": "" },
                        subZone: { "subZoneId": "", "subZoneName": "" },
                        room: { "roomId": "", "roomName": "" },

                        reload: true
                    },
                );
                setParentWorkMode("READ");
            } else { // api if
                // need error handle
                alert(JSON.stringify(data.body.errorList));
                CUTIL.jsclose_Popup("pop-reason");
                setErrorList(data.body.errorList);
            }
        }
        //return data;
    }

    return (
        <>
            <div className="popup__body">
                <p>
                    <span className="font-16">사업장 추가 요청이 반려되었습니다.</span><br />
                    <span className="fontRegular"></span>
                </p>
                <dl>
                    <dt>반려 사유</dt>
                    <dd>{zoneInfo.deniedReason}</dd>
                </dl>
            </div>
            <div className="popup__footer">
                <button type="button" className="bg-gray btn-close"
                    onClick={(e) => onClickRequestCancel(e, zoneInfo)}
                >
                    <span>삭제</span>
                </button>
                <button type="button" className="btn-close">
                    <span>확인</span>
                </button>
            </div>
        </>
    )
}
