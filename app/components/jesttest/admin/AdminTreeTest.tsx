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

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"


function AdminTree(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    // props
    const isMobile = props.isMobile;
    const curTree = props.curTree;
    const setParentCurTree = props.setCurTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const setParentWorkMode = props.setWorkMode;
    const workMode = props.workMode;
    const tabType = props.tabType;
    //
    clog("IN ADMIN TREE : ADMINTREE : " + adminType + " : " + tabType);
    //
    const [userTree, setUserTree] = useState([]);
    const { data: resInfo, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/usertree`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: adminType + workMode
    });

    useEffect(() => {
        if (resInfo/* !isLoading */) {
            //clog("IN ADMINTREE : RES : " + JSON.stringify(resInfo.body));
            if (resInfo.codeNum == CONST.API_200) {
                setUserTree(resInfo.body);
            }
        }
    }, [resInfo, adminType, workMode])
    //}, [resInfo])

    // 사업장 추가
    /* function onClickZoneList(e) {
        //setParentAdminType("ZONE")
        setParentWorkMode("LIST");
        //setIsCompanyAdd(!isCompanyAdd)

        CUTIL.jsopen_s_Popup(e, isMobile);
    } */

    return (
        <>
            {/*<!--area__left, 왼쪽 영역-->*/}
            <div className="area__left">
                <div className="lnb__top">
                    {/*<!--사업장추가 add__item 활성화 됐을 때, 클래스 active 추가 -->*/}
                    <button type="button"
                        //className="add__item active js-open-s"
                        className={`add__item js-open-s ${((adminType === "ZONE") && ((workMode === "LIST") || (workMode === "CREATE"))) ? "active" : ""}`}
                        data-pop="pop-area-right"
                        //onClick={(e) => onClickZoneList(e)}
                        data-testid="addCompany"
                    >
                        <span>사업장 추가</span>
                    </button>
                    <button type="button" className="btn btn-setting"><span className="hide">사업장순서변경</span></button>
                </div>

                {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
                {(userTree) && <div className="lnb">
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
                            />
                        ))}
                        {/*<!--등록 요청중 메뉴-->*/}
                        {/**
            * approval  : 승인상태 (0:거절, 1:요청, 2:수락) 
            */}
                    </ul> {/**depth1 */}
                </div>} {/**lnb */}
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

    //clog("IN ADMIN TREE : ZONE : " + props.setAdminType);

    //clog("IN ZONETREE : INIT : " + JSON.stringify(curTree));

    function onClickZone(e, zone) {
        e.stopPropagation();
        clog("onClickZone : " + e.target.tagName + " : " + e.target.getAttribute("data-val"));
        /*
        setParentCurTree("ZONE",
          {
            company : { "companyId":props.company.companyId, "companyName":props.company.companyName, },
            zone : { "zoneId":zone.zoneId, "zoneName":zone.zoneName},
            subZone : {"subZoneId":"", "subZoneName":""},
            room : {"roomId":"", "roomName":""},
            spg : {"spgId":"", "spgName":""},
          }
        )
        */

        setParentCurTree("ZONE",
            {
                ...curTree,
                company: { "companyId": props.company.companyId, "companyName": props.company.companyName, },
                zone: { "zoneId": zone.zoneId, "zoneName": zone.zoneName },
            }
        )

        setParentWorkMode("READ");
    }

    return (
        <>
            {(zoneTree) && zoneTree.map((zone, idx) => (
                (zone.approval === 1)
                    ? <li key={`zone_${idx.toString()}`}
                        className={`${((curTree) && ((curTree.zone.zoneId === zone.zoneId))) ? "active" : ""}`}
                        onClick={(e) => { onClickZone(e, zone) }}
                        data-val="ZONE"
                    >
                        {/*clog("IN TREE : ZONEINFO : " + JSON.stringify(zone))*/}
                        <p>
                            {/*<!-- js-open-s 클래스와 data-pop="pop-area-right"는 767 이하 화면에서 팝업으로 노출될때 호출하기 위한 것-->*/}
                            <a
                                className="js-open-s"
                                data-pop={(tabType === "TAB_ZONE") ? "pop-area-right-page-info" : ""}
                                onClick={(e) => (tabType === "TAB_ZONE") && CUTIL.jsopen_s_Popup(e, isMobile)}
                            >
                                <span>{props.company.companyName}</span>
                                <span>{zone.zoneName}--ap{`(${zone.approval})`}</span>
                            </a>
                        </p>
                        <ul className="lnb-depth2">
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
                        ? <li key={`zone_${idx.toString()}`}
                            className="add__wait">
                            <span className="name">
                                <span>{props.company.companyName}</span>
                                <span>{zone.zoneName}</span>
                            </span>
                            <span className="add__step">
                                <span className="txt">등록 요청 중</span>
                                <button type="button"><span>취소</span></button>
                            </span>
                        </li>
                        : <li key={`zone_${idx.toString()}`}
                            className="add__wait">
                            <span className="name">
                                <span>{props.company.companyName}</span>
                                <span>{zone.zoneName}</span>
                            </span>
                            <span className="add__step">
                                <span className="txt">거절</span>
                                <button type="button"><span>취소</span></button>
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
    //clog("IN ADMIN TREE : SUBZONE : " + props.setAdminType);

    //
    function onClickSubZone(e, subZone) {
        e.stopPropagation();
        var actTag = (e.target.tagName === "A") ? e.currentTarget : e.target;
        clog("onClickSubZone : " + actTag.tagName + " : " + actTag.getAttribute("data-val"));
        /*
        setParentCurTree("SUBZONE",
          { 
            company : { "companyId":props.company.companyId, "companyName":props.company.companyName, },
            zone : { "zoneId":props.zone.zoneId, "zoneName":props.zone.zoneName},
            subZone : {"subZoneId":subZone.subZoneId, "subZoneName":subZone.subZoneName},
            room : {"roomId":"", "roomName":""},
            spg : {"spgId":"", "spgName":""},
          }
        )
        */

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

    return (
        <>
            <li
                className={`${((curTree) && (curTree.subZone.subZoneId === 0)) ? ((adminType === "SUBZONE") && (workMode !== "CREATE")) ? "active" : "" : ""}`}

                data-val="SUBZONE"
            >
                {<button type="button"
                    className={`add__item js-open-s ${((adminType === "SUBZONE") && (workMode === "CREATE")) ? "active" : ""}`}
                    data-pop="pop-area-right-page-info"
                    onClick={(e) => onClickSubZoneInsert(e)}
                    data-testid="addSubzone"
                >
                    <span>상세사업장 추가</span>
                </button>}
                <a
                    className="js-open-s"
                    data-pop={(tabType === "TAB_ZONE") ? "pop-area-right-page-info" : ""}
                    onClick={(e) => (tabType === "TAB_ZONE") && CUTIL.jsopen_s_Popup(e, isMobile)}
                ></a>
                <ul className="lnb-depth3"
                    style={{ "display": `${((curTree) && (curTree.subZone.subZoneId)) ? "" : "none"}` }}
                >
                    {/*<!-- depth3 현재 활성화 페이지 : li에 on 클래스 삽입 -->*/}
                    {
                        <RoomTree

                            tabType={props.tabType}
                            company={props.company}
                            zone={props.zone}
                            subZone={props.subZone}

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
        clog("onClickRoom : " + actTag.tagName + " : " + tabType);

        /*
        setParentCurTree("ROOM",
          {
            company : { "companyId":props.company.companyId, "companyName":props.company.companyName, },
            zone : { "zoneId":props.zone.zoneId, "zoneName":props.zone.zoneName},
            subZone : {"subZoneId":props.subZone.subZoneId, "subZoneName":props.subZone.subZoneName},
            room : {"roomId":room.roomId, "roomName":room.roomName},
            spg : {"spgId":"", "spgName":""},
          }
        )
        */
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
                        className="js-open-s"
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