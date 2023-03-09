/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 수명인자 개발
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
import { useTrans } from "../../../utils/langs/useTrans";

 /**
 * @brief EHP 설비수명  - 수명인자 Tree 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function DeviceLifeTree(props) {
     //trans
     const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    // props
    const isMobile = props.isMobile;
    const selTree = props.selTree;
    const setParentCurTree = props.setSelTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    //화면 이동
    const navigate = useNavigate();
    //
    const [userTree, setUserTree] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [treeSearchText, setTreeSearchText] = useState("");

    //
    //clog("IN ADMIN TREE : ADMINTREE : " + adminType + " : " + tabType);
    //
    const { data: resInfo, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/usertree?search=${treeSearchText}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: adminType + selTree.reload + treeSearchText
    });

    useEffect(() => {
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, resInfo);
        //clog("IN TREE : RESLT CHECK : " + ERR_URL + " : " + isLoading + " : " + JSON.stringify(resInfo));

        if (ERR_URL.length > 0) navigate(ERR_URL);

        if (resInfo/* !isLoading */) {
            if (resInfo.codeNum == CONST.API_200) {
                setUserTree(resInfo.body);
                setParentCurTree(adminType, { ...selTree, reload: false });
            }
        }
    }, [resInfo, adminType])

    function onClickSearch(e) {
        setTreeSearchText(searchText);
    }

    return (
        <>
            <div className="area__left">
                <div className="lnb__top">
                    <div className="box__search">
                        <input type="text" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.회사명")])}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button type="button" className="btn btn-search" onClick={(e) => onClickSearch(e)}><span className="hide">조회</span></button>
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
                                    company={company}
                                    zone={company.zone}
                                    selTree={props.selTree}
                                    setSelTree={props.setSelTree}
                                    adminType={props.adminType}
                                    setAdminType={props.setAdminType}
                                />
                            ))}
                        </ul>
                    </div>
                    : <div className="lnb nodata">
                        <div className="nodata_txt">검색결과가 없습니다.</div>
                    </div>
                }
                {/*<!--//왼쪽 사업장 관리 메뉴 영역-->*/}
            </div>

        </>
    )
};
export default DeviceLifeTree;


function ZoneTree(props) {
    //const company = props.company;
    //const zoneTree = (props.company.hasOwnProperty("zone"))?props.company.zone:[];
    const zoneTree = props.zone;
    const selTree = props.selTree;
    const setParentCurTree = props.setSelTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;

    function onClickZone(e, zone) {
        e.stopPropagation();
        setParentCurTree("LIFE", {
            ...selTree,
            company: { "companyId": props.company.companyId, "companyName": props.company.companyName, },
            zone: { "zoneId": zone.zoneId, "zoneName": zone.zoneName },
            reload: false
        });

    }
    return (
        <>
            {(zoneTree) && zoneTree.map((zone, idx) => (
                <li key={"zone_" + idx.toString()}
                    className={`${((selTree) && ((selTree.zone.zoneId === zone.zoneId))) ? "active" : ""}`}
                    onClick={(e) => { onClickZone(e, zone) }}
                    data-val="LIFE">
                    <p>
                        <a href="#" >
                            <span>{props.company.companyName}</span>
                            <span>{zone.zoneName}</span>
                        </a>
                    </p>
                    <ul className="lnb-depth2">
                        {
                            <SubZoneTree
                                key={`zone_${idx.toString()}`}
                                tabType={props.tabType}
                                company={props.company}
                                zone={zone}
                                subZone={zone.subZone}
                                selTree={props.selTree}
                                setSelTree={props.setSelTree}
                                adminType={props.adminType}
                                setAdminType={props.setAdminType}
                            />}
                    </ul>
                </li>
            ))}
        </>

    )
}


function SubZoneTree(props) {
    const subZoneTree = props.subZone;
    const selTree = props.selTree;
    const setParentCurTree = props.setSelTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;

    //
    function onClickSubZone(e, subZone) {
        e.stopPropagation();
        var actTag = (e.target.tagName === "A") ? e.currentTarget : e.target;
        setParentCurTree("LIFE",
            {
                ...selTree,
                subZone: { "subZoneId": subZone.subZoneId, "subZoneName": subZone.subZoneName },
                reload: false
            }
        )
    }

    return (
        <>
            {(subZoneTree) && subZoneTree.map((subZone, idx) => (
                <li key={"subzone_" + idx.toString()}
                    className={`${((selTree) && (selTree.subZone.subZoneId === subZone.subZoneId)) ? "active" : ""}`}
                    onClick={(e) => { onClickSubZone(e, subZone) }}
                    data-val="LIFE"
                >
                    <a href="#">{subZone.subZoneName}</a>
                    <ul className="lnb-depth3" style={{ "display": `${((selTree) && (selTree.subZone.subZoneId === subZone.subZoneId)) ? "block" : "none"}` }}>

                        {
                            <RoomTree
                                key={`szone_${idx.toString()}`}
                                tabType={props.tabType}
                                company={props.company}
                                zone={props.zone}
                                subZone={props.subZone}
                                room={subZone.room}
                                selTree={props.selTree}
                                setSelTree={props.setSelTree}
                                isMobile={props.isMobile}
                                adminType={props.adminType}
                                workMode={props.workMode}
                                setWorkMode={props.setWorkMode}
                                setAdminType={props.setAdminType}
                                setCurTabMenu={props.setCurTabMenu}
                            />}

                    </ul>
                </li>
            ))
            }
        </>
    )
}

function RoomTree(props) {
    const roomTree = props.room;
    const selTree = props.selTree
    const setParentCurTree = props.setSelTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;


    function onClickRoom(e, room) {
        e.stopPropagation();
        var actTag = (e.target.tagName === "A") ? e.currentTarget : e.target;
        setParentCurTree("LIFE",
            {
                ...selTree,
                room: { "roomId": room.roomId, "roomName": room.roomName },
                reload: true
            }
        )
    }

    return (
        <>
            {(roomTree) && roomTree.map((room, idx) => (
                <li key={"room_" + idx.toString()}
                    className={`${((selTree) && (selTree.room.roomId === room.roomId)) ? "active" : ""}`}
                    onClick={(e) => { onClickRoom(e, room) }}
                    data-val="LIFE"
                >
                    <a href="#"><span>{room.roomName}</span></a>
                </li>
            ))
            }
        </>
    )

}



