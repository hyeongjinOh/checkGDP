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

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"


function EhealthCheckTree(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
    // props
    const isTreeOpen = props.isTreeOpen;
    const setParentIsTreeOpen = props.setIsTreeOpen;
    const isMobile = props.isMobile;
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    const setParentWorkMode = props.setWorkMode;
    const workMode = props.workMode;
    const tabType = props.tabType;
    const setParentPopWin = props.setPopWin;
    //
    //화면 이동
    const navigate = useNavigate();
    //
    const [companyTree, setCompanyTree] = useState([]);
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/dashboard/usertree`,
        //appPath: `/api/v2/product/company/zone/subzone`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: adminType + workMode + selTree.reload
    });

    useEffect(() => {
        setRecoilIsLoadinBox(true);
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
        if (ERR_URL.length > 0) navigate(ERR_URL);
        if (retData) {
            clog("IN WORKORDER : EHCTREE : RES : "/* + JSON.stringify(retData.body)*/);
            if (retData.codeNum == CONST.API_200) {
                setCompanyTree(retData.body);
                setParentSelTree(adminType, { ...selTree, reload: false });
            }
        }
        setRecoilIsLoadinBox(false);
    }, [retData])


    return (
        <>
            {/*<!--area__left, 왼쪽 영역 / 2뎁스까지만 있는 경우 클래스 only-depth2 추가(workorder)-->*/}
            <div className={`area__left only-depth2 ${(isTreeOpen) ? "" : "close"}`}>
                <div className="box__etc">
                    <button type="button" className="btn btn-left" onClick={(e) => setParentIsTreeOpen(!isTreeOpen)}>
                        <span className="hide">트리메뉴접기펼치기</span>
                    </button>
                </div>
                {/*<!--왼쪽 메뉴 영역, 기존과 액션은 동일하고 클래스만 추가됨-->*/}
                <div className="lnb">
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a href="#">
                                    <span>데이타솔루션</span>
                                    <span>학동1</span>
                                </a>
                            </p>
                            <ul className="lnb-depth2">
                                <li className={"active"}>
                                    <a href="#">1공장</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                {/*<!--//왼쪽 메뉴 영역-->*/}
            </div>
        </>
    )
};
export default EhealthCheckTree;


function ZoneTree(props) {
    //props
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const company = props.company;

    function onClickZone(e, company, zone) {
        e.stopPropagation();
        setParentSelTree("EHC",
            {
                "company": { "companyId": company.companyId, "companyName": company.companyName, },
                "zone": { "zoneId": zone.zoneId, "zoneName": zone.zoneName, },
                "subZone": { "subZoneId": "", "subZoneName": "", },
                reload: false,
            }
        )
    }

    return (
        <>
            <li className={"active"}>
                <p>
                    <a href="#">
                        <span>데이타솔루션</span>
                        <span>학동1</span>
                    </a>
                </p>
                <ul className="lnb-depth2">
                    <li className={"active"}>
                        <a href="#">1공장</a>
                    </li>
                </ul>
            </li>
        </>
    )
}

function SubZoneTree(props) {
    //props
    const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const zone = props.zone;

    function onClickSubZone(e, subZone) {
        e.stopPropagation();
        setParentSelTree("EHC",
            {
                ...selTree,
                "subZone": { "subZoneId": subZone.subZoneId, "subZoneName": subZone.subZoneName },
            }
        )
    }

    return (
        <>
            {(zone.subZone) &&
                <ul className="lnb-depth2">
                    {zone.subZone.map((subZone, idx) => (
                        <li key={`sz_${idx.toString()}`}
                            className={selTree.hasOwnProperty("subZone") ? (subZone.subZoneId === selTree.subZone.subZoneId) ? "active" : "" : ""}
                            onClick={(e) => onClickSubZone(e, subZone)}
                        >
                            <a href="#">{subZone.subZoneName}</a>
                        </li>
                    ))}
                </ul>}
        </>
    )
}